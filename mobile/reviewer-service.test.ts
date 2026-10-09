import { expect, it, vi } from 'vitest';
import { changedSource, confirmSource, emptyLesson } from '../shared/lesson';
import type { ReviewerRequest } from '../shared/reviewer';
import { CloudFailure } from './cloud-transport';
import { generateReviewer } from './reviewer-service';
const text = 'Closed circuits allow current to flow. Open circuits interrupt current. Batteries supply energy. Switches control circuits. Wires conduct current. Lamps emit light.';
const lesson = confirmSource(changedSource(emptyLesson(), [{ id: 'page-1', name: 'Fixture', photo: 'data:image/png;base64,YQ==', rawText: text,
  correctedText: text, ocrState: 'complete', error: null }]));
function response(request: ReviewerRequest) {
  return { version: 1, mode: 'cloud', provider: 'fixture', model: 'test-model', revision: 'test-revision', sourceRevision: request.sourceRevision,
    output: { items: Array.from({ length: request.count }, (_, index) => ({ question: `Question ${request.previousQuestions.length + index + 1}?`,
      answer: request.pages[0].text.split('\n')[index], evidence: [{ pageId: 'page-1', quote: request.pages[0].text.split('\n')[index] }] })) } };
}
it('generates sequential 2/2/1 batches with stable IDs and only one invalid-output retry', async () => {
  const send = vi.fn(async (request: ReviewerRequest) => response(request)).mockResolvedValueOnce({} as ReturnType<typeof response>);
  const items = await generateReviewer(lesson, 'Filipino', send, new AbortController().signal, () => {});
  expect(send.mock.calls.map(([request]) => request.count)).toEqual([2,2,2,1]);
  expect(items).toHaveLength(5); expect(new Set(items.map(item => item.id)).size).toBe(5);
  expect(items.every(item => item.language === 'Filipino')).toBe(true);
  expect(lesson.studyItems).toEqual([]);
});
it('does not retry quota failures or accept a partially failed reviewer', async () => {
  const quota = vi.fn().mockRejectedValue(new CloudFailure('Quota exceeded'));
  await expect(generateReviewer(lesson, 'English', quota, new AbortController().signal, () => {})).rejects.toThrow('Quota');
  expect(quota).toHaveBeenCalledTimes(1);
  const invalid = vi.fn().mockResolvedValue({});
  await expect(generateReviewer(lesson, 'English', invalid, new AbortController().signal, () => {})).rejects.toThrow('metadata');
  expect(invalid).toHaveBeenCalledTimes(2);
});
it('rejects cancellation even if the final provider response arrives afterward', async () => {
  const controller = new AbortController();
  const send = vi.fn(async (request: ReviewerRequest) => { if (request.count === 1) controller.abort(); return response(request); });
  await expect(generateReviewer(lesson, 'English', send, controller.signal, () => {})).rejects.toThrow('cancelled');
});
it('omits covered source sentences from later inputs without editing the confirmed lesson', async () => {
  const original = lesson.pages[0].correctedText;
  const send = vi.fn(async (request: ReviewerRequest) => response(request));
  await generateReviewer(lesson, 'English', send, new AbortController().signal, () => {});
  expect(send.mock.calls[0][0].pages[0].text).toContain('Closed circuits allow current to flow.');
  expect(send.mock.calls[1][0].pages[0].text).not.toContain('Closed circuits allow current to flow.');
  expect(send.mock.calls[1][0].pages[0].text).not.toContain('Open circuits interrupt current.');
  expect(send.mock.calls[1][0].pages[0].text).toContain('Batteries supply energy.');
  expect(lesson.pages[0].correctedText).toBe(original);
});
it('rejects a later batch quoting an already-covered fact even when it exists in the original lesson', async () => {
  const original = JSON.stringify(lesson);
  const send = vi.fn(async (request: ReviewerRequest) => {
    const result = response(request);
    if (request.previousQuestions.length) result.output.items[0].evidence[0].quote = 'Closed circuits allow current to flow.';
    return result;
  });
  await expect(generateReviewer(lesson, 'English', send, new AbortController().signal, () => {})).rejects.toThrow('quotation');
  expect(send).toHaveBeenCalledTimes(3);
  expect(JSON.stringify(lesson)).toBe(original);
});
