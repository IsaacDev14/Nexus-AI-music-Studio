export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

export const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

export function getScaleNotes(root: string, intervals: number[]): string[] {
  const rootIndex = NOTE_NAMES.indexOf(root as typeof NOTE_NAMES[number]);
  if (rootIndex === -1) return [];
  return intervals.map((i) => NOTE_NAMES[(rootIndex + i) % 12]);
}

export function parseKey(key: string): { root: string; mode: 'major' | 'minor' } {
  const parts = key.trim().split(' ');
  const root = parts[0];
  const mode = parts[1]?.toLowerCase() === 'minor' ? 'minor' : 'major';
  return { root, mode };
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function noteToMidi(note: string, octave = 4): number {
  const match = note.match(/^([A-G]#?)(\d+)?$/);
  if (!match) return 60;
  const name = match[1];
  const oct = match[2] ? parseInt(match[2]) : octave;
  const index = NOTE_NAMES.indexOf(name as typeof NOTE_NAMES[number]);
  if (index === -1) return 60;
  return (oct + 1) * 12 + index;
}

export function getIntervalName(semitones: number): string {
  const names: Record<number, string> = {
    0: 'P1', 1: 'm2', 2: 'M2', 3: 'm3', 4: 'M3', 5: 'P4',
    6: 'TT', 7: 'P5', 8: 'm6', 9: 'M6', 10: 'm7', 11: 'M7',
  };
  return names[semitones % 12] || `${semitones}st`;
}
