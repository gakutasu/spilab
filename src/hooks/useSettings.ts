import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, type Settings } from '../types';
import { getSettings, saveSettings } from '../storage/db';
import { useSync } from './useSync';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const { version, afterSettingsChanged } = useSync();

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
  }, [version]);

  const update = useCallback(
    async (next: Settings) => {
      setSettings(next);
      await saveSettings(next);
      afterSettingsChanged(next);
    },
    [afterSettingsChanged],
  );

  return { settings, loading, update };
}
