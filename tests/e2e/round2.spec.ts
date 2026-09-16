import { expect, test } from '@playwright/test';

test('server-rendered home preview is not fixed to POOL on the first frame', async ({ request }) => {
  const seen = new Set<string>();
  for (let index = 0; index < 12; index += 1) {
    const response = await request.get(`/?preview-check=${index}`);
    expect(response.ok()).toBe(true);
    const html = await response.text();
    const code = html.match(/data-preview-code="(POOL|KING|HUMN)"/)?.[1];
    expect(code, 'the first server-rendered card should expose one of the three previews').toBeTruthy();
    seen.add(code as string);
  }
  expect(seen.size).toBeGreaterThan(1);
});

test('the hydrated card keeps the server-selected first preview', async ({ page }) => {
  const response = await page.goto('/?preview-check=hydration');
  const html = await response?.text();
  const serverCode = html?.match(/data-preview-code="(POOL|KING|HUMN)"/)?.[1];
  expect(serverCode).toBeTruthy();
  await expect(page.locator('[data-preview-code]')).toHaveAttribute('data-preview-code', serverCode as string);
});
