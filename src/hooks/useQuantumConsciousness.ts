/**
 * QUANTUM CONSCIOUSNESS HOOK
 * Track component behavior and performance metrics
 * Reference: 01_DIVINE_CORE_PRINCIPLES.instructions.md
 */

import { createLogger } from "@/lib/utils/logger";
import { useEffect, useRef, useState } from "react";

// Create dedicated logger for quantum consciousness
const quantumLogger = createLogger("QuantumConsciousness");

interface ConsciousnessOptions {
  trackPerformance?: boolean;
  trackErrors?: boolean;
  trackInteractions?: boolean;
}

interface Measurement {
  startTime: number;
  operation: string;
  success: () => void;
  failure: (error: any) => void;
}

export function useQuantumConsciousness(
  componentName: string,
  options: ConsciousnessOptions = {},
) {
  const metrics = useRef({
    renders: 0,
    interactions: 0,
    errors: 0,
    measurements: [] as Array<{
      operation: string;
      duration: number;
      success: boolean;
    }>,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    metrics.current.renders++;

    if (!isInitialized) {
      quantumLogger.debug(
        `Quantum Consciousness Initialized: ${componentName}`,
        {
          consciousness: "divine",
        },
      );
      setIsInitialized(true);
    }
  });

  const startMeasurement = (operation: string): Measurement => {
    const startTime = performance.now();

    return {
      startTime,
      operation,
      success: () => {
        const duration = performance.now() - startTime;
        metrics.current.measurements.push({
          operation,
          duration,
          success: true,
        });

        if (options.trackPerformance && duration > 100) {
          quantumLogger.warn(`Slow operation detected`, {
            componentName,
            operation,
            duration: parseFloat(duration.toFixed(2)),
            threshold: 100,
          });
        }
      },
      failure: (error: any) => {
        const duration = performance.now() - startTime;
        metrics.current.measurements.push({
          operation,
          duration,
          success: false,
        });
        metrics.current.errors++;

        if (options.trackErrors) {
          quantumLogger.error(`Operation failed`, {
            componentName,
            operation,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      },
    };
  };

  const trackInteraction = (interactionName: string) => {
    metrics.current.interactions++;

    if (options.trackInteractions) {
      quantumLogger.debug(`Interaction tracked`, {
        componentName,
        interactionName,
      });
    }
  };

  const getMetrics = () => ({
    ...metrics.current,
    averageMeasurementTime:
      metrics.current.measurements.length > 0
        ? metrics.current.measurements.reduce(
            (sum: any, m: any) => sum + m.duration,
            0,
          ) / metrics.current.measurements.length
        : 0,
    successRate:
      metrics.current.measurements.length > 0
        ? metrics.current.measurements.filter((m: any) => m.success).length /
          metrics.current.measurements.length
        : 1,
  });

  return {
    startMeasurement,
    trackInteraction,
    getMetrics,
    isInitialized,
  };
}
