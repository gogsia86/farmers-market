import { useState, useEffect, useMemo } from 'react';
import { useQuantumContextProvider } from '../context/QuantumContextProvider';
import { EnergyFieldHarmonizer, EnergyFieldMetrics, HarmonizationResult } from '../lib/energyFieldHarmonizer';

export interface UseEnergyFieldHarmonizationOptions {
  minVibration?: number;
  targetHarmony?: number;
  flowThreshold?: number;
  stabilityMargin?: number;
  autoOptimize?: boolean;
}

export const useEnergyFieldHarmonization = (
  initialMetrics: EnergyFieldMetrics,
  options: UseEnergyFieldHarmonizationOptions = {}
) => {
  const { recentObservations } = useQuantumContextProvider();
  const [currentMetrics, setCurrentMetrics] = useState<EnergyFieldMetrics>(initialMetrics);
  const [harmonizationResult, setHarmonizationResult] = useState<HarmonizationResult | null>(null);

  const harmonizer = useMemo(() => new EnergyFieldHarmonizer({
    minVibration: options.minVibration ?? 0.7,
    targetHarmony: options.targetHarmony ?? 0.85,
    flowThreshold: options.flowThreshold ?? 0.75,
    stabilityMargin: options.stabilityMargin ?? 0.1
  }), [options]);

  useEffect(() => {
    // Analyze current energy field state
    const result = harmonizer.analyzeField(recentObservations, currentMetrics);
    setHarmonizationResult(result);

    // Auto-optimize if enabled
    if (options.autoOptimize) {
      setCurrentMetrics(result.metrics);
    }
  }, [recentObservations, currentMetrics, harmonizer, options.autoOptimize]);

  // Get field trends
  const trends = useMemo(() => harmonizer.getFieldTrends(), [harmonizer]);

  return {
    currentMetrics,
    harmonizationResult,
    trends,
    updateMetrics: (newMetrics: Partial<EnergyFieldMetrics>) => {
      setCurrentMetrics(prev => ({
        ...prev,
        ...newMetrics
      }));
    }
  };
};