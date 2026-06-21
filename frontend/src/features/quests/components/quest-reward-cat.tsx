import { IconGift } from "@tabler/icons-react";
import type { CSSProperties } from "react";

import type { QuestStep } from "@/features/quests/hooks/use-quest-progress";
import type { QuestRewardDefinition } from "@/features/quests/quest-definitions";
import { getRewardAsset } from "@/features/quests/quest-reward-assets";
import { cn } from "@/lib/utils";

const CAT_ASSET = getRewardAsset("1 cat.svg");
const LEFT_HAND_ASSET = getRewardAsset("3 lefthand.svg");
const RIGHT_HAND_ASSET = getRewardAsset("3 righthand.svg");

interface QuestRewardCatProps {
  steps: QuestStep[];
  activeStep: QuestStep | null;
  className?: string;
  frameClassName?: string;
}

interface QuestRewardThumbProps {
  reward: QuestRewardDefinition;
  className?: string;
}

function rewardAsset(reward: QuestRewardDefinition) {
  return getRewardAsset(reward.assetFileName, reward.fallbackAssetFileName);
}

function rewardLayerStyle(
  reward: QuestRewardDefinition,
  zIndex: number
): CSSProperties {
  return {
    left: reward.layer.left,
    top: reward.layer.top,
    width: reward.layer.width,
    zIndex,
  };
}

function rewardUsesLeftHand(reward: QuestRewardDefinition): boolean {
  return reward.placement === "left-hand";
}

function rewardUsesRightHand(reward: QuestRewardDefinition): boolean {
  return reward.placement === "right-hand";
}

function RewardLayer({
  reward,
  preview = false,
}: {
  reward: QuestRewardDefinition;
  preview?: boolean;
}) {
  const src = rewardAsset(reward);

  if (!src) {
    return null;
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={cn(
        "pointer-events-none absolute select-none",
        preview && "opacity-35"
      )}
      style={rewardLayerStyle(reward, preview ? 2 : 3)}
    />
  );
}

export function QuestRewardCat({
  steps,
  activeStep,
  className,
  frameClassName,
}: QuestRewardCatProps) {
  const earnedRewards = steps
    .filter((step) => step.completed && step.reward)
    .map((step) => step.reward!);
  const previewReward =
    activeStep && !activeStep.completed ? activeStep.reward : undefined;
  const visibleRewards = previewReward
    ? [...earnedRewards, previewReward]
    : earnedRewards;
  const showLeftHand = visibleRewards.some(rewardUsesLeftHand);
  const showRightHand = visibleRewards.some(rewardUsesRightHand);

  return (
    <div
      className={cn("flex justify-center", className)}
      data-testid="quest-reward-cat"
    >
      <div
        className={cn(
          "relative h-40 w-[134px] overflow-visible",
          frameClassName
        )}
      >
        {CAT_ASSET && (
          <img
            src={CAT_ASSET}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full object-contain select-none"
          />
        )}

        {earnedRewards.map((reward) => (
          <RewardLayer key={reward.label} reward={reward} />
        ))}

        {previewReward && <RewardLayer reward={previewReward} preview />}

        {showRightHand && RIGHT_HAND_ASSET && (
          <img
            src={RIGHT_HAND_ASSET}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none absolute select-none"
            style={{
              left: "69%",
              top: "64%",
              width: "13%",
              zIndex: 4,
            }}
          />
        )}

        {showLeftHand && LEFT_HAND_ASSET && (
          <img
            src={LEFT_HAND_ASSET}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none absolute select-none"
            style={{
              left: "13%",
              top: "64%",
              width: "11.5%",
              zIndex: 4,
            }}
          />
        )}
      </div>
    </div>
  );
}

export function QuestRewardThumb({ reward, className }: QuestRewardThumbProps) {
  const src = rewardAsset(reward);

  return (
    <div
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar/60",
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="max-h-10 max-w-10 object-contain"
        />
      ) : (
        <IconGift size={20} />
      )}
    </div>
  );
}
