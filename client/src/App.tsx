import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import InstrumentProvider from './context/InstrumentProvider';
import WorkflowBuilder from './pages/Workflow/WorkflowBuilder';

import { NAVIGATION_PATHS } from './utils/constants';

// Import other pages
import TunerPage from './pages/Tools/TunerPage';
import ChordStudio from './pages/Compose/ChordStudio';
import MelodyStudio from './pages/Compose/MelodyStudio';

export default function App() {
  return (
    <InstrumentProvider>
      <AppLayout>
        <Routes>
          {/* Default redirect to workflow */}
          <Route path="/" element={<Navigate to="/builder/skill-level" replace />} />

          {/* Workflow Builder with steps */}
          <Route path="/builder/:step" element={<WorkflowBuilder />} />
          <Route path="/builder" element={<Navigate to="/builder/skill-level" replace />} />

          {/* Tool pages */}
          <Route path={NAVIGATION_PATHS['Instrument Tuner']} element={<TunerPage />} />
          <Route path={NAVIGATION_PATHS['Chord Progression Generator']} element={<ChordStudio />} />
          <Route path={NAVIGATION_PATHS['Melody Suggestions']} element={<MelodyStudio />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/builder/skill-level" replace />} />
        </Routes>
      </AppLayout>
    </InstrumentProvider>
  );
}