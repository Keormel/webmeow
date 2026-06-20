import { Button } from "@/components/ui/button";
import { RecommendationCard } from "./recommendation-card";
import type { RecommendationsResponse } from "@/features/travel-advisor/types";

interface RecommendationListProps {
  data: RecommendationsResponse;
  onRetake: () => void;
}

export function RecommendationList({ data, onRetake }: RecommendationListProps) {
  const perfect = data.recommendations.filter((r) => r.match_score >= 0.8);
  const good = data.recommendations.filter(
    (r) => r.match_score >= 0.5 && r.match_score < 0.8
  );
  const other = data.recommendations.filter((r) => r.match_score < 0.5);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Your Personal Recommendations ✨
        </h3>
        {data.profile_summary && (
          <p className="rounded-lg bg-primary/5 p-3 text-sm text-foreground/80 italic">
            {data.profile_summary}
          </p>
        )}
      </div>

      {/* Scrollable list */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {/* Perfect Matches */}
        {perfect.length > 0 && (
          <section>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Perfect Matches ({perfect.length})
            </h4>
            <div className="space-y-2">
              {perfect.map((rec, i) => (
                <RecommendationCard
                  key={rec.activity_id}
                  recommendation={rec}
                  rank={i + 1}
                />
              ))}
            </div>
          </section>
        )}

        {/* Good Matches */}
        {good.length > 0 && (
          <section>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              Good Matches ({good.length})
            </h4>
            <div className="space-y-2">
              {good.map((rec, i) => (
                <RecommendationCard
                  key={rec.activity_id}
                  recommendation={rec}
                  rank={perfect.length + i + 1}
                />
              ))}
            </div>
          </section>
        )}

        {/* Other */}
        {other.length > 0 && (
          <section>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
              Other Activities ({other.length})
            </h4>
            <div className="space-y-2">
              {other.map((rec, i) => (
                <RecommendationCard
                  key={rec.activity_id}
                  recommendation={rec}
                  rank={perfect.length + good.length + i + 1}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Retake button */}
      <div className="mt-4 flex justify-center">
        <Button variant="outline" onClick={onRetake}>
          🔄 Retake Quiz
        </Button>
      </div>
    </div>
  );
}
