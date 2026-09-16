import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
import { PERSONALITY_ANSWER_FIXTURES } from '../answer-fixtures';

const state = {
  version: 1,
  answers: PERSONALITY_ANSWER_FIXTURES.POOL,
  complete: true,
  updatedAt: Date.now(),
};

const humanState = {
  version: 1,
  answers: PERSONALITY_ANSWER_FIXTURES.HUMN,
  complete: true,
  updatedAt: Date.now(),
};

test('home preview exposes the matching personality image and accessible label', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('[data-preview-code]');
  const image = card.locator('[data-personality-image]');
  const code = await card.getAttribute('data-preview-code');
  await expect(image).toHaveAttribute('src', `/personalities/${code!.toLowerCase()}.jpg`);
  await expect(image).toHaveAttribute('alt', new RegExp(code!));
});

test('home rotation preserves the complete portrait artwork, including HUMN', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('[data-preview-code]');
  const seen = new Set<string>();

  for (let step = 0; step < 3; step += 1) {
    const code = await card.getAttribute('data-preview-code');
    expect(code).toBeTruthy();
    seen.add(code!);

    const image = card.locator('[data-personality-image]');
    await expect(image).toHaveJSProperty('complete', true);
    await expect.poll(() => image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    expect(await image.evaluate((node) => window.getComputedStyle(node).objectFit)).toBe('contain');

    const ratios = await image.evaluate((node) => {
      const imageNode = node as HTMLImageElement;
      return {
        intrinsic: imageNode.naturalWidth / imageNode.naturalHeight,
        rendered: imageNode.clientWidth / imageNode.clientHeight,
      };
    });
    expect(Math.abs(ratios.intrinsic - ratios.rendered)).toBeLessThan(0.01);

    if (step < 2) {
      await expect(card).not.toHaveAttribute('data-preview-code', code!, { timeout: 5000 });
    }
  }

  expect([...seen].sort()).toEqual(['HUMN', 'KING', 'POOL']);
});

test('home rotation only commits a new personality after its portrait is ready', async ({ page }) => {
  await page.route('**/personalities/*.jpg', async (route) => {
    const response = await route.fetch();
    await new Promise((resolve) => setTimeout(resolve, 900));
    await route.fulfill({ response });
  });
  await page.goto('/');

  const snapshots: Array<{ code: string; complete: boolean; naturalWidth: number; src: string }> = [];
  for (let index = 0; index < 70; index += 1) {
    snapshots.push(await page.locator('[data-preview-code]').locator('[data-personality-image]').evaluate((node) => {
      const image = node as HTMLImageElement;
      return {
        code: image.closest('[data-preview-code]')?.getAttribute('data-preview-code') ?? '',
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        src: image.getAttribute('src') ?? '',
      };
    }));
    await page.waitForTimeout(100);
  }

  for (let index = 1; index < snapshots.length; index += 1) {
    if (snapshots[index].code !== snapshots[index - 1].code) {
      expect(snapshots[index].complete).toBe(true);
      expect(snapshots[index].naturalWidth).toBeGreaterThan(0);
      expect(snapshots[index].src).toContain(`/personalities/${snapshots[index].code.toLowerCase()}.jpg`);
    }
  }
});

test('HUMN result loads its own complete portrait without cropping', async ({ page }) => {
  await page.addInitScript((quizState) => {
    const value = JSON.stringify(quizState);
    window.localStorage.setItem('jobti-quiz-state-v1', value);
    window.sessionStorage.setItem('jobti-quiz-state-v1', value);
  }, humanState);
  await page.goto('/result');
  await expect(page.getByText('检测完成')).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: /查看我的 JOBTI/ }).click();

  const image = page.locator('[data-result-primary-image]');
  await expect(image).toHaveAttribute('src', '/personalities/humn.jpg');
  await expect.poll(() => image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  expect(await image.evaluate((node) => window.getComputedStyle(node).objectFit)).toBe('contain');
});

test('revealed result shows the primary image without secondary personality or combination title', async ({ page }) => {
  await page.addInitScript((quizState) => {
    const value = JSON.stringify(quizState);
    window.localStorage.setItem('jobti-quiz-state-v1', value);
    window.sessionStorage.setItem('jobti-quiz-state-v1', value);
  }, state);
  await page.goto('/result');
  await expect(page.getByText('检测完成')).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: /查看我的 JOBTI/ }).click();
  const primary = page.locator('[data-result-primary-image]');
  await expect(primary).toBeVisible();
  expect(await primary.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('[data-result-secondary-image]')).toHaveCount(0);
  await expect(page.getByText(/组合称号/)).toHaveCount(0);
  await expect(page.getByText('你是一个什么样的人', { exact: true }).first()).toBeVisible();
});

test('downloaded poster keeps its fixed dimensions and includes the primary image asset', async ({ page }) => {
  await page.addInitScript((quizState) => {
    const value = JSON.stringify(quizState);
    window.localStorage.setItem('jobti-quiz-state-v1', value);
    window.sessionStorage.setItem('jobti-quiz-state-v1', value);
  }, state);
  await page.goto('/result');
  await expect(page.getByText('检测完成')).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: /查看我的 JOBTI/ }).click();
  await expect(page.locator('[data-poster-primary-image]')).toHaveAttribute('src', '/personalities/pool.jpg');
  await expect(page.locator('[data-poster-qr-image]')).toHaveAttribute('src', /^data:image\/png;base64,/);
  await expect(page.getByText('你是一个什么样的人', { exact: true }).first()).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /保存人格卡/ }).click();
  const path = await (await download).path();
  expect(path).toBeTruthy();
  const png = PNG.sync.read(await readFile(path!));
  expect({ width: png.width, height: png.height }).toEqual({ width: 1080, height: 1920 });
  const colors = new Set<string>();
  for (let index = 0; index < png.data.length; index += 4) {
    colors.add(`${png.data[index]}-${png.data[index + 1]}-${png.data[index + 2]}`);
    if (colors.size > 10) break;
  }
  expect(colors.size).toBeGreaterThan(10);
});
