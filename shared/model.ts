export type Language = 'English' | 'Filipino';
export type ExecutionMode = 'mock' | 'cloud';
export interface ModelRequest {
  version: 1;
  sourceRevision: string;
  language: Language;
  pages: { id: string; text: string }[];
  question: string;
}
export interface Answer {
  answer: string;
  supported: boolean;
  evidence: { pageId: string; quote: string }[];
}
export interface ModelResponse {
  version: 1;
  mode: ExecutionMode;
  provider: string;
  model: string;
  revision: string;
  sourceRevision: string;
  output: Answer;
}
export const SOURCE_CHARACTER_LIMIT = 4500;
export const REQUEST_BYTE_LIMIT = 20000;
export const RESPONSE_BYTE_LIMIT = 20000;
export const REQUEST_TIMEOUT_MS = 60000;
export const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function validateRequest(value: unknown): ModelRequest {
  if (!object(value) || value.version !== 1 || typeof value.sourceRevision !== 'string' ||
    !value.sourceRevision.trim() || value.sourceRevision.length > 80 ||
    !['English', 'Filipino'].includes(String(value.language)) ||
    !Array.isArray(value.pages) || value.pages.length < 1 || value.pages.length > 2 ||
    typeof value.question !== 'string' || !value.question.trim() || value.question.length > 300) {
    throw new Error('Use one or two confirmed pages, a short question, and English or Filipino.');
  }
  const pages = value.pages.map((page: unknown) => {
    if (!object(page) || typeof page.id !== 'string' || !/^[a-zA-Z0-9_-]{1,40}$/.test(page.id) ||
      typeof page.text !== 'string' || !page.text.trim()) throw new Error('Each page needs an ID and confirmed text.');
    return { id: page.id, text: page.text };
  });
  if (new Set(pages.map(page => page.id)).size !== pages.length) throw new Error('Page IDs must be unique.');
  if (pages.reduce((size, page) => size + page.text.length, 0) > SOURCE_CHARACTER_LIMIT) {
    throw new Error(`Shorten the lesson to ${SOURCE_CHARACTER_LIMIT} characters before generating.`);
  }
  return { version: 1, sourceRevision: value.sourceRevision, language: value.language as Language,
    pages, question: value.question };
}

export function validateAnswer(value: unknown, request: ModelRequest): Answer {
  if (!object(value) || typeof value.answer !== 'string' || !value.answer.trim() ||
    value.answer.length > 600 || typeof value.supported !== 'boolean' ||
    !Array.isArray(value.evidence) || value.evidence.length > 3) throw new Error('The model returned an invalid answer structure. Retry once.');
  const evidence = value.evidence.map((entry: unknown) => {
    if (!object(entry) || typeof entry.pageId !== 'string' || typeof entry.quote !== 'string' ||
      !entry.quote.trim() || entry.quote.length > 600 ||
      !request.pages.some(page => page.id === entry.pageId && page.text.includes(entry.quote as string))) {
      throw new Error('The answer contains a source quotation that could not be verified.');
    }
    return { pageId: entry.pageId, quote: entry.quote };
  });
  if ((value.supported && evidence.length === 0) || (!value.supported && evidence.length !== 0)) {
    throw new Error('Supported answers need evidence; absent answers must have none.');
  }
  return { answer: value.answer, supported: value.supported, evidence };
}

export function validateResponse(value: unknown, request: ModelRequest, mode: ExecutionMode): ModelResponse {
  if (!object(value) || value.version !== 1 || value.mode !== mode || value.sourceRevision !== request.sourceRevision ||
    !['provider', 'model', 'revision'].every(key => typeof value[key] === 'string' && (value[key] as string).trim().length > 0 && (value[key] as string).length <= 160)) {
    throw new Error('The service returned mismatched source or deployment metadata.');
  }
  return { version: 1, mode, sourceRevision: request.sourceRevision, provider: value.provider as string,
    model: value.model as string, revision: value.revision as string, output: validateAnswer(value.output, request) };
}

export async function bounded<T>(operation: (signal: AbortSignal) => Promise<T>, external?: AbortSignal, timeout = REQUEST_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let listener: (() => void) | undefined;
  const interrupted = new Promise<never>((_, reject) => {
    listener = () => { controller.abort(); reject(new Error('Cancelled. Previous results are preserved.')); };
    if (external?.aborted) listener();
    else external?.addEventListener('abort', listener, { once: true });
    timer = setTimeout(() => { controller.abort(); reject(new Error('The service timed out. Check the endpoint and retry.')); }, timeout);
  });
  try {
    if (external?.aborted) return await interrupted;
    return await Promise.race([operation(controller.signal), interrupted]);
  } finally {
    clearTimeout(timer);
    if (listener) external?.removeEventListener('abort', listener);
  }
}

export async function readBounded(response: Pick<Response, 'body'>, limit: number, signal?: AbortSignal): Promise<string> {
  if (!response.body) throw new Error('Empty response body.');
  const reader = response.body.getReader();
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal?.addEventListener('abort', cancel, { once: true });
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new Error('Request or response exceeds the allowed size.'); }
      chunks.push(value);
    }
  } finally { signal?.removeEventListener('abort', cancel); reader.releaseLock(); }
  if (signal?.aborted) throw new Error('Cancelled.');
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(bytes);
}
