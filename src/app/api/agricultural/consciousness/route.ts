/**
 * AGRICULTURAL CONSCIOUSNESS API - LAZY TRACED
 * Demonstrates comprehensive tracing with AI operations
 *
 * OPTIMIZATION: Uses lazy-loaded tracing to reduce server bundle size
 * - Tracing only loaded when enabled (saves ~50KB in bundle)
 * - Maintains full agricultural consciousness when tracing is active
 */

import { createLogger } from "@/lib/logger";
import {
  traceIfEnabled,
  type TraceAttributes,
} from "@/lib/tracing/lazy-tracer";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("agricultural-consciousness-api");

async function measureAgriculturalConsciousness() {
  const metrics = {
    soilHealth: Math.random() * 100,
    seasonalAlignment: Math.random() * 100,
    biodynamicCompliance: Math.random() * 100,
  };

  // Use lazy tracing - only loads OpenTelemetry if enabled
  await traceIfEnabled(
    "AGRICULTURAL_CONSCIOUSNESS_MEASUREMENT",
    {
      "agricultural.soil_health": metrics.soilHealth,
      "agricultural.seasonal_alignment": metrics.seasonalAlignment,
      "agricultural.biodynamic_compliance": metrics.biodynamicCompliance,
      "agricultural.operation": "measure_consciousness",
    } as TraceAttributes,
    async () => {
      // Measurement logic (already computed above for simplicity)
      return metrics;
    },
  );

  return metrics;
}

export async function GET(_request: NextRequest) {
  try {
    const consciousness = await measureAgriculturalConsciousness();

    // Log consciousness measurement
    logger.info("Agricultural consciousness measured", {
      soilHealth: consciousness.soilHealth,
      seasonalAlignment: consciousness.seasonalAlignment,
      biodynamicCompliance: consciousness.biodynamicCompliance,
    });

    return NextResponse.json({
      success: true,
      consciousness,
      timestamp: new Date().toISOString(),
      traced: process.env.ENABLE_TRACING !== "false",
    });
  } catch (error) {
    logger.error(
      "Failed to measure agricultural consciousness",
      error as Error,
    );

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
