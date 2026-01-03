/**
 * 🔔 NOTIFICATIONS API - DIVINE REAL-TIME CONSCIOUSNESS
 *
 * Comprehensive notification management with agricultural awareness
 * - GET: Fetch user notifications
 * - POST: Create new notification
 * - Real-time WebSocket support (future)
 * - Agricultural event notifications
 * - HP OMEN optimized queries
 *
 * @route /api/notifications
 * @divine-pattern Quantum notification manifestation
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Initialize structured logger
const logger = createLogger("notifications-api");

// Force dynamic rendering for real-time notifications
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * NOTIFICATION SCHEMA - DIVINE VALIDATION
 */
const CreateNotificationSchema = z.object({
  userId: z.string().min(1),
  type: z.string().min(1),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  data: z
    .object({
      actionUrl: z.string().url().optional(),
      orderId: z.string().optional(),
      farmId: z.string().optional(),
      productId: z.string().optional(),
      seasonalEvent: z.string().optional(),
    })
    .optional(),
});

/**
 * GET /api/notifications
 * Fetch user notifications with quantum consciousness
 */
export async function GET(request: NextRequest) {
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

    // Query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const skip = (page - 1) * limit;

    // Build query conditions
    const where: any = {
      userId: session.user.id,
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    // Parallel queries for efficiency (HP OMEN 12-thread optimization)
    const [notifications, total, unreadCount] = await Promise.all([
      database.notification.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip,
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
      }),
      database.notification.count({ where }),
      database.notification.count({
        where: {
          userId: session.user.id,
          isRead: false,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + notifications.length < total,
      },
      unreadCount,
      agricultural: {
        consciousness: "divine",
        temporalCoherence: "maintained",
      },
    });
  } catch (error) {
    logger.error("Failed to fetch notifications", error as Error, {
      operation: "GET /api/notifications",
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch notifications",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/notifications
 * Create new notification with quantum manifestation
 *
 * @admin-only This endpoint is typically used by system/admin
 */
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validation = CreateNotificationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    // Authorization check - only admins or self can create notifications
    if (session.user.id !== data.userId && session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized to create notifications for other users",
        },
        { status: 403 },
      );
    }

    // Verify target user exists
    const targetUser = await database.user.findUnique({
      where: { id: data.userId },
      select: { id: true, email: true, name: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Target user not found",
        },
        { status: 404 },
      );
    }

    // Create notification with divine consciousness
    const notification = await database.notification.create({
      data: {
        userId: data.userId,
        type: "NEW_MESSAGE",
        channel: "IN_APP",
        title: data.title,
        body: data.body,
        data: data.data || {},
        isRead: false,
      },
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

    logger.info("Notification created successfully", {
      notificationId: notification.id,
      targetUserId: data.userId,
      type: data.type,
      createdBy: session.user.id,
    });

    // TODO: Send real-time notification via WebSocket
    // await notificationService.broadcast(data.userId, notification);

    // TODO: Send email notification if enabled
    // if (targetUser.emailNotificationsEnabled) {
    //   await emailService.sendNotification(targetUser.email, notification);
    // }

    return NextResponse.json(
      {
        success: true,
        notification,
        agricultural: {
          consciousness: "divine",
          manifestation: "complete",
          quantumState: "coherent",
        },
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Failed to create notification", error as Error, {
      operation: "POST /api/notifications",
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * DIVINE NOTIFICATION TYPES
 * Agricultural consciousness categorization
 */
export const NotificationTypeDescriptions = {
  ORDER: "Order updates and status changes",
  FARM: "Farm-related notifications and updates",
  PRODUCT: "Product availability and pricing updates",
  SYSTEM: "System announcements and maintenance",
  AGRICULTURAL: "Seasonal events and farming insights",
} as const;

/**
 * HELPER: Create Order Notification
 * Quantum helper for common notification patterns
 */
export async function createOrderNotification(
  userId: string,
  orderId: string,
  status: string,
): Promise<void> {
  await database.notification.create({
    data: {
      userId,
      type: "ORDER_PLACED",
      channel: "IN_APP",
      title: `Order ${getOrderStatusLabel(status)}`,
      body: `Your order #${orderId.slice(0, 8)} has been ${status.toLowerCase()}`,
      data: {
        actionUrl: `/orders/${orderId}`,
        orderId,
      },
      isRead: false,
    },
  });
}

/**
 * HELPER: Create Agricultural Event Notification
 * Seasonal consciousness notification manifestation
 */
export async function createAgriculturalNotification(
  userId: string,
  seasonalEvent: string,
  body: string,
): Promise<void> {
  await database.notification.create({
    data: {
      userId,
      type: "NEW_MESSAGE",
      channel: "IN_APP",
      title: `🌱 ${seasonalEvent}`,
      body,
      data: {
        seasonalEvent,
      },
      isRead: false,
    },
  });
}

/**
 * HELPER: Get Order Status Label
 * Divine temporal state translation
 */
function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Confirmed",
    PROCESSING: "Being Prepared",
    READY: "Ready for Pickup",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };
  return labels[status] || status;
}
