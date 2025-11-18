import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAVIGATION_PATHS } from '../../utils/constants';
import {
  MusicalNoteIcon, PlayIcon, BookOpenIcon, FlagIcon, ClockIcon, CubeIcon, 
  Bars3Icon, ChartBarIcon, CpuChipIcon, PuzzlePieceIcon
} from '@heroicons/react/24/outline';

// --- LESSONS/PRACTICE ---
const NAVIGATION_DATA = [
  {
    title: 'LEARN / PRACTICE',
    items: [
      { label: 'Skill Level', icon: ChartBarIcon }, 
      { label: 'Instrument Focus', icon: MusicalNoteIcon },
      { label: 'Lesson Type', icon: BookOpenIcon },
      { label: 'Generate Lesson', icon: PlayIcon }, 
    ],
  },
  {
    title: 'TUNER & TOOLS',
    items: [
      { label: 'Instrument Tuner', icon: CubeIcon },
      { label: 'Metronome', icon: ClockIcon },
      { label: 'Backing Track Generator', icon: PlayIcon },
      { label: 'Tuner Calibration', icon: PuzzlePieceIcon }, 
      { label: 'Rhythm Practice', icon: Bars3Icon },
    ],
  },
  {
    title: 'COMPOSE / JAM',
    items: [
      { label: 'Chord Progression Generator', icon: CpuChipIcon },
      { label: 'Melody Suggestions', icon: MusicalNoteIcon },
      { label: 'Improvisation Partner', icon: PlayIcon },
      { label: 'AI Songwriting', icon: BookOpenIcon },
      { label: 'Jam Session History', icon: ClockIcon },
    ],
  },
  {
    title: 'PROGRESS & HISTORY', 
    items: [
      { label: 'Practice Log', icon: ChartBarIcon },
      { label: 'Achievements', icon: FlagIcon },
      { label: 'Data Export', icon: PlayIcon },
      { label: 'Drifting Shortcuts', icon: Bars3Icon },
    ],
  },
];

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  isActive: boolean; 
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, path, isActive }) => (
  <Link
    to={path}
    className={`flex items-center w-full text-left py-2 px-4 text-sm transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500 font-medium'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`}
  >
    <Icon className="w-4 h-4 mr-3" />
    <span>{label}</span>
  </Link>
);

interface NavSectionProps {
  title: string;
  children: React.ReactNode;
}

const NavSection: React.FC<NavSectionProps> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {title}
    </h3>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

const SideBar = () => {
  const location = useLocation();

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 overflow-y-auto">
      {/* Simple Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <MusicalNoteIcon className="w-5 h-5 text-gray-700" />
          <span className="font-semibold text-gray-900">AI Music Studio</span>
        </div>
      </div>

      {/* Navigation Content */}
      <div className="p-4">
        {NAVIGATION_DATA.map((section) => (
          <NavSection key={section.title} title={section.title}>
            {section.items.map((item) => {
              const path = NAVIGATION_PATHS[item.label as keyof typeof NAVIGATION_PATHS];
              const isActive = location.pathname === path;
              
              return (
                <NavItem 
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  path={path}
                  isActive={isActive} 
                />
              );
            })}
          </NavSection>
        ))}
      </div>
    </div>
  );
};

export default SideBar;