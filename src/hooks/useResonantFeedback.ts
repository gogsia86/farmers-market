import { useEffect, useRef, useMemo } from 'react';
import { 
  ResonantFeedbackSystem,
  ResonancePattern,
  ResonanceConfig,
  FeedbackState
} from '../lib/feedback/resonant-feedback';
import { useAgriculturalNavigation } from './useAgriculturalNavigation';

export interface UseResonantFeedbackOptions {
  pattern?: ResonancePattern;
  baseHarmony?: number;
  autoSetup?: boolean;
}

export function useResonantFeedback(
  elementId: string,
  options: UseResonantFeedbackOptions = {}
) {
  const {
    pattern = 'RIPPLE',
    baseHarmony = 1,
    autoSetup = true
  } = options;

  const { getCurrentCycle } = useAgriculturalNavigation({
    initialNodes: new Map(),
    initialConsciousness: 1,
    preferredStrategy: 'BALANCED',
    accessibilityLevel: 'DIVINE'
  });

  const elementRef = useRef<HTMLElement | null>(null);
  const feedbackSystemRef = useRef<ResonantFeedbackSystem | null>(null);
  const activeConfigRef = useRef<ResonanceConfig | null>(null);

  // Create feedback system with memoized agricultural cycle
  const feedbackSystem = useMemo(() => {
    const cycle = getCurrentCycle();
    return new ResonantFeedbackSystem(
      baseHarmony,
      cycle.energyLevel
    );
  }, [baseHarmony, getCurrentCycle]);

  // Store feedback system reference
  useEffect(() => {
    feedbackSystemRef.current = feedbackSystem;
  }, [feedbackSystem]);

  // Initialize feedback when ready
  useEffect(() => {
    const element = document.getElementById(elementId);
    if (!element || !autoSetup) return;

    elementRef.current = element;
    const config = feedbackSystem.createResonance(element, pattern);
    activeConfigRef.current = config;

    // Update resonance based on consciousness changes
    const consciousnessInterval = setInterval(() => {
      const cycle = getCurrentCycle();
      feedbackSystem.updateResonance(elementId, cycle.energyLevel);
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(consciousnessInterval);
    };
  }, [elementId, pattern, autoSetup, feedbackSystem, getCurrentCycle]);

  // Expose feedback control methods
  const createFeedback = (
    pattern: ResonancePattern,
    options: Partial<ResonanceConfig> = {}
  ) => {
    const element = elementRef.current;
    if (!element || !feedbackSystemRef.current) return;

    const config = feedbackSystemRef.current.createResonance(
      element,
      pattern,
      options
    );
    activeConfigRef.current = config;
  };

  const updateFeedback = (consciousnessLevel: number) => {
    if (!feedbackSystemRef.current) return;
    feedbackSystemRef.current.updateResonance(elementId, consciousnessLevel);
  };

  const getFeedbackState = (): FeedbackState | null => {
    return feedbackSystemRef.current?.getFeedbackState() || null;
  };

  return {
    createFeedback,
    updateFeedback,
    getFeedbackState
  };
}