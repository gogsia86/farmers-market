import { renderHook, act } from '@testing-library/react';
import { useQuantumContextSensing } from './useQuantumContextSensing';

// Mock the dependent hooks
jest.mock('./useMultiDimensionalRender', () => ({
  useMultiDimensionalRender: () => ({
    dimensionalState: {
      temporalAlignment: 1.0,
    },
  }),
}));

jest.mock('../lib/quantumStateManager', () => ({
  useQuantumState: () => ({
    getCurrentState: () => ({
      coherenceLevel: 1.0,
      probabilityField: [1.0],
    }),
    updateState: jest.fn(),
  }),
}));

describe('useQuantumContextSensing', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should initialize with default quantum context', () => {
    const { result } = renderHook(() => useQuantumContextSensing());

    expect(result.current.quantumContext).toEqual({
      entropy: 0,
      coherence: 1,
      dimensionalShift: 0,
      temporalStability: 1,
      resonanceField: [1],
    });
  });

  it('should accept custom sensor configuration', () => {
    const customConfig = {
      sensitivity: 0.95,
      thresholds: {
        entropy: 0.4,
        coherence: 0.8,
        dimensionalShift: 0.3,
        temporalStability: 0.9,
      },
    };

    const { result } = renderHook(() => useQuantumContextSensing(customConfig));

    expect(result.current.sensorConfig.sensitivity).toBe(0.95);
    expect(result.current.sensorConfig.thresholds.entropy).toBe(0.4);
  });

  it('should update quantum context periodically', () => {
    const { result } = renderHook(() => useQuantumContextSensing({
      frequency: 1, // 1 Hz for testing
    }));

    // Fast-forward time by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.quantumContext).toBeDefined();
  });

  it('should clean up interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const { unmount } = renderHook(() => useQuantumContextSensing());

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});