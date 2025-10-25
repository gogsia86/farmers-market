/**
 * SEARCH API ENDPOINT - PRODUCT SEARCH
 *
 * Searches products by name, description, and category.
 * Returns paginated results with ranking.
 *
 * Query Parameters:
 * - q: Search query (required, min 2 chars)
 * - limit: Max results (optional, default 10)
 * - category: Filter by category (optional)
 */

import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");

    // Validate query
    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Build search conditions
    const searchConditions: any = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
      ],
      isActive: true,
    };

    if (category) {
      searchConditions.category = category;
    }

    // Search products
    const products = await database.product.findMany({
      where: searchConditions,
      take: Math.min(limit, 50), // Max 50 results
      orderBy: [
        { name: "asc" }, // Sort alphabetically
      ],
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        images: true,
        unit: true,
      },
    });

    // Format results
    const results = products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category || "Uncategorized",
      price: product.price,
      image: product.images?.[0] || "/placeholder-product.jpg",
      inStock: true, // Simplified for now
    }));

    return NextResponse.json({
      success: true,
      query,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}
