import { parseExplanation } from './explanation';

export function Explanation({ text }: { text: string }) {
  const blocks = parseExplanation(text);
  return (
    <div className="explanation">
      {blocks.map((b, i) => {
        if (b.type === 'heading') return <h3 key={i}>{b.text}</h3>;
        if (b.type === 'list')
          return (
            <ul key={i}>
              {b.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        return <p key={i}>{b.text}</p>;
      })}
    </div>
  );
}
