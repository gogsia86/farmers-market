import { useCallback, useEffect, useRef } from 'react';
import {
  useSelfAware,
  ComponentPurpose,
  ComponentRelationType,
  ComponentState
} from '../lib/components/self-aware-component';
import { useConsciousnessResponse } from './useConsciousnessResponse';
import { useBiodynamicTiming } from './useBiodynamicTiming';
import { useResonantFeedback } from './useResonantFeedback';
import { useDivineAnimation } from './useDivineAnimation';

export interface UseSelfAwareComponentOptions {
  purpose: ComponentPurpose;
  initialRelations?: Array<{
    toId: string;
    type: ComponentRelationType;
  }>;
  animationPattern?: 'GROWTH' | 'FLOW' | 'SPIRAL' | 'WAVE' | 'BLOOM';
  feedbackPattern?: 'RIPPLE' | 'PULSE' | 'WAVE' | 'ECHO' | 'GLOW';
}

export interface ComponentBehavior {
  state: ComponentState;
  evolve: () => void;
  createRelation: (toId: string, type: ComponentRelationType) => void;
  handleInteraction: (type: 'TOUCH' | 'HOVER' | 'FOCUS' | 'SCROLL' | 'NAVIGATE') => void;
  getOptimalTiming: (activity: 'PLANTING' | 'GROWING' | 'HARVESTING' | 'RESTING') => Date;
  startAnimation: () => void;
  stopAnimation: () => void;
  pauseAnimation: () => void;
  resumeAnimation: () => void;
}

export function useSelfAwareComponent(
  id: string,
  options: UseSelfAwareComponentOptions
): ComponentBehavior {
  const {
    purpose,
    initialRelations = [],
    animationPattern = 'FLOW',
    feedbackPattern = 'RIPPLE'
  } = options;

  // Initialize core systems
  const selfAware = useSelfAware(id, purpose);
  const consciousness = useConsciousnessResponse();
  const timing = useBiodynamicTiming();
  const feedback = useResonantFeedback(id);
  const animation = useDivineAnimation(id, {
    pattern: animationPattern,
    autoStart: false
  });

  // Store element reference
  const elementRef = useRef<HTMLElement | null>(null);

  // Set up initial relations
  useEffect(() => {
    initialRelations.forEach(relation => {
      selfAware.createRelation(relation.toId, relation.type);
    });
  }, []);

  // Handle interactions with consciousness
  const handleInteraction = useCallback((
    type: 'TOUCH' | 'HOVER' | 'FOCUS' | 'SCROLL' | 'NAVIGATE'
  ) => {
    if (!elementRef.current) return;

    // Create conscious interaction
    consciousness.handleInteraction(type, elementRef.current);

    // Generate resonant feedback
    feedback.createFeedback(feedbackPattern);

    // Evolve component
    selfAware.evolve();
  }, [consciousness, feedback, selfAware]);

  // Get optimal timing based on biodynamic cycles
  const getOptimalTiming = useCallback((
    activity: 'PLANTING' | 'GROWING' | 'HARVESTING' | 'RESTING'
  ): Date => {
    return timing.getOptimalTiming(activity, 3600000); // 1 hour duration
  }, [timing]);

  return {
    state: selfAware.state,
    evolve: selfAware.evolve,
    createRelation: selfAware.createRelation,
    handleInteraction,
    getOptimalTiming,
    startAnimation: animation.startAnimation,
    stopAnimation: animation.stopAnimation,
    pauseAnimation: animation.pauseAnimation,
    resumeAnimation: animation.resumeAnimation
  };
}