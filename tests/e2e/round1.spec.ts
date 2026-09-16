import fs from 'node:fs';
import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';

async function seedCompleteState(page: import('@playwright/test').Page) {
  await page.goto('/quiz');
  await page.evaluate(() => {
    const answers = {
      q0: 'progress-3',
      start: 'month-9',
      ...Object.fromEntries(Array.from({ length: 30 }, (_, index) => [`q${String(index + 1).padStart(2, '0')}`, `q${String(index + 1).padStart(2, '0')}-a`])),
    };
    const state = { version: 1, answers, complete: true, feedbackMilestones: [7, 13, 22, 28], feedbackShown: [7, 13, 22, 28] };
    window.localStorage.setItem('jobti-quiz-state-v1', JSON.stringify(state));
    window.sessionStorage.setItem('jobti-quiz-state-v1', JSON.stringify(state));
  });
  await page.goto('/result');
  await expect(page.getByText('正在生成秋招人格档案…')).toBeVisible();
  await expect(page.getByText('检测完成')).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: /查看我的 JOBTI/ }).click();
}

test('core calls to action have visible vermilion contrast', async ({ page }) => {
  await page.goto('/');
  const homeCta = page.getByRole('link', { name: /开始秋招精神鉴定/ });
  expect(await homeCta.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe('rgb(200, 81, 54)');
  expect(await homeCta.evaluate((element) => getComputedStyle(element).color)).toBe('rgb(244, 239, 229)');

  await seedCompleteState(page);
  const saveButton = page.getByRole('button', { name: /保存人格卡/ });
  expect(await saveButton.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe('rgb(200, 81, 54)');
  await page.getByRole('button', { name: /重新测试/ }).click();
  await expect(page.getByRole('heading', { name: /你现在处于秋招/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /← 返回/ })).toBeDisabled();
});

test('home headline describes the result as a personality', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '测测秋招 把你变成了 什么人格。' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /什么东西/ })).toHaveCount(0);
});

test('downloaded poster is a non-empty 1080×1920 PNG', async ({ page }) => {
  await seedCompleteState(page);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: /保存人格卡/ }).click();
  const download = await downloadEvent;
  const filePath = await download.path();
  expect(filePath).toBeTruthy();
  const png = PNG.sync.read(fs.readFileSync(filePath as string));
  expect(png.width).toBe(1080);
  expect(png.height).toBe(1920);
  const colors = new Set<string>();
  let nonPaperPixels = 0;
  for (let offset = 0; offset < png.data.length; offset += 4) {
    const color = `${png.data[offset]}-${png.data[offset + 1]}-${png.data[offset + 2]}-${png.data[offset + 3]}`;
    colors.add(color);
    if (color !== '244-239-229-255') nonPaperPixels += 1;
  }
  expect(colors.size).toBeGreaterThan(10);
  expect(nonPaperPixels).toBeGreaterThan(10_000);
});

test('desktop view keeps CTA inside common first-screen heights', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1366, height: 768 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const box = await page.getByRole('link', { name: /开始秋招精神鉴定/ }).boundingBox();
    expect(box).not.toBeNull();
    expect((box?.y ?? Infinity) + (box?.height ?? Infinity)).toBeLessThanOrEqual(viewport.height);
  }
});

test('keyboard answer advance focuses and announces the new question', async ({ page }) => {
  await page.goto('/quiz');
  await expect(page.getByRole('heading', { name: /你现在处于秋招/ })).toBeVisible();
  const firstOption = page.locator('section button').first();
  await firstOption.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: /什么时候开始认真投秋招/ })).toBeVisible();
  await expect(page.locator('#question-title')).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByText('01 / 30')).toBeVisible();
  await expect(page.locator('#question-title')).toBeFocused();
});

test('feedback milestones are random once, then persist across back and resume', async ({ page }) => {
  await page.goto('/quiz');
  await page.evaluate(() => { window.localStorage.clear(); window.sessionStorage.clear(); });
  await page.reload();
  await expect(page.getByRole('heading', { name: /你现在处于秋招/ })).toBeVisible();

  const readFeedbackState = () => page.evaluate(() => {
    const raw = window.localStorage.getItem('jobti-quiz-state-v1');
    return raw ? JSON.parse(raw) as { feedbackMilestones?: number[]; feedbackShown?: number[] } : null;
  });
  const initial = await readFeedbackState();
  expect(initial?.feedbackMilestones).toHaveLength(4);
  expect(new Set(initial?.feedbackMilestones).size).toBe(4);

  await page.locator('section button').first().click();
  await page.locator('section button').first().click();
  await page.locator('section button').first().click();
  const beforeBack = await readFeedbackState();
  await page.getByRole('button', { name: /← 返回/ }).click();
  const afterBack = await readFeedbackState();
  expect(afterBack?.feedbackMilestones).toEqual(beforeBack?.feedbackMilestones);
  expect(afterBack?.feedbackShown).toEqual(beforeBack?.feedbackShown);
  await page.locator('section button').first().click();
  for (let index = 2; index <= 30; index += 1) await page.locator('section button').first().click();

  await expect(page).toHaveURL(/\/result$/);
  const completed = await readFeedbackState();
  expect(completed?.feedbackMilestones).toEqual(initial?.feedbackMilestones);
  expect(completed?.feedbackShown).toHaveLength(4);
  expect(new Set(completed?.feedbackShown).size).toBe(4);
  await page.goto('/quiz');
  await expect(page).toHaveURL(/\/result$/);
  const resumed = await readFeedbackState();
  expect(resumed?.feedbackMilestones).toEqual(completed?.feedbackMilestones);
  expect(resumed?.feedbackShown).toEqual(completed?.feedbackShown);
});
