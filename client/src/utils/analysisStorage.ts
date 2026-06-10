import type { AudioAnalysisResult } from '../api/analyzeService';

export const LAST_ANALYSIS_KEY = 'last_audio_analysis';

export function saveLastAnalysis(result: AudioAnalysisResult): void {
  localStorage.setItem(LAST_ANALYSIS_KEY, JSON.stringify(result));
}

export function loadLastAnalysis(): AudioAnalysisResult | null {
  try {
    const raw = localStorage.getItem(LAST_ANALYSIS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearLastAnalysis(): void {
  localStorage.removeItem(LAST_ANALYSIS_KEY);
}

export const METRONOME_BPM_FROM_ANALYSIS = 'metronome_bpm_from_analysis';

export function setMetronomeBpmFromAnalysis(bpm: number): void {
  localStorage.setItem(METRONOME_BPM_FROM_ANALYSIS, String(Math.round(bpm)));
}

export function consumeMetronomeBpmFromAnalysis(): number | null {
  const raw = localStorage.getItem(METRONOME_BPM_FROM_ANALYSIS);
  if (!raw) return null;
  localStorage.removeItem(METRONOME_BPM_FROM_ANALYSIS);
  const bpm = parseInt(raw, 10);
  return Number.isFinite(bpm) ? bpm : null;
}
