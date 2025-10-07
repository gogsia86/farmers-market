import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useQuantumContextSensing, QuantumContext } from '../hooks/useQuantumContextSensing';
import { QuantumContextObserver, ContextObservation } from '../lib/quantumContextObserver';
import { QuantumCacheManager } from '../lib/quantumCacheManager';
import { DimensionalScaling } from '../lib/dimensionalScaling';
import { RealityShiftHandler } from '../lib/realityShiftHandler';
import { useConsciousnessAwareLoading, ConsciousnessLevel } from '../lib/consciousnessAwareLoader';
import { useEnergyFieldTracking } from '../lib/energyFieldTracker';
import { useQuantumResonanceMonitoring } from '../lib/quantumResonanceMonitor';
import { useQuantumStateValidation } from '../lib/quantumStateValidator';
import { useDivinePerformanceMonitoring } from '../lib/divinePerformanceMonitor';

interface QuantumContextProviderState {
  currentContext: QuantumContext;
  recentObservations: ContextObservation[];
  statistics: {
    averageSignificance: number;
    maxSignificance: number;
    minSignificance: number;
    observationCount: number;
    timeSpan: number;
  } | null;
}

interface QuantumContextProviderProps {
  children: React.ReactNode;
  observerConfig?: Partial<{
    maxObservations: number;
    significanceThreshold: number;
    timeWindow: number;
  }>;
  sensorConfig?: Parameters<typeof useQuantumContextSensing>[0];
}

const QuantumContextProviderContext = createContext<QuantumContextProviderState | null>(null);

export const QuantumContextProvider: React.FC<QuantumContextProviderProps> = ({
  children,
  observerConfig,
  sensorConfig,
}) => {
  const { quantumContext } = useQuantumContextSensing(sensorConfig);
  const observer = useMemo(() => new QuantumContextObserver(observerConfig), []);
  const cache = useMemo(() => new QuantumCacheManager(), []);
  const scaling = useMemo(() => new DimensionalScaling(), []);
  const realityShift = useMemo(() => new RealityShiftHandler(), []);
  
  const lastRenderTime = useRef(performance.now());
  const lastQuantumContext = useRef<QuantumContext>(quantumContext);

  const initialConsciousness: ConsciousnessLevel = {
    awareness: 0.8,
    receptivity: 0.7,
    coherence: 0.9,
    attentionSpan: 30000 // 30 seconds
  };

  const { loader: consciousnessLoader, metrics: loadingMetrics, updateConsciousness } = 
    useConsciousnessAwareLoading(initialConsciousness);

  const { metrics: energyMetrics, tracker: energyTracker } = useEnergyFieldTracking({
    samplingRate: 60,
    resolutionScale: 8,
    sensitivityThreshold: 0.15,
    harmonicAnalysis: true,
    dimensionalMapping: true
  });

  const { metrics: resonanceMetrics, monitor: resonanceMonitor } = useQuantumResonanceMonitoring({
    baseFrequency: 432,
    samplingRate: 60,
    coherenceThreshold: 0.7,
    harmonicSensitivity: 0.85,
    dimensionalDepth: 7
  });

  const { metrics: validationMetrics, validator: stateValidator } = useQuantumStateValidation({
    autoRepair: true,
    validationFrequency: 1,
    integrityThreshold: 0.85,
    repairAttempts: 3,
    dimensionalTolerance: 0.1
  });

  const { metrics: divineMetrics, updateMetrics: updateDivineMetrics } = useDivinePerformanceMonitoring({
    snapshotInterval: 1000,
    retentionPeriod: 3600000,
    analysisDepth: 100,
    adaptiveThreshold: true
  });

  // Update divine metrics when component metrics change
  useEffect(() => {
    updateDivineMetrics(energyMetrics, resonanceMetrics, validationMetrics);
  }, [energyMetrics, resonanceMetrics, validationMetrics, updateDivineMetrics]);
  
  // Monitor render performance and handle reality shifts
  useEffect(() => {
    const currentTime = performance.now();
    const renderDuration = currentTime - lastRenderTime.current;
    scaling.updateRenderMetrics(renderDuration);
    lastRenderTime.current = currentTime;
  });

  useEffect(() => {
    observer.observe(quantumContext);
  }, [observer, quantumContext]);

  const providerValue = useMemo(() => ({
    currentContext: quantumContext,
    recentObservations: observer.getObservations(),
    statistics: observer.getStatistics(),
  }), [quantumContext, observer]);

  return (
    <QuantumContextProviderContext.Provider value={providerValue}>
      {children}
    </QuantumContextProviderContext.Provider>
  );
};

export const useQuantumContextProvider = () => {
  const context = useContext(QuantumContextProviderContext);
  if (!context) {
    throw new Error('useQuantumContextProvider must be used within a QuantumContextProvider');
  }
  return context;
};