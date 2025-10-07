import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EnergyFieldMetrics } from './energyFieldTracker';
import { ResonanceMetrics } from './quantumResonanceMonitor';
import { ValidationMetrics } from './quantumStateValidator';

export interface DivineMetrics {
  quantumPerformance: {
    coherenceIndex: number;      // 0-1: Overall quantum coherence
    dimensionalEfficiency: number; // 0-1: Efficiency across dimensions
    timelineIntegrity: number;   // 0-1: Timeline management quality
    realityStability: number;    // 0-1: Stability of reality state
  };
  energyMetrics: {
    flowEfficiency: number;      // 0-1: Energy flow optimization
    harmonicAlignment: number;   // 0-1: Harmonic pattern alignment
    fieldStrength: number;       // 0-1: Energy field strength
    resonanceQuality: number;    // 0-1: Quality of resonance
  };
  consciousnessMetrics: {
    awarenessLevel: number;      // 0-1: System consciousness level
    adaptationRate: number;      // 0-1: Speed of adaptation
    learningCapacity: number;    // 0-1: System learning efficiency
    evolutionProgress: number;   // 0-1: Evolution progress
  };
  performanceMetrics: {
    renderEfficiency: number;    // 0-1: Rendering optimization
    stateManagement: number;     // 0-1: State management efficiency
    memoryCoherence: number;     // 0-1: Memory usage optimization
    operationalSync: number;     // 0-1: Operation synchronization
  };
}

export interface MetricsSnapshot {
  timestamp: number;
  metrics: DivineMetrics;
}

export interface DivineMetricsConfig {
  snapshotInterval: number;   // ms
  retentionPeriod: number;   // ms
  analysisDepth: number;     // Number of snapshots to analyze
  adaptiveThreshold: boolean;// Enable adaptive thresholds
}

export class DivinePerformanceMonitor {
  private config: DivineMetricsConfig;
  private currentMetrics: DivineMetrics;
  private metricsHistory: MetricsSnapshot[];
  private observers: Set<(metrics: DivineMetrics) => void>;
  private monitoringInterval: NodeJS.Timeout | null;
  private thresholds: Map<string, number>;

  constructor(config: Partial<DivineMetricsConfig> = {}) {
    this.config = {
      snapshotInterval: 1000,    // 1 second
      retentionPeriod: 3600000,  // 1 hour
      analysisDepth: 100,        // Analyze last 100 snapshots
      adaptiveThreshold: true,
      ...config
    };

    this.currentMetrics = this.initializeMetrics();
    this.metricsHistory = [];
    this.observers = new Set();
    this.monitoringInterval = null;
    this.thresholds = new Map();

    this.initializeThresholds();
  }

  private initializeMetrics(): DivineMetrics {
    return {
      quantumPerformance: {
        coherenceIndex: 1,
        dimensionalEfficiency: 1,
        timelineIntegrity: 1,
        realityStability: 1
      },
      energyMetrics: {
        flowEfficiency: 1,
        harmonicAlignment: 1,
        fieldStrength: 1,
        resonanceQuality: 1
      },
      consciousnessMetrics: {
        awarenessLevel: 1,
        adaptationRate: 1,
        learningCapacity: 1,
        evolutionProgress: 1
      },
      performanceMetrics: {
        renderEfficiency: 1,
        stateManagement: 1,
        memoryCoherence: 1,
        operationalSync: 1
      }
    };
  }

  private initializeThresholds(): void {
    this.thresholds.set('coherence', 0.85);
    this.thresholds.set('efficiency', 0.8);
    this.thresholds.set('stability', 0.9);
    this.thresholds.set('resonance', 0.85);
  }

  public startMonitoring(): void {
    if (this.monitoringInterval) return;

    this.monitoringInterval = setInterval(() => {
      this.takeSnapshot();
      this.cleanupHistory();
      if (this.config.adaptiveThreshold) {
        this.updateThresholds();
      }
    }, this.config.snapshotInterval);
  }

  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  public updateMetrics(
    energyMetrics?: Partial<EnergyFieldMetrics>,
    resonanceMetrics?: Partial<ResonanceMetrics>,
    validationMetrics?: Partial<ValidationMetrics>
  ): void {
    // Update Quantum Performance
    if (validationMetrics) {
      this.currentMetrics.quantumPerformance = {
        coherenceIndex: validationMetrics.coherenceScore || this.currentMetrics.quantumPerformance.coherenceIndex,
        dimensionalEfficiency: validationMetrics.dimensionalBalance || this.currentMetrics.quantumPerformance.dimensionalEfficiency,
        timelineIntegrity: validationMetrics.timelineStability || this.currentMetrics.quantumPerformance.timelineIntegrity,
        realityStability: validationMetrics.overallIntegrity || this.currentMetrics.quantumPerformance.realityStability
      };
    }

    // Update Energy Metrics
    if (energyMetrics) {
      this.currentMetrics.energyMetrics = {
        flowEfficiency: energyMetrics.fieldStrength || this.currentMetrics.energyMetrics.flowEfficiency,
        harmonicAlignment: energyMetrics.coherenceLevel || this.currentMetrics.energyMetrics.harmonicAlignment,
        fieldStrength: energyMetrics.fieldStrength || this.currentMetrics.energyMetrics.fieldStrength,
        resonanceQuality: energyMetrics.stabilityIndex || this.currentMetrics.energyMetrics.resonanceQuality
      };
    }

    // Update Resonance-based Metrics
    if (resonanceMetrics) {
      this.currentMetrics.consciousnessMetrics.awarenessLevel = 
        resonanceMetrics.overallAlignment || this.currentMetrics.consciousnessMetrics.awarenessLevel;
      this.currentMetrics.consciousnessMetrics.adaptationRate = 
        resonanceMetrics.resonanceStrength || this.currentMetrics.consciousnessMetrics.adaptationRate;
    }

    this.updatePerformanceMetrics();
    this.notifyObservers();
  }

  private updatePerformanceMetrics(): void {
    const renderTimes: number[] = [];
    const stateSizes: number[] = [];
    const memoryUsage = this.getMemoryUsage();
    
    // Calculate performance metrics based on recent history
    const recentSnapshots = this.metricsHistory.slice(-this.config.analysisDepth);
    
    this.currentMetrics.performanceMetrics = {
      renderEfficiency: this.calculateRenderEfficiency(renderTimes),
      stateManagement: this.calculateStateEfficiency(stateSizes),
      memoryCoherence: this.calculateMemoryCoherence(memoryUsage),
      operationalSync: this.calculateOperationalSync(recentSnapshots)
    };
  }

  private calculateRenderEfficiency(renderTimes: number[]): number {
    if (renderTimes.length === 0) return 1;
    const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
    const targetRenderTime = 16.67; // 60fps
    return Math.min(1, targetRenderTime / avgRenderTime);
  }

  private calculateStateEfficiency(stateSizes: number[]): number {
    if (stateSizes.length === 0) return 1;
    const avgStateSize = stateSizes.reduce((a, b) => a + b, 0) / stateSizes.length;
    const optimalSize = 1024; // 1KB optimal state size
    return Math.min(1, optimalSize / avgStateSize);
  }

  private calculateMemoryCoherence(memoryUsage: number): number {
    const maxMemory = 1024 * 1024 * 100; // 100MB threshold
    return Math.min(1, maxMemory / Math.max(1, memoryUsage));
  }

  private calculateOperationalSync(snapshots: MetricsSnapshot[]): number {
    if (snapshots.length < 2) return 1;
    
    let syncScore = 0;
    for (let i = 1; i < snapshots.length; i++) {
      const timeDiff = snapshots[i].timestamp - snapshots[i-1].timestamp;
      const expectedInterval = this.config.snapshotInterval;
      syncScore += 1 - Math.abs(timeDiff - expectedInterval) / expectedInterval;
    }
    
    return syncScore / (snapshots.length - 1);
  }

  private getMemoryUsage(): number {
    // Note: performance.memory is only available in Chrome
    return (performance as any).memory?.usedJSHeapSize || 0;
  }

  private takeSnapshot(): void {
    const snapshot: MetricsSnapshot = {
      timestamp: Date.now(),
      metrics: JSON.parse(JSON.stringify(this.currentMetrics))
    };

    this.metricsHistory.push(snapshot);
  }

  private cleanupHistory(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;
    this.metricsHistory = this.metricsHistory.filter(
      snapshot => snapshot.timestamp >= cutoffTime
    );
  }

  private updateThresholds(): void {
    const recentSnapshots = this.metricsHistory.slice(-this.config.analysisDepth);
    if (recentSnapshots.length === 0) return;

    // Calculate new thresholds based on recent performance
    const coherenceValues = recentSnapshots.map(s => s.metrics.quantumPerformance.coherenceIndex);
    const efficiencyValues = recentSnapshots.map(s => s.metrics.quantumPerformance.dimensionalEfficiency);
    const stabilityValues = recentSnapshots.map(s => s.metrics.quantumPerformance.realityStability);
    const resonanceValues = recentSnapshots.map(s => s.metrics.energyMetrics.resonanceQuality);

    this.thresholds.set('coherence', this.calculateAdaptiveThreshold(coherenceValues));
    this.thresholds.set('efficiency', this.calculateAdaptiveThreshold(efficiencyValues));
    this.thresholds.set('stability', this.calculateAdaptiveThreshold(stabilityValues));
    this.thresholds.set('resonance', this.calculateAdaptiveThreshold(resonanceValues));
  }

  private calculateAdaptiveThreshold(values: number[]): number {
    if (values.length === 0) return this.thresholds.get('coherence') || 0.85;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sq, val) => sq + Math.pow(val - mean, 2), 0) / values.length
    );

    return Math.min(1, mean + stdDev);
  }

  public getMetrics(): DivineMetrics {
    return { ...this.currentMetrics };
  }

  public getHistory(): MetricsSnapshot[] {
    return [...this.metricsHistory];
  }

  public addObserver(callback: (metrics: DivineMetrics) => void): void {
    this.observers.add(callback);
  }

  public removeObserver(callback: (metrics: DivineMetrics) => void): void {
    this.observers.delete(callback);
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer(this.currentMetrics));
  }

  public updateConfig(newConfig: Partial<DivineMetricsConfig>): void {
    const oldInterval = this.config.snapshotInterval;
    this.config = { ...this.config, ...newConfig };

    if (this.config.snapshotInterval !== oldInterval && this.monitoringInterval) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }
}

export function useDivinePerformanceMonitoring(config?: Partial<DivineMetricsConfig>) {
  const monitor = useMemo(() => new DivinePerformanceMonitor(config), []);
  const [metrics, setMetrics] = useState<DivineMetrics>(monitor.getMetrics());

  useEffect(() => {
    monitor.addObserver(setMetrics);
    monitor.startMonitoring();

    return () => {
      monitor.removeObserver(setMetrics);
      monitor.stopMonitoring();
    };
  }, [monitor]);

  const updateMetrics = useCallback((
    energyMetrics?: Partial<EnergyFieldMetrics>,
    resonanceMetrics?: Partial<ResonanceMetrics>,
    validationMetrics?: Partial<ValidationMetrics>
  ) => {
    monitor.updateMetrics(energyMetrics, resonanceMetrics, validationMetrics);
  }, [monitor]);

  return {
    metrics,
    updateMetrics,
    monitor
  };
}