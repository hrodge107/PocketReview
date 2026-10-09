import { bounded, object, readBounded, RESPONSE_BYTE_LIMIT } from '../shared/model';
export class CloudFailure extends Error { constructor(message: string, readonly retryableOutput = false) { super(message); } }
export function cloudTransport(endpoint: string, access: string) {
  return (path: '/answer' | '/reviewer', request: unknown, signal?: AbortSignal): Promise<unknown> => bounded(async abort => {
    let url: URL;
    try { url = new URL(endpoint); } catch { throw Error('Enter your Worker URL before using cloud mode.'); }
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) throw Error('Use HTTPS for the Worker, or localhost for development.');
    if (!access.trim()) throw Error('Enter the demo access code supplied by the Worker owner.');
    if (typeof navigator !== 'undefined' && navigator.onLine === false) throw Error('Cloud answers need internet. Your saved results remain available.');
    const response = await fetch(new URL(path, url), { method: 'POST', signal: abort,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` }, body: JSON.stringify(request) });
    const text = await readBounded(response, RESPONSE_BYTE_LIMIT, abort);
    let data: unknown;
    try { data = JSON.parse(text); } catch { throw new CloudFailure('The Worker returned unreadable data. Check its URL and configuration.'); }
    if (!response.ok) {
      const message = object(data) && typeof data.error === 'string' ? data.error.slice(0, 300) : `The service rejected the request (${response.status}).`;
      throw new CloudFailure(message, response.status === 502 && object(data) && typeof data.category === 'string');
    }
    return data;
  }, signal);
}
