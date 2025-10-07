import { renderHook, act } from '@testing-library/react-hooks';
import { useDivineAnimation } from './useDivineAnimation';
import { useAgriculturalNavigation } from './useAgriculturalNavigation';

jest.mock('./useAgriculturalNavigation');

describe('useDivineAnimation', () => {
  const mockGetCurrentCycle = jest.fn();
  const mockElement = {
    animate: jest.fn(),
    getAnimations: jest.fn().mockReturnValue([]),
    classList: {
      add: jest.fn(),
      remove: jest.fn()
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAgriculturalNavigation as jest.Mock).mockReturnValue({
      getCurrentCycle: mockGetCurrentCycle.mockReturnValue({
        moonPhase: 0.5,
        energyLevel: 0.8,
        season: 'SUMMER',
        growthPhase: 'GROWTH'
      })
    });

    document.getElementById = jest.fn().mockReturnValue(mockElement);
  });

  it('should initialize animation system correctly', () => {
    const { result } = renderHook(() => 
      useDivineAnimation('test-element', { pattern: 'FLOW' })
    );

    expect(result.current).toHaveProperty('startAnimation');
    expect(result.current).toHaveProperty('stopAnimation');
    expect(result.current).toHaveProperty('pauseAnimation');
    expect(result.current).toHaveProperty('resumeAnimation');
    expect(result.current).toHaveProperty('changePattern');
    expect(result.current).toHaveProperty('getAnimationState');
  });

  it('should start animation when autoStart is true', () => {
    renderHook(() => 
      useDivineAnimation('test-element', { 
        pattern: 'FLOW',
        autoStart: true 
      })
    );

    expect(mockElement.animate).toHaveBeenCalled();
  });

  it('should not start animation when autoStart is false', () => {
    renderHook(() => 
      useDivineAnimation('test-element', { 
        pattern: 'FLOW',
        autoStart: false 
      })
    );

    expect(mockElement.animate).not.toHaveBeenCalled();
  });

  it('should change pattern when requested', () => {
    const { result } = renderHook(() => 
      useDivineAnimation('test-element', { 
        pattern: 'FLOW',
        autoStart: false 
      })
    );

    act(() => {
      result.current.startAnimation();
      result.current.changePattern('SPIRAL');
    });

    expect(mockElement.animate).toHaveBeenCalledTimes(2);
  });

  it('should stop animations when requested', () => {
    const mockAnimation = { cancel: jest.fn() };
    mockElement.getAnimations.mockReturnValue([mockAnimation]);

    const { result } = renderHook(() => 
      useDivineAnimation('test-element', { pattern: 'FLOW' })
    );

    act(() => {
      result.current.stopAnimation();
    });

    expect(mockAnimation.cancel).toHaveBeenCalled();
  });

  it('should pause animations when requested', () => {
    const mockAnimation = { pause: jest.fn() };
    mockElement.getAnimations.mockReturnValue([mockAnimation]);

    const { result } = renderHook(() => 
      useDivineAnimation('test-element', { pattern: 'FLOW' })
    );

    act(() => {
      result.current.pauseAnimation();
    });

    expect(mockAnimation.pause).toHaveBeenCalled();
  });

  it('should resume animations when requested', () => {
    const mockAnimation = { play: jest.fn() };
    mockElement.getAnimations.mockReturnValue([mockAnimation]);

    const { result } = renderHook(() => 
      useDivineAnimation('test-element', { pattern: 'FLOW' })
    );

    act(() => {
      result.current.resumeAnimation();
    });

    expect(mockAnimation.play).toHaveBeenCalled();
  });

  it('should clean up interval on unmount', () => {
    jest.useFakeTimers();
    
    const { unmount } = renderHook(() => 
      useDivineAnimation('test-element', { pattern: 'FLOW' })
    );

    unmount();

    expect(clearInterval).toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  it('should update animations based on seasonal changes', () => {
    jest.useFakeTimers();

    renderHook(() => 
      useDivineAnimation('test-element', { pattern: 'FLOW' })
    );

    act(() => {
      jest.advanceTimersByTime(60000); // 1 minute
    });

    expect(mockElement.animate).toHaveBeenCalledTimes(2); // Initial + update
    
    jest.useRealTimers();
  });
});