import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useQuantumState } from './quantum-state';
import { useNaturalIntegration } from './natural-integration';
import { useQuantumBalance } from './quantum-balance-engine';
import { environmentalStyles } from './environmental-adapter.styles';

export interface EnvironmentalCondition {
  type: 'seasonal' | 'celestial' | 'biodynamic' | 'energetic';
  intensity: number;
  resonance: number;
}

interface EnvironmentalState {
  conditions: EnvironmentalCondition[];
  harmony: number;
  updateConditions: (conditions: EnvironmentalCondition[]) => void;
}

const EnvironmentalContext = createContext<EnvironmentalState | undefined>(undefined);

export const useEnvironmentalState = () => {
  const context = useContext(EnvironmentalContext);
  if (!context) {
    throw new Error('useEnvironmentalState must be used within an EnvironmentalProvider');
  }
  return context;
};

interface EnvironmentalProviderProps {
  children: React.ReactNode;
}

export const EnvironmentalProvider: React.FC<EnvironmentalProviderProps> = ({ children }) => {
  const [conditions, setConditions] = useState<EnvironmentalCondition[]>([]);
  const [harmony, setHarmony] = useState(1);
  const quantumState = useQuantumState();
  const { integrate } = useNaturalIntegration();
  const { balance } = useQuantumBalance();

  useEffect(() => {
    if (conditions.length > 0) {
      const newHarmony = conditions.reduce((acc, condition) => {
        return acc * condition.resonance;
      }, 1);
      
      setHarmony(balance(newHarmony));
      integrate('environmental', newHarmony);
    }
  }, [conditions, balance, integrate]);

  const updateConditions = useCallback((newConditions: EnvironmentalCondition[]) => {
    setConditions(newConditions);
  }, []);

  return (
    <EnvironmentalContext.Provider value={{ conditions, harmony, updateConditions }}>
      {children}
    </EnvironmentalContext.Provider>
  );
};

interface EnvironmentalAdapterProps {
  conditions: EnvironmentalCondition[];
  children: React.ReactNode;
  cycleAware?: boolean;
  layered?: boolean;
  onResonanceChange?: (resonance: number) => void;
}

export const EnvironmentalAdapter: React.FC<EnvironmentalAdapterProps> = ({
  conditions,
  children,
  cycleAware = false,
  layered = false,
  onResonanceChange
}) => {
  const { updateConditions } = useEnvironmentalState();
  const quantumState = useQuantumState();

  useEffect(() => {
    updateConditions(conditions);
    
    const totalResonance = conditions.reduce((acc, condition) => {
      return acc * condition.resonance;
    }, 1);

    onResonanceChange?.(totalResonance);
  }, [conditions, updateConditions, onResonanceChange]);

  const totalIntensity = conditions.reduce((acc, c) => acc * c.intensity, 1);
  const totalResonance = conditions.reduce((acc, c) => acc * (1 + (c.resonance - 1) / 2), 1);

  const classes: Record<string, boolean> = {
    [environmentalStyles.environmentalAdapter]: true,
    [environmentalStyles[`cyclePhase${quantumState.cyclePhase.charAt(0).toUpperCase() + quantumState.cyclePhase.slice(1)}`]]: cycleAware,
    [environmentalStyles.layered]: layered
  };

  const style = {
    '--intensity': totalIntensity,
    '--resonance': totalResonance
  } as React.CSSProperties;

  return (
    <div
      className={Object.keys(classes).filter(key => classes[key]).join(' ')}
      style={style}
      data-cycle-phase={cycleAware ? quantumState.cyclePhase : undefined}
      data-adaptation-layers={layered ? conditions.length : undefined}
    >
      {children}
    </div>
  );
};