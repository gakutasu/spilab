import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, type Settings } from '../types';
import { getSettings, saveSettings } from '../storage/db';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void getSettings().then((s) => {
      if (cancelled) return;
      setSettings(s);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback(async (next: Settings) => {
    await saveSettings(next);
    setSettings(next);
  }, []);

  return { settings, loading, update };
}
