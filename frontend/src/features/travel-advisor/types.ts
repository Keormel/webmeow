import { z } from "zod";

// ── Onboarding form values ──────────────────────────────────────────

export const RestStyleSchema = z.enum(["calm", "active", "mixed"]);
export type RestStyle = z.infer<typeof RestStyleSchema>;

export const FavoritePlaceSchema = z.enum([
  "beach",
  "water",
  "nature",
  "social",
]);
export type FavoritePlace = z.infer<typeof FavoritePlaceSchema>;

export const VacationGoalSchema = z.enum([
  "relax",
  "adventure",
  "learn",
  "socialize",
  "family_fun",
]);
export type VacationGoal = z.infer<typeof VacationGoalSchema>;

export const TravelWithSchema = z.enum(["solo", "couple", "family", "group"]);
export type TravelWith = z.infer<typeof TravelWithSchema>;

// ── API request / response schemas ──────────────────────────────────

export const PreferencesRequestSchema = z.object({
  guest_id: z.string().min(1),
  rest_style: RestStyleSchema,
  favorite_places: z.array(FavoritePlaceSchema).min(1),
  vacation_goal: VacationGoalSchema,
  travel_with: TravelWithSchema,
});
export type PreferencesRequest = z.infer<typeof PreferencesRequestSchema>;

export const ActivityRecommendationSchema = z.object({
  activity_id: z.string(),
  activity_name: z.string(),
  description: z.string(),
  match_score: z.number().min(0).max(1),
  reason: z.string(),
  available_spots: z.number().int().nullable(),
  category: z.string(),
});
export type ActivityRecommendation = z.infer<
  typeof ActivityRecommendationSchema
>;

export const RecommendationsResponseSchema = z.object({
  guest_id: z.string(),
  recommendations: z.array(ActivityRecommendationSchema),
  profile_summary: z.string(),
});
export type RecommendationsResponse = z.infer<
  typeof RecommendationsResponseSchema
>;

export const ProfileResponseSchema = z.object({
  guest_id: z.string(),
  rest_style: z.string(),
  favorite_places: z.array(z.string()),
  vacation_goal: z.string(),
  travel_with: z.string(),
  profile_summary: z.string(),
});
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;

// ── Wizard step state ───────────────────────────────────────────────

export interface WizardState {
  restStyle: RestStyle | null;
  favoritePlaces: FavoritePlace[];
  vacationGoal: VacationGoal | null;
  travelWith: TravelWith | null;
}

export const INITIAL_WIZARD_STATE: WizardState = {
  restStyle: null,
  favoritePlaces: [],
  vacationGoal: null,
  travelWith: null,
};
