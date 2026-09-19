import { parseMarkdown, type Inline } from './markdown';

function Spans({ inline }: { inline: Inline[] }) {
  return (
    <>
      {inline.map((s, i) =>
        s.type === 'bold' ? <strong key={i}>{s.text}</strong> : s.type === 'code' ? <code key={i}>{s.text}</code> : <span key={i}>{s.text}</span>,
      )}
    </>
  );
}

export function Markdown({ text }: { text: string }) {
  return (
    <div className="markdown">
      {parseMarkdown(text).map((b, i) => {
        if (b.type === 'heading') return <h4 key={i}><Spans inline={b.inline} /></h4>;
        if (b.type === 'list') {
          const items = b.items.map((it, j) => <li key={j}><Spans inline={it} /></li>);
          return b.ordered ? <ol key={i}>{items}</ol> : <ul key={i}>{items}</ul>;
        }
        return <p key={i}><Spans inline={b.inline} /></p>;
      })}
    </div>
  );
}
