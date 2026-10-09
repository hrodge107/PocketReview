import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
async function files(dir, prefix = '') {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = `${prefix}${entry.name}`;
    if (entry.isDirectory()) result.push(...await files(`${dir}/${entry.name}`, `${name}/`));
    else if (entry.name !== 'service-worker.js') result.push(`/${name}`);
  }
  return result;
}
const paths = await files('dist');
const fingerprint = createHash('sha256');
for (const path of paths) { fingerprint.update(path); fingerprint.update(await readFile(`dist${path}`)); }
const version = fingerprint.digest('hex').slice(0, 16);
const worker = `const NAME = 'pocketreview-mock-shell-${version}';
const FILES = ${JSON.stringify(paths)};
self.addEventListener('install', event => event.waitUntil((async () => {
  try { const cache = await caches.open(NAME); await cache.addAll(FILES); await self.skipWaiting(); }
  catch (error) { await caches.delete(NAME); throw error; }
})()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const name of await caches.keys()) if (name.startsWith('pocketreview-mock-shell-') && name !== NAME) await caches.delete(name);
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(NAME);
    const hit = await cache.match(event.request);
    if (hit) return hit;
    if (event.request.mode === 'navigate') return (await cache.match('/index.html')) || fetch(event.request);
    return fetch(event.request);
  })());
});
`;
await writeFile('dist/service-worker.js', worker);
console.log(`Offline shell ${version}: ${paths.length} local files, including OCR assets.`);
