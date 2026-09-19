export type Inline = { type: 'text'; text: string } | { type: 'bold'; text: string } | { type: 'code'; text: string };
export type Block = { type: 'heading'; inline: Inline[] } | { type: 'paragraph'; inline: Inline[] } | { type: 'list'; items: Inline[][]; ordered: boolean };

/** Splits **bold** and `code` spans. */
export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  const re = /\*\*(.+?)\*\*|`([^`]+)`/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push({ type: 'text', text: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ type: 'bold', text: m[1] });
    else out.push({ type: 'code', text: m[2]! });
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push({ type: 'text', text: text.slice(last) });
  return out;
}

/** Minimal markdown for chat replies: headings, bullet/numbered lists, paragraphs. */
export function parseMarkdown(text: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: { items: string[]; ordered: boolean } | null = null;
  const flush = () => {
    if (para.length) {
      blocks.push({ type: 'paragraph', inline: parseInline(para.join('\n')) });
      para = [];
    }
    if (list) {
      blocks.push({ type: 'list', items: list.items.map(parseInline), ordered: list.ordered });
      list = null;
    }
  };
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    const bullet = /^[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (line === '') flush();
    else if (/^#{1,6}\s/.test(line)) {
      flush();
      blocks.push({ type: 'heading', inline: parseInline(line.replace(/^#{1,6}\s+/, '')) });
    } else if (bullet || numbered) {
      const ordered = Boolean(numbered);
      const item = (bullet ?? numbered)![1]!;
      if (para.length) flush();
      if (list && list.ordered !== ordered) flush();
      if (!list) list = { items: [], ordered };
      list.items.push(item);
    } else {
      if (list) flush();
      para.push(line);
    }
  }
  flush();
  return blocks;
}
