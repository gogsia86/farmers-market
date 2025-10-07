import { useCallback, useEffect, useRef } from 'react';

interface QuantumState {
  elements: React.ReactNode[];
  currentHarmony: {
    resonance: number;
    balance: number;
    flow: number;
    energyAlignment: number;
  };
  environmentalFactors: {
    timeOfDay: Date;
    userInteractionPatterns: any[];
    deviceCapabilities: {
      screen: {
        width: number;
        height: number;
      };
      performance: number;
    };
  };
  dissonance: number;
}

interface QuantumObserverConfig {
  onStateChange: (state: QuantumState) => void;
}

interface ElementMetrics {
  element: Element;
  interactions: number;
  visibility: number;
  performance: number;
}

export const useQuantumObserver = ({ onStateChange }: QuantumObserverConfig) => {
  const metricsRef = useRef<Map<Element, ElementMetrics>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const calculateDissonance = useCallback((metrics: ElementMetrics[]) => {
    const totalElements = metrics.length;
    if (totalElements === 0) return 0;

    const averageVisibility = metrics.reduce((acc, m) => acc + m.visibility, 0) / totalElements;
    const averageInteractions = metrics.reduce((acc, m) => acc + m.interactions, 0) / totalElements;
    const averagePerformance = metrics.reduce((acc, m) => acc + m.performance, 0) / totalElements;

    // Dissonance increases when elements have poor visibility, low interactions, or poor performance
    return 1 - ((averageVisibility + averageInteractions + averagePerformance) / 3);
  }, []);

  const updateMetrics = useCallback((element: Element, updates: Partial<ElementMetrics>) => {
    const current = metricsRef.current.get(element) || {
      element,
      interactions: 0,
      visibility: 0,
      performance: 1
    };

    metricsRef.current.set(element, {
      ...current,
      ...updates
    });

    const metrics = Array.from(metricsRef.current.values());
    const dissonance = calculateDissonance(metrics);

    onStateChange({
      elements: metrics.map(m => m.element),
      currentHarmony: {
        resonance: 1 - dissonance,
        balance: metrics.length > 0 ? metrics.reduce((acc, m) => acc + m.visibility, 0) / metrics.length : 0,
        flow: metrics.length > 0 ? metrics.reduce((acc, m) => acc + m.performance, 0) / metrics.length : 0,
        energyAlignment: metrics.length > 0 ? metrics.reduce((acc, m) => acc + m.interactions, 0) / metrics.length : 0
      },
      environmentalFactors: {
        timeOfDay: new Date(),
        userInteractionPatterns: [], // To be implemented
        deviceCapabilities: {
          screen: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          performance: window.navigator.hardwareConcurrency
        }
      },
      dissonance
    });
  }, [calculateDissonance, onStateChange]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        updateMetrics(entry.target, {
          visibility: entry.intersectionRatio
        });
      });
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [updateMetrics]);

  const observeQuantumState = useCallback((container: HTMLElement) => {
    const elements = container.children;
    Array.from(elements).forEach(element => {
      // Start observing visibility
      observerRef.current?.observe(element);

      // Observe interactions
      const interactionHandler = () => {
        const current = metricsRef.current.get(element);
        if (current) {
          updateMetrics(element, {
            interactions: current.interactions + 1
          });
        }
      };

      element.addEventListener('click', interactionHandler);
      element.addEventListener('mouseover', interactionHandler);

      // Measure performance
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const paintTiming = entries[entries.length - 1];
        if (paintTiming) {
          updateMetrics(element, {
            performance: Math.min(1, 1000 / paintTiming.duration) // Normalize to 0-1 range
          });
        }
      });

      observer.observe({ entryTypes: ['paint'] });
    });
  }, [updateMetrics]);

  return {
    observeQuantumState
  };
};