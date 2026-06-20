import { cn } from "@/lib/utils";
import type { TravelWith } from "@/features/travel-advisor/types";

const OPTIONS: {
  value: TravelWith;
  emoji: string;
  label: string;
  desc: string;
}[] = [
  {
    value: "solo",
    emoji: "🧑",
    label: "Solo",
    desc: "Just me, exploring at my own pace",
  },
  {
    value: "couple",
    emoji: "💑",
    label: "With Partner",
    desc: "Romantic getaway for two",
  },
  {
    value: "family",
    emoji: "👨‍👩‍👧",
    label: "With Family",
    desc: "Kids and parents having fun together",
  },
  {
    value: "group",
    emoji: "👥",
    label: "With Friends",
    desc: "Group adventure and team activities",
  },
];

interface StepTravelWithProps {
  value: TravelWith | null;
  onChange: (v: TravelWith) => void;
}

export function StepTravelWith({ value, onChange }: StepTravelWithProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-center text-lg font-semibold text-foreground">
        Who are you traveling with?
      </h3>
      <p className="text-center text-sm text-muted-foreground">
        We&apos;ll match group-friendly or solo-friendly activities
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200",
              "hover:border-primary/50 hover:bg-primary/5",
              value === opt.value
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
        ))}
      </div>
    </div>
  );
}
