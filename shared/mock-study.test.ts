import { expect, it } from 'vitest';
import { applyReviewer, confirmSource, decodeLesson, editSource } from './lesson';
import { demoLesson, mockReviewer } from './mock-study';
import { mockChat, quiz } from './practice';
it('creates validated bilingual mock items with real fixture quotations and source invalidation', () => {
  const lesson = confirmSource(demoLesson());
  for (const language of ['English','Filipino'] as const) {
    const saved = applyReviewer(lesson, mockReviewer(lesson, language));
    expect(decodeLesson(saved).studyItems).toHaveLength(5);
    expect(saved.studyItems.every(item => item.mode === 'mock' && item.language === language)).toBe(true);
    expect(editSource(saved, 'page-1', 'Changed text.').studyItems).toEqual([]);
  }
  expect(() => mockReviewer(demoLesson(), 'English')).toThrow('Confirm');
});
it('scores stable choice IDs and retains current progress only', () => {
  const lesson = applyReviewer(confirmSource(demoLesson()), mockReviewer(confirmSource(demoLesson()), 'English'));
  const questions = quiz(lesson.studyItems);
  expect(questions).toHaveLength(3);
  expect(questions.every(question => question.choices.length === 3 && new Set(question.choices.map(c => c.id)).size === 3 && question.correctId === question.item.id)).toBe(true);
  expect(() => decodeLesson({ ...lesson, quizProgress: { stale: 'invalid' } })).toThrow('quiz progress');
});
it('mock chat supports fixture lookup and abstains on unknown topics without fabricating evidence', () => {
  const lesson = confirmSource(demoLesson());
  expect(mockChat(lesson, 'Where do roots get water?', 'English')).toMatchObject({ supported: true, answer: 'Roots absorb water from soil.' });
  expect(mockChat(lesson, 'Saan kumukuha ng tubig ang mga ugat?', 'Filipino')).toMatchObject({ supported: true, answer: 'Sumisipsip ng tubig ang mga ugat mula sa lupa.' });
  expect(mockChat(lesson, 'What is the battery voltage?', 'English')).toMatchObject({ supported: false, evidence: [] });
  expect(mockChat(lesson, 'Ilang boltahe ang baterya?', 'Filipino')).toMatchObject({ supported: false, evidence: [] });
});
