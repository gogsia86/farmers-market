/**
 * Admin User Detail API
 * GET: Get detailed information about a specific user
 */

import { auth } from "@/lib/auth";

import type { Order } from "@prisma/client";
import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

import { logger } from '@/lib/monitoring/logger';

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

// ============================================================================
// GET /api/admin/users/[id] - Get user details
// ============================================================================

export async function GET(
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

    // Fetch user with comprehensive details
    const user = await database.user.findUnique({
      where: { id: userId },
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
        phone: true,
        avatar: true,
        lastLoginAt: true,
        loginCount: true,
        createdAt: true,
        updatedAt: true,
        suspensionReason: true,
        suspendedAt: true,
        suspendedBy: true,
        _count: {
          select: {
            orders: true,
            farms: true,
            reviews: true,
            favorites: true,
            cartItems: true,
            addresses: true,
          },
        },
      },
    });

    if (!user) {
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

    // Get user's farms (if farmer)
    let farms: Array<{
      id: string;
      name: string;
      status: string;
      createdAt: Date;
      _count: {
        products: number;
        reviews: number;
      };
    }> = [];
    if (user.role === "FARMER") {
      farms = await database.farm.findMany({
        where: { ownerId: userId },
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              products: true,
              reviews: true,
            },
          },
        },
      });
    }

    // Get recent orders
    const recentOrders = await database.order.findMany({
      where: { customerId: userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
      },
    });

    // Get recent reviews
    const recentReviews = await database.review.findMany({
      where: { customerId: userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        reviewText: true,
        status: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get recent admin actions on this user
    const recentAdminActions = await database.adminAction.findMany({
      where: {
        targetId: userId,
        targetType: "USER",
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        description: true,
        createdAt: true,
        metadata: true,
        admin: {
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Calculate statistics
    const orderStats = await database.order.aggregate({
      where: {
        customerId: userId,
        status: "COMPLETED",
      },
      _sum: {
        total: true,
      },
      _count: true,
    });

    const totalSpent = orderStats._sum?.total
      ? parseFloat(orderStats._sum.total.toString())
      : 0;

    const avgRating = await database.review.aggregate({
      where: {
        customerId: userId,
        status: "APPROVED",
      },
      _avg: {
        rating: true,
      },
    });

    // Get suspension details if applicable
    let suspendedByAdmin = null;
    if (user.suspendedBy) {
      suspendedByAdmin = await database.user.findUnique({
        where: { id: user.suspendedBy },
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...user,
          suspendedByAdmin,
        },
        stats: {
          totalOrders: user._count.orders,
          completedOrders: orderStats._count,
          totalSpent,
          totalReviews: user._count.reviews,
          averageRating: avgRating._avg.rating
            ? parseFloat(avgRating._avg.rating.toFixed(2))
            : 0,
          totalFarms: user._count.farms,
          totalFavorites: user._count.favorites,
          totalAddresses: user._count.addresses,
        },
        farms: farms.map((farm: any) => ({
          ...farm,
          productCount: farm._count.products,
          reviewCount: farm._count.reviews,
        })),
        recentOrders: recentOrders.map((order: any) => ({
          ...order,
          total: parseFloat(order.total.toString()),
        })),
        recentReviews,
        recentAdminActions,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch user details:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_USER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch user details",
        },
      },
      { status: 500 }
    );
  }
}
