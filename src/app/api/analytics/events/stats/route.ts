/**
 * Search Event Statistics API Route
 *
 * Get aggregated statistics on search events including top queries, seasonal trends,
 * and performance metrics.
 *
 * @module /api/analytics/events/stats
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SearchEventService } from "@/lib/services/analytics/search-event.service";
import { asyncHandler, validateRequest } from "@/lib/api/error-handler";
import { z } from "zod";
import { Season } from "@prisma/client";

// ============================================================================
// Validation Schema
// ============================================================================

const statsQuerySchema = z.object({
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  season: z.nativeEnum(Season).optional(),
  source: z.string().optional(),
});

// ============================================================================
// GET /api/analytics/events/stats - Get search event statistics
// ============================================================================

export const GET = asyncHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);

  const query = Object.fromEntries(searchParams.entries());
  const validated = validateRequest(statsQuerySchema, query);

  // Parse filters
  const filters: any = {};

  if (validated.userId) filters.userId = validated.userId;
  if (validated.season) filters.season = validated.season;
  if (validated.source) filters.source = validated.source;

  if (validated.startDate) {
    filters.startDate = new Date(validated.startDate);
  }
  if (validated.endDate) {
    filters.endDate = new Date(validated.endDate);
  }

  // If user is not admin, only allow viewing their own stats
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    filters.userId = session?.user?.id;
  }

  const stats = await SearchEventService.getStats(filters);

  return NextResponse.json(stats);
});
