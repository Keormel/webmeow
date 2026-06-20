import { api } from "@/lib/api-client";
import {
  ProfileResponseSchema,
  RecommendationsResponseSchema,
  type PreferencesRequest,
  type ProfileResponse,
  type RecommendationsResponse,
} from "@/features/travel-advisor/types";

export function submitPreferences(
  body: PreferencesRequest
): Promise<RecommendationsResponse> {
  return api.travelAdvisor.post(
    RecommendationsResponseSchema,
    "/preferences",
    body
  );
}

export function getRecommendations(
  guestId: string
): Promise<RecommendationsResponse> {
  return api.travelAdvisor.get(
    RecommendationsResponseSchema,
    `/recommendations/${guestId}`
  );
}

export function getProfile(guestId: string): Promise<ProfileResponse> {
  return api.travelAdvisor.get(ProfileResponseSchema, `/profile/${guestId}`);
}
