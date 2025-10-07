import { useEffect, useRef, useMemo } from 'react';
import { 
  DivineAnimationSystem,
  NaturalPattern,
  NaturalMotion,
} from '../lib/animation/divine-animation';
import { useAgriculturalNavigation } from './useAgriculturalNavigation';
import type { AgriculturalCycle } from '../types/agricultural-types';

export interface UseDivineAnimationOptions {
  pattern?: NaturalPattern;
  duration?: number;
  consciousnessLevel?: number;
  autoStart?: boolean;
}

export function useDivineAnimation(
  elementId: string,
  options: UseDivineAnimationOptions = {}
) {
  const {
    pattern = 'FLOW',
    duration,
    consciousnessLevel = 1,
    autoStart = true
  } = options;

  const { getCurrentCycle } = useAgriculturalNavigation({
    initialNodes: new Map(),
    initialConsciousness: 1,
    preferredStrategy: 'BALANCED',
    accessibilityLevel: 'DIVINE'
  });
  const agriculturalCycle = getCurrentCycle();
  const elementRef = useRef<HTMLElement | null>(null);
  const animationSystemRef = useRef<DivineAnimationSystem | null>(null);
  const activeAnimationRef = useRef<NaturalMotion | null>(null);

  // Create animation system with memoized agricultural cycle
  const animationSystem = useMemo(() => {
    return new DivineAnimationSystem(agriculturalCycle, consciousnessLevel);
  }, [agriculturalCycle, consciousnessLevel]);

  // Store animation system reference
  useEffect(() => {
    animationSystemRef.current = animationSystem;
  }, [animationSystem]);

  // Initialize animation when ready
  useEffect(() => {
    const element = document.getElementById(elementId);
    if (!element || !autoStart) return;

    elementRef.current = element;
    const motion = animationSystem.createNaturalMotion(element, pattern, {
      duration
    });
    activeAnimationRef.current = motion;

    // Update animations on seasonal changes
    const seasonalInterval = setInterval(() => {
      animationSystem.updateSeasonalAnimations();
    }, 60000); // Check every minute

    return () => {
      clearInterval(seasonalInterval);
    };
  }, [elementId, pattern, duration, autoStart, animationSystem]);

  // Expose animation control methods
  const startAnimation = () => {
    const element = elementRef.current;
    if (!element || !animationSystemRef.current) return;

    const motion = animationSystemRef.current.createNaturalMotion(
      element,
      pattern,
      { duration }
    );
    activeAnimationRef.current = motion;
  };

  const stopAnimation = () => {
    const element = elementRef.current;
    if (!element) return;

    element.getAnimations().forEach((animation: Animation) => animation.cancel());
    activeAnimationRef.current = null;
  };

  const pauseAnimation = () => {
    const element = elementRef.current;
    if (!element) return;

    element.getAnimations().forEach((animation: Animation) => animation.pause());
  };

  const resumeAnimation = () => {
    const element = elementRef.current;
    if (!element) return;

    element.getAnimations().forEach((animation: Animation) => animation.play());
  };

  const changePattern = (newPattern: NaturalPattern) => {
    const element = elementRef.current;
    if (!element || !animationSystemRef.current) return;

    stopAnimation();
    const motion = animationSystemRef.current.createNaturalMotion(
      element,
      newPattern,
      { duration }
    );
    activeAnimationRef.current = motion;
  };

  return {
    startAnimation,
    stopAnimation,
    pauseAnimation,
    resumeAnimation,
    changePattern,
    getAnimationState: () => animationSystemRef.current?.getAnimationState()
  };
}