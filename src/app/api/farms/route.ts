/**
 * FARMS API ROUTE - WITH DIVINE TRACING & RATE LIMITING
 * Comprehensive tracing for agricultural operations
 */

import { database } from "@/lib/database";
import {
  AgriculturalOperation,
  setAgriculturalAttributes,
  traceAgriculturalOperation,
} from "@/lib/tracing/agricultural-tracer";
import { trace } from "@opentelemetry/api";
import { NextRequest, NextResponse } from "next/server";
import {
  rateLimiters,
  createRateLimitResponse,
} from "@/lib/middleware/rate-limiter";

const tracer = trace.getTracer("farms-api", "1.0.0");

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimit = await rateLimiters.public.check(request);
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit);
  }

  return tracer.startActiveSpan("GET /api/farms", async (span) => {
    try {
      // Add request attributes
      setAgriculturalAttributes({
        "http.method": "GET",
        "http.route": "/api/farms",
        "agricultural.resource": "farms",
      });

      const searchParams = request.nextUrl.searchParams;
      const status = searchParams.get("status") as
        | "ACTIVE"
        | "PENDING_VERIFICATION"
        | "SUSPENDED"
        | "INACTIVE"
        | null;
      const season = searchParams.get("season");

      span.addEvent("Querying farms from database", {
        "query.status": status || "all",
        "query.season": season || "all",
      });

      // Trace database operation
      const farms = await traceAgriculturalOperation(
        AgriculturalOperation.CROP_PLANNING,
        {
          "db.operation": "findMany",
          "db.table": "farm",
          "agricultural.season": season || "all",
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

      span.addEvent("Farms retrieved successfully", {
        "farms.count": farms.length,
      });

      span.setStatus({ code: 1 }); // OK

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
      span.setStatus({
        code: 2, // ERROR
        message: error instanceof Error ? error.message : "Unknown error",
      });
      span.recordException(error as Error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch farms",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    } finally {
      span.end();
    }
  });
}

export async function POST(request: NextRequest) {
  return tracer.startActiveSpan("POST /api/farms", async (span) => {
    try {
      setAgriculturalAttributes({
        "http.method": "POST",
        "http.route": "/api/farms",
        "agricultural.operation": "create_farm",
      });

      const body = await request.json();

      span.addEvent("Creating new farm", {
        "farm.name": body.name,
        "farm.owner": body.ownerId,
      });

      // Trace farm creation
      const farm = await traceAgriculturalOperation(
        AgriculturalOperation.PLANTING,
        {
          "db.operation": "create",
          "db.table": "farm",
          "farm.name": body.name,
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

      span.addEvent("Farm created successfully", {
        "farm.id": farm.id,
      });

      span.setStatus({ code: 1 });

      return NextResponse.json(
        {
          success: true,
          data: farm,
          message: "Farm consciousness manifested successfully",
        },
        { status: 201 },
      );
    } catch (error) {
      span.setStatus({
        code: 2,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      span.recordException(error as Error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to create farm",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    } finally {
      span.end();
    }
  });
}
