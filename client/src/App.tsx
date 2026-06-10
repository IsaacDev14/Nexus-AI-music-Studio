import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import InstrumentProvider from './context/InstrumentProvider';
import WorkflowBuilder from './pages/Workflow/WorkflowBuilder';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

import { NAVIGATION_PATHS } from './utils/constants';

// Import other pages
import TunerPage from './pages/Tools/TunerPage';
import ChordStudio from './pages/Compose/ChordStudio';
import Metronome from './pages/Tools/Metronome';
import BackingTrack from './pages/Tools/BackingTrack';
import RhythmTrainer from './pages/Tools/RhythmTrainer';
import { TunerCalibration } from './pages/Tools/Tuner Calibration';
import Dashboard from './pages/Dashboard';
import MelodyGenerator from './pages/Tools/MelodyGenerator';
import ImprovAssistant from './pages/Tools/ImprovAssistant';
import Songwriter from './pages/Tools/SongWriter';
import JamHistory from './pages/Tools/JamHistory';
import PracticeLog from './pages/Tools/PracticeLog';
import AudioAnalyzer from './pages/Tools/AudioAnalyzer';
import { Achievements, DataExport, Shortcuts } from './pages/Tools/GenericPages';

function AppRoutes() {
  useKeyboardShortcuts();

  return (
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path={NAVIGATION_PATHS['Dashboard']} element={<Dashboard />} />

          {/* Workflow Builder with steps */}
          <Route path="/builder/:step" element={<WorkflowBuilder />} />
          <Route path="/builder" element={<Navigate to="/builder/skill-level" replace />} />

          {/* Tool pages */}
          <Route path={NAVIGATION_PATHS['Instrument Tuner']} element={<TunerPage />} />
          <Route path={NAVIGATION_PATHS['Metronome']} element={<Metronome />} />
          <Route path={NAVIGATION_PATHS['Backing Track Generator']} element={<BackingTrack />} />
          <Route path={NAVIGATION_PATHS['Rhythm Practice']} element={<RhythmTrainer />} />
          <Route path={NAVIGATION_PATHS['Track Analyzer']} element={<AudioAnalyzer />} />
          <Route path={NAVIGATION_PATHS['Tuner Calibration']} element={<TunerCalibration/>} />
          <Route path={NAVIGATION_PATHS['Chord Progression Generator']} element={<ChordStudio />} />
          <Route path={NAVIGATION_PATHS['Melody Suggestions']} element={<MelodyGenerator />} />
          <Route path={NAVIGATION_PATHS['Improvisation Partner']} element={<ImprovAssistant />} />
          <Route path={NAVIGATION_PATHS['AI Songwriting']} element={<Songwriter />} />
          <Route path={NAVIGATION_PATHS['Jam Session History']} element={<JamHistory />} />
          <Route path={NAVIGATION_PATHS['Practice Log']} element={<PracticeLog />} />
          <Route path={NAVIGATION_PATHS['Achievements']} element={<Achievements />} />
          <Route path={NAVIGATION_PATHS['Data Export']} element={<DataExport />} />
          <Route path={NAVIGATION_PATHS['Drifting Shortcuts']} element={<Shortcuts />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
  );
}

export default function App() {
  return (
    <InstrumentProvider>
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </InstrumentProvider>
  );
}