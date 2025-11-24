/**
 * AGRICULTURAL TRACING SYSTEM
 * Divine tracing with agricultural consciousness
 */

import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("agricultural-consciousness", "1.0.0");

/**
 * Agricultural operation types
 */
export enum AgriculturalOperation {
  CROP_PLANNING = "crop.planning",
  PLANTING = "crop.planting",
  HARVESTING = "crop.harvesting",
  SOIL_ANALYSIS = "soil.analysis",
  WEATHER_PREDICTION = "weather.prediction",
  LUNAR_CALCULATION = "lunar.calculation",
  CONSCIOUSNESS_MEASUREMENT = "consciousness.measurement",
  BIODYNAMIC_ASSESSMENT = "biodynamic.assessment",
}

/**
 * Trace agricultural operation with divine consciousness
 */
export async function traceAgriculturalOperation<T>(
  operation: AgriculturalOperation,
  attributes: Record<string, string | number | boolean>,
  fn: (span: any) => Promise<T>,
): Promise<T> {
  return tracer.startActiveSpan(operation, async (span) => {
    try {
      // Add agricultural attributes
      span.setAttributes(attributes);

      const result = await fn(span);

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Trace seasonal operation
 */
export async function traceSeasonalOperation<T>(
  season: string,
  operation: string,
  fn: () => Promise<T>,
): Promise<T> {
  return traceAgriculturalOperation(
    AgriculturalOperation.CROP_PLANNING,
    {
      "agricultural.season": season,
      "agricultural.operation_type": operation,
    },
    async (span) => {
      span.addEvent(`Starting ${operation} for ${season} season`);
      const result = await fn();
      span.addEvent(`Completed ${operation} for ${season} season`);
      return result;
    },
  );
}

/**
 * Trace lunar phase calculation
 */
export async function traceLunarOperation<T>(
  phase: string,
  fn: () => Promise<T>,
): Promise<T> {
  return traceAgriculturalOperation(
    AgriculturalOperation.LUNAR_CALCULATION,
    {
      "lunar.phase": phase,
      "biodynamic.alignment": "calculating",
    },
    async (span) => {
      span.addEvent(`Calculating lunar influence for ${phase} phase`);
      const result = await fn();
      span.addEvent(`Lunar calculation complete`);
      return result;
    },
  );
}

/**
 * Trace consciousness measurement
 */
export async function traceConsciousnessMeasurement<T>(
  consciousnessLevel: number,
  fn: () => Promise<T>,
): Promise<T> {
  return traceAgriculturalOperation(
    AgriculturalOperation.CONSCIOUSNESS_MEASUREMENT,
    {
      "agricultural.consciousness_level": consciousnessLevel,
      "divine.energy": consciousnessLevel > 0.7 ? "high" : "moderate",
    },
    async () => await fn(),
  );
}

/**
 * Add agricultural event to current span
 */
export function addAgriculturalEvent(
  eventName: string,
  attributes?: Record<string, string | number | boolean>,
): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.addEvent(eventName, {
      "agricultural.event": true,
      ...attributes,
    });
  }
}

/**
 * Set agricultural attributes on current span
 */
export function setAgriculturalAttributes(
  attributes: Record<string, string | number | boolean>,
) {
  const span = trace.getActiveSpan();
  if (span) {
    span.setAttributes({
      "agricultural.metadata": true,
      ...attributes,
    });
  }
}
