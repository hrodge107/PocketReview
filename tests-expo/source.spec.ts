import { expect, test, type Browser, type Page } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
async function printedPages(browser: Browser) {
  const fixture = await browser.newPage({ viewport: { width: 1000, height: 450 } });
  const images = [];
  for (const [name, text] of [
    ['english.png', 'Electric current flows through a closed circuit.<br>Opening a switch breaks the circuit and stops current.'],
    ['filipino.png', 'Dumadaloy ang kuryente sa saradong sirkito.<br>Kapag binuksan ang switch, humihinto ang daloy ng kuryente.'],
  ]) {
    await fixture.setContent(`<main style="font:28px Arial;line-height:2;padding:32px;background:white;color:black">${text}</main>`);
    images.push({ name, mimeType: 'image/png', buffer: await fixture.screenshot() });
  }
  await fixture.close(); return images;
}
async function select(page: Page, files: Awaited<ReturnType<typeof printedPages>>) {
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Select photos', exact: true }).click();
  await (await chooser).setFiles(files);
}
test('fresh local bilingual OCR, correction, confirmation and source restoration', async ({ page, browser, context }) => {
  test.setTimeout(120000);
  const files = await printedPages(browser);
  const external: string[] = [];
  context.on('request', request => { if (/^https?:/.test(request.url()) && !request.url().startsWith('http://localhost:4173/')) external.push(request.url()); });
  await page.goto('/'); await page.getByRole('button', { name: 'Show source', exact: true }).click();
  const started = Date.now();
  await select(page, files);
  await expect(page.getByLabel('Corrected text page 1')).toHaveValue(/switch/i, { timeout: 60000 });
  await expect(page.getByLabel('Corrected text page 2')).toHaveValue(/kuryente/i, { timeout: 60000 });
  await expect(page.getByRole('button', { name: 'Confirm corrected text', exact: true })).toBeEnabled();
  expect(external).toEqual([]);
  await writeFile('test-results/source-ocr-evidence.json', JSON.stringify({ observedAt: new Date().toISOString(),
    fixture: 'Fresh browser-rendered synthetic printed pages; not camera photographs', tesseract: '7.0.0',
    elapsedFlowMs: Date.now() - started, environment: await page.evaluate(() => navigator.userAgent), externalRequests: external,
    rawEnglish: await page.getByLabel('Corrected text page 1').inputValue(), rawFilipino: await page.getByLabel('Corrected text page 2').inputValue(),
  }, null, 2));
  await page.getByLabel('Corrected text page 1').fill('Corrected: opening a switch stops current.');
  await page.getByRole('button', { name: 'Confirm corrected text', exact: true }).click();
  await expect(page.getByText('Confirmed source saved on this device.', { exact: true })).toBeVisible();
  await page.reload(); await page.getByRole('button', { name: 'Show source', exact: true }).click();
  await expect(page.getByLabel('Corrected text page 1')).toHaveValue('Corrected: opening a switch stops current.');
  await expect(page.getByLabel('Source photo 2')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Select photos', exact: true })).toBeDisabled();
  await expect(page.getByText(/^Electric current flows through a closed circuit\./)).toBeVisible();
  await page.getByLabel('Corrected text page 1').fill('a'.repeat(4501));
  await expect(page.getByRole('button', { name: 'Confirm corrected text', exact: true })).toBeDisabled();
  await expect(page.getByText('Keep the combined source within 4,500 characters.', { exact: false })).toBeVisible();
  await page.getByLabel('Corrected text page 1').fill('Revised source.');
  await expect(page.getByRole('button', { name: 'Confirm corrected text', exact: true })).toBeEnabled();
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/source-mobile.png', fullPage: true });
  await page.getByLabel('Corrected text page 2').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/source-mobile-correction.png' });
  await page.getByRole('button', { name: 'Confirm corrected text', exact: true }).scrollIntoViewIfNeeded();
  const removeBounds = await page.getByRole('button', { name: 'Remove page 2', exact: true }).boundingBox();
  const confirmationBounds = await page.getByText('Confirm this source', { exact: true }).boundingBox();
  expect(removeBounds!.y + removeBounds!.height).toBeLessThan(confirmationBounds!.y);
  await page.screenshot({ path: 'test-results/source-mobile-confirm.png' });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: 'test-results/source-desktop.png', fullPage: true });
  await page.evaluate(() => { document.body.style.zoom = '2'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('OCR asset failure preserves photo for manual correction and retry', async ({ page, browser }) => {
  const files = await printedPages(browser);
  await page.route('**/ocr/controller.js', route => route.abort());
  await page.goto('/'); await page.getByRole('button', { name: 'Show source', exact: true }).click();
  await select(page, [files[0]]);
  await expect(page.getByText('Local OCR assets could not load.', { exact: false })).toBeVisible();
  await expect(page.getByLabel('Source photo 1')).toBeVisible();
  await page.getByLabel('Corrected text page 1').fill('Manually corrected printed source.');
  await page.getByRole('button', { name: 'Confirm corrected text', exact: true }).click();
  await expect(page.getByText('Confirmed source saved on this device.', { exact: true })).toBeVisible();
});

test('failed source read blocks mutation without replacing the saved lesson', async ({ page }) => {
  await page.addInitScript(() => {
    const open = indexedDB.open.bind(indexedDB);
    indexedDB.open = ((name: string, version?: number) => {
      if (name === 'pocketreview-lessons' && !localStorage.getItem('allow-lesson-read')) throw Error('Storage read unavailable');
      return open(name, version);
    }) as typeof indexedDB.open;
  });
  await page.goto('/'); await page.getByRole('button', { name: 'Show source', exact: true }).click();
  await expect(page.getByText('Storage read unavailable', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Select photos', exact: true })).toBeDisabled();
  await page.evaluate(() => localStorage.setItem('allow-lesson-read', 'yes'));
  await page.getByRole('button', { name: 'Retry reading lesson', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Select photos', exact: true })).toBeEnabled();
});

test('failed lesson writes retain unsaved photos and recover on explicit retry', async ({ page, browser }) => {
  const files = await printedPages(browser);
  await page.addInitScript(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function(value, key) {
      if (this.transaction.db.name === 'pocketreview-lessons' && !localStorage.getItem('allow-lesson-write')) throw Error('Lesson storage full');
      return put.call(this, value, key);
    };
  });
  await page.goto('/'); await page.getByRole('button', { name: 'Show source', exact: true }).click();
  await select(page, [files[0]]);
  await expect(page.getByText('Not saved. Lesson storage full', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Source photo 1')).toBeVisible();
  await expect(page.getByText('Draft source saved on this device.', { exact: true })).not.toBeVisible();
  await page.getByLabel('Corrected text page 1').fill('A manually confirmed source.');
  await page.evaluate(() => localStorage.setItem('allow-lesson-write', 'yes'));
  await page.getByRole('button', { name: 'Retry saving lesson', exact: true }).click();
  await expect(page.getByText('Draft source saved on this device.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm corrected text', exact: true }).click();
  await expect(page.getByText('Confirmed source saved on this device.', { exact: true })).toBeVisible();
  await page.reload(); await page.getByRole('button', { name: 'Show source', exact: true }).click();
  await expect(page.getByLabel('Corrected text page 1')).toHaveValue('A manually confirmed source.');
});

test('three-photo selection is rejected without creating pages', async ({ page, browser }) => {
  const files = await printedPages(browser);
  await page.goto('/'); await page.getByRole('button', { name: 'Show source', exact: true }).click();
  await select(page, [...files, { ...files[0], name: 'third.png' }]);
  await expect(page.getByText('Select at most two photos for this lesson. Existing pages are preserved.', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Source photo 1')).not.toBeVisible();
});

test('empty OCR is recoverable and cancellation preserves the selected photo', async ({ page, browser }) => {
  test.setTimeout(90000);
  const fixture = await browser.newPage({ viewport: { width: 600, height: 400 } });
  await fixture.setContent('<main style="background:white;height:400px"></main>');
  const blank = { name: 'blank.png', mimeType: 'image/png', buffer: await fixture.screenshot() }; await fixture.close();
  await page.goto('/'); await page.getByRole('button', { name: 'Show source', exact: true }).click();
  await select(page, [blank]);
  await expect(page.getByText('No text detected.', { exact: false })).toBeVisible({ timeout: 60000 });
  await expect(page.getByRole('button', { name: 'Confirm corrected text', exact: true })).toBeDisabled();
  await page.route('**/ocr/controller.js', async route => { await new Promise(resolve => setTimeout(resolve, 1000)); await route.abort(); });
  await page.getByRole('button', { name: 'Retry OCR page 1', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel OCR', exact: true }).click();
  await expect(page.getByText('OCR cancelled. Completed work is preserved.', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Source photo 1')).toBeVisible();
  await page.getByLabel('Corrected text page 1').fill('Text entered after reading the photo.');
  await page.getByRole('button', { name: 'Confirm corrected text', exact: true }).click();
  await expect(page.getByText('Confirmed source saved on this device.', { exact: true })).toBeVisible();
});

test('oversized image dimensions and unsupported formats are rejected', async ({ page, browser }) => {
  const fixture = await browser.newPage({ viewport: { width: 4000, height: 4000 } });
  await fixture.setContent('<main style="background:white;height:4000px"></main>');
  const large = { name: 'large.png', mimeType: 'image/png', buffer: await fixture.screenshot() }; await fixture.close();
  await page.goto('/'); await page.getByRole('button', { name: 'Show source', exact: true }).click();
  await select(page, [large]);
  await expect(page.getByText('Use a smaller crop:', { exact: false })).toBeVisible();
  await select(page, [{ name: 'unsupported.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>') }]);
  await expect(page.getByText('Choose a PNG, JPEG or WebP photo.', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Source photo 1')).not.toBeVisible();
});
