import React from 'react';
import { render, renderHook } from '@testing-library/react';
import { QuantumContextProvider, useQuantumContextProvider } from './QuantumContextProvider';

// Mock the quantum context sensing hook
jest.mock('../hooks/useQuantumContextSensing', () => ({
  useQuantumContextSensing: () => ({
    quantumContext: {
      entropy: 0.3,
      coherence: 0.9,
      dimensionalShift: 0.2,
      temporalStability: 0.95,
      resonanceField: [0.9, 0.8],
    },
  }),
}));

describe('QuantumContextProvider', () => {
  const TestComponent = () => {
    const context = useQuantumContextProvider();
    return (
      <div data-testid="test-component">
        Entropy: {context.currentContext.entropy}
      </div>
    );
  };

  it('should provide quantum context to children', () => {
    const { getByTestId } = render(
      <QuantumContextProvider>
        <TestComponent />
      </QuantumContextProvider>
    );

    expect(getByTestId('test-component')).toHaveTextContent('Entropy: 0.3');
  });

  it('should throw error when hook is used outside provider', () => {
    const consoleError = console.error;
    console.error = jest.fn(); // Suppress React error logging

    expect(() => {
      renderHook(() => useQuantumContextProvider());
    }).toThrow('useQuantumContextProvider must be used within a QuantumContextProvider');

    console.error = consoleError;
  });

  it('should accept custom observer config', () => {
    const observerConfig: Parameters<typeof QuantumContextProvider>[0]['observerConfig'] = {
      maxObservations: 50,
      significanceThreshold: 0.4,
    };

    const { getByTestId } = render(
      <QuantumContextProvider observerConfig={observerConfig}>
        <TestComponent />
      </QuantumContextProvider>
    );

    expect(getByTestId('test-component')).toBeTruthy();
  });

  it('should accept custom sensor config', () => {
    const sensorConfig = {
      sensitivity: 0.9,
      frequency: 50,
    };

    const { getByTestId } = render(
      <QuantumContextProvider sensorConfig={sensorConfig}>
        <TestComponent />
      </QuantumContextProvider>
    );

    expect(getByTestId('test-component')).toBeTruthy();
  });
});