import { api, guestHeaders } from "@/lib/api-client";
import {
  ActivitiesResponseSchema,
  ActivitySchema,
  ActivityByGuestResponseSchema,
  BookActivityResponseSchema,
  CancelActivityResponseSchema,
  VisitorStatusResponseSchema,
  type ActivitiesResponse,
  type Activity,
  type ActivityByGuestResponse,
  type BookActivityResponse,
  type CancelActivityResponse,
  type VisitorStatusResponse,
} from "@/features/beach/types";

export function getActivities(): Promise<ActivitiesResponse> {
  return api.beach.get(ActivitiesResponseSchema, "/activities");
}

export function getActivity(activityId: string): Promise<Activity> {
  return api.beach.get(ActivitySchema, `/activity/${activityId}`);
}

export function bookActivity(
  activityId: string,
  guestId: string
): Promise<BookActivityResponse> {
  return api.beach.post(
    BookActivityResponseSchema,
    `/activity/book/${activityId}`,
    {
      id: guestId,
    },
    guestHeaders(guestId)
  );
}

export function cancelActivity(
  activityId: string,
  guestId: string
): Promise<CancelActivityResponse> {
  return api.beach.post(
    CancelActivityResponseSchema,
    `/activity/cancel/${activityId}`,
    { id: guestId },
    guestHeaders(guestId)
  );
}

export function getActivityByGuest(
  guestId: string
): Promise<ActivityByGuestResponse> {
  return api.beach.get(
    ActivityByGuestResponseSchema,
    `/activity/by-guest/${guestId}`,
    guestHeaders(guestId)
  );
}

export function checkInVisitor(guestId: string): Promise<VisitorStatusResponse> {
  return api.beach.post(VisitorStatusResponseSchema, "/visitor/check-in", {
    id: guestId,
  });
}

export function checkOutVisitor(
  guestId: string
): Promise<VisitorStatusResponse> {
  return api.beach.post(VisitorStatusResponseSchema, "/visitor/check-out", {
    id: guestId,
  });
}
