export const INSTRUMENTS = [
  'Guitar',
  'Piano',
  'Bass',
  'Drums',
  'Ukulele',
  'Violin',
  'Voice',
  'Saxophone',
] as const;

export type Instrument = (typeof INSTRUMENTS)[number];

export const INSTRUMENT_TUNINGS: Record<string, string[]> = {
  Guitar: ['E', 'A', 'D', 'G', 'B', 'E'],
  Bass: ['E', 'A', 'D', 'G'],
  Ukulele: ['G', 'C', 'E', 'A'],
  Violin: ['G', 'D', 'A', 'E'],
};

export function getTuning(instrument: string): string[] {
  return INSTRUMENT_TUNINGS[instrument] || INSTRUMENT_TUNINGS.Guitar;
}

export function isStringInstrument(instrument: string): boolean {
  return ['Guitar', 'Bass', 'Ukulele', 'Violin'].includes(instrument);
}
