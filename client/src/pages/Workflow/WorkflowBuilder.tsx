// src/pages/Workflow/WorkflowBuilder.tsx
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
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { generateLesson } from '../../api/apiService'; // ← REAL AI

const WORKFLOW_STEPS = [
  { id: 'skill-level', label: 'Level', icon: ChartBarIcon },
  { id: 'instrument-focus', label: 'Instrument', icon: MusicalNoteIcon },
  { id: 'lesson-type', label: 'Focus', icon: BookOpenIcon },
  { id: 'generate', label: 'Generate', icon: PlayIcon },
];

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
      { value: 'ukulele', label: 'Ukulele' },
      { value: 'trumpet', label: 'Trumpet' },
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
  'Speed & Accuracy',
  'Tone & Expression',
];

interface WorkflowData {
  'skill-level': string;
  'instrument-focus': string;
  'lesson-type': string;
  'custom-focus'?: string;
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
  const [generatedLesson, setGeneratedLesson] = useState<string>('');
  const [error, setError] = useState<string>('');

  const currentIdx = WORKFLOW_STEPS.findIndex(s => s.id === step);
  const current = WORKFLOW_STEPS[currentIdx];

  useEffect(() => {
    if (!step || currentIdx === -1) {
      navigate('/builder/skill-level', { replace: true });
    }
  }, [step, navigate, currentIdx]);

  const select = (key: keyof WorkflowData, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
    if (currentIdx < 3) {
      setTimeout(() => navigate(`/builder/${WORKFLOW_STEPS[currentIdx + 1].id}`), 300);
    }
  };

  const generateRealLesson = async () => {
    setIsGenerating(true);
    setError('');
    setGeneratedLesson('');

    const focus = data['custom-focus'] || data['lesson-type'] || 'General Practice';

    try {
      const lesson = await generateLesson({
        skillLevel: data['skill-level'] || 'intermediate',
        instrument: data['instrument-focus'],
        focus,
      });
      setGeneratedLesson(lesson);
    } catch (err) {
      setError('Failed to generate lesson. Is your AI backend running on port 8000?');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getFinalFocus = () => data['custom-focus'] || data['lesson-type'] || '—';
  const getLabel = (key: 'skill-level' | 'instrument-focus') => {
    const opt = STEP_CONFIGS[key]?.options.find(o => o.value === data[key]);
    return opt?.label || '—';
  };

  const resetAndStartOver = () => {
    setData({ 'skill-level': '', 'instrument-focus': '', 'lesson-type': '', 'custom-focus': '' });
    setGeneratedLesson('');
    setError('');
    navigate('/builder/skill-level');
  };

  if (!current) return null;
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="text-gray-600 hover:text-gray-900 transition">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create Practice Lesson</h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-10">
        <div className="max-w-5xl mx-auto px-6 py-10">

          {/* PROGRESS BAR */}
          <div className="flex justify-center items-center gap-16 mb-16">
            {WORKFLOW_STEPS.map((s, i) => {
              const isDone = i < currentIdx || !!data[s.id as keyof WorkflowData] || (i === 2 && !!data['custom-focus']);
              const isActive = i === currentIdx;
              const StepIcon = s.icon;
              return (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md ${isDone ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white scale-110' : isActive ? 'bg-blue-100 text-blue-700 ring-4 ring-blue-100 shadow-lg' : 'bg-gray-200 text-gray-500'}`}>
                      {isDone ? <CheckCircleIcon className="w-8 h-8" /> : <StepIcon className="w-7 h-7" />}
                    </div>
                    <span className={`text-sm font-medium ${isDone ? 'text-blue-600' : isActive ? 'text-blue-700' : 'text-gray-500'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < 3 && <div className={`w-32 h-1 mt-7 rounded-full ${i < currentIdx ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-300'}`} />}
                </React.Fragment>
              );
            })}
          </div>

          {/* MAIN CONTENT CARD */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10">
            {step === 'generate' ? (
              <div className="min-h-[65vh] flex items-center justify-center">
                <div className="max-w-3xl w-full">

                  {/* Generating State */}
                  {isGenerating && (
                    <div className="text-center py-20">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full inline-flex items-center justify-center mb-10 animate-pulse">
                        <SparklesIcon className="w-14 h-14 text-blue-600" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">Building your perfect lesson…</h2>
                      <p className="text-lg text-gray-600 mb-8">This takes 6–15 seconds</p>
                      <div className="flex justify-center gap-4">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-4 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {error && !isGenerating && (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 bg-red-100 rounded-full inline-flex items-center justify-center mb-6">
                        <ArrowPathIcon className="w-10 h-10 text-red-600" />
                      </div>
                      <h3 className="text-xl font-medium text-red-800 mb-4">Connection Failed</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
                      <button onClick={generateRealLesson} className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700">
                        Try Again
                      </button>
                    </div>
                  )}

                  {/* Success: Show Lesson */}
                  {generatedLesson && !isGenerating && (
                    <div className="space-y-10 animate-fade-in">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full inline-flex items-center justify-center mb-8 shadow-2xl">
                          <SparklesIcon className="w-14 h-14 text-white" />
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-3">Your Lesson is Ready!</h2>
                        <p className="text-xl text-gray-600">Personalized just for you</p>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
                        <div className="prose prose-lg max-w-none">
                          <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed text-base">
                            {generatedLesson}
                          </pre>
                        </div>
                      </div>

                      <div className="text-center pt-6">
                        <button
                          onClick={resetAndStartOver}
                          className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:shadow-xl transition-all transform hover:scale-105"
                        >
                          Create Another Lesson
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Initial Generate Screen */}
                  {!isGenerating && !generatedLesson && !error && (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full inline-flex items-center justify-center mb-10">
                        <SparklesIcon className="w-14 h-14 text-emerald-600" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-10">All Set!</h2>

                      <div className="bg-gray-50 rounded-2xl p-8 mb-12 text-left space-y-5 border border-gray-200 max-w-xl mx-auto">
                        <div className="flex justify-between text-lg">
                          <span className="text-gray-600 font-medium">Level</span>
                          <span className="font-bold text-gray-900">{getLabel('skill-level')}</span>
                        </div>
                        <div className="flex justify-between text-lg">
                          <span className="text-gray-600 font-medium">Instrument</span>
                          <span className="font-bold text-gray-900">{getLabel('instrument-focus')}</span>
                        </div>
                        <div className="flex justify-between text-lg">
                          <span className="text-gray-600 font-medium">Focus</span>
                          <span className="font-bold text-gray-900">{getFinalFocus()}</span>
                        </div>
                      </div>

                      <button
                        onClick={generateRealLesson}
                        className="px-16 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xl font-bold rounded-2xl hover:shadow-2xl transition-all transform hover:scale-105 shadow-xl"
                      >
                        Generate My Lesson Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ALL OTHER STEPS — ENHANCED UI */
              <>
                <div className="text-center mb-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl inline-flex items-center justify-center mb-6 shadow-inner">
                    <Icon className="w-12 h-12 text-blue-700" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {STEP_CONFIGS[step as keyof typeof STEP_CONFIGS]?.title || 'What do you want to work on?'}
                  </h2>
                </div>

                {step === 'lesson-type' ? (
                  <div className="space-y-10">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {PRESET_FOCUS.map(item => (
                        <button
                          key={item}
                          onClick={() => setData(prev => ({ ...prev, 'lesson-type': item, 'custom-focus': '' }))}
                          className={`py-6 px-4 rounded-2xl border-2 text-lg font-semibold transition-all transform hover:scale-105 ${data['lesson-type'] === item && !data['custom-focus'] ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>

                    <div className="text-center">
                      <div className="inline-flex items-center gap-4 text-gray-500 mb-4">
                        <div className="h-px bg-gray-300 flex-1" />
                        <span className="text-sm font-medium">or describe it yourself</span>
                        <div className="h-px bg-gray-300 flex-1" />
                      </div>
                      <input
                        type="text"
                        value={data['custom-focus'] || ''}
                        onChange={e => setData(prev => ({ ...prev, 'custom-focus': e.target.value, 'lesson-type': '' }))}
                        placeholder="e.g. Wonderwall solo, blues licks in A, vocal runs, double kick patterns..."
                        className="w-full max-w-2xl px-6 py-5 text-lg rounded-2xl border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    {(data['lesson-type'] || data['custom-focus']) && (
                      <div className="text-center pt-6">
                        <button
                          onClick={() => navigate('/builder/generate')}
                          className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-xl hover:shadow-xl transition-all transform hover:scale-105"
                        >
                          Continue →
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {STEP_CONFIGS[step as keyof typeof STEP_CONFIGS].options.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => select(step as any, opt.value)}
                        className={`py-10 px-6 rounded-2xl border-2 text-xl font-bold transition-all transform hover:scale-105 shadow-md ${data[step as keyof WorkflowData] === opt.value ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-purple-50 text-blue-700 shadow-xl' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkflowBuilder;