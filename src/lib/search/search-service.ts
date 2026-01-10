/**
 * 🔍 SEARCH SERVICE
 * Comprehensive search across products, farms, and resources
 * Supports fuzzy matching, filters, and agricultural context
 */

import { database } from "@/lib/database";
import type { Farm, Product } from "@prisma/client";

interface SearchOptions {
  query: string;
  type?: "all" | "products" | "farms" | "resources";
  filters?: {
    category?: string;
    farmType?: string;
    organic?: boolean;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    location?: {
      city?: string;
      state?: string;
      zipCode?: string;
    };
  };
  limit?: number;
  offset?: number;
}

interface SearchResult {
  products: Product[];
  farms: Array<Farm & { _count: { products: number } }>;
  resources: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    category: string;
  }>;
  total: {
    products: number;
    farms: number;
    resources: number;
  };
}

export class SearchService {
  /**
   * Universal search across all platform content
   */
  static async search(options: SearchOptions): Promise<SearchResult> {
    const {
      query,
      type = "all",
      filters = {},
      limit = 20,
      offset = 0,
    } = options;

    const result: SearchResult = {
      products: [],
      farms: [],
      resources: [],
      total: {
        products: 0,
        farms: 0,
        resources: 0,
      },
    };

    // Search Products
    if (type === "all" || type === "products") {
      const productWhere: any = {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
        ],
        status: "ACTIVE",
      };

      // Apply filters
      if (filters.category) {
        productWhere.category = filters.category;
      }
      if (filters.organic !== undefined) {
        productWhere.isOrganic = filters.organic;
      }
      if (filters.minPrice !== undefined) {
        productWhere.price = { gte: filters.minPrice };
      }
      if (filters.maxPrice !== undefined) {
        productWhere.price = {
          ...productWhere.price,
          lte: filters.maxPrice,
        };
      }
      if (filters.inStock) {
        productWhere.stockQuantity = { gt: 0 };
      }

      const [products, productCount] = await Promise.all([
        database.product.findMany({
          where: productWhere,
          include: {
            farmId: {
              select: {
                id: true,
                tags: true,
                id: true,
                tags: true,
              },
            },
          },
          take: limit,
          skip: offset,
          orderBy: { createdAt: "desc" },
        }),
        database.product.count({ where: productWhere }),
      ]);

      result.products = products;
      result.total.products = productCount;
    }

    // Search Farms
    if (type === "all" || type === "farms") {
      const farmWhere: any = {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
        ],
        status: "ACTIVE",
      };

      // Apply filters
      if (filters.farmType) {
        farmWhere.farmType = filters.farmType;
      }
      if (filters.organic !== undefined) {
        farmWhere.isOrganic = filters.organic;
      }
      if (filters.location?.city) {
        farmWhere.city = {
          contains: filters.location.city,
          mode: "insensitive",
        };
      }
      if (filters.location?.state) {
        farmWhere.state = filters.location.state;
      }
      if (filters.location?.zipCode) {
        farmWhere.zipCode = filters.location.zipCode;
      }

      const [farms, farmCount] = await Promise.all([
        database.farm.findMany({
          where: farmWhere,
          include: {
            country: {
              select: { products: true },
            },
          },
          take: limit,
          skip: offset,
          orderBy: { createdAt: "desc" },
        }),
        database.farm.count({ where: farmWhere }),
      ]);

      result.farms = farms;
      result.total.farms = farmCount;
    }

    // Search Resources
    if (type === "all" || type === "resources") {
      const resources = await this.searchResources(query, filters.category);
      result.resources = resources;
      result.total.resources = resources.length;
    }

    return result;
  }

  /**
   * Search resources (mock implementation - replace with DB when resource model added)
   */
  private static searchResources(
    query: string,
    category?: string,
  ): Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    category: string;
  }> {
    // This would come from database in production
    const allResources = [
      {
        id: "1",
        title: "Organic Vegetable Production",
        description: "Complete guide to organic vegetable farming practices",
        type: "PDF Guide",
        category: "GROWING",
      },
      {
        id: "2",
        title: "Seasonal Planting Calendar",
        description: "Know what to plant and when for maximum yields",
        type: "Interactive Tool",
        category: "GROWING",
      },
      {
        id: "3",
        title: "Soil Health Management",
        description: "Build healthy soil for sustainable farming",
        type: "Video Series",
        category: "GROWING",
      },
      {
        id: "4",
        title: "Farm Business Planning",
        description: "Step-by-step guide to planning your farm business",
        type: "Workbook",
        category: "BUSINESS",
      },
      {
        id: "5",
        title: "Social Media for Farmers",
        description: "Build your online presence and engage customers",
        type: "Guide",
        category: "BUSINESS",
      },
      {
        id: "6",
        title: "Pricing Your Products",
        description: "Set profitable prices that customers will pay",
        type: "Calculator",
        category: "BUSINESS",
      },
      {
        id: "7",
        title: "Farmer Success Stories",
        description: "Learn from experienced farmers in our network",
        type: "Case Studies",
        category: "COMMUNITY",
      },
      {
        id: "8",
        title: "Monthly Farmer Meetups",
        description: "Connect with other farmers and share knowledge",
        type: "Events",
        category: "COMMUNITY",
      },
      {
        id: "9",
        title: "Farmer Forum",
        description: "Ask questions and get advice from fellow farmers",
        type: "Community",
        category: "COMMUNITY",
      },
      {
        id: "10",
        title: "Food Safety Guidelines",
        description: "Ensure your products meet all safety standards",
        type: "Checklist",
        category: "COMPLIANCE",
      },
      {
        id: "11",
        title: "Organic Certification Guide",
        description: "Steps to getting your farm certified organic",
        type: "PDF Guide",
        category: "COMPLIANCE",
      },
      {
        id: "12",
        title: "Insurance Requirements",
        description: "Understanding liability and crop insurance",
        type: "Article",
        category: "COMPLIANCE",
      },
    ];

    let filtered = allResources;

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(lowerQuery) ||
          r.description.toLowerCase().includes(lowerQuery),
      );
    }

    // Filter by category
    if (category) {
      filtered = filtered.filter((r: any) => r.category === category);
    }

    return filtered;
  }

  /**
   * Get search suggestions (autocomplete)
   */
  static async getSuggestions(query: string, limit = 5): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const suggestions: Set<string> = new Set();

    // Get product suggestions
    const products = await database.product.findMany({
      where: {
        OR: [{ name: { contains: query, mode: "insensitive" } }],
        status: "ACTIVE",
      },
      select: { name: true, category: true },
      take: limit,
    });

    products.forEach((p: any) => {
      suggestions.add(p.name);
      if (p.category) suggestions.add(String(p.category));
    });

    // Get farm suggestions
    const farms = await database.farm.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
        status: "ACTIVE",
      },
      select: { name: true },
      take: limit,
    });

    farms.forEach((f: any) => suggestions.add(f.name));

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Get popular searches
   */
  static async getPopularSearches(limit = 10): Promise<string[]> {
    // In production, track search queries and return most popular
    // For now, return common agricultural terms
    return [
      "Organic Vegetables",
      "Fresh Eggs",
      "Local Honey",
      "Grass-Fed Beef",
      "Seasonal Produce",
      "Organic Dairy",
      "Heirloom Tomatoes",
      "Farm Fresh Milk",
      "Free Range Chicken",
      "Organic Herbs",
    ].slice(0, limit);
  }
}
