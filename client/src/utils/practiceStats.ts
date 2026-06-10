export interface PracticeSession {
  id: string;
  date: string;
  duration: number;
  instrument: string;
  focus: string;
  notes: string;
}

import { STORAGE_KEYS } from './storageKeys';
const STORAGE_KEY = STORAGE_KEYS.PRACTICE_LOGS;

export function loadPracticeSessions(): PracticeSession[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function savePracticeSessions(sessions: PracticeSession[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getTotalPracticeMinutes(sessions: PracticeSession[]): number {
  return sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
}

export function getTotalPracticeHours(sessions: PracticeSession[]): string {
  return (getTotalPracticeMinutes(sessions) / 60).toFixed(1);
}

export function getPracticeStreak(sessions: PracticeSession[]): number {
  if (sessions.length === 0) return 0;

  const dates = new Set(
    sessions.map((s) => new Date(s.date).toDateString())
  );
  const sorted = [...dates].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (dates.has(expected.toDateString())) {
      streak++;
    } else if (i === 0) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (dates.has(yesterday.toDateString())) {
        streak = 1;
        continue;
      }
      break;
    } else {
      break;
    }
  }
  return streak;
}

export function getSessionsThisMonth(sessions: PracticeSession[]): number {
  const now = new Date();
  return sessions.filter((s) => {
    const d = new Date(s.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
}

export function exportSessionsAsJSON(sessions: PracticeSession[]): string {
  return JSON.stringify(sessions, null, 2);
}

export function exportSessionsAsCSV(sessions: PracticeSession[]): string {
  const header = 'id,date,duration,instrument,focus,notes';
  const rows = sessions.map((s) =>
    [s.id, s.date, s.duration, s.instrument, s.focus, `"${(s.notes || '').replace(/"/g, '""')}"`].join(',')
  );
  return [header, ...rows].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function getSessionsByInstrument(sessions: PracticeSession[]): Record<string, number> {
  return sessions.reduce<Record<string, number>>((acc, s) => {
    acc[s.instrument] = (acc[s.instrument] || 0) + 1;
    return acc;
  }, {});
}

export function getAverageSessionDuration(sessions: PracticeSession[]): number {
  if (sessions.length === 0) return 0;
  return Math.round(getTotalPracticeMinutes(sessions) / sessions.length);
}

export function getLongestStreak(sessions: PracticeSession[]): number {
  if (sessions.length === 0) return 0;
  const dates = [...new Set(sessions.map((s) => new Date(s.date).toDateString()))].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  let max = 1;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      max = Math.max(max, current);
    } else {
      current = 1;
    }
  }
  return max;
}
