/**
 * Quantum State Monitoring System
 * Implements real-time monitoring and metrics collection for quantum states
 */

import {
  QuantumState,
  QuantumEvent,
  PerformanceMetrics,
  RealityFrame
} from '../../types/quantum';

export interface MonitoringMetrics {
  timestamp: number;
  coherenceLevel: number;
  resonanceMetrics: {
    frequency: number;
    amplitude: number;
    phase: number;
    stability: number;
  };
  consciousnessMetrics: {
    level: number;
    integration: number;
    awareness: number;
    stability: number;
  };
  systemMetrics: {
    loadFactor: number;
    responseTime: number;
    errorRate: number;
    healthScore: number;
  };
}

export interface AlertCondition {
  name: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  evaluate: (metrics: MonitoringMetrics) => boolean;
  message: string;
}

export interface Alert {
  condition: AlertCondition;
  timestamp: number;
  metrics: MonitoringMetrics;
  resolved?: boolean;
  resolvedAt?: number;
}

export class QuantumStateMonitor<T> {
  private metrics: MonitoringMetrics[] = [];
  private alerts: Alert[] = [];
  private alertConditions: AlertCondition[] = [];
  private readonly historyLength: number;
  private readonly updateInterval: number;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(options: {
    historyLength?: number;
    updateInterval?: number;
  } = {}) {
    this.historyLength = options.historyLength || 1000;
    this.updateInterval = options.updateInterval || 1000;
    this.initializeDefaultAlerts();
  }

  private initializeDefaultAlerts() {
    this.addAlertCondition({
      name: 'low-coherence',
      severity: 'critical',
      evaluate: (metrics) => metrics.coherenceLevel < 0.5,
      message: 'Quantum coherence below critical threshold'
    });

    this.addAlertCondition({
      name: 'resonance-instability',
      severity: 'warning',
      evaluate: (metrics) => metrics.resonanceMetrics.stability < 0.6,
      message: 'Resonance stability degrading'
    });

    this.addAlertCondition({
      name: 'consciousness-degradation',
      severity: 'error',
      evaluate: (metrics) => metrics.consciousnessMetrics.stability < 0.7,
      message: 'Consciousness level unstable'
    });

    this.addAlertCondition({
      name: 'system-overload',
      severity: 'warning',
      evaluate: (metrics) => metrics.systemMetrics.loadFactor > 0.8,
      message: 'System load approaching capacity'
    });
  }

  public addAlertCondition(condition: AlertCondition) {
    this.alertConditions.push(condition);
  }

  public startMonitoring(state: QuantumState<T>) {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics(state);
    }, this.updateInterval);
  }

  public stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  private collectMetrics(state: QuantumState<T>) {
    const metrics = this.calculateMetrics(state);
    this.metrics.push(metrics);

    // Maintain history length
    if (this.metrics.length > this.historyLength) {
      this.metrics.shift();
    }

    // Check alert conditions
    this.checkAlerts(metrics);
  }

  private calculateMetrics(state: QuantumState<T>): MonitoringMetrics {
    const { resonance, consciousness } = state;

    return {
      timestamp: Date.now(),
      coherenceLevel: this.calculateCoherenceLevel(state),
      resonanceMetrics: {
        frequency: resonance.frequency,
        amplitude: resonance.amplitude,
        phase: resonance.phase,
        stability: this.calculateResonanceStability(resonance)
      },
      consciousnessMetrics: {
        level: consciousness.level,
        integration: consciousness.integration,
        awareness: consciousness.awareness,
        stability: this.calculateConsciousnessStability(consciousness)
      },
      systemMetrics: {
        loadFactor: this.calculateSystemLoad(),
        responseTime: this.calculateResponseTime(),
        errorRate: this.calculateErrorRate(),
        healthScore: this.calculateHealthScore()
      }
    };
  }

  private checkAlerts(metrics: MonitoringMetrics) {
    for (const condition of this.alertConditions) {
      if (condition.evaluate(metrics)) {
        const alert: Alert = {
          condition,
          timestamp: Date.now(),
          metrics
        };
        this.alerts.push(alert);
        this.handleAlert(alert);
      }
    }
  }

  private handleAlert(alert: Alert) {
    console.error(`[${alert.condition.severity.toUpperCase()}] ${alert.condition.message}`);
    // Add additional alert handling logic here (e.g., notifications)
  }

  public getMetrics(timeRange?: { start: number; end: number }): MonitoringMetrics[] {
    if (!timeRange) {
      return [...this.metrics];
    }

    return this.metrics.filter(
      m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );
  }

  public getAlerts(options?: {
    severity?: Alert['condition']['severity'];
    resolved?: boolean;
  }): Alert[] {
    let filteredAlerts = [...this.alerts];

    if (options?.severity) {
      filteredAlerts = filteredAlerts.filter(
        a => a.condition.severity === options.severity
      );
    }

    if (options?.resolved !== undefined) {
      filteredAlerts = filteredAlerts.filter(
        a => a.resolved === options.resolved
      );
    }

    return filteredAlerts;
  }

  private calculateCoherenceLevel(state: QuantumState<T>): number {
    // Calculate coherence based on state properties
    const resonanceCoherence = this.calculateResonanceStability(state.resonance);
    const consciousnessCoherence = this.calculateConsciousnessStability(state.consciousness);
    
    return (resonanceCoherence + consciousnessCoherence) / 2;
  }

  private calculateResonanceStability(resonance: QuantumState<T>['resonance']): number {
    // Calculate resonance stability
    const frequencyNorm = resonance.frequency / 1000; // Normalize to [0,1]
    const amplitudeNorm = resonance.amplitude; // Already [0,1]
    const phaseNorm = resonance.phase / (2 * Math.PI); // Normalize to [0,1]
    
    return (frequencyNorm + amplitudeNorm + phaseNorm) / 3;
  }

  private calculateConsciousnessStability(
    consciousness: QuantumState<T>['consciousness']
  ): number {
    // Calculate consciousness stability
    return (
      consciousness.level +
      consciousness.integration +
      consciousness.awareness
    ) / 3;
  }

  private calculateSystemLoad(): number {
    // Implement system load calculation
    // This could include memory usage, CPU usage, etc.
    return Math.random(); // Placeholder
  }

  private calculateResponseTime(): number {
    // Implement response time calculation
    return Math.random() * 100; // Placeholder
  }

  private calculateErrorRate(): number {
    // Implement error rate calculation
    return Math.random() * 0.1; // Placeholder
  }

  private calculateHealthScore(): number {
    // Implement health score calculation
    return Math.random(); // Placeholder
  }
}