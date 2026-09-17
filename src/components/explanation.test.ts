import { parseExplanation } from './explanation';

describe('parseExplanation', () => {
  it('splits headings, paragraphs and lists', () => {
    const text = `## 解き方

役割があるので順列。
7 × 6 = 42

- 一つ目
- 二つ目

## ポイント

PとCの区別。`;
    expect(parseExplanation(text)).toEqual([
      { type: 'heading', text: '解き方' },
      { type: 'paragraph', text: '役割があるので順列。\n7 × 6 = 42' },
      { type: 'list', items: ['一つ目', '二つ目'] },
      { type: 'heading', text: 'ポイント' },
      { type: 'paragraph', text: 'PとCの区別。' },
    ]);
  });

  it('handles plain text without headings', () => {
    expect(parseExplanation('ただの文。')).toEqual([{ type: 'paragraph', text: 'ただの文。' }]);
  });

  it('ignores extra blank lines and whitespace', () => {
    expect(parseExplanation('\n\n  a  \n\n\n b \n')).toEqual([{ type: 'paragraph', text: 'a' }, { type: 'paragraph', text: 'b' }]);
  });
});
