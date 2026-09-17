import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Question } from '../types';
import { questions as builtinQuestions } from './index';
import { getGeneratedQuestions } from '../storage/db';

export interface QuestionBank {
  /** Built-in plus AI-generated questions. */
  questions: Question[];
  generated: Question[];
  getQuestion: (id: string) => Question | undefined;
  loading: boolean;
  reload: () => Promise<void>;
}

const QuestionBankContext = createContext<QuestionBank | null>(null);

export function QuestionBankProvider({ children }: { children: ReactNode }) {
  const [generated, setGenerated] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const list = await getGeneratedQuestions();
    setGenerated(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo<QuestionBank>(() => {
    const all = [...builtinQuestions, ...generated];
    const map = new Map(all.map((q) => [q.id, q]));
    return { questions: all, generated, getQuestion: (id) => map.get(id), loading, reload };
  }, [generated, loading, reload]);

  return <QuestionBankContext.Provider value={value}>{children}</QuestionBankContext.Provider>;
}

export function useQuestionBank(): QuestionBank {
  const bank = useContext(QuestionBankContext);
  if (!bank) throw new Error('useQuestionBank must be used within QuestionBankProvider');
  return bank;
}
