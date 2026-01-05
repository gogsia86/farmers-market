/**
 * 🔄 API DEPRECATION ALIAS HELPER
 *
 * Reusable utility for creating backward-compatible API route aliases
 * that redirect to consolidated endpoints with proper deprecation headers.
 *
 * This helper standardizes the deprecation process across all API routes
 * being consolidated in Phase 4.
 *
 * @reference .github/instructions/12_ERROR_HANDLING_VALIDATION.instructions.md
 * @reference docs/migrations/api-consolidation-guide.md
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Configuration for API deprecation alias
 */
export interface DeprecationAliasConfig {
  /**
   * The old endpoint path being deprecated (for documentation)
   * @example "/api/farmer/dashboard"
   */
  oldEndpoint: string;

  /**
   * The new consolidated endpoint path
   * @example "/api/farmers/dashboard"
   */
  newEndpoint: string;

  /**
   * Date when the endpoint was deprecated (ISO 8601 format)
   * @default "2025-12-01"
   */
  deprecationDate?: string;

  /**
   * Date when the endpoint will be sunset/removed (ISO 8601 format)
   * @default "2026-06-01"
   */
  sunsetDate?: string;

  /**
   * Link to migration guide documentation
   * @default "/docs/migrations/api-consolidation-guide.md"
   */
  migrationGuide?: string;

  /**
   * Additional custom headers to include
   */
  customHeaders?: Record<string, string>;
}

/**
 * Creates a redirect response with deprecation headers
 *
 * This function generates a proper HTTP 308 (Permanent Redirect) response
 * with all necessary deprecation headers to inform clients about the
 * endpoint migration.
 *
 * Features:
 * - HTTP 308 redirect (preserves HTTP method and request body)
 * - Standard deprecation headers (Deprecation, Sunset)
 * - Custom headers for additional metadata
 * - Query parameter preservation
 * - Request ID propagation
 *
 * @param request - The incoming Next.js request
 * @param config - Deprecation alias configuration
 * @returns NextResponse with redirect and deprecation headers
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   return createDeprecationRedirect(request, {
 *     oldEndpoint: "/api/farmer/dashboard",
 *     newEndpoint: "/api/farmers/dashboard",
 *   });
 * }
 * ```
 */
export function createDeprecationRedirect(
  request: NextRequest,
  config: DeprecationAliasConfig,
): NextResponse {
  const {
    newEndpoint,
    deprecationDate = "2025-12-01",
    sunsetDate = "2026-06-01",
    migrationGuide = "/docs/migrations/api-consolidation-guide.md",
    customHeaders = {},
  } = config;

  // Build deprecation headers
  const headers = new Headers();

  // Custom deprecation headers
  headers.set("X-API-Deprecated", "true");
  headers.set("X-API-Deprecation-Date", deprecationDate);
  headers.set("X-API-Sunset-Date", sunsetDate);
  headers.set("X-API-Migration-Guide", migrationGuide);
  headers.set("X-API-New-Endpoint", newEndpoint);

  // Standard deprecation headers (RFC 8594)
  headers.set(
    "Deprecation",
    `version="1.0.0", date="${formatToHttpDate(new Date(deprecationDate))}"`,
  );
  headers.set("Sunset", `date="${formatToHttpDate(new Date(sunsetDate))}"`);

  // Link header for migration guide
  headers.set(
    "Link",
    `<${migrationGuide}>; rel="deprecation"; type="text/markdown"`,
  );

  // Add custom headers
  Object.entries(customHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  // Preserve request ID if present
  const requestId = request.headers.get("x-request-id");
  if (requestId) {
    headers.set("X-Request-ID", requestId);
  }

  // Get the base URL and construct new URL
  const url = new URL(request.url);
  const newUrl = new URL(newEndpoint, url.origin);

  // Preserve all query parameters
  url.searchParams.forEach((value, key) => {
    newUrl.searchParams.set(key, value);
  });

  // Perform 308 Permanent Redirect
  // This preserves the HTTP method (GET, POST, etc.) and request body
  return NextResponse.redirect(newUrl, {
    status: 308,
    headers,
  });
}

/**
 * Creates a complete set of HTTP method handlers for a deprecated route
 *
 * This is a convenience function that generates handlers for all common
 * HTTP methods (GET, POST, PUT, PATCH, DELETE) that redirect to the
 * consolidated endpoint.
 *
 * @param config - Deprecation alias configuration
 * @returns Object with handler functions for each HTTP method
 *
 * @example
 * ```typescript
 * // In route.ts file
 * import { createDeprecationHandlers } from "@/lib/api/deprecation-alias";
 *
 * const handlers = createDeprecationHandlers({
 *   oldEndpoint: "/api/farmer/payouts",
 *   newEndpoint: "/api/farmers/payouts",
 * });
 *
 * export const GET = handlers.GET;
 * export const POST = handlers.POST;
 * export const PUT = handlers.PUT;
 * export const PATCH = handlers.PATCH;
 * export const DELETE = handlers.DELETE;
 * ```
 */
export function createDeprecationHandlers(config: DeprecationAliasConfig) {
  const createHandler = (method: string) => async (request: NextRequest) => {
    return createDeprecationRedirect(request, config);
  };

  return {
    GET: createHandler("GET"),
    POST: createHandler("POST"),
    PUT: createHandler("PUT"),
    PATCH: createHandler("PATCH"),
    DELETE: createHandler("DELETE"),
    HEAD: createHandler("HEAD"),
    OPTIONS: createHandler("OPTIONS"),
  };
}

/**
 * Formats a Date object to HTTP date format (RFC 7231)
 *
 * @param date - Date to format
 * @returns Formatted date string
 * @example "Sun, 01 Dec 2025 00:00:00 GMT"
 */
function formatToHttpDate(date: Date): string {
  return date.toUTCString();
}

/**
 * Generates deprecation notice markdown documentation
 *
 * This helper generates the standard deprecation notice text
 * that should be included in alias route files.
 *
 * @param config - Deprecation alias configuration
 * @returns Markdown-formatted deprecation notice
 */
export function generateDeprecationNotice(
  config: DeprecationAliasConfig,
): string {
  const { oldEndpoint, newEndpoint, sunsetDate, migrationGuide } = config;

  return `
/**
 * 🔔 DEPRECATION NOTICE
 *
 * This endpoint has been consolidated into ${newEndpoint}
 *
 * Please update your integrations to use the new endpoint:
 * - Old: ${oldEndpoint}
 * - New: ${newEndpoint}
 *
 * This alias provides automatic redirection and will be maintained
 * until ${sunsetDate}. After that date, this endpoint will return
 * 410 Gone.
 *
 * Benefits of migrating:
 * - Consistent API structure
 * - Better documentation
 * - Enhanced features
 * - Improved error handling
 * - Long-term support
 *
 * See migration guide: ${migrationGuide}
 */
`.trim();
}

/**
 * Configuration for sunset response (after deprecation period)
 */
export interface SunsetResponseConfig {
  oldEndpoint: string;
  newEndpoint: string;
  sunsetDate: string;
  migrationGuide?: string;
}

/**
 * Creates a 410 Gone response for endpoints past their sunset date
 *
 * After the sunset date, deprecated endpoints should return 410 Gone
 * instead of redirecting, to force clients to update their integrations.
 *
 * @param config - Sunset response configuration
 * @returns NextResponse with 410 Gone status
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   // Check if past sunset date
 *   if (new Date() > new Date("2026-06-01")) {
 *     return createSunsetResponse({
 *       oldEndpoint: "/api/farmer/dashboard",
 *       newEndpoint: "/api/farmers/dashboard",
 *       sunsetDate: "2026-06-01",
 *     });
 *   }
 *
 *   // Otherwise redirect
 *   return createDeprecationRedirect(request, config);
 * }
 * ```
 */
export function createSunsetResponse(
  config: SunsetResponseConfig,
): NextResponse {
  const {
    oldEndpoint,
    newEndpoint,
    sunsetDate,
    migrationGuide = "/docs/migrations/api-consolidation-guide.md",
  } = config;

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("X-API-Sunset", "true");
  headers.set("X-API-Sunset-Date", sunsetDate);
  headers.set("X-API-New-Endpoint", newEndpoint);
  headers.set(
    "Link",
    `<${migrationGuide}>; rel="deprecation"; type="text/markdown"`,
  );

  return NextResponse.json(
    {
      success: false,
      error: "Endpoint Sunset",
      message: `This endpoint (${oldEndpoint}) has been sunset as of ${sunsetDate}`,
      code: "ENDPOINT_SUNSET",
      details: {
        oldEndpoint,
        newEndpoint,
        sunsetDate,
        migrationGuide,
      },
      action: {
        message: `Please update your integration to use ${newEndpoint}`,
        documentation: migrationGuide,
      },
    },
    {
      status: 410, // 410 Gone
      headers,
    },
  );
}

/**
 * 🌟 Divine API Deprecation Helper Established ✨
 *
 * This helper provides a standardized approach to:
 * - Create backward-compatible API aliases
 * - Add proper deprecation headers (RFC 8594 compliant)
 * - Preserve query parameters and request context
 * - Generate consistent deprecation notices
 * - Handle sunset responses after deprecation period
 *
 * Usage Pattern:
 * 1. Copy actual route implementation to new location
 * 2. Replace old route with alias using this helper
 * 3. Clients automatically redirected with deprecation warnings
 * 4. After sunset date, return 410 Gone instead of redirecting
 *
 * Ready for quantum API consolidation! 🚀
 */
