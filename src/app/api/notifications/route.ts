/**
 * Notifications API
 * GET: List user notifications
 * DELETE: Clear read notifications
 */

import { auth } from "@/lib/auth";
import { notificationService } from "@/lib/services/notification.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// Validation Schemas
// ============================================================================

const GetNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  unreadOnly: z.coerce.boolean().default(false),
  type: z.enum([
    "ORDER_PLACED",
    "ORDER_CONFIRMED",
    "ORDER_READY",
    "ORDER_FULFILLED",
    "ORDER_CANCELLED",
    "PAYMENT_RECEIVED",
    "PAYOUT_PROCESSED",
    "NEW_MESSAGE",
    "REVIEW_RECEIVED",
    "QUALITY_ISSUE",
    "LOW_STOCK",
    "SYSTEM_ANNOUNCEMENT",
  ]).optional(),
});

// ============================================================================
// GET /api/notifications
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      unreadOnly: searchParams.get("unreadOnly"),
      type: searchParams.get("type"),
    };

    const validation = GetNotificationsSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
            details: validation.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { page, limit, unreadOnly, type } = validation.data;

    const result = await notificationService.getUserNotifications(
      session.user.id,
      {
        page,
        limit,
        unreadOnly,
        type,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        notifications: result.notifications,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
        unreadCount: result.unread,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_NOTIFICATIONS_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch notifications",
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/notifications - Clear read notifications
// ============================================================================

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    const count = await notificationService.clearReadNotifications(
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: {
        cleared: count,
      },
    });
  } catch (error) {
    logger.error("Failed to clear notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CLEAR_NOTIFICATIONS_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to clear notifications",
        },
      },
      { status: 500 }
    );
  }
}
