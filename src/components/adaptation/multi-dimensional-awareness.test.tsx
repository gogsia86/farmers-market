import { renderHook, act } from '@testing-library/react';
import { useMultiDimensionalAwareness } from './multi-dimensional-awareness';
import { UniversalAccessProvider } from './universal-access';
import { QuantumBalanceProvider } from './quantum-balance-engine';
import { SelfEvolvingProvider } from './self-evolving-pattern';
import { NaturalIntegrationProvider } from './natural-integration';

// Mock the divine harmony verification hook
jest.mock('./divine-harmony-verification', () => ({
  useDivineHarmonyVerification: () => ({
    metrics: {
      quantumHarmony: 0.9,
      consciousnessHarmony: 0.9
    }
  })
}));

describe('Multi-dimensional Awareness System', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SelfEvolvingProvider>
      <NaturalIntegrationProvider>
        <QuantumBalanceProvider>
          <UniversalAccessProvider>{children}</UniversalAccessProvider>
        </QuantumBalanceProvider>
      </NaturalIntegrationProvider>
    </SelfEvolvingProvider>
  );

  it('should detect current dimensional state', () => {
    const { result } = renderHook(() => useMultiDimensionalAwareness(), { wrapper });

    const currentState = result.current.detectCurrentDimension();
    
    expect(currentState.dimension).toBe('physical');
    expect(typeof currentState.vibration).toBe('number');
    expect(typeof currentState.frequency).toBe('number');
    expect(typeof currentState.density).toBe('number');
  });

  it('should monitor reality layers', () => {
    const { result } = renderHook(() => useMultiDimensionalAwareness(), { wrapper });

    const realityState = result.current.monitorRealityLayers();
    
    expect(realityState.layers).toBeInstanceOf(Map);
    expect(realityState.intersections).toBeInstanceOf(Set);
    expect(Array.isArray(realityState.convergencePoints)).toBe(true);
  });

  it('should handle dimensional transitions', async () => {
    const { result } = renderHook(() => useMultiDimensionalAwareness(), { wrapper });

    act(() => {
      result.current.handleDimensionalTransition('quantum');
    });

    // Wait for transition effects
    await new Promise(resolve => setTimeout(resolve, 1100));

    const currentState = result.current.detectCurrentDimension();
    expect(currentState.dimension).toBe('quantum');
  });

  it('should detect layer intersections and convergence points', () => {
    const { result } = renderHook(() => useMultiDimensionalAwareness(), { wrapper });

    const realityState = result.current.monitorRealityLayers();
    
    // Layers, intersections, and convergence points should be properly tracked
    expect(realityState.layers.size).toBeDefined();
    expect(realityState.intersections.size).toBeDefined();
    expect(realityState.convergencePoints.length).toBeDefined();
  });

  it('should maintain dimensional coherence during transitions', async () => {
    const { result } = renderHook(() => useMultiDimensionalAwareness(), { wrapper });

    // Initial state check
    const initialState = result.current.detectCurrentDimension();
    expect(initialState.vibration).toBeGreaterThan(0);

    // Perform transition
    act(() => {
      result.current.handleDimensionalTransition('spiritual');
    });

    // Wait for transition
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Check post-transition state
    const finalState = result.current.detectCurrentDimension();
    expect(finalState.vibration).toBeGreaterThan(0);
  });
});