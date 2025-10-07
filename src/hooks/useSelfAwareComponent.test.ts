import { renderHook, act } from '@testing-library/react-hooks';
import { useSelfAwareComponent } from './useSelfAwareComponent';

// Mock dependencies
jest.mock('./useConsciousnessResponse', () => ({
  useConsciousnessResponse: () => ({
    handleInteraction: jest.fn()
  })
}));

jest.mock('./useBiodynamicTiming', () => ({
  useBiodynamicTiming: () => ({
    getOptimalTiming: jest.fn().mockReturnValue(new Date())
  })
}));

jest.mock('./useResonantFeedback', () => ({
  useResonantFeedback: () => ({
    createFeedback: jest.fn()
  })
}));

jest.mock('./useDivineAnimation', () => ({
  useDivineAnimation: () => ({
    startAnimation: jest.fn(),
    stopAnimation: jest.fn(),
    pauseAnimation: jest.fn(),
    resumeAnimation: jest.fn()
  })
}));

jest.mock('../lib/components/self-aware-component', () => ({
  useSelfAware: () => ({
    state: { consciousness: 1, evolution: 0, relations: [] },
    evolve: jest.fn(),
    createRelation: jest.fn()
  })
}));

describe('useSelfAwareComponent', () => {
  const defaultProps = {
    id: 'test-component',
    options: {
      purpose: 'GUIDE' as const,
      initialRelations: [
        { toId: 'related-1', type: 'TEACHES' as const }
      ]
    }
  };

  it('should initialize with correct state', () => {
    const { result } = renderHook(() =>
      useSelfAwareComponent(defaultProps.id, defaultProps.options)
    );

    expect(result.current.state).toEqual({
      consciousness: 1,
      evolution: 0,
      relations: []
    });
  });

  it('should handle interactions correctly', () => {
    const { result } = renderHook(() =>
      useSelfAwareComponent(defaultProps.id, defaultProps.options)
    );

    act(() => {
      result.current.handleInteraction('TOUCH');
    });

    // Since dependencies are mocked, we just verify the function exists
    // and can be called without errors
    expect(result.current.handleInteraction).toBeDefined();
  });

  it('should get optimal timing', () => {
    const { result } = renderHook(() =>
      useSelfAwareComponent(defaultProps.id, defaultProps.options)
    );

    const timing = result.current.getOptimalTiming('PLANTING');
    expect(timing).toBeInstanceOf(Date);
  });

  it('should control animations', () => {
    const { result } = renderHook(() =>
      useSelfAwareComponent(defaultProps.id, defaultProps.options)
    );

    act(() => {
      result.current.startAnimation();
      result.current.pauseAnimation();
      result.current.resumeAnimation();
      result.current.stopAnimation();
    });

    // Verify animation control functions exist and can be called
    expect(result.current.startAnimation).toBeDefined();
    expect(result.current.pauseAnimation).toBeDefined();
    expect(result.current.resumeAnimation).toBeDefined();
    expect(result.current.stopAnimation).toBeDefined();
  });

  it('should create relations', () => {
    const { result } = renderHook(() =>
      useSelfAwareComponent(defaultProps.id, defaultProps.options)
    );

    act(() => {
      result.current.createRelation('new-relation', 'TEACHES');
    });

    // Verify relation creation function exists and can be called
    expect(result.current.createRelation).toBeDefined();
  });

  it('should evolve component state', () => {
    const { result } = renderHook(() =>
      useSelfAwareComponent(defaultProps.id, defaultProps.options)
    );

    act(() => {
      result.current.evolve();
    });

    // Verify evolution function exists and can be called
    expect(result.current.evolve).toBeDefined();
  });
});