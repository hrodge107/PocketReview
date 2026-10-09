import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('mobile setup shows real failure, export, saved evidence and offline shell', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.addInitScript(() => Object.defineProperty(navigator, 'gpu', { value: undefined, configurable: true }));
  await page.goto('/');
  await expect(page.getByText('No answers recorded yet')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Load local model' })).toBeEnabled();
  await page.getByLabel('Device being tested').fill('Desktop Chrome');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Load local model' }).click();
  await expect(page.getByRole('alert')).toContainText('WebGPU is unavailable');
  await expect(page.getByText('Evidence saved on this device.')).toBeVisible();
  await page.getByRole('button', { name: 'Retry model loading' }).click();
  await expect(page.getByText('Recorded setup failures (2)')).toBeVisible();
  await page.getByText('Recorded setup failures (2)').click();
  await expect(page.getByText('load: WebGPU is unavailable').first()).toBeVisible();
  await page.getByRole('button', { name: 'Retry saving' }).click();
  await expect(page.getByText('Evidence saved on this device.')).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export evidence' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe('pocketreview-phone-gate.json');
  const exported = JSON.parse(await readFile((await file.path())!, 'utf8'));
  expect(exported.failures).toHaveLength(2);
  expect(exported.results).toHaveLength(0);
  await page.reload();
  await expect(page.getByText('Recorded setup failures (2)')).toBeVisible();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.evaluate(async () => { const model = await caches.open('webllm/model'); await model.put('/test-model-sentinel', new Response('preserve')); });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText('Browser reports offline.', { exact: false })).toBeVisible();
  await expect(page.getByText('Cached for offline reopening.', { exact: true })).toBeVisible();
  expect(await page.evaluate(async () => (await (await caches.open('webllm/model')).match('/test-model-sentinel'))?.text())).toBe('preserve');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/setup-mobile.png', fullPage: true });
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('failed initial read blocks new evidence and retry restores existing records', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'gpu', { value: undefined, configurable: true }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Load local model' }).click();
  await expect(page.getByText('Evidence saved on this device.')).toBeVisible();
  await page.addInitScript(() => {
    if (sessionStorage.getItem('read-failure-exercised')) return;
    sessionStorage.setItem('read-failure-exercised', 'yes');
    const original = indexedDB.open.bind(indexedDB);
    indexedDB.open = (...args) => {
      if (args[0] === 'pocketreview-evidence') throw new DOMException('Read unavailable');
      return original(...args);
    };
  });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Load local model' })).toBeDisabled();
  await page.getByRole('button', { name: 'Retry reading evidence' }).click();
  await expect(page.getByText('Recorded setup failures (1)')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Load local model' })).toBeEnabled();
});

test('storage failure never shows saved and keyboard focus is visible', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'gpu', { value: undefined, configurable: true });
    const original = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function (store, mode, options) {
      if (mode === 'readwrite') throw new DOMException('Quota exceeded', 'QuotaExceededError');
      return original.call(this, store, mode, options);
    };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Load local model' }).click();
  await expect(page.getByText('Evidence was not saved.', { exact: false })).toBeVisible();
  await expect(page.getByText('Evidence saved on this device.')).toHaveCount(0);
  await page.getByLabel('Device being tested').focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Retry model loading' })).toBeFocused();
  expect(await page.getByRole('button', { name: 'Retry model loading' }).evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  await page.setViewportSize({ width: 1280, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/setup-desktop.png', fullPage: true });
});

test('simulated worker exercises progress, cancellation, reviews and export without claiming inference', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'gpu', { value: { requestAdapter: async () => ({ features: new Set(['shader-f16']), info: { vendor: 'SIMULATED TEST GPU' } }) }, configurable: true });
    class SimulatedWorker {
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror = null;
      timers: ReturnType<typeof setTimeout>[] = [];
      postMessage(msg: { kind: string; uuid: string }) {
        if (msg.kind === 'setAppConfig') return;
        if (msg.kind === 'reload') this.onmessage?.(new MessageEvent('message', { data: { kind: 'initProgressCallback', uuid: msg.uuid, content: { progress: 0.5, text: 'SIMULATED loading progress', timeElapsed: 0 } } }));
        this.timers.push(setTimeout(() => this.onmessage?.(new MessageEvent('message', { data: {
          kind: 'return', uuid: msg.uuid,
          content: msg.kind === 'chatCompletionNonStreaming' ? { choices: [{ message: { content: 'SIMULATED test answer. This is not model evidence.' } }] } : null,
        } })), 1000));
      }
      terminate() { this.timers.forEach(clearTimeout); }
    }
    Object.defineProperty(window, 'Worker', { value: SimulatedWorker });
  });
  await page.goto('/');
  await page.getByLabel('Device being tested').fill('SIMULATED desktop test');
  await page.getByRole('button', { name: 'Load local model' }).click();
  await expect(page.getByRole('progressbar')).toBeVisible();
  await page.getByRole('button', { name: 'Stop current task' }).click();
  await expect(page.getByText('Stopped. Previous evidence remains available.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Load local model' }).click();
  await expect(page.getByRole('button', { name: 'Run four language checks' })).toBeEnabled();
  await page.getByRole('button', { name: 'Run four language checks' }).click();
  await expect(page.locator('article')).toHaveCount(4);
  await expect(page.getByRole('button', { name: 'Run four language checks' })).toBeEnabled();
  await page.locator('select').first().selectOption('faithful');
  await expect(page.getByText('Evidence saved on this device.')).toBeVisible();
  await page.locator('select').first().selectOption('incorrect');
  await page.reload();
  await expect(page.locator('select').first()).toHaveValue('incorrect');
  await expect(page.getByText('Phone language checks: pending.', { exact: false })).toBeVisible();
  await page.screenshot({ path: 'test-results/setup-simulated-results.png', fullPage: true });
  await page.getByRole('button', { name: 'Load local model' }).click();
  await expect(page.getByRole('button', { name: 'Run four language checks' })).toBeDisabled();
  await page.getByLabel('Device being tested').fill('SIMULATED desktop test');
  await expect(page.getByRole('button', { name: 'Run four language checks' })).toBeEnabled();
  await page.getByRole('button', { name: 'Run four language checks' }).click();
  await page.getByRole('button', { name: 'Stop current task' }).click();
  await expect(page.locator('article')).toHaveCount(5);
  await expect(page.locator('article').first()).toContainText('Task cancelled');
  await expect(page.locator('article').nth(1)).toContainText('SIMULATED test answer');
});
