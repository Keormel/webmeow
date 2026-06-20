import { cn } from "@/lib/utils";
import type { VacationGoal } from "@/features/travel-advisor/types";

const OPTIONS: {
  value: VacationGoal;
  emoji: string;
  label: string;
  desc: string;
}[] = [
  {
    value: "relax",
    emoji: "😌",
    label: "Recharge & Relax",
    desc: "Escape the stress, feel refreshed",
  },
  {
    value: "adventure",
    emoji: "🗺️",
    label: "Seek Adventure",
    desc: "New thrills, exciting experiences",
  },
  {
    value: "learn",
    emoji: "📚",
    label: "Learn Something New",
    desc: "Skills, workshops, local culture",
  },
  {
    value: "socialize",
    emoji: "🤝",
    label: "Meet People",
    desc: "Group activities, make new friends",
  },
  {
    value: "family_fun",
    emoji: "👨‍👩‍👧‍👦",
    label: "Family Fun",
    desc: "Kid-friendly, everyone enjoys it",
  },
];

interface StepVacationGoalProps {
  value: VacationGoal | null;
  onChange: (v: VacationGoal) => void;
}

export function StepVacationGoal({ value, onChange }: StepVacationGoalProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-center text-lg font-semibold text-foreground">
        What do you want from this vacation?
      </h3>
      <p className="text-center text-sm text-muted-foreground">
        Your main goal helps us prioritize activities
      </p>
      <div className="mt-4 grid gap-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200",
              "hover:border-primary/50 hover:bg-primary/5",
              value === opt.value
                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                : "border-border bg-card"
            )}
          >
            <span className="text-3xl">{opt.emoji}</span>
            <div>
              <div className="font-medium text-foreground">{opt.label}</div>
              <div className="text-xs text-muted-foreground">{opt.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
