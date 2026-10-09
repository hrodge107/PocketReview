import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { reviewerFixture } from '../tests-expo/reviewer-fixture.ts';
process.loadEnvFile('worker/.dev.vars');
if (!process.env.DEMO_ACCESS_CODE) throw Error('Configure the protected local access code.');
const browser = await chromium.launch({ channel: 'chrome' });
const maxCalls = Number(process.argv.find(value => value.startsWith('--max-calls='))?.split('=')[1] ?? 8);
if (!Number.isInteger(maxCalls) || maxCalls < 1 || maxCalls > 8) throw Error('Use a reviewer call budget between one and eight.');
const evidence = { fixture: 'Confirmed synthetic biology lesson; not an OCR/camera acceptance check', source: reviewerFixture.pages,
  results: [], requests: [], localInference: 'unverified', semanticReview: 'pending agent inspection' };
const pending = []; let forwardedCalls = 0;
try {
  const page = await browser.newPage();
  await page.route('http://localhost:8787/reviewer', async route => {
    if (route.request().method() !== 'POST') return route.continue();
    if (forwardedCalls >= maxCalls) return route.fulfill({ status: 429, json: { error: 'Evaluation call budget reached. No further model call was sent.' },
      headers: { 'Access-Control-Allow-Origin': 'http://localhost:4173' } });
    forwardedCalls++; await route.continue();
  });
  page.on('response', response => {
    if (response.url() !== 'http://localhost:8787/reviewer' || response.request().method() !== 'POST') return;
    pending.push(response.json().then(body => evidence.requests.push({ status: response.status(), request: response.request().postDataJSON(), response: body })).catch(() => {}));
  });
  await page.goto('http://localhost:4173');
  await page.getByRole('button', { name: 'Show source', exact: true }).click();
  await page.getByRole('button', { name: 'Select photos', exact: true }).waitFor({ state: 'visible' });
  await page.evaluate(async lesson => {
    await new Promise((resolve, reject) => {
      const open = indexedDB.open('pocketreview-lessons', 1);
      open.onsuccess = () => { const db = open.result, tx = db.transaction('lesson', 'readwrite'); tx.objectStore('lesson').put(lesson, 'current');
        tx.oncomplete = () => { db.close(); resolve(); }; tx.onabort = () => reject(Error('Fixture write failed')); };
      open.onerror = () => reject(Error('Fixture database unavailable'));
    });
  }, reviewerFixture);
  await page.reload();
  await page.getByRole('button', { name: 'Use cloud', exact: true }).click();
  await page.getByLabel('Worker URL', { exact: true }).fill('http://localhost:8787');
  await page.getByLabel('Demo access code', { exact: true }).fill(process.env.DEMO_ACCESS_CODE);
  await page.getByRole('button', { name: 'Show reviewer', exact: true }).click();
  for (const language of ['English','Filipino']) {
    if (language === 'Filipino') await page.getByRole('button', { name: 'Use Filipino', exact: true }).click();
    const started = Date.now();
    await page.getByRole('button', { name: language === 'English' ? 'Generate reviewer' : 'Generate a new reviewer', exact: true }).click();
    await page.getByRole('button', { name: 'Cancel generation', exact: true }).waitFor({ state: 'visible', timeout: 5000 });
    await page.getByRole('button', { name: 'Cancel generation', exact: true }).waitFor({ state: 'hidden', timeout: 240000 });
    const saved = await page.evaluate(async () => new Promise((resolve, reject) => {
      const open = indexedDB.open('pocketreview-lessons', 1);
      open.onsuccess = () => { const db = open.result, tx = db.transaction('lesson', 'readonly'), request = tx.objectStore('lesson').get('current');
        request.onsuccess = () => { db.close(); resolve(request.result); }; request.onerror = () => reject(Error('Read failed')); };
    }));
    const success = saved.studyItems.length === 5 && saved.studyItems.every(item => item.language === language);
    const result = { language, observedAt: new Date().toISOString(), elapsedMs: Date.now() - started, success,
      environment: await page.evaluate(() => navigator.userAgent), items: success ? saved.studyItems : [],
      errors: await page.getByRole('alert').allTextContents() };
    evidence.results.push(result); console.log(JSON.stringify({ language, success, elapsedMs: result.elapsedMs, errors: result.errors }));
    if (!success) { process.exitCode = 1; break; }
  }
  await page.reload(); await page.getByRole('button', { name: 'Show reviewer', exact: true }).click();
  evidence.restored = await page.getByText('Reviewer saved on this device.', { exact: true }).isVisible();
  await page.setViewportSize({ width: 1280, height: 900 }); await page.screenshot({ path: 'test-results/reviewer-live-desktop.png' });
  await page.setViewportSize({ width: 320, height: 800 });
  evidence.narrowOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  await page.screenshot({ path: 'test-results/reviewer-live-mobile.png' });
  await Promise.all(pending);
} finally {
  await browser.close(); await mkdir('verification/live', { recursive: true });
  evidence.callBudget = { maxCalls, forwardedCalls };
  const file = `verification/live/reviewer-${Date.now()}.json`;
  const text = JSON.stringify(evidence, null, 2);
  if (text.includes(process.env.DEMO_ACCESS_CODE)) throw Error('Access code leaked into evidence; refusing to save.');
  await writeFile(file, text); console.log(`Evidence: ${file}`);
}
