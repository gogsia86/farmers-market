/**
 * Admin User Role Management API
 * PATCH: Update user role (CONSUMER, FARMER, ADMIN)
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { notificationService } from "@/lib/services/notification.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ============================================================================
// Validation Schemas
// ============================================================================

const UpdateRoleSchema = z.object({
  role: z.enum(["CONSUMER", "FARMER", "ADMIN"]),
  reason: z.string().optional(),
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
// PATCH /api/admin/users/[id]/role - Update user role
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
            message: "Cannot modify your own role",
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = UpdateRoleSchema.safeParse(body);

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

    const { role, reason } = validation.data;

    // Get current user to check existing role
    const currentUser = await database.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
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

    const previousRole = currentUser.role;

    // If no change, return early
    if (previousRole === role) {
      return NextResponse.json({
        success: true,
        data: {
          user: currentUser,
          message: "User already has this role",
        },
      });
    }

    // Update user role
    const updatedUser = await database.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Determine action type for logging
    let actionType = "USER_ROLE_CHANGED";
    if (role === "ADMIN") {
      actionType = "USER_PROMOTED_ADMIN";
    } else if (previousRole === "ADMIN") {
      actionType = "USER_DEMOTED_ADMIN";
    } else if (role === "FARMER") {
      actionType = "USER_PROMOTED_FARMER";
    } else if (previousRole === "FARMER") {
      actionType = "USER_DEMOTED_FARMER";
    }

    // Log admin action
    await logAdminAction(session.user.id, actionType, userId, {
      previousRole,
      newRole: role,
      reason,
    });

    // Send notification to user
    const roleNames: Record<string, string> = {
      CONSUMER: "Consumer",
      FARMER: "Farmer",
      ADMIN: "Administrator",
    };

    const notificationTitle = "Account Role Updated";
    const notificationBody = `Your account role has been changed from ${roleNames[previousRole]} to ${roleNames[role]}.${reason ? ` Reason: ${reason}` : ""}`;

    await notificationService.createNotification({
      userId,
      type: "SYSTEM_ANNOUNCEMENT",
      channels: ["IN_APP", "EMAIL"],
      title: notificationTitle,
      body: notificationBody,
      data: {
        previousRole,
        newRole: role,
        reason,
        changedBy: session.user.id,
      },
    });

    // If promoted to FARMER, send additional guidance
    if (role === "FARMER" && previousRole !== "FARMER") {
      await notificationService.createNotification({
        userId,
        type: "SYSTEM_ANNOUNCEMENT",
        channels: ["IN_APP", "EMAIL"],
        title: "Welcome to Farmer Account",
        body: "You can now create farms and list products on the platform. Visit your dashboard to get started!",
        data: {
          action: "PROMOTED_TO_FARMER",
        },
      });
    }

    // If promoted to ADMIN, send special notification
    if (role === "ADMIN" && previousRole !== "ADMIN") {
      await notificationService.createNotification({
        userId,
        type: "SYSTEM_ANNOUNCEMENT",
        channels: ["IN_APP", "EMAIL"],
        title: "Administrator Access Granted",
        body: "You now have administrator privileges. Please use them responsibly.",
        data: {
          action: "PROMOTED_TO_ADMIN",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser,
        previousRole,
        changes: {
          role: {
            from: previousRole,
            to: role,
          },
        },
      },
      agricultural: {
        consciousness: "divine",
        message: "User role updated with agricultural wisdom",
      },
    });
  } catch (error) {
    console.error("Failed to update user role:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_ROLE_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update user role",
        },
      },
      { status: 500 }
    );
  }
}
