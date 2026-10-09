import { expect, test } from '@playwright/test';
test('complete mock study journey persists cards, deterministic score and bilingual chat offline', async ({ page, context }) => {
  const external: string[] = [];
  page.on('request', request => { if (!request.url().startsWith('http://localhost:4173') && /^https?:/.test(request.url())) external.push(request.url()); });
  await page.goto('/');
  await expect(page.getByText(/Offline ready:/)).toBeVisible({ timeout: 90000 });
  await page.getByRole('button', { name: 'Try the demo lesson', exact: true }).click();
  await expect(page.getByLabel('Corrected text page 1')).toHaveValue(/Photosynthesis releases oxygen/);
  await page.getByRole('button', { name: 'Confirm corrected text', exact: true }).click();
  await expect(page.getByText('Confirmed source saved on this device.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Show reviewer', exact: true }).click();
  await page.getByRole('button', { name: 'Create mock reviewer', exact: true }).click();
  await expect(page.getByText('Study work saved on this device.', { exact: true })).toBeVisible();
  await expect(page.getByText('Card 5 / English / Simulated', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Show answer 1', exact: true }).click();
  await expect(page.getByText('Through photosynthesis.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Hide answer 1', exact: true }).click();
  await expect(page.getByText('Through photosynthesis.', { exact: true })).not.toBeVisible();
  await page.getByRole('button', { name: 'Open quiz', exact: true }).click();
  await page.getByRole('button', { name: /^Question 1 choice 2:/ }).click();
  await expect(page.getByText(/^Not quite. Correct answer:/)).toBeVisible();
  await expect(page.getByRole('button', { name: /^Question 1 choice 1:/ })).toBeDisabled();
  await page.getByRole('button', { name: /^Question 2 choice 3:/ }).click();
  await page.getByRole('button', { name: /^Question 3 choice 2:/ }).click();
  await expect(page.getByText('Score: 2/3. Answered: 3/3.', { exact: true })).toBeVisible();
  await expect(page.getByText('Study work saved on this device.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Open chat', exact: true }).click();
  await page.getByLabel('Lesson question').fill('Where do roots get water?');
  await page.getByRole('button', { name: 'Ask mock lesson', exact: true }).click();
  await expect(page.getByText('Roots absorb water from soil.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Use Filipino', exact: true }).click();
  await page.getByLabel('Lesson question').fill('Ilang boltahe ang baterya?');
  await page.getByRole('button', { name: 'Ask mock lesson', exact: true }).click();
  await expect(page.getByText(/^Hindi nakita ng mock sa aralin/)).toBeVisible();
  await expect(page.getByText('Study work saved on this device.', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/mock-chat-mobile.png', fullPage: true });
  expect(external).toEqual([]);
  await context.setOffline(true); await page.close();
  const reopened = await context.newPage(); await reopened.goto('/');
  await expect(reopened.getByText(/Offline ready:/)).toBeVisible();
  await reopened.getByRole('button', { name: 'Show reviewer', exact: true }).click();
  await reopened.getByRole('button', { name: 'Open quiz', exact: true }).click();
  await expect(reopened.getByText('Score: 2/3. Answered: 3/3.', { exact: true })).toBeVisible();
  await reopened.getByRole('button', { name: 'Open chat', exact: true }).click();
  await expect(reopened.getByText(/^Hindi nakita ng mock sa aralin/)).toBeVisible();
  await reopened.getByRole('button', { name: 'Use Filipino', exact: true }).click();
  await reopened.getByRole('button', { name: 'Create a new mock reviewer', exact: true }).click();
  await expect(reopened.getByText('Study work saved on this device.', { exact: true })).toBeVisible();
  await reopened.getByRole('button', { name: 'Open cards', exact: true }).click();
  await expect(reopened.getByText('Card 1 / Filipino / Simulated', { exact: true })).toBeVisible();
  await reopened.getByRole('button', { name: 'Show answer 1', exact: true }).click();
  await expect(reopened.getByText('Sa pamamagitan ng photosynthesis.', { exact: true })).toBeVisible();
  await reopened.getByRole('button', { name: 'Open quiz', exact: true }).click();
  await expect(reopened.getByText('Score: 0/3. Answered: 0/3.', { exact: true })).toBeVisible();
});

test('source edits invalidate all study data and narrow source fails visibly', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Try the demo lesson', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm corrected text', exact: true }).click();
  await page.getByRole('button', { name: 'Show reviewer', exact: true }).click();
  await page.getByRole('button', { name: 'Create mock reviewer', exact: true }).click();
  await expect(page.getByText('Card 5 / English / Simulated', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Show source', exact: true }).click();
  await page.getByLabel('Corrected text page 1').fill('Only one sentence.');
  await page.getByRole('button', { name: 'Confirm corrected text', exact: true }).click();
  await page.getByRole('button', { name: 'Show reviewer', exact: true }).click();
  await page.getByRole('button', { name: 'Create mock reviewer', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText(/five distinct short sentences/);
  await expect(page.getByText('Card 5 / English / Simulated', { exact: true })).not.toBeVisible();
  await page.getByRole('button', { name: 'Show source', exact: true }).click();
  await page.getByRole('button', { name: 'Remove page 1', exact: true }).click();
  await expect(page.getByLabel('Corrected text page 1')).toHaveCount(0);
  await page.getByRole('button', { name: 'Show setup', exact: true }).click();
  await page.getByRole('button', { name: 'Try the demo lesson', exact: true }).click();
  await expect(page.getByLabel('Corrected text page 1')).toHaveValue(/Photosynthesis releases oxygen/);
});

test('failed mock study writes are visibly unsaved and recover without endpoint calls', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Try the demo lesson', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm corrected text', exact: true }).click();
  await page.getByRole('button', { name: 'Show reviewer', exact: true }).click();
  await page.evaluate(() => { const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function(value,key) {
      if (this.transaction.db.name === 'pocketreview-lessons' && !localStorage.getItem('recover')) throw Error('Storage full');
      return put.call(this,value,key);
    };
  });
  await page.getByRole('button', { name: 'Create mock reviewer', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText(/Study work not saved/);
  await expect(page.getByText('Study work saved on this device.', { exact: true })).not.toBeVisible();
  await page.evaluate(() => localStorage.setItem('recover','yes'));
  await page.getByRole('button', { name: 'Retry saving study work', exact: true }).click();
  await expect(page.getByText('Study work saved on this device.', { exact: true })).toBeVisible();
});

test('mock interface supports keyboard controls, 320px layout and enlarged text', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Use cloud', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Try the demo lesson', exact: true }).focus(); await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Confirm corrected text', exact: true }).click();
  await page.getByRole('button', { name: 'Show reviewer', exact: true }).click();
  await page.getByRole('button', { name: 'Create mock reviewer', exact: true }).click();
  const reveal = page.getByRole('button', { name: 'Show answer 1', exact: true });
  await reveal.focus(); await expect(reveal).toBeFocused(); await page.keyboard.press('Enter');
  await expect(page.getByText('Through photosynthesis.', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/mock-cards-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/mock-cards-mobile.png', fullPage: true });
  await page.evaluate(() => { document.body.style.zoom = '2'; });
  const zoom = await page.evaluate(() => ({ fits: document.documentElement.scrollWidth <= innerWidth,
    overflow: [...document.querySelectorAll('*')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).map(el => el.textContent?.slice(0,100)).slice(-6) }));
  expect(zoom, JSON.stringify(zoom)).toMatchObject({ fits: true });
});

test('fresh photo OCR and mock review creation work after cold offline reopening', async ({ page, context, browser }) => {
  test.setTimeout(120000);
  const fixture = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  await fixture.setContent('<main style="font:32px Arial;line-height:2;padding:32px;color:black;background:white">Plants make food.<br>Roots absorb water.<br>Leaves exchange gases.<br>Sunlight provides energy.<br>Photosynthesis releases oxygen.</main>');
  const photo = await fixture.screenshot(); await fixture.close();
  await page.goto('/'); await expect(page.getByText(/Offline ready:/)).toBeVisible({ timeout: 90000 });
  await context.setOffline(true); await page.close();
  const reopened = await context.newPage(); await reopened.goto('/');
  await reopened.getByRole('button', { name: 'Show source', exact: true }).click();
  const chooser = reopened.waitForEvent('filechooser');
  await reopened.getByRole('button', { name: 'Select photos', exact: true }).click();
  await (await chooser).setFiles({ name: 'fresh-offline-printed-page.png', mimeType: 'image/png', buffer: photo });
  await expect(reopened.getByLabel('Corrected text page 1')).toHaveValue(/Photosynthesis releases oxygen/, { timeout: 60000 });
  await reopened.getByRole('button', { name: 'Confirm corrected text', exact: true }).click();
  await expect(reopened.getByText('Confirmed source saved on this device.', { exact: true })).toBeVisible();
  await reopened.getByRole('button', { name: 'Show reviewer', exact: true }).click();
  await reopened.getByRole('button', { name: 'Create mock reviewer', exact: true }).click();
  await expect(reopened.getByText('Card 5 / English / Simulated', { exact: true })).toBeVisible();
});

test('offline preparation failure is actionable and can be retried', async ({ page }) => {
  await page.addInitScript(() => {
    const register = navigator.serviceWorker.register.bind(navigator.serviceWorker);
    navigator.serviceWorker.register = (url, options) => localStorage.getItem('allow-offline') ? register(url,options) : Promise.reject(Error('Offline storage unavailable'));
  });
  await page.goto('/'); await expect(page.getByText('Offline storage unavailable', { exact: true })).toBeVisible();
  await page.evaluate(() => localStorage.setItem('allow-offline','yes'));
  await page.getByRole('button', { name: 'Retry offline download', exact: true }).click();
  await expect(page.getByText(/Offline ready:/)).toBeVisible({ timeout: 90000 });
});
