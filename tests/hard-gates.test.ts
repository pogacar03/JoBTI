import { describe, expect, it } from 'vitest';
import { evaluateGate, allGatesSatisfied } from '@/lib/scoring/gates';

describe('hard gates', () => {
  it('evaluates dimension and tag rules with gte, lte, and eq', () => {
    const context = {
      scores: { P: 80, A: 20, C: 10, I: 50, D: 30, S: 60, W: 80, M: 1, F: 20, O: 95 },
      tags: { OFFER_RICH: 2, SIGNED: 0 },
    };

    expect(evaluateGate({ kind: 'dimension', dimension: 'O', op: 'gte', value: 90 }, context)).toBe(true);
    expect(evaluateGate({ kind: 'dimension', dimension: 'A', op: 'lte', value: 25 }, context)).toBe(true);
    expect(evaluateGate({ kind: 'dimension', dimension: 'O', op: 'eq', value: 95 }, context)).toBe(true);
    expect(evaluateGate({ kind: 'tag', tag: 'OFFER_RICH', op: 'gte', value: 2 }, context)).toBe(true);
    expect(evaluateGate({ kind: 'tag', tag: 'SIGNED', op: 'gte', value: 1 }, context)).toBe(false);
  });

  it('requires every hard gate before a personality is eligible', () => {
    const context = {
      scores: { P: 80, A: 20, C: 10, I: 50, D: 30, S: 60, W: 80, M: 1, F: 20, O: 95 },
      tags: { OFFER_RICH: 2, SIGNED: 0 },
    };
    const gates = [
      { kind: 'dimension', dimension: 'O', op: 'gte', value: 90 } as const,
      { kind: 'tag', tag: 'OFFER_RICH', op: 'gte', value: 2 } as const,
    ];

    expect(allGatesSatisfied(gates, context)).toBe(true);
    expect(allGatesSatisfied([...gates, { kind: 'tag', tag: 'SIGNED', op: 'gte', value: 1 }], context)).toBe(false);
  });
});
