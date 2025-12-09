/* eslint-disable */
// src/pages/Compose/ChordStudio.tsx

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { aiApi, type FullDisplayData } from '../../api/apiService';
import { 
  MagnifyingGlassIcon, 
  SparklesIcon, 
  PlayCircleIcon,
  InformationCircleIcon,
  ChevronUpIcon,
  MusicalNoteIcon,
  HashtagIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// ==========================================
// 1. ANIMATED LOADERS
// ==========================================

const WaveLoader: React.FC = () => (
  <div className="flex justify-center space-x-1 h-6 items-end">
    <div className="w-1 h-3 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
    <div className="w-1 h-5 bg-indigo-500 rounded-full animate-pulse delay-75"></div>
    <div className="w-1 h-8 bg-indigo-600 rounded-full animate-pulse delay-150"></div>
    <div className="w-1 h-5 bg-indigo-500 rounded-full animate-pulse delay-200"></div>
    <div className="w-1 h-3 bg-indigo-400 rounded-full animate-pulse delay-300"></div>
  </div>
);

const ComposerLoader: React.FC = () => (
  <div className="relative w-12 h-12 mx-auto">
    <div className="absolute inset-0 border-2 border-purple-200 rounded-full animate-spin"></div>
    <div className="absolute inset-2 border-2 border-purple-300 rounded-full animate-spin-reverse"></div>
    <div className="absolute inset-0 flex items-center justify-center">
      <MusicalNoteIcon className="w-4 h-4 text-purple-600 animate-bounce" />
    </div>
  </div>
);

const ChordMatrixLoader: React.FC = () => (
  <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
    ))}
  </div>
);

const ProgressLoader: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
    <div 
      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out"
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

// ==========================================
// 2. CONSTANTS & DATA TYPES
// ==========================================

const KEYS = ['Original', 'C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const INSTRUMENTS = ['Guitar', 'Ukulele', 'Piano'];
const NOTATION_MODES = ['Standard', 'Numbers (1 4 5)', 'Roman (I IV V)'];

type Instrument = 'Guitar' | 'Ukulele' | 'Piano';
type NotationMode = 'Standard' | 'Numbers (1 4 5)' | 'Roman (I IV V)';

// Visuals Dictionary
const CHORD_SHAPES: Record<string, Record<string, number[]>> = {
  Guitar: {
    'C': [-1,3,2,0,1,0], 'Cm': [-1,3,5,5,4,3], 'C7': [-1,3,2,3,1,0], 'Cmaj7': [-1,3,2,0,0,0],
    'D': [-1,-1,0,2,3,2], 'Dm': [-1,-1,0,2,3,1], 'D7': [-1,-1,0,2,1,2], 'Dmaj7': [-1,-1,0,2,2,2],
    'E': [0,2,2,1,0,0], 'Em': [0,2,2,0,0,0], 'E7': [0,2,0,1,0,0], 'Emaj7': [0,2,1,1,0,0],
    'F': [1,3,3,2,1,1], 'Fm': [1,3,3,1,1,1], 'F7': [1,3,1,2,1,1], 'Fmaj7': [-1,3,3,2,1,0],
    'G': [3,2,0,0,0,3], 'Gm': [3,5,5,3,3,3], 'G7': [3,2,0,0,0,1], 'Gmaj7': [3,2,0,0,0,2],
    'A': [-1,0,2,2,2,0], 'Am': [-1,0,2,2,1,0], 'A7': [-1,0,2,0,2,0], 'Amaj7': [-1,0,2,1,2,0],
    'B': [-1,2,4,4,4,2], 'Bm': [-1,2,4,4,3,2], 'B7': [-1,2,1,2,0,2],
    'G/B': [-1,2,0,0,0,3], 'C/E': [0,3,2,0,1,0], 'D/F#': [2,0,0,2,3,2],
    'Am/G': [3,0,2,2,1,0], 'F/C': [-1,3,3,2,1,1], 'G/F': [1,2,0,0,0,3],
    'Bb': [-1,1,3,3,3,1], 'Eb': [-1,-1,1,3,4,3], 'Bbsus4': [-1,1,3,3,4,1],
    'Csus4': [-1,3,3,0,1,1], 'Dsus4': [-1,-1,0,2,3,3], 'Gsus4': [3,2,0,0,1,3],
    'F#m': [2,4,4,2,2,2], 'C#m': [-1,4,6,6,5,4], 'Ab': [4,6,6,5,4,4], 'Db': [-1,4,6,6,6,4]
  },
  Ukulele: {
    'C': [0,0,0,3], 'Cm': [0,3,3,3], 'C7': [0,0,0,1],
    'D': [2,2,2,0], 'Dm': [2,2,1,0], 'D7': [2,2,2,3],
    'E': [4,4,4,2], 'Em': [0,4,3,2], 'E7': [1,2,0,2],
    'F': [2,0,1,0], 'Fm': [1,0,1,3], 'F7': [2,3,1,0],
    'G': [0,2,3,2], 'Gm': [0,2,3,1], 'G7': [0,2,1,2],
    'A': [2,1,0,0], 'Am': [2,0,0,0], 'A7': [0,1,0,0],
    'B': [4,3,2,2], 'Bm': [4,2,2,2], 'B7': [2,3,2,2],
    'Bb': [3,2,1,1], 'Eb': [0,3,3,1], 'G/B': [4,2,3,2], 'D/F#': [2,2,2,0]
  }
};

// ==========================================
// 3. AUDIO & THEORY ENGINE
// ==========================================

const NOTE_MAP: Record<string, number> = { 
  'C':0, 'C#':1, 'Db':1, 'D':2, 'D#':3, 'Eb':3, 'E':4, 'F':5, 'F#':6, 'Gb':6, 
  'G':7, 'G#':8, 'Ab':8, 'A':9, 'A#':10, 'Bb':10, 'B':11 
};

// Helper: Calculate frequency
const getFreq = (noteIndex: number, octave: number) => {
  const midiNote = noteIndex + (octave + 1) * 12; 
  return 440 * Math.pow(2, (midiNote - 69) / 12);
};

// Helper: Format Chord Sheet (Missing in your code previously)
const formatChordSheet = (songData: FullDisplayData): string => {
  if (!songData) return '';
  let formattedResult = '';

  // Use tablature if available
  if (songData.tablature && songData.tablature.length > 0) {
    songData.tablature.forEach((section: { section: string; lines: Array<{ lyrics: string; isChordLine: boolean }> }) => {
      formattedResult += `[${section.section}]\n`;
      section.lines.forEach((line) => {
        formattedResult += `${line.lyrics}\n`;
      });
      formattedResult += `\n`;
    });
  } else if (songData.progression) {
    // Fallback: Create basic structure from progression
    formattedResult += `[Chords]\n`;
    const chords = songData.progression.map((p: any) => p.chord);
    
    // Group in lines of 4
    for (let i = 0; i < chords.length; i += 4) {
        formattedResult += chords.slice(i, i + 4).join('    ') + '\n\n';
    }
  }

  return formattedResult;
};

// Helper: Convert Notation
const convertChordToNotation = (chord: string, key: string, mode: NotationMode): string => {
  if (mode === 'Standard') return chord;
  if (!key || key === 'Original') return chord; 

  const keyRoot = key.split(' ')[0]; 
  if (NOTE_MAP[keyRoot] === undefined) return chord;

  const slashParts = chord.split('/');
  const chordRootMatch = slashParts[0].match(/^([A-G][#b]?)(.*)$/);
  if (!chordRootMatch) return chord;

  const rootNote = chordRootMatch[1];
  const quality = chordRootMatch[2];
  const bassNote = slashParts[1]; 

  const keyVal = NOTE_MAP[keyRoot];
  const rootVal = NOTE_MAP[rootNote];
  let diff = rootVal - keyVal;
  if (diff < 0) diff += 12;

  const degrees: Record<number, {n: string, r: string}> = {
    0: {n:'1', r:'I'}, 1: {n:'b2', r:'bII'}, 2: {n:'2', r:'II'}, 3: {n:'b3', r:'bIII'},
    4: {n:'3', r:'III'}, 5: {n:'4', r:'IV'}, 6: {n:'#4', r:'#IV'}, 7: {n:'5', r:'V'},
    8: {n:'b6', r:'bVI'}, 9: {n:'6', r:'VI'}, 10: {n:'b7', r:'bVII'}, 11: {n:'7', r:'VII'}
  };

  const d = degrees[diff];
  if (!d) return chord;

  let result = '';

  if (mode === 'Roman (I IV V)') {
    if (quality.includes('m') && !quality.includes('maj')) {
      result = d.r.toLowerCase() + quality.replace('m', '');
    } else {
      result = d.r + quality;
    }
  } else {
    if (quality.includes('m') && !quality.includes('maj')) {
      result = d.n + '-' + quality.replace('m', '');
    } else {
      result = d.n + quality;
    }
  }

  if (bassNote) {
    const bassVal = NOTE_MAP[bassNote];
    if (bassVal !== undefined) {
       let bassDiff = bassVal - keyVal;
       if (bassDiff < 0) bassDiff += 12;
       const bassDegree = degrees[bassDiff];
       if (bassDegree) {
          result += `/${mode === 'Roman (I IV V)' ? bassDegree.r : bassDegree.n}`;
       }
    }
  }

  return result;
};

// Player Logic
const playChord = (ctx: AudioContext, chordName: string, time: number, duration: number) => {
  const parts = chordName.split('/');
  const coreChord = parts[0];
  const bassChar = parts[1];

  const match = coreChord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return;
  
  const rootStr = match[1];
  const quality = match[2];
  
  if (NOTE_MAP[rootStr] === undefined) return;
  const rootVal = NOTE_MAP[rootStr];

  let intervals = [0, 4, 7]; 
  if (quality.includes('m') && !quality.includes('maj')) intervals = [0, 3, 7];
  if (quality.includes('dim')) intervals = [0, 3, 6];
  if (quality.includes('sus4')) intervals = [0, 5, 7];
  if (quality.includes('7')) quality.includes('maj') ? intervals.push(11) : intervals.push(10);
  if (quality.includes('9') || quality.includes('add9')) intervals.push(14);

  intervals.forEach(semi => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    let note = rootVal + semi;
    let oct = 4;
    while (note >= 12) { note -= 12; oct++; }
    
    osc.frequency.value = getFreq(note, oct);
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.1, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(time); osc.stop(time + duration);
  });

  let bassVal = rootVal;
  if (bassChar && NOTE_MAP[bassChar] !== undefined) {
    bassVal = NOTE_MAP[bassChar];
  }
  
  const bassOsc = ctx.createOscillator();
  const bassGain = ctx.createGain();
  bassOsc.type = 'sawtooth';
  bassOsc.frequency.value = getFreq(bassVal, 2);
  bassGain.gain.setValueAtTime(0, time);
  bassGain.gain.linearRampToValueAtTime(0.15, time + 0.05);
  bassGain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  bassOsc.connect(bassGain); bassGain.connect(ctx.destination);
  bassOsc.start(time); bassOsc.stop(time + duration);
};

// ==========================================
// 4. VISUALIZER COMPONENTS
// ==========================================

const ChordBox: React.FC<{ chord: string; instrument: Instrument; isAnimating?: boolean }> = ({ chord, instrument, isAnimating }) => {
  if (instrument === 'Piano') {
     return (
        <div className={`flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm min-w-[100px] h-[140px] ${isAnimating ? 'animate-pulse' : ''}`}>
           <span className="font-bold text-gray-900 mb-2 text-sm">{chord}</span>
           <span className="text-4xl">🎹</span>
           <span className="text-[10px] text-gray-400 mt-2">Piano Voicing</span>
        </div>
     );
  }

  const root = chord.match(/^[A-G][#b]?m?/)?.[0] || chord;
  let shape = CHORD_SHAPES[instrument as 'Guitar'|'Ukulele']?.[chord]; 
  
  if (!shape) {
     const base = root.replace(/maj|dim|aug|sus|7|9|11|13/g, '');
     const cleanBase = base.split('/')[0];
     shape = CHORD_SHAPES[instrument as 'Guitar'|'Ukulele']?.[cleanBase];
  }

  if (!shape) return (
      <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm min-w-[100px] h-[140px] opacity-60">
        <span className="font-bold text-gray-900 mb-2 text-sm">{chord}</span>
        <MusicalNoteIcon className="w-6 h-6 text-gray-300" />
        <span className="text-[10px] text-gray-400 mt-1">No Diagram</span>
      </div>
  );

  const numStrings = instrument === 'Guitar' ? 6 : 4;
  const width = 80; const height = 100;
  const stringSpacing = width / (numStrings - 1);
  const fretSpacing = height / 5;

  return (
     <div className={`relative flex flex-col items-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm min-w-[120px] transition-transform ${isAnimating ? 'scale-105 shadow-md' : ''}`}>
        <span className="font-bold text-base text-gray-900 mb-2">{chord}</span>
        <svg width={width + 10} height={height + 10} viewBox={`-5 -5 ${width + 10} ${height + 10}`} className="overflow-visible">
           <line x1="0" y1="0" x2={width} y2="0" stroke="#333" strokeWidth="3" />
           {[1,2,3,4,5].map(i => <line key={i} x1="0" y1={i*fretSpacing} x2={width} y2={i*fretSpacing} stroke="#e5e7eb" strokeWidth="2" />)}
           {Array.from({length: numStrings}).map((_, i) => <line key={i} x1={i*stringSpacing} y1="0" x2={i*stringSpacing} y2={height} stroke="#374151" strokeWidth="1" />)}
           {shape.map((fret, i) => {
              const cx = i * stringSpacing;
              if (fret === -1) return <text key={i} x={cx} y="-6" textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="bold">×</text>;
              if (fret === 0) return <circle key={i} cx={cx} cy="-6" r="2.5" stroke="#374151" fill="none" />;
              return <circle key={i} cx={cx} cy={(fret*fretSpacing) - (fretSpacing/2)} r="5.5" fill="#4f46e5" />;
           })}
        </svg>
     </div>
  );
};

// ==========================================
// 5. MAIN PAGE COMPONENT
// ==========================================

const ChordStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'compose'>('search');
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>('Guitar');
  const [selectedKey, setSelectedKey] = useState('Original');
  const [notationMode, setNotationMode] = useState<NotationMode>('Standard');
  
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(true);
  const [isAnimatingChords, setIsAnimatingChords] = useState(false);
  const [composeProgress, setComposeProgress] = useState(0);
  const [searchStage, setSearchStage] = useState<'idle' | 'searching' | 'analyzing'>('idle');

  // Input State
  const [mood, setMood] = useState('Dreamy');
  const [genre, setGenre] = useState('Neo-Soul');
  const [songQuery, setSongQuery] = useState('');
  const [artistQuery, setArtistQuery] = useState('');
  
  // Results
  const [composeResult, setComposeResult] = useState<FullDisplayData | null>(null);
  const [songResult, setSongResult] = useState<FullDisplayData | null>(null);
  const [theoryAnalysis, setTheoryAnalysis] = useState<string>('');
  
  // Loading flags
  const [loadingCompose, setLoadingCompose] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Extract chords logic
  const extractedChords = useMemo(() => {
    const data = activeTab === 'search' ? songResult : composeResult;
    if (!data?.progression) return [];
    
    // Regex matches complex chords like G/B, Bbsus4, C#m7
    const chordRegex = /\b[A-G][#b]?(?:m|maj|dim|aug|sus|add)?(?:7|9|11|13|6)?(?:(?:\/)[A-G][#b]?)?\b/g;
    const allChords = data.progression.map((p: any) => p.chord).join(' ');
    const found = allChords.match(chordRegex) || [];
    return [...new Set(found)];
  }, [songResult, composeResult, activeTab]);

  useEffect(() => {
    if (extractedChords.length > 0) {
      setIsAnimatingChords(true);
      const t = setTimeout(() => setIsAnimatingChords(false), 1500);
      return () => clearTimeout(t);
    }
  }, [extractedChords]);

  const simulateProgress = () => {
    setComposeProgress(0);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      setComposeProgress(p => (p >= 90 ? 90 : p + Math.random() * 15));
    }, 300);
  };

  const handleCompose = async () => {
    setLoadingCompose(true);
    simulateProgress();
    try {
      const result = await aiApi.generateSongArrangement({
        songQuery: `${mood} ${genre} progression`,
        simplify: false,
        key: selectedKey,
        instrument: selectedInstrument,
        helpPractice: true,
        showSubstitutions: true
      });
      setComposeProgress(100);
      setTimeout(() => {
        setComposeResult(result);
        setLoadingCompose(false);
        setComposeProgress(0);
      }, 500);
    } catch (error) {
      setLoadingCompose(false);
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
        key: selectedKey,
        instrument: selectedInstrument,
        simplify: false, 
        includeLyrics: true
      });
      setSearchStage('analyzing');
      await new Promise(r => setTimeout(r, 800)); 
      setSongResult(result);
      setSearchStage('idle');
    } catch (error) {
      setSearchStage('idle');
      setLoadingSearch(false);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleAnalyze = async () => {
    if (!songResult) return;
    setAnalyzing(true);
    setTimeout(() => {
        const chords = extractedChords;
        const slashChords = chords.filter(c => c.includes('/'));
        setTheoryAnalysis(`This arrangement features ${chords.length} unique voicings in the key of ${songResult.key}. ` +
        (slashChords.length > 0 ? `Notice the use of slash chords like ${slashChords[0]} to create smooth bass line movement.` : '') +
        ` Ideally suited for ${selectedInstrument}.`);
        setAnalyzing(false);
    }, 1500);
  };

  const handlePlay = async () => {
    const data = activeTab === 'search' ? songResult : composeResult;
    if (isPlaying || !data?.progression) return;
    
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtxRef.current;
    if (ctx?.state === 'suspended') await ctx.resume();

    setIsPlaying(true);
    const now = ctx!.currentTime;
    let currentTime = now;
    const beatDuration = 0.8;

    data.progression.forEach((chord: any) => {
      playChord(ctx!, chord.chord, currentTime, beatDuration);
      currentTime += beatDuration;
    });

    setTimeout(() => setIsPlaying(false), (currentTime - now) * 1000);
  };

  // --- RENDER LOGIC WITH NOTATION CONVERSION & ALIGNMENT ---
  const renderChordSheet = (text: string, currentKey: string) => {
    return text.split('\n').map((line, i) => {
      const hasChords = /[A-G][#b]?(m|maj|dim|sus|7|9|add|aug)/.test(line);
      const isHeader = line.trim().startsWith('[') && line.trim().endsWith(']');
      
      let className = "font-mono text-sm md:text-base whitespace-pre block "; 
      let displayLine = line;

      if (hasChords && !line.match(/[a-z]/)) {
         className += "text-indigo-600 font-bold pt-4"; 
         
         displayLine = line.replace(/\b[A-G][#b]?(?:m|maj|dim|aug|sus|add)?(?:7|9|11|13|6)?(?:(?:\/)[A-G][#b]?)?\b/g, (match) => {
             return convertChordToNotation(match, currentKey, notationMode);
         });
      } else if (isHeader) {
         className += "font-bold text-gray-900 text-lg mt-6 mb-2 pt-4 border-t border-gray-100";
      } else {
         className += "text-gray-700 leading-relaxed";
      }
      
      return <div key={i} className={className}>{displayLine || '\u00A0'}</div>;
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50 overflow-hidden">
      <style>{`
        @keyframes wave { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.5); } }
        @keyframes spin-reverse { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-wave { animation: wave 1s ease-in-out infinite; }
        .animate-spin-reverse { animation: spin-reverse 3s linear infinite; }
        .animate-shimmer { animation: shimmer 2s infinite; }
      `}</style>

      {/* HEADER */}
      <header className="flex-none bg-white border-b px-4 py-3 flex justify-between items-center sticky top-0 z-50">
         <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${activeTab==='search'?'bg-indigo-100 text-indigo-600':'bg-purple-100 text-purple-600'}`}>
               {activeTab === 'search' ? <MagnifyingGlassIcon className="w-5 h-5"/> : <SparklesIcon className="w-5 h-5"/>}
            </div>
            <h1 className="font-bold text-gray-900 hidden sm:block">{activeTab === 'search' ? 'Song Library' : 'AI Composer'}</h1>
         </div>
         <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
            <button onClick={() => setActiveTab('search')} className={`px-3 py-1.5 rounded ${activeTab === 'search' ? 'bg-white shadow' : 'text-gray-500'}`}>Search</button>
            <button onClick={() => setActiveTab('compose')} className={`px-3 py-1.5 rounded ${activeTab === 'compose' ? 'bg-white shadow' : 'text-gray-500'}`}>Compose</button>
         </div>
      </header>

      {/* GLOBAL SETTINGS BAR */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-4 overflow-x-auto scrollbar-hide">
         <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Key:</span>
            <select
               value={selectedKey}
               onChange={(e) => setSelectedKey(e.target.value)}
               className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded px-2 py-1 outline-none cursor-pointer hover:bg-gray-100"
            >
               {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
         </div>

         <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Inst:</span>
            <select
               value={selectedInstrument}
               onChange={(e) => setSelectedInstrument(e.target.value as Instrument)}
               className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded px-2 py-1 outline-none cursor-pointer hover:bg-gray-100"
            >
               {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
         </div>

         <div className="flex items-center gap-2 border-l pl-4">
            <span className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap flex items-center gap-1">
               <HashtagIcon className="w-3 h-3"/> Notation:
            </span>
            <select
               value={notationMode}
               onChange={(e) => setNotationMode(e.target.value as NotationMode)}
               className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded px-2 py-1 outline-none cursor-pointer hover:bg-indigo-100"
            >
               {NOTATION_MODES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
         </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
         {activeTab === 'search' && (
            <div className="max-w-4xl mx-auto space-y-6">
               <form onSubmit={handleSearch} className="bg-white p-2 rounded-xl shadow-sm border flex gap-2">
                  <input className="flex-1 p-2 outline-none bg-transparent" placeholder="Song Title..." value={songQuery} onChange={e => setSongQuery(e.target.value)}/>
                  <input className="hidden sm:block w-1/3 p-2 outline-none bg-transparent border-l" placeholder="Artist..." value={artistQuery} onChange={e => setArtistQuery(e.target.value)}/>
                  <button type="submit" disabled={loadingSearch} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors">
                     {loadingSearch ? '...' : 'Search'}
                  </button>
               </form>

               {loadingSearch && (
                  <div className="bg-white p-8 rounded-xl border text-center">
                     {searchStage === 'searching' ? <ComposerLoader /> : <WaveLoader />}
                     <p className="text-sm text-gray-500 mt-4">{searchStage === 'searching' ? 'Finding song data...' : 'Analyzing harmony...'}</p>
                  </div>
               )}

               {songResult && (
                  <div className="space-y-4">
                     <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                        <div>
                           <h2 className="font-bold text-xl text-gray-800">{songResult.songTitle}</h2>
                           <p className="text-sm text-gray-500">{songResult.artist} • {songResult.key}</p>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={handlePlay} className="p-2 bg-indigo-600 text-white rounded-full shadow hover:scale-105 transition-transform"><PlayCircleIcon className="w-6 h-6"/></button>
                           <button onClick={handleAnalyze} disabled={analyzing} className="p-2 bg-white border text-gray-600 rounded-full shadow hover:bg-gray-50"><ChartBarIcon className="w-6 h-6"/></button>
                        </div>
                     </div>
                     {theoryAnalysis && <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm flex gap-2 border border-blue-100"><InformationCircleIcon className="w-5 h-5 shrink-0"/>{theoryAnalysis}</div>}
                     <div className="bg-white border rounded-xl p-6 shadow-sm min-h-[400px] overflow-x-auto">
                        {renderChordSheet(formatChordSheet(songResult), songResult.key)}
                     </div>
                  </div>
               )}
            </div>
         )}

         {activeTab === 'compose' && (
            <div className="max-w-4xl mx-auto space-y-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div><label className="text-xs font-bold text-gray-500">Genre</label><input className="w-full border rounded p-2 mt-1 outline-none focus:ring-2 ring-purple-100" value={genre} onChange={e => setGenre(e.target.value)}/></div>
                     <div><label className="text-xs font-bold text-gray-500">Mood</label><input className="w-full border rounded p-2 mt-1 outline-none focus:ring-2 ring-purple-100" value={mood} onChange={e => setMood(e.target.value)}/></div>
                  </div>
                  {loadingCompose && <ProgressLoader progress={composeProgress} />}
                  <button onClick={handleCompose} disabled={loadingCompose} className="w-full mt-4 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors">
                     {loadingCompose ? 'Composing...' : 'Generate Progression'}
                  </button>
               </div>

               {loadingCompose && !composeResult && <div className="bg-white p-6 rounded-xl border"><ChordMatrixLoader /></div>}

               {composeResult && (
                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border text-center"><div className="text-xs text-gray-500">Key</div><div className="font-bold text-xl">{composeResult.key}</div></div>
                        <button onClick={handlePlay} className="bg-gray-900 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-black transition-colors"><PlayCircleIcon className="w-6 h-6"/> Preview</button>
                     </div>
                     <div className="bg-white border rounded-xl p-6 shadow-sm min-h-[300px] overflow-x-auto">
                        {renderChordSheet(formatChordSheet(composeResult), composeResult.key)}
                     </div>
                  </div>
               )}
            </div>
         )}
      </div>

      {/* FOOTER VISUALIZER */}
      <div className={`bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 transition-all duration-300 flex flex-col shrink-0 ${isVisualizerOpen ? 'h-64' : 'h-12'}`}>
         <div className="h-12 px-4 flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => setIsVisualizerOpen(!isVisualizerOpen)}>
            <div className="flex items-center gap-2 text-gray-700">
               <ChevronUpIcon className={`w-4 h-4 transition-transform ${isVisualizerOpen ? 'rotate-180' : ''}`}/>
               <span className="text-xs font-bold uppercase tracking-widest">Chord Visualizer</span>
            </div>
            {extractedChords.length > 0 && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{extractedChords.length} Chords</span>}
         </div>
         {isVisualizerOpen && (
            <div className="flex-1 overflow-x-auto p-4 flex items-center gap-4 bg-gray-50/50">
               {extractedChords.length > 0 ? (
                  extractedChords.map((chord, i) => (
                     <div key={i} className="shrink-0"><ChordBox chord={chord} instrument={selectedInstrument} isAnimating={isAnimatingChords}/></div>
                  ))
               ) : (
                  <div className="w-full text-center text-gray-400 text-sm">Select a song to visualize chords</div>
               )}
            </div>
         )}
      </div>
    </div>
  );
};

export default ChordStudio;