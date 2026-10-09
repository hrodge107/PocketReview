import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { checks } from '../mobile/checks.ts';
const selected = process.argv[2];
const samples = selected === '--all' ? checks : checks.filter(check => check.id === selected);
if (!samples.length) throw new Error('Specify one sample ID or --all. No automatic retries.');
process.loadEnvFile(resolve('worker/.dev.vars'));
if (!process.env.DEMO_ACCESS_CODE) throw new Error('Configure the access code in ignored worker/.dev.vars.');
const results = [];
for (const check of samples) {
  const start = Date.now();
  const response = await fetch('http://localhost:8787/answer', { method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.DEMO_ACCESS_CODE}` },
    body: JSON.stringify(check.request), signal: AbortSignal.timeout(60000) });
  const body = await response.json();
  const result = { checkId: check.id, at: new Date().toISOString(), elapsedMs: Date.now() - start,
    status: response.status, request: check.request, response: response.ok ? body : null,
    error: response.ok ? null : body.error, rejectionCategory: body.category || null, review: 'pending' };
  results.push(result);
  console.log(JSON.stringify({ checkId: check.id, status: result.status, elapsedMs: result.elapsedMs, category: result.rejectionCategory }));
  if (!response.ok) break;
}
await mkdir('verification/live', { recursive: true });
const file = `verification/live/checks-${Date.now()}.json`;
await writeFile(file, JSON.stringify({ environment: `Node ${process.version}, local Worker with remote Workers AI`, results }, null, 2));
console.log(`Evidence saved: ${file}`);
if (results.some(result => result.status !== 200)) process.exitCode = 1;
