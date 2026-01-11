/**
 * Admin Users Management API
 * GET: List all users with filters
 * PATCH: Update user role/status
 * POST: Bulk user operations
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/monitoring/logger";

// ============================================================================
// Validation Schemas
// ============================================================================

const GetUsersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  role: z.enum(["CONSUMER", "FARMER", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]).optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "name", "email", "loginCount"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const UpdateUserSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(["CONSUMER", "FARMER", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]).optional(),
  suspensionReason: z.string().optional(),
});

const BulkOperationSchema = z.object({
  operation: z.enum(["suspend", "activate", "delete", "promote", "demote"]),
  userIds: z.array(z.string().cuid()).min(1).max(100),
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
  details?: Record<string, any>,
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
// GET /api/admin/users - List users
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
        { status: 401 },
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
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      role: searchParams.get("role"),
      status: searchParams.get("status"),
      search: searchParams.get("search"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    };

    const validation = GetUsersSchema.safeParse(params);
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
        { status: 400 },
      );
    }

    const { page, limit, role, status, search, sortBy, sortOrder } =
      validation.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch users and total count
    const [users, total] = await Promise.all([
      database.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          role: true,
          status: true,
          emailVerified: true,
          phoneVerified: true,
          lastLoginAt: true,
          loginCount: true,
          createdAt: true,
          suspensionReason: true,
          suspendedAt: true,
          _count: {
            select: {
              orders: true,
              farms: true,
              reviews: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip,
      }),
      database.user.count({ where }),
    ]);

    // Get statistics
    const [totalUsers, activeUsers, farmerCount, consumerCount] =
      await Promise.all([
        database.user.count(),
        database.user.count({ where: { status: "ACTIVE" } }),
        database.user.count({ where: { role: "FARMER" } }),
        database.user.count({ where: { role: "CONSUMER" } }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          totalUsers,
          activeUsers,
          farmerCount,
          consumerCount,
        },
      },
    });
  } catch (error) {
    logger.error("Failed to fetch users:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_USERS_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch users",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// PATCH /api/admin/users - Update user
// ============================================================================

export async function PATCH(request: NextRequest): Promise<NextResponse> {
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
        { status: 401 },
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
        { status: 403 },
      );
    }

    const body = await request.json();
    const validation = UpdateUserSchema.safeParse(body);

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
        { status: 400 },
      );
    }

    const { userId, role, status, suspensionReason } = validation.data;

    // Prevent self-demotion
    if (userId === session.user.id && role && role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Cannot change your own admin role",
          },
        },
        { status: 403 },
      );
    }

    // Build update data
    const updateData: any = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (status === "SUSPENDED") {
      updateData.suspendedBy = session.user.id;
      updateData.suspendedAt = new Date();
      if (suspensionReason) updateData.suspensionReason = suspensionReason;
    } else if (status === "ACTIVE") {
      updateData.suspendedBy = null;
      updateData.suspendedAt = null;
      updateData.suspensionReason = null;
    }

    // Update user
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
      },
    });

    // Log admin action
    let actionType = "USER_ACTIVATED";
    if (role) {
      actionType =
        role === "ADMIN" ? "USER_PROMOTED_ADMIN" : "USER_DEMOTED_ADMIN";
    } else if (status === "SUSPENDED") {
      actionType = "USER_SUSPENDED";
    } else if (status === "ACTIVE") {
      actionType = "USER_REACTIVATED";
    }

    await logAdminAction(session.user.id, actionType, userId, {
      previousRole: role ? body.previousRole : undefined,
      previousStatus: status ? body.previousStatus : undefined,
      newRole: role,
      newStatus: status,
      suspensionReason,
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    logger.error("Failed to update user:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_USER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to update user",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// POST /api/admin/users - Bulk operations
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
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
        { status: 401 },
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
        { status: 403 },
      );
    }

    const body = await request.json();
    const validation = BulkOperationSchema.safeParse(body);

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
        { status: 400 },
      );
    }

    const { operation, userIds, reason } = validation.data;

    // Prevent operations on self
    if (userIds.includes(session.user.id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Cannot perform bulk operations on yourself",
          },
        },
        { status: 403 },
      );
    }

    let result;
    let actionType = "USER_ACTIVATED";

    switch (operation) {
      case "suspend":
        result = await database.user.updateMany({
          where: { id: { in: userIds } },
          data: {
            status: "SUSPENDED",
            suspendedBy: session.user.id,
            suspendedAt: new Date(),
            suspensionReason: reason,
          },
        });
        actionType = "USER_SUSPENDED";
        break;

      case "activate":
        result = await database.user.updateMany({
          where: { id: { in: userIds } },
          data: {
            status: "ACTIVE",
            suspendedBy: null,
            suspendedAt: null,
            suspensionReason: null,
          },
        });
        actionType = "USER_REACTIVATED";
        break;

      case "delete":
        result = await database.user.updateMany({
          where: { id: { in: userIds } },
          data: {
            status: "DELETED",
          },
        });
        actionType = "USER_DELETED";
        break;

      case "promote":
        result = await database.user.updateMany({
          where: { id: { in: userIds } },
          data: {
            role: "ADMIN",
          },
        });
        actionType = "USER_PROMOTED_ADMIN";
        break;

      case "demote":
        result = await database.user.updateMany({
          where: { id: { in: userIds } },
          data: {
            role: "CONSUMER",
          },
        });
        actionType = "USER_DEMOTED_ADMIN";
        break;
    }

    // Log admin actions for each user
    await Promise.all(
      userIds.map((userId: any) =>
        logAdminAction(session.user.id, actionType, userId, {
          operation,
          reason,
          bulkOperation: true,
        }),
      ),
    );

    return NextResponse.json({
      success: true,
      data: {
        operation,
        affected: result.count,
        userIds,
      },
    });
  } catch (error) {
    logger.error("Failed to perform bulk operation:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BULK_OPERATION_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to perform bulk operation",
        },
      },
      { status: 500 },
    );
  }
}
