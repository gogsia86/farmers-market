/**
 * 🌾 DIVINE PRODUCT SERVER ACTIONS
 * Farmers Market Platform - Product Management with Agricultural Consciousness
 * Version: 1.0 - Server Actions Implementation
 *
 * Features:
 * - Complete CRUD operations for products
 * - Authentication & authorization validation
 * - Farm ownership verification
 * - Input validation with Zod
 * - Optimistic cache revalidation
 * - Comprehensive error handling
 * - Agricultural consciousness patterns
 */

"use server";

import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";
import { requireFarmer, getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import {
  ActionResult,
  ActionError,
  ActionErrorCode,
  createSuccessResult,
  createErrorResult,
} from "@/types/actions";
import type { Product, ProductStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Product form schema - matches ProductForm component structure
 */
const productFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000),
  category: z.enum([
    "VEGETABLES",
    "FRUITS",
    "DAIRY",
    "EGGS",
    "MEAT",
    "POULTRY",
    "SEAFOOD",
    "PANTRY",
    "BEVERAGES",
    "BAKED_GOODS",
    "PREPARED_FOODS",
    "FLOWERS",
    "OTHER",
  ]),
  unit: z.enum([
    "LB",
    "OZ",
    "KG",
    "G",
    "PIECE",
    "BUNCH",
    "BAG",
    "BOX",
    "DOZEN",
    "PINT",
    "QUART",
    "GALLON",
  ]),
  basePrice: z.number().positive("Price must be positive"),
  salePrice: z.number().positive().optional().nullable(),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  lowStockThreshold: z.number().int().positive().default(10),
  organic: z.boolean().default(false),
  seasonal: z.boolean().default(false),
  locallyGrown: z.boolean().default(true),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  weight: z.number().positive().optional().nullable(),
  certifications: z.string().optional().nullable(),
  allergens: z.string().optional().nullable(),
  storageInstructions: z.string().max(500).optional().nullable(),
  images: z
    .array(z.string().url())
    .min(1, "At least one image required")
    .max(10),
});

// Type inference for form data (currently unused but kept for future use)
// type ProductFormInput = z.infer<typeof productFormSchema>;

/**
 * Bulk stock update schema
 */
const bulkStockUpdateSchema = z.object({
  updates: z
    .array(
      z.object({
        productId: z.string().cuid(),
        quantity: z.number().int().min(0),
      }),
    )
    .min(1, "At least one product required"),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate URL-friendly slug from product name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Verify user owns the specified farm
 */
async function verifyFarmOwnership(
  farmId: string,
  userId: string,
): Promise<boolean> {
  const farm = await database.farm.findFirst({
    where: {
      id: farmId,
      ownerId: userId,
    },
  });

  return farm !== null;
}

/**
 * Verify user owns the product through farm ownership
 */
async function verifyProductOwnership(
  productId: string,
  userId: string,
): Promise<{ valid: boolean; farmId?: string }> {
  const product = await database.product.findFirst({
    where: {
      id: productId,
    },
    select: {
      farmId: true,
      farm: {
        select: {
          ownerId: true,
        },
      },
    },
  });

  if (!product) {
    return { valid: false };
  }

  const isOwner = product.farm.ownerId === userId;
  return { valid: isOwner, farmId: product.farmId };
}

/**
 * Check if slug is unique within farm
 */
async function isSlugUnique(
  slug: string,
  farmId: string,
  excludeProductId?: string,
): Promise<boolean> {
  const existing = await database.product.findFirst({
    where: {
      farmId,
      slug,
      id: excludeProductId ? { not: excludeProductId } : undefined,
    },
  });

  return existing === null;
}

// ============================================================================
// CREATE PRODUCT ACTION
// ============================================================================

/**
 * Create new product for a farm
 *
 * @param farmId - ID of the farm to create product for
 * @param data - Product form data
 * @returns ActionResult with created product or error
 */
export async function createProductAction(
  farmId: string,
  data: unknown,
): Promise<ActionResult<Product>> {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResult(
        ActionErrorCode.UNAUTHORIZED,
        "You must be logged in to create products",
      );
    }

    // 2. Verify user is a farmer
    const session = await requireFarmer();
    if (!session) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "Only farmers can create products",
      );
    }

    // 3. Verify farm ownership
    const ownsFlag = await verifyFarmOwnership(farmId, user.id);
    if (!ownsFlag) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "You don't have permission to add products to this farm",
      );
    }

    // 4. Validate input data
    const validation = productFormSchema.safeParse(data);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return createErrorResult(
        ActionErrorCode.VALIDATION_ERROR,
        firstError?.message || "Validation failed",
        firstError?.path.join("."),
        { zodErrors: validation.error.issues },
      );
    }

    const validatedData = validation.data;

    // 5. Generate slug from product name
    const baseSlug = generateSlug(validatedData.name);
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug uniqueness by adding counter if needed
    while (!(await isSlugUnique(slug, farmId))) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 6. Prepare product data for database
    const productData: Prisma.ProductCreateInput = {
      farm: {
        connect: { id: farmId },
      },
      name: validatedData.name,
      slug,
      description: validatedData.description,
      category: validatedData.category,
      unit: validatedData.unit,
      price: validatedData.basePrice,
      compareAtPrice: validatedData.salePrice || null,
      quantityAvailable: validatedData.quantity,
      lowStockThreshold: validatedData.lowStockThreshold,
      inStock: validatedData.inStock,
      organic: validatedData.organic,
      seasonal: validatedData.seasonal,
      featured: validatedData.featured,
      storageInstructions: validatedData.storageInstructions || null,
      images: validatedData.images,
      primaryPhotoUrl: validatedData.images[0],
      status: "ACTIVE",
      attributes: {
        certifications: validatedData.certifications
          ? validatedData.certifications.split(",").map((c) => c.trim())
          : [],
        allergens: validatedData.allergens
          ? validatedData.allergens.split(",").map((a) => a.trim())
          : [],
      } as any,
    };

    // 7. Create product in database
    const product = await database.product.create({
      data: productData,
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

    // 8. Revalidate relevant caches
    revalidatePath("/farmer/products");
    revalidatePath(`/farms/${farmId}`);
    revalidatePath(`/farms/${farmId}/products`);

    // 9. Return success with created product
    return createSuccessResult(product, {
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create product error:", error);

    // Handle known Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return createErrorResult(
          ActionErrorCode.CONFLICT,
          "A product with this name already exists",
          "name",
        );
      }
      if (error.code === "P2025") {
        return createErrorResult(ActionErrorCode.NOT_FOUND, "Farm not found");
      }
    }

    // Handle ActionError instances
    if (error instanceof ActionError) {
      return createErrorResult(error.code, error.message, error.field);
    }

    // Generic error fallback
    return createErrorResult(
      ActionErrorCode.INTERNAL_ERROR,
      "Failed to create product. Please try again.",
    );
  }
}

// ============================================================================
// UPDATE PRODUCT ACTION
// ============================================================================

/**
 * Update existing product
 *
 * @param productId - ID of product to update
 * @param data - Updated product form data
 * @returns ActionResult with updated product or error
 */
export async function updateProductAction(
  productId: string,
  data: unknown,
): Promise<ActionResult<Product>> {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResult(
        ActionErrorCode.UNAUTHORIZED,
        "You must be logged in to update products",
      );
    }

    // 2. Verify user is a farmer
    const session = await requireFarmer();
    if (!session) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "Only farmers can update products",
      );
    }

    // 3. Verify product ownership
    const ownership = await verifyProductOwnership(productId, user.id);
    if (!ownership.valid) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "You don't have permission to update this product",
      );
    }

    // 4. Validate input data
    const validation = productFormSchema.safeParse(data);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return createErrorResult(
        ActionErrorCode.VALIDATION_ERROR,
        firstError?.message || "Validation failed",
        firstError?.path.join("."),
        { zodErrors: validation.error.issues },
      );
    }

    const validatedData = validation.data;

    // 5. Get existing product to check if name changed
    const existingProduct = await database.product.findUnique({
      where: { id: productId },
      select: { name: true, farmId: true, slug: true },
    });

    if (!existingProduct) {
      return createErrorResult(ActionErrorCode.NOT_FOUND, "Product not found");
    }

    // 6. Generate new slug if name changed
    let slug = existingProduct.slug;
    if (validatedData.name !== existingProduct.name) {
      const baseSlug = generateSlug(validatedData.name);
      slug = baseSlug;
      let counter = 1;

      // Ensure slug uniqueness
      while (!(await isSlugUnique(slug, existingProduct.farmId, productId))) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // 7. Prepare update data
    const updateData: Prisma.ProductUpdateInput = {
      name: validatedData.name,
      slug,
      description: validatedData.description,
      category: validatedData.category,
      unit: validatedData.unit,
      price: validatedData.basePrice,
      compareAtPrice: validatedData.salePrice || null,
      quantityAvailable: validatedData.quantity,
      lowStockThreshold: validatedData.lowStockThreshold,
      inStock: validatedData.inStock,
      organic: validatedData.organic,
      seasonal: validatedData.seasonal,
      featured: validatedData.featured,
      storageInstructions: validatedData.storageInstructions || null,
      images: validatedData.images,
      primaryPhotoUrl: validatedData.images[0],
      attributes: {
        certifications: validatedData.certifications
          ? validatedData.certifications.split(",").map((c) => c.trim())
          : [],
        allergens: validatedData.allergens
          ? validatedData.allergens.split(",").map((a) => a.trim())
          : [],
      } as any,
      updatedAt: new Date(),
    };

    // 8. Update product in database
    const product = await database.product.update({
      where: { id: productId },
      data: updateData,
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

    // 9. Revalidate relevant caches
    revalidatePath("/farmer/products");
    revalidatePath(`/farms/${ownership.farmId}`);
    revalidatePath(`/farms/${ownership.farmId}/products`);
    revalidatePath(`/products/${productId}`);
    revalidatePath(`/products/${slug}`);

    // 10. Return success with updated product
    return createSuccessResult(product, {
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update product error:", error);

    // Handle known Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return createErrorResult(
          ActionErrorCode.CONFLICT,
          "A product with this name already exists",
          "name",
        );
      }
      if (error.code === "P2025") {
        return createErrorResult(
          ActionErrorCode.NOT_FOUND,
          "Product not found",
        );
      }
    }

    // Handle ActionError instances
    if (error instanceof ActionError) {
      return createErrorResult(error.code, error.message, error.field);
    }

    // Generic error fallback
    return createErrorResult(
      ActionErrorCode.INTERNAL_ERROR,
      "Failed to update product. Please try again.",
    );
  }
}

// ============================================================================
// DELETE PRODUCT ACTION
// ============================================================================

/**
 * Delete product (soft delete by archiving)
 *
 * @param productId - ID of product to delete
 * @returns ActionResult with void or error
 */
export async function deleteProductAction(
  productId: string,
): Promise<ActionResult<void>> {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResult(
        ActionErrorCode.UNAUTHORIZED,
        "You must be logged in to delete products",
      );
    }

    // 2. Verify user is a farmer
    const session = await requireFarmer();
    if (!session) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "Only farmers can delete products",
      );
    }

    // 3. Verify product ownership
    const ownership = await verifyProductOwnership(productId, user.id);
    if (!ownership.valid) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "You don't have permission to delete this product",
      );
    }

    // 4. Check if product has pending orders
    const pendingOrders = await database.orderItem.count({
      where: {
        productId,
        order: {
          status: {
            in: ["PENDING", "CONFIRMED", "PREPARING", "READY"],
          },
        },
      },
    });

    if (pendingOrders > 0) {
      return createErrorResult(
        ActionErrorCode.BUSINESS_RULE_VIOLATION,
        `Cannot delete product with ${pendingOrders} pending order(s). Please fulfill or cancel them first.`,
      );
    }

    // 5. Soft delete - archive the product
    await database.product.update({
      where: { id: productId },
      data: {
        status: "ARCHIVED",
        inStock: false,
        updatedAt: new Date(),
      },
    });

    // 6. Revalidate relevant caches
    revalidatePath("/farmer/products");
    revalidatePath(`/farms/${ownership.farmId}`);
    revalidatePath(`/farms/${ownership.farmId}/products`);

    // 7. Return success
    return createSuccessResult(undefined, {
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete product error:", error);

    // Handle known Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return createErrorResult(
          ActionErrorCode.NOT_FOUND,
          "Product not found",
        );
      }
    }

    // Handle ActionError instances
    if (error instanceof ActionError) {
      return createErrorResult(error.code, error.message, error.field);
    }

    // Generic error fallback
    return createErrorResult(
      ActionErrorCode.INTERNAL_ERROR,
      "Failed to delete product. Please try again.",
    );
  }
}

// ============================================================================
// TOGGLE PRODUCT STATUS ACTION
// ============================================================================

/**
 * Toggle product status (ACTIVE ↔ OUT_OF_STOCK ↔ ARCHIVED)
 *
 * @param productId - ID of product to toggle
 * @param status - New status to set
 * @returns ActionResult with updated product or error
 */
export async function toggleProductStatusAction(
  productId: string,
  status: ProductStatus,
): Promise<ActionResult<Product>> {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResult(
        ActionErrorCode.UNAUTHORIZED,
        "You must be logged in to update product status",
      );
    }

    // 2. Verify user is a farmer
    const session = await requireFarmer();
    if (!session) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "Only farmers can update product status",
      );
    }

    // 3. Verify product ownership
    const ownership = await verifyProductOwnership(productId, user.id);
    if (!ownership.valid) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "You don't have permission to update this product",
      );
    }

    // 4. Validate status value
    const validStatuses: ProductStatus[] = [
      "ACTIVE",
      "OUT_OF_STOCK",
      "ARCHIVED",
    ];
    if (!validStatuses.includes(status)) {
      return createErrorResult(
        ActionErrorCode.VALIDATION_ERROR,
        "Invalid product status",
        "status",
      );
    }

    // 5. Update product status and related fields
    const updateData: Prisma.ProductUpdateInput = {
      status,
      inStock: status === "ACTIVE",
      updatedAt: new Date(),
    };

    const product = await database.product.update({
      where: { id: productId },
      data: updateData,
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

    // 6. Revalidate relevant caches
    revalidatePath("/farmer/products");
    revalidatePath(`/farms/${ownership.farmId}`);
    revalidatePath(`/farms/${ownership.farmId}/products`);
    revalidatePath(`/products/${productId}`);

    // 7. Return success with updated product
    return createSuccessResult(product, {
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Toggle product status error:", error);

    // Handle known Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return createErrorResult(
          ActionErrorCode.NOT_FOUND,
          "Product not found",
        );
      }
    }

    // Handle ActionError instances
    if (error instanceof ActionError) {
      return createErrorResult(error.code, error.message, error.field);
    }

    // Generic error fallback
    return createErrorResult(
      ActionErrorCode.INTERNAL_ERROR,
      "Failed to update product status. Please try again.",
    );
  }
}

// ============================================================================
// BULK UPDATE STOCK ACTION
// ============================================================================

/**
 * Bulk update product stock quantities
 *
 * @param updates - Array of product IDs and new quantities
 * @returns ActionResult with count of updated products or error
 */
export async function bulkUpdateStockAction(
  updates: Array<{ productId: string; quantity: number }>,
): Promise<ActionResult<number>> {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResult(
        ActionErrorCode.UNAUTHORIZED,
        "You must be logged in to update stock",
      );
    }

    // 2. Verify user is a farmer
    const session = await requireFarmer();
    if (!session) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "Only farmers can update stock",
      );
    }

    // 3. Validate input
    const validation = bulkStockUpdateSchema.safeParse({ updates });
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return createErrorResult(
        ActionErrorCode.VALIDATION_ERROR,
        firstError?.message || "Validation failed",
        firstError?.path.join("."),
      );
    }

    // 4. Verify ownership of all products
    const productIds = updates.map((u) => u.productId);
    const products = await database.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        farmId: true,
        farm: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    // Check if all products exist
    if (products.length !== productIds.length) {
      return createErrorResult(
        ActionErrorCode.NOT_FOUND,
        "One or more products not found",
      );
    }

    // Check if user owns all products
    const invalidProducts = products.filter((p) => p.farm.ownerId !== user.id);
    if (invalidProducts.length > 0) {
      return createErrorResult(
        ActionErrorCode.FORBIDDEN,
        "You don't have permission to update some of these products",
      );
    }

    // 5. Perform bulk update in transaction
    const updatePromises = updates.map((update) =>
      database.product.update({
        where: { id: update.productId },
        data: {
          quantityAvailable: update.quantity,
          inStock: update.quantity > 0,
          updatedAt: new Date(),
        },
      }),
    );

    await database.$transaction(updatePromises);

    // 6. Revalidate caches for unique farms
    const uniqueFarmIds = [...new Set(products.map((p) => p.farmId))];
    uniqueFarmIds.forEach((farmId) => {
      revalidatePath(`/farms/${farmId}`);
      revalidatePath(`/farms/${farmId}/products`);
    });
    revalidatePath("/farmer/products");

    // 7. Return success with count
    return createSuccessResult(updates.length, {
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Bulk update stock error:", error);

    // Handle ActionError instances
    if (error instanceof ActionError) {
      return createErrorResult(error.code, error.message, error.field);
    }

    // Generic error fallback
    return createErrorResult(
      ActionErrorCode.INTERNAL_ERROR,
      "Failed to update stock. Please try again.",
    );
  }
}
