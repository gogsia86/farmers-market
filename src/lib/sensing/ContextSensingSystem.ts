import { useEffect, useRef, useState } from 'react';
import { QuantumState } from '../types/quantum';

interface SensorData {
  type: string;
  value: any;
  timestamp: number;
  confidence: number;
}

interface ContextSnapshot {
  user: UserContextData;
  device: DeviceContextData;
  environment: EnvironmentContextData;
  quantum: QuantumState;
}

interface UserContextData {
  attention: number;
  engagement: number;
  fatigue: number;
  expertise: number;
  preferences: Map<string, any>;
}

interface DeviceContextData {
  performance: {
    cpu: number;
    memory: number;
    battery: number;
  };
  capabilities: {
    touch: boolean;
    motion: boolean;
    network: string;
  };
  screen: {
    width: number;
    height: number;
    orientation: string;
  };
}

interface EnvironmentContextData {
  time: number;
  location: {
    latitude?: number;
    longitude?: number;
    timezone: string;
  };
  lighting: number;
  noise: number;
  stability: number;
}

export class ContextSensingSystem {
  private sensors: Map<string, SensorData> = new Map();
  private observers: Set<(snapshot: ContextSnapshot) => void> = new Set();
  private updateInterval: NodeJS.Timeout | null = null;
  private lastSnapshot: ContextSnapshot | null = null;

  constructor(private updateFrequency: number = 1000) {
    this.initializeSensors();
  }

  private initializeSensors() {
    // Device Sensors
    if (typeof window !== 'undefined') {
      // Performance monitoring
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.updateSensor('performance', this.analyzePerformance(entries));
      });
      observer.observe({ entryTypes: ['resource', 'navigation'] });

      // Device motion
      window.addEventListener('devicemotion', (event) => {
        this.updateSensor('motion', {
          acceleration: event.acceleration,
          rotationRate: event.rotationRate
        });
      });

      // Network status
      window.addEventListener('online', () => 
        this.updateSensor('network', { status: 'online' })
      );
      window.addEventListener('offline', () => 
        this.updateSensor('network', { status: 'offline' })
      );

      // Screen changes
      window.addEventListener('resize', () => {
        this.updateSensor('screen', {
          width: window.innerWidth,
          height: window.innerHeight,
          orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
        });
      });

      // User interaction tracking
      const interactionEvents = ['click', 'touchstart', 'mousemove', 'keypress'];
      interactionEvents.forEach(event => {
        window.addEventListener(event, () => {
          this.updateSensor('interaction', {
            type: event,
            timestamp: Date.now()
          });
        });
      });
    }
  }

  private updateSensor(type: string, value: any) {
    this.sensors.set(type, {
      type,
      value,
      timestamp: Date.now(),
      confidence: this.calculateConfidence(type, value)
    });

    this.notifyObservers();
  }

  private calculateConfidence(type: string, value: any): number {
    // Implement confidence calculation based on sensor type and value
    switch (type) {
      case 'performance':
        return value.score > 0.8 ? 0.9 : 0.7;
      case 'motion':
        return value.acceleration ? 0.8 : 0.5;
      case 'network':
        return value.status === 'online' ? 0.9 : 0.7;
      case 'screen':
        return 0.95;
      case 'interaction':
        return 0.85;
      default:
        return 0.5;
    }
  }

  private analyzePerformance(entries: PerformanceEntry[]): any {
    const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);
    const averageDuration = entries.length > 0 ? totalDuration / entries.length : 0;
    
    return {
      score: Math.max(0, Math.min(1, 1 - (averageDuration / 1000))),
      entries: entries.length,
      averageDuration
    };
  }

  private createContextSnapshot(): ContextSnapshot {
    const now = Date.now();
    
    return {
      user: this.getUserContext(),
      device: this.getDeviceContext(),
      environment: this.getEnvironmentContext(),
      quantum: this.calculateQuantumState()
    };
  }

  private getUserContext(): UserContextData {
    const interactions = this.sensors.get('interaction')?.value || [];
    const recentInteractions = Array.isArray(interactions) 
      ? interactions.filter(i => i.timestamp > Date.now() - 5000)
      : [];

    return {
      attention: this.calculateAttention(recentInteractions),
      engagement: this.calculateEngagement(recentInteractions),
      fatigue: this.calculateFatigue(),
      expertise: this.calculateExpertise(),
      preferences: new Map()
    };
  }

  private getDeviceContext(): DeviceContextData {
    const performance = this.sensors.get('performance')?.value || {};
    const motion = this.sensors.get('motion')?.value || {};
    const network = this.sensors.get('network')?.value || {};
    const screen = this.sensors.get('screen')?.value || {};

    return {
      performance: {
        cpu: performance.score || 1,
        memory: performance.score || 1,
        battery: 1 // To be implemented
      },
      capabilities: {
        touch: 'ontouchstart' in window,
        motion: !!motion.acceleration,
        network: network.status || 'unknown'
      },
      screen: {
        width: screen.width || window.innerWidth,
        height: screen.height || window.innerHeight,
        orientation: screen.orientation || 'unknown'
      }
    };
  }

  private getEnvironmentContext(): EnvironmentContextData {
    return {
      time: Date.now(),
      location: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      lighting: this.estimateLighting(),
      noise: this.estimateNoise(),
      stability: this.calculateStability()
    };
  }

  private calculateQuantumState(): QuantumState {
    const userContext = this.getUserContext();
    const deviceContext = this.getDeviceContext();
    const environmentContext = this.getEnvironmentContext();

    return {
      resonance: (userContext.attention + userContext.engagement) / 2,
      coherence: deviceContext.performance.cpu,
      entanglement: this.calculateEntanglement(),
      dimensionality: this.calculateDimensionality()
    };
  }

  // Helper methods
  private calculateAttention(interactions: any[]): number {
    return interactions.length > 0 ? 0.8 : 0.5;
  }

  private calculateEngagement(interactions: any[]): number {
    return interactions.length > 0 ? 0.7 : 0.4;
  }

  private calculateFatigue(): number {
    const hour = new Date().getHours();
    return Math.sin((hour / 24) * Math.PI) * 0.5 + 0.5;
  }

  private calculateExpertise(): number {
    // To be implemented based on user interaction patterns
    return 0.5;
  }

  private estimateLighting(): number {
    const hour = new Date().getHours();
    return Math.sin((hour / 24) * Math.PI * 2) * 0.5 + 0.5;
  }

  private estimateNoise(): number {
    // To be implemented with Web Audio API
    return 0.3;
  }

  private calculateStability(): number {
    const motion = this.sensors.get('motion')?.value;
    return motion ? 0.5 : 1;
  }

  private calculateEntanglement(): number {
    const sensorValues = Array.from(this.sensors.values());
    const recentSensors = sensorValues.filter(
      s => Date.now() - s.timestamp < 5000
    );
    return recentSensors.length / sensorValues.length;
  }

  private calculateDimensionality(): number {
    const activeSensors = Array.from(this.sensors.values()).filter(
      s => Date.now() - s.timestamp < 5000
    );
    return Math.max(1, Math.min(4, activeSensors.length / 2));
  }

  // Public API
  public start() {
    if (!this.updateInterval) {
      this.updateInterval = setInterval(() => {
        const snapshot = this.createContextSnapshot();
        this.lastSnapshot = snapshot;
        this.notifyObservers();
      }, this.updateFrequency);
    }
  }

  public stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  public observe(callback: (snapshot: ContextSnapshot) => void) {
    this.observers.add(callback);
    if (this.lastSnapshot) {
      callback(this.lastSnapshot);
    }
    return () => this.observers.delete(callback);
  }

  private notifyObservers() {
    const snapshot = this.createContextSnapshot();
    this.observers.forEach(observer => observer(snapshot));
  }
}

// Hook for using the context sensing system
export function useContextSensing() {
  const [snapshot, setSnapshot] = useState<ContextSnapshot | null>(null);
  const systemRef = useRef<ContextSensingSystem | null>(null);

  useEffect(() => {
    if (!systemRef.current) {
      systemRef.current = new ContextSensingSystem();
      systemRef.current.start();
    }

    const unsubscribe = systemRef.current.observe(setSnapshot);

    return () => {
      unsubscribe();
      systemRef.current?.stop();
    };
  }, []);

  return snapshot;
}