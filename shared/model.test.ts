import { describe, expect, it, vi } from 'vitest';
import { bounded, readBounded, SOURCE_CHARACTER_LIMIT, validateAnswer, validateRequest, validateResponse } from './model';
import { checks } from '../mobile/checks';
import { cloudService, mockService } from '../mobile/model-service';
const request = checks[0].request;
describe('lesson and evidence contract', () => {
  it('rejects oversized source, duplicate IDs, and stale responses', () => {
    expect(() => validateRequest({ ...request, pages: [{ id: 'p', text: 'x'.repeat(SOURCE_CHARACTER_LIMIT + 1) }] })).toThrow('Shorten');
    expect(() => validateRequest({ ...request, pages: [request.pages[0], request.pages[0]] })).toThrow('unique');
    expect(() => validateResponse({ version: 1, mode: 'cloud', sourceRevision: 'old' }, request, 'cloud')).toThrow('mismatched');
  });
  it('rejects nonexistent page IDs, invented quotes, absent evidence and malformed answers', () => {
    const valid = { answer: 'The current stops.', supported: true, evidence: [{ pageId: 'page-1', quote: request.pages[0].text }] };
    expect(validateAnswer(valid, request)).toEqual(valid);
    for (const evidence of [[{ pageId: 'page-2', quote: valid.evidence[0].quote }], [{ pageId: 'page-1', quote: 'Invented evidence' }], []]) {
      expect(() => validateAnswer({ ...valid, evidence }, request)).toThrow();
    }
    expect(() => validateAnswer({ ...valid, supported: false }, request)).toThrow('absent');
    expect(() => validateAnswer({ answer: '' }, request)).toThrow('structure');
  });
  it('never counts a mock as cloud and rejects requests outside fixtures', async () => {
    const result = await mockService.answer(request);
    expect(result.mode).toBe('mock');
    expect(() => validateResponse(result, request, 'cloud')).toThrow('metadata');
    await expect(mockService.answer({ ...request, question: 'A different question' })).rejects.toThrow('four setup');
  });
  it('cancels and bounds hanging operations without waiting for the provider', async () => {
    const controller = new AbortController();
    const pending = bounded(() => new Promise(() => {}), controller.signal);
    controller.abort(); await expect(pending).rejects.toThrow('Cancelled');
    await expect(bounded(() => new Promise(() => {}), undefined, 5)).rejects.toThrow('timed out');
  });
  it('rejects over-limit streams and missing endpoint access before network calls', async () => {
    await expect(readBounded(new Response('oversized'), 2)).rejects.toThrow('allowed size');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await expect(cloudService('', '').answer(request)).rejects.toThrow('Worker URL');
    await expect(cloudService('https://worker.example', '').answer(request)).rejects.toThrow('access code');
    expect(fetchSpy).not.toHaveBeenCalled(); fetchSpy.mockRestore();
  });
});
