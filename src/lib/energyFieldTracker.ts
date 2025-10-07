import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface EnergyFieldMetrics {
  fieldStrength: number;        // 0-1: Overall energy field strength
  coherenceLevel: number;       // 0-1: Field coherence
  resonanceFrequency: number;   // Hz: Natural resonance frequency
  stabilityIndex: number;       // 0-1: Field stability
  harmonicPatterns: number[];   // Array of harmonic frequencies
}

export interface FieldZone {
  id: string;
  position: [number, number, number]; // [x, y, z] coordinates
  strength: number;
  frequency: number;
  phase: number;
}

export interface EnergyFieldConfig {
  samplingRate: number;        // Hz
  resolutionScale: number;     // 1-10
  sensitivityThreshold: number;// 0-1
  harmonicAnalysis: boolean;
  dimensionalMapping: boolean;
}

export class EnergyFieldTracker {
  private config: EnergyFieldConfig;
  private metrics: EnergyFieldMetrics;
  private zones: Map<string, FieldZone>;
  private observers: Set<(metrics: EnergyFieldMetrics) => void>;
  private measurementInterval: NodeJS.Timeout | null;
  private lastUpdate: number;

  constructor(config: Partial<EnergyFieldConfig> = {}) {
    this.config = {
      samplingRate: 60,         // 60Hz default sampling
      resolutionScale: 5,       // Medium resolution
      sensitivityThreshold: 0.1, // 10% minimum sensitivity
      harmonicAnalysis: true,
      dimensionalMapping: true,
      ...config
    };

    this.metrics = {
      fieldStrength: 1,
      coherenceLevel: 1,
      resonanceFrequency: 432, // Natural resonance frequency
      stabilityIndex: 1,
      harmonicPatterns: [432, 528, 639] // Initial harmonic patterns
    };

    this.zones = new Map();
    this.observers = new Set();
    this.measurementInterval = null;
    this.lastUpdate = Date.now();
  }

  public startTracking(): void {
    if (this.measurementInterval) return;

    const interval = Math.floor(1000 / this.config.samplingRate);
    this.measurementInterval = setInterval(() => this.measure(), interval);
  }

  public stopTracking(): void {
    if (this.measurementInterval) {
      clearInterval(this.measurementInterval);
      this.measurementInterval = null;
    }
  }

  private measure(): void {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdate) / 1000; // Convert to seconds
    this.lastUpdate = now;

    // Update field metrics based on active zones
    this.updateFieldMetrics(deltaTime);

    // Analyze harmonic patterns if enabled
    if (this.config.harmonicAnalysis) {
      this.analyzeHarmonics();
    }

    // Map dimensional interactions if enabled
    if (this.config.dimensionalMapping) {
      this.mapDimensions();
    }

    // Notify observers of changes
    this.notifyObservers();
  }

  private updateFieldMetrics(deltaTime: number): void {
    if (this.zones.size === 0) return;

    let totalStrength = 0;
    let totalCoherence = 0;
    let dominantFrequency = 0;
    let maxStrength = 0;

    this.zones.forEach(zone => {
      // Update zone phase
      zone.phase = (zone.phase + zone.frequency * deltaTime) % (2 * Math.PI);
      
      // Calculate instantaneous strength with phase
      const instantStrength = zone.strength * (0.5 + 0.5 * Math.cos(zone.phase));
      
      totalStrength += instantStrength;
      totalCoherence += this.calculateZoneCoherence(zone);
      
      if (instantStrength > maxStrength) {
        maxStrength = instantStrength;
        dominantFrequency = zone.frequency;
      }
    });

    // Normalize metrics
    const averageStrength = totalStrength / this.zones.size;
    const averageCoherence = totalCoherence / this.zones.size;

    this.metrics.fieldStrength = Math.max(0, Math.min(1, averageStrength));
    this.metrics.coherenceLevel = Math.max(0, Math.min(1, averageCoherence));
    this.metrics.resonanceFrequency = dominantFrequency;
    this.metrics.stabilityIndex = this.calculateStabilityIndex();
  }

  private calculateZoneCoherence(zone: FieldZone): number {
    // Calculate coherence based on zone parameters and neighbors
    const neighboringZones = this.findNeighboringZones(zone);
    if (neighboringZones.length === 0) return 1;

    let coherenceSum = 0;
    neighboringZones.forEach(neighbor => {
      const frequencyRatio = zone.frequency / neighbor.frequency;
      const phaseAlignment = Math.cos(zone.phase - neighbor.phase);
      coherenceSum += (1 - Math.abs(1 - frequencyRatio)) * (0.5 + 0.5 * phaseAlignment);
    });

    return coherenceSum / neighboringZones.length;
  }

  private findNeighboringZones(zone: FieldZone): FieldZone[] {
    const neighbors: FieldZone[] = [];
    const maxDistance = 2 * this.config.resolutionScale;

    this.zones.forEach(other => {
      if (other.id === zone.id) return;

      const distance = Math.sqrt(
        Math.pow(other.position[0] - zone.position[0], 2) +
        Math.pow(other.position[1] - zone.position[1], 2) +
        Math.pow(other.position[2] - zone.position[2], 2)
      );

      if (distance <= maxDistance) {
        neighbors.push(other);
      }
    });

    return neighbors;
  }

  private calculateStabilityIndex(): number {
    const recentStrengths: number[] = [];
    const stabilityWindow = Math.min(10, this.config.samplingRate);
    
    // Calculate stability based on recent field strength variations
    const variance = recentStrengths.reduce((sum, strength) => {
      const diff = strength - this.metrics.fieldStrength;
      return sum + diff * diff;
    }, 0) / stabilityWindow;

    return Math.max(0, Math.min(1, 1 - Math.sqrt(variance)));
  }

  private analyzeHarmonics(): void {
    const fundamentalFreq = this.metrics.resonanceFrequency;
    const harmonics: number[] = [fundamentalFreq];
    
    // Generate harmonic series based on fundamental frequency
    for (let i = 2; i <= 7; i++) {
      const harmonic = fundamentalFreq * i;
      if (this.isHarmonicActive(harmonic)) {
        harmonics.push(harmonic);
      }
    }

    this.metrics.harmonicPatterns = harmonics;
  }

  private isHarmonicActive(frequency: number): boolean {
    const tolerance = 0.1; // 10% frequency tolerance
    
    return Array.from(this.zones.values()).some(zone => {
      const relativeError = Math.abs(zone.frequency - frequency) / frequency;
      return relativeError <= tolerance && zone.strength >= this.config.sensitivityThreshold;
    });
  }

  private mapDimensions(): void {
    // Implementation for dimensional mapping would go here
    // This would involve analyzing how energy fields interact across dimensions
  }

  public addZone(zone: FieldZone): void {
    this.zones.set(zone.id, zone);
  }

  public removeZone(zoneId: string): void {
    this.zones.delete(zoneId);
  }

  public updateZone(zoneId: string, updates: Partial<FieldZone>): void {
    const zone = this.zones.get(zoneId);
    if (zone) {
      this.zones.set(zoneId, { ...zone, ...updates });
    }
  }

  public getMetrics(): EnergyFieldMetrics {
    return { ...this.metrics };
  }

  public addObserver(callback: (metrics: EnergyFieldMetrics) => void): void {
    this.observers.add(callback);
  }

  public removeObserver(callback: (metrics: EnergyFieldMetrics) => void): void {
    this.observers.delete(callback);
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer(this.metrics));
  }

  public updateConfig(newConfig: Partial<EnergyFieldConfig>): void {
    const oldSamplingRate = this.config.samplingRate;
    this.config = { ...this.config, ...newConfig };

    // Restart tracking if sampling rate changed
    if (this.config.samplingRate !== oldSamplingRate && this.measurementInterval) {
      this.stopTracking();
      this.startTracking();
    }
  }
}

export function useEnergyFieldTracking(config?: Partial<EnergyFieldConfig>) {
  const tracker = useMemo(() => new EnergyFieldTracker(config), []);
  const [metrics, setMetrics] = useState<EnergyFieldMetrics>(tracker.getMetrics());

  useEffect(() => {
    tracker.addObserver(setMetrics);
    tracker.startTracking();

    return () => {
      tracker.removeObserver(setMetrics);
      tracker.stopTracking();
    };
  }, [tracker]);

  const updateZone = useCallback((zoneId: string, updates: Partial<FieldZone>) => {
    tracker.updateZone(zoneId, updates);
  }, [tracker]);

  const addZone = useCallback((zone: FieldZone) => {
    tracker.addZone(zone);
  }, [tracker]);

  const removeZone = useCallback((zoneId: string) => {
    tracker.removeZone(zoneId);
  }, [tracker]);

  return {
    metrics,
    updateZone,
    addZone,
    removeZone,
    tracker
  };
}