import { renderHook, act } from '@testing-library/react';
import { NaturalIntegrationProvider, useNaturalIntegration } from './natural-integration';
import { SelfEvolvingProvider } from './self-evolving-pattern';

// Mock the useBiodynamicTiming hook
jest.mock('../../hooks/useBiodynamicTiming', () => ({
  useBiodynamicTiming: () => ({
    currentCycle: {
      celestial: 'FULL',
      seasonal: 'SUMMER',
      diurnal: 'ZENITH',
      activity: 'GROWING',
      energyLevel: 0.8,
      harmonyIndex: 0.9
    }
  })
}));

describe('Natural Integration System', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SelfEvolvingProvider>
      <NaturalIntegrationProvider>{children}</NaturalIntegrationProvider>
    </SelfEvolvingProvider>
  );

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useNaturalIntegration(), { wrapper });

    expect(result.current.state.elements.size).toBe(0);
    expect(result.current.state.biodynamicCycle.harmonicResonance).toBe(0.5);
    expect(result.current.state.globalHarmony).toBe(0.5);
    expect(result.current.state.elementalResonance).toBe(0.5);
    expect(result.current.state.naturalFlow).toBe(0.5);
  });

  it('should update elements', () => {
    const { result } = renderHook(() => useNaturalIntegration(), { wrapper });

    const testElement = {
      id: 'earth-1',
      type: 'earth' as const,
      strength: 0.8,
      harmony: 0.7,
      influence: 0.9,
      cyclePhase: 0.5
    };

    act(() => {
      result.current.updateElement(testElement.id, testElement);
    });

    const element = result.current.state.elements.get('earth-1');
    expect(element).toEqual(testElement);
  });

  it('should update biodynamic cycle', () => {
    const { result } = renderHook(() => useNaturalIntegration(), { wrapper });

    const cycleUpdate = {
      moonPhase: 0.8,
      seasonalPosition: 0.6,
      harmonicResonance: 0.9
    };

    act(() => {
      result.current.updateBiodynamicCycle(cycleUpdate);
    });

    expect(result.current.state.biodynamicCycle.moonPhase).toBe(0.8);
    expect(result.current.state.biodynamicCycle.seasonalPosition).toBe(0.6);
    expect(result.current.state.biodynamicCycle.harmonicResonance).toBe(0.9);
  });

  it('should calculate global metrics correctly', () => {
    const { result } = renderHook(() => useNaturalIntegration(), { wrapper });

    const elements = [
      {
        id: 'earth-1',
        type: 'earth' as const,
        strength: 1.0,
        harmony: 1.0,
        influence: 1.0,
        cyclePhase: 1.0
      },
      {
        id: 'water-1',
        type: 'water' as const,
        strength: 1.0,
        harmony: 1.0,
        influence: 1.0,
        cyclePhase: 1.0
      }
    ];

    act(() => {
      elements.forEach(element => {
        result.current.updateElement(element.id, element);
      });
    });

    expect(result.current.state.elementalResonance).toBeGreaterThan(0.5);
    expect(result.current.state.naturalFlow).toBeGreaterThan(0.5);
  });
});