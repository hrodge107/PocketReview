import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('mock evidence is labeled, reviewable, exported and restored on desktop', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Mock mode: predetermined', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Run four sample checks', exact: true }).click();
  await expect(page.getByText('Filipino / absent / Simulated', { exact: true })).toBeVisible();
  await expect(page.getByText('Results saved on this device.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Mark faithful / English / supported', exact: true }).click();
  await expect(page.getByText('Review: faithful.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Mark incorrect / English / supported', exact: true }).click();
  await expect(page.getByText('Review: incorrect.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Reset review / English / supported', exact: true }).click();
  await expect(page.getByText('Review: pending.', { exact: false })).toHaveCount(4);
  await page.getByRole('button', { name: 'Mark faithful / English / supported', exact: true }).click();
  await expect(page.getByText('0/4 live checks', { exact: false })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export results', exact: true }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe('pocketreview-setup-evidence.json');
  const exported = JSON.parse(await readFile((await file.path())!, 'utf8'));
  expect(exported.localInference).toBe('unverified');
  expect(exported.samples).toHaveLength(4);
  expect(exported.results.every((result: { mode: string }) => result.mode === 'mock')).toBe(true);
  await page.reload(); await expect(page.getByText('Review: faithful.', { exact: false })).toBeVisible();
  await page.screenshot({ path: 'test-results/expo-setup-desktop.png', fullPage: true });
});

test('cloud failures preserve completed mock work and do not leak an access code into storage', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Run four sample checks', exact: true }).click();
  await expect(page.getByText('Filipino / absent / Simulated', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Use cloud', exact: true }).click();
  await page.getByRole('button', { name: 'Run four sample checks', exact: true }).click();
  await expect(page.getByText('Enter your Worker URL before using cloud mode.', { exact: true })).toBeVisible();
  await expect(page.getByText('Filipino / absent / Simulated', { exact: true })).toBeVisible();
  await page.getByLabel('Demo access code', { exact: true }).fill('runtime-only-code');
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('runtime-only-code');
  await page.getByRole('button', { name: 'Use mock', exact: true }).click();
  await expect(page.getByText('Mock mode: predetermined', { exact: false })).toBeVisible();
});

test('offline cloud checks explain the connection requirement and preserve previous results', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Run four sample checks', exact: true }).click();
  await expect(page.getByText('Filipino / absent / Simulated', { exact: true })).toBeVisible();
  await expect(page.getByText('Results saved on this device.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Use cloud', exact: true }).click();
  await page.getByLabel('Worker URL', { exact: true }).fill('https://example.com');
  await page.getByLabel('Demo access code', { exact: true }).fill('offline-test-code');
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Run four sample checks', exact: true }).click();
  await expect(page.getByText('Cloud answers need internet. Your saved results remain available.', { exact: true })).toBeVisible();
  await expect(page.getByText('Filipino / absent / Simulated', { exact: true })).toBeVisible();
  await expect(page.getByText('0/4 live checks reviewed as faithful.', { exact: false })).toBeVisible();
});

test('cancel stops the batch and keyboard/mobile layout stays usable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Run four sample checks', exact: true })).toBeEnabled();
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement?.getAttribute('role'))).toBe('button');
  await page.keyboard.press('Tab'); await page.keyboard.press('Enter');
  await expect(page.getByLabel('Worker URL', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Use mock', exact: true }).click();
  await page.getByRole('button', { name: 'Run four sample checks', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel checks', exact: true }).click();
  await expect(page.getByText('Cancelled. Previous results are preserved.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Run four sample checks', exact: true })).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: 'test-results/expo-setup-mobile.png', fullPage: true });
});

test('storage failures keep results in memory and allow retry', async ({ page }) => {
  await page.addInitScript(() => {
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === 'pocketreview-setup-evidence-v2' && !localStorage.getItem('allow-test-save')) throw new Error('Storage full');
      return set.call(this, key, value);
    };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Run four sample checks', exact: true }).click();
  await expect(page.getByText('Not saved.', { exact: false })).toBeVisible();
  await expect(page.getByText('Results saved on this device.', { exact: true })).toHaveCount(0);
  await page.evaluate(() => localStorage.setItem('allow-test-save', 'yes'));
  await page.getByRole('button', { name: 'Retry saving results', exact: true }).click();
  await expect(page.getByText('Results saved on this device.', { exact: true })).toBeVisible();
});

test('failed startup reads block new checks until a successful retry', async ({ page }) => {
  await page.addInitScript(() => {
    const get = Storage.prototype.getItem;
    Storage.prototype.getItem = function(key) {
      if (key === 'pocketreview-setup-evidence-v2' && !get.call(this, 'allow-test-read')) throw new Error('Storage read unavailable');
      return get.call(this, key);
    };
  });
  await page.goto('/');
  await expect(page.getByText('Storage read unavailable', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Run four sample checks', exact: true })).toBeDisabled();
  await page.evaluate(() => localStorage.setItem('allow-test-read', 'yes'));
  await page.getByRole('button', { name: 'Retry reading results', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Run four sample checks', exact: true })).toBeEnabled();
});
