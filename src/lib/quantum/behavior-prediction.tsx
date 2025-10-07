import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useEvolutionTracker } from '../evolution/evolution-tracker';

export type BehaviorType = 
  | 'NAVIGATION'
  | 'INTERACTION'
  | 'FOCUS'
  | 'SCROLL'
  | 'HOVER'
  | 'CLICK'
  | 'INPUT'
  | 'SELECTION';

export type IntentType =
  | 'EXPLORE'
  | 'LEARN'
  | 'CREATE'
  | 'ANALYZE'
  | 'CONNECT'
  | 'TRANSFORM'
  | 'HARVEST'
  | 'REST';

export interface BehaviorEvent {
  type: BehaviorType;
  timestamp: number;
  componentId?: string;
  path: string;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface BehaviorPattern {
  events: BehaviorEvent[];
  frequency: number;
  confidence: number;
  intent: IntentType;
  consciousness: number;
}

export interface PredictedBehavior {
  nextAction: BehaviorType;
  probability: number;
  intent: IntentType;
  suggestedComponents: string[];
  optimalTiming: number;
}

interface BehaviorContextValue {
  trackBehavior: (event: BehaviorEvent) => void;
  predictNextBehavior: () => PredictedBehavior | null;
  getPatterns: () => BehaviorPattern[];
  subscribeToPatterns: (callback: (patterns: BehaviorPattern[]) => void) => () => void;
}

export const BehaviorContext = createContext<BehaviorContextValue | null>(null);

export function useBehaviorPrediction() {
  const context = useContext(BehaviorContext);
  if (!context) {
    throw new Error('useBehaviorPrediction must be used within a BehaviorPredictionProvider');
  }
  return context;
}

const PATTERN_WINDOW = 1000 * 60 * 5; // 5 minutes
const MIN_PATTERN_CONFIDENCE = 0.6;
const MAX_PATTERNS = 100;

export function BehaviorPredictionProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<BehaviorEvent[]>([]);
  const [patterns, setPatterns] = useState<BehaviorPattern[]>([]);
  const [subscribers, setSubscribers] = useState<Array<(patterns: BehaviorPattern[]) => void>>([]);
  const evolutionTracker = useEvolutionTracker();

  const identifyPatterns = useCallback((recentEvents: BehaviorEvent[]) => {
    if (recentEvents.length < 2) return [];

    const newPatterns: BehaviorPattern[] = [];
    const sequences: Record<string, number> = {};

    // Analyze event sequences
    for (let i = 0; i < recentEvents.length - 1; i++) {
      const sequence = `${recentEvents[i].type}>${recentEvents[i + 1].type}`;
      sequences[sequence] = (sequences[sequence] || 0) + 1;
    }

    // Convert sequences to patterns
    Object.entries(sequences).forEach(([sequence, count]) => {
      const [firstType, secondType] = sequence.split('>');
      const frequency = count / (recentEvents.length - 1);
      
      if (frequency >= MIN_PATTERN_CONFIDENCE) {
        const relatedEvents = recentEvents.filter(
          e => e.type === firstType || e.type === secondType
        );

        const pattern: BehaviorPattern = {
          events: relatedEvents,
          frequency,
          confidence: Math.min(1, frequency * 1.5),
          intent: determineIntent(relatedEvents),
          consciousness: calculateConsciousness(relatedEvents)
        };

        newPatterns.push(pattern);
      }
    });

    return newPatterns.sort((a, b) => b.confidence - a.confidence).slice(0, MAX_PATTERNS);
  }, []);

  const determineIntent = useCallback((events: BehaviorEvent[]): IntentType => {
    const typeCount: Record<BehaviorType, number> = {
      NAVIGATION: 0,
      INTERACTION: 0,
      FOCUS: 0,
      SCROLL: 0,
      HOVER: 0,
      CLICK: 0,
      INPUT: 0,
      SELECTION: 0
    };

    events.forEach(e => typeCount[e.type]++);

    if (typeCount.NAVIGATION > typeCount.INTERACTION) return 'EXPLORE';
    if (typeCount.FOCUS > typeCount.HOVER) return 'LEARN';
    if (typeCount.INPUT > typeCount.CLICK) return 'CREATE';
    if (typeCount.SCROLL > typeCount.HOVER) return 'ANALYZE';
    if (typeCount.INTERACTION > typeCount.NAVIGATION) return 'CONNECT';
    if (typeCount.SELECTION > typeCount.SCROLL) return 'HARVEST';
    if (typeCount.HOVER > typeCount.CLICK) return 'TRANSFORM';
    return 'REST';
  }, []);

  const calculateConsciousness = useCallback((events: BehaviorEvent[]): number => {
    if (events.length === 0) return 0;

    const metrics = evolutionTracker.getSystemwideMetrics();
    const baseConsciousness = metrics.averageConsciousness;

    // Adjust consciousness based on interaction patterns
    const intentionalActions = events.filter(e => 
      e.type === 'FOCUS' || e.type === 'INPUT' || e.type === 'SELECTION'
    ).length;

    const consciousnessModifier = intentionalActions / events.length;
    return Math.min(1, baseConsciousness * (1 + consciousnessModifier));
  }, [evolutionTracker]);

  const trackBehavior = useCallback((event: BehaviorEvent) => {
    setEvents(prev => {
      const now = Date.now();
      const recentEvents = [...prev.filter(e => now - e.timestamp < PATTERN_WINDOW), event];
      const newPatterns = identifyPatterns(recentEvents);
      
      setPatterns(newPatterns);
      subscribers.forEach(callback => callback(newPatterns));

      return recentEvents;
    });
  }, [identifyPatterns, subscribers]);

  const predictNextBehavior = useCallback((): PredictedBehavior | null => {
    if (patterns.length === 0 || events.length === 0) return null;

    const lastEvent = events[events.length - 1];
    const relevantPatterns = patterns.filter(p => 
      p.events.some(e => e.type === lastEvent.type)
    );

    if (relevantPatterns.length === 0) return null;

    const mostLikelyPattern = relevantPatterns[0];
    const lastEventInPattern = mostLikelyPattern.events.findIndex(
      e => e.type === lastEvent.type
    );

    if (lastEventInPattern === -1 || lastEventInPattern === mostLikelyPattern.events.length - 1) {
      return null;
    }

    const nextEvent = mostLikelyPattern.events[lastEventInPattern + 1];

    return {
      nextAction: nextEvent.type,
      probability: mostLikelyPattern.confidence,
      intent: mostLikelyPattern.intent,
      suggestedComponents: mostLikelyPattern.events
        .filter(e => e.componentId)
        .map(e => e.componentId!) || [],
      optimalTiming: Date.now() + 1000 // Predict action within next second
    };
  }, [patterns, events]);

  const getPatterns = useCallback(() => patterns, [patterns]);

  const subscribeToPatterns = useCallback((callback: (patterns: BehaviorPattern[]) => void) => {
    setSubscribers(prev => [...prev, callback]);
    return () => {
      setSubscribers(prev => prev.filter(cb => cb !== callback));
    };
  }, []);

  return (
    <BehaviorContext.Provider value={{
      trackBehavior,
      predictNextBehavior,
      getPatterns,
      subscribeToPatterns
    }}>
      {children}
    </BehaviorContext.Provider>
  );
}