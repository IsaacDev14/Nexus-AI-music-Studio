import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  MusicalNoteIcon,
  BookOpenIcon,
  PlayIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const WORKFLOW_STEPS = [
  { id: 'skill-level', label: 'Level', icon: ChartBarIcon },
  { id: 'instrument-focus', label: 'Instrument', icon: MusicalNoteIcon },
  { id: 'lesson-type', label: 'Focus', icon: BookOpenIcon },
  { id: 'generate', label: 'Generate', icon: PlayIcon },
];

// Fixed: STEP_CONFIGS is now properly defined
const STEP_CONFIGS = {
  'skill-level': {
    title: 'Your current level',
    options: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
      { value: 'expert', label: 'Expert' },
    ],
  },
  'instrument-focus': {
    title: 'Instrument',
    options: [
      { value: 'guitar', label: 'Guitar' },
      { value: 'piano', label: 'Piano' },
      { value: 'violin', label: 'Violin' },
      { value: 'drums', label: 'Drums' },
      { value: 'bass', label: 'Bass Guitar' },
      { value: 'voice', label: 'Voice' },
      { value: 'saxophone', label: 'Saxophone' },
    ],
  },
};

const PRESET_FOCUS = [
  'Technique',
  'Music Theory',
  'Learn Songs',
  'Ear Training',
  'Improvisation',
  'Sight Reading',
  'Rhythm & Groove',
];

interface WorkflowData {
  'skill-level': string;
  'instrument-focus': string;
  'lesson-type': string;     // preset
  'custom-focus'?: string;   // free text
}

const WorkflowBuilder: React.FC = () => {
  const { step } = useParams<{ step: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<WorkflowData>({
    'skill-level': '',
    'instrument-focus': '',
    'lesson-type': '',
    'custom-focus': '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const currentIdx = WORKFLOW_STEPS.findIndex(s => s.id === step);
  const current = WORKFLOW_STEPS[currentIdx];

  useEffect(() => {
    if (!step || currentIdx === -1) {
      navigate('/builder/skill-level', { replace: true });
    }
  }, [step, navigate, currentIdx]); // Fixed ESLint warning

  const select = (key: keyof WorkflowData, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
    if (currentIdx < 3) {
      setTimeout(() => navigate(`/builder/${WORKFLOW_STEPS[currentIdx + 1].id}`), 280);
    }
  };

  const generateLesson = async () => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 4200));
    alert('Your lesson is ready! ✓');
    setData({ 'skill-level': '', 'instrument-focus': '', 'lesson-type': '', 'custom-focus': '' });
    navigate('/builder/skill-level');
    setIsGenerating(false);
  };

  const getFinalFocus = () => {
    if (data['custom-focus']) return data['custom-focus'];
    if (data['lesson-type']) return data['lesson-type'];
    return '—';
  };

  const getLabel = (key: 'skill-level' | 'instrument-focus') => {
    const config = STEP_CONFIGS[key];
    if (!config) return '—';
    const opt = config.options.find(o => o.value === data[key]);
    return opt?.label || '—';
  };

  if (!current) return null;
  const Icon = current.icon;

  return (
    <div className=" bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="text-gray-600 hover:text-gray-900">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium text-gray-900">New Lesson</h1>
          <div className="w-5" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full px-6 py-8">
          {/* Progress */}
          <div className="flex justify-center gap-20 mb-12">
            {WORKFLOW_STEPS.map((s, i) => {
              const isDone = i < currentIdx || !!data[s.id as keyof WorkflowData] || (i === 2 && !!data['custom-focus']);
              const isActive = i === currentIdx;
              const StepIcon = s.icon;
              return (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDone ? 'bg-blue-600 text-white' : isActive ? 'bg-blue-100 text-blue-700 ring-4 ring-blue-50' : 'bg-gray-200 text-gray-500'}`}>
                      {isDone ? <CheckCircleIcon className="w-6 h-6" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <span className="text-xs text-gray-600">{s.label}</span>
                  </div>
                  {i < 3 && <div className={`w-32 h-px mt-5 ${i < currentIdx ? 'bg-blue-600' : 'bg-gray-300'}`} />}
                </React.Fragment>
              );
            })}
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            {step !== 'generate' ? (
              <>
                <div className="text-center mb-10">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl inline-flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-blue-700" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-900">
                    {step === 'skill-level' && 'Your current level'}
                    {step === 'instrument-focus' && 'Instrument'}
                    {step === 'lesson-type' && 'What do you want to work on?'}
                  </h2>
                </div>

                {step === 'lesson-type' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {PRESET_FOCUS.map(item => (
                        <button
                          key={item}
                          onClick={() => setData(prev => ({ ...prev, 'lesson-type': item, 'custom-focus': '' }))}
                          className={`py-3.5 rounded-xl border text-sm font-medium transition-all ${data['lesson-type'] === item && !data['custom-focus'] ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-500">or type it yourself</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <input
                      type="text"
                      value={data['custom-focus'] || ''}
                      onChange={(e) => setData(prev => ({ ...prev, 'custom-focus': e.target.value, 'lesson-type': '' }))}
                      placeholder="e.g. Wonderwall solo, blues improvisation in A, vocal warm-ups..."
                      className="w-full px-2 py-2 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />

                    {(data['lesson-type'] || data['custom-focus']) && (
                      <div className="text-right">
                        <button onClick={() => navigate('/builder/generate')} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                          Continue →
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {STEP_CONFIGS[step as keyof typeof STEP_CONFIGS].options.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => select(step as 'skill-level' | 'instrument-focus', opt.value)}
                        className={`py-5 rounded-xl border text-sm font-medium transition-all ${data[step as keyof WorkflowData] === opt.value ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="max-w-md w-full text-center">
                  {isGenerating ? (
                    <>
                      <div className="w-20 h-20 bg-green-50 rounded-full inline-flex items-center justify-center mb-8">
                        <SparklesIcon className="w-12 h-12 text-green-600 animate-pulse" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-3">Creating your lesson…</h3>
                      <p className="text-sm text-gray-600 mb-8">This takes just a moment</p>
                      <div className="flex justify-center gap-3">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-green-50 rounded-full inline-flex items-center justify-center mb-8">
                        <SparklesIcon className="w-12 h-12 text-green-600" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-8">Ready!</h3>

                      <div className="bg-gray-50 rounded-xl p-6 mb-10 text-left space-y-4 border border-gray-200 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600">Level</span><span className="font-medium">{getLabel('skill-level')}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Instrument</span><span className="font-medium">{getLabel('instrument-focus')}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Focus</span><span className="font-medium">{getFinalFocus()}</span></div>
                      </div>

                      <button onClick={generateLesson} className="px-12 py-4 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition shadow-sm">
                        Generate Lesson
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkflowBuilder;