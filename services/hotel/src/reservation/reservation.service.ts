import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ReservationStatus } from '../../generated/prisma/client.js';
import { AirportService } from '../airport/airport.service';
import { BroadcastService } from '../broadcast/broadcast.service';
import { HotelBroadcastEventType } from '../broadcast/hotel-events';
import { PrismaService } from '../prisma/prisma.service';
import { CancelReservationResponseDto } from './dto/cancel-reservation-response.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationResponseDto } from './dto/reservation-response.dto';

@Injectable()
export class ReservationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly broadcast: BroadcastService,
    private readonly airport: AirportService,
  ) {}

  async create(
    createReservationDto: CreateReservationDto,
  ): Promise<ReservationResponseDto> {
    if (
      createReservationDto.check_out_day <= createReservationDto.check_in_day
    ) {
      throw new HttpException(
        { error: 'check_out_day must be greater than check_in_day' },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.rejectIfGuestHasNotClearedAirport(createReservationDto.guest_id);

    const rooms = await this.prisma.room.findMany({
      where: { type: createReservationDto.room_type },
      orderBy: { id: 'asc' },
    });

    const maxCapacity = Math.max(...rooms.map((room) => room.capacity));
    if (createReservationDto.guest_count > maxCapacity) {
      throw new HttpException(
        {
          error: `Room type ${createReservationDto.room_type} supports at most ${maxCapacity} guests`,
        },
        HttpStatus.CONFLICT,
      );
    }

    let availableRoom: (typeof rooms)[number] | null = null;

    for (const room of rooms) {
      if (createReservationDto.guest_count > room.capacity) {
        continue;
      }

      const overlappingReservationCount = await this.prisma.reservation.count({
        where: {
          room_id: room.id,
          status: ReservationStatus.CONFIRMED,
          check_in_day: { lt: createReservationDto.check_out_day },
          check_out_day: { gt: createReservationDto.check_in_day },
        },
      });

      if (overlappingReservationCount === 0) {
        availableRoom = room;
        break;
      }
    }

    if (!availableRoom) {
      throw new HttpException(
        {
          error: `No available rooms of type ${createReservationDto.room_type} for days ${createReservationDto.check_in_day}-${createReservationDto.check_out_day}`,
        },
        HttpStatus.CONFLICT,
      );
    }

    const reservation = await this.prisma.reservation.create({
      data: {
        guest_id: createReservationDto.guest_id,
        room_id: availableRoom.id,
        guest_count: createReservationDto.guest_count,
        check_in_day: createReservationDto.check_in_day,
        check_out_day: createReservationDto.check_out_day,
        status: ReservationStatus.CONFIRMED,
      },
    });

    await this.broadcast.publishHotelEvent(
      HotelBroadcastEventType.ReservationConfirmed,
      {
        message: 'Hotel reservation confirmed.',
        reservation_id: reservation.id,
        guest_id: reservation.guest_id,
        room_type: availableRoom.type,
        guest_count: reservation.guest_count,
        check_in_day: reservation.check_in_day,
        check_out_day: reservation.check_out_day,
      },
    );

    return {
      id: reservation.id,
      guest_id: reservation.guest_id,
      room_id: reservation.room_id,
      room_type: availableRoom.type,
      guest_count: reservation.guest_count,
      check_in_day: reservation.check_in_day,
      check_out_day: reservation.check_out_day,
      status: reservation.status,
    };
  }

  private async rejectIfGuestHasNotClearedAirport(
    guestId: string,
  ): Promise<void> {
    const hasClearedAirport =
      await this.airport.hasGuestClearedProcessing(guestId);

    if (hasClearedAirport === false) {
      throw new HttpException(
        { error: 'Guest has not cleared airport processing' },
        HttpStatus.CONFLICT,
      );
    }
  }

  async findById(id: string): Promise<ReservationResponseDto> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!reservation) {
      throw new HttpException(
        { error: 'Reservation not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      id: reservation.id,
      guest_id: reservation.guest_id,
      room_id: reservation.room_id,
      room_type: reservation.room.type,
      guest_count: reservation.guest_count,
      check_in_day: reservation.check_in_day,
      check_out_day: reservation.check_out_day,
      status: reservation.status,
    };
  }

  async findActiveByGuestId(guestId: string): Promise<ReservationResponseDto> {
    const reservation = await this.prisma.reservation.findFirst({
      where: {
        guest_id: guestId,
        status: ReservationStatus.CONFIRMED,
      },
      orderBy: { check_in_day: 'desc' },
      include: { room: true },
    });

    if (!reservation) {
      throw new HttpException(
        { error: 'Reservation not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      id: reservation.id,
      guest_id: reservation.guest_id,
      room_id: reservation.room_id,
      room_type: reservation.room.type,
      guest_count: reservation.guest_count,
      check_in_day: reservation.check_in_day,
      check_out_day: reservation.check_out_day,
      status: reservation.status,
    };
  }

  async cancel(id: string): Promise<CancelReservationResponseDto> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!reservation) {
      throw new HttpException(
        { error: 'Reservation not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new HttpException(
        { error: 'Reservation already cancelled' },
        HttpStatus.CONFLICT,
      );
    }

    const cancelled = await this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELLED },
      include: { room: true },
    });

    await this.broadcast.publishHotelEvent(
      HotelBroadcastEventType.ReservationCancelled,
      {
        message: 'Hotel reservation cancelled.',
        reservation_id: cancelled.id,
        guest_id: cancelled.guest_id,
        room_type: cancelled.room.type,
        guest_count: cancelled.guest_count,
        check_in_day: cancelled.check_in_day,
        check_out_day: cancelled.check_out_day,
      },
    );

    return {
      id: cancelled.id,
      status: cancelled.status,
    };
  }
}
