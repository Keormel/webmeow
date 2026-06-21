import { api, guestHeaders } from "@/lib/api-client";
import {
  PostArrivalResponseSchema,
  ArrivalStatusSchema,
  QueueResponseSchema,
  type PostArrivalRequest,
  type PostArrivalResponse,
  type ArrivalStatus,
  type QueueResponse,
} from "@/features/airport/types";

export function postArrival(
  body: PostArrivalRequest
): Promise<PostArrivalResponse> {
  return api.airport.post(
    PostArrivalResponseSchema,
    "/arrivals",
    body,
    guestHeaders(body.guest_id)
  );
}

export function getArrivalStatus(guestId: string): Promise<ArrivalStatus> {
  return api.airport.get(
    ArrivalStatusSchema,
    `/arrivals/${guestId}`,
    guestHeaders(guestId)
  );
}

export function getQueue(): Promise<QueueResponse> {
  return api.airport.get(QueueResponseSchema, "/queue");
}
