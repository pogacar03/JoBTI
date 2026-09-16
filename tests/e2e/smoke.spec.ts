import { expect, test } from '@playwright/test';

test('home opens the quiz and a complete answer path reaches the report', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /测测秋招/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => window.innerWidth));
  await page.getByRole('link', { name: /开始秋招精神鉴定/ }).click();
  await expect(page.getByRole('heading', { name: /你现在处于秋招/ })).toBeVisible();

  await page.locator('section button').first().click();
  await expect(page.getByRole('heading', { name: /什么时候开始认真投秋招/ })).toBeVisible();
  await page.locator('section button').first().click();
  await expect(page.getByText('01 / 30')).toBeVisible();

  for (let index = 0; index < 30; index += 1) {
    await page.locator('section button').first().click();
  }

  await expect(page.getByText('正在生成秋招人格档案…')).toBeVisible();
  await expect(page.getByText('检测完成')).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: /查看我的 JOBTI/ }).click();
  await expect(page.getByText('分享你的档案')).toBeVisible();
  await expect(page.getByText(/匹配度/).first()).toBeVisible();
  const posterDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: /保存人格卡/ }).click();
  expect((await posterDownload).suggestedFilename()).toMatch(/^jobti-[a-z]+-report\.png$/);
});

test('partial answers survive a reload', async ({ page }) => {
  await page.goto('/quiz');
  await page.evaluate(() => { window.localStorage.clear(); window.sessionStorage.clear(); });
  await page.reload();
  await page.locator('section button').nth(1).click();
  await page.locator('section button').nth(2).click();
  await page.reload();
  await expect(page.getByText('01 / 30')).toBeVisible();
});
