import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { AdaptationProvider } from '../components/adaptation/context-adaptation-engine';
import { BehaviorContext } from '../lib/quantum/behavior-prediction';
import { UniversalAccessProvider } from '../components/adaptation/universal-access';
import { ProgressiveEnhancementProvider } from '../components/adaptation/progressive-enhancement';
import { DimensionalAwarenessProvider } from '../context/DimensionalAwarenessContext';
import { QuantumContextProvider } from '../context/QuantumContextProvider';

interface AllProvidersProps {
  children: React.ReactNode;
}

export function AllTheProviders({ children }: AllProvidersProps) {
  const behaviorValue = {
    trackBehavior: jest.fn(),
    predictNextBehavior: jest.fn(),
    getPatterns: jest.fn(),
    subscribeToPatterns: jest.fn()
  };

  return (
    <AdaptationProvider>
      <QuantumContextProvider>
        <BehaviorContext.Provider value={behaviorValue}>
          <UniversalAccessProvider>
            <ProgressiveEnhancementProvider>
              <DimensionalAwarenessProvider>
                {children}
              </DimensionalAwarenessProvider>
            </ProgressiveEnhancementProvider>
          </UniversalAccessProvider>
        </BehaviorContext.Provider>
      </QuantumContextProvider>
    </AdaptationProvider>
  );
}

function customRender(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, { wrapper: AllTheProviders, ...options });
}

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };