import { useEffect, useState, useRef } from 'react';
import { RealityResponsiveCore, RealityState } from '../lib/realityFramework';

const realityCoreSingleton = new RealityResponsiveCore();

export const useRealityState = () => {
  const [state, setState] = useState<RealityState>(realityCoreSingleton.getCurrentState());
  const unsubscribeRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    unsubscribeRef.current = realityCoreSingleton.subscribe(setState);
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  const setRealityState = (update: Partial<RealityState>) => {
    realityCoreSingleton.setRealityState(update);
  };

  const triggerRealityShift = (params?: Partial<RealityState>) => {
    realityCoreSingleton.triggerRealityShift(params);
  };

  return {
    realityState: state,
    setRealityState,
    triggerRealityShift,
  };
};
