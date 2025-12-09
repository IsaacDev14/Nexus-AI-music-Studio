/* eslint-disable */

// src/pages/Compose/ChordStudio.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { aiApi, type FullDisplayData } from '../../api/apiService';
import { 
  MagnifyingGlassIcon, 
  SparklesIcon, 
  BookOpenIcon, 
  AdjustmentsHorizontalIcon,
  PlayCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ChevronUpIcon,
  MusicalNoteIcon,
  BeakerIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// --- ANIMATED LOADING COMPONENTS ---
const PulseLoader: React.FC = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
  </div>
);

const WaveLoader: React.FC = () => (
  <div className="flex items-center justify-center space-x-1">
    <div className="w-1 h-4 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full animate-wave" style={{ animationDelay: '0ms' }}></div>
    <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full animate-wave" style={{ animationDelay: '100ms' }}></div>
    <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full animate-wave" style={{ animationDelay: '200ms' }}></div>
    <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full animate-wave" style={{ animationDelay: '300ms' }}></div>
    <div className="w-1 h-4 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full animate-wave" style={{ animationDelay: '400ms' }}></div>
  </div>
);

const ComposerLoader: React.FC = () => (
  <div className="relative w-12 h-12">
    <div className="absolute inset-0 border-2 border-purple-200 rounded-full animate-spin"></div>
    <div className="absolute inset-2 border-2 border-purple-300 rounded-full animate-spin-reverse"></div>
    <div className="absolute inset-4 border-2 border-purple-500 rounded-full animate-spin-slow"></div>
    <div className="absolute inset-0 flex items-center justify-center">
      <MusicalNoteIcon className="w-4 h-4 text-purple-600 animate-bounce" />
    </div>
  </div>
);

const ChordMatrixLoader: React.FC = () => (
  <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
    {[...Array(12)].map((_, i) => (
      <div key={i} className="relative h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-50 to-transparent animate-shimmer"
          style={{ animationDelay: `${i * 100}ms` }}
        ></div>
      </div>
    ))}
  </div>
);

const ProgressLoader: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
    <div 
      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

const TypingLoader: React.FC = () => (
  <div className="flex items-center space-x-2">
    <div className="relative">
      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
        <div className="w-4 h-4 bg-indigo-600 rounded-sm animate-typing"></div>
      </div>
    </div>
    <span className="text-sm text-gray-600 font-medium">AI is composing...</span>
  </div>
);

// --- CHORD VISUALIZER HELPERS ---
type Instrument = 'Guitar' | 'Ukulele';

const CHORD_SHAPES: Record<string, Record<string, number[]>> = {
  Guitar: {
    // [E, A, D, G, B, e] - -1 for mute, 0 for open
    'C': [-1, 3, 2, 0, 1, 0],
    'A': [-1, 0, 2, 2, 2, 0],
    'G': [3, 2, 0, 0, 0, 3],
    'E': [0, 2, 2, 1, 0, 0],
    'D': [-1, -1, 0, 2, 3, 2],
    'Em': [0, 2, 2, 0, 0, 0],
    'Am': [-1, 0, 2, 2, 1, 0],
    'Dm': [-1, -1, 0, 2, 3, 1],
    'F': [1, 3, 3, 2, 1, 1],
    'Bm': [-1, 2, 4, 4, 3, 2],
    'Bb': [-1, 1, 3, 3, 3, 1],
    'Cm': [-1, 3, 5, 5, 4, 3],
    'Gm': [3, 5, 5, 3, 3, 3],
    'Fm': [1, 3, 3, 1, 1, 1],
  },
  Ukulele: {
    // [G, C, E, A]
    'C': [0, 0, 0, 3],
    'G': [0, 2, 3, 2],
    'Am': [2, 0, 0, 0],
    'F': [2, 0, 1, 0],
    'Em': [0, 4, 3, 2],
    'Dm': [2, 2, 1, 0],
    'D': [2, 2, 2, 0],
    'A': [2, 1, 0, 0],
    'E': [4, 4, 4, 2],
    'Bm': [4, 2, 2, 2],
  }
};

const ChordBox: React.FC<{ chord: string; instrument: Instrument; isAnimating?: boolean }> = ({ chord, instrument, isAnimating = false }) => {
  const root = chord.match(/^[A-G][#b]?m?/)?.[0] || chord;
  let shape = CHORD_SHAPES[instrument][root];
  
  if (!shape) {
    const base = root.replace(/maj|dim|aug|sus|7|9|11|13/g, '');
    shape = CHORD_SHAPES[instrument][base];
  }

  const numStrings = instrument === 'Guitar' ? 6 : 4;
  const width = 80;
  const height = 100;
  const stringSpacing = width / (numStrings - 1);
  const fretSpacing = height / 5;

  if (!shape) {
    return (
      <div className={`flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm min-w-[100px] h-[140px] transition-all duration-300 ${isAnimating ? 'animate-pulse-scale' : ''}`}>
        <span className="font-bold text-gray-900 mb-2 text-sm">{chord}</span>
        <span className="text-[10px] text-gray-400">No Diagram</span>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 min-w-[120px] group ${isAnimating ? 'animate-float' : ''}`}>
      {isAnimating && (
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
      )}
      <span className="font-bold text-base text-gray-900 mb-2 relative z-10">{chord}</span>
      <svg width={width + 10} height={height + 10} viewBox={`-5 -5 ${width + 10} ${height + 10}`} className="bg-white overflow-visible relative z-10">
        <line x1="0" y1="0" x2={width} y2="0" stroke="#1f2937" strokeWidth="3" />
        
        {[1, 2, 3, 4, 5].map(i => (
           <line key={`f-${i}`} x1="0" y1={i * fretSpacing} x2={width} y2={i * fretSpacing} stroke="#e5e7eb" strokeWidth="2" />
        ))}
        
        {Array.from({ length: numStrings }).map((_, i) => (
           <line key={`s-${i}`} x1={i * stringSpacing} y1="0" x2={i * stringSpacing} y2={height} stroke="#374151" strokeWidth="1" />
        ))}
        
        {shape.map((fret, stringIdx) => {
           const cx = stringIdx * stringSpacing;
           if (fret === -1) {
             return <text key={stringIdx} x={cx} y="-6" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ef4444">×</text>;
           }
           if (fret === 0) {
             return <circle key={stringIdx} cx={cx} cy="-6" r="2.5" stroke="#374151" strokeWidth="1" fill="none" />;
           }
           return (
             <g key={stringIdx}>
               <circle 
                 cx={cx} 
                 cy={(fret * fretSpacing) - (fretSpacing / 2)} 
                 r="5.5" 
                 fill="#2563eb" 
                 className={isAnimating ? 'animate-ping-once' : ''}
                 style={{ animationDelay: `${stringIdx * 100}ms` }}
               />
               <circle 
                 cx={cx} 
                 cy={(fret * fretSpacing) - (fretSpacing / 2)} 
                 r="5.5" 
                 fill="#2563eb" 
               />
             </g>
           );
        })}
      </svg>
    </div>
  );
};

// Audio Synthesis Logic
const NOTE_FREQUENCIES: Record<string, number> = {
  'C': 261.63, 'C#': 277.18, 'Db': 277.18, 'D': 293.66, 'D#': 311.13, 'Eb': 311.13, 
  'E': 329.63, 'F': 349.23, 'F#': 369.99, 'Gb': 369.99, 'G': 392.00, 'G#': 415.30, 
  'Ab': 415.30, 'A': 440.00, 'A#': 466.16, 'Bb': 466.16, 'B': 493.88
};

const playChord = (ctx: AudioContext, chordName: string, time: number, duration: number) => {
  const match = chordName.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return;
  
  const root = match[1];
  const quality = match[2];
  const rootFreq = NOTE_FREQUENCIES[root] || 261.63;
  
  let intervals = [0, 4, 7]; 
  
  if (quality.includes('m') && !quality.includes('maj')) intervals = [0, 3, 7];
  if (quality.includes('dim')) intervals = [0, 3, 6];
  if (quality.includes('7')) {
    if (quality.includes('maj')) intervals.push(11);
    else intervals.push(10);
  }

  intervals.forEach((semitone, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = i === 0 ? 'triangle' : 'sine';
    const freq = rootFreq * Math.pow(2, semitone/12);
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.1, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration - 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(time);
    osc.stop(time + duration);
  });
};

const formatChordSheet = (songData: FullDisplayData): string => {
  let formattedResult = '';
  formattedResult += `${songData.songTitle}\n`;
  if (songData.artist) {
    formattedResult += `Artist: ${songData.artist}\n`;
  }
  formattedResult += `Tuning: ${songData.tuning}\n`;
  formattedResult += `Key: ${songData.key}\n`;
  formattedResult += `${songData.capo || 'Capo: no capo'}\n\n`;

  if (songData.tablature && songData.tablature.length > 0) {
    songData.tablature.forEach((section: { section: string; lines: Array<{ lyrics: string; isChordLine: boolean }> }) => {
      formattedResult += `[${section.section}]\n\n`;
      
      section.lines.forEach((line: { lyrics: string; isChordLine: boolean }) => {
        formattedResult += `${line.lyrics}\n`;
      });
      formattedResult += `\n`;
    });
  } else {
    formattedResult += `[Intro]\n\n`;
    const introChords = songData.progression.slice(0, Math.min(4, songData.progression.length));
    formattedResult += introChords.map((chord: { chord: string }) => chord.chord).join(' ') + '\n\n';
    
    formattedResult += `[Verse]\n\n`;
    const verseChords = songData.progression.slice(4, Math.min(8, songData.progression.length));
    
    verseChords.forEach((chord: { chord: string }, index: number) => {
      const sampleLyrics = [
        "In the quiet of the morning light",
        "When the world is still and calm",
        "There's a melody that fills the air",
        "Like a gentle healing balm"
      ];
      
      formattedResult += `${chord.chord.padEnd(12, ' ')}\n`;
      formattedResult += `${sampleLyrics[index] || "Lyrics line here"}\n\n`;
    });
  }

  return formattedResult;
};

const ChordStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'compose'>('search');
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>('Guitar');
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(true);
  const [isAnimatingChords, setIsAnimatingChords] = useState(false);
  const [composeProgress, setComposeProgress] = useState(0);
  const [searchStage, setSearchStage] = useState<'idle' | 'searching' | 'analyzing'>('idle');

  // Compose State
  const [mood, setMood] = useState('Melancholic');
  const [genre, setGenre] = useState('Lo-Fi Hip Hop');
  const [composeResult, setComposeResult] = useState<FullDisplayData | null>(null);
  const [loadingCompose, setLoadingCompose] = useState(false);

  // Search State
  const [songQuery, setSongQuery] = useState('');
  const [artistQuery, setArtistQuery] = useState('');
  const [songResult, setSongResult] = useState<FullDisplayData | null>(null);
  const [theoryAnalysis, setTheoryAnalysis] = useState<string>('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Audio playback
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Loader animation interval ref
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  const extractedChords = useMemo(() => {
    const data = activeTab === 'search' ? songResult : composeResult;
    if (!data?.progression) return [];
    
    const chordRegex = /\b[A-G][#b]?(?:m|maj|dim|aug|sus|add)?(?:7|9|11|13|6)?(?:(?:\/)[A-G][#b]?)?\b/g;
    const allChords = data.progression.map((p: { chord: string }) => p.chord).join(' ');
    const found = allChords.match(chordRegex) || [];
    return [...new Set(found)];
  }, [songResult, composeResult, activeTab]);

  // Animate chords when new ones are loaded
  useEffect(() => {
    if (extractedChords.length > 0) {
      setIsAnimatingChords(true);
      const timer = setTimeout(() => setIsAnimatingChords(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [extractedChords]);

  const simulateComposeProgress = () => {
    setComposeProgress(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      setComposeProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressIntervalRef.current!);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 300);
  };

  const handleCompose = async () => {
    setLoadingCompose(true);
    simulateComposeProgress();
    
    try {
      const result = await aiApi.generateSongArrangement({
        songQuery: `${mood} ${genre} progression`,
        simplify: true,
        helpPractice: true,
        showSubstitutions: true,
        instrument: 'Guitar'
      });
      
      setComposeProgress(100);
      setTimeout(() => {
        setComposeResult(result);
        setLoadingCompose(false);
        setComposeProgress(0);
      }, 500);
      
    } catch (error) {
      console.error('Failed to generate progression:', error);
      setLoadingCompose(false);
      setComposeProgress(0);
      clearInterval(progressIntervalRef.current!);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songQuery) return;
    
    setLoadingSearch(true);
    setSearchStage('searching');
    setSongResult(null);
    setTheoryAnalysis('');
    
    try {
      const result = await aiApi.generateSongArrangement({
        songQuery: songQuery,
        artist: artistQuery || undefined,
        simplify: true,
        helpPractice: true,
        showSubstitutions: true,
        instrument: 'Guitar',
        includeLyrics: true
      });
      
      setSearchStage('analyzing');
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate analysis delay
      
      setSongResult(result);
      setSearchStage('idle');
    } catch (error) {
      console.error('Failed to search song:', error);
      setSearchStage('idle');
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleAnalyze = async () => {
    if (!songResult) return;
    setAnalyzing(true);
    
    try {
      // Simulate AI analysis with stages
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const chords = extractedChords;
      const chordCount = chords.length;
      const hasMinor = chords.some((chord: string) => chord.includes('m') && !chord.includes('maj'));
      const hasSeventh = chords.some((chord: string) => chord.includes('7'));
      const hasSuspended = chords.some((chord: string) => chord.includes('sus'));
      
      let analysis = `This song uses ${chordCount} unique chords: ${chords.join(', ')}. `;
      analysis += `The progression features ${hasMinor ? 'both major and minor chords' : 'mostly major chords'}`;
      analysis += hasSeventh ? ' with some seventh chords adding harmonic color. ' : '. ';
      analysis += hasSuspended ? 'Suspended chords create tension and release. ' : '';
      analysis += `The chord choices create a ${mood.toLowerCase()} feeling typical of ${genre} music.`;
      
      setTheoryAnalysis(analysis);
    } catch (error) {
      console.error('Failed to analyze:', error);
      setTheoryAnalysis('Unable to analyze music theory at this time.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePlay = async () => {
    const data = activeTab === 'search' ? songResult : composeResult;
    if (isPlaying || !data?.progression) return;
    
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    setIsPlaying(true);
    const now = ctx.currentTime;
    let currentTime = now;
    const beatDuration = 0.6;

    data.progression.forEach((chord: { chord: string; duration: number }) => {
      const duration = chord.duration * beatDuration;
      playChord(ctx, chord.chord, currentTime, duration);
      currentTime += duration;
    });

    const totalDuration = (currentTime - now) * 1000;
    setTimeout(() => setIsPlaying(false), totalDuration);
  };

  const renderChordSheet = (text: string) => {
    return text.split('\n').map((line, i) => {
      const hasChords = /[A-G][#b]?(m|maj|dim|sus|7|9|add|aug)?/.test(line);
      const isSectionHeader = line.trim().startsWith('[') && line.trim().endsWith(']');
      const isMetadata = line.includes('Key:') || line.includes('Capo:') || line.includes('Artist:') || line.includes('Tuning:');
      
      let className = "font-mono text-sm md:text-base whitespace-pre-wrap ";
      
      if (isSectionHeader) {
        className += "font-bold text-gray-900 text-lg mt-6 mb-2 uppercase tracking-wide animate-slide-in";
      } else if (isMetadata) {
        className += "text-gray-600 font-medium";
      } else if (hasChords && !line.trim().match(/[a-z]/)) {
        className += "text-blue-600 font-bold tracking-normal animate-typing-line";
        className += ` animation-delay-${(i % 4) * 100}`;
      } else if (hasChords) {
        className += "text-blue-600 font-bold";
      } else if (line.trim() === '') {
        return <div key={i} className="h-4"></div>;
      } else {
        className += "text-gray-800";
      }
      
      return (
        <div key={i} className={className}>
          {line || '\u00A0'}
        </div>
      );
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50 overflow-hidden">
      
      {/* Add global styles for animations */}
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.5); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes typing {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.8); opacity: 0.5; }
        }
        @keyframes ping-once {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slide-in {
          from { transform: translateX(-10px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes typing-line {
          0% { opacity: 0; transform: translateY(5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 3s linear infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-typing {
          animation: typing 1s ease-in-out infinite;
        }
        .animate-ping-once {
          animation: ping-once 0.5s ease-out;
        }
        .animate-pulse-scale {
          animation: pulse-scale 1s ease-in-out infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-typing-line {
          animation: typing-line 0.3s ease-out forwards;
          opacity: 0;
        }
        .animation-delay-0 { animation-delay: 0ms; }
        .animation-delay-100 { animation-delay: 100ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
      `}</style>

      {/* HEADER */}
      <header className="flex-none bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg animate-pulse">
               {activeTab === 'search' ? <MagnifyingGlassIcon className="w-5 h-5 text-indigo-600" /> : <SparklesIcon className="w-5 h-5 text-purple-600" />}
            </div>
            <div>
               <h1 className="text-lg font-bold text-gray-900">{activeTab === 'search' ? 'Song Library' : 'AI Composer'}</h1>
               <p className="text-xs text-gray-500 font-medium">Powered by AI</p>
            </div>
         </div>

         <div className="bg-gray-100 p-1 rounded-lg flex font-medium text-sm">
            <button 
               onClick={() => setActiveTab('search')}
               className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'search' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700'}`}
            >
               Find Chords
            </button>
            <button 
               onClick={() => setActiveTab('compose')}
               className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'compose' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700'}`}
            >
               Generate New
            </button>
         </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto p-4">
         
         {/* SEARCH MODE */}
         {activeTab === 'search' && (
            <div className="max-w-4xl mx-auto space-y-6">
               <form onSubmit={handleSearch} className="bg-white p-2 rounded-xl shadow border border-gray-100 flex flex-col md:flex-row gap-2">
                  <input 
                     type="text" 
                     placeholder="Song Title..." 
                     value={songQuery}
                     onChange={e => setSongQuery(e.target.value)}
                     className="flex-1 p-3 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 font-medium"
                  />
                  <div className="w-px bg-gray-200 hidden md:block my-2"></div>
                  <input 
                     type="text" 
                     placeholder="Artist Name (optional)..." 
                     value={artistQuery}
                     onChange={e => setArtistQuery(e.target.value)}
                     className="flex-1 p-3 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 font-medium"
                  />
                  <button 
                     type="submit" 
                     disabled={loadingSearch}
                     className="relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold shadow transition-all active:scale-95 disabled:opacity-50"
                  >
                     {loadingSearch ? (
                        <div className="flex items-center gap-2">
                           <span className="relative">
                              <MagnifyingGlassIcon className="w-4 h-4 animate-spin" />
                           </span>
                           {searchStage === 'searching' ? 'Searching...' : 'Analyzing...'}
                        </div>
                     ) : 'Search'}
                     {loadingSearch && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
                     )}
                  </button>
               </form>

               {/* Loading State */}
               {loadingSearch && searchStage === 'searching' && !songResult && (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                     <div className="flex flex-col items-center gap-4">
                        <ComposerLoader />
                        <div className="space-y-2">
                           <h3 className="font-bold text-gray-700">Finding chords...</h3>
                           <p className="text-sm text-gray-500">Searching through millions of chord patterns</p>
                        </div>
                        <WaveLoader />
                     </div>
                  </div>
               )}

               {loadingSearch && searchStage === 'analyzing' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-8">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="p-2 bg-blue-50 rounded-lg">
                           <ChartBarIcon className="w-6 h-6 text-blue-600 animate-pulse" />
                        </div>
                        <div className="flex-1">
                           <h3 className="font-bold text-gray-700">Analyzing Music Theory</h3>
                           <p className="text-sm text-gray-500">Processing chord relationships and patterns</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <span className="text-sm text-gray-600">Chord Detection</span>
                           <span className="text-sm font-bold text-green-600 animate-pulse">Complete ✓</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-sm text-gray-600">Progression Analysis</span>
                           <WaveLoader />
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-sm text-gray-600">Harmony Mapping</span>
                           <PulseLoader />
                        </div>
                     </div>
                  </div>
               )}

               {songResult ? (
                  <div className="space-y-4 animate-slide-in">
                     <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                           <BookOpenIcon className="w-5 h-5" /> 
                           Chord Sheet: {songResult.songTitle}
                        </h2>
                        <div className="flex gap-2">
                           <button 
                              onClick={handlePlay}
                              disabled={isPlaying}
                              className="relative overflow-hidden text-indigo-600 text-sm font-bold hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                           >
                              <PlayCircleIcon className="w-4 h-4" />
                              {isPlaying ? 'Playing...' : 'Play'}
                              {isPlaying && (
                                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/20 to-transparent animate-shimmer"></div>
                              )}
                           </button>
                           {!theoryAnalysis && (
                              <button 
                                 onClick={handleAnalyze} 
                                 disabled={analyzing}
                                 className="text-indigo-600 text-sm font-bold hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                              >
                                 {analyzing ? (
                                    <>
                                       <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                       Analyzing...
                                    </>
                                 ) : 'Analyze Theory'}
                              </button>
                           )}
                        </div>
                     </div>

                     {analyzing && !theoryAnalysis && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-xl">
                           <div className="flex items-center gap-3 mb-4">
                              <BeakerIcon className="w-6 h-6 text-blue-600 animate-pulse" />
                              <div>
                                 <h3 className="font-bold text-blue-900">AI Music Theory Analysis</h3>
                                 <p className="text-sm text-blue-700">Processing harmonic relationships...</p>
                              </div>
                           </div>
                           <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                 <span className="text-sm text-blue-800">Detecting Chord Functions</span>
                                 <div className="w-24 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                                 </div>
                              </div>
                              <div className="flex items-center justify-between">
                                 <span className="text-sm text-blue-800">Analyzing Progressions</span>
                                 <div className="w-24 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '40%' }}></div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {theoryAnalysis && (
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-indigo-900 animate-slide-in">
                           <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-2">
                              <InformationCircleIcon className="w-4 h-4" /> Music Theory Analysis
                           </h3>
                           <p className="leading-relaxed text-sm">{theoryAnalysis}</p>
                        </div>
                     )}

                     <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 relative min-h-[400px] animate-slide-in">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-b from-gray-100 to-transparent opacity-50"></div>
                        <div className="space-y-1">
                           {renderChordSheet(formatChordSheet(songResult))}
                        </div>
                     </div>
                  </div>
               ) : !loadingSearch && (
                  <div className="text-center py-12 opacity-50 animate-pulse">
                     <MagnifyingGlassIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                     <p className="text-gray-400 font-medium">Enter a song title to get chords & lyrics</p>
                  </div>
               )}
            </div>
         )}

         {/* COMPOSE MODE */}
         {activeTab === 'compose' && (
            <div className="max-w-4xl mx-auto space-y-6">
               
               <div className="bg-white p-6 rounded-xl shadow border border-gray-100 animate-slide-in">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                     <AdjustmentsHorizontalIcon className="w-5 h-5 text-purple-500" /> Progression Settings
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                     <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Musical Genre</label>
                        <input 
                           type="text" 
                           value={genre} 
                           onChange={e => setGenre(e.target.value)}
                           className="w-full p-3 bg-gray-50 border-gray-200 rounded-lg text-gray-900 font-bold focus:ring-purple-500 focus:border-purple-500"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Emotional Mood</label>
                        <input 
                           type="text" 
                           value={mood} 
                           onChange={e => setMood(e.target.value)}
                           className="w-full p-3 bg-gray-50 border-gray-200 rounded-lg text-gray-900 font-bold focus:ring-purple-500 focus:border-purple-500"
                        />
                     </div>
                  </div>
                  
                  {loadingCompose && (
                     <div className="mb-4 space-y-2">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                           <span>Generating progression...</span>
                           <span className="font-bold">{Math.round(composeProgress)}%</span>
                        </div>
                        <ProgressLoader progress={composeProgress} />
                     </div>
                  )}

                  <button 
                     onClick={handleCompose}
                     disabled={loadingCompose}
                     className="relative overflow-hidden w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-purple-200 hover:shadow-xl transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                     {loadingCompose ? (
                        <>
                           <ComposerLoader />
                           <span className="relative">
                              Composing...
                              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
                           </span>
                        </>
                     ) : (
                        <>
                           <SparklesIcon className="w-5 h-5" />
                           Generate Progression
                        </>
                     )}
                  </button>
               </div>

               {/* Loading State for Composition */}
               {loadingCompose && !composeResult && (
                  <div className="space-y-6 animate-slide-in">
                     <div className="bg-white rounded-xl border border-gray-200 p-8">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="p-2 bg-purple-50 rounded-lg">
                              <MusicalNoteIcon className="w-6 h-6 text-purple-600 animate-bounce" />
                           </div>
                           <div className="flex-1">
                              <h3 className="font-bold text-gray-700">AI Composition in Progress</h3>
                              <p className="text-sm text-gray-500">Creating unique chord progressions based on your settings</p>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <div className="flex items-center justify-between animate-pulse">
                              <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                                 <span className="text-sm text-gray-600">Generating Chord Sequence</span>
                              </div>
                              <ClockIcon className="w-4 h-4 text-gray-400" />
                           </div>
                           <div className="flex items-center justify-between animate-pulse" style={{ animationDelay: '200ms' }}>
                              <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                 <span className="text-sm text-gray-600">Applying Music Theory Rules</span>
                              </div>
                              <ChartBarIcon className="w-4 h-4 text-gray-400" />
                           </div>
                           <div className="flex items-center justify-between animate-pulse" style={{ animationDelay: '400ms' }}>
                              <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                                 <span className="text-sm text-gray-600">Optimizing for Playability</span>
                              </div>
                              <SparklesIcon className="w-4 h-4 text-gray-400" />
                           </div>
                        </div>
                     </div>

                     <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                           <ArrowPathIcon className="w-4 h-4 animate-spin" />
                           Preview Chords Being Generated
                        </h4>
                        <ChordMatrixLoader />
                     </div>
                  </div>
               )}

               {composeResult && (
                  <div className="space-y-4 animate-slide-in">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center transition-all hover:shadow-md">
                           <div className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Key</div>
                           <div className="text-2xl font-black text-gray-900">{composeResult.key}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center transition-all hover:shadow-md">
                           <div className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Tempo</div>
                           <div className="text-2xl font-black text-gray-900">120 <span className="text-sm text-gray-400 font-normal">BPM</span></div>
                        </div>
                        <button 
                          onClick={handlePlay}
                          disabled={isPlaying}
                          className="relative overflow-hidden bg-gray-900 text-white rounded-lg shadow hover:bg-black transition-all flex flex-col items-center justify-center p-4 group disabled:opacity-50 hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                           {isPlaying && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                           )}
                           <PlayCircleIcon className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                           <span className="text-sm font-bold">{isPlaying ? 'Playing...' : 'Play Preview'}</span>
                        </button>
                     </div>

                     <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 relative min-h-[400px]">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-b from-gray-100 to-transparent opacity-50"></div>
                        <div className="space-y-1">
                           {renderChordSheet(formatChordSheet(composeResult))}
                        </div>
                     </div>

                     {composeResult.substitutions && composeResult.substitutions.length > 0 && (
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm animate-slide-in">
                           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Chord Substitutions</h3>
                           <div className="grid md:grid-cols-2 gap-3">
                              {composeResult.substitutions.map((sub: { originalChord: string; substitutedChord: string; theory: string }, index: number) => (
                                 <div key={index} className="p-3 bg-gradient-to-r from-gray-50 to-indigo-50 rounded border border-gray-100 transition-all hover:border-indigo-200">
                                    <div className="flex items-center gap-2 mb-2">
                                       <span className="line-through text-gray-500 text-sm">{sub.originalChord}</span>
                                       <span className="text-gray-400 animate-pulse">→</span>
                                       <span className="text-indigo-600 font-bold bg-indigo-100 px-2 py-1 rounded text-sm animate-pulse-scale">{sub.substitutedChord}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{sub.theory}</p>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {composeResult.practiceTips && composeResult.practiceTips.length > 0 && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 p-4 rounded-lg animate-slide-in">
                           <h3 className="text-purple-900 font-bold mb-2 flex items-center gap-2">
                              <SparklesIcon className="w-4 h-4" />
                              Practice Tips
                           </h3>
                           <ul className="space-y-2">
                              {composeResult.practiceTips.map((tip: string, index: number) => (
                                 <li key={index} className="flex items-start gap-2 text-purple-800 text-sm animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                                    <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 font-bold text-xs mt-0.5 animate-pulse">
                                       {index + 1}
                                    </span>
                                    <span>{tip}</span>
                                 </li>
                              ))}
                           </ul>
                        </div>
                     )}
                  </div>
               )}
            </div>
         )}
      </div>

      {/* BOTTOM VISUALIZER PANEL */}
      <div className={`bg-white border-t border-gray-200 shadow-lg z-40 transition-all duration-300 ease-in-out flex flex-col shrink-0 ${isVisualizerOpen ? 'h-56' : 'h-12'}`}>
         <div 
            className="h-12 px-4 flex items-center justify-between cursor-pointer bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-white border-b border-gray-200 transition-all"
            onClick={() => setIsVisualizerOpen(!isVisualizerOpen)}
         >
            <div className="flex items-center gap-2">
               <ChevronUpIcon className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isVisualizerOpen ? 'rotate-180' : ''}`} />
               <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">Chord Visualizer</span>
               {extractedChords.length > 0 && (
                  <span className="text-[10px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse-scale">
                     {extractedChords.length} chords
                  </span>
               )}
            </div>

            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
               <span className="text-[10px] font-bold text-gray-400 uppercase hidden sm:inline-block">Instrument:</span>
               <div className="flex bg-white border border-gray-200 p-0.5 rounded-md shadow-sm">
                  <button 
                     onClick={() => setSelectedInstrument('Guitar')}
                     className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${selectedInstrument === 'Guitar' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                     Guitar
                  </button>
                  <button 
                     onClick={() => setSelectedInstrument('Ukulele')}
                     className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${selectedInstrument === 'Ukulele' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                     Ukulele
                  </button>
               </div>
            </div>
         </div>

         {isVisualizerOpen && (
             <div className="flex-1 overflow-x-auto p-4 flex items-center gap-4 bg-white">
                {extractedChords.length > 0 ? (
                    extractedChords.map((chord: string, index: number) => (
                       <div key={chord} className="shrink-0 transition-all hover:-translate-y-1 hover:shadow-lg">
                          <ChordBox 
                            chord={chord} 
                            instrument={selectedInstrument} 
                            isAnimating={isAnimatingChords}
                          />
                       </div>
                    ))
                ) : (
                    <div className="w-full flex flex-col items-center justify-center text-gray-400">
                       {activeTab === 'compose' && loadingCompose ? (
                          <div className="flex flex-col items-center gap-2">
                             <TypingLoader />
                             <p className="text-sm text-gray-500 mt-2">Generating chords...</p>
                          </div>
                       ) : (
                          <>
                             <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-3">
                                <MusicalNoteIcon className="w-8 h-8 text-gray-300" />
                             </div>
                             <p className="text-sm font-medium">Select a song or generate a progression to see chords</p>
                          </>
                       )}
                    </div>
                )}
             </div>
         )}
      </div>

    </div>
  );
};

export default ChordStudio;