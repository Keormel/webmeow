import { Injectable } from '@nestjs/common';
import { ReservationStatus } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';
import { SimulationService } from '../simulation/simulation.service';
import { RoomsResponseDto } from './dto/rooms-response.dto';

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly simulation: SimulationService,
  ) {}

  async findAll(): Promise<RoomsResponseDto> {
    const currentDay = this.simulation.currentDay();

    const [rooms, occupiedRooms] = await Promise.all([
      this.prisma.room.findMany({
        orderBy: { id: 'asc' },
      }),
      this.prisma.reservation.findMany({
        where: {
          status: ReservationStatus.CONFIRMED,
          check_in_day: { lte: currentDay },
          check_out_day: { gt: currentDay },
        },
        select: {
          room_id: true,
          guest_count: true,
          guests: { select: { guest_id: true } },
        },
      }),
    ]);

    const currentGuestsByRoomId = occupiedRooms.reduce((counts, reservation) => {
      const knownPartySize = reservation.guests.length;
      const currentGuests =
        knownPartySize > 1 ? knownPartySize : reservation.guest_count;
      counts.set(
        reservation.room_id,
        (counts.get(reservation.room_id) ?? 0) + currentGuests,
      );
      return counts;
    }, new Map<string, number>());

    return {
      rooms: rooms.map((room) => {
        const occupancy = currentGuestsByRoomId.get(room.id) ?? 0;

        return {
          id: room.id,
          type: room.type,
          capacity: room.capacity,
          price_per_night: room.price_per_night,
          occupancy,
          current_guests: occupancy,
        };
      }),
    };
  }
}
