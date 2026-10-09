import { beforeEach, expect, it, vi } from 'vitest';
import worker, { type Env } from './index';
import { checks } from '../mobile/checks';
const request = checks[0].request;
const output = { answer: 'The current stops.', supported: true, evidence: [{ pageId: 'page-1', quote: request.pages[0].text }] };
let env: Env;
beforeEach(() => {
  env = { AI: { run: vi.fn().mockResolvedValue({ response: JSON.stringify(output) }) }, DEMO_ACCESS_CODE: 'test-only-code',
    MODEL: 'test-only-model', MODEL_REVISION: 'test-revision', ALLOWED_ORIGINS: 'http://localhost:8081',
    REQUEST_LIMITER: { limit: vi.fn().mockResolvedValue({ success: true }) } };
});
function call(body: unknown = request, auth = true, origin = 'http://localhost:8081') {
  return worker.fetch(new Request('https://worker.example/answer', { method: 'POST', headers: {
    'Content-Type': 'application/json', ...(auth ? { Authorization: 'Bearer test-only-code' } : {}), Origin: origin }, body: JSON.stringify(body) }), env);
}
it('fails closed for unauthorized, forbidden origins and unconfigured models without inference', async () => {
  expect((await call(request, false)).status).toBe(401);
  expect((await call(request, true, 'https://untrusted.example')).status).toBe(403);
  env.MODEL = ''; expect((await call()).status).toBe(503);
  expect(env.AI.run).not.toHaveBeenCalled();
});
it('rejects oversized input and enforces a demo rate limit before generation', async () => {
  expect((await call({ ...request, pages: [{ id: 'p', text: 'x'.repeat(4501) }] })).status).toBe(400);
  vi.mocked(env.REQUEST_LIMITER.limit).mockResolvedValueOnce({ success: false });
  const result = await call(); expect(result.status).toBe(429); expect(result.headers.get('Retry-After')).toBe('60');
  expect(env.AI.run).not.toHaveBeenCalled();
});
it('returns matching source metadata and exact evidence without exposing credentials', async () => {
  const result = await call(); expect(result.status).toBe(200);
  const text = await result.text(); expect(text).not.toContain(env.DEMO_ACCESS_CODE);
  expect(JSON.parse(text)).toMatchObject({ mode: 'cloud', model: env.MODEL, sourceRevision: request.sourceRevision, output });
  expect(result.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:8081');
});
it('rejects hallucinated quotations and handles quota failures', async () => {
  vi.mocked(env.AI.run).mockResolvedValueOnce({ response: JSON.stringify({ ...output, evidence: [{ pageId: 'page-1', quote: 'Imaginary' }] }) });
  expect((await call()).status).toBe(502);
  vi.mocked(env.AI.run).mockRejectedValueOnce(new Error('quota exceeded')); expect((await call()).status).toBe(429);
});
it('reports JSON rejection without exposing provider text, and accepts a structured abstention', async () => {
  vi.mocked(env.AI.run).mockResolvedValueOnce({ response: 'This is not in this lesson. private-marker' });
  const failed = await call(checks[1].request);
  const body = await failed.text();
  expect(failed.status).toBe(502); expect(JSON.parse(body).category).toBe('json');
  expect(body).not.toContain('private-marker');
  vi.mocked(env.AI.run).mockResolvedValueOnce({ response: JSON.stringify({ answer: 'This is not in this lesson.', supported: false, evidence: [] }) });
  expect((await call(checks[1].request)).status).toBe(200);
});
it('times out a hanging AI call and recovers with another independent request', async () => {
  vi.useFakeTimers();
  try {
    vi.mocked(env.AI.run).mockImplementationOnce(() => new Promise(() => {}));
    const result = call();
    await vi.advanceTimersByTimeAsync(45010);
    expect((await result).status).toBe(504);
    expect((await call()).status).toBe(200);
  } finally { vi.useRealTimers(); }
});
