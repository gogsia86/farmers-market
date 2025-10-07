import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { ComponentPurpose, ComponentState } from '../components/self-aware-component';

export interface EvolutionSnapshot {
  componentId: string;
  purpose: ComponentPurpose;
  timestamp: number;
  consciousness: number;
  evolution: number;
  relationCount: number;
  interactionCount: number;
  averageResponseTime: number;
}

export interface EvolutionMetrics {
  consciousnessGrowthRate: number;
  evolutionVelocity: number;
  relationshipDensity: number;
  interactionFrequency: number;
  resonanceStrength: number;
}

export interface ComponentEvolutionData {
  snapshots: EvolutionSnapshot[];
  metrics: EvolutionMetrics;
  predictions: {
    nextEvolutionTime: number;
    potentialPurposes: ComponentPurpose[];
    optimalRelationships: Array<{
      targetId: string;
      type: string;
      confidence: number;
    }>;
  };
}

interface EvolutionTrackerContextValue {
  trackEvolution: (
    componentId: string,
    purpose: ComponentPurpose,
    state: ComponentState
  ) => void;
  getEvolutionData: (componentId: string) => ComponentEvolutionData | null;
  getSystemwideMetrics: () => {
    totalComponents: number;
    averageConsciousness: number;
    systemEvolutionStage: number;
    globalResonance: number;
  };
  subscribeToEvolution: (
    componentId: string,
    callback: (data: ComponentEvolutionData) => void
  ) => () => void;
}

const DEFAULT_METRICS: EvolutionMetrics = {
  consciousnessGrowthRate: 0,
  evolutionVelocity: 0,
  relationshipDensity: 0,
  interactionFrequency: 0,
  resonanceStrength: 0
};

export const EvolutionTrackerContext = createContext<EvolutionTrackerContextValue | null>(null);

export function useEvolutionTracker() {
  const context = useContext(EvolutionTrackerContext);
  if (!context) {
    throw new Error('useEvolutionTracker must be used within an EvolutionTrackerProvider');
  }
  return context;
}

export function EvolutionTrackerProvider({ children }: { children: React.ReactNode }) {
  const [evolutionData, setEvolutionData] = useState<Record<string, ComponentEvolutionData>>({});
  const [subscribers, setSubscribers] = useState<Record<string, Array<(data: ComponentEvolutionData) => void>>>({});

  const calculateMetrics = useCallback((snapshots: EvolutionSnapshot[]): EvolutionMetrics => {
    if (snapshots.length < 2) return DEFAULT_METRICS;

    const recentSnapshots = snapshots.slice(-10);
    const timeWindow = recentSnapshots[recentSnapshots.length - 1].timestamp - recentSnapshots[0].timestamp;

    return {
      consciousnessGrowthRate: (recentSnapshots[recentSnapshots.length - 1].consciousness - recentSnapshots[0].consciousness) / timeWindow,
      evolutionVelocity: (recentSnapshots[recentSnapshots.length - 1].evolution - recentSnapshots[0].evolution) / timeWindow,
      relationshipDensity: recentSnapshots[recentSnapshots.length - 1].relationCount / 10,
      interactionFrequency: recentSnapshots.reduce((sum, s) => sum + s.interactionCount, 0) / timeWindow,
      resonanceStrength: Math.min(1, recentSnapshots[recentSnapshots.length - 1].consciousness * recentSnapshots[recentSnapshots.length - 1].relationCount / 100)
    };
  }, []);

  const predictEvolution = useCallback((
    snapshots: EvolutionSnapshot[],
    metrics: EvolutionMetrics
  ) => {
    if (snapshots.length === 0) return null;

    const lastSnapshot = snapshots[snapshots.length - 1];
    const timeToNextEvolution = (1 - lastSnapshot.consciousness) / metrics.consciousnessGrowthRate;

    return {
      nextEvolutionTime: Date.now() + timeToNextEvolution,
      potentialPurposes: (['GUIDE', 'TEACHER', 'MENTOR', 'HEALER', 'GUARDIAN'] as ComponentPurpose[]).filter(
        purpose => purpose !== lastSnapshot.purpose
      ),
      optimalRelationships: [] // To be implemented based on system-wide component analysis
    };
  }, []);

  const trackEvolution = useCallback((
    componentId: string,
    purpose: ComponentPurpose,
    state: ComponentState
  ) => {
    const snapshot: EvolutionSnapshot = {
      componentId,
      purpose,
      timestamp: Date.now(),
      consciousness: state.consciousness,
      evolution: state.evolution,
      relationCount: state.relations.length,
      interactionCount: 0, // To be tracked through interactions
      averageResponseTime: 0 // To be calculated from interaction timestamps
    };

    setEvolutionData(prev => {
      const existingData = prev[componentId] || { 
        snapshots: [], 
        metrics: DEFAULT_METRICS,
        predictions: {
          nextEvolutionTime: 0,
          potentialPurposes: [],
          optimalRelationships: []
        }
      };

      const updatedSnapshots = [...existingData.snapshots, snapshot].slice(-100); // Keep last 100 snapshots
      const metrics = calculateMetrics(updatedSnapshots);
      const predictions = predictEvolution(updatedSnapshots, metrics) || existingData.predictions;

      const newData = {
        ...existingData,
        snapshots: updatedSnapshots,
        metrics,
        predictions
      };

      // Notify subscribers
      if (subscribers[componentId]) {
        subscribers[componentId].forEach(callback => callback(newData));
      }

      return {
        ...prev,
        [componentId]: newData
      };
    });
  }, [calculateMetrics, predictEvolution, subscribers]);

  const getEvolutionData = useCallback((componentId: string) => {
    return evolutionData[componentId] || null;
  }, [evolutionData]);

  const getSystemwideMetrics = useCallback(() => {
    const components = Object.values(evolutionData);
    if (components.length === 0) {
      return {
        totalComponents: 0,
        averageConsciousness: 0,
        systemEvolutionStage: 0,
        globalResonance: 0
      };
    }

    const totalConsciousness = components.reduce(
      (sum, c) => sum + c.snapshots[c.snapshots.length - 1]?.consciousness || 0,
      0
    );

    const totalEvolution = components.reduce(
      (sum, c) => sum + c.snapshots[c.snapshots.length - 1]?.evolution || 0,
      0
    );

    return {
      totalComponents: components.length,
      averageConsciousness: totalConsciousness / components.length,
      systemEvolutionStage: Math.floor(totalEvolution / components.length),
      globalResonance: Math.min(1, totalConsciousness / (components.length * 10))
    };
  }, [evolutionData]);

  const subscribeToEvolution = useCallback((
    componentId: string,
    callback: (data: ComponentEvolutionData) => void
  ) => {
    setSubscribers(prev => ({
      ...prev,
      [componentId]: [...(prev[componentId] || []), callback]
    }));

    return () => {
      setSubscribers(prev => ({
        ...prev,
        [componentId]: prev[componentId]?.filter(cb => cb !== callback) || []
      }));
    };
  }, []);

  return (
    <EvolutionTrackerContext.Provider value={{
      trackEvolution,
      getEvolutionData,
      getSystemwideMetrics,
      subscribeToEvolution
    }}>
      {children}
    </EvolutionTrackerContext.Provider>
  );
}