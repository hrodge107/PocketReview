import type { Lesson } from '../shared/lesson';
export const reviewerSource = 'Plants make food through photosynthesis. Chlorophyll absorbs light. Roots absorb water from soil. Leaves exchange gases through stomata. Carbon dioxide enters through stomata. Photosynthesis releases oxygen. Sunlight provides energy for photosynthesis.';
export const reviewerFixture: Lesson = { version: 1, id: 'lesson', revision: 1, confirmed: true,
  pages: [{ id: 'page-1', name: 'Synthetic biology fixture', photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRf8AAAAASUVORK5CYII=',
    rawText: reviewerSource, correctedText: reviewerSource, ocrState: 'complete', error: null }],
  studyItems: [], chatAnswers: [], quizProgress: {} };
