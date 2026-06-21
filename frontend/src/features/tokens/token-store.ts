import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ActivityTokenBooking {
  activityId: string;
  cost: number;
}

interface TokenWalletState {
  balances: Record<string, number>;
  creditedReservations: Record<string, true>;
  activityBookings: Record<string, ActivityTokenBooking | null>;
  creditReservationTokens: (
    guestId: string,
    reservationId: string,
    amount: number
  ) => boolean;
  canAffordActivity: (
    guestId: string,
    cost: number,
    currentActivityId: string | null
  ) => boolean;
  spendActivityTokens: (
    guestId: string,
    activityId: string,
    cost: number,
    currentActivityId: string | null
  ) => boolean;
  refundActivityTokens: (
    guestId: string,
    activityId: string,
    fallbackCost?: number
  ) => number;
}

const EMPTY_WALLET_STATE = {
  balances: {},
  creditedReservations: {},
  activityBookings: {},
} satisfies Pick<
  TokenWalletState,
  "balances" | "creditedReservations" | "activityBookings"
>;

function reservationCreditKey(guestId: string, reservationId: string): string {
  return `${guestId}:${reservationId}`;
}

function getRefundableCost(
  state: TokenWalletState,
  guestId: string,
  currentActivityId: string | null
): number {
  const trackedBooking = state.activityBookings[guestId];
  return trackedBooking?.activityId === currentActivityId
    ? trackedBooking.cost
    : 0;
}

export const useTokenWalletStore = create<TokenWalletState>()(
  persist(
    (set, get) => ({
      ...EMPTY_WALLET_STATE,

      creditReservationTokens: (guestId, reservationId, amount) => {
        if (amount <= 0) return false;

        const key = reservationCreditKey(guestId, reservationId);
        if (get().creditedReservations[key]) return false;

        set((state) => ({
          balances: {
            ...state.balances,
            [guestId]: (state.balances[guestId] ?? 0) + amount,
          },
          creditedReservations: {
            ...state.creditedReservations,
            [key]: true,
          },
        }));

        return true;
      },

      canAffordActivity: (guestId, cost, currentActivityId) => {
        const state = get();
        const balance = state.balances[guestId] ?? 0;
        const refundableCost = getRefundableCost(
          state,
          guestId,
          currentActivityId
        );

        return balance + refundableCost >= cost;
      },

      spendActivityTokens: (guestId, activityId, cost, currentActivityId) => {
        const state = get();
        const trackedBooking = state.activityBookings[guestId];

        if (trackedBooking?.activityId === activityId) return true;

        const balance = state.balances[guestId] ?? 0;
        const refundableCost = getRefundableCost(
          state,
          guestId,
          currentActivityId
        );
        const nextBalance = balance + refundableCost - cost;

        if (nextBalance < 0) return false;

        set((current) => ({
          balances: {
            ...current.balances,
            [guestId]: nextBalance,
          },
          activityBookings: {
            ...current.activityBookings,
            [guestId]: { activityId, cost },
          },
        }));

        return true;
      },

      refundActivityTokens: (guestId, activityId, fallbackCost = 0) => {
        const trackedBooking = get().activityBookings[guestId];

        if (trackedBooking?.activityId !== activityId) {
          if (trackedBooking || fallbackCost <= 0) return 0;

          set((state) => ({
            balances: {
              ...state.balances,
              [guestId]: (state.balances[guestId] ?? 0) + fallbackCost,
            },
            activityBookings: {
              ...state.activityBookings,
              [guestId]: null,
            },
          }));

          return fallbackCost;
        }

        set((state) => ({
          balances: {
            ...state.balances,
            [guestId]: (state.balances[guestId] ?? 0) + trackedBooking.cost,
          },
          activityBookings: {
            ...state.activityBookings,
            [guestId]: null,
          },
        }));

        return trackedBooking.cost;
      },
    }),
    {
      name: "kikis-paradise-token-wallet",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        balances: state.balances,
        creditedReservations: state.creditedReservations,
        activityBookings: state.activityBookings,
      }),
    }
  )
);
