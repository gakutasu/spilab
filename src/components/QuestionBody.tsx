import type { Question } from '../types';

export function QuestionBody({ question }: { question: Question }) {
  return (
    <div className="question-body">
      {question.passage && <div className="passage">{question.passage}</div>}
      <p className="question-text">{question.question}</p>
    </div>
  );
}
