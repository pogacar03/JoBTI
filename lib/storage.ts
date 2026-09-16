import { z } from 'zod';
import { PROGRESS_OPTIONS, QUESTIONS, START_OPTIONS } from '@/data/questions';
import { createFeedbackSchedule, isFeedbackSchedule } from './feedback';

export const QuizStateSchema = z.object({
  version: z.literal(1),
  answers: z.record(z.string(), z.string()),
  updatedAt: z.number().optional(),
  complete: z.boolean().optional(),
  feedbackMilestones: z.array(z.number().int().min(5).max(29)).optional(),
  feedbackShown: z.array(z.number().int().min(5).max(29)).optional(),
});

export type QuizState = z.infer<typeof QuizStateSchema>;

export function createEmptyQuizState(): QuizState {
  return { version: 1, answers: {}, updatedAt: Date.now(), complete: false, feedbackMilestones: createFeedbackSchedule(), feedbackShown: [] };
}

export function ensureFeedbackPlan(state: QuizState): QuizState {
  if (isFeedbackSchedule(state.feedbackMilestones)) {
    const shown = [...new Set(state.feedbackShown ?? [])]
      .filter((milestone) => state.feedbackMilestones?.includes(milestone))
      .sort((left, right) => left - right);
    return { ...state, feedbackShown: shown };
  }
  return { ...state, feedbackMilestones: createFeedbackSchedule(), feedbackShown: [] };
}

export function parseQuizState(value: string | null | undefined): QuizState | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    const result = QuizStateSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function isQuizComplete(state: QuizState): boolean {
  if (state.complete !== true) return false;
  if (!PROGRESS_OPTIONS.some((option) => option.id === state.answers.q0)) return false;
  if (!START_OPTIONS.some((option) => option.id === state.answers.start)) return false;
  return QUESTIONS.every((question) => question.options.some((option) => option.id === state.answers[question.id]));
}

export const QUIZ_STORAGE_KEY = 'jobti-quiz-state-v1';

export function readQuizState(): QuizState {
  if (typeof window === 'undefined') return createEmptyQuizState();
  const sessionState = parseQuizState(window.sessionStorage.getItem(QUIZ_STORAGE_KEY));
  const localState = parseQuizState(window.localStorage.getItem(QUIZ_STORAGE_KEY));
  if (!sessionState) return localState ?? createEmptyQuizState();
  if (!localState) return sessionState;
  return (localState.updatedAt ?? 0) > (sessionState.updatedAt ?? 0) ? localState : sessionState;
}

export function writeQuizState(state: QuizState): void {
  if (typeof window === 'undefined') return;
  const serialized = JSON.stringify({ ...state, updatedAt: Date.now() });
  window.sessionStorage.setItem(QUIZ_STORAGE_KEY, serialized);
  window.localStorage.setItem(QUIZ_STORAGE_KEY, serialized);
}

export function clearQuizState(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(QUIZ_STORAGE_KEY);
  window.localStorage.removeItem(QUIZ_STORAGE_KEY);
}

export function clearCompletedQuizState(): boolean {
  const state = readQuizState();
  if (!isQuizComplete(state)) return false;
  clearQuizState();
  return true;
}
