import { COMBINATION_TITLES } from '@/data/combinations';
import { PERSONALITIES } from '@/data/personalities';
import { scorePersonality } from './personality-score';
import { clampDimensionScores } from './dimensions';
import type { AssessmentInput, Personality, PersonalityScore, ResolvedResult } from './types';

function rankPersonality(personality: Personality, scores: AssessmentInput['scores'], tags: AssessmentInput['tags']): PersonalityScore {
  return scorePersonality(personality, scores, tags);
}

export function resolveResult(input: AssessmentInput): ResolvedResult {
  const normalizedScores = clampDimensionScores(input.scores);
  const scored = PERSONALITIES.map((personality) => ({
    personality,
    score: rankPersonality(personality, normalizedScores, input.tags),
  }));
  const eligible = scored.filter(({ score }) => score.eligible);
  const ranked = (eligible.length > 0 ? eligible : scored).sort((left, right) => {
    if (right.score.total !== left.score.total) return right.score.total - left.score.total;
    return left.personality.code.localeCompare(right.personality.code);
  });
  const primaryEntry = ranked[0];
  const secondaryEntry = ranked.find(({ personality }) => personality.family !== primaryEntry.personality.family)
    ?? scored.filter(({ personality }) => personality.family !== primaryEntry.personality.family).sort((left, right) => right.score.total - left.score.total)[0]
    ?? ranked[1]
    ?? primaryEntry;
  const pairKey = `${primaryEntry.personality.code}+${secondaryEntry.personality.code}`;
  const combinationTitle = primaryEntry.personality.code === 'HUMN' ? '已脱离秋招物种' : COMBINATION_TITLES[pairKey] ?? `${primaryEntry.personality.code} × ${secondaryEntry.personality.code}`;

  return {
    primary: primaryEntry.personality,
    secondary: secondaryEntry.personality,
    primaryScore: primaryEntry.score,
    secondaryScore: secondaryEntry.score,
    combinationTitle,
    normalizedScores,
    tags: input.tags,
  };
}
