import type { Question } from '../types';
import { CHOICE_LABELS } from '../utils/format';

interface Props {
  question: Question;
  selected: number | null;
  disabled: boolean;
  /** When true, correct/incorrect highlighting is shown. */
  revealed: boolean;
  onSelect: (index: number) => void;
}

export function ChoiceList({ question, selected, disabled, revealed, onSelect }: Props) {
  return (
    <div className="choices" role="radiogroup" aria-label="選択肢">
      {question.choices.map((choice, i) => {
        const classes = ['choice'];
        if (selected === i) classes.push('is-selected');
        if (revealed && i === question.correctChoice) classes.push('is-correct');
        if (revealed && selected === i && i !== question.correctChoice) classes.push('is-wrong');
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={selected === i}
            className={classes.join(' ')}
            disabled={disabled}
            onClick={() => onSelect(i)}
          >
            <span className="choice-label">{CHOICE_LABELS[i]}</span>
            <span className="choice-text">{choice}</span>
          </button>
        );
      })}
    </div>
  );
}
