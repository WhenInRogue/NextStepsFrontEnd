export type Test = {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
};

export type TestPayload = {
  name?: string;
  description?: string;
};

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
  return {
    id: Number(value.id ?? value.testId),
    name: String(value.name ?? ""),
    description: typeof value.description === "string" ? value.description : undefined,
    createdAt: normalizeDateTime(value.createdAt),
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
