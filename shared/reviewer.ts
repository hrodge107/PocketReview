import { object, validateAnswer, validateRequest, validateResponseMetadata, type Language, type ModelRequest, type ModelResponse } from './model';
import type { Lesson } from './lesson';
export interface StudyContent { question: string; answer: string; evidence: { pageId: string; quote: string }[] }
export interface ReviewerRequest extends ModelRequest { count: 1 | 2; previousQuestions: string[] }
export interface ReviewerResponse extends Omit<ModelResponse, 'output'> { output: { items: StudyContent[] } }
export interface StudyItem extends StudyContent {
  mode?: 'mock' | 'cloud';
  id: string; language: Language; sourceRevision: string; provider: string; model: string; modelRevision: string;
}
const normalized = (question: string) => question.trim().toLocaleLowerCase().replace(/\s+/g, '');
export function validateReviewerRequest(value: unknown): ReviewerRequest {
  const source = validateRequest(value);
  if (!object(value) || typeof value.count !== 'number' || ![1,2].includes(value.count) || !Array.isArray(value.previousQuestions) || value.previousQuestions.length > 4 ||
    value.previousQuestions.some(question => typeof question !== 'string' || question.length > 240 || !question.trim())) throw Error('Use a batch of one or two study items with at most four prior questions.');
  return { ...source, count: value.count as 1 | 2, previousQuestions: value.previousQuestions as string[] };
}
export function validateStudyBatch(value: unknown, request: ReviewerRequest): StudyContent[] {
  if (!object(value) || !Array.isArray(value.items) || value.items.length !== request.count) throw Error('The model returned an invalid study-item count.');
  const previous = new Set(request.previousQuestions.map(normalized));
  return value.items.map((item: unknown) => {
    if (!object(item) || typeof item.question !== 'string' || !item.question.trim() || item.question.length > 240) throw Error('The model returned an invalid study question.');
    const key = normalized(item.question);
    if (previous.has(key)) throw Error('The model repeated a study question.');
    previous.add(key);
    const answer = validateAnswer({ answer: item.answer, supported: true, evidence: item.evidence }, request);
    return { question: item.question, answer: answer.answer, evidence: answer.evidence };
  });
}
export function validateReviewerResponse(value: unknown, request: ReviewerRequest, mode: 'mock' | 'cloud' = 'cloud'): ReviewerResponse {
  const metadata = validateResponseMetadata(value, request, mode);
  return { ...metadata, output: { items: validateStudyBatch((value as Record<string, unknown>).output, request) } };
}
export function reviewerRequest(lesson: Lesson, language: Language, count: 1 | 2, previousQuestions: string[]): ReviewerRequest {
  if (!lesson.confirmed) throw Error('Confirm the corrected source before generating a reviewer.');
  return validateReviewerRequest({ version: 1, sourceRevision: `source-${lesson.revision}`, language,
    pages: lesson.pages.map(page => ({ id: page.id, text: page.correctedText })), question: 'Create source-linked study items.', count, previousQuestions });
}
export function validateSavedItems(value: unknown, lesson: Pick<Lesson, 'confirmed' | 'revision' | 'pages'>): StudyItem[] {
  if (!Array.isArray(value) || (value.length !== 0 && value.length !== 5)) throw Error('Saved reviewer must contain five complete items.');
  if (!value.length) return [];
  if (!lesson.confirmed) throw Error('Saved reviewer requires confirmed source.');
  const questions: string[] = [], ids = new Set<string>();
  return value.map(item => {
    if (!object(item) || typeof item.id !== 'string' || item.id.length > 80 || ids.has(item.id) || !item.id || !['English','Filipino'].includes(String(item.language)) || item.language !== value[0].language) throw Error('Saved reviewer identity or language is invalid.');
    ids.add(item.id);
    const request = validateReviewerRequest({ version: 1, sourceRevision: `source-${lesson.revision}`, language: item.language,
      pages: lesson.pages.map(page => ({ id: page.id, text: page.correctedText })), question: 'Create source-linked study items.', count: 1, previousQuestions: questions });
    if (item.mode !== undefined && item.mode !== 'mock' && item.mode !== 'cloud') throw Error('Saved reviewer mode is invalid.');
    const mode = item.mode === 'mock' ? 'mock' : 'cloud';
    const response = validateReviewerResponse({ version: 1, mode, sourceRevision: item.sourceRevision,
      provider: item.provider, model: item.model, revision: item.modelRevision, output: { items: [item] } }, request, mode);
    questions.push(response.output.items[0].question);
    return { ...response.output.items[0], id: item.id, language: request.language, sourceRevision: response.sourceRevision,
      provider: response.provider, model: response.model, modelRevision: response.revision, mode };
  });
}
