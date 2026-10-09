import { expect, test, type Page } from '@playwright/test';
import { reviewerFixture } from './reviewer-fixture';
async function seed(page: Page) {
  await page.goto('/');
  await page.evaluate(async lesson => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('pocketreview-lessons', 1);
      request.onsuccess = () => { const db = request.result; const tx = db.transaction('lesson', 'readwrite'); tx.objectStore('lesson').put(lesson, 'current');
        tx.oncomplete = () => { db.close(); resolve(); }; tx.onabort = () => reject(Error('Fixture save failed')); };
      request.onerror = () => reject(Error('Fixture setup failed'));
    });
  }, reviewerFixture);
  await page.reload();
  await page.getByRole('button', { name: 'Use cloud', exact: true }).click();
  await page.getByLabel('Worker URL', { exact: true }).fill('https://test-worker.example');
  await page.getByLabel('Demo access code', { exact: true }).fill('browser-test-code');
  await page.getByRole('button', { name: 'Show reviewer', exact: true }).click();
}
function batch(request: { count: number; previousQuestions: string[]; sourceRevision: string; pages: { text: string }[] }) {
  return { version: 1, mode: 'cloud', provider: 'browser-test-fixture', model: 'simulated-model', revision: '1', sourceRevision: request.sourceRevision,
    output: { items: Array.from({ length: request.count }, (_, index) => ({ question: `Fixture question ${request.previousQuestions.length + index + 1}?`,
      answer: request.pages[0].text.split('\n')[index], evidence: [{ pageId: 'page-1', quote: request.pages[0].text.split('\n')[index] }] })) } };
}
test('reviewer batches are validated, saved/restored and removed after source edits', async ({ page }) => {
  const counts: number[] = [];
  await page.route('https://test-worker.example/reviewer', async route => { const request = route.request().postDataJSON(); counts.push(request.count); await route.fulfill({ json: batch(request) }); });
  await seed(page); await page.getByRole('button', { name: 'Generate reviewer', exact: true }).click();
  await expect(page.getByText('Reviewer saved on this device.', { exact: true })).toBeVisible();
  expect(counts).toEqual([2,2,1]);
  await expect(page.getByText('Fixture question 5?', { exact: true })).toBeVisible();
  await page.reload(); await page.getByRole('button', { name: 'Show reviewer', exact: true }).click();
  await expect(page.getByText('Fixture question 5?', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/reviewer-mobile.png' });
  await page.getByRole('button', { name: 'Show source', exact: true }).click();
  await page.getByLabel('Corrected text page 1').fill('Changed source.');
  await page.getByRole('button', { name: 'Show reviewer', exact: true }).click();
  await expect(page.getByText('Fixture question 5?', { exact: true })).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Generate reviewer', exact: true })).toBeDisabled();
});
test('one invalid-output retry is bounded and failed replacements preserve the saved reviewer', async ({ page }) => {
  let calls = 0, fail = false;
  await page.route('https://test-worker.example/reviewer', async route => {
    calls++; const request = route.request().postDataJSON();
    if (calls === 1) await route.fulfill({ json: { ...batch(request), sourceRevision: 'old' } });
    else if (fail) await route.fulfill({ status: 429, json: { error: 'Quota exhausted; check allowance.' } });
    else await route.fulfill({ json: batch(request) });
  });
  await seed(page); await page.getByRole('button', { name: 'Generate reviewer', exact: true }).click();
  await expect(page.getByText('Reviewer saved on this device.', { exact: true })).toBeVisible(); expect(calls).toBe(4);
  fail = true;
  await page.getByRole('button', { name: 'Generate a new reviewer', exact: true }).click();
  await expect(page.getByText('Quota exhausted; check allowance.', { exact: true })).toBeVisible();
  expect(calls).toBe(5); await expect(page.getByText('Fixture question 5?', { exact: true })).toBeVisible();
});
test('cancelled generation cannot replace source or create a partial reviewer', async ({ page }) => {
  await page.route('https://test-worker.example/reviewer', async route => {
    await new Promise(resolve => setTimeout(resolve, 300));
    await route.fulfill({ json: batch(route.request().postDataJSON()) }).catch(() => {});
  });
  await seed(page); await page.getByRole('button', { name: 'Generate reviewer', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel generation', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Generate reviewer', exact: true })).toBeEnabled();
  await expect(page.getByText('Fixture question 1?', { exact: true })).not.toBeVisible();
});

test('failed replacement writes preserve the stored reviewer and recover without more model calls', async ({ page }) => {
  let calls = 0;
  await page.route('https://test-worker.example/reviewer', async route => {
    calls++; await route.fulfill({ json: batch(route.request().postDataJSON()) });
  });
  await seed(page); await page.getByRole('button', { name: 'Generate reviewer', exact: true }).click();
  await expect(page.getByText('Reviewer saved on this device.', { exact: true })).toBeVisible();
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function(value, key) {
      if (this.transaction.db.name === 'pocketreview-lessons' && !localStorage.getItem('allow-reviewer-write')) throw Error('Reviewer storage full');
      return put.call(this, value, key);
    };
  });
  await page.getByRole('button', { name: 'Use Filipino', exact: true }).click();
  await page.getByRole('button', { name: 'Generate a new reviewer', exact: true }).click();
  await expect(page.getByText(/Reviewer not saved.*Reviewer storage full/)).toBeVisible();
  await expect(page.getByText('Reviewer saved on this device.', { exact: true })).not.toBeVisible();
  const storedLanguage = await page.evaluate(() => new Promise<string>(resolve => {
    const open = indexedDB.open('pocketreview-lessons', 1);
    open.onsuccess = () => { const db = open.result, read = db.transaction('lesson').objectStore('lesson').get('current');
      read.onsuccess = () => { resolve(read.result.studyItems[0].language); db.close(); }; };
  }));
  expect(storedLanguage).toBe('English'); expect(calls).toBe(6);
  await page.evaluate(() => localStorage.setItem('allow-reviewer-write', 'yes'));
  await page.getByRole('button', { name: 'Retry saving reviewer', exact: true }).click();
  await expect(page.getByText('Reviewer saved on this device.', { exact: true })).toBeVisible(); expect(calls).toBe(6);
  await page.reload(); await page.getByRole('button', { name: 'Show reviewer', exact: true }).click();
  await expect(page.getByText('Item 1 / Filipino / Live cloud', { exact: true })).toBeVisible();
});
