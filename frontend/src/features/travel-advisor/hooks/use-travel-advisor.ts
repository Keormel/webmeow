import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/stores/session-store";
import {
  getRecommendations,
  submitPreferences,
} from "@/features/travel-advisor/api/travel-advisor-client";
import { TRAVEL_ADVISOR_KEYS } from "@/features/travel-advisor/query-keys";
import type {
  FavoritePlace,
  RecommendationsResponse,
  RestStyle,
  TravelWith,
  VacationGoal,
  WizardState,
} from "@/features/travel-advisor/types";
import { INITIAL_WIZARD_STATE } from "@/features/travel-advisor/types";

export type AdvisorView = "wizard" | "results" | "loading";

export function useTravelAdvisor() {
  const guest = useSessionStore((state) => state.guest);
  const guestId = guest?.id ?? null;
  const queryClient = useQueryClient();

  const [wizard, setWizard] = useState<WizardState>(INITIAL_WIZARD_STATE);
  const [step, setStep] = useState(0);
  const [view, setView] = useState<AdvisorView>("wizard");

  // ── Cached recommendations query ──────────────────────────────────
  const recommendationsQuery = useQuery({
    queryKey: [...TRAVEL_ADVISOR_KEYS.RECOMMENDATIONS, guestId],
    queryFn: () => getRecommendations(guestId!),
    enabled: false,
  });

  // ── Submit mutation ───────────────────────────────────────────────
  const submitMutation = useMutation({
    mutationFn: submitPreferences,
    onSuccess: (data: RecommendationsResponse) => {
      queryClient.setQueryData(
        [...TRAVEL_ADVISOR_KEYS.RECOMMENDATIONS, guestId],
        data
      );
      setView("results");
    },
    onError: () => {
      setView("wizard");
    },
  });

  // ── Wizard navigation ─────────────────────────────────────────────
  const nextStep = useCallback(() => setStep((s) => Math.min(s + 1, 3)), []);
  const prevStep = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  const setRestStyle = useCallback(
    (v: RestStyle) => setWizard((w) => ({ ...w, restStyle: v })),
    []
  );

  const toggleFavoritePlace = useCallback((place: FavoritePlace) => {
    setWizard((w) => {
      const has = w.favoritePlaces.includes(place);
      return {
        ...w,
        favoritePlaces: has
          ? w.favoritePlaces.filter((p) => p !== place)
          : [...w.favoritePlaces, place],
      };
    });
  }, []);

  const setVacationGoal = useCallback(
    (v: VacationGoal) => setWizard((w) => ({ ...w, vacationGoal: v })),
    []
  );

  const setTravelWith = useCallback(
    (v: TravelWith) => setWizard((w) => ({ ...w, travelWith: v })),
    []
  );

  // ── Step validation ───────────────────────────────────────────────
  const isStepValid = useCallback(
    (s: number): boolean => {
      switch (s) {
        case 0:
          return wizard.restStyle !== null;
        case 1:
          return wizard.favoritePlaces.length > 0;
        case 2:
          return wizard.vacationGoal !== null;
        case 3:
          return wizard.travelWith !== null;
        default:
          return false;
      }
    },
    [wizard]
  );

  // ── Submit ────────────────────────────────────────────────────────
  const submit = useCallback(() => {
    if (
      !guestId ||
      !wizard.restStyle ||
      !wizard.vacationGoal ||
      !wizard.travelWith ||
      wizard.favoritePlaces.length === 0
    )
      return;

    setView("loading");
    submitMutation.mutate({
      guest_id: guestId,
      rest_style: wizard.restStyle,
      favorite_places: wizard.favoritePlaces,
      vacation_goal: wizard.vacationGoal,
      travel_with: wizard.travelWith,
    });
  }, [guestId, wizard, submitMutation]);

  // ── Retake ────────────────────────────────────────────────────────
  const retake = useCallback(() => {
    setWizard(INITIAL_WIZARD_STATE);
    setStep(0);
    setView("wizard");
  }, []);

  return {
    guest,
    guestId,
    wizard,
    step,
    view,
    isSubmitting: submitMutation.isPending,
    submitError: submitMutation.error?.message ?? null,
    recommendations: recommendationsQuery.data,
    nextStep,
    prevStep,
    setRestStyle,
    toggleFavoritePlace,
    setVacationGoal,
    setTravelWith,
    isStepValid,
    submit,
    retake,
  };
}
