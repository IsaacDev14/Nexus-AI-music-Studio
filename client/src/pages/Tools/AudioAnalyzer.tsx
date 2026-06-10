import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ClockIcon,
  MusicalNoteIcon,
  ArrowDownTrayIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import FileUploadZone from '../../components/Music/FileUploadZone';
import ErrorBanner from '../../components/UI/ErrorBanner';
import LoadingState from '../../components/UI/LoadingState';
import { analyzeUpload, type AudioAnalysisResult } from '../../api/analyzeService';
import {
  saveLastAnalysis,
  setMetronomeBpmFromAnalysis,
  loadLastAnalysis,
} from '../../utils/analysisStorage';
import { NAVIGATION_PATHS } from '../../utils/constants';
import { downloadFile } from '../../utils/practiceStats';

const AudioAnalyzer: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AudioAnalysisResult | null>(() => loadLastAnalysis());

  const handleFile = async (file: File) => {
    setLoading(true);
    setError('');
    setUploadPct(0);
    setResult(null);

    try {
      const analysis = await analyzeUpload(file, setUploadPct);
      setResult(analysis);
      saveLastAnalysis(analysis);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed. Check backend and ffmpeg.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const syncMetronome = () => {
    if (!result) return;
    setMetronomeBpmFromAnalysis(result.bpm);
    navigate(NAVIGATION_PATHS['Metronome']);
  };

  const openInChordStudio = () => {
    if (!result) return;
    saveLastAnalysis(result);
    navigate(NAVIGATION_PATHS['Chord Progression Generator'], {
      state: { fromAnalysis: result },
    });
  };

  const exportJson = () => {
    if (!result) return;
    downloadFile(JSON.stringify(result, null, 2), `analysis-${Date.now()}.json`, 'application/json');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      <div className="bg-white border-b border-gray-200 p-6 flex-none">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Track Analyzer</h1>
          <p className="text-gray-500 mt-1">
            Upload audio or video to detect BPM, musical key, and chord progression.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

          {!loading && !result && (
            <FileUploadZone onFileSelected={handleFile} disabled={loading} />
          )}

          {loading && (
            <div className="bg-white rounded-xl border p-8">
              <LoadingState message={uploadPct < 100 ? `Uploading... ${uploadPct}%` : 'Analyzing audio...'} />
              {uploadPct > 0 && uploadPct < 100 && (
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${uploadPct}%` }} />
                </div>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {result.songTitle || result.filename}
                  </h2>
                  {result.songArtist && (
                    <p className="text-gray-500">{result.songArtist}{result.songAlbum ? ` - ${result.songAlbum}` : ''}</p>
                  )}
                  {result.auddMatched && (
                    <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Song identified
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Analyze another
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={ClockIcon} label="Tempo" value={`${result.bpm} BPM`} />
                <StatCard icon={MusicalNoteIcon} label="Key" value={result.key} sub={`${Math.round(result.keyConfidence * 100)}% confidence`} />
                <StatCard icon={PlayIcon} label="Duration" value={`${result.durationSeconds}s`} />
              </div>

              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-bold text-gray-800 mb-4">Detected Chord Progression</h3>
                {result.chordSummary.length === 0 ? (
                  <p className="text-sm text-gray-500">No clear chords detected. Try a cleaner recording or use AI lookup below.</p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {result.chordSummary.map((c, i) => (
                        <span key={i} className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-lg font-bold text-sm">
                          {c}
                        </span>
                      ))}
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {result.detectedChords.map((c, i) => (
                        <div key={i} className="flex justify-between text-sm font-mono text-gray-600 border-b border-gray-100 py-1">
                          <span>{c.time}s</span>
                          <span className="font-bold text-indigo-600">{c.chord}</span>
                          <span className="text-gray-400">{Math.round(c.confidence * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {result.aiArrangement && (
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="font-bold text-gray-800 mb-2">AI Chord Sheet (from song match)</h3>
                  <p className="text-sm text-gray-600">
                    Full arrangement available in Chord Studio with tablature and diagrams.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button onClick={syncMetronome} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
                  Sync Metronome to {result.bpm} BPM
                </button>
                <button onClick={openInChordStudio} className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50">
                  Open in Chord Studio
                </button>
                <button onClick={exportJson} className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2">
                  <ArrowDownTrayIcon className="w-4 h-4" /> Export JSON
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: string; sub?: string }> = ({
  icon: Icon, label, value, sub,
}) => (
  <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <div className="text-xs text-gray-500 uppercase font-bold">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  </div>
);

export default AudioAnalyzer;
