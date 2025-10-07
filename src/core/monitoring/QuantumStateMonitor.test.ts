/**
 * Tests for Quantum State Monitoring System
 */

import { QuantumState } from '../../types/quantum';
import { QuantumStateMonitor, MonitoringMetrics, AlertCondition } from './QuantumStateMonitor';

interface TestData {
  value: string;
}

describe('QuantumStateMonitor', () => {
  let monitor: QuantumStateMonitor<TestData>;
  
  const createTestState = (): QuantumState<TestData> => ({
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

  beforeEach(() => {
    monitor = new QuantumStateMonitor<TestData>({
      historyLength: 10,
      updateInterval: 100
    });
  });

  afterEach(() => {
    monitor.stopMonitoring();
  });

  describe('metrics collection', () => {
    it('should collect metrics over time', async () => {
      const state = createTestState();
      monitor.startMonitoring(state);

      // Wait for some metrics to be collected
      await new Promise(resolve => setTimeout(resolve, 300));

      const metrics = monitor.getMetrics();
      expect(metrics.length).toBeGreaterThan(0);
      
      const latestMetrics = metrics[metrics.length - 1];
      expect(latestMetrics.coherenceLevel).toBeGreaterThan(0);
      expect(latestMetrics.resonanceMetrics).toBeDefined();
      expect(latestMetrics.consciousnessMetrics).toBeDefined();
      expect(latestMetrics.systemMetrics).toBeDefined();
    });

    it('should respect history length limit', async () => {
      const state = createTestState();
      const historyLength = 5;
      const monitor = new QuantumStateMonitor<TestData>({
        historyLength,
        updateInterval: 50
      });

      monitor.startMonitoring(state);

      // Wait for more metrics than history length
      await new Promise(resolve => setTimeout(resolve, 300));

      const metrics = monitor.getMetrics();
      expect(metrics.length).toBeLessThanOrEqual(historyLength);
    });
  });

  describe('alert system', () => {
    it('should trigger alerts on condition match', async () => {
      const alertCondition: AlertCondition = {
        name: 'test-alert',
        severity: 'warning',
        evaluate: (metrics) => metrics.coherenceLevel < 0.9,
        message: 'Test alert triggered'
      };

      monitor.addAlertCondition(alertCondition);
      const state = createTestState();
      state.consciousness.level = 0.3; // Should trigger low coherence

      monitor.startMonitoring(state);

      // Wait for alert to be triggered
      await new Promise(resolve => setTimeout(resolve, 200));

      const alerts = monitor.getAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].condition.name).toBe('test-alert');
    });

    it('should filter alerts by severity', async () => {
      const warningCondition: AlertCondition = {
        name: 'warning-alert',
        severity: 'warning',
        evaluate: () => true,
        message: 'Warning alert'
      };

      const errorCondition: AlertCondition = {
        name: 'error-alert',
        severity: 'error',
        evaluate: () => true,
        message: 'Error alert'
      };

      monitor.addAlertCondition(warningCondition);
      monitor.addAlertCondition(errorCondition);

      const state = createTestState();
      monitor.startMonitoring(state);

      // Wait for alerts to be triggered
      await new Promise(resolve => setTimeout(resolve, 200));

      const warningAlerts = monitor.getAlerts({ severity: 'warning' });
      const errorAlerts = monitor.getAlerts({ severity: 'error' });

      expect(warningAlerts.every(a => a.condition.severity === 'warning')).toBe(true);
      expect(errorAlerts.every(a => a.condition.severity === 'error')).toBe(true);
    });
  });

  describe('monitoring lifecycle', () => {
    it('should start and stop monitoring', async () => {
      const state = createTestState();
      monitor.startMonitoring(state);

      // Wait for initial metrics
      await new Promise(resolve => setTimeout(resolve, 200));
      const initialCount = monitor.getMetrics().length;

      monitor.stopMonitoring();

      // Wait and verify no new metrics
      await new Promise(resolve => setTimeout(resolve, 200));
      const finalCount = monitor.getMetrics().length;

      expect(finalCount).toBe(initialCount);
    });

    it('should handle multiple start/stop cycles', async () => {
      const state = createTestState();

      // First cycle
      monitor.startMonitoring(state);
      await new Promise(resolve => setTimeout(resolve, 200));
      monitor.stopMonitoring();

      const firstCount = monitor.getMetrics().length;

      // Second cycle
      monitor.startMonitoring(state);
      await new Promise(resolve => setTimeout(resolve, 200));
      monitor.stopMonitoring();

      const secondCount = monitor.getMetrics().length;

      expect(secondCount).toBeGreaterThan(firstCount);
    });
  });
});