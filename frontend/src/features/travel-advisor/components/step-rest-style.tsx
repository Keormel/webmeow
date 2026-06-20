import { cn } from "@/lib/utils";
import type { RestStyle } from "@/features/travel-advisor/types";

const OPTIONS: { value: RestStyle; emoji: string; label: string; desc: string }[] = [
  {
    value: "calm",
    emoji: "🧘",
    label: "Calm & Relaxing",
    desc: "Sunsets, meditation, slow-paced activities",
  },
  {
    value: "active",
    emoji: "🏄",
    label: "Active & Adventurous",
    desc: "Sports, water activities, high-energy fun",
  },
  {
    value: "mixed",
    emoji: "⚖️",
    label: "A Bit of Both",
    desc: "Balance between relaxation and adventure",
  },
];

interface StepRestStyleProps {
  value: RestStyle | null;
  onChange: (v: RestStyle) => void;
}

export function StepRestStyle({ value, onChange }: StepRestStyleProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-center text-lg font-semibold text-foreground">
        What kind of rest do you prefer?
      </h3>
      <p className="text-center text-sm text-muted-foreground">
        This helps us match activities to your vibe
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
