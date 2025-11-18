import React, { createContext, useContext, useState, ReactNode } from 'react';

interface InstrumentContextType {
  selectedInstruments: number[];
  setSelectedInstruments: (instruments: number[]) => void;
}

const InstrumentContext = createContext<InstrumentContextType | undefined>(undefined);

export const useInstrument = () => {
  const context = useContext(InstrumentContext);
  if (context === undefined) {
    throw new Error('useInstrument must be used within an InstrumentProvider');
  }
  return context;
};

interface InstrumentProviderProps {
  children: ReactNode;
}

const InstrumentProvider: React.FC<InstrumentProviderProps> = ({ children }) => {
  const [selectedInstruments, setSelectedInstruments] = useState<number[]>([]);

  return (
    <InstrumentContext.Provider value={{ selectedInstruments, setSelectedInstruments }}>
      {children}
    </InstrumentContext.Provider>
  );
};

export default InstrumentProvider;