import { useMemo } from "react";

import { useArrivalStatus } from "@/features/airport/hooks/use-airport";
import { useBookActivity } from "@/features/beach/hooks/use-book-activity";
import { useActiveReservation } from "@/features/hotel/hooks/use-active-reservation";
import { ZoneId } from "@/features/map/constants";
import { useParrotHistory } from "@/features/parrot/hooks/use-parrot-history";
import {
  QUEST_STEPS,
  type QuestStepDefinition,
  type QuestStepId,
} from "@/features/quests/quest-definitions";
import { useQuestStore } from "@/features/quests/quest-store";
import { useGuest, useIsAdmin } from "@/stores/session-selectors";

export interface QuestStep extends QuestStepDefinition {
  completed: boolean;
}

const EMPTY_VISITED_ZONES: Partial<Record<ZoneId, boolean>> = {};

export function useQuestProgress() {
  const guest = useGuest();
  const isAdmin = useIsAdmin();
  const guestId = guest?.id ?? null;

  const visitedZones = useQuestStore((state) =>
    guestId
      ? (state.visitedZonesByGuest[guestId] ?? EMPTY_VISITED_ZONES)
      : EMPTY_VISITED_ZONES
  );
  const completionDismissed = useQuestStore((state) =>
    guestId ? (state.completionDismissedByGuest[guestId] ?? false) : false
  );

  const { data: arrivalStatus, isLoading: isLoadingArrival } =
    useArrivalStatus(guestId);
  const { reservation, isLoading: isLoadingReservation } =
    useActiveReservation();
  const { bookedActivityId, isLoadingBooked } = useBookActivity();
  const parrotHistory = useParrotHistory(guestId);

  const completedById = useMemo<Record<QuestStepId, boolean>>(
    () => ({
      airport: arrivalStatus?.status === "processed",
      hotel: reservation !== null,
      beach: bookedActivityId !== null,
      parrot: parrotHistory.messages.some((message) => message.role === "user"),
      broadcast: visitedZones[ZoneId.Broadcast] === true,
    }),
    [
      arrivalStatus?.status,
      bookedActivityId,
      parrotHistory.messages,
      reservation,
      visitedZones,
    ]
  );

  const steps = useMemo<QuestStep[]>(
    () =>
      QUEST_STEPS.map((step) => ({
        ...step,
        completed: completedById[step.id],
      })),
    [completedById]
  );

  const activeStep = steps.find((step) => !step.completed) ?? null;
  const completedCount = steps.filter((step) => step.completed).length;

  return {
    available: guest !== null && !isAdmin,
    activeStep,
    activeZoneId: activeStep?.zoneId ?? null,
    completedCount,
    completionDismissed,
    isComplete: completedCount === steps.length,
    isLoading:
      isLoadingArrival ||
      isLoadingReservation ||
      isLoadingBooked ||
      parrotHistory.isLoading,
    steps,
    totalCount: steps.length,
  };
}
