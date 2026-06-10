import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  MusicalNoteIcon,
  FireIcon,
  ClockIcon,
  BoltIcon,
  SignalIcon,
  BookOpenIcon,
} from '@heroicons/react/24/solid';
import { NAVIGATION_PATHS } from '../utils/constants';
import {
  loadPracticeSessions,
  getTotalPracticeHours,
  getPracticeStreak,
  getSessionsThisMonth,
} from '../utils/practiceStats';
import { useAIStatus } from '../hooks/useAIStatus';

const Dashboard: React.FC = () => {
  const sessions = useMemo(() => loadPracticeSessions(), []);
  const totalHours = getTotalPracticeHours(sessions);
  const streak = getPracticeStreak(sessions);
  const monthSessions = getSessionsThisMonth(sessions);
  const { status: aiStatus } = useAIStatus();

  const aiOnline = aiStatus?.status === 'online';
  const aiProvider = aiStatus?.grok_available
    ? 'Grok'
    : aiStatus?.gemini_available
      ? 'Gemini'
      : 'Offline';

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-10">

          <div className="relative rounded-2xl p-8 md:p-12 overflow-hidden border border-gray-200 bg-white shadow-xl mb-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-white"></div>
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest mb-4 border ${
                  aiOnline
                    ? 'bg-green-50 border-green-100 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}>
                  <span className={`relative flex h-2 w-2 rounded-full ${aiOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  AI ENGINE {aiOnline ? 'ONLINE' : 'OFFLINE'} ({aiProvider})
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Maestro</span>.
                </h1>
                <p className="text-gray-600 text-lg mb-8 font-light leading-relaxed">
                  {sessions.length > 0
                    ? `You have logged ${totalHours} hours across ${sessions.length} practice sessions.`
                    : 'Start your first practice session to begin tracking your progress.'}
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    to={NAVIGATION_PATHS['Practice Log']}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2 text-sm uppercase tracking-wider"
                  >
                    <SignalIcon className="w-4 h-4" />
                    Log Practice
                  </Link>
                  <Link
                    to={NAVIGATION_PATHS['Chord Progression Generator']}
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-blue-300 px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 text-sm uppercase tracking-wider"
                  >
                    <BookOpenIcon className="w-4 h-4" />
                    New Project
                  </Link>
                </div>
              </div>

              <div className="hidden md:block relative">
                <div className="w-32 h-32 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin-slow flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-2 border-gray-200 border-b-purple-500 animate-reverse-spin flex items-center justify-center">
                    <MusicalNoteIcon className="w-10 h-10 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard label="Total Practice" value={`${totalHours} hrs`} sub={`${sessions.length} sessions`} icon={ClockIcon} color="text-blue-500" />
            <StatCard label="Practice Streak" value={`${streak} Days`} sub={streak > 0 ? 'Keep it going' : 'Start today'} icon={FireIcon} color="text-orange-500" />
            <StatCard label="This Month" value={`${monthSessions}`} sub="Sessions logged" icon={BoltIcon} color="text-amber-500" />
          </div>

          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <div className="w-8 h-px bg-gray-300"></div>
            Core Modules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <QuickCard title="Metronome" desc="Precision timing engine" icon={ClockIcon} path={NAVIGATION_PATHS['Metronome']} />
            <QuickCard title="Spectral Tuner" desc="Frequency analysis" icon={MusicalNoteIcon} path={NAVIGATION_PATHS['Instrument Tuner']} />
            <QuickCard title="Chord Studio" desc="AI chord progressions" icon={BookOpenIcon} path={NAVIGATION_PATHS['Chord Progression Generator']} />
            <QuickCard title="Melody Generator" desc="Motif suggestions" icon={MusicalNoteIcon} path={NAVIGATION_PATHS['Melody Suggestions']} />
            <QuickCard title="Songwriter" desc="Lyrics and structure" icon={BookOpenIcon} path={NAVIGATION_PATHS['AI Songwriting']} />
            <QuickCard title="Track Analyzer" desc="Upload audio or video for BPM, key, chords" icon={MusicalNoteIcon} path={NAVIGATION_PATHS['Track Analyzer']} />
            <QuickCard title="Lesson Builder" desc="Personalized lessons" icon={BookOpenIcon} path={NAVIGATION_PATHS['Generate Lesson']} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Recent Sessions</h3>
                <Link to={NAVIGATION_PATHS['Practice Log']} className="text-[10px] text-blue-600 font-mono hover:underline">VIEW ALL</Link>
              </div>
              <div className="p-4 space-y-2">
                {sessions.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No sessions yet. Log your first practice.</p>
                ) : (
                  sessions.slice(0, 3).map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded border border-transparent hover:border-gray-100">
                      <div>
                        <div className="text-sm font-bold text-gray-700">{s.focus || 'Free Practice'}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{s.instrument} - {new Date(s.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{s.duration}m</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-gradient-to-b from-blue-50 to-white border border-blue-100 p-6 rounded-xl relative overflow-hidden shadow-sm">
              <h3 className="font-mono text-blue-400 text-xs font-bold mb-4 uppercase tracking-widest">Daily Insight</h3>
              <p className="text-gray-600 text-sm italic mb-6 relative z-10 leading-relaxed border-l-2 border-blue-300 pl-4">
                "Music is the arithmetic of the soul, which counts without becoming aware of it."
              </p>
              <div className="text-right text-[10px] font-bold text-gray-400 uppercase relative z-10 font-mono">
                Leibniz
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; sub: string; icon: React.ElementType; color: string }> = ({ label, value, sub, icon: Icon, color }) => (
  <div className="bg-white border border-gray-200 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden group shadow-sm transition-all duration-300 hover:shadow-md">
    <div className={`w-10 h-10 rounded bg-gray-50 flex items-center justify-center ${color} border border-gray-100 shadow-sm`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">{label}</div>
      <div className="text-xl font-mono font-bold text-gray-900">{value}</div>
      <div className="text-[10px] text-gray-400 font-mono">{sub}</div>
    </div>
  </div>
);

const QuickCard: React.FC<{ title: string; desc: string; icon: React.ElementType; path: string }> = ({ title, desc, icon: Icon, path }) => (
  <Link to={path} className="bg-white border border-gray-200 p-5 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group flex items-start justify-between relative overflow-hidden">
    <div className="relative z-10">
      <div className="w-10 h-10 rounded bg-gray-50 flex items-center justify-center text-gray-400 mb-3 group-hover:text-blue-600 group-hover:scale-110 transition-all border border-gray-200">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-xs text-gray-500 font-mono mt-1">{desc}</p>
    </div>
  </Link>
);

export default Dashboard;
