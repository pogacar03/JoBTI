import { describe, expect, it } from 'vitest';
import { QUESTIONS } from '@/data/questions';
import {
  QUIZ_STORAGE_KEY,
  QuizStateSchema,
  createEmptyQuizState,
  ensureFeedbackPlan,
  isQuizComplete,
  parseQuizState,
  readQuizState,
} from '@/lib/storage';

function legalAnswers(): Record<string, string> {
  const answers: Record<string, string> = { q0: 'progress-3', start: 'month-9' };
  for (const question of QUESTIONS) answers[question.id] = question.options[0].id;
  return answers;
}

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe('quiz state persistence', () => {
  it('round-trips a versioned, partial answer state safely', () => {
    const state = createEmptyQuizState();
    state.answers.q0 = 'progress-3';
    state.answers.start = 'month-9';
    state.feedbackMilestones = [7, 13, 22, 28];
    state.feedbackShown = [7];
    const parsed = parseQuizState(JSON.stringify(state));
    if (!parsed) throw new Error('expected a valid quiz state');
    expect(parsed.answers).toEqual(state.answers);
    expect(parsed.feedbackMilestones).toEqual([7, 13, 22, 28]);
    expect(parsed.feedbackShown).toEqual([7]);
    expect(QuizStateSchema.parse(parsed).version).toBe(1);
  });

  it('rejects malformed storage instead of crashing the quiz', () => {
    expect(parseQuizState('{"answers":null}')).toBeNull();
    expect(parseQuizState('not-json')).toBeNull();
  });

  it('preserves one random plan across restore and removes duplicate shown milestones', () => {
    const state = createEmptyQuizState();
    state.feedbackMilestones = [6, 12, 21, 29];
    state.feedbackShown = [12, 12, 7];
    const restored = ensureFeedbackPlan(parseQuizState(JSON.stringify(state))!);
    expect(restored.feedbackMilestones).toEqual([6, 12, 21, 29]);
    expect(restored.feedbackShown).toEqual([12]);
    const returned = ensureFeedbackPlan(restored);
    expect(returned.feedbackMilestones).toEqual(restored.feedbackMilestones);
    expect(returned.feedbackShown).toEqual(restored.feedbackShown);
  });

  it('only treats a complete state as complete when every answer is legal', () => {
    const answers = legalAnswers();
    expect(isQuizComplete({ version: 1, answers, complete: true })).toBe(true);
    expect(isQuizComplete({ version: 1, answers, complete: false })).toBe(false);

    const { q30: _missing, ...missingLastAnswer } = answers;
    expect(isQuizComplete({ version: 1, answers: missingLastAnswer, complete: true })).toBe(false);
    expect(isQuizComplete({ version: 1, answers: { ...answers, q01: 'not-a-real-option' }, complete: true })).toBe(false);
  });

  it('restores the newest valid record when session and local storage diverge', () => {
    const previousWindow = (globalThis as { window?: unknown }).window;
    const sessionStorage = new MemoryStorage();
    const localStorage = new MemoryStorage();
    (globalThis as { window?: unknown }).window = { sessionStorage, localStorage };

    try {
      sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify({ version: 1, answers: { q0: 'progress-0' }, updatedAt: 10 }));
      localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify({ version: 1, answers: { q0: 'progress-1' }, updatedAt: 20 }));
      expect(readQuizState().answers.q0).toBe('progress-1');
    } finally {
      if (previousWindow === undefined) delete (globalThis as { window?: unknown }).window;
      else (globalThis as { window?: unknown }).window = previousWindow;
    }
  });
});
