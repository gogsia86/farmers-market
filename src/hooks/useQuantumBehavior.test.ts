import { renderHook, act } from '@testing-library/react-hooks';
import { useQuantumBehavior } from './useQuantumBehavior';

// Mock behavior prediction context
const mockTrackBehavior = jest.fn();
const mockPredictNextBehavior = jest.fn();
const mockGetPatterns = jest.fn();
const mockSubscribeToPatterns = jest.fn();

jest.mock('../lib/quantum/behavior-prediction', () => ({
  useBehaviorPrediction: () => ({
    trackBehavior: mockTrackBehavior,
    predictNextBehavior: mockPredictNextBehavior,
    getPatterns: mockGetPatterns,
    subscribeToPatterns: mockSubscribeToPatterns
  })
}));

describe('useQuantumBehavior', () => {
  const defaultProps = {
    componentId: 'test-component'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockSubscribeToPatterns.mockImplementation(() => () => {});
    mockGetPatterns.mockReturnValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useQuantumBehavior(defaultProps.componentId));

    expect(result.current.currentIntent).toBe('REST');
    expect(result.current.patterns).toEqual([]);
    expect(typeof result.current.trackEvent).toBe('function');
    expect(typeof result.current.eventHandlers.onClick).toBe('function');
  });

  it('should track behavior events', () => {
    const { result } = renderHook(() => useQuantumBehavior(defaultProps.componentId));

    act(() => {
      result.current.trackEvent('CLICK', { target: 'button' });
    });

    expect(mockTrackBehavior).toHaveBeenCalledWith(expect.objectContaining({
      type: 'CLICK',
      componentId: defaultProps.componentId,
      metadata: { target: 'button' }
    }));
  });

  it('should handle intent changes', () => {
    const onIntentChange = jest.fn();
    renderHook(() => useQuantumBehavior(defaultProps.componentId, { onIntentChange }));

    const subscriber = mockSubscribeToPatterns.mock.calls[0][0];
    
    act(() => {
      subscriber([{
        events: [{ componentId: defaultProps.componentId }],
        intent: 'EXPLORE',
        frequency: 1,
        confidence: 1,
        consciousness: 1
      }]);
    });

    expect(onIntentChange).toHaveBeenCalledWith('EXPLORE');
  });

  it('should handle predicted behaviors', () => {
    const onPredictedBehavior = jest.fn();
    mockPredictNextBehavior.mockReturnValue({
      nextAction: 'CLICK',
      probability: 0.8,
      intent: 'EXPLORE',
      suggestedComponents: [defaultProps.componentId],
      optimalTiming: Date.now() + 1000
    });

    renderHook(() => useQuantumBehavior(defaultProps.componentId, {
      onPredictedBehavior,
      autoOptimize: true
    }));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onPredictedBehavior).toHaveBeenCalledWith(expect.objectContaining({
      action: 'CLICK',
      probability: 0.8
    }));
  });

  it('should handle event handlers', () => {
    const { result } = renderHook(() => useQuantumBehavior(defaultProps.componentId));

    const mockEvent = {
      target: {
        id: 'test-button',
        value: 'test-value'
      }
    };

    act(() => {
      result.current.eventHandlers.onClick(mockEvent);
    });

    expect(mockTrackBehavior).toHaveBeenCalledWith(expect.objectContaining({
      type: 'CLICK',
      componentId: defaultProps.componentId,
      metadata: {
        target: 'test-button',
        value: 'test-value'
      }
    }));
  });

  it('should respect autoOptimize option', () => {
    renderHook(() => useQuantumBehavior(defaultProps.componentId, {
      autoOptimize: false
    }));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockPredictNextBehavior).not.toHaveBeenCalled();
  });

  it('should filter patterns by component', () => {
    mockGetPatterns.mockReturnValue([
      {
        events: [{ componentId: defaultProps.componentId }],
        intent: 'EXPLORE',
        frequency: 1,
        confidence: 1,
        consciousness: 1
      },
      {
        events: [{ componentId: 'other-component' }],
        intent: 'REST',
        frequency: 1,
        confidence: 1,
        consciousness: 1
      }
    ]);

    const { result } = renderHook(() => useQuantumBehavior(defaultProps.componentId));

    expect(result.current.patterns).toHaveLength(1);
    expect(result.current.patterns[0].intent).toBe('EXPLORE');
  });
});