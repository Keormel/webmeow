import { api, guestHeaders } from "@/lib/api-client";
import {
  checkInVisitor,
  checkOutVisitor,
} from "@/features/beach/api/beach-client";
import {
  ReservationSchema,
  ActiveReservationSchema,
  RoomsResponseSchema,
  CancelReservationResponseSchema,
  type PostReservationRequest,
  type Reservation,
  type ActiveReservation,
  type RoomsResponse,
  type CancelReservationResponse,
} from "@/features/hotel/types";

function reservationGuestIds(reservation: Reservation | ActiveReservation): string[] {
  return reservation.party_guest_ids?.length
    ? reservation.party_guest_ids
    : [reservation.guest_id];
}

export function getRooms(): Promise<RoomsResponse> {
  return api.hotel.get(RoomsResponseSchema, "/rooms");
}

export function postReservation(
  body: PostReservationRequest
): Promise<Reservation> {
  return api.hotel
    .post(ReservationSchema, "/reservation", body, guestHeaders(body.guest_id))
    .then(async (reservation) => {
      await Promise.all(
        reservationGuestIds(reservation).map((guestId) =>
          checkInVisitor(guestId).catch(() => {
            // Hotel booking succeeded; beach can resync from active reservation.
          })
        )
      );
      return reservation;
    });
}

export function getReservationByGuest(
  guestId: string
): Promise<ActiveReservation> {
  return api.hotel.get(
    ActiveReservationSchema,
    `/reservation/by-guest/${guestId}`,
    guestHeaders(guestId)
  );
}

export function cancelReservation(
  id: string,
  guestId: string
): Promise<CancelReservationResponse> {
  return api.hotel
    .delete(CancelReservationResponseSchema, `/reservation/${id}`, guestHeaders(guestId))
    .then(async (reservation) => {
      const activeReservation = await api.hotel
        .get(ActiveReservationSchema, `/reservation/${id}`, guestHeaders(guestId))
        .catch(() => null);

      if (activeReservation) {
        await Promise.all(
          reservationGuestIds(activeReservation).map((guestId) =>
            checkOutVisitor(guestId).catch(() => {
              // Hotel cancellation succeeded; beach can resync from active reservation.
            })
          )
        );
      }

      return reservation;
    });
}
