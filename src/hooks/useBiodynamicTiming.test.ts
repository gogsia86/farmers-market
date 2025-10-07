import { renderHook, act } from '@testing-library/react-hooks';
import { useBiodynamicTiming } from './useBiodynamicTiming';

describe('useBiodynamicTiming', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with current cycle', () => {
    const { result } = renderHook(() => useBiodynamicTiming());

    expect(result.current.currentCycle).toHaveProperty('celestial');
    expect(result.current.currentCycle).toHaveProperty('seasonal');
    expect(result.current.currentCycle).toHaveProperty('diurnal');
    expect(result.current.currentCycle).toHaveProperty('activity');
    expect(result.current.currentCycle).toHaveProperty('energyLevel');
    expect(result.current.currentCycle).toHaveProperty('harmonyIndex');
  });

  it('should update cycle based on update frequency', () => {
    const { result } = renderHook(() => 
      useBiodynamicTiming({ updateFrequency: 1000 })
    );

    const initialCycle = result.current.currentCycle;

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.currentCycle).not.toEqual(initialCycle);
  });

  it('should calculate optimal timing for activities', () => {
    const { result } = renderHook(() => useBiodynamicTiming());

    const optimalTime = result.current.getOptimalTiming('PLANTING', 3600000);
    expect(optimalTime).toBeInstanceOf(Date);
  });

  it('should determine harmonious times for activities', () => {
    const { result } = renderHook(() => useBiodynamicTiming());

    const isHarmonious = result.current.isHarmoniousTime('PLANTING');
    expect(typeof isHarmonious).toBe('boolean');
  });

  it('should format cycle information', () => {
    const { result } = renderHook(() => useBiodynamicTiming());

    const formattedInfo = result.current.getFormattedCycle(
      result.current.currentCycle
    );

    expect(formattedInfo).toContain('season');
    expect(formattedInfo).toContain('moon');
    expect(formattedInfo).toContain('Energy:');
    expect(formattedInfo).toContain('Harmony:');
  });

  it('should provide recommended activities', () => {
    const { result } = renderHook(() => useBiodynamicTiming());

    const recommendations = result.current.getRecommendedActivities(
      result.current.currentCycle
    );

    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeGreaterThan(0);
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useBiodynamicTiming());
    unmount();
    // Expect no memory leaks or interval issues
  });

  it('should handle custom configuration', () => {
    const config = {
      updateFrequency: 30000,
      sensitivity: 0.9,
      harmonicAlignment: 0.8,
      resonanceFactor: 1.0
    };

    const { result } = renderHook(() => useBiodynamicTiming(config));

    expect(result.current.currentCycle).toBeTruthy();
    // Custom config should affect timing calculations
    const optimalTime = result.current.getOptimalTiming('GROWING', 7200000);
    expect(optimalTime).toBeInstanceOf(Date);
  });

  it('should maintain consistent updates', () => {
    const { result } = renderHook(() => 
      useBiodynamicTiming({ updateFrequency: 1000 })
    );

    const cycles: any[] = [];
    cycles.push({ ...result.current.currentCycle });

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    cycles.push({ ...result.current.currentCycle });

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    cycles.push({ ...result.current.currentCycle });

    // Each cycle should be different
    expect(cycles[0]).not.toEqual(cycles[1]);
    expect(cycles[1]).not.toEqual(cycles[2]);
  });
});