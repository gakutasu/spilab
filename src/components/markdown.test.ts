import { parseInline, parseMarkdown } from './markdown';

describe('parseInline', () => {
  it('splits bold and code', () => {
    expect(parseInline('a **b** `c` d')).toEqual([
      { type: 'text', text: 'a ' },
      { type: 'bold', text: 'b' },
      { type: 'text', text: ' ' },
      { type: 'code', text: 'c' },
      { type: 'text', text: ' d' },
    ]);
  });
});

describe('parseMarkdown', () => {
  it('handles headings, lists and paragraphs', () => {
    const blocks = parseMarkdown('## 見出し\n\n段落1\n続き\n\n- a\n- **b**\n\n1. x\n2. y');
    expect(blocks.map((b) => b.type)).toEqual(['heading', 'paragraph', 'list', 'list']);
    expect((blocks[2] as { ordered: boolean }).ordered).toBe(false);
    expect((blocks[3] as { ordered: boolean }).ordered).toBe(true);
  });
});
