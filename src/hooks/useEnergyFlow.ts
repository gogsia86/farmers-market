import { useCallback, useEffect, useState } from 'react';
import { EnergyFlowOptimizer, SystemMetrics, EnergyFlow, FlowOptimization } from '../lib/energyFlowOptimizer';
import { useFieldResonance } from './useFieldResonance';
import { useQuantumState } from './useQuantumState';

export interface EnergyFlowHookResult {
  flows: Map<string, EnergyFlow>;
  optimizations: Map<string, FlowOptimization>;
  metrics: SystemMetrics | null;
  updateFlows: () => void;
}

export function useEnergyFlow(
  fieldDimensions: { width: number; height: number },
  resolution: number = 1
): EnergyFlowHookResult {
  const [optimizer] = useState(() => new EnergyFlowOptimizer(fieldDimensions, resolution));
  const [flows, setFlows] = useState<Map<string, EnergyFlow>>(new Map());
  const [optimizations, setOptimizations] = useState<Map<string, FlowOptimization>>(new Map());
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);

  const { patterns } = useFieldResonance(fieldDimensions, resolution);
  const { quantumState } = useQuantumState();

  const updateFlows = useCallback(() => {
    if (!quantumState) return;

    // Initialize flows based on resonance patterns
    optimizer.initializeFlows(patterns, quantumState);
    setFlows(optimizer.getFlows());

    // Calculate optimizations
    const newOptimizations = optimizer.optimizeFlows(quantumState);
    setOptimizations(newOptimizations);

    // Update system metrics
    const newMetrics = optimizer.analyzeSystem();
    setMetrics(newMetrics);
  }, [optimizer, patterns, quantumState]);

  useEffect(() => {
    updateFlows();

    // Update flows periodically to maintain optimization
    const interval = setInterval(updateFlows, 5000);
    return () => clearInterval(interval);
  }, [updateFlows]);

  return {
    flows,
    optimizations,
    metrics,
    updateFlows
  };
}