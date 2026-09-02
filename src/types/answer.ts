import { normalizeQuestion, type Question } from "@/types/question";

export const MIN_RESPONSE = 0;
export const MAX_RESPONSE = 4;

export const RESPONSE_OPTIONS = [
  { value: 0, label: "Never" },
  { value: 1, label: "Rarely" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
  { value: 4, label: "Almost always" },
] as const;

export type Answer = {
  answerId: number;
  responseValue: number;
  questionId?: number;
  question?: Question;
};

export type AnswerPayload = {
  questionId: number;
  responseValue: number;
};

export function isResponseValue(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= MIN_RESPONSE && value <= MAX_RESPONSE;
}

export function answerQuestionId(answer: Pick<Answer, "questionId" | "question">): number | undefined {
  const id = answer.questionId ?? answer.question?.questionId;
  return Number.isFinite(id) ? Number(id) : undefined;
}

export function normalizeAnswer(raw: unknown): Answer {
  const value = (raw ?? {}) as Record<string, unknown>;
  const question = value.question ? normalizeQuestion(value.question) : undefined;
  const questionId = value.questionId ?? question?.questionId;
  return {
    answerId: Number(value.answerId ?? value.id),
    responseValue: Number(value.responseValue),
    question: question && Number.isFinite(question.questionId) ? question : undefined,
    questionId: questionId != null && Number.isFinite(Number(questionId)) ? Number(questionId) : undefined,
  };
}

export function extractAnswer(res: unknown): Answer | null {
  const value = (res ?? {}) as Record<string, unknown>;
  if (!value.answer) return null;
  const answer = normalizeAnswer(value.answer);
  return Number.isFinite(answer.answerId) ? answer : null;
}

export function extractAnswers(res: unknown): Answer[] {
  const value = (res ?? {}) as Record<string, unknown>;
  const list = value.answers;
  if (!Array.isArray(list)) return [];
  return list.map(normalizeAnswer).filter((item) => Number.isFinite(item.answerId));
}

export function answersByQuestionId(answers: Answer[]): Record<number, number> {
  const map: Record<number, number> = {};
  answers.forEach((answer) => {
    const questionId = answerQuestionId(answer);
    if (questionId != null && isResponseValue(answer.responseValue)) {
      map[questionId] = answer.responseValue;
    }
  });
  return map;
}
