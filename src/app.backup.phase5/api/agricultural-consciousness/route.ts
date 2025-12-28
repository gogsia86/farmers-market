/**
 * AGRICULTURAL CONSCIOUSNESS API - LAZY TRACED
 * Demonstrates comprehensive tracing with AI operations
 *
 * OPTIMIZATION: Uses lazy-loaded tracing to reduce server bundle size
 * - Tracing only loaded when enabled (saves ~50KB in bundle)
 * - Maintains full agricultural consciousness when tracing is active
 */

import { NextRequest, NextResponse } from "next/server";
import {
  traceIfEnabled,
  type TraceAttributes,
} from "@/lib/tracing/lazy-tracer";

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
    console.log("Agricultural consciousness measured:", consciousness);

    return NextResponse.json({
      success: true,
      consciousness,
      timestamp: new Date().toISOString(),
      traced: process.env.ENABLE_TRACING !== "false",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
