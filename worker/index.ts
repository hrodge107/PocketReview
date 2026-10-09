import { bounded, readBounded, REQUEST_BYTE_LIMIT, validateRequest } from '../shared/model';
import { infer, InvalidModelAnswerError, type AiBinding } from './inference';
export interface Env {
  AI: AiBinding;
  DEMO_ACCESS_CODE: string;
  MODEL: string;
  MODEL_REVISION: string;
  ALLOWED_ORIGINS: string;
  REQUEST_LIMITER: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
    const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin' });
    const reply = (status: number, error: string) => new Response(JSON.stringify({ error }), { status, headers });
    if (origin && !allowed.includes(origin)) return reply(403, 'This app origin is not allowed by the Worker.');
    if (origin) headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (new URL(request.url).pathname !== '/answer') return reply(404, 'Use the /answer endpoint.');
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return reply(405, 'Use POST for an answer.');
    if (!env.DEMO_ACCESS_CODE || !env.MODEL || !env.MODEL_REVISION || !env.AI || !env.REQUEST_LIMITER) {
      return reply(503, 'The Worker owner must configure model identity, AI, access code and rate limiting.');
    }
    if (request.headers.get('Authorization') !== `Bearer ${env.DEMO_ACCESS_CODE}`) return reply(401, 'The demo access code is missing or incorrect.');
    if (!(request.headers.get('Content-Type') || '').startsWith('application/json')) return reply(415, 'Send confirmed text as JSON.');
    try {
      const { success } = await env.REQUEST_LIMITER.limit({ key: 'pocketreview-demo' });
      if (!success) { headers.set('Retry-After', '60'); return reply(429, 'Demo request limit reached. Wait one minute before retrying.'); }
    } catch { return reply(503, 'Rate limiting is unavailable. Retry when the Worker is ready.'); }
    let input;
    try {
      const text = await bounded(signal => readBounded(request, REQUEST_BYTE_LIMIT, signal), undefined, 5000);
      input = validateRequest(JSON.parse(text));
    } catch (error) { return reply(400, error instanceof Error ? error.message : 'Invalid confirmed lesson request.'); }
    try {
      const output = await infer(env.AI, env.MODEL, input);
      return new Response(JSON.stringify({ version: 1, mode: 'cloud', provider: 'Cloudflare Workers AI', model: env.MODEL,
        revision: env.MODEL_REVISION, sourceRevision: input.sourceRevision, output }), { headers });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (/timed out/i.test(message)) return reply(504, 'Cloud generation timed out. Your source is preserved; retry once.');
      if (/\bquota\b|\brate\b|\bcapacity\b|\blimit\b|\b429\b/i.test(message)) return reply(429, 'Workers AI allowance or capacity is unavailable. Check the dashboard before retrying.');
      if (error instanceof InvalidModelAnswerError) {
        console.warn(JSON.stringify({ event: 'model-answer-rejected', category: error.category }));
        return new Response(JSON.stringify({ error: 'The model returned an answer PocketReview could not verify. No answer was accepted. Check the Worker terminal before one retry.', category: error.category }), { status: 502, headers });
      }
      console.error('Workers AI request failed before a verified answer was returned. Provider error details were not logged.');
      return reply(502, 'Cloud generation failed or returned invalid source evidence. Check the model configuration and retry once.');
    }
  },
};
