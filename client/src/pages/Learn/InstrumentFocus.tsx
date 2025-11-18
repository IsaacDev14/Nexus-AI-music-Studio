// src/pages/Learn/InstrumentFocus.tsx
import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { 
  GiGuitar,
  GiDrumKit,
  GiPianoKeys,
  GiSaxophone,
  GiViolin,
  GiMicrophone
} from 'react-icons/gi';

// --- MOCK DATA ---
const AVAILABLE_INSTRUMENTS = [
  { id: 1, name: 'Guitar', icon: GiGuitar, type: 'String' },
  { id: 2, name: 'Piano/Keyboard', icon: GiPianoKeys, type: 'Keyboard' },
  { id: 3, name: 'Drums', icon: GiDrumKit, type: 'Percussion' },
  { id: 4, name: 'Saxophone', icon: GiSaxophone, type: 'Wind' },
  { id: 5, name: 'Bass Guitar', icon: GiGuitar, type: 'String' }, // Using GiGuitar for bass
  { id: 6, name: 'Violin', icon: GiViolin, type: 'String' },
  { id: 7, name: 'Voice', icon: GiMicrophone, type: 'Vocal' },
];

// Mocking initial user instrument selection (e.g., loaded from API)
const INITIAL_SELECTION = [1, 2];
// -----------------

interface InstrumentCardProps {
  instrument: typeof AVAILABLE_INSTRUMENTS[0];
  isSelected: boolean;
  onToggle: (id: number) => void;
}

const InstrumentCard: React.FC<InstrumentCardProps> = ({ instrument, isSelected, onToggle }) => {
  const IconComponent = instrument.icon;
  
  return (
    <button
      onClick={() => onToggle(instrument.id)}
      className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition duration-200 ease-in-out w-40 h-40 shadow-sm
        ${isSelected 
          ? 'border-indigo-600 bg-indigo-50 text-indigo-800 ring-4 ring-indigo-200 shadow-lg' 
          : 'border-gray-200 bg-white hover:border-indigo-400 hover:shadow-md text-gray-700'
        }
      `}
    >
      <IconComponent className={`w-10 h-10 mb-2 ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`} />
      <span className="font-semibold text-lg">{instrument.name}</span>
      <span className="text-xs text-gray-500 mt-1">{instrument.type}</span>
    </button>
  );
};

const InstrumentFocus = () => {
  const [selectedInstruments, setSelectedInstruments] = useState(INITIAL_SELECTION);

  const handleToggleInstrument = (id: number) => {
    setSelectedInstruments(prev => 
      prev.includes(id) 
        ? prev.filter(instrumentId => instrumentId !== id) // Deselect
        : [...prev, id] // Select
    );
  };

  return (
    <div className="p-12">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
        Instrument Focus
      </h1>
      <p className="text-lg text-gray-600 mb-10">
        Tell us which instruments you play to personalize your lessons and content.
      </p>

      {/* Instrument Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {AVAILABLE_INSTRUMENTS.map(instrument => (
          <InstrumentCard
            key={instrument.id}
            instrument={instrument}
            isSelected={selectedInstruments.includes(instrument.id)}
            onToggle={handleToggleInstrument}
          />
        ))}

        {/* Add Custom Instrument Card */}
        <button
          className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-300 transition duration-200 w-40 h-40 bg-gray-50 hover:border-indigo-500 hover:text-indigo-600 text-gray-500"
        >
          <PlusIcon className="w-8 h-8 mb-2" />
          <span className="font-medium text-sm">Add Other Instrument</span>
        </button>
      </div>

      {/* Action Button */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <button 
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 disabled:opacity-50"
          disabled={selectedInstruments.length === 0}
        >
          Save Instruments ({selectedInstruments.length} Selected)
        </button>
      </div>
    </div>
  );
};

export default InstrumentFocus;