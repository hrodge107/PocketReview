import type { Language } from '../shared/model';
import type { Lesson } from '../shared/lesson';
import { reviewerRequest, validateReviewerResponse, type ReviewerRequest, type StudyItem } from '../shared/reviewer';
import { CloudFailure } from './cloud-transport';
export async function generateReviewer(lesson: Lesson, language: Language,
  send: (request: ReviewerRequest, signal: AbortSignal) => Promise<unknown>, signal: AbortSignal,
  progress: (message: string) => void): Promise<StudyItem[]> {
  const items: StudyItem[] = []; let retryRemaining = true;
  for (const count of [2,2,1] as const) {
    const originalRequest = reviewerRequest(lesson, language, count, items.map(item => item.question));
    const used = items.flatMap(item => item.evidence);
    const request = { ...originalRequest, pages: originalRequest.pages.map(page => ({ ...page,
      text: page.text.split(/(?<=[.!?])\s+|\n+/).filter(sentence => !used.some(entry => entry.pageId === page.id && (sentence.includes(entry.quote) || entry.quote.includes(sentence)))).join('\n'),
    })).filter(page => page.text.trim()) };
    if (!request.pages.length) throw Error('The source has too few unused facts for five items. Add more confirmed lesson text or use a broader excerpt.');
    let done = false;
    while (!done) {
      if (signal.aborted) throw Error('Generation cancelled. Your previous reviewer is preserved.');
      progress(`Generating items ${items.length + 1}-${items.length + count} of 5`);
      let response;
      try { response = await send(request, signal); }
      catch (error) {
        if (error instanceof CloudFailure && error.retryableOutput && retryRemaining) { retryRemaining = false; progress('Invalid model output; using the one allowed retry.'); continue; }
        throw error;
      }
      let verified;
      if (signal.aborted) throw Error('Generation cancelled. Your previous reviewer is preserved.');
      try { validateReviewerResponse(response, request); verified = validateReviewerResponse(response, originalRequest); }
      catch (error) { if (retryRemaining) { retryRemaining = false; progress('Unverifiable output; using the one allowed retry.'); continue; } throw error; }
      items.push(...verified.output.items.map((item, index) => ({ ...item, id: `${request.sourceRevision}-item-${items.length + index + 1}`,
        language, sourceRevision: request.sourceRevision, provider: verified.provider, model: verified.model, modelRevision: verified.revision })));
      done = true;
    }
  }
  return items;
}
