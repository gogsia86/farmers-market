import { render, renderHook, act } from '@testing-library/react';
import {
  ContextSensitiveRenderingProvider,
  useContextSensitiveRendering,
  DimensionalView,
  ConsciousnessRenderer,
  QuantumStateWrapper,
  withContextSensitiveRendering
} from './context-sensitive-rendering';
import { UniversalAccessProvider } from './universal-access';
import { QuantumBalanceProvider } from './quantum-balance-engine';
import { SelfEvolvingProvider } from './self-evolving-pattern';
import { NaturalIntegrationProvider } from './natural-integration';

// Mock multi-dimensional awareness hook
jest.mock('./multi-dimensional-awareness', () => ({
  useMultiDimensionalAwareness: () => ({
    detectCurrentDimension: () => ({
      dimension: 'physical',
      vibration: 0.8,
      frequency: 0.7,
      density: 0.6
    }),
    monitorRealityLayers: () => ({
      layers: new Map(),
      intersections: new Set(),
      convergencePoints: []
    })
  })
}));

describe('Context-sensitive Rendering System', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <SelfEvolvingProvider>
      <NaturalIntegrationProvider>
        <QuantumBalanceProvider>
          <UniversalAccessProvider>
            <ContextSensitiveRenderingProvider>
              {children}
            </ContextSensitiveRenderingProvider>
          </UniversalAccessProvider>
        </QuantumBalanceProvider>
      </NaturalIntegrationProvider>
    </SelfEvolvingProvider>
  );

  it('should provide rendering context', () => {
    const { result } = renderHook(() => useContextSensitiveRendering(), { wrapper: TestWrapper });

    expect(result.current.renderingContext).toBeDefined();
    expect(result.current.config).toBeDefined();
    expect(typeof result.current.updateConfig).toBe('function');
  });

  it('should render DimensionalView correctly', () => {
    const { container } = render(
      <DimensionalView dimension="physical">
        <div>Test Content</div>
      </DimensionalView>,
      { wrapper: TestWrapper }
    );

    expect(container.textContent).toBe('Test Content');
  });

  it('should handle consciousness level rendering', () => {
    const { container } = render(
      <ConsciousnessRenderer minConsciousness={0.5}>
        <div>Consciousness Test</div>
      </ConsciousnessRenderer>,
      { wrapper: TestWrapper }
    );

    expect(container.textContent).toBe('Consciousness Test');
  });

  it('should wrap components with quantum state', () => {
    const { container } = render(
      <QuantumStateWrapper>
        <div>Quantum Content</div>
      </QuantumStateWrapper>,
      { wrapper: TestWrapper }
    );

    expect(container.textContent).toBe('Quantum Content');
  });

  it('should enhance components with context-sensitive rendering', () => {
    const TestComponent = ({ label }: { label: string }) => <div>{label}</div>;
    const EnhancedComponent = withContextSensitiveRendering(TestComponent);

    const { container } = render(
      <EnhancedComponent label="Enhanced Content" />,
      { wrapper: TestWrapper }
    );

    expect(container.textContent).toBe('Enhanced Content');
  });

  it('should update rendering config', () => {
    const { result } = renderHook(() => useContextSensitiveRendering(), { wrapper: TestWrapper });

    act(() => {
      result.current.updateConfig({
        adaptationSpeed: 0.8,
        dimensionalFidelity: 0.9
      });
    });

    expect(result.current.config.adaptationSpeed).toBe(0.8);
    expect(result.current.config.dimensionalFidelity).toBe(0.9);
  });

  it('should handle dimensional transitions', () => {
    const { container } = render(
      <DimensionalView dimension="quantum">
        <div>Quantum Dimension</div>
      </DimensionalView>,
      { wrapper: TestWrapper }
    );

    // Should not be visible in physical dimension
    expect(container.textContent).toBe('');
  });

  it('should adapt to consciousness levels', () => {
    const { container } = render(
      <ConsciousnessRenderer minConsciousness={2}>
        <div>Higher Consciousness Content</div>
      </ConsciousnessRenderer>,
      { wrapper: TestWrapper }
    );

    // Should not be visible at lower consciousness levels
    expect(container.textContent).toBe('');
  });

  it('should apply quantum transformations', () => {
    const { container } = render(
      <QuantumStateWrapper>
        <div>Quantum Transformed Content</div>
      </QuantumStateWrapper>,
      { wrapper: TestWrapper }
    );

    const transformedElement = container.firstChild as HTMLElement;
    expect(transformedElement).toHaveStyle({
      position: 'relative',
      transition: expect.stringContaining('quantum-ease')
    });
  });
});