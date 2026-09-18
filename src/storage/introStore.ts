export const INTRO_SEEN_KEY = 'spilab.introSeen';

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function hasSeenIntro(): boolean {
  return storage()?.getItem(INTRO_SEEN_KEY) === '1';
}

export function markIntroSeen(): void {
  storage()?.setItem(INTRO_SEEN_KEY, '1');
}
