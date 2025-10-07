import { render, renderHook, act } from '@testing-library/react';
import {
  EnvironmentalAdapter,
  useEnvironmentalState,
  EnvironmentalProvider,
  type EnvironmentalCondition
} from './environmental-adapter';
import { QuantumBalanceProvider } from './quantum-balance-engine';
import { NaturalIntegrationProvider } from './natural-integration';

// Mock quantum state detection
jest.mock('./quantum-state', () => ({
  useQuantumState: () => ({
    environmentalResonance: 0.85,
    naturalHarmony: 0.9,
    energyFlow: 'balanced',
    cyclePhase: 'growth'
  })
}));

describe('Environmental Adaptation System', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <NaturalIntegrationProvider>
      <QuantumBalanceProvider>
        <EnvironmentalProvider>
          {children}
        </EnvironmentalProvider>
      </QuantumBalanceProvider>
    </NaturalIntegrationProvider>
  );

  it('should provide environmental context', () => {
    const { result } = renderHook(() => useEnvironmentalState(), { wrapper: TestWrapper });

    expect(result.current.conditions).toBeDefined();
    expect(result.current.harmony).toBeDefined();
    expect(typeof result.current.updateConditions).toBe('function');
  });

  it('should adapt to environmental conditions', () => {
    const conditions: EnvironmentalCondition[] = [
      {
        type: 'seasonal',
        intensity: 0.8,
        resonance: 0.9
      },
      {
        type: 'celestial',
        intensity: 0.7,
        resonance: 0.85
      }
    ];

    const { container } = render(
      <EnvironmentalAdapter conditions={conditions}>
        <div>Adaptive Content</div>
      </EnvironmentalAdapter>,
      { wrapper: TestWrapper }
    );

    expect(container.firstChild).toHaveStyle({
      opacity: expect.any(Number),
      transform: expect.stringContaining('scale'),
      transition: expect.stringContaining('ease')
    });
  });

  it('should respond to natural cycles', () => {
    const { container } = render(
      <EnvironmentalAdapter
        conditions={[{ type: 'biodynamic', intensity: 1, resonance: 1 }]}
        cycleAware
      >
        <div>Cycle-Aware Content</div>
      </EnvironmentalAdapter>,
      { wrapper: TestWrapper }
    );

    expect(container.firstChild).toHaveAttribute('data-cycle-phase', 'growth');
  });

  it('should maintain energy flow balance', () => {
    const { result } = renderHook(() => useEnvironmentalState(), { wrapper: TestWrapper });

    act(() => {
      result.current.updateConditions([
        { type: 'energetic', intensity: 0.9, resonance: 0.95 }
      ]);
    });

    expect(result.current.harmony).toBeGreaterThanOrEqual(0.8);
  });

  it('should handle multiple adaptation layers', () => {
    const { container } = render(
      <EnvironmentalAdapter
        conditions={[
          { type: 'seasonal', intensity: 0.8, resonance: 0.9 },
          { type: 'celestial', intensity: 0.7, resonance: 0.85 },
          { type: 'biodynamic', intensity: 1, resonance: 1 }
        ]}
        layered
      >
        <div>Multi-Layer Content</div>
      </EnvironmentalAdapter>,
      { wrapper: TestWrapper }
    );

    const adaptiveElement = container.firstChild as HTMLElement;
    expect(adaptiveElement.dataset.adaptationLayers).toBe('3');
  });

  it('should provide resonance feedback', () => {
    const onResonanceChange = jest.fn();

    render(
      <EnvironmentalAdapter
        conditions={[{ type: 'energetic', intensity: 0.9, resonance: 0.95 }]}
        onResonanceChange={onResonanceChange}
      >
        <div>Resonant Content</div>
      </EnvironmentalAdapter>,
      { wrapper: TestWrapper }
    );

    expect(onResonanceChange).toHaveBeenCalledWith(expect.any(Number));
  });

  it('should synchronize with natural integration', () => {
    const { result } = renderHook(() => useEnvironmentalState(), { wrapper: TestWrapper });

    act(() => {
      result.current.updateConditions([
        { type: 'seasonal', intensity: 1, resonance: 1 }
      ]);
    });

    expect(result.current.harmony).toBe(1);
  });
});