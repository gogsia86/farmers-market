import { renderHook, act } from '@testing-library/react-hooks';
import { useResonantFeedback } from './useResonantFeedback';
import { useAgriculturalNavigation } from './useAgriculturalNavigation';

jest.mock('./useAgriculturalNavigation');

describe('useResonantFeedback', () => {
  const mockGetCurrentCycle = jest.fn();
  const mockElement = {
    animate: jest.fn(),
    classList: {
      add: jest.fn(),
      remove: jest.fn()
    },
    style: {
      setProperty: jest.fn(),
      removeProperty: jest.fn()
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
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize feedback system correctly', () => {
    const { result } = renderHook(() => 
      useResonantFeedback('test-element', { pattern: 'RIPPLE' })
    );

    expect(result.current).toHaveProperty('createFeedback');
    expect(result.current).toHaveProperty('updateFeedback');
    expect(result.current).toHaveProperty('getFeedbackState');
  });

  it('should create feedback when autoSetup is true', () => {
    renderHook(() => 
      useResonantFeedback('test-element', { 
        pattern: 'RIPPLE',
        autoSetup: true 
      })
    );

    expect(mockElement.animate).toHaveBeenCalled();
    expect(mockElement.classList.add).toHaveBeenCalledWith('resonating');
  });

  it('should not create feedback when autoSetup is false', () => {
    renderHook(() => 
      useResonantFeedback('test-element', { 
        pattern: 'RIPPLE',
        autoSetup: false 
      })
    );

    expect(mockElement.animate).not.toHaveBeenCalled();
    expect(mockElement.classList.add).not.toHaveBeenCalled();
  });

  it('should create custom feedback when requested', () => {
    const { result } = renderHook(() => 
      useResonantFeedback('test-element', { 
        pattern: 'RIPPLE',
        autoSetup: false 
      })
    );

    act(() => {
      result.current.createFeedback('WAVE', {
        amplitude: 0.8,
        duration: 2000
      });
    });

    expect(mockElement.animate).toHaveBeenCalled();
    expect(mockElement.classList.add).toHaveBeenCalledWith('resonating');
  });

  it('should update feedback based on consciousness changes', () => {
    renderHook(() => 
      useResonantFeedback('test-element', { pattern: 'RIPPLE' })
    );

    act(() => {
      jest.advanceTimersByTime(30000); // 30 seconds
    });

    expect(mockElement.animate).toHaveBeenCalledTimes(2); // Initial + update
  });

  it('should clean up intervals on unmount', () => {
    const { unmount } = renderHook(() => 
      useResonantFeedback('test-element', { pattern: 'RIPPLE' })
    );

    unmount();

    expect(clearInterval).toHaveBeenCalled();
  });

  it('should provide current feedback state', () => {
    const { result } = renderHook(() => 
      useResonantFeedback('test-element', { pattern: 'RIPPLE' })
    );

    const state = result.current.getFeedbackState();

    expect(state).toHaveProperty('pattern');
    expect(state).toHaveProperty('energy');
    expect(state).toHaveProperty('intensity');
    expect(state).toHaveProperty('harmony');
    expect(state).toHaveProperty('resonance');
  });

  it('should update custom properties on feedback creation', () => {
    renderHook(() => 
      useResonantFeedback('test-element', { pattern: 'RIPPLE' })
    );

    expect(mockElement.style.setProperty).toHaveBeenCalledWith(
      '--resonance-frequency',
      expect.any(String)
    );
    expect(mockElement.style.setProperty).toHaveBeenCalledWith(
      '--resonance-amplitude',
      expect.any(String)
    );
  });

  it('should clean up custom properties after feedback duration', () => {
    renderHook(() => 
      useResonantFeedback('test-element', { pattern: 'RIPPLE' })
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(mockElement.style.removeProperty).toHaveBeenCalledWith('--resonance-frequency');
    expect(mockElement.style.removeProperty).toHaveBeenCalledWith('--resonance-amplitude');
    expect(mockElement.classList.remove).toHaveBeenCalledWith('resonating');
  });
});