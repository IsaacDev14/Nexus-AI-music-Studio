import { STORAGE_KEYS } from './storageKeys';

export interface JamSession {
  id: string;
  date: string;
  chords: string[];
  key: string;
  notes: string;
}

export function loadJamHistory(): JamSession[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.JAM_HISTORY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveJamHistory(sessions: JamSession[]): void {
  localStorage.setItem(STORAGE_KEYS.JAM_HISTORY, JSON.stringify(sessions));
}
