import { expect, it } from 'vitest';
import { changedSource, confirmSource, decodeLesson, editSource, emptyLesson, type SourcePage } from './lesson';
const page: SourcePage = { id: 'page-1', name: 'Printed page', photo: 'data:image/png;base64,YQ==', rawText: 'Raw OCR', correctedText: 'A switch opens the circuit.', ocrState: 'complete', error: null };
it('source changes invalidate study/chat/progress and require confirmation again', () => {
  const lesson = { ...confirmSource(changedSource(emptyLesson(), [page])), studyItems: Array.from({ length: 5 }, (_, index) => ({ id: `old-${index}`, question: `Old question ${index}`, answer: 'Old answer', evidence: [{ pageId: page.id, quote: page.correctedText }], language: 'English' as const, sourceRevision: 'source-1', provider: 'fixture', model: 'test', modelRevision: '1' })), chatAnswers: [{ answer: 'old' }], quizProgress: { question: 'choice' } };
  const edited = editSource(lesson, page.id, 'A closed switch completes the circuit.');
  expect(edited.revision).toBe(lesson.revision + 1);
  expect(edited.confirmed).toBe(false);
  expect([edited.studyItems, edited.chatAnswers, edited.quizProgress]).toEqual([[], [], {}]);
  expect(edited.pages[0].rawText).toBe('Raw OCR');
  expect(editSource(lesson, page.id, page.correctedText)).toBe(lesson);
  expect(changedSource(lesson, []).studyItems).toEqual([]);
});
it('confirmation rejects empty and oversized pages without trimming', () => {
  expect(() => confirmSource(emptyLesson())).toThrow('Add a photo');
  expect(() => confirmSource(changedSource(emptyLesson(), [{ ...page, correctedText: '' }]))).toThrow('Every page');
  const large = changedSource(emptyLesson(), [{ ...page, correctedText: 'a'.repeat(4501) }]);
  expect(() => confirmSource(large)).toThrow('4,500');
  expect(large.pages[0].correctedText).toHaveLength(4501);
});
it('saved source round-trips and rejects inconsistent references/confirmation', () => {
  const lesson = confirmSource(changedSource(emptyLesson(), [page]));
  expect(decodeLesson(JSON.parse(JSON.stringify(lesson)))).toEqual(lesson);
  expect(() => decodeLesson({ ...lesson, pages: [page, page] })).toThrow('duplicated');
  expect(() => decodeLesson({ ...lesson, pages: [{ ...page, photo: 'https://remote/photo.jpg' }] })).toThrow('page');
  expect(() => decodeLesson({ ...lesson, pages: [{ ...page, correctedText: '' }] })).toThrow('confirmation');
});
