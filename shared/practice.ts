import type { StudyItem } from './reviewer';
import type { Lesson } from './lesson';
import type { Language } from './model';
import { demoFacts } from './mock-study';
export function quiz(items: StudyItem[]) {
  if (items.length !== 5 || new Set(items.map(item => item.answer)).size < 3) return [];
  return items.slice(0, 3).map((item, index) => {
    const wrong = items.filter(other => other.answer !== item.answer).filter((other, n, all) => all.findIndex(candidate => candidate.answer === other.answer) === n).slice(0, 2);
    const choices = [{ id: item.id, text: item.answer }, ...wrong.map(other => ({ id: other.id, text: other.answer }))];
    const offset = index % choices.length;
    return { item, choices: [...choices.slice(offset), ...choices.slice(0, offset)], correctId: item.id };
  });
}
export interface ChatEntry { question: string; answer: string; language: Language; evidence: {pageId: string; quote: string}[]; supported: boolean; mode: 'mock' }
const ignored = new Set(['what','does','which','where','from','through','the','are','how','ang','mga','ano','paano','saan','ng','sa','do','can','about','please','tell','lesson','aralin']);
const tokens = (text: string) => (text.toLowerCase().match(/[\p{L}]+/gu) ?? []).filter(word => word.length > 2 && !ignored.has(word));
export function mockChat(lesson: Lesson, question: string, language: Language): ChatEntry {
  if (!lesson.confirmed || !question.trim() || question.length > 300) throw Error('Confirm your source and ask a question within 300 characters.');
  const words = tokens(question), sentences = lesson.pages.flatMap(page => page.correctedText.split(/(?<=[.!?])\s+|\n+/).map(quote => ({ pageId: page.id, quote: quote.trim() })).filter(entry => entry.quote.length <= 500));
  const synonyms: Record<string,string> = { ugat: 'roots', tubig: 'water', lupa: 'soil', dahon: 'leaves', liwanag: 'light', pagkain: 'food', halaman: 'plants', oksiheno: 'oxygen', fotosintesis: 'photosynthesis' };
  const scored = sentences.map(entry => ({ ...entry, score: words.reduce((sum, word) => sum + (tokens(entry.quote).includes(synonyms[word] ?? word) ? 1 : 0), 0) })).sort((a,b) => b.score-a.score);
  const hit = scored[0], known = demoFacts.find(fact => fact.quote === hit?.quote);
  // Only a fixture's question or an explicit excerpt lookup earns a mock supported answer.
  const asksLookup = /excerpt|sipi|what.*(absorb|release|food|water)|where.*(water|gas)|ano.*(sumisipsip|inilalabas|pagkain)|saan.*(tubig|gas)|paano.*pagkain/i.test(question);
  const supported = !!hit?.score && (asksLookup || !!known && question.trim().toLowerCase() === known[language === 'English' ? 'en' : 'fil'][0].toLowerCase());
  return { question: question.trim(), language, mode: 'mock', supported,
    answer: supported ? known?.[language === 'English' ? 'en' : 'fil'][1] ?? hit.quote : language === 'English' ? 'Not found by this mock in the lesson. Try an excerpt question; this is keyword matching, not AI reasoning.' : 'Hindi nakita ng mock sa aralin. Subukang magtanong tungkol sa isang sipi; hindi ito AI.',
    evidence: supported ? [{ pageId: hit.pageId, quote: hit.quote }] : [] };
}
