import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAdaptation } from './context-adaptation-engine';
import { useProgressiveEnhancement } from './progressive-enhancement';

export interface InteractionPattern {
  id: string;
  name: string;
  consciousnessThreshold: number;
  gestureComplexity: 1 | 2 | 3 | 4 | 5;
  quantumResonance: number;
  neuralFeedback: boolean;
}

interface InteractionState {
  activePatterns: Set<string>;
  gestureEvolutionLevel: number;
  quantumResonance: number;
  neuralFeedbackStrength: number;
  consciousnessMetrics: {
    focus: number;
    awareness: number;
    intention: number;
    resonance: number;
  };
}

type InteractionAction =
  | { type: 'ACTIVATE_PATTERN'; payload: string }
  | { type: 'DEACTIVATE_PATTERN'; payload: string }
  | { type: 'EVOLVE_GESTURES'; payload: number }
  | { type: 'UPDATE_RESONANCE'; payload: number }
  | { type: 'UPDATE_NEURAL_FEEDBACK'; payload: number }
  | { type: 'UPDATE_CONSCIOUSNESS_METRICS'; payload: Partial<InteractionState['consciousnessMetrics']> };

const initialState: InteractionState = {
  activePatterns: new Set(),
  gestureEvolutionLevel: 1,
  quantumResonance: 0.5,
  neuralFeedbackStrength: 0.1,
  consciousnessMetrics: {
    focus: 0,
    awareness: 0,
    intention: 0,
    resonance: 0
  }
};

const consciousnessReducer = (state: InteractionState, action: InteractionAction): InteractionState => {
  switch (action.type) {
    case 'ACTIVATE_PATTERN':
      return {
        ...state,
        activePatterns: new Set([...state.activePatterns, action.payload])
      };
    case 'DEACTIVATE_PATTERN':
      const newPatterns = new Set(state.activePatterns);
      newPatterns.delete(action.payload);
      return {
        ...state,
        activePatterns: newPatterns
      };
    case 'EVOLVE_GESTURES':
      return {
        ...state,
        gestureEvolutionLevel: action.payload
      };
    case 'UPDATE_RESONANCE':
      return {
        ...state,
        quantumResonance: action.payload
      };
    case 'UPDATE_NEURAL_FEEDBACK':
      return {
        ...state,
        neuralFeedbackStrength: action.payload
      };
    case 'UPDATE_CONSCIOUSNESS_METRICS':
      return {
        ...state,
        consciousnessMetrics: {
          ...state.consciousnessMetrics,
          ...action.payload
        }
      };
    default:
      return state;
  }
};

const ConsciousnessInteractionContext = createContext<{
  state: InteractionState;
  activatePattern: (pattern: InteractionPattern) => void;
  deactivatePattern: (patternId: string) => void;
  evolveGestures: (level: number) => void;
  updateMetrics: (metrics: Partial<InteractionState['consciousnessMetrics']>) => void;
} | null>(null);

export const ConsciousnessInteractionProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(consciousnessReducer, initialState);
  const { state: adaptationState } = useAdaptation();
  const { state: enhancementState } = useProgressiveEnhancement();

  const activatePattern = (pattern: InteractionPattern) => {
    if (meetsConsciousnessRequirements(pattern, adaptationState.userState.consciousnessLevel)) {
      dispatch({ type: 'ACTIVATE_PATTERN', payload: pattern.id });
    }
  };

  const deactivatePattern = (patternId: string) => {
    dispatch({ type: 'DEACTIVATE_PATTERN', payload: patternId });
  };

  const evolveGestures = (level: number) => {
    dispatch({ type: 'EVOLVE_GESTURES', payload: level });
  };

  const updateMetrics = (metrics: Partial<InteractionState['consciousnessMetrics']>) => {
    dispatch({ type: 'UPDATE_CONSCIOUSNESS_METRICS', payload: metrics });
  };

  useEffect(() => {
    // Monitor and update consciousness metrics
    const updateConsciousness = () => {
      const metrics = calculateConsciousnessMetrics(
        adaptationState.userState,
        enhancementState.quantumCoherence
      );
      updateMetrics(metrics);
    };

    const intervalId = setInterval(updateConsciousness, 1000);
    return () => clearInterval(intervalId);
  }, [adaptationState.userState, enhancementState.quantumCoherence]);

  useEffect(() => {
    // Update quantum resonance based on consciousness metrics
    dispatch({
      type: 'UPDATE_RESONANCE',
      payload: calculateQuantumResonance(state.consciousnessMetrics)
    });
  }, [state.consciousnessMetrics]);

  return (
    <ConsciousnessInteractionContext.Provider
      value={{
        state,
        activatePattern,
        deactivatePattern,
        evolveGestures,
        updateMetrics
      }}
    >
      {children}
    </ConsciousnessInteractionContext.Provider>
  );
};

export const useConsciousnessInteraction = () => {
  const context = useContext(ConsciousnessInteractionContext);
  if (!context) {
    throw new Error(
      'useConsciousnessInteraction must be used within a ConsciousnessInteractionProvider'
    );
  }
  return context;
};

// Utility functions
const meetsConsciousnessRequirements = (
  pattern: InteractionPattern,
  currentLevel: number
): boolean => {
  return currentLevel >= pattern.consciousnessThreshold;
};

const calculateConsciousnessMetrics = (
  userState: any,
  quantumCoherence: number
): Partial<InteractionState['consciousnessMetrics']> => {
  return {
    focus: userState.consciousnessLevel / 10,
    awareness: Math.min(userState.consciousnessLevel * 0.15, 1),
    intention: userState.quantumState === 'elevated' ? 0.8 : 0.4,
    resonance: quantumCoherence
  };
};

const calculateQuantumResonance = (
  metrics: InteractionState['consciousnessMetrics']
): number => {
  return (
    (metrics.focus + metrics.awareness + metrics.intention + metrics.resonance) / 4
  );
};