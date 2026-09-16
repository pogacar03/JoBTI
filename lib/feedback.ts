export interface FeedbackPlan {
  milestones: number[];
  shown: number[];
}

const MIN_MILESTONE = 5;
const MAX_MILESTONE = 29;
const MILESTONE_COUNT = 4;

function randomSeed(): number {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0];
  }
  return Math.floor(Math.random() * 0xffffffff);
}

export function createFeedbackSchedule(seed = randomSeed()): number[] {
  let state = (seed >>> 0) || 1;
  const candidates = Array.from({ length: MAX_MILESTONE - MIN_MILESTONE + 1 }, (_, index) => MIN_MILESTONE + index);
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    state = (1664525 * state + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
  }
  return candidates.slice(0, MILESTONE_COUNT).sort((left, right) => left - right);
}

export function shouldShowFeedback(plan: FeedbackPlan, answeredFormalCount: number): boolean {
  return plan.milestones.includes(answeredFormalCount) && !plan.shown.includes(answeredFormalCount);
}

export function markFeedbackShown(plan: FeedbackPlan, answeredFormalCount: number): FeedbackPlan {
  if (!shouldShowFeedback(plan, answeredFormalCount)) return plan;
  return { milestones: plan.milestones, shown: [...plan.shown, answeredFormalCount].sort((left, right) => left - right) };
}

export function isFeedbackSchedule(value: unknown): value is number[] {
  return Array.isArray(value)
    && value.length === MILESTONE_COUNT
    && new Set(value).size === MILESTONE_COUNT
    && value.every((milestone) => Number.isInteger(milestone) && milestone >= MIN_MILESTONE && milestone <= MAX_MILESTONE);
}
