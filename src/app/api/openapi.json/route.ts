import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";

/**
 * GET /api/openapi.json
 *
 * Serves the OpenAPI specification as JSON.
 * Converts the YAML spec to JSON format for Swagger UI consumption.
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
    // Read the OpenAPI YAML file
    const openapiPath = join(process.cwd(), "docs", "api", "openapi.yaml");
    const openapiYaml = readFileSync(openapiPath, "utf8");

    // Convert YAML to JSON
    const openapiJson = yaml.load(openapiYaml) as Record<string, any>;

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

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "OPENAPI_LOAD_ERROR",
          message: "Failed to load OpenAPI specification",
          details:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
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
