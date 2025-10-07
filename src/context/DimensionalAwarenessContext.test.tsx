import React from 'react';
import { render } from '@testing-library/react';
import { DimensionalAwarenessProvider, useDimensionalAwareness } from './DimensionalAwarenessContext';
import { QuantumStateManager } from '../lib/quantumStateManager';

// Mock the useMultiDimensionalRender hook
jest.mock('../hooks/useMultiDimensionalRender', () => ({
  useMultiDimensionalRender: () => ({
    dimensionalState: {
      physical: true,
      quantum: false,
      spiritual: false,
      temporalAlignment: 1.0,
      resonanceFrequency: 432,
    },
    optimizeRenderingPlane: (content: React.ReactNode) => content,
  }),
}));

describe('DimensionalAwarenessContext', () => {
  const TestComponent: React.FC = () => {
    const quantumState = useDimensionalAwareness();
    return <div data-testid="test">Coherence: {quantumState.getCoherenceLevel()}</div>;
  };

  it('should provide quantum state context to children', () => {
    const { getByTestId } = render(
      <DimensionalAwarenessProvider>
        <TestComponent />
      </DimensionalAwarenessProvider>
    );

    expect(getByTestId('test')).toHaveTextContent('Coherence: 1');
  });

  it('should initialize with custom quantum state', () => {
    const initialState = {
      coherenceLevel: 0.5,
    };

    const { getByTestId } = render(
      <DimensionalAwarenessProvider initialQuantumState={initialState}>
        <TestComponent />
      </DimensionalAwarenessProvider>
    );

    expect(getByTestId('test')).toHaveTextContent('Coherence: 0.5');
  });

  it('should throw error when used outside provider', () => {
    const consoleError = console.error;
    console.error = jest.fn(); // Suppress React error logging

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useDimensionalAwareness must be used within a DimensionalAwarenessProvider');

    console.error = consoleError;
  });
});