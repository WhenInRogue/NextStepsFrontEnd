import { normalizeAnswer, type Answer } from "@/types/answer";
import { extractCategoryScores, normalizeCategoryScore, type CategoryScore } from "@/types/category-score";
import { extractQuestions, type Question } from "@/types/question";
import { normalizeDateTime, normalizeTest, type Test } from "@/types/test";
import { normalizeUser, type User } from "@/types/user";

export type TestResult = {
  testResultId: number;
  complete: boolean;
  completedAt?: string;
  test?: Test;
  user?: User;
  answers?: Answer[];
  categoryScores?: CategoryScore[];
};

export function isTestResultComplete(result: Pick<TestResult, "complete">): boolean {
  return result.complete === true;
}

export function resultTestId(result: Pick<TestResult, "test">): number | undefined {
  const id = result.test?.id;
  return Number.isFinite(id) ? Number(id) : undefined;
}

export function normalizeTestResult(raw: unknown): TestResult {
  const value = (raw ?? {}) as Record<string, unknown>;
  const user = value.user ? normalizeUser(value.user) : undefined;
  const test = value.test ? normalizeTest(value.test) : undefined;
  const answers = Array.isArray(value.answers) ? value.answers.map(normalizeAnswer).filter((item) => Number.isFinite(item.answerId)) : undefined;
  const categoryScores = Array.isArray(value.categoryScores)
    ? value.categoryScores.map(normalizeCategoryScore).filter((item) => Number.isFinite(item.categoryScoreId) || item.category)
    : undefined;

  return {
    testResultId: Number(value.testResultId ?? value.id),
    complete: value.complete === true,
    completedAt: normalizeDateTime(value.completedAt),
    user: user && Number.isFinite(user.id) ? user : undefined,
    test: test && Number.isFinite(test.id) ? test : undefined,
    answers,
    categoryScores,
  };
}

export function extractTestResult(res: unknown): TestResult | null {
  const value = (res ?? {}) as Record<string, unknown>;
  if (!value.testResult) return null;
  const result = normalizeTestResult(value.testResult);
  return Number.isFinite(result.testResultId) ? result : null;
}

export function extractTestResults(res: unknown): TestResult[] {
  const value = (res ?? {}) as Record<string, unknown>;
  const list = value.testResults;
  if (!Array.isArray(list)) return [];
  return list.map(normalizeTestResult).filter((item) => Number.isFinite(item.testResultId));
}

export function extractTakeSession(res: unknown): { testResult: TestResult; questions: Question[] } | null {
  const testResult = extractTestResult(res);
  if (!testResult) return null;
  return {
    testResult,
    questions: extractQuestions(res),
  };
}

export function extractSubmittedResult(res: unknown): { testResult: TestResult; categoryScores: CategoryScore[] } | null {
  const testResult = extractTestResult(res);
  if (!testResult) return null;
  const fromResponse = extractCategoryScores(res);
  const scores = fromResponse.length > 0 ? fromResponse : testResult.categoryScores ?? [];
  return { testResult, categoryScores: scores };
}

export function latestResultForTest(results: TestResult[], testId: number): TestResult | undefined {
  return results.find((result) => resultTestId(result) === testId);
}

export function incompleteResultForTest(results: TestResult[], testId: number): TestResult | undefined {
  return results.find((result) => resultTestId(result) === testId && !isTestResultComplete(result));
}

export function latestCompletedResultForTest(results: TestResult[], testId: number): TestResult | undefined {
  return results.find((result) => resultTestId(result) === testId && isTestResultComplete(result));
}

/** Newest completed attempt per test. Expects results already newest-first. */
export function latestCompletedResultsByTest(results: TestResult[]): TestResult[] {
  const seen = new Set<number>();
  const latest: TestResult[] = [];
  for (const result of results) {
    if (!isTestResultComplete(result)) continue;
    const testId = resultTestId(result);
    if (testId == null || seen.has(testId)) continue;
    seen.add(testId);
    latest.push(result);
  }
  return latest;
}

export function hasCompletedTest(results: TestResult[], testId: number): boolean {
  return results.some((result) => resultTestId(result) === testId && isTestResultComplete(result));
}

export function formatCompletedAt(completedAt?: string): string | undefined {
  if (!completedAt) return undefined;
  const date = new Date(completedAt);
  if (Number.isNaN(date.getTime())) return completedAt;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
