import { describe, expect, it } from 'vitest';
import { createFeedbackSchedule, shouldShowFeedback } from '@/lib/feedback';

describe('feedback schedule', () => {
  it('creates four distinct persisted answer milestones from a seed', () => {
    const first = createFeedbackSchedule(17);
    const second = createFeedbackSchedule(17);
    expect(first).toEqual(second);
    expect(first).toHaveLength(4);
    expect(new Set(first).size).toBe(4);
    expect(first.every((milestone) => milestone >= 5 && milestone <= 29)).toBe(true);
  });

  it('does not show a milestone twice after it is marked shown', () => {
    const schedule = { milestones: [7, 13, 22, 28], shown: [7] };
    expect(shouldShowFeedback(schedule, 7)).toBe(false);
    expect(shouldShowFeedback(schedule, 13)).toBe(true);
  });
});
