/**
 * AGRICULTURAL CONSCIOUSNESS API - TRACED
 * Demonstrates comprehensive tracing with AI operations
 */

import { trace } from "@opentelemetry/api";
import { NextRequest, NextResponse } from "next/server";

const tracer = trace.getTracer("agricultural-consciousness-api", "1.0.0");

async function measureAgriculturalConsciousness() {
  return tracer.startActiveSpan(
    "measure-agricultural-consciousness",
    async (span) => {
      try {
        const metrics = {
          soilHealth: Math.random() * 100,
          seasonalAlignment: Math.random() * 100,
          biodynamicCompliance: Math.random() * 100,
        };

        span.setAttributes({
          "agricultural.soil_health": metrics.soilHealth,
          "agricultural.seasonal_alignment": metrics.seasonalAlignment,
          "agricultural.biodynamic_compliance": metrics.biodynamicCompliance,
        });

        return metrics;
      } finally {
        span.end();
      }
    },
  );
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
