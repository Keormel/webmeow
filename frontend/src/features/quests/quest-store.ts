import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { ZoneId } from "@/features/map/constants";

type VisitedZones = Partial<Record<ZoneId, boolean>>;

interface QuestStoreState {
  visitedZonesByGuest: Record<string, VisitedZones>;
  completionDismissedByGuest: Record<string, boolean>;
  markZoneVisited: (guestId: string, zoneId: ZoneId) => void;
  setCompletionDismissed: (guestId: string, dismissed: boolean) => void;
}

export const useQuestStore = create<QuestStoreState>()(
  persist(
    (set) => ({
      visitedZonesByGuest: {},
      completionDismissedByGuest: {},

      markZoneVisited: (guestId, zoneId) =>
        set((state) => ({
          visitedZonesByGuest: {
            ...state.visitedZonesByGuest,
            [guestId]: {
              ...state.visitedZonesByGuest[guestId],
              [zoneId]: true,
            },
          },
        })),

      setCompletionDismissed: (guestId, dismissed) =>
        set((state) => ({
          completionDismissedByGuest: {
            ...state.completionDismissedByGuest,
            [guestId]: dismissed,
          },
        })),
    }),
    {
      name: "kikis-paradise-quest-guide",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
