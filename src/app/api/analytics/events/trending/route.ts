/**
 * Trending Searches API Route
 *
 * Get trending searches with growth metrics and seasonal context.
 *
 * @module /api/analytics/events/trending
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SearchEventService } from '@/lib/services/analytics/search-event.service';
import { asyncHandler, validateRequest } from '@/lib/api/error-handler';
import { z } from 'zod';

// ============================================================================
// Validation Schema
// ============================================================================

const trendingQuerySchema = z.object({
  limit: z.string().optional(),
  lookbackDays: z.string().optional(),
});

// ============================================================================
// GET /api/analytics/events/trending - Get trending searches
// ============================================================================

export const GET = asyncHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);

  const query = Object.fromEntries(searchParams.entries());
  const validated = validateRequest(trendingQuerySchema, query);

  const limit = validated.limit ? parseInt(validated.limit) : 10;
  const lookbackDays = validated.lookbackDays ? parseInt(validated.lookbackDays) : 7;

  const trending = await SearchEventService.getTrendingSearches(limit, lookbackDays);

  return NextResponse.json({
    trending,
    period: {
      days: lookbackDays,
      endDate: new Date(),
      startDate: new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000),
    },
  });
});
