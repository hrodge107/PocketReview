import { bounded, object, readBounded, RESPONSE_BYTE_LIMIT, validateRequest, validateResponse,
  type ModelRequest, type ModelResponse, type ExecutionMode } from '../shared/model';
import { checks } from './checks';

export interface ModelService {
  mode: ExecutionMode;
  answer(request: ModelRequest, signal?: AbortSignal): Promise<ModelResponse>;
}
export const mockService: ModelService = {
  mode: 'mock',
  answer: (input, signal) => bounded(async abort => {
    const request = validateRequest(input);
    await new Promise<void>(resolve => setTimeout(resolve, 250));
    if (abort.aborted) throw new Error('Cancelled.');
    const check = checks.find(entry => JSON.stringify(entry.request) === JSON.stringify(request));
    if (!check) throw new Error('The mock supports the four setup samples only.');
    const supported = check.id.endsWith('-supported');
    const answer = supported ? (request.language === 'English' ? 'Opening the switch breaks the circuit and stops the current.' : 'Napupuputol ang sirkito at humihinto ang daloy ng kuryente.') :
      (request.language === 'English' ? 'The battery voltage is not in this lesson.' : 'Walang nakasaad na boltahe ng baterya sa araling ito.');
    return validateResponse({ version: 1, mode: 'mock', provider: 'fixture', model: 'setup-fixture', revision: '1',
      sourceRevision: request.sourceRevision, output: { answer, supported,
        evidence: supported ? [{ pageId: 'page-1', quote: request.pages[0].text.split('. ')[1] }] : [] } }, request, 'mock');
  }, signal),
};

export function cloudService(endpoint: string, demoAccessCode: string): ModelService {
  return { mode: 'cloud', answer: (input, signal) => bounded(async abort => {
    const request = validateRequest(input);
    let url: URL;
    try { url = new URL(endpoint); } catch { throw new Error('Enter your Worker URL before using cloud mode.'); }
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) {
      throw new Error('Use HTTPS for the Worker, or localhost for development.');
    }
    if (!demoAccessCode.trim()) throw new Error('Enter the demo access code supplied by the Worker owner.');
    if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new Error('Cloud answers need internet. Your saved results remain available.');
    const response = await fetch(new URL('/answer', url), { method: 'POST', signal: abort,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${demoAccessCode}` }, body: JSON.stringify(request) });
    const text = await readBounded(response, RESPONSE_BYTE_LIMIT);
    let data: unknown;
    try { data = JSON.parse(text); } catch { throw new Error('The Worker returned unreadable data. Check its URL and configuration.'); }
    if (!response.ok) {
      const message = object(data) && typeof data.error === 'string' ? data.error.slice(0, 300) : `The service rejected the request (${response.status}).`;
      throw new Error(message);
    }
    return validateResponse(data, request, 'cloud');
  }, signal) };
}
