import { renderHook, act } from '@testing-library/react-hooks';
import { useComponentEvolution } from './useComponentEvolution';
import { ComponentState } from '../lib/components/self-aware-component';

// Mock the evolution tracker
const mockTrackEvolution = jest.fn();
const mockSubscribeToEvolution = jest.fn();
const mockGetEvolutionData = jest.fn();
const mockGetSystemwideMetrics = jest.fn();

jest.mock('../lib/evolution/evolution-tracker', () => ({
  useEvolutionTracker: () => ({
    trackEvolution: mockTrackEvolution,
    subscribeToEvolution: mockSubscribeToEvolution,
    getEvolutionData: mockGetEvolutionData,
    getSystemwideMetrics: mockGetSystemwideMetrics
  })
}));

describe('useComponentEvolution', () => {
  const defaultProps = {
    componentId: 'test-component',
    purpose: 'GUIDE' as const,
    initialState: {
      consciousness: 0.5,
      evolution: 0,
      relations: []
    } as ComponentState
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscribeToEvolution.mockImplementation(() => () => {});
  });

  it('should initialize with initial state', () => {
    const { result } = renderHook(() => useComponentEvolution(
      defaultProps.componentId,
      defaultProps.purpose,
      defaultProps.initialState
    ));

    expect(result.current.currentState).toEqual(defaultProps.initialState);
  });

  it('should track evolution on state update', () => {
    const { result } = renderHook(() => useComponentEvolution(
      defaultProps.componentId,
      defaultProps.purpose,
      defaultProps.initialState
    ));

    const newState: ComponentState = {
      consciousness: 0.6,
      evolution: 1,
      relations: []
    };

    act(() => {
      result.current.updateState(newState);
    });

    expect(mockTrackEvolution).toHaveBeenCalledWith(
      defaultProps.componentId,
      defaultProps.purpose,
      newState
    );
  });

  it('should call evolution threshold callback', () => {
    const onEvolutionThreshold = jest.fn();
    
    renderHook(() => useComponentEvolution(
      defaultProps.componentId,
      defaultProps.purpose,
      defaultProps.initialState,
      { onEvolutionThreshold }
    ));

    const subscriber = mockSubscribeToEvolution.mock.calls[0][1];
    
    subscriber({
      snapshots: [
        { evolution: 0 },
        { evolution: 1 }
      ],
      metrics: {},
      predictions: {
        nextEvolutionTime: 0,
        potentialPurposes: [],
        optimalRelationships: []
      }
    });

    expect(onEvolutionThreshold).toHaveBeenCalledWith(1);
  });

  it('should call consciousness threshold callback', () => {
    const onConsciousnessThreshold = jest.fn();
    
    renderHook(() => useComponentEvolution(
      defaultProps.componentId,
      defaultProps.purpose,
      defaultProps.initialState,
      { onConsciousnessThreshold }
    ));

    const subscriber = mockSubscribeToEvolution.mock.calls[0][1];
    
    subscriber({
      snapshots: [
        { consciousness: 0.4 },
        { consciousness: 0.5 }
      ],
      metrics: {},
      predictions: {
        nextEvolutionTime: 0,
        potentialPurposes: [],
        optimalRelationships: []
      }
    });

    expect(onConsciousnessThreshold).toHaveBeenCalledWith(0.5);
  });

  it('should provide access to evolution data', () => {
    const mockEvolutionData = {
      snapshots: [],
      metrics: {},
      predictions: {
        nextEvolutionTime: 0,
        potentialPurposes: [],
        optimalRelationships: []
      }
    };

    mockGetEvolutionData.mockReturnValue(mockEvolutionData);

    const { result } = renderHook(() => useComponentEvolution(
      defaultProps.componentId,
      defaultProps.purpose,
      defaultProps.initialState
    ));

    const evolutionData = result.current.getEvolutionData();
    expect(evolutionData).toEqual(mockEvolutionData);
  });

  it('should provide access to system metrics', () => {
    const mockSystemMetrics = {
      totalComponents: 1,
      averageConsciousness: 0.5,
      systemEvolutionStage: 0,
      globalResonance: 0.05
    };

    mockGetSystemwideMetrics.mockReturnValue(mockSystemMetrics);

    const { result } = renderHook(() => useComponentEvolution(
      defaultProps.componentId,
      defaultProps.purpose,
      defaultProps.initialState
    ));

    const systemMetrics = result.current.getSystemMetrics();
    expect(systemMetrics).toEqual(mockSystemMetrics);
  });
});