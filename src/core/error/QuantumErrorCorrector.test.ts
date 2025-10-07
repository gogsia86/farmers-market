/**
 * Tests for Quantum Error Correction System
 */

import { QuantumState, ValidationMatrix } from '../../types/quantum';
import { QuantumErrorCorrector } from './QuantumErrorCorrector';

interface TestData {
  value: string;
}

describe('QuantumErrorCorrector', () => {
  let corrector: QuantumErrorCorrector<TestData>;
  let validationRules: ValidationMatrix;

  beforeEach(() => {
    validationRules = {
      isValid: true,
      coherenceLevel: 0.9,
      violations: []
    };
    corrector = new QuantumErrorCorrector<TestData>(validationRules);
  });

  const createValidState = (): QuantumState<TestData> => ({
    value: { value: 'test' },
    dimension: {
      id: 'test-dimension',
      depth: 1
    },
    resonance: {
      frequency: 432,
      amplitude: 0.8,
      phase: Math.PI / 2
    },
    temporalContext: {
      id: 'test-frame',
      timestamp: Date.now(),
      dimension: {
        id: 'test-dimension',
        depth: 1
      },
      coherenceLevel: 0.9
    },
    consciousness: {
      level: 0.8,
      integration: 0.7,
      awareness: 0.9
    },
    holographicPrints: [],
    fractalDimensions: {
      depth: 3,
      complexity: 0.7,
      patterns: ['test-pattern']
    }
  });

  describe('error detection', () => {
    it('should detect coherence loss', async () => {
      const state = createValidState();
      state.resonance.frequency = -1; // Invalid frequency

      const errors = await corrector.detectErrors(state);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.errorType === 'coherence-loss')).toBe(true);
    });

    it('should detect state drift', async () => {
      const state = createValidState();
      state.consciousness.level = 1.5; // Invalid consciousness level

      const errors = await corrector.detectErrors(state);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.errorType === 'state-drift')).toBe(true);
    });

    it('should not detect errors in valid state', async () => {
      const state = createValidState();
      const errors = await corrector.detectErrors(state);
      
      expect(errors.length).toBe(0);
    });
  });

  describe('error correction', () => {
    it('should correct coherence loss', async () => {
      const state = createValidState();
      state.resonance.frequency = -1;

      const correctedState = await corrector.correctErrors(state, {
        level: 1,
        permissions: ['correction'],
        validationRules: new Map()
      });

      expect(correctedState.resonance.frequency).toBeGreaterThanOrEqual(0);
      expect(correctedState.resonance.frequency).toBeLessThanOrEqual(1000);
    });

    it('should correct state drift', async () => {
      const state = createValidState();
      state.consciousness.level = 1.5;

      const correctedState = await corrector.correctErrors(state, {
        level: 1,
        permissions: ['correction'],
        validationRules: new Map()
      });

      expect(correctedState.consciousness.level).toBeLessThanOrEqual(1);
      expect(correctedState.consciousness.level).toBeGreaterThanOrEqual(0);
    });

    it('should preserve valid values during correction', async () => {
      const state = createValidState();
      const originalFrequency = state.resonance.frequency;
      state.consciousness.level = 1.5; // Only consciousness needs correction

      const correctedState = await corrector.correctErrors(state, {
        level: 1,
        permissions: ['correction'],
        validationRules: new Map()
      });

      expect(correctedState.resonance.frequency).toBe(originalFrequency);
      expect(correctedState.consciousness.level).toBeLessThanOrEqual(1);
    });
  });

  describe('custom strategies', () => {
    it('should allow adding custom correction strategies', async () => {
      const customStrategy = {
        name: 'custom-correction',
        priority: 0,
        canHandle: (error: any) => error.errorType === 'custom-error',
        correct: async (state: QuantumState<TestData>) => ({
          ...state,
          consciousness: { ...state.consciousness, level: 0.5 }
        })
      };

      corrector.addStrategy(customStrategy);
      const state = createValidState();
      state.consciousness.level = 1.5;

      const correctedState = await corrector.correctErrors(state, {
        level: 1,
        permissions: ['correction'],
        validationRules: new Map()
      });

      expect(correctedState.consciousness.level).toBeLessThanOrEqual(1);
    });
  });
});