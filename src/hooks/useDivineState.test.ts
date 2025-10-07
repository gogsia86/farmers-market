import { renderHook, act } from '@testing-library/react';
import {
  useDivineState,
  useGlobalDivineState,
  useDivineSelector,
  useDivineTranscendence,
} from './useDivineState';

describe('Divine State Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useDivineState', () => {
    it('should initialize with provided state', () => {
      const { result } = renderHook(() =>
        useDivineState({ count: 0 })
      );

      expect(result.current.state?.value).toEqual({ count: 0 });
    });

    it('should handle state updates', async () => {
      const { result } = renderHook(() =>
        useDivineState({ count: 0 })
      );

      await act(async () => {
        await result.current.dispatch({
          type: 'UPDATE',
          payload: { count: 1 },
        });
      });

      expect(result.current.state?.value.count).toBe(1);
    });

    it('should track transcendence state', async () => {
      const { result } = renderHook(() =>
        useDivineState({ count: 0 })
      );

      await act(async () => {
        await result.current.dispatch({
          type: 'TRANSCEND',
        });
      });

      expect(result.current.state?.meta.transcendenceLevel).toBe(2);
    });
  });

  describe('useGlobalDivineState', () => {
    it('should access global divine state', () => {
      const { result } = renderHook(() =>
        useGlobalDivineState<{ count: number }>()
      );

      expect(result.current.state).toBeDefined();
      expect(result.current.dispatch).toBeDefined();
    });
  });

  describe('useDivineSelector', () => {
    it('should select state using selector function', () => {
      const { result } = renderHook(() =>
        useDivineSelector<{ count: number }, number>(
          (state) => state?.value.count || 0
        )
      );

      expect(result.current).toBe(0);
    });
  });

  describe('useDivineTranscendence', () => {
    it('should provide transcendence actions', async () => {
      const { result } = renderHook(() => useDivineTranscendence());

      await act(async () => {
        await result.current.transcend();
      });

      const globalState = renderHook(() =>
        useGlobalDivineState()
      ).result.current;

      expect(globalState.state?.meta.transcendenceLevel).toBeGreaterThan(1);
    });

    it('should handle dimension shifts', async () => {
      const { result } = renderHook(() => useDivineTranscendence());

      await act(async () => {
        await result.current.shiftDimension('quantum');
      });

      const globalState = renderHook(() =>
        useGlobalDivineState()
      ).result.current;

      expect(globalState.state?.meta.dimension).toBe('quantum');
    });

    it('should merge realities', async () => {
      const { result } = renderHook(() => useDivineTranscendence());

      await act(async () => {
        await result.current.mergeReality({ newValue: 42 });
      });

      const globalState = renderHook(() =>
        useGlobalDivineState()
      ).result.current;

      expect(globalState.state?.value.newValue).toBe(42);
    });
  });
});