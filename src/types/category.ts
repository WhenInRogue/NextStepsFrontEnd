export const CATEGORY_TYPES = ["GIFT", "TEAM"] as const;
export type CategoryType = (typeof CATEGORY_TYPES)[number];

export type Category = {
  categoryId: number;
  categoryName: string;
  description?: string;
  categoryType: CategoryType;
};

export type CategoryPayload = {
  categoryName?: string;
  description?: string;
  categoryType?: CategoryType;
};

export function isCategoryType(value: unknown): value is CategoryType {
  return value === "GIFT" || value === "TEAM";
}

export function formatCategoryType(type?: CategoryType): string {
  if (type === "TEAM") return "Team";
  return "Gift";
}

export function normalizeCategory(raw: unknown): Category {
  const value = (raw ?? {}) as Record<string, unknown>;
  const typeRaw = typeof value.categoryType === "string" ? value.categoryType.toUpperCase() : "GIFT";
  return {
    categoryId: Number(value.categoryId ?? value.id),
    categoryName: String(value.categoryName ?? value.name ?? ""),
    description: typeof value.description === "string" ? value.description : undefined,
    categoryType: isCategoryType(typeRaw) ? typeRaw : "GIFT",
  };
}

export function extractCategory(res: unknown): Category | null {
  const value = (res ?? {}) as Record<string, unknown>;
  if (!value.category) return null;
  const category = normalizeCategory(value.category);
  return Number.isFinite(category.categoryId) ? category : null;
}

export function extractCategories(res: unknown): Category[] {
  const value = (res ?? {}) as Record<string, unknown>;
  const list = value.categories;
  if (!Array.isArray(list)) return [];
  return list.map(normalizeCategory).filter((item) => Number.isFinite(item.categoryId));
}

export function groupCategoriesByType(categories: Category[]): { type: CategoryType; label: string; items: Category[] }[] {
  return CATEGORY_TYPES.map((type) => ({
    type,
    label: type === "GIFT" ? "Spiritual gifts" : "Church teams",
    items: categories.filter((item) => item.categoryType === type),
  }));
}
