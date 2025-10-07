import { useState, useEffect } from 'react';
import { useQuantumContextProvider } from '../context/QuantumContextProvider';
import { calculateQuantumSignificance } from '../lib/quantumCalculations';
import {
  CelestialAlignmentSystem,
  CelestialInfluence,
  CelestialBody,
  AstronomicalEvent
} from '../lib/celestialAlignmentSystem';

export interface UseCelestialAlignmentResult {
  celestialInfluence: CelestialInfluence;
  celestialBodies: Map<string, CelestialBody>;
  upcomingEvents: AstronomicalEvent[];
  isOptimalTime: (activity: 'planting' | 'harvesting' | 'maintenance') => boolean;
  getNextOptimalTime: (activity: 'planting' | 'harvesting' | 'maintenance') => Date | null;
}

export const useCelestialAlignment = (
  updateInterval: number = 60000 // 1 minute default
): UseCelestialAlignmentResult => {
  const { recentObservations } = useQuantumContextProvider();
  const [alignmentSystem] = useState(() => new CelestialAlignmentSystem());
  const [celestialInfluence, setCelestialInfluence] = useState<CelestialInfluence | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<AstronomicalEvent[]>([]);

  useEffect(() => {
    const updateAlignment = () => {
      const significance = calculateQuantumSignificance(recentObservations);
      const influence = alignmentSystem.calculateAlignment(significance);
      setCelestialInfluence(influence);
      setUpcomingEvents(alignmentSystem.getUpcomingEvents());
    };

    // Initial update
    updateAlignment();

    // Set up periodic updates
    const intervalId = setInterval(updateAlignment, updateInterval);
    return () => clearInterval(intervalId);
  }, [alignmentSystem, recentObservations, updateInterval]);

  const isOptimalTime = (activity: 'planting' | 'harvesting' | 'maintenance'): boolean => {
    if (!celestialInfluence) return false;

    const { growth, vitality, resonance } = celestialInfluence;
    switch (activity) {
      case 'planting':
        return growth > 0.7 && resonance > 0.6;
      case 'harvesting':
        return vitality > 0.7 && resonance > 0.6;
      case 'maintenance':
        return resonance > 0.7;
      default:
        return false;
    }
  };

  const getNextOptimalTime = (activity: 'planting' | 'harvesting' | 'maintenance'): Date | null => {
    if (!upcomingEvents.length) return null;

    // Find the next event that will create optimal conditions
    const optimalEvent = upcomingEvents.find(event => {
      switch (activity) {
        case 'planting':
          return event.significance > 0.7 && event.type === 'phase';
        case 'harvesting':
          return event.significance > 0.7 && ['opposition', 'conjunction'].includes(event.type);
        case 'maintenance':
          return event.significance > 0.6;
      }
    });

    return optimalEvent ? new Date(optimalEvent.timestamp) : null;
  };

  if (!celestialInfluence) {
    return {
      celestialInfluence: {
        overall: 0,
        growth: 0,
        vitality: 0,
        resonance: 0,
        primaryBody: '',
        activeEvents: []
      },
      celestialBodies: new Map(),
      upcomingEvents: [],
      isOptimalTime,
      getNextOptimalTime
    };
  }

  return {
    celestialInfluence,
    celestialBodies: alignmentSystem.getCelestialBodies(),
    upcomingEvents,
    isOptimalTime,
    getNextOptimalTime
  };
};