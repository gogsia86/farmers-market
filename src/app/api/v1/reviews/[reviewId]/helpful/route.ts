/**
 * REVIEW HELPFUL API ENDPOINT
 * ============================
 *
 * Mark a review as helpful
 *
 * @route POST /api/v1/reviews/[reviewId]/helpful
 * @version 1.0.0
 */

import { logger } from '@/lib/monitoring/logger';
import { reviewService } from '@/lib/services/review.service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { reviewId } = params;

    if (!reviewId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Review ID is required',
          },
        },
        { status: 400 }
      );
    }

    // Mark review as helpful
    await reviewService.markHelpful(reviewId);

    return NextResponse.json(
      {
        success: true,
        message: 'Review marked as helpful',
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Failed to mark review as helpful', { error, reviewId: params.reviewId });

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Review not found',
            },
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to mark review as helpful',
        },
      },
      { status: 500 }
    );
  }
}
