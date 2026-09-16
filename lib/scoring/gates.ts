import type { AssessmentInput, GateRule } from './types';

function compare(actual: number, op: GateRule['op'], expected: number): boolean {
  if (op === 'gte') return actual >= expected;
  if (op === 'lte') return actual <= expected;
  return actual === expected;
}

export function evaluateGate(rule: GateRule, context: AssessmentInput): boolean {
  if (rule.kind === 'dimension') return compare(context.scores[rule.dimension], rule.op, rule.value);
  return compare(context.tags[rule.tag] ?? 0, rule.op, rule.value);
}

export function allGatesSatisfied(rules: GateRule[] | undefined, context: AssessmentInput): boolean {
  return (rules ?? []).every((rule) => evaluateGate(rule, context));
}
