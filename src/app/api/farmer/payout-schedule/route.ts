/**
 * 🔄 BACKWARD COMPATIBILITY ALIAS
 *
 * This route is deprecated and redirects to /api/farmers/payout-schedule
 *
 * @deprecated Use /api/farmers/payout-schedule instead
 * @see /api/farmers/payout-schedule for the consolidated implementation
 *
 * Migration Timeline:
 * - Deprecated: December 2025
 * - Sunset Date: June 1, 2026
 *
 * This alias will be maintained until the sunset date to ensure
 * backward compatibility with existing integrations.
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/farmer/payout-schedule
 *
 * @deprecated
 * Redirects to /api/farmers/payout-schedule
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return redirectToConsolidatedEndpoint(request);
}

/**
 * POST /api/farmer/payout-schedule
 *
 * @deprecated
 * Redirects to /api/farmers/payout-schedule
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return redirectToConsolidatedEndpoint(request);
}

/**
 * PUT /api/farmer/payout-schedule
 *
 * @deprecated
 * Redirects to /api/farmers/payout-schedule
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  return redirectToConsolidatedEndpoint(request);
}

/**
 * PATCH /api/farmer/payout-schedule
 *
 * @deprecated
 * Redirects to /api/farmers/payout-schedule
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  return redirectToConsolidatedEndpoint(request);
}

/**
 * DELETE /api/farmer/payout-schedule
 *
 * @deprecated
 * Redirects to /api/farmers/payout-schedule
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  return redirectToConsolidatedEndpoint(request);
}

/**
 * Helper function to redirect to consolidated endpoint
 */
function redirectToConsolidatedEndpoint(request: NextRequest): NextResponse {
  // Add deprecation warning headers
  const headers = new Headers();
  headers.set("X-API-Deprecated", "true");
  headers.set("X-API-Deprecation-Date", "2025-12-01");
  headers.set("X-API-Sunset-Date", "2026-06-01");
  headers.set(
    "X-API-Migration-Guide",
    "/docs/migrations/api-consolidation-guide.md"
  );
  headers.set("X-API-New-Endpoint", "/api/farmers/payout-schedule");
  headers.set(
    "Deprecation",
    'version="1.0.0", date="Sun, 01 Dec 2025 00:00:00 GMT"'
  );
  headers.set("Sunset", 'date="Mon, 01 Jun 2026 00:00:00 GMT"');

  // Get the base URL
  const url = new URL(request.url);
  const newUrl = new URL("/api/farmers/payout-schedule", url.origin);

  // Preserve query parameters
  url.searchParams.forEach((value, key) => {
    newUrl.searchParams.set(key, value);
  });

  // Perform 308 Permanent Redirect (preserves HTTP method)
  return NextResponse.redirect(newUrl, {
    status: 308,
    headers,
  });
}

/**
 * 🔔 DEPRECATION NOTICE
 *
 * This endpoint has been consolidated into /api/farmers/payout-schedule
 *
 * Please update your integrations to use the new endpoint:
 * - Old: /api/farmer/payout-schedule
 * - New: /api/farmers/payout-schedule
 *
 * This alias provides automatic redirection and will be maintained
 * until June 1, 2026. After that date, this endpoint will return
 * 410 Gone.
 *
 * Benefits of migrating:
 * - Consistent API structure
 * - Better documentation
 * - Enhanced payout scheduling features
 * - Improved error handling
 * - Long-term support
 *
 * See migration guide: docs/migrations/api-consolidation-guide.md
 */
