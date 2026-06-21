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
        preview && "opacity-35 grayscale"
      )}
      style={rewardLayerStyle(reward, preview ? 2 : 3)}
    />
  );
}

export function QuestRewardCat({ steps, activeStep }: QuestRewardCatProps) {
  const earnedRewards = steps
    .filter((step) => step.completed && step.reward)
    .map((step) => step.reward!);
  const previewReward =
    activeStep && !activeStep.completed ? activeStep.reward : undefined;
  const showHands = earnedRewards.length > 0 || previewReward !== undefined;

  return (
    <div className="flex justify-center" data-testid="quest-reward-cat">
      <div className="quest-reward-cat-frame relative h-40 w-[134px] overflow-visible">
        {CAT_ASSET && (
          <img
            src={CAT_ASSET}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="quest-reward-cat-base pointer-events-none absolute top-0 right-0 h-full w-[85.5%] select-none"
          />
        )}

        {earnedRewards.map((reward) => (
          <RewardLayer key={reward.label} reward={reward} />
        ))}

        {previewReward && <RewardLayer reward={previewReward} preview />}

        {showHands && RIGHT_HAND_ASSET && (
          <img
            src={RIGHT_HAND_ASSET}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none absolute select-none"
            style={{
              left: "68%",
              top: "66%",
              width: "12.3%",
              zIndex: 4,
            }}
          />
        )}

        {showHands && LEFT_HAND_ASSET && (
          <img
            src={LEFT_HAND_ASSET}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none absolute select-none"
            style={{
              left: "13%",
              top: "66%",
              width: "11%",
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
