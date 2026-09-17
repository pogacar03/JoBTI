import { expect, test } from '@playwright/test';

test('personality gallery exposes the character archive', async ({ page }) => {
  await page.goto('/gallery');
  await expect(page.getByRole('heading', { name: /JOBTI 人物图鉴/ })).toBeVisible();
  await expect(page.locator('[data-gallery-card]')).toHaveCount(24);
  await expect(page.locator('[data-gallery-card="HUMN"] img')).toBeVisible();
});

test('gallery artwork fills the shared card frame', async ({ page }) => {
  await page.goto('/gallery');
  for (const code of ['BARG', 'POOL']) {
    const image = page.locator(`[data-gallery-card="${code}"] img`);
    await expect(image).toBeVisible();
    expect(await image.evaluate((element) => getComputedStyle(element).objectFit)).toBe('cover');
  }
});

test('a qualifying answer pattern reveals a hidden branch after the mainline', async ({ page }) => {
  await page.goto('/quiz');
  await page.evaluate(() => {
    const answers: Record<string, string> = { q0: 'progress-3', start: 'month-9', q05: 'q05-c' };
    for (let index = 1; index <= 29; index += 1) {
      const id = `q${String(index).padStart(2, '0')}`;
      if (!answers[id]) answers[id] = `${id}-a`;
    }
    const state = { version: 1, answers, complete: false, feedbackMilestones: [7, 13, 22, 28], feedbackShown: [] };
    window.localStorage.setItem('jobti-quiz-state-v1', JSON.stringify(state));
    window.sessionStorage.setItem('jobti-quiz-state-v1', JSON.stringify(state));
  });
  await page.goto('/quiz');
  await expect(page.getByRole('heading', { name: /如果秋招是一种天气/ })).toBeVisible();
  await page.getByRole('button', { name: /晴天：按计划走就行/ }).click();
  await expect(page.getByText('隐藏支线')).toBeVisible();
  await expect(page.getByRole('heading', { name: /招聘网站连续三天没动静/ })).toBeVisible();
});
