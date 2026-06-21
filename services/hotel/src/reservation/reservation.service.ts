import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  ReservationStatus,
  RoomType,
} from '../../generated/prisma/client.js';
import { AirportService } from '../airport/airport.service';
import { BroadcastService } from '../broadcast/broadcast.service';
import { HotelBroadcastEventType } from '../broadcast/hotel-events';
import { PrismaService } from '../prisma/prisma.service';
import { CancelReservationResponseDto } from './dto/cancel-reservation-response.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationResponseDto } from './dto/reservation-response.dto';

type ReservationWithRoomAndGuests = {
  id: string;
  guest_id: string;
  room_id: string;
  guest_count: number;
  check_in_day: number;
  check_out_day: number;
  status: ReservationStatus;
  room: { type: RoomType };
  guests: { guest_id: string }[];
};

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

    const { capacityGuestCount, partyGuestIds } =
      this.resolvePartyGuests(createReservationDto);

    await this.rejectIfPartyHasNotClearedAirport(partyGuestIds);

    const rooms = await this.prisma.room.findMany({
      where: { type: createReservationDto.room_type },
      orderBy: { id: 'asc' },
    });

    const maxCapacity = Math.max(...rooms.map((room) => room.capacity));
    if (capacityGuestCount > maxCapacity) {
      throw new HttpException(
        {
          error: `Room type ${createReservationDto.room_type} supports at most ${maxCapacity} guests`,
        },
        HttpStatus.CONFLICT,
      );
    }

    let availableRoom: (typeof rooms)[number] | null = null;

    for (const room of rooms) {
      if (capacityGuestCount > room.capacity) {
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
        guests: {
          create: partyGuestIds.map((guestId) => ({
            guest_id: guestId,
          })),
        },
      },
      include: {
        room: true,
        guests: { orderBy: { guest_id: 'asc' } },
      },
    });

    await this.broadcast.publishHotelEvent(
      HotelBroadcastEventType.ReservationConfirmed,
      {
        message: 'Hotel reservation confirmed.',
        reservation_id: reservation.id,
        guest_id: reservation.guest_id,
        party_guest_ids: this.partyGuestIdsFromReservation(reservation),
        room_type: reservation.room.type,
        guest_count: reservation.guest_count,
        check_in_day: reservation.check_in_day,
        check_out_day: reservation.check_out_day,
      },
    );

    return this.toReservationResponse(reservation);
  }

  private resolvePartyGuests(createReservationDto: CreateReservationDto): {
    partyGuestIds: string[];
    capacityGuestCount: number;
  } {
    const explicitPartyGuestIds = createReservationDto.party_guest_ids;

    if (!explicitPartyGuestIds) {
      return {
        partyGuestIds: [createReservationDto.guest_id],
        capacityGuestCount: createReservationDto.guest_count,
      };
    }

    if (explicitPartyGuestIds.length === 0) {
      throw new HttpException(
        { error: 'party_guest_ids must include at least one guest' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (explicitPartyGuestIds.some((guestId) => guestId.length === 0)) {
      throw new HttpException(
        { error: 'party_guest_ids cannot include empty guest IDs' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (new Set(explicitPartyGuestIds).size !== explicitPartyGuestIds.length) {
      throw new HttpException(
        { error: 'party_guest_ids cannot include duplicate guest IDs' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!explicitPartyGuestIds.includes(createReservationDto.guest_id)) {
      throw new HttpException(
        { error: 'party_guest_ids must include guest_id' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      partyGuestIds: explicitPartyGuestIds,
      capacityGuestCount: explicitPartyGuestIds.length,
    };
  }

  private async rejectIfPartyHasNotClearedAirport(
    guestIds: string[],
  ): Promise<void> {
    const clearances = await Promise.all(
      guestIds.map(async (guestId) => ({
        guestId,
        hasClearedAirport:
          await this.airport.hasGuestClearedProcessing(guestId),
      })),
    );

    const blockedGuest = clearances.find(
      (clearance) => clearance.hasClearedAirport === false,
    );

    if (blockedGuest) {
      throw new HttpException(
        {
          error: `Guest ${blockedGuest.guestId} has not cleared airport processing`,
        },
        HttpStatus.CONFLICT,
      );
    }
  }

  private partyGuestIdsFromReservation(
    reservation: Pick<ReservationWithRoomAndGuests, 'guest_id' | 'guests'>,
  ): string[] {
    const partyGuestIds = reservation.guests.map((guest) => guest.guest_id);

    return partyGuestIds.length > 0 ? partyGuestIds : [reservation.guest_id];
  }

  private toReservationResponse(
    reservation: ReservationWithRoomAndGuests,
  ): ReservationResponseDto {
    return {
      id: reservation.id,
      guest_id: reservation.guest_id,
      party_guest_ids: this.partyGuestIdsFromReservation(reservation),
      room_id: reservation.room_id,
      room_type: reservation.room.type,
      guest_count: reservation.guest_count,
      check_in_day: reservation.check_in_day,
      check_out_day: reservation.check_out_day,
      status: reservation.status,
    };
  }

  async findById(id: string): Promise<ReservationResponseDto> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        room: true,
        guests: { orderBy: { guest_id: 'asc' } },
      },
    });

    if (!reservation) {
      throw new HttpException(
        { error: 'Reservation not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return this.toReservationResponse(reservation);
  }

  async findActiveByGuestId(
    guestId: string,
  ): Promise<ReservationResponseDto | null> {
    const reservation = await this.prisma.reservation.findFirst({
      where: {
        status: ReservationStatus.CONFIRMED,
        OR: [
          { guest_id: guestId },
          { guests: { some: { guest_id: guestId } } },
        ],
      },
      orderBy: { check_in_day: 'desc' },
      include: {
        room: true,
        guests: { orderBy: { guest_id: 'asc' } },
      },
    });

    if (!reservation) return null;

    return this.toReservationResponse(reservation);
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
      return {
        id: reservation.id,
        status: reservation.status,
      };
    }

    const cancelled = await this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELLED },
      include: {
        room: true,
        guests: { orderBy: { guest_id: 'asc' } },
      },
    });

    await this.broadcast.publishHotelEvent(
      HotelBroadcastEventType.ReservationCancelled,
      {
        message: 'Hotel reservation cancelled.',
        reservation_id: cancelled.id,
        guest_id: cancelled.guest_id,
        party_guest_ids: this.partyGuestIdsFromReservation(cancelled),
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
