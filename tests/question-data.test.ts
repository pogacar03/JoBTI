import { describe, expect, it } from 'vitest';
import { PROGRESS_OPTIONS, QUESTIONS, START_OPTIONS } from '@/data/questions';
import { aggregateAnswers } from '@/lib/scoring/answers';

describe('default v1 question data', () => {
  it('contains 30 real four-choice questions with bounded dimension increments', () => {
    expect(QUESTIONS).toHaveLength(30);
    for (const question of QUESTIONS) {
      expect(question.options).toHaveLength(4);
      for (const option of question.options) {
        for (const value of Object.values(option.delta)) expect(value).toBeGreaterThanOrEqual(0);
        for (const value of Object.values(option.delta)) expect(value).toBeLessThanOrEqual(3);
        for (const value of Object.values(option.tagDelta ?? {})) expect(value).toBeGreaterThanOrEqual(0);
        for (const value of Object.values(option.tagDelta ?? {})) expect(value).toBeLessThanOrEqual(3);
      }
    }
  });

  it('keeps Q0 as the current-result dimension and normalizes a complete answer set', () => {
    const answers: Record<string, string> = { q0: PROGRESS_OPTIONS[6].id, start: START_OPTIONS[3].id };
    for (const question of QUESTIONS) answers[question.id] = question.options[3].id;
    const assessment = aggregateAnswers(answers);
    expect(assessment.scores.O).toBe(100);
    for (const value of Object.values(assessment.scores)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
    expect((assessment.tags.SIGNED ?? 0)).toBeGreaterThan(0);
    expect((assessment.tags.LATE_START ?? 0)).toBeGreaterThan(0);
  });
});
