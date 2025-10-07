import { createContext, useContext, useEffect, useReducer } from 'react';
import { useSelfEvolution } from './self-evolving-pattern';
import { useNaturalIntegration } from './natural-integration';

interface QuantumState {
  dimensionalStability: number;
  realityCoherence: number;
  timelineAlignment: number;
  consciousnessSync: number;
}

interface BalanceMetrics {
  quantumEquilibrium: number;
  dimensionalHarmony: number;
  realityStability: number;
  temporalFlow: number;
}

interface BalanceState {
  currentState: QuantumState;
  metrics: BalanceMetrics;
  stabilizationActive: boolean;
  realityShifts: Map<string, number>;
  dimensionalAnchors: Set<string>;
}

type BalanceAction =
  | { type: 'UPDATE_QUANTUM_STATE'; payload: Partial<QuantumState> }
  | { type: 'UPDATE_METRICS'; payload: Partial<BalanceMetrics> }
  | { type: 'TOGGLE_STABILIZATION' }
  | { type: 'ADD_REALITY_SHIFT'; payload: { id: string; magnitude: number } }
  | { type: 'ADD_DIMENSIONAL_ANCHOR'; payload: string }
  | { type: 'REMOVE_DIMENSIONAL_ANCHOR'; payload: string };

const initialState: BalanceState = {
  currentState: {
    dimensionalStability: 1,
    realityCoherence: 1,
    timelineAlignment: 1,
    consciousnessSync: 1
  },
  metrics: {
    quantumEquilibrium: 1,
    dimensionalHarmony: 1,
    realityStability: 1,
    temporalFlow: 1
  },
  stabilizationActive: true,
  realityShifts: new Map(),
  dimensionalAnchors: new Set()
};

const balanceReducer = (state: BalanceState, action: BalanceAction): BalanceState => {
  switch (action.type) {
    case 'UPDATE_QUANTUM_STATE':
      return {
        ...state,
        currentState: {
          ...state.currentState,
          ...action.payload
        }
      };
    case 'UPDATE_METRICS':
      return {
        ...state,
        metrics: {
          ...state.metrics,
          ...action.payload
        }
      };
    case 'TOGGLE_STABILIZATION':
      return {
        ...state,
        stabilizationActive: !state.stabilizationActive
      };
    case 'ADD_REALITY_SHIFT':
      const newShifts = new Map(state.realityShifts);
      newShifts.set(action.payload.id, action.payload.magnitude);
      return {
        ...state,
        realityShifts: newShifts
      };
    case 'ADD_DIMENSIONAL_ANCHOR':
      const newAnchorsAdd = new Set(state.dimensionalAnchors);
      newAnchorsAdd.add(action.payload);
      return {
        ...state,
        dimensionalAnchors: newAnchorsAdd
      };
    case 'REMOVE_DIMENSIONAL_ANCHOR':
      const newAnchorsRemove = new Set(state.dimensionalAnchors);
      newAnchorsRemove.delete(action.payload);
      return {
        ...state,
        dimensionalAnchors: newAnchorsRemove
      };
    default:
      return state;
  }
};

const QuantumBalanceContext = createContext<{
  state: BalanceState;
  updateQuantumState: (updates: Partial<QuantumState>) => void;
  updateMetrics: (updates: Partial<BalanceMetrics>) => void;
  toggleStabilization: () => void;
  addRealityShift: (id: string, magnitude: number) => void;
  addDimensionalAnchor: (id: string) => void;
  removeDimensionalAnchor: (id: string) => void;
} | null>(null);

export const QuantumBalanceProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(balanceReducer, initialState);
  const evolution = useSelfEvolution();
  const naturalIntegration = useNaturalIntegration();

  const updateQuantumState = (updates: Partial<QuantumState>) => {
    dispatch({ type: 'UPDATE_QUANTUM_STATE', payload: updates });
  };

  const updateMetrics = (updates: Partial<BalanceMetrics>) => {
    dispatch({ type: 'UPDATE_METRICS', payload: updates });
  };

  const toggleStabilization = () => {
    dispatch({ type: 'TOGGLE_STABILIZATION' });
  };

  const addRealityShift = (id: string, magnitude: number) => {
    dispatch({ type: 'ADD_REALITY_SHIFT', payload: { id, magnitude } });
  };

  const addDimensionalAnchor = (id: string) => {
    dispatch({ type: 'ADD_DIMENSIONAL_ANCHOR', payload: id });
  };

  const removeDimensionalAnchor = (id: string) => {
    dispatch({ type: 'REMOVE_DIMENSIONAL_ANCHOR', payload: id });
  };

  useEffect(() => {
    if (!state.stabilizationActive) return;

    const stabilizeReality = () => {
      // Calculate quantum state updates based on pattern evolution
      const patternStability = calculatePatternStability(evolution.state.patterns);
      const naturalHarmony = calculateNaturalHarmony(naturalIntegration.state);
      
      // Update quantum state
      updateQuantumState({
        dimensionalStability: calculateDimensionalStability(patternStability, state),
        realityCoherence: calculateRealityCoherence(naturalHarmony, state),
        timelineAlignment: calculateTimelineAlignment(state),
        consciousnessSync: calculateConsciousnessSync(evolution.state, naturalIntegration.state)
      });

      // Update balance metrics
      updateMetrics({
        quantumEquilibrium: calculateQuantumEquilibrium(state),
        dimensionalHarmony: calculateDimensionalHarmony(state),
        realityStability: calculateRealityStability(state),
        temporalFlow: calculateTemporalFlow(state)
      });
    };

    const intervalId = setInterval(stabilizeReality, 1000);
    return () => clearInterval(intervalId);
  }, [state, evolution.state, naturalIntegration.state]);

  return (
    <QuantumBalanceContext.Provider
      value={{
        state,
        updateQuantumState,
        updateMetrics,
        toggleStabilization,
        addRealityShift,
        addDimensionalAnchor,
        removeDimensionalAnchor
      }}
    >
      {children}
    </QuantumBalanceContext.Provider>
  );
};

export const useQuantumBalance = () => {
  const context = useContext(QuantumBalanceContext);
  if (!context) {
    throw new Error('useQuantumBalance must be used within a QuantumBalanceProvider');
  }
  return context;
};

// Utility functions for quantum calculations
const calculatePatternStability = (patterns: Map<string, any>): number => {
  if (patterns.size === 0) return 1;

  return Array.from(patterns.values()).reduce(
    (stability, pattern) =>
      stability * pattern.quantumState.coherence * pattern.quantumState.resonance,
    1
  ) ** (1 / patterns.size);
};

const calculateNaturalHarmony = (naturalState: any): number => {
  return (
    (naturalState.globalHarmony +
      naturalState.elementalResonance +
      naturalState.naturalFlow) / 3
  );
};

const calculateDimensionalStability = (
  patternStability: number,
  state: BalanceState
): number => {
  const anchorEffect = state.dimensionalAnchors.size * 0.1;
  return Math.min(patternStability * (1 + anchorEffect), 1);
};

const calculateRealityCoherence = (
  naturalHarmony: number,
  state: BalanceState
): number => {
  const shiftEffect = Array.from(state.realityShifts.values()).reduce(
    (total, magnitude) => total - magnitude * 0.1,
    1
  );
  return Math.max(naturalHarmony * shiftEffect, 0);
};

const calculateTimelineAlignment = (state: BalanceState): number => {
  return (
    (state.currentState.dimensionalStability +
      state.currentState.realityCoherence) / 2
  );
};

const calculateConsciousnessSync = (
  evolutionState: any,
  naturalState: any
): number => {
  return (
    (evolutionState.consciousnessField +
      naturalState.biodynamicCycle.harmonicResonance) / 2
  );
};

const calculateQuantumEquilibrium = (state: BalanceState): number => {
  return Object.values(state.currentState).reduce((sum, value) => sum + value, 0) / 4;
};

const calculateDimensionalHarmony = (state: BalanceState): number => {
  return (
    state.currentState.dimensionalStability *
    state.currentState.realityCoherence
  ) ** 0.5;
};

const calculateRealityStability = (state: BalanceState): number => {
  return (
    state.currentState.timelineAlignment *
    state.currentState.consciousnessSync
  ) ** 0.5;
};

const calculateTemporalFlow = (state: BalanceState): number => {
  return (
    state.metrics.quantumEquilibrium *
    state.metrics.dimensionalHarmony *
    state.metrics.realityStability
  ) ** (1/3);
};