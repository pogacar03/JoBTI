import { describe, expect, it } from 'vitest';
import { scorePersonality } from '@/lib/scoring/personality-score';
import type { Personality } from '@/lib/scoring/types';

const sample: Personality = {
  code: 'TEST',
  name: '测试人格',
  family: 'MENTAL',
  rarity: 'COMMON',
  targetVector: { P: 50, A: 50, C: 50, I: 50, D: 50, S: 50, W: 50, M: 50, F: 50, O: 50 },
  dimensionWeights: { A: 2 },
  tagProfile: { COMPARISON: 2 },
  gates: [{ kind: 'dimension', dimension: 'O', op: 'gte', value: 40 }],
  bonusRules: [{ when: { kind: 'tag', tag: 'COMPARISON', op: 'gte', value: 3 }, amount: 4 }],
  tagline: '测试',
  description: '测试',
  symptoms: ['测试'],
  catchphrase: '测试',
  strength: '测试',
  weakness: '测试',
  enemy: '测试',
  diagnosis: '测试',
  shareText: '测试',
};

describe('personality score', () => {
  it('combines weighted vector similarity, tag match, and bonus', () => {
    const result = scorePersonality(
      sample,
      { P: 50, A: 50, C: 50, I: 50, D: 50, S: 50, W: 50, M: 50, F: 50, O: 50 },
      { COMPARISON: 3 },
    );

    expect(result.eligible).toBe(true);
    expect(result.vectorSimilarity).toBe(100);
    expect(result.tagMatch).toBe(100);
    expect(result.bonus).toBe(4);
    expect(result.total).toBe(104);
  });

  it('marks a hard-gated personality ineligible instead of scoring it', () => {
    const result = scorePersonality(
      sample,
      { P: 50, A: 50, C: 50, I: 50, D: 50, S: 50, W: 50, M: 50, F: 50, O: 20 },
      { COMPARISON: 3 },
    );

    expect(result.eligible).toBe(false);
    expect(result.total).toBe(0);
  });
});
