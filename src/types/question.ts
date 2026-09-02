import { normalizeCategory, type Category } from "@/types/category";
import { normalizeTest, type Test } from "@/types/test";

export type Question = {
  questionId: number;
  questionNumber: number;
  questionText: string;
  category?: Category;
  categoryId?: number;
  test?: Test;
};

export type QuestionPayload = {
  questionNumber?: number;
  questionText?: string;
  categoryId?: number;
};

export function parseQuestionNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const number = Number(trimmed);
  if (!Number.isInteger(number) || number < 1) return null;
  return number;
}

export function questionCategoryId(question: Pick<Question, "categoryId" | "category">): number | undefined {
  const id = question.categoryId ?? question.category?.categoryId;
  return Number.isFinite(id) ? Number(id) : undefined;
}

export function nextQuestionNumber(questions: Pick<Question, "questionNumber">[]): number {
  if (questions.length === 0) return 1;
  return Math.max(...questions.map((item) => item.questionNumber)) + 1;
}

export function sortQuestions(list: Question[]): Question[] {
  return [...list].sort((a, b) => {
    const numberRank = a.questionNumber - b.questionNumber;
    if (numberRank !== 0) return numberRank;
    return a.questionId - b.questionId;
  });
}

export function normalizeQuestion(raw: unknown): Question {
  const value = (raw ?? {}) as Record<string, unknown>;
  const category = value.category ? normalizeCategory(value.category) : undefined;
  const test = value.test ? normalizeTest(value.test) : undefined;
  const categoryId = value.categoryId ?? category?.categoryId;

  return {
    questionId: Number(value.questionId ?? value.id),
    questionNumber: Number(value.questionNumber),
    questionText: String(value.questionText ?? ""),
    category: category && Number.isFinite(category.categoryId) ? category : undefined,
    categoryId: categoryId != null && Number.isFinite(Number(categoryId)) ? Number(categoryId) : undefined,
    test: test && Number.isFinite(test.id) ? test : undefined,
  };
}

export function extractQuestion(res: unknown): Question | null {
  const value = (res ?? {}) as Record<string, unknown>;
  if (!value.question) return null;
  const question = normalizeQuestion(value.question);
  return Number.isFinite(question.questionId) ? question : null;
}

export function extractQuestions(res: unknown): Question[] {
  const value = (res ?? {}) as Record<string, unknown>;
  const list = value.questions;
  if (!Array.isArray(list)) return [];
  return list.map(normalizeQuestion).filter((item) => Number.isFinite(item.questionId));
}

export function mergeQuestion(previous: Question, next: Question): Question {
  return {
    ...previous,
    ...next,
    category: next.category ?? previous.category,
    test: next.test ?? previous.test,
    categoryId: next.categoryId ?? previous.categoryId ?? next.category?.categoryId ?? previous.category?.categoryId,
  };
}
