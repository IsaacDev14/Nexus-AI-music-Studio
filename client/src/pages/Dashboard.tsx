// src/pages/Dashboard.tsx (Modernized)
import React from 'react';
import { 
  MagnifyingGlassIcon, ArrowUpOnSquareIcon, 
  ChartBarIcon, 
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

// --- MOCK DATA ---
const MAIN_OPTIONS = [
  { label: 'Simplify for my skill level', isChecked: true },
  { label: 'Use AI-generated backing track', isChecked: true },
];

const AI_GUIDANCE_PROMPTS = [
  // Using CheckCircleIcon solid for a more modern, selected look
  { label: 'Help Me Practice', isChecked: false, isDisabled: false, icon: CheckCircleIcon },
  { label: 'Give Me Progression', isChecked: true, isDisabled: false, icon: CheckCircleIcon },
  { label: 'Show Me Substitutions', isChecked: true, isDisabled: false, icon: CheckCircleIcon },
];

const RIGHT_HAND_OPTIONS = [
  { label: 'Progress & History', icon: ChartBarIcon, action: 'progress' },
  { label: 'Export Options', icon: ArrowUpOnSquareIcon, action: 'export' },
];
// -----------------

interface CheckOptionProps {
  label: string;
  icon: React.ElementType;
  checked: boolean;
  disabled?: boolean;
}

const CheckOption: React.FC<CheckOptionProps> = ({ label, icon: Icon, checked, disabled = false }) => (
  <div className={`flex items-center space-x-2 text-base cursor-pointer transition duration-150 ${disabled ? 'text-gray-400' : 'text-gray-700 hover:text-gray-900'}`}>
    {checked ? (
      <Icon className="w-5 h-5 text-indigo-600" /> // Use primary color for checked state
    ) : (
      <Icon className={`w-5 h-5 ${disabled ? 'text-gray-400' : 'text-gray-300 hover:text-indigo-400'}`} />
    )}
    <span>{label}</span>
  </div>
);

interface ActionOptionProps {
  label: string;
  icon: React.ElementType;
}

const ActionOption: React.FC<ActionOptionProps> = ({ label, icon: Icon }) => (
  <button className="flex items-center space-x-3 text-base font-medium text-gray-700 hover:text-indigo-600 transition duration-150">
    <Icon className="w-5 h-5 text-gray-400 hover:text-indigo-600" />
    <span>{label}</span>
  </button>
);


const Dashboard = () => {
  return (
    // Increased padding and removed the left border as it's now handled by the sidebar
    <div className="flex-1 p-12 bg-gray-50"> 
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
          AI-GENERATED CHORD PROGRESSIONS FOR SONGS
        </h1>
        <p className="text-lg text-gray-600 mb-10">
          Search songs to learn/play along with
        </p>

        {/* Search Bar (Modernized) */}
        <div className="relative mb-12">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search songs..."
            // Subtle shadow, increased padding, indigo focus ring
            className="w-full py-4 pl-12 pr-4 text-lg border border-gray-200 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 outline-none"
          />
        </div>

        {/* Checkbox Options (Modernized) */}
        <div className="space-y-4 mb-12">
          {MAIN_OPTIONS.map((option) => (
            <div key={option.label} className="flex items-center space-x-3">
              {/* Use solid CheckCircleIcon for modern look */}
              <CheckCircleIcon className="w-6 h-6 text-indigo-600" />
              <span className="text-base text-gray-800 font-medium">{option.label}</span>
            </div>
          ))}
        </div>

        {/* AI Guidance / Prompts Section */}
        <h2 className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-6">
          AI GUIDANCE / PROMPTS
        </h2>
        <div className="grid grid-cols-2 gap-y-6">
          {/* Left Column (Modernized Check Options) */}
          <div className="space-y-5">
            {AI_GUIDANCE_PROMPTS.map((prompt) => (
              <CheckOption 
                key={prompt.label}
                label={prompt.label} 
                checked={prompt.isChecked} 
                disabled={prompt.isDisabled} 
                icon={prompt.icon}
              />
            ))}
          </div>

          {/* Right Column (Modernized Action Options) */}
          <div className="space-y-5">
            {RIGHT_HAND_OPTIONS.map((option) => (
              <ActionOption 
                key={option.label}
                label={option.label} 
                icon={option.icon} 
              />
            ))}
          </div>
        </div>
    </div>
  );
};

export default Dashboard;