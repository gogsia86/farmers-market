import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import {
  ConsciousnessResponseSystem,
  ConsciousnessState,
  InteractionContext,
  ResponseConfig,
  InteractionType
} from '../lib/consciousness/consciousness-response';

export interface UseConsciousnessResponseOptions {
  initialConsciousness?: number;
  sensitivityThreshold?: number;
  evolutionRate?: number;
}

export function useConsciousnessResponse(
  options: UseConsciousnessResponseOptions = {}
) {
  const {
    initialConsciousness = 0.5,
    sensitivityThreshold = 0.7,
    evolutionRate = 0.1
  } = options;

  // Create consciousness system
  const consciousnessSystem = useMemo(() => {
    return new ConsciousnessResponseSystem(
      initialConsciousness,
      sensitivityThreshold,
      evolutionRate
    );
  }, [initialConsciousness, sensitivityThreshold, evolutionRate]);

  // Store system reference
  const systemRef = useRef(consciousnessSystem);
  useEffect(() => {
    systemRef.current = consciousnessSystem;
  }, [consciousnessSystem]);

  // Store consciousness state
  const [state, setState] = useState<ConsciousnessState>(
    consciousnessSystem.getConsciousnessState()
  );

  // Subscribe to responses
  useEffect(() => {
    const id = `consciousness-${Math.random()}`;
    const updateState = () => {
      setState(systemRef.current.getConsciousnessState());
    };

    consciousnessSystem.subscribeToResponses(id, () => {
      updateState();
    });

    return () => {
      consciousnessSystem.unsubscribeFromResponses(id);
    };
  }, [consciousnessSystem]);

  // Handle interactions
  const handleInteraction = useCallback((
    type: InteractionType,
    element: HTMLElement,
    options: {
      duration?: number;
      intensity?: number;
      intentionality?: number;
    } = {}
  ): ResponseConfig => {
    const context: InteractionContext = {
      type,
      element,
      ...options
    };

    return systemRef.current.handleInteraction(context);
  }, []);

  // Create interaction handlers
  const createTouchHandler = useCallback((element: HTMLElement) => {
    return (event: TouchEvent | MouseEvent) => {
      handleInteraction('TOUCH', element, {
        intensity: 1,
        intentionality: 1
      });
    };
  }, [handleInteraction]);

  const createHoverHandler = useCallback((element: HTMLElement) => {
    let hoverStartTime = 0;

    return {
      onMouseEnter: () => {
        hoverStartTime = Date.now();
        handleInteraction('HOVER', element, {
          intensity: 0.6,
          intentionality: 0.7
        });
      },
      onMouseLeave: () => {
        const duration = (Date.now() - hoverStartTime) / 1000;
        handleInteraction('HOVER', element, {
          duration,
          intensity: 0.4,
          intentionality: 0.5
        });
      }
    };
  }, [handleInteraction]);

  const createFocusHandler = useCallback((element: HTMLElement) => {
    let focusStartTime = 0;

    return {
      onFocus: () => {
        focusStartTime = Date.now();
        handleInteraction('FOCUS', element, {
          intensity: 0.8,
          intentionality: 0.9
        });
      },
      onBlur: () => {
        const duration = (Date.now() - focusStartTime) / 1000;
        handleInteraction('FOCUS', element, {
          duration,
          intensity: 0.6,
          intentionality: 0.7
        });
      }
    };
  }, [handleInteraction]);

  const handleScroll = useCallback((element: HTMLElement) => {
    let lastScrollTime = Date.now();
    let scrollIntensity = 0;

    return () => {
      const currentTime = Date.now();
      const timeDelta = (currentTime - lastScrollTime) / 1000;
      scrollIntensity = Math.min(1, scrollIntensity + timeDelta * 0.5);

      handleInteraction('SCROLL', element, {
        duration: timeDelta,
        intensity: scrollIntensity,
        intentionality: 0.6
      });

      lastScrollTime = currentTime;
    };
  }, [handleInteraction]);

  const handleNavigation = useCallback((
    element: HTMLElement,
    intentionality: number = 0.8
  ) => {
    handleInteraction('NAVIGATE', element, {
      intensity: 0.9,
      intentionality
    });
  }, [handleInteraction]);

  // Format consciousness state for display
  const getFormattedState = useCallback((state: ConsciousnessState): string => {
    return `Consciousness Level: ${state.level}
Energy: ${Math.round(state.energy * 100)}%
Resonance: ${Math.round(state.resonance * 100)}%
Harmony: ${Math.round(state.harmony * 100)}%
Awareness: ${Math.round(state.awareness * 100)}%`;
  }, []);

  return {
    state,
    handleInteraction,
    createTouchHandler,
    createHoverHandler,
    createFocusHandler,
    handleScroll,
    handleNavigation,
    getFormattedState
  };
}