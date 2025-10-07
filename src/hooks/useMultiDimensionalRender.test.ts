import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useMultiDimensionalRender } from './useMultiDimensionalRender';

// Mock the dependent hooks
jest.mock('./useAgriculturalNavigation', () => ({
  useAgriculturalNavigation: () => ({
    getCurrentCycle: () => ({ season: 'SPRING', phase: 'GROWTH' }),
  }),
}));

jest.mock('./useAgriculturalEmpathy', () => ({
  useAgriculturalEmpathy: () => ({
    calculateResonance: () => 0.9,
  }),
}));

describe('useMultiDimensionalRender', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useMultiDimensionalRender());

    expect(result.current.dimensionalState).toEqual({
      physical: true,
      quantum: false,
      spiritual: false,
      temporalAlignment: 1.0,
      resonanceFrequency: 432,
    });
  });

  it('should accept custom initial state', () => {
    const initialState = {
      quantum: true,
      resonanceFrequency: 528,
    };

    const { result } = renderHook(() => useMultiDimensionalRender(initialState));

    expect(result.current.dimensionalState.quantum).toBe(true);
    expect(result.current.dimensionalState.resonanceFrequency).toBe(528);
  });

  it('should optimize rendering plane', () => {
    const { result } = renderHook(() => useMultiDimensionalRender());
    const testContent = "test-content";

    const optimizedContent = result.current.optimizeRenderingPlane(testContent);
    expect(optimizedContent).toBeDefined();
  });

  it('should update dimensional state based on quantum calculations', async () => {
    const { result } = renderHook(() => useMultiDimensionalRender());

    // Wait for initial alignment
    await new Promise(resolve => setTimeout(resolve, 1100));

    expect(result.current.dimensionalState.quantum).toBe(true);
    expect(result.current.dimensionalState.temporalAlignment).toBeGreaterThan(0);
  });

  it('should handle optimization configuration updates', () => {
    const { result } = renderHook(() => useMultiDimensionalRender());

    act(() => {
      result.current.setOptimization({
        quantumCaching: false,
        dimensionalCompression: true,
        resonanceThreshold: 0.95,
      });
    });

    expect(result.current.optimization.quantumCaching).toBe(false);
    expect(result.current.optimization.resonanceThreshold).toBe(0.95);
  });
});