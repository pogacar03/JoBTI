export const PREVIEW_CODES = ['POOL', 'KING', 'HUMN'] as const;
export type PreviewCode = (typeof PREVIEW_CODES)[number];

export function createPreviewOrder(seed = Math.floor(Math.random() * 0xffffffff)): PreviewCode[] {
  const order = [...PREVIEW_CODES];
  let state = (seed >>> 0) || 1;
  for (let index = order.length - 1; index > 0; index -= 1) {
    state = (1664525 * state + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
  }
  return order;
}
