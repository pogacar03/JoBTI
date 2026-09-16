import { allGatesSatisfied, evaluateGate } from './gates';
import type { AssessmentInput, DimensionScores, Personality, PersonalityScore, TagScores } from './types';

function weightedVectorSimilarity(personality: Personality, scores: DimensionScores): number {
  const entries = Object.entries(personality.targetVector) as [keyof DimensionScores, number][];
  let distance = 0;
  let weightTotal = 0;
  for (const [dimension, target] of entries) {
    const weight = personality.dimensionWeights[dimension] ?? 1;
    distance += Math.abs(scores[dimension] - target) * weight;
    weightTotal += 100 * weight;
  }
  return weightTotal === 0 ? 0 : Math.max(0, Math.min(100, 100 - (distance / weightTotal) * 100));
}

function tagMatch(personality: Personality, tags: TagScores): number {
  const profile = Object.entries(personality.tagProfile ?? {}) as [keyof TagScores, number][];
  if (profile.length === 0) return 0;
  const totalTarget = profile.reduce((sum, [, target]) => sum + Math.max(0, target), 0);
  if (totalTarget === 0) return 0;
  const matched = profile.reduce((sum, [tag, target]) => sum + Math.min(Math.max(0, tags[tag] ?? 0), Math.max(0, target)), 0);
  return Math.max(0, Math.min(100, (matched / totalTarget) * 100));
}

export function scorePersonality(personality: Personality, scores: DimensionScores, tags: TagScores): PersonalityScore {
  const context: AssessmentInput = { scores, tags };
  if (!allGatesSatisfied(personality.gates, context)) {
    return { code: personality.code, eligible: false, vectorSimilarity: 0, tagMatch: 0, bonus: 0, total: 0 };
  }

  const vectorSimilarity = weightedVectorSimilarity(personality, scores);
  const matchedTags = tagMatch(personality, tags);
  const bonus = (personality.bonusRules ?? []).reduce((sum, rule) => sum + (evaluateGate(rule.when, context) ? rule.amount : 0), 0);
  const total = vectorSimilarity * 0.7 + matchedTags * 0.3 + bonus;
  return {
    code: personality.code,
    eligible: true,
    vectorSimilarity: Math.round(vectorSimilarity * 100) / 100,
    tagMatch: Math.round(matchedTags * 100) / 100,
    bonus: Math.round(bonus * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}
