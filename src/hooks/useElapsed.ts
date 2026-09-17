import { useEffect, useState } from 'react';

/** Elapsed ms since startedAt, derived from wall-clock time so it survives background tabs. */
export function useElapsed(startedAt: number | null, intervalMs = 250): number {
  const [elapsed, setElapsed] = useState(() => (startedAt === null ? 0 : Date.now() - startedAt));

  useEffect(() => {
    if (startedAt === null) {
      setElapsed(0);
      return;
    }
    const tick = () => setElapsed(Date.now() - startedAt);
    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [startedAt, intervalMs]);

  return elapsed;
}
