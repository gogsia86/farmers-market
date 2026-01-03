/**
 * MARK NOTIFICATION AS READ
 * Divine notification consciousness tracking
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

// Initialize structured logger
const logger = createLogger("notification-item-api");

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify notification belongs to user
    const notification = await database.notification.findUnique({
      where: { id: params.id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mark as read
    const updated = await database.notification.update({
      where: { id: params.id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    logger.info("Notification marked as read", {
      notificationId: params.id,
      userId: session.user.id,
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error("Failed to mark notification as read", error as Error, {
      notificationId: params.id,
      operation: "PATCH /api/notifications/[id]",
    });
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 },
    );
  }
}

/**
 * DELETE notification
 */
/**
 * GET single notification
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify notification belongs to user
    const notification = await database.notification.findUnique({
      where: { id: params.id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete notification
    await database.notification.delete({
      where: { id: params.id },
    });

    logger.info("Notification deleted", {
      notificationId: params.id,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete notification", error as Error, {
      notificationId: params.id,
      operation: "GET /api/notifications/[id]",
    });
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 },
    );
  }
}
