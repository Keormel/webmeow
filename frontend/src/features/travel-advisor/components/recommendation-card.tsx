import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ActivityRecommendation } from "@/features/travel-advisor/types";

interface RecommendationCardProps {
  recommendation: ActivityRecommendation;
  rank: number;
}

function getMatchLabel(score: number): {
  label: string;
  className: string;
} {
  if (score >= 0.8) return { label: "Perfect Match", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" };
  if (score >= 0.5) return { label: "Good Match", className: "bg-amber-500/15 text-amber-600 dark:text-amber-400" };
  return { label: "Worth Trying", className: "bg-slate-500/15 text-slate-600 dark:text-slate-400" };
}

function getScoreColor(score: number): string {
  if (score >= 0.8) return "bg-emerald-500";
  if (score >= 0.5) return "bg-amber-500";
  return "bg-slate-400";
}

export function RecommendationCard({
  recommendation: rec,
  rank,
}: RecommendationCardProps) {
  const matchLabel = getMatchLabel(rec.match_score);
  const scorePercent = Math.round(rec.match_score * 100);

  return (
    <div
      className={cn(
        "group rounded-xl border bg-card p-4 transition-all duration-200",
        "hover:border-primary/30 hover:shadow-md",
        rank <= 3 && "border-primary/20"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">
              #{rank}
            </span>
            <h4 className="font-semibold text-foreground">
              {rec.activity_name}
            </h4>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="text-[10px]">
              {rec.category}
            </Badge>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", matchLabel.className)}>
              {matchLabel.label}
            </span>
            {rec.available_spots !== null && rec.available_spots !== undefined && (
              <span
                className={cn(
                  "text-[10px] font-medium",
                  rec.available_spots > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-destructive"
                )}
              >
                {rec.available_spots > 0
                  ? `${rec.available_spots} spots left`
                  : "Full"}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground">{rec.description}</p>

          {/* AI Reason */}
          <p className="text-xs italic text-foreground/70">
            &ldquo;{rec.reason}&rdquo;
          </p>
        </div>

        {/* Score circle */}
        <div className="flex flex-col items-center gap-1">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white",
              getScoreColor(rec.match_score)
            )}
          >
            {scorePercent}%
          </div>
        </div>
      </div>

      {/* Score bar */}
      <div className="mt-3 h-1 w-full rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            getScoreColor(rec.match_score)
          )}
          style={{ width: `${scorePercent}%` }}
        />
      </div>
    </div>
  );
}
