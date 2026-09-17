import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { questions } from './questions';
import { validateQuestions } from './questions/validate';
import './styles.css';

if (import.meta.env.DEV) {
  const errors = validateQuestions(questions);
  if (errors.length) console.error('Question data validation failed:\n' + errors.join('\n'));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
