/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useContextualAdaptation } from './useContextualAdaptation';
import { TestProviders } from '../test/TestProviders';

describe('useContextualAdaptation', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    document.documentElement.style.setProperty('--quantum-layout-shift', '0');
  });

  afterEach(() => {
    document.documentElement.className = '';
    document.documentElement.style.removeProperty('--quantum-layout-shift');
  });

  it('applies layout adaptations based on consciousness level', () => {
    const { result } = renderHook(
      () => useContextualAdaptation('test', ['LAYOUT_SHIFT']),
      { wrapper: TestProviders }
    );

    act(() => {
      result.current.dispatch({
        type: 'UPDATE_USER_STATE',
        payload: { consciousnessLevel: 8 }
      });
    });

    expect(document.documentElement.style.getPropertyValue('--quantum-layout-shift')).toBe('1');
  });

  it('applies color scheme adaptations based on time of day', () => {
    const { result } = renderHook(
      () => useContextualAdaptation('test', ['COLOR_SCHEME']),
      { wrapper: TestProviders }
    );

    act(() => {
      result.current.dispatch({
        type: 'UPDATE_CONTEXT',
        payload: { timeOfDay: 22 }
      });
    });

    expect(document.documentElement.classList.contains('dark-adaptation')).toBe(true);
  });

  it('applies interaction mode adaptations based on user patterns', () => {
    const { result } = renderHook(
      () => useContextualAdaptation('test', ['INTERACTION_MODE']),
      { wrapper: TestProviders }
    );

    act(() => {
      result.current.dispatch({
        type: 'UPDATE_USER_STATE',
        payload: { interactionPatterns: new Set(['advanced-gestures']) }
      });
    });

    expect(document.documentElement.classList.contains('enhanced-interactions')).toBe(true);
  });

  it('cleans up adaptations on unmount', () => {
    const { result, unmount } = renderHook(
      () => useContextualAdaptation('test', ['COLOR_SCHEME', 'INTERACTION_MODE']),
      { wrapper: TestProviders }
    );

    act(() => {
      result.current.dispatch({
        type: 'UPDATE_USER_STATE',
        payload: { interactionPatterns: new Set(['advanced-gestures']) }
      });
      result.current.dispatch({
        type: 'UPDATE_CONTEXT',
        payload: { timeOfDay: 22 }
      });
    });

    unmount();

    expect(document.documentElement.classList.contains('dark-adaptation')).toBe(false);
    expect(document.documentElement.classList.contains('enhanced-interactions')).toBe(false);
  });

  it('handles edge case transitions in consciousness level', () => {
    const { result } = renderHook(
      () => useContextualAdaptation('test', ['LAYOUT_SHIFT']),
      { wrapper: TestProviders }
    );

    // Test minimum consciousness level
    act(() => {
      result.current.dispatch({
        type: 'UPDATE_USER_STATE',
        payload: { consciousnessLevel: 0 }
      });
    });
    expect(document.documentElement.style.getPropertyValue('--quantum-layout-shift')).toBe('0');

    // Test maximum consciousness level
    act(() => {
      result.current.dispatch({
        type: 'UPDATE_USER_STATE',
        payload: { consciousnessLevel: 10 }
      });
    });
    expect(document.documentElement.style.getPropertyValue('--quantum-layout-shift')).toBe('1');
  });

  it('handles time of day transitions', () => {
    const { result } = renderHook(
      () => useContextualAdaptation('test', ['COLOR_SCHEME']),
      { wrapper: TestProviders }
    );

    // Test dawn transition
    act(() => {
      result.current.dispatch({
        type: 'UPDATE_CONTEXT',
        payload: { timeOfDay: 6 }
      });
    });
    expect(document.documentElement.classList.contains('dark-adaptation')).toBe(false);

    // Test dusk transition
    act(() => {
      result.current.dispatch({
        type: 'UPDATE_CONTEXT',
        payload: { timeOfDay: 18 }
      });
    });
    expect(document.documentElement.classList.contains('dark-adaptation')).toBe(true);
  });

  it('handles multiple interaction pattern combinations', () => {
    const { result } = renderHook(
      () => useContextualAdaptation('test', ['INTERACTION_MODE']),
      { wrapper: TestProviders }
    );

    // Test multiple patterns
    act(() => {
      result.current.dispatch({
        type: 'UPDATE_USER_STATE',
        payload: { interactionPatterns: new Set(['advanced-gestures', 'voice-commands', 'eye-tracking']) }
      });
    });
    expect(document.documentElement.classList.contains('enhanced-interactions')).toBe(true);
    expect(document.documentElement.classList.contains('multi-modal-input')).toBe(true);

    // Test pattern removal
    act(() => {
      result.current.dispatch({
        type: 'UPDATE_USER_STATE',
        payload: { interactionPatterns: new Set([]) }
      });
    });
    expect(document.documentElement.classList.contains('enhanced-interactions')).toBe(false);
    expect(document.documentElement.classList.contains('multi-modal-input')).toBe(false);
  });
});
