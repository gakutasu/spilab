import { useCallback, useEffect, useState } from 'react';
import type { AnswerRecord } from '../types';
import { getAllAnswers } from '../storage/db';

export function useAnswers() {
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const all = await getAllAnswers();
    setAnswers(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { answers, loading, reload, setAnswers };
}
