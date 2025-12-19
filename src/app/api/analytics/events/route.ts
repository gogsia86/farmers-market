/**
 * Analytics Events API Routes
 *
 * Endpoints for tracking and retrieving search events with agricultural consciousness.
 *
 * @module /api/analytics/events
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SearchEventService } from '@/lib/services/analytics/search-event.service';
import { asyncHandler, validateRequest } from '@/lib/api/error-handler';
import { z } from 'zod';
import { Season } from '@prisma/client';

// ============================================================================
// Validation Schemas
// ============================================================================

const trackSearchSchema = z.object({
  query: z.string().optional(),
  filters: z.record(z.any()),
  sortBy: z.string().optional(),
  resultsCount: z.number().int().min(0),
  resultsShown: z.number().int().min(0),
  responseTime: z.number().int().min(0),
  source: z.string().optional(),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    region: z.string().optional(),
  }).optional(),
  userAgent: z.string().optional(),
  currentSeason: z.nativeEnum(Season).optional(),
  lunarPhase: z.string().optional(),
  abTestVariant: z.string().optional(),
  sessionId: z.string().optional(),
});

const trackClickSchema = z.object({
  searchEventId: z.string().optional(),
  productId: z.string(),
  position: z.number().int().min(0),
  query: z.string().optional(),
  sessionId: z.string(),
});

const searchEventsQuerySchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  query: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  season: z.nativeEnum(Season).optional(),
  source: z.string().optional(),
  minResponseTime: z.string().optional(),
  maxResponseTime: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

// ============================================================================
// POST /api/analytics/events - Track search event
// ============================================================================

export const POST = asyncHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const data = validateRequest(trackSearchSchema, body);

  // Track the search event
  const result = await SearchEventService.trackSearch({
    userId: session?.user?.id,
    sessionId: data.sessionId,
    query: data.query,
    filters: data.filters,
    sortBy: data.sortBy,
    resultsCount: data.resultsCount,
    resultsShown: data.resultsShown,
    responseTime: data.responseTime,
    source: data.source,
    location: data.location,
    userAgent: req.headers.get('user-agent') || undefined,
    currentSeason: data.currentSeason,
    lunarPhase: data.lunarPhase,
    abTestVariant: data.abTestVariant,
  });

  return NextResponse.json(result, { status: 201 });
});

// ============================================================================
// GET /api/analytics/events - Get search events
// ============================================================================

export const GET = asyncHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);

  const query = Object.fromEntries(searchParams.entries());
  const validated = validateRequest(searchEventsQuerySchema, query);

  // Parse filters
  const filters: any = {};

  if (validated.userId) filters.userId = validated.userId;
  if (validated.sessionId) filters.sessionId = validated.sessionId;
  if (validated.query) filters.query = validated.query;
  if (validated.season) filters.season = validated.season;
  if (validated.source) filters.source = validated.source;

  if (validated.startDate) {
    filters.startDate = new Date(validated.startDate);
  }
  if (validated.endDate) {
    filters.endDate = new Date(validated.endDate);
  }

  if (validated.minResponseTime) {
    filters.minResponseTime = parseInt(validated.minResponseTime);
  }
  if (validated.maxResponseTime) {
    filters.maxResponseTime = parseInt(validated.maxResponseTime);
  }

  const limit = validated.limit ? parseInt(validated.limit) : 100;
  const offset = validated.offset ? parseInt(validated.offset) : 0;

  // If user is not admin, only allow viewing their own events
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    filters.userId = session?.user?.id;
  }

  const result = await SearchEventService.getEvents(filters, limit, offset);

  return NextResponse.json(result);
});
