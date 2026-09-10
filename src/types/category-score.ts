import { CATEGORY_TYPES, isCategoryType, normalizeCategory, type Category, type CategoryType } from "@/types/category";

export type CategoryScore = {
  categoryScoreId: number;
  totalRawPoints: number;
  maxPoints: number;
  percentage: number;
  category?: Category;
};

export function scorePercentage(score: Pick<CategoryScore, "percentage" | "totalRawPoints" | "maxPoints">): number {
  if (Number.isFinite(score.percentage)) return score.percentage;
  if (!score.maxPoints) return 0;
  return Math.round((score.totalRawPoints * 10000) / score.maxPoints) / 100;
}

export function normalizeCategoryScore(raw: unknown): CategoryScore {
  const value = (raw ?? {}) as Record<string, unknown>;
  const category = value.category ? normalizeCategory(value.category) : undefined;
  const totalRawPoints = Number(value.totalRawPoints ?? 0);
  const maxPoints = Number(value.maxPoints ?? 0);
  const percentageRaw = value.percentage;
  return {
    categoryScoreId: Number(value.categoryScoreId ?? value.id),
    totalRawPoints,
    maxPoints,
    percentage:
      typeof percentageRaw === "number" && Number.isFinite(percentageRaw)
        ? percentageRaw
        : scorePercentage({ percentage: Number.NaN, totalRawPoints, maxPoints }),
    category: category && Number.isFinite(category.categoryId) ? category : undefined,
  };
}

export function extractCategoryScores(res: unknown): CategoryScore[] {
  const value = (res ?? {}) as Record<string, unknown>;
  const list = value.categoryScores;
  if (!Array.isArray(list)) return [];
  return list.map(normalizeCategoryScore).filter((item) => Number.isFinite(item.categoryScoreId) || item.category);
}

export function sortScores(items: CategoryScore[]): CategoryScore[] {
  return [...items].sort(
    (a, b) =>
      scorePercentage(b) - scorePercentage(a) ||
      (a.category?.categoryName ?? "").localeCompare(b.category?.categoryName ?? ""),
  );
}

export function scoresOfType(scores: CategoryScore[], type: CategoryType): CategoryScore[] {
  return scores.filter((score) => score.category?.categoryType === type);
}

export function roundedPercentage(score: Pick<CategoryScore, "percentage" | "totalRawPoints" | "maxPoints">): number {
  return Math.round(scorePercentage(score));
}

export function averagePercentage(scores: CategoryScore[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((sum, score) => sum + scorePercentage(score), 0) / scores.length);
}

export function scoreOnTen(score: CategoryScore): string {
  return (roundedPercentage(score) / 10).toFixed(1);
}

export type GiftPresence = "leading" | "present" | "growing";

export function giftPresence(score: CategoryScore, ranked: CategoryScore[]): GiftPresence {
  if (ranked.length === 0) return "present";
  const index = ranked.indexOf(score);
  if (index < 0) return "present";
  if (index < Math.min(2, ranked.length)) return "leading";
  if (index === ranked.length - 1) return "growing";
  return "present";
}

export function giftPresenceLabel(presence: GiftPresence): string | undefined {
  if (presence === "leading") return "Leading gift";
  if (presence === "growing") return "Growing edge";
  return undefined;
}

export function groupScoresByType(
  scores: CategoryScore[],
): { type: CategoryType | "OTHER"; label: string; items: CategoryScore[] }[] {
  const groups: { type: CategoryType | "OTHER"; label: string; items: CategoryScore[] }[] = CATEGORY_TYPES.map(
    (type) => ({
      type,
      label: type === "GIFT" ? "Spiritual gifts" : "Church teams",
      items: sortScores(scores.filter((score) => score.category?.categoryType === type)),
    }),
  );

  const leftover = sortScores(scores.filter((score) => !isCategoryType(score.category?.categoryType)));
  if (leftover.length > 0) {
    groups.push({ type: "OTHER", label: "Scores", items: leftover });
  }

  return groups;
}

export function strongestCategoryNames(scores: CategoryScore[], count = 3): string[] {
  return sortScores(scores)
    .map((score) => score.category?.categoryName?.trim())
    .filter((name): name is string => Boolean(name))
    .slice(0, count);
}
