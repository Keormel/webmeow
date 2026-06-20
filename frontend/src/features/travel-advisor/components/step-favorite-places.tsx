import { cn } from "@/lib/utils";
import type { FavoritePlace } from "@/features/travel-advisor/types";

const OPTIONS: {
  value: FavoritePlace;
  emoji: string;
  label: string;
  desc: string;
}[] = [
  {
    value: "beach",
    emoji: "🏖️",
    label: "Beach & Sand",
    desc: "Volleyball, sunbathing, bonfires",
  },
  {
    value: "water",
    emoji: "🌊",
    label: "Water & Ocean",
    desc: "Surfing, diving, kayaking, sailing",
  },
  {
    value: "nature",
    emoji: "🌿",
    label: "Nature & Wildlife",
    desc: "Walks, photography, eco-activities",
  },
  {
    value: "social",
    emoji: "🎉",
    label: "Social & Gatherings",
    desc: "Group activities, cooking, bonfires",
  },
];

interface StepFavoritePlacesProps {
  value: FavoritePlace[];
  onToggle: (place: FavoritePlace) => void;
}

export function StepFavoritePlaces({
  value,
  onToggle,
}: StepFavoritePlacesProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-center text-lg font-semibold text-foreground">
        What places do you enjoy?
      </h3>
      <p className="text-center text-sm text-muted-foreground">
        Pick one or more — we&apos;ll find the best spots for you
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {OPTIONS.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200",
                "hover:border-primary/50 hover:bg-primary/5",
                selected
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                  : "border-border bg-card"
              )}
            >
              <span className="text-3xl">{opt.emoji}</span>
              <div className="font-medium text-foreground text-sm">
                {opt.label}
              </div>
              <div className="text-xs text-muted-foreground">{opt.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
