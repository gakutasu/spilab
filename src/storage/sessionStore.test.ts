import { loadSession, saveSession, clearSession, SESSION_KEY, type ActiveSession } from './sessionStore';

function fakeStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => {
      map.delete(k);
    },
    setItem: (k, v) => {
      map.set(k, String(v));
    },
  };
}

const session: ActiveSession = {
  date: '2026-09-18',
  questionIds: ['a', 'b'],
  currentIndex: 0,
  phase: 'answering',
  startedAt: 1758000000000,
  selectedChoice: null,
  lastResult: null,
  results: [],
};

beforeEach(() => {
  vi.stubGlobal('localStorage', fakeStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('sessionStore', () => {
  it('round-trips a session', () => {
    saveSession(session);
    expect(loadSession()).toEqual(session);
  });

  it('returns null when nothing is stored or data is corrupt', () => {
    expect(loadSession()).toBeNull();
    localStorage.setItem(SESSION_KEY, '{not json');
    expect(loadSession()).toBeNull();
    localStorage.setItem(SESSION_KEY, JSON.stringify({ foo: 1 }));
    expect(loadSession()).toBeNull();
  });

  it('clears the session', () => {
    saveSession(session);
    clearSession();
    expect(loadSession()).toBeNull();
  });
});
