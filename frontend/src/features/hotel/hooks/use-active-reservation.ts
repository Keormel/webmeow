import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getReservationByGuest,
  cancelReservation,
} from "@/features/hotel/api/hotel-client";
import {
  checkInVisitor,
  checkOutVisitor,
} from "@/features/beach/api/beach-client";
import { BEACH_KEYS } from "@/features/beach/query-keys";
import { useSessionStore } from "@/stores/session-store";
import { HOTEL_KEYS } from "@/features/hotel/query-keys";
import {
  formatTokens,
  getReservationTokenAllowance,
} from "@/features/tokens/token-rules";
import { useTokenWalletStore } from "@/features/tokens/token-store";

export function useActiveReservation() {
  const guest = useSessionStore((s) => s.guest);
  const trackedActivityBooking = useTokenWalletStore((s) =>
    guest ? (s.activityBookings[guest.id] ?? null) : null
  );
  const refundActivityTokens = useTokenWalletStore(
    (s) => s.refundActivityTokens
  );
  const creditReservationTokens = useTokenWalletStore(
    (s) => s.creditReservationTokens
  );
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...HOTEL_KEYS.RESERVATION, guest?.id],
    queryFn: () => getReservationByGuest(guest!.id),
    enabled: !!guest,
  });

  useEffect(() => {
    if (!query.data) return;

    checkInVisitor(query.data.guest_id).catch(() => {
      // Beach sync is best-effort here; booking still reports real failures.
    });

    creditReservationTokens(
      query.data.guest_id,
      query.data.id,
      getReservationTokenAllowance(query.data)
    );
  }, [creditReservationTokens, query.data]);

  const mutation = useMutation({
    mutationFn: (id: string) => cancelReservation(id, guest!.id),
    onSuccess: () => {
      if (guest) {
        checkOutVisitor(guest.id).catch(() => {
          // Hotel cancellation is already complete; beach sync is best-effort.
        });

        if (trackedActivityBooking) {
          const refunded = refundActivityTokens(
            guest.id,
            trackedActivityBooking.activityId
          );
          if (refunded > 0) {
            toast.success(`${formatTokens(refunded)} returned`);
          }
        }
      }

      queryClient.invalidateQueries({
        queryKey: [...HOTEL_KEYS.RESERVATION],
      });
      queryClient.invalidateQueries({ queryKey: [...HOTEL_KEYS.ROOMS] });
      queryClient.invalidateQueries({ queryKey: [...BEACH_KEYS.BOOKED] });
      queryClient.invalidateQueries({ queryKey: [...BEACH_KEYS.ACTIVITIES] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    reservation: query.data ?? null,
    isLoading: query.isLoading,
    cancel: (id: string) => mutation.mutate(id),
    isCancelling: mutation.isPending,
  };
}
