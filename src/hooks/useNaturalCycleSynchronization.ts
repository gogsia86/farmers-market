import { useCallback, useEffect, useState } from 'react';
import { NaturalCycleSynchronizer, CycleMetrics, CycleSynchronization, NaturalCycle } from '../lib/naturalCycleSynchronizer';
import { useFieldResonance } from './useFieldResonance';
import { useEnergyFlow } from './useEnergyFlow';
import { useQuantumState } from './useQuantumState';

export interface NaturalCycleHookResult {
  cycles: Map<string, NaturalCycle>;
  synchronizations: Map<string, CycleSynchronization>;
  metrics: CycleMetrics | null;
  updateCycles: () => void;
}

export function useNaturalCycleSynchronization(
  fieldDimensions: { width: number; height: number },
  resolution: number = 1
): NaturalCycleHookResult {
  const { patterns } = useFieldResonance(fieldDimensions, resolution);
  const { flows } = useEnergyFlow(fieldDimensions, resolution);
  const { quantumState } = useQuantumState();

  const [synchronizer, setSynchronizer] = useState<NaturalCycleSynchronizer | null>(null);
  const [cycles, setCycles] = useState<Map<string, NaturalCycle>>(new Map());
  const [synchronizations, setSynchronizations] = useState<Map<string, CycleSynchronization>>(new Map());
  const [metrics, setMetrics] = useState<CycleMetrics | null>(null);

  useEffect(() => {
    if (!quantumState) return;
    // Create synchronizer instance
    const fieldResonance = require('../lib/fieldResonanceTracker');
    const energyFlow = require('../lib/energyFlowOptimizer');
    const sync = new NaturalCycleSynchronizer(fieldResonance, energyFlow, quantumState);
    setSynchronizer(sync);
  }, [quantumState]);

  const updateCycles = useCallback(() => {
    if (!synchronizer) return;
    setCycles(synchronizer.getCycles());
    setSynchronizations(synchronizer.synchronizeCycles());
    setMetrics(synchronizer.analyzeCycles());
  }, [synchronizer]);

  useEffect(() => {
    updateCycles();
    const interval = setInterval(updateCycles, 5000);
    return () => clearInterval(interval);
  }, [updateCycles]);

  return {
    cycles,
    synchronizations,
    metrics,
    updateCycles
  };
}