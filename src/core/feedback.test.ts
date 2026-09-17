import { buildFeedback, type FeedbackInput } from './feedback';

const base: FeedbackInput = {
  result: 'correct',
  answerTimeMs: 24000,
  recommendedTime: 30,
  topicLabel: '順列',
  topicEvalBefore: 'normal',
  topicEvalAfter: 'normal',
  topicScoreBefore: 60,
  topicScoreAfter: 68,
};

describe('buildFeedback', () => {
  it('celebrates fast correct answers', () => {
    const f = buildFeedback(base);
    expect(f.headline).toBe('正解！');
    expect(f.lines.join('\n')).toContain('順列');
  });

  it('mentions speed for slow correct answers', () => {
    const f = buildFeedback({ ...base, answerTimeMs: 72000 });
    expect(f.headline).toBe('正解');
    expect(f.lines.join('\n')).toContain('2.4倍');
    expect(f.lines.join('\n')).toContain('処理速度');
  });

  it('mentions slight delay for 1.0-1.5x', () => {
    const f = buildFeedback({ ...base, answerTimeMs: 40000 });
    expect(f.headline).toBe('正解');
    expect(f.lines.join('\n')).toContain('少し時間');
  });

  it('describes incorrect answers', () => {
    const f = buildFeedback({ ...base, result: 'incorrect' });
    expect(f.headline).toBe('不正解');
  });

  it('records unknown as unlearned and promises priority', () => {
    const f = buildFeedback({ ...base, result: 'unknown' });
    expect(f.headline).toBe('解法未習得');
    expect(f.lines.join('\n')).toContain('解法未習得');
    expect(f.lines.join('\n')).toContain('優先的に出題');
  });

  it('shows evaluation transitions', () => {
    const f = buildFeedback({ ...base, topicEvalBefore: 'normal', topicEvalAfter: 'strong', topicScoreAfter: 76 });
    expect(f.lines.join('\n')).toContain('普通 → 得意');
  });

  it('notes when approaching strong', () => {
    const f = buildFeedback({ ...base, topicScoreAfter: 70 });
    expect(f.lines.join('\n')).toContain('得意に近づいています');
  });

  it('explains unrated topics', () => {
    const f = buildFeedback({ ...base, topicEvalBefore: 'unrated', topicEvalAfter: 'unrated' });
    expect(f.lines.join('\n')).toContain('未評価');
  });
});
