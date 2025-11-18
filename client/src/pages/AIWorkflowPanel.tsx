import React, { useState } from 'react';
import {
  MusicalNoteIcon, PlayIcon, BookOpenIcon, ClockIcon, CubeIcon,
  Bars3Icon, ChartBarIcon, CpuChipIcon, PuzzlePieceIcon, SparklesIcon
} from '@heroicons/react/24/outline';

// --- NAVIGATION DATA ---
const NAVIGATION_SECTIONS = [
  {
    title: 'LEARN / PRACTICE',
    items: [
      { id: 'skill-level', label: 'Skill Level', icon: ChartBarIcon },
      { id: 'instrument-focus', label: 'Instrument Focus', icon: MusicalNoteIcon },
      { id: 'lesson-type', label: 'Lesson Type', icon: BookOpenIcon },
      { id: 'generate-lesson', label: 'Generate Lesson', icon: PlayIcon },
    ],
  },
  {
    title: 'TUNER & TOOLS',
    items: [
      { id: 'instrument-tuner', label: 'Instrument Tuner', icon: CubeIcon },
      { id: 'metronome', label: 'Metronome', icon: ClockIcon },
      { id: 'backing-track', label: 'Backing Track Generator', icon: PlayIcon },
      { id: 'tuner-calibration', label: 'Tuner Calibration', icon: PuzzlePieceIcon },
      { id: 'rhythm-practice', label: 'Rhythm Practice', icon: Bars3Icon },
    ],
  },
  {
    title: 'COMPOSE / JAM',
    items: [
      { id: 'chord-progression', label: 'Chord Progression Generator', icon: CpuChipIcon },
      { id: 'melody-suggestions', label: 'Melody Suggestions', icon: MusicalNoteIcon },
      { id: 'improvisation-partner', label: 'Improvisation Partner', icon: PlayIcon },
      { id: 'ai-songwriting', label: 'AI Songwriting', icon: BookOpenIcon },
      { id: 'jam-history', label: 'Jam Session History', icon: ClockIcon },
    ],
  },
];

// Configuration options for each section
const CONFIG_OPTIONS = {
  'skill-level': ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
  'instrument-focus': ['Guitar', 'Piano', 'Drums', 'Violin', 'Bass', 'Voice'],
  'lesson-type': ['Technique', 'Theory', 'Song Learning', 'Ear Training', 'Improvisation'],
};

// --- Types ---
interface ConfigPayload {
  type: string;
  value: string;
}

interface ConfigPanelProps {
  activeSection: string;
  onConfigChange: (config: ConfigPayload) => void;
}

interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  config: string;
  timestamp: Date;
}

// --- Config Panel Component ---
const ConfigPanel: React.FC<ConfigPanelProps> = ({ activeSection, onConfigChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onConfigChange({ type: activeSection, value: inputValue });
      setInputValue('');
    }
  };

  const handleOptionSelect = (option: string) => {
    onConfigChange({ type: activeSection, value: option });
  };

  return (
    <div className="p-6 border-b border-gray-200 bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Configure {activeSection.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </h3>

      {/* Dropdown options for predefined choices */}
      {CONFIG_OPTIONS[activeSection as keyof typeof CONFIG_OPTIONS] && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Quick Select:</label>
          <div className="flex flex-wrap gap-2">
            {CONFIG_OPTIONS[activeSection as keyof typeof CONFIG_OPTIONS].map((option) => (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom input field */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Enter your ${activeSection.replace('-', ' ')}...`}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <SparklesIcon className="w-4 h-4" />
          Generate
        </button>
      </form>
    </div>
  );
};

// --- Main AI Workflow Panel ---
const AIWorkflowPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('skill-level');
  const [workflow, setWorkflow] = useState<WorkflowNode[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleConfigChange = (config: ConfigPayload) => {
    const newNode: WorkflowNode = {
      id: Date.now().toString(),
      type: config.type,
      label: config.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      config: config.value,
      timestamp: new Date(),
    };
    setWorkflow(prev => [...prev, newNode]);

    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const handleGenerateLesson = () => {
    if (workflow.length > 0) {
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        alert('AI Lesson Generated! Check your practice sessions.');
      }, 3000);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Navigation */}
      <div className="w-80 h-full bg-white border-r border-gray-200 overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MusicalNoteIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Music Studio</h1>
              <p className="text-sm text-gray-500">Build your learning workflow</p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-4">
          {NAVIGATION_SECTIONS.map((section) => (
            <div key={section.title} className="mb-8">
              <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center w-full text-left py-3 px-4 text-sm transition-colors rounded-lg ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <ConfigPanel activeSection={activeSection} onConfigChange={handleConfigChange} />

        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Workflow Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Learning Workflow</h2>
                <p className="text-gray-600">Configure your AI-powered music lesson</p>
              </div>

              <button
                onClick={handleGenerateLesson}
                disabled={workflow.length === 0 || isGenerating}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Generate AI Lesson
                  </>
                )}
              </button>
            </div>

            {/* Workflow Nodes */}
            <div className="space-y-4">
              {workflow.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpenIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No configurations yet</h3>
                  <p className="text-gray-500">Select options from the sidebar to build your lesson</p>
                </div>
              ) : (
                workflow.map((node, index) => (
                  <div
                    key={node.id}
                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{node.label}</h4>
                          <p className="text-sm text-gray-600">{node.config}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{node.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* AI Generation Status */}
            {isGenerating && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-blue-700 font-medium">
                    AI is generating your personalized lesson...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWorkflowPanel;
