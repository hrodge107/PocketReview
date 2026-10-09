import { bounded, validateRequest, validateResponse,
  type ModelRequest, type ModelResponse, type ExecutionMode } from '../shared/model';
import { checks } from './checks';
import { cloudTransport } from './cloud-transport';

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
  const send = cloudTransport(endpoint, demoAccessCode);
  return { mode: 'cloud', answer: async (input, signal) => {
    const request = validateRequest(input);
    return validateResponse(await send('/answer', request, signal), request, 'cloud');
  } };
}
