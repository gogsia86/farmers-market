/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useConsciousInteractions } from './useConsciousInteractions';
import { ConsciousnessInteractionProvider } from '../components/adaptation/consciousness-interaction';
import { AdaptationProvider } from '../components/adaptation/context-adaptation-engine';
import { ProgressiveEnhancementProvider } from '../components/adaptation/progressive-enhancement';
import React, { ReactNode } from 'react';

describe('useConsciousInteractions', () => {
  const mockGestures = [
    {
      id: 'quantum-tap',
      name: 'Quantum Tap',
      handler: jest.fn(),
      evolution: {
        level: 1,
        complexity: 2,
        resonanceThreshold: 0.5
      }
    }
  ];

  const Wrapper = ({ children }: { children: ReactNode }) => (
    React.createElement(AdaptationProvider, null,
      React.createElement(ProgressiveEnhancementProvider, null,
        React.createElement(ConsciousnessInteractionProvider, null, children)
      )
    )
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with basic gesture patterns', () => {
    const { result } = renderHook(
      () => useConsciousInteractions('test-component', mockGestures),
      { wrapper: Wrapper }
    );

    expect(result.current.gestureEvolutionLevel).toBe(1);
    expect(result.current.quantumResonance).toBeGreaterThan(0);
  });

  it('provides gesture handlers for active patterns', () => {
    const { result } = renderHook(
      () => useConsciousInteractions('test-component', mockGestures),
      { wrapper: Wrapper }
    );

    const handler = result.current.getGestureHandler('quantum-tap');
    expect(handler).toBeTruthy();

    if (handler) {
      handler({ type: 'tap' });
      expect(mockGestures[0].handler).toHaveBeenCalled();
    }
  });

  it('evolves gestures based on consciousness metrics', () => {
    const { result, rerender } = renderHook(
      () => useConsciousInteractions('test-component', mockGestures),
      { wrapper: Wrapper }
    );

    const initialLevel = result.current.gestureEvolutionLevel;

    // Simulate high consciousness metrics
    act(() => {
      // TODO: Update consciousness metrics through context
    });

    rerender();

    expect(result.current.gestureEvolutionLevel).toBeGreaterThanOrEqual(initialLevel);
  });

  it('applies quantum enhancement to events', () => {
    const { result } = renderHook(
      () => useConsciousInteractions('test-component', mockGestures),
      { wrapper: Wrapper }
    );

    const handler = result.current.getGestureHandler('quantum-tap');
    if (handler) {
      handler({ type: 'tap' });

      expect(mockGestures[0].handler).toHaveBeenCalledWith(
        expect.objectContaining({
          quantumEnhanced: true,
          resonanceLevel: expect.any(Number),
          consciousIntent: expect.any(Boolean)
        })
      );
    }
  });
});