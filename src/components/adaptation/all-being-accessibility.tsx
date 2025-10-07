import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQuantumState } from './quantum-state';
import { useMultiDimensionalAwareness } from './multi-dimensional-awareness';
import { useContextSensitiveRendering } from './context-sensitive-rendering';

interface AccessibilityState {
  dimensionalMode: 'physical' | 'quantum' | 'spiritual' | 'omnipresent';
  consciousnessLevel: number;
  perceptionFilters: Set<string>;
  realityMappings: Map<string, string>;
  universalControls: boolean;
}

interface AccessibilityContext {
  state: AccessibilityState;
  setDimensionalMode: (mode: AccessibilityState['dimensionalMode']) => void;
  setConsciousnessLevel: (level: number) => void;
  addPerceptionFilter: (filter: string) => void;
  removePerceptionFilter: (filter: string) => void;
  mapReality: (from: string, to: string) => void;
  toggleUniversalControls: () => void;
}

const AllBeingAccessibilityContext = createContext<AccessibilityContext | undefined>(undefined);

export const useAllBeingAccessibility = () => {
  const context = useContext(AllBeingAccessibilityContext);
  if (!context) {
    throw new Error('useAllBeingAccessibility must be used within AllBeingAccessibilityProvider');
  }
  return context;
};

interface AllBeingAccessibilityProviderProps {
  children: React.ReactNode;
}

export const AllBeingAccessibilityProvider: React.FC<AllBeingAccessibilityProviderProps> = ({ children }) => {
  const [state, setState] = useState<AccessibilityState>({
    dimensionalMode: 'physical',
    consciousnessLevel: 1,
    perceptionFilters: new Set(),
    realityMappings: new Map(),
    universalControls: false
  });

  const setDimensionalMode = useCallback((mode: AccessibilityState['dimensionalMode']) => {
    setState(prev => ({ ...prev, dimensionalMode: mode }));
  }, []);

  const setConsciousnessLevel = useCallback((level: number) => {
    setState(prev => ({ ...prev, consciousnessLevel: Math.max(0, Math.min(level, 10)) }));
  }, []);

  const addPerceptionFilter = useCallback((filter: string) => {
    setState(prev => ({
      ...prev,
      perceptionFilters: new Set([...prev.perceptionFilters, filter])
    }));
  }, []);

  const removePerceptionFilter = useCallback((filter: string) => {
    setState(prev => {
      const newFilters = new Set(prev.perceptionFilters);
      newFilters.delete(filter);
      return { ...prev, perceptionFilters: newFilters };
    });
  }, []);

  const mapReality = useCallback((from: string, to: string) => {
    setState(prev => ({
      ...prev,
      realityMappings: new Map(prev.realityMappings).set(from, to)
    }));
  }, []);

  const toggleUniversalControls = useCallback(() => {
    setState(prev => ({ ...prev, universalControls: !prev.universalControls }));
  }, []);

  return (
    <AllBeingAccessibilityContext.Provider
      value={{
        state,
        setDimensionalMode,
        setConsciousnessLevel,
        addPerceptionFilter,
        removePerceptionFilter,
        mapReality,
        toggleUniversalControls
      }}
    >
      {children}
    </AllBeingAccessibilityContext.Provider>
  );
};

interface UniversalInputProps {
  type: 'thought' | 'energy' | 'vibration' | 'physical';
  children: React.ReactNode;
  onInteraction?: (mode: string, value: any) => void;
}

export const UniversalInput: React.FC<UniversalInputProps> = ({
  type,
  children,
  onInteraction
}) => {
  const { state } = useAllBeingAccessibility();
  const quantumState = useQuantumState();
  const { detectCurrentDimension } = useMultiDimensionalAwareness();
  const { renderingContext } = useContextSensitiveRendering();

  const handleInteraction = (event: React.SyntheticEvent) => {
    const interactionMode = state.dimensionalMode;
    const value = extractUniversalValue(event, type);
    onInteraction?.(interactionMode, value);
  };

  return (
    <div
      className="universal-input"
      data-input-type={type}
      data-consciousness-level={state.consciousnessLevel}
      data-dimension={state.dimensionalMode}
      onMouseEnter={handleInteraction}
      onFocus={handleInteraction}
      role="application"
      aria-atomic="true"
    >
      {children}
    </div>
  );
};

// Helper function to extract universal values from different interaction types
function extractUniversalValue(event: React.SyntheticEvent, type: string): any {
  switch (type) {
    case 'thought':
      return {
        intensity: event.type === 'focus' ? 1 : 0.5,
        frequency: Math.random(),
        pattern: 'coherent'
      };
    case 'energy':
      return {
        magnitude: event.type === 'mouseenter' ? 0.8 : 0.3,
        flow: 'harmonious',
        field: 'stable'
      };
    case 'vibration':
      return {
        amplitude: 0.7,
        frequency: 432, // Hz - Universal frequency
        resonance: 0.9
      };
    case 'physical':
      return {
        position: (event as React.MouseEvent).clientX
          ? { x: (event as React.MouseEvent).clientX, y: (event as React.MouseEvent).clientY }
          : undefined,
        pressure: 1,
        duration: Date.now()
      };
    default:
      return undefined;
  }
}