import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useQuantumObserver } from '../hooks/useQuantumObserver';
import { QuantumState } from '../types/quantum';

export interface AdaptiveContextState {
  deviceContext: DeviceContext;
  userContext: UserContext;
  environmentalContext: EnvironmentalContext;
  quantumState: QuantumState;
}

interface DeviceContext {
  screen: {
    width: number;
    height: number;
    orientation: 'portrait' | 'landscape';
    pixelRatio: number;
  };
  performance: {
    memory: number;
    cpu: number;
    battery: number;
  };
  capabilities: {
    touch: boolean;
    motion: boolean;
    network: 'offline' | '2g' | '3g' | '4g' | '5g' | 'wifi';
  };
}

interface UserContext {
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    animations: boolean;
    accessibility: {
      reducedMotion: boolean;
      contrast: 'normal' | 'high';
      fontSize: number;
    };
  };
  behavior: {
    interactionFrequency: number;
    sessionDuration: number;
    navigationPatterns: string[];
    lastInteraction: Date;
  };
  consciousness: {
    level: number;
    focus: number;
    engagement: number;
    resonance: number;
  };
}

interface EnvironmentalContext {
  time: {
    local: Date;
    dayPhase: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';
    season: 'spring' | 'summer' | 'autumn' | 'winter';
  };
  location: {
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    timezone: string;
  };
  natural: {
    moonPhase: number;
    solarActivity: number;
    biorhythm: number;
  };
}

export interface AdaptiveConfig {
  adaptationThreshold: number;
  evolutionRate: number;
  quantumSensitivity: number;
}

const defaultConfig: AdaptiveConfig = {
  adaptationThreshold: 0.3,
  evolutionRate: 0.5,
  quantumSensitivity: 0.7
};

export const AdaptiveContext = createContext<AdaptiveContextState | null>(null);

export const useAdaptiveContext = () => {
  const context = useContext(AdaptiveContext);
  if (!context) {
    throw new Error('useAdaptiveContext must be used within an AdaptiveProvider');
  }
  return context;
};

export const AdaptiveProvider: React.FC<{
  children: React.ReactNode;
  config?: Partial<AdaptiveConfig>;
}> = ({ children, config }) => {
  const mergedConfig = { ...defaultConfig, ...config };
  const [state, setState] = useState<AdaptiveContextState>({
    deviceContext: initializeDeviceContext(),
    userContext: initializeUserContext(),
    environmentalContext: initializeEnvironmentalContext(),
    quantumState: {
      resonance: 0,
      coherence: 0,
      entanglement: 0,
      dimensionality: 1
    }
  });

  const { observeQuantumState } = useQuantumObserver({
    onStateChange: (newQuantumState) => {
      updateQuantumState(newQuantumState);
    }
  });

  const updateQuantumState = (newState: Partial<QuantumState>) => {
    setState(prev => ({
      ...prev,
      quantumState: {
        ...prev.quantumState,
        ...newState
      }
    }));
  };

  useEffect(() => {
    // Initialize observers and event listeners
    const resizeObserver = new ResizeObserver(handleResize);
    const performanceObserver = new PerformanceObserver(handlePerformance);
    const networkStatusObserver = new NetworkInformation();

    // Start observing
    if (typeof window !== 'undefined') {
      resizeObserver.observe(document.documentElement);
      performanceObserver.observe({ entryTypes: ['resource', 'navigation'] });
      window.addEventListener('devicemotion', handleDeviceMotion);
      window.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      resizeObserver.disconnect();
      performanceObserver.disconnect();
      if (typeof window !== 'undefined') {
        window.removeEventListener('devicemotion', handleDeviceMotion);
        window.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, []);

  // Event handlers
  const handleResize = (entries: ResizeObserverEntry[]) => {
    const root = entries[0];
    if (root) {
      setState(prev => ({
        ...prev,
        deviceContext: {
          ...prev.deviceContext,
          screen: {
            ...prev.deviceContext.screen,
            width: root.contentRect.width,
            height: root.contentRect.height,
            orientation: root.contentRect.width > root.contentRect.height ? 'landscape' : 'portrait'
          }
        }
      }));
    }
  };

  const handlePerformance = (list: PerformanceObserverEntryList) => {
    const entries = list.getEntries();
    // Calculate performance metrics
    const performanceScore = calculatePerformanceScore(entries);
    
    setState(prev => ({
      ...prev,
      deviceContext: {
        ...prev.deviceContext,
        performance: {
          ...prev.deviceContext.performance,
          ...performanceScore
        }
      }
    }));
  };

  const handleDeviceMotion = (event: DeviceMotionEvent) => {
    // Update device motion related context
    setState(prev => ({
      ...prev,
      deviceContext: {
        ...prev.deviceContext,
        capabilities: {
          ...prev.deviceContext.capabilities,
          motion: true
        }
      }
    }));
  };

  const handleVisibilityChange = () => {
    // Update user behavior context
    setState(prev => ({
      ...prev,
      userContext: {
        ...prev.userContext,
        behavior: {
          ...prev.userContext.behavior,
          lastInteraction: new Date()
        }
      }
    }));
  };

  return (
    <AdaptiveContext.Provider value={state}>
      {children}
    </AdaptiveContext.Provider>
  );
};

// Initialization helpers
function initializeDeviceContext(): DeviceContext {
  return {
    screen: {
      width: typeof window !== 'undefined' ? window.innerWidth : 1280,
      height: typeof window !== 'undefined' ? window.innerHeight : 800,
      orientation: typeof window !== 'undefined' && window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1
    },
    performance: {
      memory: 1,
      cpu: 1,
      battery: 1
    },
    capabilities: {
      touch: typeof window !== 'undefined' ? 'ontouchstart' in window : false,
      motion: typeof window !== 'undefined' ? 'DeviceMotionEvent' in window : false,
      network: typeof navigator !== 'undefined' && navigator.onLine ? 'wifi' : 'offline'
    }
  };
}

function initializeUserContext(): UserContext {
  return {
    preferences: {
      theme: 'auto',
      animations: true,
      accessibility: {
        reducedMotion: false,
        contrast: 'normal',
        fontSize: 16
      }
    },
    behavior: {
      interactionFrequency: 0,
      sessionDuration: 0,
      navigationPatterns: [],
      lastInteraction: new Date()
    },
    consciousness: {
      level: 0.5,
      focus: 0.5,
      engagement: 0.5,
      resonance: 0.5
    }
  };
}

function initializeEnvironmentalContext(): EnvironmentalContext {
  const now = new Date();
  return {
    time: {
      local: now,
      dayPhase: getDayPhase(now),
      season: getSeason(now)
    },
    location: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    natural: {
      moonPhase: calculateMoonPhase(now),
      solarActivity: 0.5,
      biorhythm: 0.5
    }
  };
}

// Helper functions
function getDayPhase(date: Date): 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night' {
  const hour = date.getHours();
  if (hour < 6) return 'night';
  if (hour < 8) return 'dawn';
  if (hour < 12) return 'morning';
  if (hour < 14) return 'noon';
  if (hour < 18) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

function getSeason(date: Date): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

function calculateMoonPhase(date: Date): number {
  // Simplified moon phase calculation
  const phase = ((date.getTime() / 86400000) % 29.5) / 29.5;
  return phase;
}

function calculatePerformanceScore(entries: PerformanceEntry[]): {
  memory: number;
  cpu: number;
  battery: number;
} {
  // Calculate normalized performance scores
  const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);
  const avgDuration = entries.length > 0 ? totalDuration / entries.length : 0;
  const normalizedScore = Math.max(0, Math.min(1, 1 - (avgDuration / 1000)));

  return {
    memory: normalizedScore,
    cpu: normalizedScore,
    battery: 1 // To be implemented with Battery API
  };
}