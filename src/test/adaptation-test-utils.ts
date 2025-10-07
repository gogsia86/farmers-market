import { UserState, EnvironmentalContext } from '../types/adaptation';
import { useAdaptation, AdaptationContext } from '../components/adaptation/context-adaptation-engine';
import { renderHook } from '@testing-library/react';
import { act } from '@testing-library/react';
import React, { ReactNode } from 'react';

export const createTestHelper = () => {
  let result: ReturnType<typeof renderHook>['result'] | null = null;

  const TestHelper = {
    setup: () => {
      const hookResult = renderHook(() => useAdaptation(), {
        wrapper: ({ children }) => (
          <AdaptationContext.Provider value={{
            state: {
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
            },
            applyAdaptation: () => {},
            removeAdaptation: () => {},
            dispatch: () => {}
          }}>
            {children}
          </AdaptationContext.Provider>
        )
      });
      result = hookResult.result;
    },
    updateState: (updates: Partial<{
      userState: Partial<UserState>;
      environmentalContext: Partial<EnvironmentalContext>;
    }>) => {
      if (!result) {
        throw new Error('TestHelper not set up. Call setup() first.');
      }
      
      act(() => {
        if (updates.userState) {
          result.current.state.userState = {
            ...result.current.state.userState,
            ...updates.userState
          };
        }
        if (updates.environmentalContext) {
          result.current.state.environmentalContext = {
            ...result.current.state.environmentalContext,
            ...updates.environmentalContext
          };
        }
      });
    }
  };

  return TestHelper;
};