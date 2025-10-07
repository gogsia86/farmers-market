import { createContext, useContext, useReducer, useEffect } from 'react';
import { useConsciousnessInteraction } from './consciousness-interaction';
import { useAdaptation } from './context-adaptation-engine';

export interface EvolutionPattern {
  id: string;
  name: string;
  complexity: number;
  evolutionStage: number;
  quantumState: {
    resonance: number;
    coherence: number;
    entanglement: number;
  };
  consciousness: {
    awareness: number;
    intention: number;
    harmony: number;
  };
  adaptations: Set<string>;
}

interface EvolutionState {
  patterns: Map<string, EvolutionPattern>;
  globalEvolutionStage: number;
  quantumHarmony: number;
  consciousnessField: number;
  naturalResonance: number;
}

type EvolutionAction =
  | { type: 'EVOLVE_PATTERN'; payload: { patternId: string; evolution: Partial<EvolutionPattern> } }
  | { type: 'ADD_PATTERN'; payload: EvolutionPattern }
  | { type: 'REMOVE_PATTERN'; payload: string }
  | { type: 'UPDATE_GLOBAL_STAGE'; payload: number }
  | { type: 'UPDATE_QUANTUM_HARMONY'; payload: number }
  | { type: 'UPDATE_CONSCIOUSNESS_FIELD'; payload: number }
  | { type: 'UPDATE_NATURAL_RESONANCE'; payload: number };

const initialState: EvolutionState = {
  patterns: new Map(),
  globalEvolutionStage: 1,
  quantumHarmony: 0.5,
  consciousnessField: 0.5,
  naturalResonance: 0.5
};

const evolutionReducer = (state: EvolutionState, action: EvolutionAction): EvolutionState => {
  switch (action.type) {
    case 'EVOLVE_PATTERN': {
      const { patternId, evolution } = action.payload;
      const pattern = state.patterns.get(patternId);
      if (!pattern) return state;

      const newPattern = { ...pattern, ...evolution };
      const newPatterns = new Map(state.patterns);
      newPatterns.set(patternId, newPattern);

      return {
        ...state,
        patterns: newPatterns
      };
    }
    case 'ADD_PATTERN': {
      const newPatterns = new Map(state.patterns);
      newPatterns.set(action.payload.id, action.payload);
      return {
        ...state,
        patterns: newPatterns
      };
    }
    case 'REMOVE_PATTERN': {
      const newPatterns = new Map(state.patterns);
      newPatterns.delete(action.payload);
      return {
        ...state,
        patterns: newPatterns
      };
    }
    case 'UPDATE_GLOBAL_STAGE':
      return {
        ...state,
        globalEvolutionStage: action.payload
      };
    case 'UPDATE_QUANTUM_HARMONY':
      return {
        ...state,
        quantumHarmony: action.payload
      };
    case 'UPDATE_CONSCIOUSNESS_FIELD':
      return {
        ...state,
        consciousnessField: action.payload
      };
    case 'UPDATE_NATURAL_RESONANCE':
      return {
        ...state,
        naturalResonance: action.payload
      };
    default:
      return state;
  }
};

const SelfEvolvingContext = createContext<{
  state: EvolutionState;
  evolvePattern: (patternId: string, evolution: Partial<EvolutionPattern>) => void;
  addPattern: (pattern: EvolutionPattern) => void;
  removePattern: (patternId: string) => void;
} | null>(null);

export const SelfEvolvingProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(evolutionReducer, initialState);
  const { state: consciousnessState } = useConsciousnessInteraction();
  const { state: adaptationState } = useAdaptation();

  const evolvePattern = (patternId: string, evolution: Partial<EvolutionPattern>) => {
    dispatch({ type: 'EVOLVE_PATTERN', payload: { patternId, evolution } });
  };

  const addPattern = (pattern: EvolutionPattern) => {
    dispatch({ type: 'ADD_PATTERN', payload: pattern });
  };

  const removePattern = (patternId: string) => {
    dispatch({ type: 'REMOVE_PATTERN', payload: patternId });
  };

  useEffect(() => {
    // Monitor and evolve patterns based on consciousness and adaptation states
    const evolvePatterns = () => {
      state.patterns.forEach((pattern, patternId) => {
        const evolution = calculateEvolution(
          pattern,
          consciousnessState,
          adaptationState,
          state.globalEvolutionStage
        );
        if (evolution) {
          evolvePattern(patternId, evolution);
        }
      });
    };

    const intervalId = setInterval(evolvePatterns, 1000);
    return () => clearInterval(intervalId);
  }, [state.patterns, consciousnessState, adaptationState, state.globalEvolutionStage]);

  useEffect(() => {
    // Update global metrics
    dispatch({
      type: 'UPDATE_QUANTUM_HARMONY',
      payload: calculateQuantumHarmony(state.patterns)
    });
    dispatch({
      type: 'UPDATE_CONSCIOUSNESS_FIELD',
      payload: calculateConsciousnessField(state.patterns)
    });
    dispatch({
      type: 'UPDATE_NATURAL_RESONANCE',
      payload: calculateNaturalResonance(state.patterns)
    });
  }, [state.patterns]);

  return (
    <SelfEvolvingContext.Provider
      value={{ state, evolvePattern, addPattern, removePattern }}
    >
      {children}
    </SelfEvolvingContext.Provider>
  );
};

export const useSelfEvolution = () => {
  const context = useContext(SelfEvolvingContext);
  if (!context) {
    throw new Error('useSelfEvolution must be used within a SelfEvolvingProvider');
  }
  return context;
};

// Utility functions
const calculateEvolution = (
  pattern: EvolutionPattern,
  consciousnessState: any,
  adaptationState: any,
  globalStage: number
): Partial<EvolutionPattern> | null => {
  const consciousnessThreshold = 0.7;
  const quantumThreshold = 0.8;
  const adaptationThreshold = 3;

  const consciousnessLevel = consciousnessState.consciousnessMetrics.awareness;
  const quantumCoherence = pattern.quantumState.coherence;
  const adaptationCount = pattern.adaptations.size;

  if (
    consciousnessLevel >= consciousnessThreshold &&
    quantumCoherence >= quantumThreshold &&
    adaptationCount >= adaptationThreshold
  ) {
    return {
      evolutionStage: Math.min(pattern.evolutionStage + 1, globalStage + 1),
      complexity: pattern.complexity * 1.1,
      quantumState: {
        ...pattern.quantumState,
        resonance: Math.min(pattern.quantumState.resonance * 1.05, 1),
        coherence: Math.min(pattern.quantumState.coherence * 1.05, 1)
      }
    };
  }

  return null;
};

const calculateQuantumHarmony = (patterns: Map<string, EvolutionPattern>): number => {
  if (patterns.size === 0) return 0.5;
  
  return Array.from(patterns.values()).reduce(
    (sum, pattern) =>
      sum + (pattern.quantumState.resonance * pattern.quantumState.coherence),
    0
  ) / patterns.size;
};

const calculateConsciousnessField = (patterns: Map<string, EvolutionPattern>): number => {
  if (patterns.size === 0) return 0.5;

  return Array.from(patterns.values()).reduce(
    (sum, pattern) =>
      sum + (pattern.consciousness.awareness * pattern.consciousness.harmony),
    0
  ) / patterns.size;
};

const calculateNaturalResonance = (patterns: Map<string, EvolutionPattern>): number => {
  if (patterns.size === 0) return 0.5;

  return Array.from(patterns.values()).reduce(
    (sum, pattern) =>
      sum + (pattern.quantumState.resonance * pattern.consciousness.harmony),
    0
  ) / patterns.size;
};