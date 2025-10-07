import { ContextObservation } from '../lib/quantumContextObserver';

export interface QuantumSignificance {
  value: number;
  confidence: number;
  temporalWeight: number;
  dimensionalResonance: number;
}

export const calculateQuantumSignificance = (
  observations: ContextObservation[],
  timeWindow: number = 1000 * 60 * 60 // 1 hour default
): QuantumSignificance => {
  const now = Date.now();
  const relevantObservations = observations.filter(
    obs => now - obs.timestamp <= timeWindow
  );

  if (relevantObservations.length === 0) {
    return {
      value: 0,
      confidence: 0,
      temporalWeight: 0,
      dimensionalResonance: 0
    };
  }

  // Calculate temporal weight based on recency
  const temporalWeights = relevantObservations.map(obs => {
    const age = now - obs.timestamp;
    return Math.exp(-age / timeWindow); // Exponential decay
  });

  // Calculate significance value
  const weightedSum = relevantObservations.reduce((sum, obs, i) => {
    return sum + obs.significance * temporalWeights[i];
  }, 0);

  const totalWeight = temporalWeights.reduce((sum, w) => sum + w, 0);
  const averageSignificance = weightedSum / totalWeight;

  // Calculate confidence based on observation density
  const confidence = Math.min(1, relevantObservations.length / 10); // Saturate at 10 observations

  // Calculate dimensional resonance
  const dimensionalResonance = relevantObservations.reduce((max, obs) => {
    return Math.max(max, obs.significance * obs.dimensionalAlignment);
  }, 0);

  return {
    value: averageSignificance,
    confidence,
    temporalWeight: totalWeight / relevantObservations.length,
    dimensionalResonance
  };
};