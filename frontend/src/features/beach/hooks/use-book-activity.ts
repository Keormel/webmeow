import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  bookActivity,
  cancelActivity,
  getActivityByGuest,
} from "@/features/beach/api/beach-client";
import { useSessionStore } from "@/stores/session-store";
import { BEACH_KEYS } from "@/features/beach/query-keys";
import { formatTokens } from "@/features/tokens/token-rules";
import { useTokenWalletStore } from "@/features/tokens/token-store";

interface BookActivityVariables {
  activityId: string;
  cost: number;
  currentActivityId: string | null;
}

interface CancelActivityVariables {
  activityId: string;
}

export function useBookActivity() {
  const guest = useSessionStore((s) => s.guest);
  const canAffordActivity = useTokenWalletStore((s) => s.canAffordActivity);
  const spendActivityTokens = useTokenWalletStore((s) => s.spendActivityTokens);
  const refundActivityTokens = useTokenWalletStore(
    (s) => s.refundActivityTokens
  );
  const queryClient = useQueryClient();

  const bookedQuery = useQuery({
    queryKey: [...BEACH_KEYS.BOOKED, guest?.id],
    queryFn: () => getActivityByGuest(guest!.id),
    enabled: !!guest,
    select: (data) => data.activity_id,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [...BEACH_KEYS.ACTIVITIES] });
    queryClient.invalidateQueries({
      queryKey: [...BEACH_KEYS.BOOKED, guest?.id],
    });
  };

  const bookMutation = useMutation({
    mutationFn: ({ activityId }: BookActivityVariables) =>
      bookActivity(activityId, guest!.id),
    onSuccess: (_, variables) => {
      if (!guest) return;

      const spent = spendActivityTokens(
        guest.id,
        variables.activityId,
        variables.cost,
        variables.currentActivityId
      );
      if (spent) {
        toast.success(`${formatTokens(variables.cost)} spent`);
      } else {
        toast.error("Token wallet could not be updated");
      }
      invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ activityId }: CancelActivityVariables) =>
      cancelActivity(activityId, guest!.id),
    onSuccess: (_, variables) => {
      if (!guest) return;

      const refunded = refundActivityTokens(guest.id, variables.activityId);
      if (refunded > 0) {
        toast.success(`${formatTokens(refunded)} returned`);
      }
      invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    bookedActivityId: bookedQuery.data ?? null,
    isLoadingBooked: bookedQuery.isLoading,
    book: (activityId: string, cost: number) => {
      if (!guest) return;

      const currentActivityId = bookedQuery.data ?? null;
      if (!canAffordActivity(guest.id, cost, currentActivityId)) {
        toast.error("Not enough entertainment tokens");
        return;
      }

      bookMutation.mutate({ activityId, cost, currentActivityId });
    },
    cancel: (activityId: string) => cancelMutation.mutate({ activityId }),
    isBooking: bookMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
}
