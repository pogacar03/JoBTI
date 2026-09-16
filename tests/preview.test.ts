import { describe, expect, it } from 'vitest';
import { PREVIEW_CODES, createPreviewOrder } from '@/lib/preview';

describe('home preview rotation', () => {
  it('only uses POOL, KING, HUMN and avoids an immediate repeat', () => {
    const order = createPreviewOrder(42);
    expect(order).toHaveLength(3);
    expect(order.every((code) => PREVIEW_CODES.includes(code))).toBe(true);
    expect(new Set(order).size).toBe(3);
    expect(order[0]).not.toBe(order[order.length - 1]);
  });

  it('can produce different first previews for different seeds', () => {
    expect(createPreviewOrder(1)[0]).not.toBe(createPreviewOrder(2)[0]);
  });
});
