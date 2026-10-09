import { object } from './model';
import { validateSavedItems, type StudyItem } from './reviewer';
export const SOURCE_LIMIT = 4500;
export const PHOTO_LIMIT = 2 * 1024 * 1024;
export interface SourcePage {
  id: string; name: string; photo: string; rawText: string; correctedText: string;
  ocrState: 'pending' | 'complete' | 'failed'; error: string | null;
}
export interface Lesson {
  version: 1; id: 'lesson'; revision: number; confirmed: boolean; pages: SourcePage[];
  studyItems: StudyItem[]; chatAnswers: unknown[]; quizProgress: Record<string, string>;
}
export const emptyLesson = (): Lesson => ({ version: 1, id: 'lesson', revision: 0, confirmed: false,
  pages: [], studyItems: [], chatAnswers: [], quizProgress: {} });
export function changedSource(lesson: Lesson, pages: SourcePage[]): Lesson {
  return { ...lesson, pages, revision: lesson.revision + 1, confirmed: false, studyItems: [], chatAnswers: [], quizProgress: {} };
}
export function editSource(lesson: Lesson, id: string, text: string): Lesson {
  if (!lesson.pages.some(page => page.id === id)) throw Error('This source page is unavailable.');
  if (lesson.pages.find(page => page.id === id)!.correctedText === text) return lesson;
  return changedSource(lesson, lesson.pages.map(page => page.id === id ? { ...page, correctedText: text } : page));
}
export function confirmationError(lesson: Lesson): string | null {
  if (!lesson.pages.length) return 'Add a photo before confirming the source.';
  if (lesson.pages.some(page => !page.correctedText.trim())) return 'Every page needs corrected text. Type missing text or remove the empty page.';
  if (lesson.pages.reduce((total, page) => total + page.correctedText.length, 0) > SOURCE_LIMIT) return 'Keep the combined source within 4,500 characters. Narrow the excerpt before confirming.';
  return null;
}
export function confirmSource(lesson: Lesson): Lesson {
  const error = confirmationError(lesson); if (error) throw Error(error);
  return { ...lesson, confirmed: true };
}
export function decodeLesson(input: unknown): Lesson {
  if (!object(input) || input.version !== 1 || input.id !== 'lesson' || !Number.isSafeInteger(input.revision) || Number(input.revision) < 0 ||
    typeof input.confirmed !== 'boolean' || !Array.isArray(input.pages) || input.pages.length > 2 ||
    !Array.isArray(input.studyItems) || !Array.isArray(input.chatAnswers) || !object(input.quizProgress) ||
    Object.values(input.quizProgress).some(value => typeof value !== 'string')) throw Error('Saved lesson format is invalid. Reading must succeed before making changes.');
  const pages: SourcePage[] = input.pages.map((page: unknown) => {
    if (!object(page) || typeof page.id !== 'string' || !page.id || typeof page.name !== 'string' ||
      typeof page.photo !== 'string' || !/^data:image\/(png|jpeg|webp);base64,/.test(page.photo) || page.photo.length > PHOTO_LIMIT ||
      typeof page.rawText !== 'string' || typeof page.correctedText !== 'string' || page.rawText.length > 50000 || page.correctedText.length > 50000 ||
      !['pending','complete','failed'].includes(String(page.ocrState)) || !(page.error === null || typeof page.error === 'string')) throw Error('Saved source page is invalid.');
    return page as unknown as SourcePage;
  });
  if (new Set(pages.map(page => page.id)).size !== pages.length) throw Error('Saved page references are duplicated.');
  const lesson = { ...input, pages } as unknown as Lesson;
  if (lesson.confirmed && confirmationError(lesson)) throw Error('Saved confirmation does not match its source.');
  const studyItems = validateSavedItems(input.studyItems, lesson);
  const quizIds = studyItems.slice(0,3).map(item => item.id);
  if (Object.entries(lesson.quizProgress).some(([id,choice]) => !quizIds.includes(id) || !quizIds.includes(choice))) throw Error('Saved quiz progress does not match the current reviewer.');
  if (lesson.chatAnswers.length > 20 || lesson.chatAnswers.some(entry => !object(entry) || entry.mode !== 'mock' ||
    typeof entry.question !== 'string' || !entry.question.trim() || entry.question.length > 300 || typeof entry.answer !== 'string' || !entry.answer || entry.answer.length > 600 ||
    !['English','Filipino'].includes(String(entry.language)) || typeof entry.supported !== 'boolean' || !Array.isArray(entry.evidence) || entry.evidence.length > 3 ||
    entry.evidence.some(e => !object(e) || typeof e.pageId !== 'string' || typeof e.quote !== 'string' || !e.quote || !pages.some(page => page.id === e.pageId && page.correctedText.includes(e.quote as string))) ||
    (entry.supported ? !entry.evidence.length : !!entry.evidence.length)) || (!lesson.confirmed && lesson.chatAnswers.length)) throw Error('Saved chat does not match the confirmed lesson.');
  return { ...lesson, studyItems };
}
export function applyReviewer(lesson: Lesson, items: StudyItem[]): Lesson {
  return { ...lesson, studyItems: validateSavedItems(items, lesson), chatAnswers: [], quizProgress: {} };
}
