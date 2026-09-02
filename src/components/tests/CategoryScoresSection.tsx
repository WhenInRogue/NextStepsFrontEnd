import { Progress } from "@/components/ui/progress";
import { formatCategoryType } from "@/types/category";
import { groupScoresByType, scorePercentage, strongestCategoryNames, type CategoryScore } from "@/types/category-score";

type CategoryScoresSectionProps = {
  scores: CategoryScore[];
  emptyMessage?: string;
};

const CategoryScoresSection = ({
  scores,
  emptyMessage = "No scores were returned for this attempt.",
}: CategoryScoresSectionProps) => {
  const groupedScores = groupScoresByType(scores);

  if (scores.length === 0 || groupedScores.every((group) => group.items.length === 0)) {
    return <p className="mt-6 rounded-xl bg-sand/70 px-4 py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="mt-6 space-y-8">
      {groupedScores.map((group) => {
        if (group.items.length === 0) return null;
        const highlights = strongestCategoryNames(group.items);
        return (
          <div key={group.type}>
            <h3 className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{group.label}</h3>
            {highlights.length > 0 ? (
              <p className="mt-2 text-sm text-ink">
                {group.type === "TEAM" ? "Teams you’re most drawn to: " : "Your strongest gifts: "}
                <span className="font-medium">{highlights.join(", ")}</span>
              </p>
            ) : null}
            <ul className="mt-3 space-y-3">
              {group.items.map((score, index) => {
                const percent = scorePercentage(score);
                return (
                  <li key={score.categoryScoreId || score.category?.categoryId} className="rounded-xl bg-sand/70 px-4 py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-ink">{score.category?.categoryName || "Category"}</p>
                        {index === 0 && group.items.length > 1 ? (
                          <span className="rounded-full bg-ochre/40 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-ink">
                            Strongest
                          </span>
                        ) : null}
                        {score.category ? (
                          <span className="rounded-full bg-azure/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-azure">
                            {formatCategoryType(score.category.categoryType)}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm font-medium text-ink">{percent}%</p>
                    </div>
                    <Progress value={Math.min(100, percent)} className="mt-3 h-2 bg-cream" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {score.totalRawPoints} of {score.maxPoints} points
                    </p>
                    {score.category?.description ? (
                      <p className="mt-2 text-sm text-muted-foreground">{score.category.description}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryScoresSection;
