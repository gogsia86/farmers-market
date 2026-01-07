/**
 * Individual Notification API
 * PATCH: Mark notification as read
 * DELETE: Delete notification
 */

import { auth } from "@/lib/auth";
import { notificationService } from "@/lib/services/notification.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// Validation Schemas
// ============================================================================

const UpdateNotificationSchema = z.object({
  isRead: z.boolean(),
});

// ============================================================================
// PATCH /api/notifications/[id] - Mark as read
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
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

    const body = await request.json();
    const validation = UpdateNotificationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: validation.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { isRead } = validation.data;

    if (isRead) {
      await notificationService.markAsRead(params.id, session.user.id);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: params.id,
        isRead,
      },
    });
  } catch (error) {
    logger.error("Failed to update notification:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_NOTIFICATION_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update notification",
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/notifications/[id] - Delete notification
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
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

    await notificationService.deleteNotification(params.id, session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        id: params.id,
        deleted: true,
      },
    });
  } catch (error) {
    logger.error("Failed to delete notification:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DELETE_NOTIFICATION_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to delete notification",
        },
      },
      { status: 500 }
    );
  }
}
