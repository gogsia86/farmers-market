/**
 * Tests for Quantum Performance Optimization System
 */

import { QuantumState } from '../../types/quantum';
import { QuantumStateMonitor } from '../monitoring/QuantumStateMonitor';
import { 
  QuantumPerformanceOptimizer,
  OptimizationStrategy 
} from './QuantumPerformanceOptimizer';

interface TestData {
  value: string;
}

describe('QuantumPerformanceOptimizer', () => {
  let monitor: QuantumStateMonitor<TestData>;
  let optimizer: QuantumPerformanceOptimizer<TestData>;

  const createTestState = (): QuantumState<TestData> => ({
    value: { value: 'test' },
    dimension: {
      id: 'test-dimension',
      depth: 1
    },
    resonance: {
      frequency: 420, // Slightly below optimal
      amplitude: 0.6, // Below optimal
      phase: Math.PI / 4
    },
    temporalContext: {
      id: 'test-frame',
      timestamp: Date.now(),
      dimension: {
        id: 'test-dimension',
        depth: 1
      },
      coherenceLevel: 0.7
    },
    consciousness: {
      level: 0.6, // Below optimal
      integration: 0.5, // Below optimal
      awareness: 0.6 // Below optimal
    },
    holographicPrints: [],
    fractalDimensions: {
      depth: 3,
      complexity: 0.7,
      patterns: ['test-pattern']
    }
  });

  beforeEach(() => {
    monitor = new QuantumStateMonitor<TestData>({
      historyLength: 10,
      updateInterval: 100
    });
    optimizer = new QuantumPerformanceOptimizer<TestData>(monitor);
  });

  afterEach(() => {
    monitor.stopMonitoring();
  });

  describe('optimization strategies', () => {
    it('should optimize resonance', async () => {
      const state = createTestState();
      const result = await optimizer.optimize(state);

      expect(result.optimizedState.resonance.frequency).toBeGreaterThan(
        state.resonance.frequency
      );
      expect(result.optimizedState.resonance.amplitude).toBeGreaterThan(
        state.resonance.amplitude
      );
      expect(result.improvements.coherence).toBeGreaterThan(0);
    });

    it('should optimize consciousness', async () => {
      const state = createTestState();
      const result = await optimizer.optimize(state);

      expect(result.optimizedState.consciousness.level).toBeGreaterThan(
        state.consciousness.level
      );
      expect(result.optimizedState.consciousness.integration).toBeGreaterThan(
        state.consciousness.integration
      );
      expect(result.optimizedState.consciousness.awareness).toBeGreaterThan(
        state.consciousness.awareness
      );
    });

    it('should track applied strategies', async () => {
      const state = createTestState();
      const result = await optimizer.optimize(state);

      expect(result.appliedStrategies).toContain('resonance-optimization');
      expect(result.appliedStrategies).toContain('consciousness-optimization');
    });

    it('should maintain stability during optimization', async () => {
      const state = createTestState();
      const result = await optimizer.optimize(state);

      // Verify changes are within safe bounds
      expect(Math.abs(
        result.optimizedState.resonance.frequency - state.resonance.frequency
      )).toBeLessThan(50);

      expect(Math.abs(
        result.optimizedState.consciousness.level - state.consciousness.level
      )).toBeLessThan(0.5);
    });
  });

  describe('custom optimization strategies', () => {
    it('should allow adding custom strategies', async () => {
      const customStrategy: OptimizationStrategy<TestData> = {
        name: 'custom-optimization',
        priority: 0,
        canOptimize: () => true,
        optimize: async (state) => ({
          ...state,
          consciousness: {
            ...state.consciousness,
            level: 0.9
          }
        })
      };

      optimizer.addStrategy(customStrategy);
      const state = createTestState();
      const result = await optimizer.optimize(state);

      expect(result.appliedStrategies).toContain('custom-optimization');
      expect(result.optimizedState.consciousness.level).toBe(0.9);
    });

    it('should respect strategy priorities', async () => {
      const firstStrategy: OptimizationStrategy<TestData> = {
        name: 'first-strategy',
        priority: 1,
        canOptimize: () => true,
        optimize: async (state) => ({
          ...state,
          consciousness: {
            ...state.consciousness,
            level: 0.8
          }
        })
      };

      const secondStrategy: OptimizationStrategy<TestData> = {
        name: 'second-strategy',
        priority: 2,
        canOptimize: () => true,
        optimize: async (state) => ({
          ...state,
          consciousness: {
            ...state.consciousness,
            level: 0.9
          }
        })
      };

      optimizer.addStrategy(firstStrategy);
      optimizer.addStrategy(secondStrategy);

      const state = createTestState();
      const result = await optimizer.optimize(state);

      // Strategies should be applied in priority order
      expect(result.appliedStrategies.indexOf('first-strategy'))
        .toBeLessThan(result.appliedStrategies.indexOf('second-strategy'));
    });
  });

  describe('optimization improvements', () => {
    it('should report meaningful improvements', async () => {
      const state = createTestState();
      const result = await optimizer.optimize(state);

      expect(result.improvements.coherence).toBeDefined();
      expect(result.improvements.performance).toBeDefined();
      expect(result.improvements.stability).toBeDefined();

      // At least one metric should show improvement
      const hasImprovement = 
        result.improvements.coherence > 0 ||
        result.improvements.performance > 0 ||
        result.improvements.stability > 0;

      expect(hasImprovement).toBe(true);
    });

    it('should handle edge cases gracefully', async () => {
      const perfectState = createTestState();
      perfectState.resonance.frequency = 432;
      perfectState.resonance.amplitude = 0.8;
      perfectState.consciousness.level = 0.9;
      perfectState.consciousness.integration = 0.9;
      perfectState.consciousness.awareness = 0.9;

      const result = await optimizer.optimize(perfectState);

      // Should not degrade optimal values
      expect(result.optimizedState.resonance.frequency).toBeGreaterThanOrEqual(432);
      expect(result.optimizedState.consciousness.level).toBeGreaterThanOrEqual(0.9);
      expect(result.improvements.stability).toBeGreaterThanOrEqual(0);
    });
  });
});