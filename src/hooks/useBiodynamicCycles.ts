import { useState, useEffect, useMemo } from 'react';
import { useQuantumContextProvider } from '../context/QuantumContextProvider';
import { BiodynamicCycleTracker, BiodynamicState, NaturalCycle, BiodynamicPhase } from '../lib/biodynamicCycleTracker';
import { calculateQuantumSignificance } from '../lib/quantumCalculations';

export interface UseBiodynamicCyclesResult {
  currentState: BiodynamicState;
  currentPhase: BiodynamicPhase;
  cycles: NaturalCycle[];
  getOptimalTimes: (activityType: 'planting' | 'harvesting' | 'maintenance') => Date[];
  isFavorableTime: (activityType: 'planting' | 'harvesting' | 'maintenance') => boolean;
}

export const useBiodynamicCycles = (): UseBiodynamicCyclesResult => {
  const { recentObservations } = useQuantumContextProvider();
  const [biodynamicState, setBiodynamicState] = useState<BiodynamicState | null>(null);
  const [currentPhase, setCurrentPhase] = useState<BiodynamicPhase | null>(null);
  const [cycles, setCycles] = useState<NaturalCycle[]>([]);

  const cycleTracker = useMemo(() => new BiodynamicCycleTracker(), []);

  useEffect(() => {
    // Update the cycle tracker with latest quantum observations
    const significance = calculateQuantumSignificance(recentObservations);
    cycleTracker.updateState(significance);

    // Update local state
    setBiodynamicState(cycleTracker.getCurrentState());
    setCurrentPhase(cycleTracker.getCurrentPhase());
    setCycles(cycleTracker.getCycles());

    // Set up periodic updates
    const updateInterval = setInterval(() => {
      cycleTracker.updateState(calculateQuantumSignificance(recentObservations));
      setBiodynamicState(cycleTracker.getCurrentState());
      setCurrentPhase(cycleTracker.getCurrentPhase());
      setCycles(cycleTracker.getCycles());
    }, 15 * 60 * 1000); // Update every 15 minutes

    return () => clearInterval(updateInterval);
  }, [cycleTracker, recentObservations]);

  const isFavorableTime = (activityType: 'planting' | 'harvesting' | 'maintenance'): boolean => {
    if (!biodynamicState) return false;

    switch (activityType) {
      case 'planting':
        return biodynamicState.plantingQuality > 0.7;
      case 'harvesting':
        return biodynamicState.harvestingQuality > 0.7;
      case 'maintenance':
        return currentPhase?.type === 'leaf' || currentPhase?.type === 'root';
    }
  };

  // Only return when we have all the necessary data
  if (!biodynamicState || !currentPhase || !cycles.length) {
    return {
      currentState: {
        moonPhase: 0,
        zodiacPosition: '',
        elementalInfluence: { earth: 0, water: 0, air: 0, fire: 0 },
        plantingQuality: 0,
        harvestingQuality: 0
      },
      currentPhase: { type: 'root', strength: 0, duration: 0 },
      cycles: [],
      getOptimalTimes: () => [],
      isFavorableTime: () => false
    };
  }

  return {
    currentState: biodynamicState,
    currentPhase,
    cycles,
    getOptimalTimes: cycleTracker.getOptimalTimes.bind(cycleTracker),
    isFavorableTime
  };
};