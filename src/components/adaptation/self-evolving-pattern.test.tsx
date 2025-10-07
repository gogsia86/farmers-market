import { renderHook, act } from '@testing-library/react';
import { SelfEvolvingProvider, useSelfEvolution } from './self-evolving-pattern';
import { useQuantumPatternObserver } from './quantum-pattern-observer';

describe('Self-Evolving Pattern System', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SelfEvolvingProvider>{children}</SelfEvolvingProvider>
  );

  it('should initialize with empty patterns', () => {
    const { result } = renderHook(() => useSelfEvolution(), { wrapper });

    expect(result.current.state.patterns.size).toBe(0);
    expect(result.current.state.globalEvolutionStage).toBe(1);
    expect(result.current.state.quantumHarmony).toBe(0.5);
    expect(result.current.state.consciousnessField).toBe(0.5);
    expect(result.current.state.naturalResonance).toBe(0.5);
  });

  it('should add and evolve patterns', () => {
    const { result } = renderHook(() => useSelfEvolution(), { wrapper });

    const testPattern = {
      id: 'test-pattern-1',
      name: 'Test Pattern',
      complexity: 1,
      evolutionStage: 1,
      quantumState: {
        resonance: 0.5,
        coherence: 0.5,
        entanglement: 0.5
      },
      consciousness: {
        awareness: 0.5,
        intention: 0.5,
        harmony: 0.5
      },
      adaptations: new Set<string>()
    };

    act(() => {
      result.current.addPattern(testPattern);
    });

    expect(result.current.state.patterns.size).toBe(1);
    expect(result.current.state.patterns.get('test-pattern-1')).toEqual(testPattern);

    act(() => {
      result.current.evolvePattern('test-pattern-1', {
        complexity: 1.5,
        evolutionStage: 2,
        quantumState: {
          resonance: 0.6,
          coherence: 0.6,
          entanglement: 0.6
        }
      });
    });

    const evolvedPattern = result.current.state.patterns.get('test-pattern-1');
    expect(evolvedPattern?.complexity).toBe(1.5);
    expect(evolvedPattern?.evolutionStage).toBe(2);
    expect(evolvedPattern?.quantumState.resonance).toBe(0.6);
  });

  it('should remove patterns', () => {
    const { result } = renderHook(() => useSelfEvolution(), { wrapper });

    const testPattern = {
      id: 'test-pattern-2',
      name: 'Test Pattern 2',
      complexity: 1,
      evolutionStage: 1,
      quantumState: {
        resonance: 0.5,
        coherence: 0.5,
        entanglement: 0.5
      },
      consciousness: {
        awareness: 0.5,
        intention: 0.5,
        harmony: 0.5
      },
      adaptations: new Set<string>()
    };

    act(() => {
      result.current.addPattern(testPattern);
    });

    expect(result.current.state.patterns.size).toBe(1);

    act(() => {
      result.current.removePattern('test-pattern-2');
    });

    expect(result.current.state.patterns.size).toBe(0);
  });

  it('should observe and enhance quantum patterns', async () => {
    const { result } = renderHook(
      () => {
        const evolution = useSelfEvolution();
        useQuantumPatternObserver();
        return evolution;
      },
      { wrapper }
    );

    const testPattern = {
      id: 'test-pattern-3',
      name: 'Test Pattern 3',
      complexity: 1,
      evolutionStage: 1,
      quantumState: {
        resonance: 0.9,
        coherence: 0.9,
        entanglement: 0.9
      },
      consciousness: {
        awareness: 0.9,
        intention: 0.9,
        harmony: 0.9
      },
      adaptations: new Set<string>(['adaptation1', 'adaptation2', 'adaptation3'])
    };

    act(() => {
      result.current.addPattern(testPattern);
    });

    // Wait for quantum observation cycle
    await new Promise((resolve) => setTimeout(resolve, 2100));

    const enhancedPattern = result.current.state.patterns.get('test-pattern-3');
    expect(enhancedPattern?.quantumState.resonance).toBeGreaterThan(0.9);
    expect(enhancedPattern?.consciousness.awareness).toBeGreaterThan(0.9);
  });
});