/**
 * FARMS API ROUTE - WITH DIVINE TRACING & RATE LIMITING
 * Comprehensive tracing for agricultural operations
 *
 * OPTIMIZATION: Uses lazy-loaded tracing to reduce server bundle size
 * - Tracing only loaded when enabled (saves ~50KB in bundle)
 * - Maintains full agricultural consciousness when tracing is active
 */

import { database } from "@/lib/database";
import {
  traceIfEnabled,
  type AgriculturalOperation,
} from "@/lib/tracing/lazy-tracer";
import { NextRequest, NextResponse } from "next/server";
import {
  rateLimiters,
  createRateLimitResponse,
} from "@/lib/middleware/rate-limiter";

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimit = await rateLimiters.public.check(request);
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as
      | "ACTIVE"
      | "PENDING_VERIFICATION"
      | "SUSPENDED"
      | "INACTIVE"
      | null;
    const season = searchParams.get("season");

    // Lazy trace database operation (only loads OpenTelemetry if enabled)
    const farms = await traceIfEnabled(
      "CROP_PLANNING" as AgriculturalOperation,
      {
        "http.method": "GET",
        "http.route": "/api/farms",
        "agricultural.resource": "farms",
        "db.operation": "findMany",
        "db.table": "farm",
        "agricultural.season": season || "all",
        "query.status": status || "all",
      },
      async () => {
        return await database.farm.findMany({
          where: {
            ...(status && { status: status as any }),
            ...(season && { seasonalAlignment: season }),
          },
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            products: {
              where: { inStock: true },
              take: 5,
            },
            _count: {
              select: {
                products: true,
                reviews: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        });
      },
    );

    return NextResponse.json({
      success: true,
      data: farms,
      meta: {
        count: farms.length,
        season: season || "all",
        agriculturalConsciousness: "active",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch farms",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Lazy trace farm creation (only loads OpenTelemetry if enabled)
    const farm = await traceIfEnabled(
      "PLANTING" as AgriculturalOperation,
      {
        "http.method": "POST",
        "http.route": "/api/farms",
        "agricultural.operation": "create_farm",
        "db.operation": "create",
        "db.table": "farm",
        "farm.name": body.name,
        "farm.owner": body.ownerId,
      },
      async () => {
        return await database.farm.create({
          data: {
            name: body.name,
            description: body.description,
            address: body.address,
            ownerId: body.ownerId,
            status: "PENDING_VERIFICATION" as any,
            latitude: body.coordinates?.lat ?? null,
            longitude: body.coordinates?.lng ?? null,
          } as any, // Type assertion for coordinates conversion
        });
      },
    );

    return NextResponse.json(
      {
        success: true,
        data: farm,
        message: "Farm consciousness manifested successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create farm",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
