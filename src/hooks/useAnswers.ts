import { useCallback, useEffect, useState } from 'react';
import type { AnswerRecord } from '../types';
import { getAllAnswers } from '../storage/db';
import { useSync } from './useSync';

export function useAnswers() {
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { version } = useSync();

  const reload = useCallback(async () => {
    const all = await getAllAnswers();
    setAnswers(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload, version]);

  return { answers, loading, reload, setAnswers };
}
