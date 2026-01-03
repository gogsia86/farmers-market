/**
 * 🏷️ CATEGORIES API ROUTE
 *
 * Public endpoint for fetching product categories with divine agricultural consciousness
 *
 * Endpoints:
 * - GET /api/categories - List all categories with optional product counts
 *
 * @phase Phase 4: API Route Integration
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 */

import { database } from "@/lib/database";
import { createLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("categories-api");

/**
 * GET /api/categories
 *
 * Returns all product categories with optional product counts
 *
 * Query Parameters:
 * - includeCount?: boolean - Include product count per category (default: true)
 * - activeOnly?: boolean - Only include categories with active products (default: true)
 *
 * @example
 * GET /api/categories
 * GET /api/categories?includeCount=true&activeOnly=false
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "name": "VEGETABLES",
 *       "slug": "vegetables",
 *       "count": 42
 *     },
 *     ...
 *   ],
 *   "meta": {
 *     "total": 8,
 *     "timestamp": "2024-12-17T..."
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCount = searchParams.get("includeCount") !== "false"; // Default true
    const activeOnly = searchParams.get("activeOnly") !== "false"; // Default true

    logger.debug("Fetching categories", {
      includeCount,
      activeOnly,
    });

    // Build where clause
    const where: any = {};

    if (activeOnly) {
      where.inStock = true;
    }

    // Get distinct categories with counts using groupBy
    const categoryGroups = await database.product.groupBy({
      by: ["category"],
      where,
      _count: includeCount
        ? {
          id: true,
        }
        : undefined,
      orderBy: {
        category: "asc",
      },
    });

    // Format categories with proper structure
    const formattedCategories = categoryGroups
      .filter((cat) => cat.category) // Remove null/undefined categories
      .map((cat) => ({
        name: cat.category,
        slug: cat.category.toLowerCase().replace(/[_\s]+/g, "-"),
        displayName: formatCategoryName(cat.category),
        count: includeCount ? cat._count?.id || 0 : undefined,
      }))
      .filter((cat) => !includeCount || (cat.count && cat.count > 0)); // Only show categories with products if counting

    logger.info("Categories fetched successfully", {
      total: formattedCategories.length,
      includeCount,
      activeOnly,
    });

    return NextResponse.json({
      success: true,
      data: formattedCategories,
      meta: {
        total: formattedCategories.length,
        timestamp: new Date().toISOString(),
        agricultural: {
          consciousness: "ACTIVE",
          operation: "LIST_CATEGORIES",
        },
      },
    });
  } catch (error) {
    logger.error("Categories API error", error as Error, {
      endpoint: "GET /api/categories",
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * Helper function to format category names for display
 *
 * @param category - Raw category name (e.g., "VEGETABLES", "DAIRY_PRODUCTS")
 * @returns Formatted display name (e.g., "Vegetables", "Dairy Products")
 */
function formatCategoryName(category: string): string {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Divine categories endpoint established ✨🏷️
 * Agricultural consciousness: ACTIVE
 * Ready for quantum category operations
 */
