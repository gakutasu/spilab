import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { hasSeenIntro, markIntroSeen } from '../storage/introStore';
import { IntroModal } from '../components/IntroModal';

interface IntroContextValue {
  open: () => void;
}

const IntroContext = createContext<IntroContextValue>({ open: () => undefined });

/** Shows the introduction once per browser and lets any page reopen it. */
export function IntroProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(() => !hasSeenIntro());
  const close = useCallback(() => {
    markIntroSeen();
    setOpen(false);
  }, []);
  const value = useMemo(() => ({ open: () => setOpen(true) }), []);
  return (
    <IntroContext.Provider value={value}>
      {children}
      <IntroModal open={open} onClose={close} />
    </IntroContext.Provider>
  );
}

export function useIntro(): IntroContextValue {
  return useContext(IntroContext);
}
