/**
 * 🏪 FARM DETAIL API ROUTE
 * RESTful API for individual farm operations with agricultural consciousness
 *
 * Endpoints:
 * - GET /api/farms/[farmId] - Get farm details
 * - PATCH /api/farms/[farmId] - Update farm (authenticated owner/admin)
 * - DELETE /api/farms/[farmId] - Delete farm (authenticated owner/admin)
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import type { Farm, FarmStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/monitoring/logger";

// ============================================================================
// TYPES & VALIDATION
// ============================================================================

const UpdateFarmSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  description: z.string().min(10).optional(),
  story: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  businessName: z.string().optional(),
  taxId: z.string().optional(),
  businessType: z.string().optional(),
  yearEstablished: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),
  farmSize: z.number().positive().optional(),
  certificationsArray: z.array(z.string()).optional(),
  deliveryRadius: z.number().int().positive().optional(),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
});

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ============================================================================
// GET /api/farms/[farmId] - GET FARM DETAILS
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { farmId: string } },
): Promise<NextResponse<ApiResponse<Farm>>> {
  try {
    const { farmId } = params;

    // Get farm with related data
    const farm = await database.farm.findUnique({
      where: { id: farmId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        products: {
          where: {
            status: "ACTIVE",
          },
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            unit: true,
            images: true,
            category: true,
            organic: true,
          },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            products: true,
            reviews: true,
            orders: true,
          },
        },
      },
    });

    if (!farm) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Farm not found",
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: farm as unknown as Farm,
    });
  } catch (error) {
    logger.error("GET /api/farms/[farmId] error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch farm",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// PATCH /api/farms/[farmId] - UPDATE FARM
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { farmId: string } },
): Promise<NextResponse<ApiResponse<Farm>>> {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
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

    const { farmId } = params;
    const user = session.user as any;

    // Get farm to check ownership
    const farm = await database.farm.findUnique({
      where: { id: farmId },
      select: { id: true, ownerId: true },
    });

    if (!farm) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Farm not found",
          },
        },
        { status: 404 },
      );
    }

    // Check authorization (owner or admin)
    if (farm.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You do not have permission to update this farm",
          },
        },
        { status: 403 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = UpdateFarmSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid update data",
            details: validation.error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    const updateData = validation.data;

    // Build update object with only provided fields
    const dataToUpdate: any = {
      updatedAt: new Date(),
    };

    if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
    if (updateData.description !== undefined)
      dataToUpdate.description = updateData.description;
    if (updateData.story !== undefined) dataToUpdate.story = updateData.story;
    if (updateData.email !== undefined) dataToUpdate.email = updateData.email;
    if (updateData.phone !== undefined) dataToUpdate.phone = updateData.phone;
    if (updateData.website !== undefined)
      dataToUpdate.website = updateData.website;
    if (updateData.address !== undefined)
      dataToUpdate.address = updateData.address;
    if (updateData.city !== undefined) dataToUpdate.city = updateData.city;
    if (updateData.state !== undefined) dataToUpdate.state = updateData.state;
    if (updateData.zipCode !== undefined)
      dataToUpdate.zipCode = updateData.zipCode;
    if (updateData.latitude !== undefined)
      dataToUpdate.latitude = updateData.latitude;
    if (updateData.longitude !== undefined)
      dataToUpdate.longitude = updateData.longitude;
    if (updateData.businessName !== undefined)
      dataToUpdate.businessName = updateData.businessName;
    if (updateData.taxId !== undefined) dataToUpdate.taxId = updateData.taxId;
    if (updateData.businessType !== undefined)
      dataToUpdate.businessType = updateData.businessType;
    if (updateData.yearEstablished !== undefined)
      dataToUpdate.yearEstablished = updateData.yearEstablished;
    if (updateData.farmSize !== undefined)
      dataToUpdate.farmSize = updateData.farmSize;
    if (updateData.certificationsArray !== undefined)
      dataToUpdate.certificationsArray = updateData.certificationsArray;
    if (updateData.deliveryRadius !== undefined)
      dataToUpdate.deliveryRadius = updateData.deliveryRadius;
    if (updateData.logoUrl !== undefined)
      dataToUpdate.logoUrl = updateData.logoUrl;
    if (updateData.bannerUrl !== undefined)
      dataToUpdate.bannerUrl = updateData.bannerUrl;
    if (updateData.images !== undefined)
      dataToUpdate.images = updateData.images;

    // Update farm
    const updatedFarm = await database.farm.update({
      where: { id: farmId },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      data: updatedFarm,
    });
  } catch (error) {
    logger.error("PATCH /api/farms/[farmId] error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update farm",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// DELETE /api/farms/[farmId] - DELETE FARM
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { farmId: string } },
): Promise<NextResponse<ApiResponse<{ message: string }>>> {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
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

    const { farmId } = params;
    const user = session.user as any;

    // Get farm to check ownership and dependencies
    const farm = await database.farm.findUnique({
      where: { id: farmId },
      select: {
        id: true,
        ownerId: true,
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    if (!farm) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Farm not found",
          },
        },
        { status: 404 },
      );
    }

    // Check authorization (owner or admin)
    if (farm.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You do not have permission to delete this farm",
          },
        },
        { status: 403 },
      );
    }

    // Check if farm has active orders
    if (farm._count.orders > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FARM_HAS_ORDERS",
            message:
              "Cannot delete farm with existing orders. Please deactivate instead.",
            details: {
              orderCount: farm._count.orders,
            },
          },
        },
        { status: 409 },
      );
    }

    // Soft delete by setting status to INACTIVE
    await database.farm.update({
      where: { id: farmId },
      data: {
        status: "INACTIVE" as FarmStatus,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Farm deactivated successfully",
      },
    });
  } catch (error) {
    logger.error("DELETE /api/farms/[farmId] error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete farm",
        },
      },
      { status: 500 },
    );
  }
}
