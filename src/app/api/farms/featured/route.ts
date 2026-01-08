/**
 * Featured Farms API Route
 *
 * Returns a list of featured/verified farms for the Farmers Market Platform
 *
 * @route GET /api/farms/featured
 */

import { database } from '@/lib/database';
import { logger } from '@/lib/monitoring/logger';
import type { Farm } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

interface FeaturedFarmsResponse {
  success: boolean;
  data?: {
    farms: Partial<Farm>[];
    count: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    limit: number;
  };
}

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const FeaturedFarmsQuerySchema = z.object({
  limit: z.string().optional().default('10').transform(Number),
});

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * GET /api/farms/featured - Get featured/verified farms
 *
 * Query Parameters:
 * - limit: number (default: 10, max: 50)
 *
 * Returns farms that are:
 * - Active status
 * - Verified
 * - Sorted by rating and order count
 */
export async function GET(request: NextRequest): Promise<NextResponse<FeaturedFarmsResponse>> {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryValidation = FeaturedFarmsQuerySchema.safeParse({
      limit: searchParams.get('limit') || '10',
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: queryValidation.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { limit } = queryValidation.data;

    // Cap limit at 50 for performance
    const cappedLimit = Math.min(limit, 50);

    // Fetch featured farms from database
    const farms = await database.farm.findMany({
      where: {
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        bannerUrl: true,
        location: true,
        latitude: true,
        longitude: true,
        certifications: true,
        averageRating: true,
        reviewCount: true,
        totalOrdersCount: true,
        status: true,
        verificationStatus: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: [
        { averageRating: 'desc' },
        { totalOrdersCount: 'desc' },
        { reviewCount: 'desc' },
      ],
      take: cappedLimit,
    });

    logger.info('Featured farms retrieved successfully', {
      count: farms.length,
      limit: cappedLimit,
    });

    return NextResponse.json({
      success: true,
      data: {
        farms,
        count: farms.length,
      },
      meta: {
        timestamp: new Date().toISOString(),
        limit: cappedLimit,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch featured farms', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch featured farms',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// EXPORT ROUTE CONFIG
// ============================================================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
