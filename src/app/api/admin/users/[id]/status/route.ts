/**
 * Admin User Status Management API
 * PATCH: Update user status (ACTIVE, SUSPENDED, INACTIVE)
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { notificationService } from "@/lib/services/notification.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// Validation Schemas
// ============================================================================

const UpdateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "INACTIVE", "PENDING"]),
  reason: z.string().optional(),
  duration: z.number().int().positive().optional(), // Duration in days for suspension
});

// ============================================================================
// Helper Functions
// ============================================================================

async function isAdmin(userId: string): Promise<boolean> {
  const user = await database.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

async function logAdminAction(
  adminId: string,
  actionType: string,
  targetUserId: string,
  details?: Record<string, any>
): Promise<void> {
  await database.adminAction.create({
    data: {
      adminId,
      type: actionType as any,
      targetId: targetUserId,
      targetType: "USER",
      description: `Admin action: ${actionType} on user ${targetUserId}`,
      metadata: details ? JSON.parse(JSON.stringify(details)) : null,
    },
  });
}

// ============================================================================
// PATCH /api/admin/users/[id]/status - Update user status
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

    // Check admin permissions
    const adminCheck = await isAdmin(session.user.id);
    if (!adminCheck) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Admin access required",
          },
        },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Prevent self-modification
    if (userId === session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Cannot modify your own status",
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = UpdateStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: validation.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { status, reason, duration } = validation.data;

    // Get current user to check existing status
    const currentUser = await database.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        },
        { status: 404 }
      );
    }

    const previousStatus = currentUser.status;

    // If no change, return early
    if (previousStatus === status) {
      return NextResponse.json({
        success: true,
        data: {
          user: currentUser,
          message: "User already has this status",
        },
      });
    }

    // Build update data
    const updateData: any = { status };

    if (status === "SUSPENDED") {
      updateData.suspendedBy = session.user.id;
      updateData.suspendedAt = new Date();
      if (reason) {
        updateData.suspensionReason = reason;
      }
    } else if (status === "ACTIVE") {
      // Clear suspension data when reactivating
      updateData.suspendedBy = null;
      updateData.suspendedAt = null;
      updateData.suspensionReason = null;
    }

    // Update user status
    const updatedUser = await database.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        role: true,
        status: true,
        suspensionReason: true,
        suspendedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Determine action type for logging
    let actionType = "USER_STATUS_CHANGED";
    if (status === "SUSPENDED") {
      actionType = "USER_SUSPENDED";
    } else if (status === "ACTIVE" && previousStatus === "SUSPENDED") {
      actionType = "USER_REACTIVATED";
    } else if (status === "INACTIVE") {
      actionType = "USER_DEACTIVATED";
    }

    // Log admin action
    await logAdminAction(session.user.id, actionType, userId, {
      previousStatus,
      newStatus: status,
      reason,
      duration,
    });

    // Send notification to user
    const statusNames: Record<string, string> = {
      ACTIVE: "Active",
      SUSPENDED: "Suspended",
      INACTIVE: "Inactive",
      PENDING: "Pending",
    };

    let notificationTitle = "Account Status Updated";
    let notificationBody = `Your account status has been changed to ${statusNames[status]}.`;

    if (status === "SUSPENDED") {
      notificationTitle = "Account Suspended";
      notificationBody = `Your account has been suspended.${reason ? ` Reason: ${reason}` : ""}`;
    } else if (status === "ACTIVE" && previousStatus === "SUSPENDED") {
      notificationTitle = "Account Reactivated";
      notificationBody = "Your account has been reactivated. You can now access all features.";
    } else if (status === "INACTIVE") {
      notificationTitle = "Account Deactivated";
      notificationBody = `Your account has been deactivated.${reason ? ` Reason: ${reason}` : ""} Please contact support if you believe this is an error.`;
    }

    await notificationService.createNotification({
      userId,
      type: "SYSTEM_ANNOUNCEMENT",
      channels: ["IN_APP", "EMAIL"],
      priority: status === "SUSPENDED" ? "HIGH" : "MEDIUM",
      title: notificationTitle,
      body: notificationBody,
      data: {
        previousStatus,
        newStatus: status,
        reason,
        changedBy: session.user.id,
      },
    });

    // If user has active farms and is suspended, we might want to handle farm status
    if (status === "SUSPENDED" && currentUser.role === "FARMER") {
      const userFarms = await database.farm.findMany({
        where: {
          ownerId: userId,
          status: "ACTIVE",
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (userFarms.length > 0) {
        // Optionally suspend farms or just notify
        await notificationService.createNotification({
          userId,
          type: "SYSTEM_ANNOUNCEMENT",
          channels: ["IN_APP", "EMAIL"],
          priority: "HIGH",
          title: "Farm Status Notice",
          body: `You have ${userFarms.length} active farm(s). They will remain visible but you cannot make changes while suspended.`,
          data: {
            farmCount: userFarms.length,
            farms: userFarms,
          },
        });
      }
    }

    // If user is reactivated and has pending orders, notify them
    if (status === "ACTIVE" && previousStatus === "SUSPENDED") {
      const pendingOrders = await database.order.count({
        where: {
          customerId: userId,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      });

      if (pendingOrders > 0) {
        await notificationService.createNotification({
          userId,
          type: "SYSTEM_ANNOUNCEMENT",
          channels: ["IN_APP"],
          title: "Pending Orders",
          body: `You have ${pendingOrders} pending order(s) that require your attention.`,
          data: {
            pendingOrderCount: pendingOrders,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser,
        previousStatus,
        changes: {
          status: {
            from: previousStatus,
            to: status,
          },
          suspensionDetails: status === "SUSPENDED" ? {
            reason,
          } : null,
        },
      },
      agricultural: {
        consciousness: "divine",
        message: "User status updated with agricultural wisdom and care",
      },
    });
  } catch (error) {
    logger.error("Failed to update user status:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_STATUS_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update user status",
        },
      },
      { status: 500 }
    );
  }
}
