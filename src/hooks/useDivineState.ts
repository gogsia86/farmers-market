import { useState, useEffect, useCallback, useMemo } from 'react';
import { DivineStateManager, DivineState, DivineAction } from '../lib/divineStateManager';

// Global divine state manager instance
const globalDivineManager = new DivineStateManager<Record<string, any>>({}, {
  transcendenceLevel: 1,
  autoSync: true,
  persistenceMode: 'quantum'
});

export function useDivineState<T>(initialState: T) {
  const [state, setState] = useState<DivineState<T>>();
  const [isTranscending, setIsTranscending] = useState(false);

  const divineManager = useMemo(() => {
    return new DivineStateManager(initialState);
  }, []);

  useEffect(() => {
    const unsubscribe = divineManager.subscribe((newState) => {
      setState(newState);
    });

    return () => unsubscribe();
  }, [divineManager]);

  const dispatch = useCallback(async (action: DivineAction) => {
    if (action.type === 'TRANSCEND') {
      setIsTranscending(true);
    }
    const result = await divineManager.dispatch(action);
    if (action.type === 'TRANSCEND') {
      setIsTranscending(false);
    }
    return result;
  }, [divineManager]);

  return {
    state,
    dispatch,
    isTranscending,
    history: divineManager.getHistory(),
  };
}

export function useGlobalDivineState<T extends Record<string, any>>() {
  const [state, setState] = useState<DivineState<T>>();

  useEffect(() => {
    const unsubscribe = globalDivineManager.subscribe((newState) => {
      setState(newState as DivineState<T>);
    });

    return () => unsubscribe();
  }, []);

  return {
    state,
    dispatch: globalDivineManager.dispatch.bind(globalDivineManager),
    history: globalDivineManager.getHistory(),
  };
}

export function useDivineSelector<T extends Record<string, any>, S>(selector: (state: DivineState<T>) => S) {
  const { state } = useGlobalDivineState<T>();
  return selector(state!);
}

export function useDivineEffect(
  effect: (state: DivineState) => void | Promise<void>,
  dependencies: any[] = []
) {
  const { state } = useGlobalDivineState();

  useEffect(() => {
    if (state) {
      const result = effect(state);
      if (result instanceof Promise) {
        result.catch(console.error);
      }
    }
  }, [state, ...dependencies]);
}

export function useDivineTranscendence() {
  const { dispatch } = useGlobalDivineState();

  const transcend = useCallback(async () => {
    return dispatch({
      type: 'TRANSCEND',
      meta: {
        intentionPurity: 1,
      },
    });
  }, [dispatch]);

  const shiftDimension = useCallback(async (dimension: string) => {
    return dispatch({
      type: 'SHIFT_DIMENSION',
      payload: dimension,
      meta: {
        intentionPurity: 0.9,
      },
    });
  }, [dispatch]);

  const mergeReality = useCallback(async (reality: any) => {
    return dispatch({
      type: 'MERGE_REALITY',
      payload: reality,
      meta: {
        intentionPurity: 0.8,
      },
    });
  }, [dispatch]);

  return {
    transcend,
    shiftDimension,
    mergeReality,
  };
}