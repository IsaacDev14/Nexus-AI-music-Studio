export const COMMON_MAJOR_CHORDS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;

export const COMMON_MINOR_CHORDS = ['Am', 'Bm', 'Cm', 'Dm', 'Em', 'Fm', 'Gm'] as const;

export const COMMON_SEVENTH_CHORDS = ['C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7'] as const;

export function isValidChordName(chord: string): boolean {
  return /^[A-G][#b]?(m|maj|dim|aug|sus|add)?(7|9|11|13|6)?(\/[A-G][#b]?)?$/.test(chord);
}

export function normalizeChordName(chord: string): string {
  return chord.trim().replace(/\s+/g, '');
}
