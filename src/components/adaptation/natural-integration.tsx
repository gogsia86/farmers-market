import { createContext, useContext, useEffect, useReducer } from 'react';
import { useSelfEvolution, type EvolutionPattern } from './self-evolving-pattern';
import { useBiodynamicTiming } from '../../hooks/useBiodynamicTiming';

interface NaturalElement {
  id: string;
  type: 'earth' | 'water' | 'air' | 'fire' | 'aether';
  strength: number;
  harmony: number;
  influence: number;
  cyclePhase: number;
}

interface BiodynamicCycle {
  moonPhase: number;
  seasonalPosition: number;
  elementalBalance: Record<NaturalElement['type'], number>;
  harmonicResonance: number;
}

interface NaturalState {
  elements: Map<string, NaturalElement>;
  biodynamicCycle: BiodynamicCycle;
  globalHarmony: number;
  elementalResonance: number;
  naturalFlow: number;
}

type NaturalAction =
  | { type: 'UPDATE_ELEMENT'; payload: { elementId: string; updates: Partial<NaturalElement> } }
  | { type: 'UPDATE_BIODYNAMIC_CYCLE'; payload: Partial<BiodynamicCycle> }
  | { type: 'UPDATE_GLOBAL_HARMONY'; payload: number }
  | { type: 'UPDATE_ELEMENTAL_RESONANCE'; payload: number }
  | { type: 'UPDATE_NATURAL_FLOW'; payload: number };

const initialState: NaturalState = {
  elements: new Map(),
  biodynamicCycle: {
    moonPhase: 0,
    seasonalPosition: 0,
    elementalBalance: {
      earth: 0.5,
      water: 0.5,
      air: 0.5,
      fire: 0.5,
      aether: 0.5
    },
    harmonicResonance: 0.5
  },
  globalHarmony: 0.5,
  elementalResonance: 0.5,
  naturalFlow: 0.5
};

const naturalReducer = (state: NaturalState, action: NaturalAction): NaturalState => {
  switch (action.type) {
    case 'UPDATE_ELEMENT': {
      const { elementId, updates } = action.payload;
      const element = state.elements.get(elementId);
      if (!element) return state;

      const updatedElements = new Map(state.elements);
      updatedElements.set(elementId, { ...element, ...updates });

      return {
        ...state,
        elements: updatedElements
      };
    }
    case 'UPDATE_BIODYNAMIC_CYCLE':
      return {
        ...state,
        biodynamicCycle: {
          ...state.biodynamicCycle,
          ...action.payload
        }
      };
    case 'UPDATE_GLOBAL_HARMONY':
      return {
        ...state,
        globalHarmony: action.payload
      };
    case 'UPDATE_ELEMENTAL_RESONANCE':
      return {
        ...state,
        elementalResonance: action.payload
      };
    case 'UPDATE_NATURAL_FLOW':
      return {
        ...state,
        naturalFlow: action.payload
      };
    default:
      return state;
  }
};

const NaturalIntegrationContext = createContext<{
  state: NaturalState;
  updateElement: (elementId: string, updates: Partial<NaturalElement>) => void;
  updateBiodynamicCycle: (updates: Partial<BiodynamicCycle>) => void;
} | null>(null);

export const NaturalIntegrationProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(naturalReducer, initialState);
  const { state: evolutionState } = useSelfEvolution();
  const biodynamicTiming = useBiodynamicTiming();
  const moonPhaseValue = biodynamicTiming.currentCycle.celestial === 'FULL' ? 1 :
                        biodynamicTiming.currentCycle.celestial === 'WAXING' ? 0.75 :
                        biodynamicTiming.currentCycle.celestial === 'NEW' ? 0 : 0.25;
  const seasonalValue = biodynamicTiming.currentCycle.seasonal === 'SUMMER' ? 1 :
                       biodynamicTiming.currentCycle.seasonal === 'SPRING' ? 0.75 :
                       biodynamicTiming.currentCycle.seasonal === 'AUTUMN' ? 0.25 : 0;

  const updateElement = (elementId: string, updates: Partial<NaturalElement>) => {
    dispatch({ type: 'UPDATE_ELEMENT', payload: { elementId, updates } });
  };

  const updateBiodynamicCycle = (updates: Partial<BiodynamicCycle>) => {
    dispatch({ type: 'UPDATE_BIODYNAMIC_CYCLE', payload: updates });
  };

  useEffect(() => {
    // Synchronize with biodynamic cycles
    updateBiodynamicCycle({
      moonPhase: moonPhaseValue,
      seasonalPosition: seasonalValue,
      harmonicResonance: calculateHarmonicResonance(state.elements, evolutionState.patterns)
    });
  }, [moonPhaseValue, seasonalValue, state.elements, evolutionState.patterns]);

  useEffect(() => {
    // Update global metrics based on elemental and pattern harmony
    const harmony = calculateGlobalHarmony(state.elements, evolutionState.patterns);
    const resonance = calculateElementalResonance(state.elements);
    const flow = calculateNaturalFlow(state.biodynamicCycle, state.elements);

    dispatch({ type: 'UPDATE_GLOBAL_HARMONY', payload: harmony });
    dispatch({ type: 'UPDATE_ELEMENTAL_RESONANCE', payload: resonance });
    dispatch({ type: 'UPDATE_NATURAL_FLOW', payload: flow });
  }, [state.elements, state.biodynamicCycle, evolutionState.patterns]);

  return (
    <NaturalIntegrationContext.Provider
      value={{ state, updateElement, updateBiodynamicCycle }}
    >
      {children}
    </NaturalIntegrationContext.Provider>
  );
};

export const useNaturalIntegration = () => {
  const context = useContext(NaturalIntegrationContext);
  if (!context) {
    throw new Error('useNaturalIntegration must be used within a NaturalIntegrationProvider');
  }
  return context;
};

// Utility functions
const calculateHarmonicResonance = (
  elements: Map<string, NaturalElement>,
  patterns: Map<string, EvolutionPattern>
): number => {
  if (elements.size === 0 || patterns.size === 0) return 0.5;

  const elementalHarmony = Array.from(elements.values()).reduce(
    (sum, element) => sum + element.harmony,
    0
  ) / elements.size;

  const patternResonance = Array.from(patterns.values()).reduce(
    (sum, pattern) => sum + pattern.quantumState.resonance,
    0
  ) / patterns.size;

  return (elementalHarmony + patternResonance) / 2;
};

const calculateGlobalHarmony = (
  elements: Map<string, NaturalElement>,
  patterns: Map<string, EvolutionPattern>
): number => {
  if (elements.size === 0) return 0.5;

  const elementalBalance = Array.from(elements.values()).reduce(
    (sum, element) => sum + (element.harmony * element.influence),
    0
  ) / elements.size;

  const patternHarmony = Array.from(patterns.values()).reduce(
    (sum, pattern) =>
      sum + (pattern.quantumState.coherence * pattern.consciousness.harmony),
    0
  ) / patterns.size;

  return (elementalBalance + patternHarmony) / 2;
};

const calculateElementalResonance = (elements: Map<string, NaturalElement>): number => {
  if (elements.size === 0) return 0.5;

  return Array.from(elements.values()).reduce(
    (sum, element) => sum + (element.strength * element.harmony),
    0
  ) / elements.size;
};

const calculateNaturalFlow = (
  cycle: BiodynamicCycle,
  elements: Map<string, NaturalElement>
): number => {
  if (elements.size === 0) return 0.5;

  const cycleInfluence = (cycle.moonPhase + cycle.seasonalPosition) / 2;
  const elementalFlow = Array.from(elements.values()).reduce(
    (sum, element) => sum + element.cyclePhase,
    0
  ) / elements.size;

  return (cycleInfluence + elementalFlow) / 2;
};