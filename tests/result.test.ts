import { describe, expect, it } from 'vitest';
import { COMBINATION_TITLES } from '@/data/combinations';
import { PERSONALITIES } from '@/data/personalities';
import { resolveResult } from '@/lib/scoring/result';
import { aggregateAnswers } from '@/lib/scoring/answers';
import { PROGRESS_OPTIONS, QUESTIONS, START_OPTIONS } from '@/data/questions';
import { PERSONALITY_ANSWER_FIXTURES } from './answer-fixtures';

describe('result resolution', () => {
  it('can select every one of the 24 personalities with a deterministic fixture', () => {
    expect(PERSONALITIES).toHaveLength(24);
    for (const personality of PERSONALITIES) {
      const answers = PERSONALITY_ANSWER_FIXTURES[personality.code];
      expect(answers, `missing legal answer fixture for ${personality.code}`).toBeDefined();
      expect(PROGRESS_OPTIONS.some((option) => option.id === answers.q0), `illegal Q0 fixture for ${personality.code}`).toBe(true);
      expect(START_OPTIONS.some((option) => option.id === answers.start), `illegal start fixture for ${personality.code}`).toBe(true);
      for (const question of QUESTIONS) {
        expect(question.options.some((option) => option.id === answers[question.id]), `illegal ${question.id} fixture for ${personality.code}`).toBe(true);
      }
      const result = resolveResult(aggregateAnswers(answers));
      expect(result.primary.code, personality.code).toBe(personality.code);
      expect(result.secondary.family).not.toBe(result.primary.family);
    }
  });

  it('uses a named combination when the pair is configured and falls back safely', () => {
    expect(COMBINATION_TITLES['POOL+COMP']).toBe('池中焦虑体');
    const result = resolveResult({
      scores: { P: 15, A: 48, C: 22, I: 30, D: 10, S: 30, W: 90, M: 15, F: 68, O: 30 },
      tags: { POOLING: 2, COMPARISON: 3, STATUS_CHECK: 2, INFO_HUNT: 2 },
    });
    expect(result.primary.code).toBe('POOL');
    expect(result.secondary.code).toBe('COMP');
    expect(result.combinationTitle).toBe('池中焦虑体');
  });

  it('reaches POOL from a complete legal answer map instead of synthetic target data', () => {
    const result = resolveResult(aggregateAnswers(PERSONALITY_ANSWER_FIXTURES.POOL));
    expect(result.primary.code).toBe('POOL');
  });

  it('uses the actual pair for an unconfigured combination and HUMN keeps its special title', () => {
    const fallback = resolveResult({
      scores: { P: 38, A: 28, C: 20, I: 40, D: 30, S: 96, W: 70, M: 3, F: 25, O: 40 },
      tags: { HOLD_OFFER: 3 },
    });
    expect(COMBINATION_TITLES[`${fallback.primary.code}+${fallback.secondary.code}`]).toBeUndefined();
    expect(fallback.combinationTitle).toBe(`${fallback.primary.code} × ${fallback.secondary.code}`);
    const human = resolveResult({
      scores: { P: 35, A: 18, C: 12, I: 40, D: 30, S: 80, W: 86, M: 2, F: 20, O: 100 },
      tags: { SIGNED: 3, OFFER_RICH: 3 },
    });
    expect(human.primary.code).toBe('HUMN');
    expect(human.combinationTitle).toBe('已脱离秋招物种');
  });
});
