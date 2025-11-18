// client/src/components/Layout/TopBar.tsx (More Engaging)
import { UserCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/solid'; // Using solid icons for a bolder look

const TopBar = () => {
  return (
    // Updated background to a deep black/slate, increased padding, and added a subtle shadow.
    <div className="flex items-center justify-between px-10 py-4 bg-slate-400 sticky top-0 z-20 shadow-xl">
      <div className="flex items-center space-x-3">
        {/* Using a bold, accented primary color (indigo) on the text */}
        <span className="text-2xl font-black tracking-widest text-white">
          AI MUSIC STUDIO
        </span>
      </div>
      <div className="flex items-center space-x-5">
        {/* Cleaner button styling with bright hover state */}
        <button 
          className="text-gray-300 hover:text-indigo-400 transition duration-200 p-1 rounded-full hover:bg-slate-800"
          title="Settings"
        >
          <Cog6ToothIcon className="w-6 h-6" />
        </button>
        <button 
          className="text-gray-300 hover:text-indigo-400 transition duration-200 p-1 rounded-full hover:bg-slate-800"
          title="User Profile"
        >
          <UserCircleIcon className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};

export default TopBar;