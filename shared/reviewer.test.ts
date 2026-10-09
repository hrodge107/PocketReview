import { expect, it } from 'vitest';
import { applyReviewer, changedSource, confirmSource, emptyLesson } from './lesson';
import { reviewerRequest, validateReviewerRequest, validateReviewerResponse, validateStudyBatch, type StudyItem } from './reviewer';
const text = 'A closed circuit lets current flow. A switch can open a circuit.';
const lesson = confirmSource(changedSource(emptyLesson(), [{ id: 'page-1', name: 'Fixture', photo: 'data:image/png;base64,YQ==',
  rawText: text, correctedText: text, ocrState: 'complete', error: null }]));
const request = reviewerRequest(lesson, 'English', 1, []);
const item = { question: 'What lets current flow?', answer: 'A closed circuit.', evidence: [{ pageId: 'page-1', quote: 'A closed circuit lets current flow.' }] };
const metadata = { version: 1, mode: 'cloud', provider: 'fixture', model: 'test-model', revision: 'test-revision', sourceRevision: request.sourceRevision };
it('requires confirmation and strictly bounded batch sizes', () => {
  expect(() => reviewerRequest({ ...lesson, confirmed: false }, 'English', 1, [])).toThrow('Confirm');
  expect(() => validateReviewerRequest({ ...request, count: '1' })).toThrow('batch');
  expect(() => validateReviewerRequest({ ...request, count: 3 })).toThrow('batch');
  expect(() => validateReviewerRequest({ ...request, previousQuestions: Array(5).fill('Question') })).toThrow('batch');
});
it('rejects invalid count, quotations, repeated questions and stale response metadata', () => {
  expect(validateStudyBatch({ items: [item] }, request)).toEqual([item]);
  expect(() => validateStudyBatch({ items: [] }, request)).toThrow('count');
  expect(() => validateStudyBatch({ items: [{ ...item, evidence: [{ pageId: 'wrong', quote: text }] }] }, request)).toThrow('quotation');
  expect(() => validateStudyBatch({ items: [{ ...item, evidence: [{ pageId: 'page-1', quote: 'Invented words' }] }] }, request)).toThrow('quotation');
  expect(() => validateStudyBatch({ items: [item] }, { ...request, previousQuestions: [' WHAT LETS CURRENT FLOW? '] })).toThrow('repeated');
  expect(() => validateReviewerResponse({ ...metadata, sourceRevision: 'old', output: { items: [item] } }, request)).toThrow('metadata');
});
it('saves only complete current-source reviewers and invalidates them on source edits', () => {
  const items: StudyItem[] = Array.from({ length: 5 }, (_, index) => ({ ...item, id: `item-${index}`, question: `${item.question} ${index}`,
    language: 'English', sourceRevision: request.sourceRevision, provider: 'fixture', model: 'test-model', modelRevision: 'test-revision' }));
  const saved = applyReviewer(lesson, items);
  expect(saved.studyItems).toHaveLength(5);
  expect(changedSource(saved, saved.pages).studyItems).toEqual([]);
  expect(() => applyReviewer(lesson, items.slice(0, 4))).toThrow('five');
  expect(() => applyReviewer({ ...lesson, revision: lesson.revision + 1 }, items)).toThrow('metadata');
});
