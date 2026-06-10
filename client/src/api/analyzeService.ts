import { api } from './apiService';

export interface DetectedChord {
  chord: string;
  time: number;
  confidence: number;
}

export interface AudioAnalysisResult {
  filename: string;
  bpm: number;
  key: string;
  mode: string;
  keyConfidence: number;
  durationSeconds: number;
  detectedChords: DetectedChord[];
  chordSummary: string[];
  songTitle?: string | null;
  songArtist?: string | null;
  songAlbum?: string | null;
  auddMatched: boolean;
  aiArrangement?: Record<string, unknown> | null;
}

export async function analyzeUpload(file: File, onProgress?: (pct: number) => void): Promise<AudioAnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post<AudioAnalysisResult>('/analyze/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
    timeout: 180000,
  });

  return res.data;
}
