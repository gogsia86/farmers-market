import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BehaviorContext } from '../lib/quantum/behavior-prediction';
import { UniversalAccessContext } from '../components/adaptation/universal-access';
import { ProgressiveEnhancementContext } from '../components/adaptation/progressive-enhancement';
import { DimensionalAwarenessContext } from '../context/DimensionalAwarenessContext';
import { QuantumContext } from '../context/QuantumContextProvider';

const defaultBehaviorContext = {
  predictBehavior: jest.fn(),
  trackIntent: jest.fn(),
  adaptBehavior: jest.fn(),
  currentIntent: 'IDLE',
  patterns: []
};

const defaultUniversalAccessContext = {
  dimensionalMode: 'PHYSICAL',
  setDimensionalMode: jest.fn(),
  consciousnessLevel: 1,
  setConsciousnessLevel: jest.fn(),
  perceptionFilters: [],
  addPerceptionFilter: jest.fn(),
  removePerceptionFilter: jest.fn(),
  realityMappings: {},
  updateRealityMapping: jest.fn()
};

const defaultProgressiveContext = {
  state: {},
  activateFeature: jest.fn(),
  deactivateFeature: jest.fn(),
  checkFeatureAvailability: jest.fn()
};

const defaultDimensionalContext = {
  dimension: 'PHYSICAL',
  consciousness: 1,
  resonance: 1,
  setDimension: jest.fn(),
  setConsciousness: jest.fn(),
  setResonance: jest.fn()
};

const defaultQuantumContext = {
  state: {
    value: {},
    meta: {
      transcendenceLevel: 1,
      dimension: 'PHYSICAL'
    }
  },
  dispatch: jest.fn()
};

interface AllProvidersProps {
  children: React.ReactNode;
  behaviorContext?: typeof defaultBehaviorContext;
  universalAccessContext?: typeof defaultUniversalAccessContext;
  progressiveContext?: typeof defaultProgressiveContext;
  dimensionalContext?: typeof defaultDimensionalContext;
  quantumContext?: typeof defaultQuantumContext;
}

function AllTheProviders({
  children,
  behaviorContext = defaultBehaviorContext,
  universalAccessContext = defaultUniversalAccessContext,
  progressiveContext = defaultProgressiveContext,
  dimensionalContext = defaultDimensionalContext,
  quantumContext = defaultQuantumContext
}: AllProvidersProps) {
  return (
    <QuantumContext.Provider value={quantumContext}>
      <BehaviorContext.Provider value={behaviorContext}>
        <UniversalAccessContext.Provider value={universalAccessContext}>
          <ProgressiveEnhancementContext.Provider value={progressiveContext}>
            <DimensionalAwarenessContext.Provider value={dimensionalContext}>
              {children}
            </DimensionalAwarenessContext.Provider>
          </ProgressiveEnhancementContext.Provider>
        </UniversalAccessContext.Provider>
      </BehaviorContext.Provider>
    </QuantumContext.Provider>
  );
}

function render(
  ui: React.ReactElement,
  {
    behaviorContext = defaultBehaviorContext,
    universalAccessContext = defaultUniversalAccessContext,
    progressiveContext = defaultProgressiveContext,
    dimensionalContext = defaultDimensionalContext,
    quantumContext = defaultQuantumContext,
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AllTheProviders
        behaviorContext={behaviorContext}
        universalAccessContext={universalAccessContext}
        progressiveContext={progressiveContext}
        dimensionalContext={dimensionalContext}
        quantumContext={quantumContext}
      >
        {children}
      </AllTheProviders>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { render };