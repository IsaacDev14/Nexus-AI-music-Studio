import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAIStatus } from '../../hooks/useAIStatus';
import { NAVIGATION_PATHS } from '../../utils/constants';

const TopBar: React.FC = () => {
  const location = useLocation();
  const { status: aiStatus } = useAIStatus(120000);

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'DASHBOARD';
    const parts = path.substring(1).split('/');
    return parts.map((p) => p.replace(/-/g, ' ')).join(' / ').toUpperCase();
  };

  const aiOnline = aiStatus?.status === 'online';

  return (
    <header className="bg-white border-b border-gray-300 sticky top-0 z-20 px-6 py-3 flex items-center justify-between h-16 transition-colors">

      <div className="flex items-center gap-4 flex-1">
        <Link to={NAVIGATION_PATHS['Dashboard']} className="text-xs font-bold text-gray-900 tracking-tight hidden sm:block">
          NEXUS
        </Link>
        <div className="flex items-center text-xs font-semibold text-gray-700 tracking-wide uppercase">
          <span className="mr-2 text-gray-500">PATH:</span>
          {getBreadcrumb()}
        </div>
      </div>

      <div className="hidden md:flex items-center justify-center flex-1">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tools..."
            className="bg-gray-100 border border-gray-300 text-gray-800 text-xs rounded-lg w-full py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 flex-1 justify-end">
        <div className={`hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border ${
          aiOnline ? 'border-green-200 bg-green-50' : 'border-gray-300 bg-gray-100'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${aiOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className={`text-[10px] font-mono ${aiOnline ? 'text-green-700' : 'text-gray-500'}`}>
            AI {aiOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        <button className="p-2 text-gray-600 hover:text-black hover:bg-gray-200 rounded relative transition" aria-label="Notifications">
          <BellIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
