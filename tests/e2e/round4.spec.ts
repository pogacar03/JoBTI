import { expect, test } from '@playwright/test';

const STORAGE_KEY = 'jobti-quiz-state-v1';

function completeAnswers(): Record<string, string> {
  const answers: Record<string, string> = { q0: 'progress-3', start: 'month-9' };
  for (let index = 1; index <= 30; index += 1) {
    const questionId = `q${String(index).padStart(2, '0')}`;
    answers[questionId] = `${questionId}-a`;
  }
  return answers;
}

async function writeState(page: import('@playwright/test').Page, state: unknown) {
  await page.evaluate(({ key, value }) => {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    window.sessionStorage.setItem(key, serialized);
  }, { key: STORAGE_KEY, value: state });
}

test('a direct start intent in a new tab starts fresh only for a semantically complete record', async ({ page, context }) => {
  await page.goto('/');
  await writeState(page, { version: 1, answers: completeAnswers(), complete: true, updatedAt: 100 });

  const newPage = await context.newPage();
  await newPage.goto('/quiz?start=1');
  await expect(newPage).toHaveURL(/\/quiz$/);
  await expect(newPage.getByRole('heading', { name: /你现在处于秋招/ })).toBeVisible();
  await expect(newPage.getByText('0 answers logged')).toBeVisible();
  await expect(newPage.evaluate((key) => {
    const local = JSON.parse(window.localStorage.getItem(key) ?? '{}');
    const session = JSON.parse(window.sessionStorage.getItem(key) ?? '{}');
    return { local, session };
  }, STORAGE_KEY)).resolves.toMatchObject({
    local: { answers: {}, complete: false },
    session: { answers: {}, complete: false },
  });

  await writeState(newPage, {
    version: 1,
    answers: { q0: 'progress-2', start: 'month-9', q01: 'q01-a' },
    complete: false,
    updatedAt: 200,
  });
  await newPage.goto('/quiz?start=1');
  await expect(newPage).toHaveURL(/\/quiz$/);
  await expect(newPage.getByText('02 / 30')).toBeVisible();
  await expect(newPage.getByRole('heading', { name: /打开一份岗位 JD/ })).toBeVisible();
  await expect(newPage.getByText('3 answers logged')).toBeVisible();
  await newPage.close();
});

test('a partial or illegal complete record cannot reveal a result', async ({ page }) => {
  await page.goto('/');
  await writeState(page, {
    version: 1,
    answers: { q0: 'progress-3', start: 'month-9' },
    complete: true,
    updatedAt: 100,
  });
  await page.goto('/result');
  await expect(page.getByText('档案未完成')).toBeVisible();
  await expect(page.getByRole('button', { name: /查看我的 JOBTI/ })).toHaveCount(0);

  await writeState(page, {
    version: 1,
    answers: { ...completeAnswers(), q01: 'not-a-real-option' },
    complete: true,
    updatedAt: 200,
  });
  await page.reload();
  await expect(page.getByText('档案未完成')).toBeVisible();
  await expect(page.getByRole('button', { name: /查看我的 JOBTI/ })).toHaveCount(0);
});
