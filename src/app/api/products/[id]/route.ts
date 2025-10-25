/**
 * PRODUCT DETAIL API ROUTE
 * Divine API endpoint for individual product operations
 * GET /api/products/[id] - Get product details
 * PATCH /api/products/[id] - Update product
 * DELETE /api/products/[id] - Delete product
 */

import { authOptions } from "@/lib/auth";
import { ProductService } from "@/lib/services/product.service";
import {
  ProductCategory,
  ProductStatus,
  ProductUnit,
  Season,
} from "@/types/product.ts";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ============================================
// VALIDATION SCHEMAS (Partial for updates)
// ============================================

const UpdateProductSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  category: z.nativeEnum(ProductCategory).optional(),
  subCategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  pricing: z
    .object({
      basePrice: z.object({
        amount: z.number().positive(),
        unit: z.nativeEnum(ProductUnit),
        currency: z.string().default("USD"),
      }),
      bulkPricing: z
        .array(
          z.object({
            minQuantity: z.number().int().positive(),
            maxQuantity: z.number().int().positive().optional(),
            pricePerUnit: z.number().positive(),
            discountPercentage: z.number().min(0).max(100).optional(),
          })
        )
        .optional(),
      minOrderQuantity: z.number().int().positive().optional(),
      maxOrderQuantity: z.number().int().positive().optional(),
    })
    .optional(),
  inventory: z
    .object({
      inStock: z.boolean(),
      quantity: z.number().int().min(0),
      reservedQuantity: z.number().int().min(0).default(0),
      availableQuantity: z.number().int().min(0),
      lowStockThreshold: z.number().int().min(0),
      isLowStock: z.boolean(),
      reorderPoint: z.number().int().positive().optional(),
      lastRestocked: z
        .date()
        .or(z.string().transform((str) => new Date(str)))
        .optional(),
      nextHarvestDate: z
        .date()
        .or(z.string().transform((str) => new Date(str)))
        .optional(),
    })
    .optional(),
  attributes: z
    .object({
      isOrganic: z.boolean(),
      isNonGMO: z.boolean(),
      isLocallyGrown: z.boolean(),
      isSeasonal: z.boolean(),
      isPesticideFree: z.boolean(),
      isGrassFed: z.boolean().optional(),
      isFreeRange: z.boolean().optional(),
      isPastureRaised: z.boolean().optional(),
    })
    .optional(),
  certifications: z
    .array(
      z.object({
        type: z.enum([
          "ORGANIC",
          "NON_GMO",
          "GRASS_FED",
          "FREE_RANGE",
          "PASTURE_RAISED",
          "BIODYNAMIC",
        ]),
        certifier: z.string(),
        certificateNumber: z.string().optional(),
        verifiedDate: z
          .date()
          .or(z.string().transform((str) => new Date(str)))
          .optional(),
      })
    )
    .optional(),
  seasons: z.array(z.nativeEnum(Season)).optional(),
  harvestPeriod: z
    .object({
      start: z.date().or(z.string().transform((str) => new Date(str))),
      end: z.date().or(z.string().transform((str) => new Date(str))),
    })
    .optional(),
  images: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().url(),
        alt: z.string(),
        isPrimary: z.boolean(),
        order: z.number().int().min(0),
        uploadedAt: z.date().or(z.string().transform((str) => new Date(str))),
      })
    )
    .optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
});

// ============================================
// GET /api/products/[id] - Get Product Details
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate UUID
    if (!id || !isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Fetch product
    const product = await ProductService.getProductById(id, true);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product is accessible
    // Only show inactive products to owners
    if (!product.isActive) {
      const session = await getServerSession(authOptions);
      if (!session?.user || product.farm?.ownerId !== session.user.id) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH /api/products/[id] - Update Product
// ============================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Validate UUID
    if (!id || !isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = UpdateProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid update data", details: validation.error.errors },
        { status: 400 }
      );
    }

    // Update product
    const product = await ProductService.updateProduct(
      id,
      validation.data,
      session.user.id
    );

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);

    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes("Validation failed")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/products/[id] - Delete Product
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Validate UUID
    if (!id || !isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Delete product (soft delete)
    await ProductService.deleteProduct(id, session.user.id);

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);

    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
