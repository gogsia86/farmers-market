/**
 * SMART SEARCH API - AI-ENHANCED AGRICULTURAL SEARCH
 *
 * Automatically uses Perplexity to enhance search queries
 * Divine Pattern: Intelligent search with agricultural consciousness
 *
 * Features:
 * - Query enhancement with AI
 * - Seasonal filtering
 * - Smart suggestions
 * - Automatic caching
 */

import { SmartPerplexity } from "@/lib/ai/smart-perplexity-middleware";
import { database } from "@/lib/database";
import { getCurrentSeason } from "@/lib/utils/seasonal";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // Edge runtime for faster response
export const dynamic = "force-dynamic"; // Always fresh results

interface SearchParams {
  q: string; // Query
  seasonal?: boolean; // Filter by current season
  category?: string; // Product category
  limit?: number; // Results limit
}

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const seasonal = searchParams.get("seasonal") === "true";
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Validate query
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Search query is required",
          hint: "Add ?q=your-search-term to the URL",
        },
        { status: 400 }
      );
    }

    // ⚡ DIVINE FEATURE 1: AI-Enhanced Query
    const enhancedSearch = await SmartPerplexity.enhanceSearchQuery(query);

    // Use enhanced query if AI improved it
    const searchTerm =
      enhancedSearch.enhancedQuery || enhancedSearch.originalQuery;

    // Build where clause
    const where: any = {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { tags: { hasSome: [searchTerm.toLowerCase()] } },
      ],
    };

    // Seasonal filter
    if (seasonal) {
      const currentSeason = getCurrentSeason();
      where.availableSeasons = {
        has: currentSeason,
      };
    }

    // Category filter
    if (category) {
      where.categoryId = category;
    }

    // Execute search with divine patterns
    const products = await database.product.findMany({
      where,
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
            location: true,
            certifications: true,
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
      orderBy: [
        { featured: "desc" }, // Featured first
        { inStock: "desc" }, // In stock next
        { createdAt: "desc" }, // Newest last
      ],
    });

    // Get farms matching query too
    const farms = await database.farm.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
        status: "ACTIVE",
      },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        location: true,
        certifications: true,
        images: true,
      },
    });

    // Return enhanced results
    return NextResponse.json({
      success: true,
      query: {
        original: query,
        enhanced: enhancedSearch.enhancedQuery,
        aiEnhanced: enhancedSearch.useAI,
      },
      results: {
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          unit: p.unit,
          inStock: p.inStock,
          organic: p.organic,
          seasonal: p.seasonal,
          images: p.images,
          farm: p.farm,
          category: p.category,
        })),
        farms: farms.map((f) => ({
          id: f.id,
          name: f.name,
          slug: f.slug,
          description: f.description,
          location: f.location,
          certifications: f.certifications,
          image: f.images[0] || null,
        })),
      },
      suggestions: enhancedSearch.aiSuggestions || [],
      metadata: {
        totalProducts: products.length,
        totalFarms: farms.length,
        seasonal: seasonal,
        category: category || "all",
        aiEnhanced: enhancedSearch.useAI,
        cached: false, // First request
      },
    });
  } catch (error) {
    console.error("Smart search error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Search failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        hint: "Try a simpler search term or check your connection",
      },
      { status: 500 }
    );
  }
}

// POST endpoint for complex searches
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      filters = {},
      sort = "relevance",
      limit = 20,
    } = body as {
      query: string;
      filters?: {
        seasonal?: boolean;
        organic?: boolean;
        category?: string;
        priceRange?: { min: number; max: number };
        location?: { lat: number; lng: number; radius: number };
      };
      sort?: "relevance" | "price-asc" | "price-desc" | "newest";
      limit?: number;
    };

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Query is required" },
        { status: 400 }
      );
    }

    // Use AI enhancement
    const enhanced = await SmartPerplexity.enhanceSearchQuery(query);
    const searchTerm = enhanced.enhancedQuery || enhanced.originalQuery;

    // Build complex where clause
    const where: any = {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ],
    };

    // Apply filters
    if (filters.seasonal) {
      where.availableSeasons = { has: getCurrentSeason() };
    }
    if (filters.organic) {
      where.organic = true;
    }
    if (filters.category) {
      where.categoryId = filters.category;
    }
    if (filters.priceRange) {
      where.price = {
        gte: filters.priceRange.min,
        lte: filters.priceRange.max,
      };
    }

    // Determine sort order
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") orderBy = { price: "asc" };
    if (sort === "price-desc") orderBy = { price: "desc" };

    // Execute search
    const products = await database.product.findMany({
      where,
      include: {
        farm: true,
        category: true,
      },
      take: limit,
      orderBy,
    });

    return NextResponse.json({
      success: true,
      query: { original: query, enhanced: searchTerm },
      results: products,
      suggestions: enhanced.aiSuggestions || [],
      metadata: {
        total: products.length,
        filters,
        sort,
        aiEnhanced: enhanced.useAI,
      },
    });
  } catch (error) {
    console.error("Complex search error:", error);
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    );
  }
}
