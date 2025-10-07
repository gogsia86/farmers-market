import { renderHook, act } from '@testing-library/react';
import { QuantumBalanceProvider, useQuantumBalance } from './quantum-balance-engine';
import { SelfEvolvingProvider } from './self-evolving-pattern';
import { NaturalIntegrationProvider } from './natural-integration';

describe('Quantum Balance Engine', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SelfEvolvingProvider>
      <NaturalIntegrationProvider>
        <QuantumBalanceProvider>{children}</QuantumBalanceProvider>
      </NaturalIntegrationProvider>
    </SelfEvolvingProvider>
  );

  it('should initialize with stable quantum state', () => {
    const { result } = renderHook(() => useQuantumBalance(), { wrapper });

    expect(result.current.state.currentState.dimensionalStability).toBe(1);
    expect(result.current.state.currentState.realityCoherence).toBe(1);
    expect(result.current.state.currentState.timelineAlignment).toBe(1);
    expect(result.current.state.currentState.consciousnessSync).toBe(1);
  });

  it('should update quantum state', () => {
    const { result } = renderHook(() => useQuantumBalance(), { wrapper });

    act(() => {
      result.current.updateQuantumState({
        dimensionalStability: 0.8,
        realityCoherence: 0.9
      });
    });

    expect(result.current.state.currentState.dimensionalStability).toBe(0.8);
    expect(result.current.state.currentState.realityCoherence).toBe(0.9);
  });

  it('should manage dimensional anchors', () => {
    const { result } = renderHook(() => useQuantumBalance(), { wrapper });

    act(() => {
      result.current.addDimensionalAnchor('anchor-1');
    });

    expect(result.current.state.dimensionalAnchors.has('anchor-1')).toBe(true);

    act(() => {
      result.current.removeDimensionalAnchor('anchor-1');
    });

    expect(result.current.state.dimensionalAnchors.has('anchor-1')).toBe(false);
  });

  it('should track reality shifts', () => {
    const { result } = renderHook(() => useQuantumBalance(), { wrapper });

    act(() => {
      result.current.addRealityShift('shift-1', 0.5);
    });

    expect(result.current.state.realityShifts.get('shift-1')).toBe(0.5);
  });

  it('should toggle stabilization', () => {
    const { result } = renderHook(() => useQuantumBalance(), { wrapper });

    const initialState = result.current.state.stabilizationActive;

    act(() => {
      result.current.toggleStabilization();
    });

    expect(result.current.state.stabilizationActive).toBe(!initialState);
  });
});