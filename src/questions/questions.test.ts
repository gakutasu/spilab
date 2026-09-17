import { questions } from './index';
import { validateQuestions } from './validate';
import { TOPIC_IDS } from './topics';

describe('question bank', () => {
  it('passes validation', () => {
    expect(validateQuestions(questions)).toEqual([]);
  });

  it('has at least one question', () => {
    expect(questions.length).toBeGreaterThan(0);
  });

  // Enabled once the initial question bank is complete.
  it('has at least 8 questions per topic', () => {
    for (const topic of TOPIC_IDS) {
      const count = questions.filter((q) => q.topic === topic).length;
      expect(count, topic).toBeGreaterThanOrEqual(8);
    }
  });
});
