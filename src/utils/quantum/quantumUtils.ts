/**
 * Quantum Utilities
 * Helper functions for quantum state management
 */

import { QuantumState, RealityFrame, MaterializedPattern } from '../../types/quantum';

export function createQuantumState<T>(
  value: T,
  dimension: string,
  consciousness: number = 1.0
): QuantumState<T> {
  return {
    value,
    dimension: {
      id: dimension,
      depth: 1,
    },
    resonance: {
      frequency: 1.0,
      amplitude: 1.0,
      phase: 0.0,
    },
    temporalContext: {
      id: `${dimension}-${Date.now()}`,
      timestamp: Date.now(),
      dimension: {
        id: dimension,
        depth: 1,
      },
      coherenceLevel: 1.0,
    },
    consciousness: {
      level: consciousness,
      awareness: 1.0,
      integration: 1.0,
    },
    holographicPrints: [],
    fractalDimensions: {
      depth: 1,
      complexity: 1.0,
      patterns: [],
    },
  };
}

export function mergeQuantumStates<T>(
  states: QuantumState<T>[]
): QuantumState<T[]> {
  const mergedValues = states.map(s => s.value);
  const timestamp = Date.now();

  return {
    value: mergedValues,
    dimension: {
      id: 'merged',
      depth: Math.max(...states.map(s => s.dimension.depth)) + 1,
    },
    resonance: {
      frequency: states.reduce((acc, s) => acc * s.resonance.frequency, 1.0),
      amplitude: states.reduce((acc, s) => acc * s.resonance.amplitude, 1.0),
      phase: states.reduce((acc, s) => acc + s.resonance.phase, 0.0) / states.length,
    },
    temporalContext: {
      id: `merged-${timestamp}`,
      timestamp,
      dimension: {
        id: 'merged',
        depth: Math.max(...states.map(s => s.dimension.depth)) + 1,
      },
      coherenceLevel: states.reduce((acc, s) => acc * s.temporalContext.coherenceLevel, 1.0),
    },
    consciousness: {
      level: states.reduce((acc, s) => acc * s.consciousness.level, 1.0),
      awareness: states.reduce((acc, s) => acc * s.consciousness.awareness, 1.0),
      integration: states.reduce((acc, s) => acc * s.consciousness.integration, 1.0),
    },
    holographicPrints: states.flatMap(s => s.holographicPrints),
    fractalDimensions: {
      depth: Math.max(...states.map(s => s.fractalDimensions.depth)) + 1,
      complexity: states.reduce((acc, s) => acc * s.fractalDimensions.complexity, 1.0),
      patterns: states.flatMap(s => s.fractalDimensions.patterns),
    },
  };
}

export function calculateCoherence<T>(state: QuantumState<T>): number {
  const resonanceCoherence = 
    (state.resonance.frequency + state.resonance.amplitude) / 2;
  const consciousnessCoherence = 
    (state.consciousness.level + state.consciousness.awareness + state.consciousness.integration) / 3;
  const temporalCoherence = state.temporalContext.coherenceLevel;
  const fractalCoherence = state.fractalDimensions.complexity;

  return (resonanceCoherence + consciousnessCoherence + temporalCoherence + fractalCoherence) / 4;
}