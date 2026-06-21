import { Spinner } from "@/components/ui/spinner";
import { ActivityCard } from "@/features/beach/components/activity-card";
import { ActivityAction } from "@/features/beach/components/activity-action";
import { useActivities } from "@/features/beach/hooks/use-activities";
import { useBookActivity } from "@/features/beach/hooks/use-book-activity";
import {
  formatTokens,
  getActivityTokenCost,
} from "@/features/tokens/token-rules";
import { useTokenWalletStore } from "@/features/tokens/token-store";
import { useSessionStore } from "@/stores/session-store";

export function ActivitiesList() {
  const guest = useSessionStore((s) => s.guest);
  const tokenBalance = useTokenWalletStore((s) =>
    guest ? (s.balances[guest.id] ?? 0) : 0
  );
  const trackedActivityBooking = useTokenWalletStore((s) =>
    guest ? (s.activityBookings[guest.id] ?? null) : null
  );
  const { activities, isLoading } = useActivities();
  const {
    bookedActivityId,
    isLoadingBooked,
    book,
    cancel,
    isBooking,
    isCancelling,
  } = useBookActivity();

  if (isLoading || isLoadingBooked) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No activities available.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/70 px-4 py-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase">
          Entertainment wallet
        </span>
        <span className="text-sm font-semibold text-(--zone-accent)">
          {formatTokens(tokenBalance)}
        </span>
      </div>

      {activities.map((activity) => {
        const isBooked = bookedActivityId === activity.activity_id;
        const isReplacing = bookedActivityId !== null && !isBooked;
        const tokenCost = getActivityTokenCost(activity);
        const refundableTokens =
          isReplacing && trackedActivityBooking?.activityId === bookedActivityId
            ? trackedActivityBooking.cost
            : 0;
        const isAffordable = tokenBalance + refundableTokens >= tokenCost;

        return (
          <ActivityCard
            key={activity.activity_id}
            activity={activity}
            isBooked={isBooked}
            tokenCost={tokenCost}
            action={
              <ActivityAction
                isBooked={isBooked}
                isReplacing={isReplacing}
                isFull={activity.remaining === 0}
                isAffordable={isBooked || isAffordable}
                isBooking={isBooking}
                isCancelling={isCancelling}
                onBook={() => book(activity.activity_id, tokenCost)}
                onCancel={() => cancel(activity.activity_id, tokenCost)}
              />
            }
          />
        );
      })}
    </div>
  );
}
