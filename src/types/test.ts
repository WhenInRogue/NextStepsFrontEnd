import { normalizeGroup, type Group } from "@/types/group";

export const TEST_AUDIENCES = ["EVERYONE", "GROUPS"] as const;
export type TestAudience = (typeof TEST_AUDIENCES)[number];

export type Test = {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  isActive?: boolean;
  audience: TestAudience;
  groupIds: number[];
  groups?: Group[];
};

export type TestPayload = {
  name?: string;
  description?: string;
  isActive?: boolean;
  audience?: TestAudience;
  groupIds?: number[];
};

export function isTestAudience(value: unknown): value is TestAudience {
  return value === "EVERYONE" || value === "GROUPS";
}

export function isTestActive(test: Pick<Test, "isActive">): boolean {
  return test.isActive !== false;
}

export function formatTestAudience(audience?: TestAudience): string {
  if (audience === "GROUPS") return "Teams";
  return "Everyone";
}

export function assignedGroupIds(test: Pick<Test, "groupIds" | "groups">): number[] {
  if (Array.isArray(test.groupIds)) return uniqueSortedIds(test.groupIds);
  if (Array.isArray(test.groups)) return uniqueSortedIds(test.groups.map((group) => group.groupId));
  return [];
}

export function sameIdList(a: number[], b: number[]): boolean {
  const left = uniqueSortedIds(a);
  const right = uniqueSortedIds(b);
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

export function normalizeDateTime(raw: unknown): string | undefined {
  if (typeof raw === "string" && raw.trim()) return raw;
  if (Array.isArray(raw) && raw.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = raw as number[];
    const date = new Date(year, month - 1, day, hour, minute, second);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return undefined;
}

export function normalizeTest(raw: unknown): Test {
  const value = (raw ?? {}) as Record<string, unknown>;
  const isActive = value.isActive ?? value.active;
  const audienceRaw = typeof value.audience === "string" ? value.audience.toUpperCase() : "EVERYONE";
  const groups = Array.isArray(value.groups)
    ? value.groups.map(normalizeGroup).filter((group) => Number.isFinite(group.groupId))
    : undefined;
  const groupIds = Array.isArray(value.groupIds)
    ? uniqueSortedIds(value.groupIds.map((id) => Number(id)))
    : groups
      ? uniqueSortedIds(groups.map((group) => group.groupId))
      : [];

  return {
    id: Number(value.id ?? value.testId),
    name: String(value.name ?? ""),
    description: typeof value.description === "string" ? value.description : undefined,
    createdAt: normalizeDateTime(value.createdAt),
    isActive: typeof isActive === "boolean" ? isActive : true,
    audience: isTestAudience(audienceRaw) ? audienceRaw : "EVERYONE",
    groupIds,
    groups,
  };
}

export function extractTests(res: unknown): Test[] {
  const value = (res ?? {}) as Record<string, unknown>;
  const list = value.tests;
  if (!Array.isArray(list)) return [];
  return list.map(normalizeTest).filter((test) => Number.isFinite(test.id));
}

export function extractTest(res: unknown): Test | null {
  const value = (res ?? {}) as Record<string, unknown>;
  if (!value.test) return null;
  const test = normalizeTest(value.test);
  return Number.isFinite(test.id) ? test : null;
}

export function formatTestCreatedAt(createdAt?: string): string | undefined {
  if (!createdAt) return undefined;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return createdAt;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function uniqueSortedIds(ids: number[]): number[] {
  return [...new Set(ids.filter((id) => Number.isFinite(id)))].sort((a, b) => a - b);
}
