import { renderHook, act } from '@testing-library/react-hooks';
import { useAgriculturalPattern } from './agricultural-patterns';

// Mock dependencies
jest.mock('../../hooks/useSelfAwareComponent', () => ({
  useSelfAwareComponent: () => ({
    state: {
      consciousness: 0.5,
      evolution: 0
    },
    evolve: jest.fn()
  })
}));

jest.mock('../../hooks/useBiodynamicTiming', () => ({
  useBiodynamicTiming: () => ({
    getOptimalTiming: jest.fn().mockReturnValue(new Date())
  })
}));

describe('useAgriculturalPattern', () => {
  const defaultProps = {
    id: 'test-pattern'
  };

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAgriculturalPattern(defaultProps.id));

    expect(result.current.pattern).toEqual({
      id: defaultProps.id,
      growthStage: 'SEED',
      seasonalPhase: 'SPRING',
      lunarPhase: 'NEW',
      elementalAspect: 'EARTH',
      consciousness: 0.5
    });
  });

  it('should advance growth stage', () => {
    const { result } = renderHook(() => useAgriculturalPattern(defaultProps.id));

    act(() => {
      result.current.advanceGrowthStage();
    });

    expect(result.current.pattern.growthStage).toBe('SPROUT');
  });

  it('should align with seasons', () => {
    const { result } = renderHook(() => useAgriculturalPattern(defaultProps.id));

    act(() => {
      result.current.alignWithSeason();
    });

    // Since we mocked the date, it should still be spring
    expect(result.current.pattern.seasonalPhase).toBe('SPRING');
  });

  it('should align with lunar phases', () => {
    const { result } = renderHook(() => useAgriculturalPattern(defaultProps.id));

    act(() => {
      result.current.alignWithLunarPhase();
    });

    // Since we mocked the date, it should still be new moon
    expect(result.current.pattern.lunarPhase).toBe('NEW');
  });

  it('should balance elements based on consciousness', () => {
    const { result } = renderHook(() => useAgriculturalPattern(defaultProps.id));

    act(() => {
      result.current.balanceElements();
    });

    // With consciousness of 0.5, should be WATER or AIR
    expect(['WATER', 'AIR']).toContain(result.current.pattern.elementalAspect);
  });

  it('should respect initial growth stage', () => {
    const { result } = renderHook(() => 
      useAgriculturalPattern(defaultProps.id, {
        initialGrowthStage: 'BLOOM'
      })
    );

    expect(result.current.pattern.growthStage).toBe('BLOOM');
  });

  it('should disable seasonal alignment', () => {
    const { result } = renderHook(() => 
      useAgriculturalPattern(defaultProps.id, {
        seasonalAlignment: false
      })
    );

    const initialPhase = result.current.pattern.seasonalPhase;

    act(() => {
      result.current.alignWithSeason();
    });

    expect(result.current.pattern.seasonalPhase).toBe(initialPhase);
  });

  it('should disable lunar alignment', () => {
    const { result } = renderHook(() => 
      useAgriculturalPattern(defaultProps.id, {
        lunarAlignment: false
      })
    );

    const initialPhase = result.current.pattern.lunarPhase;

    act(() => {
      result.current.alignWithLunarPhase();
    });

    expect(result.current.pattern.lunarPhase).toBe(initialPhase);
  });

  it('should disable elemental balance', () => {
    const { result } = renderHook(() => 
      useAgriculturalPattern(defaultProps.id, {
        elementalBalance: false
      })
    );

    const initialAspect = result.current.pattern.elementalAspect;

    act(() => {
      result.current.balanceElements();
    });

    expect(result.current.pattern.elementalAspect).toBe(initialAspect);
  });
});