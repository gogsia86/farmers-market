import React, { ReactNode, useState } from 'react';
import { AdaptationContext } from '../components/adaptation/context-adaptation-engine';
import { AdaptationState, AdaptationRule } from '../types/adaptation';

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

export const MockAdaptationProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AdaptationState>(initialState);

  return (
    <AdaptationContext.Provider
      value={{
        state,
        applyAdaptation: (rule: AdaptationRule) => {
          if (rule.condition({ ...state })) {
            rule.apply({ ...state });
          }
        },
        removeAdaptation: () => {},
        dispatch: (action: any) => {
          if (action.type === 'UPDATE_USER_STATE') {
            setState(prev => ({
              ...prev,
              userState: {
                ...prev.userState,
                ...action.payload
              }
            }));
          } else if (action.type === 'UPDATE_CONTEXT') {
            setState(prev => ({
              ...prev,
              environmentalContext: {
                ...prev.environmentalContext,
                ...action.payload
              }
            }));
          }
        }
      }}
    >
      {children}
    </AdaptationContext.Provider>
  );
};