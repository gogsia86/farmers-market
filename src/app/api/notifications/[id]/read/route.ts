/**
 * 🔔 NOTIFICATION MARK AS READ API - DIVINE QUANTUM STATE UPDATE
 *
 * Updates notification read status with agricultural consciousness
 * - PATCH: Mark single notification as read
 * - Temporal state coherence maintained
 * - Authorization checks enforced
 *
 * @route PATCH /api/notifications/[id]/read
 * @divine-pattern Quantum state transformation
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

// Initialize structured logger
const logger = createLogger("notification-read-api");

/**
 * PATCH /api/notifications/[id]/read
 * Mark notification as read with quantum consciousness
 */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Authentication required
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    const notificationId = params.id;

    // Verify notification exists and belongs to user
    const notification = await database.notification.findUnique({
      where: { id: notificationId },
      select: {
        id: true,
        userId: true,
        isRead: true,
      },
    });

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          error: "Notification not found",
        },
        { status: 404 },
      );
    }

    // Authorization check - only owner can mark as read
    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized to modify this notification",
        },
        { status: 403 },
      );
    }

    // Skip update if already read
    if (notification.isRead) {
      return NextResponse.json({
        success: true,
        message: "Notification already marked as read",
        notification: { id: notification.id, isRead: true },
        agricultural: {
          consciousness: "divine",
          temporalState: "unchanged",
        },
      });
    }

    // Update notification to read status
    const updatedNotification = await database.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        isRead: true,
        readAt: true,
        createdAt: true,
        data: true,
      },
    });

    logger.info("Notification marked as read", {
      notificationId,
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      notification: updatedNotification,
      agricultural: {
        consciousness: "divine",
        temporalCoherence: "maintained",
        quantumState: "updated",
      },
    });
  } catch (error) {
    logger.error("Failed to mark notification as read", error as Error, {
      operation: "PATCH /api/notifications/[id]/read",
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to mark notification as read",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * OPTIONS /api/notifications/[id]/read
 * CORS preflight support
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
