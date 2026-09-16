import { expect, test } from '@playwright/test';

function writeState(page: import('@playwright/test').Page, state: unknown) {
  return page.evaluate((value) => {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem('jobti-quiz-state-v1', serialized);
    window.sessionStorage.setItem('jobti-quiz-state-v1', serialized);
  }, state);
}

test('home CTA starts a fresh Q0 when the saved quiz is complete', async ({ page }) => {
  await page.goto('/');
  const answers = { q0: 'progress-3', start: 'month-9' } as Record<string, string>;
  for (let index = 1; index <= 30; index += 1) {
    const questionId = `q${String(index).padStart(2, '0')}`;
    answers[questionId] = `${questionId}-a`;
  }
  await writeState(page, { version: 1, answers, complete: true });

  await page.getByRole('link', { name: /开始秋招精神鉴定/ }).click();
  await expect(page).toHaveURL(/\/quiz$/);
  await expect(page.getByRole('heading', { name: /你现在处于秋招/ })).toBeVisible();
  await expect(page.getByText('0 answers logged')).toBeVisible();
});

test('home CTA keeps an incomplete quiz at its first unanswered question', async ({ page }) => {
  await page.goto('/');
  await writeState(page, {
    version: 1,
    answers: { q0: 'progress-2', start: 'month-9', q01: 'q01-a' },
    complete: false,
  });

  await page.getByRole('link', { name: /开始秋招精神鉴定/ }).click();
  await expect(page).toHaveURL(/\/quiz$/);
  await expect(page.getByText('02 / 30')).toBeVisible();
  await expect(page.getByRole('heading', { name: /打开一份岗位 JD/ })).toBeVisible();
  await expect(page.getByText('3 answers logged')).toBeVisible();
});
