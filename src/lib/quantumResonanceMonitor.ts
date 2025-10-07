import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface ResonancePattern {
  frequency: number;
  amplitude: number;
  phase: number;
  coherence: number;
  harmonics: number[];
}

export interface ResonanceMetrics {
  overallAlignment: number;     // 0-1: Global alignment level
  resonanceStrength: number;    // 0-1: Current resonance strength
  harmonicStability: number;    // 0-1: Stability of harmonic patterns
  quantumCoherence: number;     // 0-1: Quantum state coherence
  dimensionalSync: number;      // 0-1: Cross-dimensional synchronization
  activePatterns: ResonancePattern[];
}

export interface ResonanceConfig {
  baseFrequency: number;     // Hz
  samplingRate: number;      // Hz
  coherenceThreshold: number;// 0-1
  harmonicSensitivity: number; // 0-1
  dimensionalDepth: number;  // Number of dimensions to monitor
}

export class QuantumResonanceMonitor {
  private config: ResonanceConfig;
  private metrics: ResonanceMetrics;
  private patterns: Map<string, ResonancePattern>;
  private observers: Set<(metrics: ResonanceMetrics) => void>;
  private monitoringInterval: NodeJS.Timeout | null;
  private lastUpdate: number;

  constructor(config: Partial<ResonanceConfig> = {}) {
    this.config = {
      baseFrequency: 432,     // Natural frequency
      samplingRate: 60,       // 60Hz monitoring
      coherenceThreshold: 0.7, // 70% minimum coherence
      harmonicSensitivity: 0.85, // 85% harmonic sensitivity
      dimensionalDepth: 7,    // Monitor 7 dimensions
      ...config
    };

    this.metrics = {
      overallAlignment: 1,
      resonanceStrength: 1,
      harmonicStability: 1,
      quantumCoherence: 1,
      dimensionalSync: 1,
      activePatterns: []
    };

    this.patterns = new Map();
    this.observers = new Set();
    this.monitoringInterval = null;
    this.lastUpdate = Date.now();
  }

  public startMonitoring(): void {
    if (this.monitoringInterval) return;

    const interval = Math.floor(1000 / this.config.samplingRate);
    this.monitoringInterval = setInterval(() => this.monitor(), interval);
  }

  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private monitor(): void {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;

    // Update resonance patterns
    this.updatePatterns(deltaTime);

    // Calculate metrics
    this.calculateMetrics();

    // Notify observers
    this.notifyObservers();
  }

  private updatePatterns(deltaTime: number): void {
    this.patterns.forEach(pattern => {
      // Update phase based on frequency
      pattern.phase = (pattern.phase + pattern.frequency * deltaTime) % (2 * Math.PI);

      // Natural frequency drift simulation
      pattern.frequency += (this.config.baseFrequency - pattern.frequency) * 0.01 * deltaTime;

      // Update coherence based on harmonic alignment
      pattern.coherence = this.calculatePatternCoherence(pattern);

      // Update harmonics
      pattern.harmonics = this.calculateHarmonics(pattern.frequency);
    });
  }

  private calculatePatternCoherence(pattern: ResonancePattern): number {
    const baseRatio = pattern.frequency / this.config.baseFrequency;
    const harmonicAlignment = this.calculateHarmonicAlignment(pattern);
    
    return Math.min(1, Math.max(0,
      (1 - Math.abs(1 - baseRatio)) * 0.5 +
      harmonicAlignment * 0.5
    ));
  }

  private calculateHarmonicAlignment(pattern: ResonancePattern): number {
    let alignment = 0;
    const harmonics = this.calculateHarmonics(this.config.baseFrequency);

    pattern.harmonics.forEach((harmonic, index) => {
      if (harmonics[index]) {
        const ratio = harmonic / harmonics[index];
        alignment += 1 - Math.abs(1 - ratio);
      }
    });

    return alignment / harmonics.length;
  }

  private calculateHarmonics(fundamental: number): number[] {
    const harmonics: number[] = [];
    for (let i = 1; i <= 7; i++) {
      harmonics.push(fundamental * i);
    }
    return harmonics;
  }

  private calculateMetrics(): void {
    if (this.patterns.size === 0) return;

    let totalAlignment = 0;
    let totalStrength = 0;
    let totalStability = 0;
    let totalCoherence = 0;
    let dimensionalSyncSum = 0;

    const patterns = Array.from(this.patterns.values());

    patterns.forEach(pattern => {
      totalAlignment += pattern.coherence;
      totalStrength += pattern.amplitude;
      totalStability += this.calculatePatternStability(pattern);
      totalCoherence += pattern.coherence;
    });

    // Calculate dimensional synchronization
    for (let d = 0; d < this.config.dimensionalDepth; d++) {
      dimensionalSyncSum += this.calculateDimensionalSync(d, patterns);
    }

    const count = patterns.length;
    this.metrics = {
      overallAlignment: totalAlignment / count,
      resonanceStrength: totalStrength / count,
      harmonicStability: totalStability / count,
      quantumCoherence: totalCoherence / count,
      dimensionalSync: dimensionalSyncSum / this.config.dimensionalDepth,
      activePatterns: patterns.filter(p => p.amplitude > this.config.coherenceThreshold)
    };
  }

  private calculatePatternStability(pattern: ResonancePattern): number {
    const harmonicRatios = pattern.harmonics.map(h => h / pattern.frequency);
    const idealRatios = Array.from({ length: pattern.harmonics.length }, (_, i) => i + 1);

    return harmonicRatios.reduce((stability, ratio, i) => {
      return stability + (1 - Math.abs(ratio - idealRatios[i]) / idealRatios[i]);
    }, 0) / harmonicRatios.length;
  }

  private calculateDimensionalSync(dimension: number, patterns: ResonancePattern[]): number {
    if (patterns.length < 2) return 1;

    let syncSum = 0;
    let comparisons = 0;

    for (let i = 0; i < patterns.length - 1; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const phase1 = (patterns[i].phase + dimension * Math.PI / 4) % (2 * Math.PI);
        const phase2 = (patterns[j].phase + dimension * Math.PI / 4) % (2 * Math.PI);
        
        syncSum += Math.cos(phase1 - phase2);
        comparisons++;
      }
    }

    return (syncSum / comparisons + 1) / 2; // Normalize to 0-1
  }

  public addPattern(id: string, pattern: Partial<ResonancePattern>): void {
    const fullPattern: ResonancePattern = {
      frequency: this.config.baseFrequency,
      amplitude: 1,
      phase: 0,
      coherence: 1,
      harmonics: this.calculateHarmonics(this.config.baseFrequency),
      ...pattern
    };

    this.patterns.set(id, fullPattern);
  }

  public removePattern(id: string): void {
    this.patterns.delete(id);
  }

  public updatePattern(id: string, updates: Partial<ResonancePattern>): void {
    const pattern = this.patterns.get(id);
    if (pattern) {
      this.patterns.set(id, { ...pattern, ...updates });
    }
  }

  public getMetrics(): ResonanceMetrics {
    return { ...this.metrics };
  }

  public addObserver(callback: (metrics: ResonanceMetrics) => void): void {
    this.observers.add(callback);
  }

  public removeObserver(callback: (metrics: ResonanceMetrics) => void): void {
    this.observers.delete(callback);
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer(this.metrics));
  }

  public updateConfig(newConfig: Partial<ResonanceConfig>): void {
    const oldSamplingRate = this.config.samplingRate;
    this.config = { ...this.config, ...newConfig };

    if (this.config.samplingRate !== oldSamplingRate && this.monitoringInterval) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }
}

export function useQuantumResonanceMonitoring(config?: Partial<ResonanceConfig>) {
  const monitor = useMemo(() => new QuantumResonanceMonitor(config), []);
  const [metrics, setMetrics] = useState<ResonanceMetrics>(monitor.getMetrics());

  useEffect(() => {
    monitor.addObserver(setMetrics);
    monitor.startMonitoring();

    return () => {
      monitor.removeObserver(setMetrics);
      monitor.stopMonitoring();
    };
  }, [monitor]);

  const updatePattern = useCallback((id: string, updates: Partial<ResonancePattern>) => {
    monitor.updatePattern(id, updates);
  }, [monitor]);

  const addPattern = useCallback((id: string, pattern: Partial<ResonancePattern>) => {
    monitor.addPattern(id, pattern);
  }, [monitor]);

  const removePattern = useCallback((id: string) => {
    monitor.removePattern(id);
  }, [monitor]);

  return {
    metrics,
    updatePattern,
    addPattern,
    removePattern,
    monitor
  };
}