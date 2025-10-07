import { useEffect, useCallback, useRef, useState } from 'react';
import { useMultiDimensionalRender } from './useMultiDimensionalRender';
import { useQuantumState } from '../lib/quantumStateManager';

export type QuantumContext = {
  entropy: number;
  coherence: number;
  dimensionalShift: number;
  temporalStability: number;
  resonanceField: number[];
};

export type ContextSensor = {
  sensitivity: number;
  frequency: number;
  thresholds: {
    entropy: number;
    coherence: number;
    dimensionalShift: number;
    temporalStability: number;
  };
};

const DEFAULT_SENSOR_CONFIG: ContextSensor = {
  sensitivity: 0.85,
  frequency: 100, // Hz
  thresholds: {
    entropy: 0.3,
    coherence: 0.7,
    dimensionalShift: 0.2,
    temporalStability: 0.8,
  },
};

export const useQuantumContextSensing = (
  config: Partial<ContextSensor> = {}
) => {
  const sensorConfig = { ...DEFAULT_SENSOR_CONFIG, ...config };
  const quantumState = useQuantumState();
  const { dimensionalState } = useMultiDimensionalRender();
  const [quantumContext, setQuantumContext] = useState<QuantumContext>({
    entropy: 0,
    coherence: 1,
    dimensionalShift: 0,
    temporalStability: 1,
    resonanceField: [1],
  });

  const previousStates = useRef<Array<QuantumContext>>([]);
  const observationInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  const calculateEntropy = useCallback((states: Array<QuantumContext>): number => {
    if (states.length < 2) return 0;
    const variations = states.slice(-5); // Look at last 5 states
    return variations.reduce((entropy, state, idx) => {
      if (idx === 0) return entropy;
      const prevState = variations[idx - 1];
      return entropy + Math.abs(state.coherence - prevState.coherence);
    }, 0) / (variations.length - 1);
  }, []);

  const detectDimensionalShift = useCallback((current: QuantumContext, previous: QuantumContext): number => {
    const dimensionWeights = {
      coherence: 0.4,
      temporalStability: 0.3,
      resonance: 0.3,
    };

    return Math.abs(
      dimensionWeights.coherence * (current.coherence - previous.coherence) +
      dimensionWeights.temporalStability * (current.temporalStability - previous.temporalStability) +
      dimensionWeights.resonance * (
        Math.max(...current.resonanceField) - Math.max(...previous.resonanceField)
      )
    );
  }, []);

  const observeQuantumContext = useCallback(() => {
    const currentState = quantumState.getCurrentState();
    const resonanceField = currentState.probabilityField;
    const coherence = currentState.coherenceLevel;
    const temporalStability = dimensionalState.temporalAlignment;

    const newContext: QuantumContext = {
      entropy: 0,
      coherence,
      dimensionalShift: 0,
      temporalStability,
      resonanceField,
    };

    // Calculate entropy from historical states
    newContext.entropy = calculateEntropy([...previousStates.current, newContext]);

    // Detect dimensional shifts
    if (previousStates.current.length > 0) {
      newContext.dimensionalShift = detectDimensionalShift(
        newContext,
        previousStates.current[previousStates.current.length - 1]
      );
    }

    // Update state history
    previousStates.current = [...previousStates.current.slice(-9), newContext];
    setQuantumContext(newContext);

    // Trigger quantum state updates if thresholds are exceeded
    if (newContext.entropy > sensorConfig.thresholds.entropy) {
      quantumState.updateState({ coherenceAdjustment: -0.1 });
    }
    if (newContext.dimensionalShift > sensorConfig.thresholds.dimensionalShift) {
      quantumState.updateState({ 
        dimension: 'quantum',
        value: true,
        coherenceAdjustment: -0.2
      });
    }
  }, [
    quantumState,
    dimensionalState,
    calculateEntropy,
    detectDimensionalShift,
    sensorConfig.thresholds,
  ]);

  useEffect(() => {
    // Start quantum context observation
    observationInterval.current = setInterval(
      observeQuantumContext,
      1000 / sensorConfig.frequency
    );

    return () => {
      if (observationInterval.current) {
        clearInterval(observationInterval.current);
      }
    };
  }, [observeQuantumContext, sensorConfig.frequency]);

  return {
    quantumContext,
    sensorConfig,
  };
};