import { HttpException, HttpStatus } from '@nestjs/common';
import {
  ReservationStatus,
  RoomType,
} from '../../generated/prisma/client.js';
import { ReservationService } from './reservation.service';

describe('ReservationService', () => {
  const standardRoom = {
    id: 'room-standard-01',
    type: RoomType.STANDARD,
    capacity: 2,
    price_per_night: 100,
  };

  let prisma: {
    room: { findMany: jest.Mock };
    reservation: {
      count: jest.Mock;
      create: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
  let broadcast: { publishHotelEvent: jest.Mock };
  let airport: { hasGuestClearedProcessing: jest.Mock };
  let service: ReservationService;

  beforeEach(() => {
    prisma = {
      room: { findMany: jest.fn().mockResolvedValue([standardRoom]) },
      reservation: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockImplementation(
          ({
            data,
          }: {
            data: {
              guests: { create: { guest_id: string }[] };
              [key: string]: unknown;
            };
          }) => {
            const { guests, ...reservationData } = data;

            return Promise.resolve({
              id: 'reservation-1',
              ...reservationData,
              room: standardRoom,
              guests: guests.create,
            });
          },
        ),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    broadcast = { publishHotelEvent: jest.fn().mockResolvedValue(undefined) };
    airport = { hasGuestClearedProcessing: jest.fn().mockResolvedValue(true) };
    service = new ReservationService(
      prisma as never,
      broadcast as never,
      airport as never,
    );
  });

  it('persists party guests and keeps guest_count on reservation creation', async () => {
    const reservation = await service.create({
      guest_id: 'guest-a',
      party_guest_ids: ['guest-a', 'guest-b'],
      room_type: RoomType.STANDARD,
      guest_count: 3,
      check_in_day: 1,
      check_out_day: 2,
    });

    expect(prisma.reservation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          guest_id: 'guest-a',
          guest_count: 3,
          guests: {
            create: [{ guest_id: 'guest-a' }, { guest_id: 'guest-b' }],
          },
        }),
      }),
    );
    expect(airport.hasGuestClearedProcessing).toHaveBeenCalledTimes(2);
    expect(reservation).toMatchObject({
      guest_id: 'guest-a',
      party_guest_ids: ['guest-a', 'guest-b'],
      guest_count: 3,
    });
  });

  it('validates capacity against an explicit party instead of guest_count', async () => {
    let error: unknown;

    try {
      await service.create({
        guest_id: 'guest-a',
        party_guest_ids: ['guest-a', 'guest-b', 'guest-c'],
        room_type: RoomType.STANDARD,
        guest_count: 1,
        check_in_day: 1,
        check_out_day: 2,
      });
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(HttpException);
    expect((error as HttpException).getStatus()).toBe(HttpStatus.CONFLICT);
    expect(prisma.reservation.create).not.toHaveBeenCalled();
  });

  it('finds an active reservation by any party guest', async () => {
    prisma.reservation.findFirst.mockResolvedValue({
      id: 'reservation-1',
      guest_id: 'guest-a',
      room_id: standardRoom.id,
      room: standardRoom,
      guest_count: 2,
      check_in_day: 1,
      check_out_day: 2,
      status: ReservationStatus.CONFIRMED,
      guests: [{ guest_id: 'guest-a' }, { guest_id: 'guest-b' }],
    });

    await expect(service.findActiveByGuestId('guest-b')).resolves.toMatchObject({
      id: 'reservation-1',
      party_guest_ids: ['guest-a', 'guest-b'],
    });
    expect(prisma.reservation.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { guest_id: 'guest-b' },
            { guests: { some: { guest_id: 'guest-b' } } },
          ],
        }),
      }),
    );
  });
});
