import { createContext, useContext, useState, useCallback } from 'react';

interface QuantumState {
  environmentalResonance: number;
  naturalHarmony: number;
  energyFlow: 'balanced' | 'fluctuating' | 'disrupted';
  cyclePhase: 'growth' | 'harvest' | 'rest' | 'preparation';
}

interface QuantumStateContextType {
  state: QuantumState;
  updateState: (updates: Partial<QuantumState>) => void;
}

const initialState: QuantumState = {
  environmentalResonance: 1,
  naturalHarmony: 1,
  energyFlow: 'balanced',
  cyclePhase: 'growth'
};

const QuantumStateContext = createContext<QuantumStateContextType | undefined>(undefined);

export const useQuantumState = () => {
  const context = useContext(QuantumStateContext);
  if (!context) {
    throw new Error('useQuantumState must be used within a QuantumStateProvider');
  }
  return context.state;
};

interface QuantumStateProviderProps {
  children: React.ReactNode;
}

export const QuantumStateProvider: React.FC<QuantumStateProviderProps> = ({ children }) => {
  const [state, setState] = useState<QuantumState>(initialState);

  const updateState = useCallback((updates: Partial<QuantumState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <QuantumStateContext.Provider value={{ state, updateState }}>
      {children}
    </QuantumStateContext.Provider>
  );
};