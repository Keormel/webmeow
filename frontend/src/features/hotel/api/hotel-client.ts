import { api } from "@/lib/api-client";
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

export function getRooms(): Promise<RoomsResponse> {
  return api.hotel.get(RoomsResponseSchema, "/rooms");
}

export function postReservation(
  body: PostReservationRequest
): Promise<Reservation> {
  return api.hotel
    .post(ReservationSchema, "/reservation", body)
    .then(async (reservation) => {
      await checkInVisitor(reservation.guest_id);
      return reservation;
    });
}

export function getReservationByGuest(
  guestId: string
): Promise<ActiveReservation> {
  return api.hotel.get(
    ActiveReservationSchema,
    `/reservation/by-guest/${guestId}`
  );
}

export function cancelReservation(
  id: string
): Promise<CancelReservationResponse> {
  return api.hotel
    .delete(CancelReservationResponseSchema, `/reservation/${id}`)
    .then(async (reservation) => {
      const activeReservation = await api.hotel
        .get(ActiveReservationSchema, `/reservation/${id}`)
        .catch(() => null);

      if (activeReservation) {
        await checkOutVisitor(activeReservation.guest_id);
      }

      return reservation;
    });
}
