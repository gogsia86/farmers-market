import { createContext, useContext, useEffect, useReducer } from 'react';
import { useQuantumBehavior } from '../../hooks/useQuantumBehavior';
import { EnvironmentalContext, UserState, AdaptationRule } from '../../types/adaptation';

interface AdaptationState {
  environmentalContext: EnvironmentalContext;
  userState: UserState;
  activeAdaptations: Set<string>;
  quantumAlignment: number;
}

interface AdaptationAction {
  type: 'UPDATE_CONTEXT' | 'UPDATE_USER_STATE' | 'APPLY_ADAPTATION' | 'REMOVE_ADAPTATION';
  payload: any;
}

const initialState: AdaptationState = {
  environmentalContext: {
    timeOfDay: null,
    season: null,
    deviceCapabilities: {},
    networkConditions: 'unknown'
  },
  userState: {
    consciousnessLevel: 0,
    interactionPatterns: new Set(),
    preferences: {},
    quantumState: 'neutral'
  },
  activeAdaptations: new Set(),
  quantumAlignment: 1.0
};

const adaptationReducer = (state: AdaptationState, action: AdaptationAction): AdaptationState => {
  switch (action.type) {
    case 'UPDATE_CONTEXT':
      return {
        ...state,
        environmentalContext: {
          ...state.environmentalContext,
          ...action.payload
        }
      };
    case 'UPDATE_USER_STATE':
      return {
        ...state,
        userState: {
          ...state.userState,
          ...action.payload
        }
      };
    case 'APPLY_ADAPTATION':
      return {
        ...state,
        activeAdaptations: new Set([...state.activeAdaptations, action.payload])
      };
    case 'REMOVE_ADAPTATION':
      const newAdaptations = new Set(state.activeAdaptations);
      newAdaptations.delete(action.payload);
      return {
        ...state,
        activeAdaptations: newAdaptations
      };
    default:
      return state;
  }
};

export const AdaptationContext = createContext<{
  state: AdaptationState;
  applyAdaptation: (rule: AdaptationRule) => void;
  removeAdaptation: (ruleId: string) => void;
  dispatch: (action: AdaptationAction) => void;
} | null>(null);

export const AdaptationProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(adaptationReducer, initialState);
  const { predictedBehavior } = useQuantumBehavior();

  const applyAdaptation = (rule: AdaptationRule) => {
    if (rule.condition(state)) {
      dispatch({ type: 'APPLY_ADAPTATION', payload: rule.id });
      rule.apply(state);
    }
  };

  const removeAdaptation = (ruleId: string) => {
    dispatch({ type: 'REMOVE_ADAPTATION', payload: ruleId });
  };

  useEffect(() => {
    // Monitor and update environmental context
    const updateEnvironment = () => {
      dispatch({
        type: 'UPDATE_CONTEXT',
        payload: {
          timeOfDay: new Date().getHours(),
          deviceCapabilities: {
            memory: (navigator as any).deviceMemory,
            connection: (navigator as any).connection?.type,
            prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
          }
        }
      });
    };

    updateEnvironment();
    window.addEventListener('resize', updateEnvironment);
    
    return () => window.removeEventListener('resize', updateEnvironment);
  }, []);

  useEffect(() => {
    // Update user state based on predicted behavior
    if (predictedBehavior) {
      dispatch({
        type: 'UPDATE_USER_STATE',
        payload: {
          interactionPatterns: new Set([...state.userState.interactionPatterns, predictedBehavior.pattern]),
          quantumState: predictedBehavior.quantumState
        }
      });
    }
  }, [predictedBehavior]);

  return (
    <AdaptationContext.Provider value={{ state, applyAdaptation, removeAdaptation, dispatch }}>
      {children}
    </AdaptationContext.Provider>
  );
};

export const useAdaptation = () => {
  const context = useContext(AdaptationContext);
  if (!context) {
    throw new Error('useAdaptation must be used within an AdaptationProvider');
  }
  return context;
};