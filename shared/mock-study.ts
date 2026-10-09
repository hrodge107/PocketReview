import { changedSource, emptyLesson, type Lesson } from './lesson';
import type { Language } from './model';
import type { StudyItem } from './reviewer';
export const demoFacts = [
  { quote: 'Plants make food through photosynthesis.', en: ['How do plants make food?', 'Through photosynthesis.'], fil: ['Paano gumagawa ng pagkain ang mga halaman?', 'Sa pamamagitan ng photosynthesis.'] },
  { quote: 'Chlorophyll absorbs light.', en: ['What absorbs light?', 'Chlorophyll absorbs light.'], fil: ['Ano ang sumisipsip ng liwanag?', 'Chlorophyll ang sumisipsip ng liwanag.'] },
  { quote: 'Roots absorb water from soil.', en: ['Where do roots get water?', 'Roots absorb water from soil.'], fil: ['Saan kumukuha ng tubig ang mga ugat?', 'Sumisipsip ng tubig ang mga ugat mula sa lupa.'] },
  { quote: 'Leaves exchange gases through stomata.', en: ['Where do leaves exchange gases?', 'Through stomata.'], fil: ['Saan nagpapalitan ng mga gas ang mga dahon?', 'Sa pamamagitan ng stomata.'] },
  { quote: 'Photosynthesis releases oxygen.', en: ['What does photosynthesis release?', 'Oxygen.'], fil: ['Ano ang inilalabas ng photosynthesis?', 'Oxygen.'] },
];
export function demoLesson(): Lesson {
  const text = demoFacts.map(fact => fact.quote).join('\n');
  return changedSource(emptyLesson(), [{ id: 'page-1', name: 'Demo lesson (typed fixture; image placeholder)',
    photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRf8AAAAASUVORK5CYII=',
    rawText: text, correctedText: text, ocrState: 'complete', error: null }]);
}
export function mockReviewer(lesson: Lesson, language: Language): StudyItem[] {
  if (!lesson.confirmed) throw Error('Confirm corrected text before creating a reviewer.');
  const excerpts = lesson.pages.flatMap(page => page.correctedText.split(/(?<=[.!?])\s+|\n+/)
    .map(quote => ({ pageId: page.id, quote: quote.trim() })).filter(entry => entry.quote.length > 3 && entry.quote.length <= 500));
  const unique = excerpts.filter((entry, index) => excerpts.findIndex(other => other.quote === entry.quote) === index).slice(0, 5);
  if (unique.length < 5) throw Error('Mock mode needs five distinct short sentences or lines. Add more corrected text, then confirm again.');
  return unique.map((entry, index) => {
    const known = demoFacts.find(fact => fact.quote === entry.quote), wording = known?.[language === 'English' ? 'en' : 'fil'];
    return { id: `source-${lesson.revision}-item-${index + 1}`, language, mode: 'mock', sourceRevision: `source-${lesson.revision}`,
      question: wording?.[0] ?? (language === 'English' ? `What does excerpt ${index + 1} state?` : `Ano ang sinasabi ng sipi ${index + 1}?`),
      answer: wording?.[1] ?? entry.quote, evidence: [entry], provider: 'PocketReview mock', model: 'deterministic-excerpts', modelRevision: '1' };
  });
}
