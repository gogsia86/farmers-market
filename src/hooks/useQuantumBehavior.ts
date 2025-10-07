import { useEffect, useCallback, useState, useRef } from 'react';
import { useBehaviorPrediction, BehaviorType, IntentType } from '../lib/quantum/behavior-prediction';

export interface UseBehaviorTrackingOptions {
  onIntentChange?: (newIntent: IntentType) => void;
  onPredictedBehavior?: (prediction: {
    action: BehaviorType;
    probability: number;
    timing: number;
  }) => void;
  trackableEvents?: BehaviorType[];
  autoOptimize?: boolean;
}

export function useQuantumBehavior(
  componentId: string,
  options: UseBehaviorTrackingOptions = {}
) {
  const {
    onIntentChange,
    onPredictedBehavior,
    trackableEvents = ['CLICK', 'HOVER', 'FOCUS', 'SCROLL'],
    autoOptimize = true
  } = options;

  const behaviorPredictor = useBehaviorPrediction();
  const [currentIntent, setCurrentIntent] = useState<IntentType>('REST');
  const lastEventRef = useRef<number>(0);

  // Track behavior events
  const trackEvent = useCallback((type: BehaviorType, metadata?: Record<string, any>) => {
    const now = Date.now();
    const event = {
      type,
      timestamp: now,
      componentId,
      path: window.location.pathname,
      duration: lastEventRef.current ? now - lastEventRef.current : undefined,
      metadata
    };

    lastEventRef.current = now;
    behaviorPredictor.trackBehavior(event);
  }, [componentId, behaviorPredictor]);

  // Subscribe to pattern changes
  useEffect(() => {
    return behaviorPredictor.subscribeToPatterns(patterns => {
      const componentPatterns = patterns.filter(p =>
        p.events.some(e => e.componentId === componentId)
      );

      if (componentPatterns.length > 0) {
        const dominantIntent = componentPatterns[0].intent;
        if (dominantIntent !== currentIntent) {
          setCurrentIntent(dominantIntent);
          onIntentChange?.(dominantIntent);
        }
      }
    });
  }, [componentId, behaviorPredictor, currentIntent, onIntentChange]);

  // Predict and optimize behavior
  useEffect(() => {
    if (!autoOptimize) return;

    const interval = setInterval(() => {
      const prediction = behaviorPredictor.predictNextBehavior();
      if (prediction && prediction.suggestedComponents.includes(componentId)) {
        onPredictedBehavior?.({
          action: prediction.nextAction,
          probability: prediction.probability,
          timing: prediction.optimalTiming
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [componentId, behaviorPredictor, autoOptimize, onPredictedBehavior]);

  // Create event handlers
  const eventHandlers = trackableEvents.reduce((acc, eventType) => {
    const handlerName = `on${eventType.charAt(0) + eventType.slice(1).toLowerCase()}`;
    acc[handlerName] = (event: any) => {
      trackEvent(eventType, {
        target: event.target.id || event.target.className,
        value: event.target.value
      });
    };
    return acc;
  }, {} as Record<string, (event: any) => void>);

  return {
    trackEvent,
    currentIntent,
    eventHandlers,
    patterns: behaviorPredictor.getPatterns().filter(p =>
      p.events.some(e => e.componentId === componentId)
    )
  };
}