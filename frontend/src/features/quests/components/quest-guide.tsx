import { useState } from "react";
import {
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconMapPin,
  IconRoute,
  IconX,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { ZoneId } from "@/features/map/constants";
import { getZone } from "@/features/map/zone-registry";
import {
  QuestRewardCat,
  QuestRewardThumb,
} from "@/features/quests/components/quest-reward-cat";
import { useQuestProgress } from "@/features/quests/hooks/use-quest-progress";
import { useQuestStore } from "@/features/quests/quest-store";
import { cn } from "@/lib/utils";
import { useGuest } from "@/stores/session-selectors";

interface QuestGuideProps {
  onOpenZone: (zoneId: ZoneId) => void;
}

export function QuestGuide({ onOpenZone }: QuestGuideProps) {
  const [collapsed, setCollapsed] = useState(false);
  const guest = useGuest();
  const progress = useQuestProgress();
  const setCompletionDismissed = useQuestStore(
    (state) => state.setCompletionDismissed
  );

  if (!progress.available || progress.completionDismissed) {
    return null;
  }

  const activeStep = progress.activeStep;
  const progressPercent = (progress.completedCount / progress.totalCount) * 100;
  const ActiveIcon = activeStep?.icon ?? IconRoute;

  function dismissComplete() {
    if (guest) {
      setCompletionDismissed(guest.id, true);
    }
  }

  return (
    <>
      <QuestRewardCat
        steps={progress.steps}
        activeStep={activeStep}
        className={cn(
          "pointer-events-none fixed bottom-[84px] left-[66px] z-30 sm:left-[84px] md:left-[96px]",
          !collapsed && "max-sm:hidden"
        )}
        frameClassName="h-[150px] w-[108px] sm:h-[190px] sm:w-[136px] md:h-[220px] md:w-[158px]"
      />

      <section
        data-testid="quest-guide"
        data-collapsed={collapsed}
        className="fixed top-20 right-3 left-3 z-50 w-auto rounded-2xl bg-sidebar/95 p-3 text-sidebar-foreground shadow-xl backdrop-blur-sm sm:right-auto sm:left-6 sm:w-[360px]"
      >
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
            <ActiveIcon size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-sidebar-foreground/60">
                  Quest guide
                </p>
                <h2 className="font-display text-base font-semibold">
                  {progress.isComplete
                    ? "Island tour complete"
                    : activeStep?.title}
                </h2>
              </div>

              <button
                type="button"
                aria-label={
                  collapsed ? "Expand quest guide" : "Collapse quest guide"
                }
                title={
                  collapsed ? "Expand quest guide" : "Collapse quest guide"
                }
                onClick={() => setCollapsed((value) => !value)}
                className="cursor-pointer rounded-full p-1.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                {collapsed ? (
                  <IconChevronDown size={16} />
                ) : (
                  <IconChevronUp size={16} />
                )}
              </button>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sidebar-accent">
              <div
                className="h-full rounded-full bg-sidebar-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="mt-1.5 text-xs text-sidebar-foreground/60">
              {progress.completedCount} of {progress.totalCount} complete
            </p>
          </div>
        </div>

        {!collapsed && (
          <div className="mt-4 flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-sidebar-foreground/80">
              {progress.isComplete
                ? "Every guest activity has been touched. The island is yours now."
                : activeStep?.description}
            </p>

            {activeStep?.reward && (
              <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/60 p-2">
                <QuestRewardThumb reward={activeStep.reward} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-sidebar-foreground/60">
                    Reward waiting
                  </p>
                  <p className="text-sm font-semibold text-sidebar-foreground">
                    {activeStep.reward.label}
                  </p>
                </div>
              </div>
            )}

            {activeStep && (
              <Button
                type="button"
                data-testid="quest-open-zone"
                onClick={() => onOpenZone(activeStep.zoneId)}
                className="w-full cursor-pointer bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
              >
                <IconMapPin size={16} className="mr-2" />
                {activeStep.actionLabel}
              </Button>
            )}

            {progress.isComplete && (
              <Button
                type="button"
                variant="outline"
                onClick={dismissComplete}
                className="w-full cursor-pointer border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <IconX size={15} className="mr-2" />
                Hide guide
              </Button>
            )}

            <ol className="flex flex-col gap-2">
              {progress.steps.map((step, index) => {
                const StepIcon = step.icon;
                const active = activeStep?.id === step.id;
                const zone = getZone(step.zoneId);
                const detail = step.reward
                  ? step.completed
                    ? `Unlocked ${step.reward.label}`
                    : `Reward: ${step.reward.label}`
                  : step.completed
                    ? step.completedLabel
                    : zone.label;

                return (
                  <li
                    key={step.id}
                    data-testid={`quest-step-${step.id}`}
                    data-completed={step.completed}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-2 py-2 transition-colors",
                      active && "bg-sidebar-accent/70",
                      step.completed && "text-sidebar-foreground/70"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full border border-sidebar-border",
                        step.completed
                          ? "border-sidebar-primary bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/70"
                      )}
                    >
                      {step.completed ? (
                        <IconCircleCheck size={16} />
                      ) : (
                        <StepIcon size={16} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {index + 1}. {step.title}
                      </p>
                      <p className="text-xs text-sidebar-foreground/55">
                        {detail}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </section>
    </>
  );
}
