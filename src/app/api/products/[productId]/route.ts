/**
 * 🌾 Product by ID API - Divine Product Operations
 * Handles individual product operations (get, update, delete)
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 10_AGRICULTURAL_FEATURE_PATTERNS
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import type { Product, ProductCategory, ProductStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Update product validation schema
 */
const UpdateProductSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  category: z.enum([
    "VEGETABLES",
    "FRUITS",
    "GRAINS",
    "DAIRY",
    "MEAT",
    "EGGS",
    "HONEY",
    "PRESERVES",
    "BAKED_GOODS",
    "HERBS",
    "OTHER",
  ]).optional(),
  price: z.number().positive().optional(),
  unit: z.string().optional(),
  quantityAvailable: z.number().nonnegative().optional(),
  images: z.array(z.string().url()).optional(),
  organic: z.boolean().optional(),
  harvestDate: z.string().optional(),
  storageInstructions: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["ACTIVE", "OUT_OF_STOCK", "DISCONTINUED", "DRAFT"]).optional(),
});

interface ProductResponse {
  success: boolean;
  data?: Product;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    message?: string;
  };
}

/**
 * GET /api/products/[productId]
 * Retrieve a specific product by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
): Promise<NextResponse<ProductResponse>> {
  try {
    const { productId } = params;

    const product = await database.product.findUnique({
      where: { id: productId },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
            location: true,
            certifications: true,
            owner: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: `Product with ID ${productId} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Increment view count
    await database.product.update({
      where: { id: productId },
      data: {
        viewsCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: product as unknown as Product,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(`GET /api/products/[productId] error:`, error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PRODUCT_FETCH_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch product",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/products/[productId]
 * Update a specific product
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { productId: string } }
): Promise<NextResponse<ProductResponse>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to update products",
          },
        },
        { status: 401 }
      );
    }

    const user = session.user as any;

    // Only farmers and admins can update products
    if (user.role !== "FARMER" && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHORIZATION_ERROR",
            message: "Only farmers and admins can update products",
          },
        },
        { status: 403 }
      );
    }

    const { productId } = params;

    // Check if product exists and verify ownership
    const existingProduct = await database.product.findUnique({
      where: { id: productId },
      include: {
        farm: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: `Product with ID ${productId} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Verify farm ownership
    if (existingProduct.farm.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHORIZATION_ERROR",
            message: "You don't have permission to update this product",
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request
    const validation = UpdateProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid product data",
            details: validation.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // Prepare update data
    const data: any = {};

    if (updateData.name !== undefined) {
      data.name = updateData.name;
      // Update slug if name changes
      data.slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    if (updateData.description !== undefined) {
      data.description = updateData.description;
    }

    if (updateData.category !== undefined) {
      data.category = updateData.category as ProductCategory;
    }

    if (updateData.price !== undefined) {
      data.price = updateData.price;
    }

    if (updateData.unit !== undefined) {
      data.unit = updateData.unit;
    }

    if (updateData.quantityAvailable !== undefined) {
      data.quantityAvailable = updateData.quantityAvailable;
      // Auto-update status based on quantity
      if (updateData.quantityAvailable === 0 && !updateData.status) {
        data.status = "OUT_OF_STOCK" as ProductStatus;
      } else if (updateData.quantityAvailable > 0 && existingProduct.status === "OUT_OF_STOCK") {
        data.status = "ACTIVE" as ProductStatus;
      }
    }

    if (updateData.images !== undefined) {
      data.images = updateData.images;
    }

    if (updateData.organic !== undefined) {
      data.organic = updateData.organic;
    }

    if (updateData.harvestDate !== undefined) {
      data.harvestDate = new Date(updateData.harvestDate);
    }

    if (updateData.storageInstructions !== undefined) {
      data.storageInstructions = updateData.storageInstructions;
    }

    if (updateData.tags !== undefined) {
      data.tags = updateData.tags;
    }

    if (updateData.status !== undefined) {
      data.status = updateData.status as ProductStatus;
    }

    // Update product
    const product = await database.product.update({
      where: { id: productId },
      data,
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: product as unknown as Product,
      meta: {
        timestamp: new Date().toISOString(),
        message: "Product updated successfully",
      },
    });
  } catch (error) {
    console.error(`PATCH /api/products/[productId] error:`, error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PRODUCT_UPDATE_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to update product",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[productId]
 * Delete/discontinue a specific product
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
): Promise<NextResponse<ProductResponse>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "You must be logged in to delete products",
          },
        },
        { status: 401 }
      );
    }

    const user = session.user as any;

    // Only farmers and admins can delete products
    if (user.role !== "FARMER" && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHORIZATION_ERROR",
            message: "Only farmers and admins can delete products",
          },
        },
        { status: 403 }
      );
    }

    const { productId } = params;

    // Check if product exists and verify ownership
    const existingProduct = await database.product.findUnique({
      where: { id: productId },
      include: {
        farm: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: `Product with ID ${productId} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Verify farm ownership
    if (existingProduct.farm.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHORIZATION_ERROR",
            message: "You don't have permission to delete this product",
          },
        },
        { status: 403 }
      );
    }

    // Soft delete: mark as discontinued instead of hard delete
    // This preserves order history and references
    const product = await database.product.update({
      where: { id: productId },
      data: {
        status: "DISCONTINUED" as ProductStatus,
      },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: product as unknown as Product,
      meta: {
        timestamp: new Date().toISOString(),
        message: "Product discontinued successfully",
      },
    });
  } catch (error) {
    console.error(`DELETE /api/products/[productId] error:`, error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PRODUCT_DELETE_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to delete product",
        },
      },
      { status: 500 }
    );
  }
}
