import React, { ReactNode, useEffect } from 'react';
import { AdaptationContext } from '../components/adaptation/context-adaptation-engine';
import { BehaviorContext, BehaviorPattern, IntentType } from '../lib/quantum/behavior-prediction';
import type { AdaptationRule, EnvironmentalContext, UserState } from '../types/adaptation';

// Create a more sophisticated mock that can handle the behavior tracking needs
const createMockBehaviorValue = () => {
  let patterns: BehaviorPattern[] = [];
  let subscribers: ((patterns: BehaviorPattern[]) => void)[] = [];

  return {
    trackBehavior: jest.fn(),
    predictNextBehavior: jest.fn(),
    getPatterns: jest.fn().mockImplementation(() => patterns),
    subscribeToPatterns: jest.fn().mockImplementation((callback: (patterns: BehaviorPattern[]) => void) => {
      subscribers.push(callback);
      return () => {
        subscribers = subscribers.filter(cb => cb !== callback);
      };
    }),
    _setPatterns: (newPatterns: BehaviorPattern[]) => {
      patterns = newPatterns;
      subscribers.forEach(cb => cb(patterns));
    }
  };
};

// Export the mock for use in tests
export const mockBehaviorValue = createMockBehaviorValue();

// Default pattern for testing
const defaultPattern: BehaviorPattern = {
  events: [],
  frequency: 1,
  confidence: 1,
  intent: 'REST' as IntentType,
  consciousness: 0
};

// Create mock for AdaptationContext
interface AdaptationState {
  environmentalContext: EnvironmentalContext;
  userState: UserState;
  activeAdaptations: Set<string>;
  quantumAlignment: number;
}

const createMockAdaptationState = (): AdaptationState => ({
  environmentalContext: {
    timeOfDay: null,
    season: null,
    deviceCapabilities: {
      memory: undefined,
      connection: undefined,
      prefersDarkMode: false
    },
    networkConditions: 'unknown' as const
  },
  userState: {
    consciousnessLevel: 0,
    interactionPatterns: new Set<string>(),
    preferences: {},
    quantumState: 'neutral' as const
  },
  activeAdaptations: new Set<string>(),
  quantumAlignment: 1.0
});

export function TestProviders({ children }: { children: ReactNode }) {
  const [state, setAdaptationState] = React.useState(createMockAdaptationState());
  const rulesMapRef = React.useRef<Map<string, AdaptationRule>>(new Map());
  const initializedRef = React.useRef(false);

  // Initialize mock patterns
  useEffect(() => {
    mockBehaviorValue._setPatterns([defaultPattern]);
    return () => mockBehaviorValue._setPatterns([]);
  }, []);

  const applyRule = React.useCallback((rule: AdaptationRule, newState: AdaptationState = state) => {
    if (rule.condition(newState)) {
      console.log(`Applying rule ${rule.id}`);
      rule.apply(newState);
    }
  }, [state]);

  const applyAdaptation = React.useCallback((rule: AdaptationRule) => {
    rulesMapRef.current.set(rule.id, rule);
    applyRule(rule);
    setAdaptationState(prev => ({
      ...prev,
      activeAdaptations: new Set([...prev.activeAdaptations, rule.id])
    }));
  }, [applyRule]);

  const removeAdaptation = React.useCallback((ruleId: string) => {
    rulesMapRef.current.delete(ruleId);
    setAdaptationState(prev => {
      const newAdaptations = new Set(prev.activeAdaptations);
      newAdaptations.delete(ruleId);
      return { ...prev, activeAdaptations: newAdaptations };
    });

    // Reset adaptations
    document.documentElement.classList.remove(
      'dark-adaptation',
      'enhanced-interactions',
      'low-density',
      'elevated-consciousness'
    );
    document.documentElement.style.setProperty('--quantum-layout-shift', '0');
  }, []);

  // Re-run all rules when state changes
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    rulesMapRef.current.forEach(rule => {
      applyRule(rule);
    });
  }, [state, applyRule]);

  const dispatch = React.useCallback((action: { type: string; payload: any }) => {
    switch (action.type) {
      case 'UPDATE_CONTEXT':
        setAdaptationState(prev => {
          const newState = {
            ...prev,
            environmentalContext: {
              ...prev.environmentalContext,
              ...action.payload
            }
          };
          return newState;
        });
        break;
      case 'UPDATE_USER_STATE':
        setAdaptationState(prev => {
          const newState = {
            ...prev,
            userState: {
              ...prev.userState,
              ...action.payload
            }
          };
          return newState;
        });
        break;
    }
  }, []);

  const contextValue = React.useMemo(() => ({
    state,
    applyAdaptation,
    removeAdaptation,
    dispatch
  }), [state, applyAdaptation, removeAdaptation, dispatch]);

  return (
    <BehaviorContext.Provider value={mockBehaviorValue}>
      <AdaptationContext.Provider value={contextValue}>
        {children}
      </AdaptationContext.Provider>
    </BehaviorContext.Provider>
  );
}