import { describe, expect, it } from 'vitest';
import { DIMENSIONS, normalizeDimensionScores } from '@/lib/scoring/dimensions';

describe('dimension normalization', () => {
  it('normalizes each raw dimension independently to 0–100', () => {
    const normalized = normalizeDimensionScores(
      { P: 12, A: 3, C: 0, I: 7, D: 5, S: 2, W: 8, M: 1, F: 9, O: 60 },
      { P: 24, A: 6, C: 0, I: 14, D: 10, S: 4, W: 8, M: 2, F: 18, O: 100 },
    );

    expect(normalized.P).toBe(50);
    expect(normalized.A).toBe(50);
    expect(normalized.C).toBe(0);
    expect(normalized.I).toBe(50);
    expect(normalized.W).toBe(100);
    expect(normalized.O).toBe(60);
    expect(Object.keys(normalized)).toEqual([...DIMENSIONS]);
  });

  it('clamps malformed values and avoids division by zero', () => {
    const normalized = normalizeDimensionScores(
      { P: -2, A: 999, C: 3, I: 0, D: 0, S: 0, W: 0, M: 0, F: 0, O: 0 },
      { P: 0, A: 0, C: 1, I: 0, D: 0, S: 0, W: 0, M: 0, F: 0, O: 0 },
    );

    expect(normalized.P).toBe(0);
    expect(normalized.A).toBe(100);
    expect(normalized.C).toBe(100);
    expect(normalized.I).toBe(0);
  });
});
