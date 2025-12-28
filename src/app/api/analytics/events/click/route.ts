/**
 * Click Tracking API Route
 *
 * Track clicks on search results for analytics and personalization.
 *
 * @module /api/analytics/events/click
 */

import { NextRequest, NextResponse } from "next/server";
import { auth as getServerSession } from "@/lib/auth/config";
import { SearchEventService } from "@/lib/services/analytics/search-event.service";
import { asyncHandler, validateRequest } from "@/lib/api/error-handler";
import { z } from "zod";

// ============================================================================
// Validation Schema
// ============================================================================

const trackClickSchema = z.object({
  searchEventId: z.string().optional(),
  productId: z.string(),
  position: z.number().int().min(0),
  query: z.string().optional(),
  sessionId: z.string(),
});

// ============================================================================
// POST /api/analytics/events/click - Track click on search result
// ============================================================================

export const POST = asyncHandler(async (req: NextRequest) => {
  const session = await getServerSession();
  const body = await req.json();
  const data = validateRequest(trackClickSchema, body);

  // Track the click
  await SearchEventService.trackClick({
    searchEventId: data.searchEventId,
    userId: session?.user?.id,
    sessionId: data.sessionId,
    productId: data.productId,
    position: data.position,
    query: data.query,
  });

  return NextResponse.json(
    { success: true, message: "Click tracked successfully" },
    { status: 201 },
  );
});
