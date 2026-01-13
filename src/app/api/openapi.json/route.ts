import { readFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

/**
 * GET /api/openapi.json
 *
 * Serves the OpenAPI specification as JSON.
 * Reads the pre-converted JSON spec for Swagger UI consumption.
 *
 * @route GET /api/openapi.json
 * @returns OpenAPI 3.0.3 specification in JSON format
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/openapi.json');
 * const spec = await response.json();
 * ```
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Read the OpenAPI JSON file (pre-converted from YAML)
    const openapiPath = join(process.cwd(), "docs", "api", "openapi.json");
    const openapiContent = readFileSync(openapiPath, "utf8");
    const openapiJson = JSON.parse(openapiContent) as Record<string, any>;

    // Determine the base URL based on the request
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host") || "localhost:3001";
    const baseUrl = `${protocol}://${host}`;

    // Update server URLs dynamically
    if (openapiJson.servers && Array.isArray(openapiJson.servers)) {
      // Check if current host is already in servers list
      const hasCurrentHost = openapiJson.servers.some(
        (server: any) => server.url === baseUrl,
      );

      // If not, add it as the first server
      if (!hasCurrentHost) {
        openapiJson.servers.unshift({
          url: baseUrl,
          description: "Current server",
        });
      }
    }

    // Return JSON response with appropriate headers
    return NextResponse.json(openapiJson, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Failed to load OpenAPI specification:", error);

    // Return a minimal OpenAPI spec as fallback
    const fallbackSpec = {
      openapi: "3.0.3",
      info: {
        title: "Farmers Market Platform API",
        version: "1.0.0",
        description:
          "API documentation is temporarily unavailable. Please try again later.",
      },
      servers: [
        {
          url: `${request.headers.get("x-forwarded-proto") || "http"}://${request.headers.get("host") || "localhost:3001"}`,
          description: "Current server",
        },
      ],
      paths: {},
    };

    return NextResponse.json(fallbackSpec, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  }
}

/**
 * OPTIONS /api/openapi.json
 *
 * CORS preflight handler for OpenAPI endpoint.
 *
 * @route OPTIONS /api/openapi.json
 * @returns CORS headers
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

/**
 * Route Configuration
 *
 * - Dynamic route (generates fresh on each request in development)
 * - Static in production with 1-hour revalidation
 * - Edge runtime compatible
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour in production
