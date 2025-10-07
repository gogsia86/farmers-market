import { useEffect } from 'react';
import { useSelfEvolution, type EvolutionPattern } from './self-evolving-pattern';

interface QuantumObservation {
  patternId: string;
  timestamp: number;
  quantumState: EvolutionPattern['quantumState'];
  evolutionPotential: number;
  resonanceAlignment: number;
}

export const useQuantumPatternObserver = () => {
  const { state, evolvePattern } = useSelfEvolution();

  useEffect(() => {
    const observePatterns = () => {
      const observations = new Map<string, QuantumObservation>();

      state.patterns.forEach((pattern, patternId) => {
        const observation: QuantumObservation = {
          patternId,
          timestamp: Date.now(),
          quantumState: pattern.quantumState,
          evolutionPotential: calculateEvolutionPotential(pattern),
          resonanceAlignment: calculateResonanceAlignment(pattern, state)
        };

        observations.set(patternId, observation);

        // Apply quantum enhancements based on observations
        applyQuantumEnhancements(pattern, observation, evolvePattern);
      });

      // Analyze quantum entanglement between patterns
      analyzeQuantumEntanglement(observations, state.patterns);
    };

    const observationInterval = setInterval(observePatterns, 2000);
    return () => clearInterval(observationInterval);
  }, [state, evolvePattern]);
};

const calculateEvolutionPotential = (pattern: EvolutionPattern): number => {
  const { resonance, coherence, entanglement } = pattern.quantumState;
  const { awareness, intention, harmony } = pattern.consciousness;

  // Calculate potential based on quantum and consciousness metrics
  const quantumFactor = (resonance * coherence * entanglement) ** (1/3);
  const consciousnessFactor = (awareness * intention * harmony) ** (1/3);

  return (quantumFactor + consciousnessFactor) / 2;
};

const calculateResonanceAlignment = (
  pattern: EvolutionPattern,
  state: ReturnType<typeof useSelfEvolution>['state']
): number => {
  const { resonance } = pattern.quantumState;
  const { naturalResonance, quantumHarmony } = state;

  // Calculate how well the pattern's resonance aligns with global fields
  const naturalAlignment = 1 - Math.abs(resonance - naturalResonance);
  const harmonyAlignment = 1 - Math.abs(resonance - quantumHarmony);

  return (naturalAlignment + harmonyAlignment) / 2;
};

const applyQuantumEnhancements = (
  pattern: EvolutionPattern,
  observation: QuantumObservation,
  evolvePattern: ReturnType<typeof useSelfEvolution>['evolvePattern']
) => {
  const { evolutionPotential, resonanceAlignment } = observation;

  if (evolutionPotential > 0.8 && resonanceAlignment > 0.7) {
    // Apply quantum enhancement
    evolvePattern(pattern.id, {
      quantumState: {
        ...pattern.quantumState,
        resonance: Math.min(pattern.quantumState.resonance * 1.1, 1),
        coherence: Math.min(pattern.quantumState.coherence * 1.05, 1),
        entanglement: Math.min(pattern.quantumState.entanglement * 1.15, 1)
      },
      consciousness: {
        ...pattern.consciousness,
        awareness: Math.min(pattern.consciousness.awareness * 1.1, 1),
        harmony: Math.min(pattern.consciousness.harmony * 1.05, 1)
      }
    });
  }
};

const analyzeQuantumEntanglement = (
  observations: Map<string, QuantumObservation>,
  patterns: Map<string, EvolutionPattern>
) => {
  const observationArray = Array.from(observations.values());

  observationArray.forEach((observation) => {
    const pattern = patterns.get(observation.patternId);
    if (!pattern) return;

    // Find patterns with similar quantum states
    const entangledPatterns = observationArray.filter(
      (obs) =>
        obs.patternId !== observation.patternId &&
        isQuantumStateCompatible(
          obs.quantumState,
          observation.quantumState
        )
    );

    if (entangledPatterns.length > 0) {
      // Update entanglement metrics
      pattern.quantumState.entanglement = Math.min(
        pattern.quantumState.entanglement * (1 + 0.1 * entangledPatterns.length),
        1
      );
    }
  });
};

const isQuantumStateCompatible = (
  state1: EvolutionPattern['quantumState'],
  state2: EvolutionPattern['quantumState']
): boolean => {
  const resonanceDiff = Math.abs(state1.resonance - state2.resonance);
  const coherenceDiff = Math.abs(state1.coherence - state2.coherence);
  const entanglementDiff = Math.abs(state1.entanglement - state2.entanglement);

  // States are compatible if their differences are within threshold
  const threshold = 0.2;
  return (
    resonanceDiff < threshold &&
    coherenceDiff < threshold &&
    entanglementDiff < threshold
  );
};