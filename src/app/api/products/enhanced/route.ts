/**
 * PRODUCT CREATION API - AUTO DESCRIPTION GENERATION
 *
 * Automatically generates high-quality product descriptions using Perplexity AI
 * Divine Pattern: Smart enhancement for farmer convenience
 *
 * Features:
 * - Auto-generate missing descriptions
 * - Enhance poor quality descriptions
 * - Agricultural consciousness in content
 * - Smart caching for efficiency
 */

import { SmartPerplexity } from "@/lib/ai/smart-perplexity-middleware";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const ProductCreateSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  price: z.number().positive("Price must be positive"),
  unit: z.string().min(1, "Unit is required"),
  farmId: z.string().min(1, "Farm ID is required"),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  organic: z.boolean().optional().default(false),
  seasonal: z.boolean().optional().default(false),
  inStock: z.boolean().optional().default(true),
  quantity: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
          hint: "Please log in to create products",
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = ProductCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verify farm ownership
    const farm = await database.farm.findUnique({
      where: { id: data.farmId },
      select: { id: true, ownerId: true },
    });

    if (!farm) {
      return NextResponse.json(
        {
          success: false,
          error: "Farm not found",
          hint: "Verify the farm ID is correct",
        },
        { status: 404 }
      );
    }

    if (farm.ownerId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          hint: "You can only add products to your own farms",
        },
        { status: 403 }
      );
    }

    // ⚡ DIVINE FEATURE 2: Auto Description Generation
    const descriptionEnhancement =
      await SmartPerplexity.autoGenerateProductDescription(
        data.name,
        data.category,
        data.description
      );

    // Use AI-generated description if better quality
    const finalDescription = descriptionEnhancement.aiGenerated
      ? descriptionEnhancement.description
      : data.description || descriptionEnhancement.description;

    // Create product with enhanced description
    const product = await database.product.create({
      data: {
        name: data.name,
        description: finalDescription,
        categoryId: data.category,
        price: data.price,
        unit: data.unit,
        farmId: data.farmId,
        images: data.images || [],
        tags: data.tags || [],
        organic: data.organic,
        seasonal: data.seasonal,
        inStock: data.inStock,
        quantity: data.quantity,
        // Metadata
        aiEnhanced: descriptionEnhancement.aiGenerated,
        descriptionQuality: descriptionEnhancement.quality,
      },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Return success with metadata
    return NextResponse.json(
      {
        success: true,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          unit: product.unit,
          farm: product.farm,
          category: product.category,
          images: product.images,
          organic: product.organic,
          seasonal: product.seasonal,
          inStock: product.inStock,
        },
        enhancement: {
          aiGenerated: descriptionEnhancement.aiGenerated,
          quality: descriptionEnhancement.quality,
          improved: data.description !== finalDescription,
        },
        message: descriptionEnhancement.aiGenerated
          ? "✨ Product created with AI-enhanced description!"
          : "✅ Product created successfully!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product creation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create product",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        hint: "Please try again or contact support",
      },
      { status: 500 }
    );
  }
}

// GET endpoint - List products with AI suggestions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const farmId = searchParams.get("farmId");
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);

    // Build where clause
    const where: Record<string, unknown> = {};
    if (farmId) {
      where.farmId = farmId;
    }

    // Get products
    const products = await database.product.findMany({
      where,
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Check which products have poor descriptions
    const productsWithQuality = products.map((p) => ({
      ...p,
      descriptionQuality: p.description
        ? p.description.length > 100
          ? "good"
          : "fair"
        : "poor",
      canImprove: !p.description || p.description.length < 100,
    }));

    return NextResponse.json({
      success: true,
      products: productsWithQuality,
      metadata: {
        total: products.length,
        needsImprovement: productsWithQuality.filter((p) => p.canImprove)
          .length,
      },
    });
  } catch (error) {
    console.error("Product listing error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// PATCH endpoint - Update product with AI enhancement
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, enhanceDescription } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get product
    const product = await database.product.findUnique({
      where: { id: productId },
      include: {
        farm: {
          select: { ownerId: true },
        },
        category: {
          select: { name: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (product.farm.ownerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Enhance description if requested
    let finalDescription = product.description;
    let enhanced = false;

    if (enhanceDescription) {
      const enhancement = await SmartPerplexity.autoGenerateProductDescription(
        product.name,
        product.category.name,
        product.description || undefined
      );

      if (enhancement.aiGenerated && enhancement.quality === "excellent") {
        finalDescription = enhancement.description;
        enhanced = true;
      }
    }

    // Update product
    const updated = await database.product.update({
      where: { id: productId },
      data: {
        ...body,
        description: finalDescription,
        aiEnhanced: enhanced,
      },
    });

    return NextResponse.json({
      success: true,
      product: updated,
      enhanced,
      message: enhanced
        ? "✨ Product updated with AI enhancement!"
        : "✅ Product updated successfully!",
    });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}
