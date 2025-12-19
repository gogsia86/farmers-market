// 🔍 Search & Discovery Utility Functions
// Divine Agricultural Search Consciousness

import type {
  ProductSearchFilters,
  ProductSortOption,
  FarmSortOption,
  Season,
  PaginationMeta,
  ProductWhereInput,
  ProductOrderByInput,
  SearchQueryBuilder,
  SeasonalContext,
} from "@/types/search";
import type { Prisma } from "@prisma/client";

/**
 * Build Prisma query from search filters
 * @param filters - Product search filters
 * @returns Prisma query configuration
 */
export function buildProductSearchQuery(
  filters: ProductSearchFilters,
): SearchQueryBuilder {
  const where: ProductWhereInput = {};
  const orderBy: ProductOrderByInput[] = [];

  // Text search (name, description)
  if (filters.query && filters.query.trim()) {
    where.OR = [
      {
        name: {
          contains: filters.query,
          mode: "insensitive" as Prisma.QueryMode,
        },
      },
      {
        description: {
          contains: filters.query,
          mode: "insensitive" as Prisma.QueryMode,
        },
      },
    ];
  }

  // Category filter
  if (filters.categoryId) {
    where.category = filters.categoryId as any;
  }

  // Price range
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      where.price.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = filters.maxPrice;
    }
  }

  // Farm filter
  if (filters.farmId) {
    where.farmId = filters.farmId;
  }

  // Availability filter
  if (filters.availability === "IN_STOCK") {
    where.inStock = true;
  } else if (filters.availability === "OUT_OF_STOCK") {
    where.inStock = false;
  }

  // Organic filter
  if (filters.organic === true) {
    where.organic = true;
  }

  // Seasonal filter
  if (filters.seasonal === true) {
    where.seasonal = true;
  }

  // Sorting
  const sortBy = filters.sortBy || "NEWEST";
  switch (sortBy) {
    case "NEWEST":
      orderBy.push({ createdAt: "desc" });
      break;
    case "PRICE_LOW_TO_HIGH":
      orderBy.push({ price: "asc" });
      break;
    case "PRICE_HIGH_TO_LOW":
      orderBy.push({ price: "desc" });
      break;
    case "NAME_A_Z":
      orderBy.push({ name: "asc" });
      break;
    case "NAME_Z_A":
      orderBy.push({ name: "desc" });
      break;
    case "POPULAR":
      // Assuming we have a salesCount or viewCount field
      orderBy.push({ createdAt: "desc" }); // Fallback for now
      break;
    case "RATING":
      // Assuming we have a rating field
      orderBy.push({ createdAt: "desc" }); // Fallback for now
      break;
    default:
      orderBy.push({ createdAt: "desc" });
  }

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const skip = (page - 1) * limit;

  return {
    where,
    orderBy,
    skip,
    take: limit,
    include: {
      farm: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  };
}

/**
 * Calculate pagination metadata
 * @param totalItems - Total number of items
 * @param currentPage - Current page number
 * @param itemsPerPage - Items per page
 * @returns Pagination metadata
 */
export function calculatePaginationMeta(
  totalItems: number,
  currentPage: number,
  itemsPerPage: number,
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

/**
 * Get current season based on date
 * @param date - Date to check (defaults to now)
 * @returns Current season
 */
export function getCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth(); // 0-11

  if (month >= 2 && month <= 4) return "SPRING"; // Mar-May
  if (month >= 5 && month <= 7) return "SUMMER"; // Jun-Aug
  if (month >= 8 && month <= 10) return "FALL"; // Sep-Nov
  return "WINTER"; // Dec-Feb
}

/**
 * Get seasonal context for search
 * @param season - Current season
 * @returns Seasonal context with recommendations
 */
export function getSeasonalContext(season: Season): SeasonalContext {
  const seasonalData: Record<Season, SeasonalContext> = {
    SPRING: {
      currentSeason: "SPRING",
      recommendedCategories: [
        "Leafy Greens",
        "Herbs",
        "Radishes",
        "Asparagus",
        "Peas",
      ],
      seasonalProducts: [
        "lettuce",
        "spinach",
        "arugula",
        "asparagus",
        "radish",
        "peas",
        "herbs",
      ],
    },
    SUMMER: {
      currentSeason: "SUMMER",
      recommendedCategories: [
        "Tomatoes",
        "Peppers",
        "Cucumbers",
        "Berries",
        "Stone Fruits",
      ],
      seasonalProducts: [
        "tomato",
        "pepper",
        "cucumber",
        "zucchini",
        "berry",
        "peach",
        "plum",
        "melon",
      ],
    },
    FALL: {
      currentSeason: "FALL",
      recommendedCategories: [
        "Squash",
        "Root Vegetables",
        "Apples",
        "Pumpkins",
        "Brussels Sprouts",
      ],
      seasonalProducts: [
        "pumpkin",
        "squash",
        "apple",
        "carrot",
        "beet",
        "potato",
        "onion",
        "brussels",
      ],
    },
    WINTER: {
      currentSeason: "WINTER",
      recommendedCategories: [
        "Root Vegetables",
        "Kale",
        "Cabbage",
        "Citrus",
        "Storage Crops",
      ],
      seasonalProducts: [
        "kale",
        "cabbage",
        "carrot",
        "parsnip",
        "turnip",
        "citrus",
        "winter squash",
      ],
    },
  };

  return seasonalData[season];
}

/**
 * Sanitize search query
 * @param query - Raw search query
 * @returns Sanitized query
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters except hyphens
    .replace(/\s+/g, " ") // Normalize whitespace
    .substring(0, 100); // Limit length
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param lat1 - Latitude 1
 * @param lon1 - Longitude 1
 * @param lat2 - Latitude 2
 * @param lon2 - Longitude 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Generate search cache key
 * @param filters - Search filters
 * @returns Cache key string
 */
export function generateSearchCacheKey(filters: ProductSearchFilters): string {
  const parts = [
    `q:${filters.query || ""}`,
    `cat:${filters.categoryId || ""}`,
    `farm:${filters.farmId || ""}`,
    `price:${filters.minPrice || 0}-${filters.maxPrice || "max"}`,
    `avail:${filters.availability || "all"}`,
    `org:${filters.organic || false}`,
    `seas:${filters.seasonal || false}`,
    `sort:${filters.sortBy || "newest"}`,
    `page:${filters.page || 1}`,
  ];

  return parts.join("|");
}

/**
 * Debounce function for search input
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Format price for display
 * @param price - Price in cents or dollars
 * @param currency - Currency code
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price);
}

/**
 * Parse URL search params to filters
 * @param searchParams - URLSearchParams object
 * @returns Product search filters
 */
export function parseSearchParams(
  searchParams: URLSearchParams,
): ProductSearchFilters {
  const filters: ProductSearchFilters = {};

  const query = searchParams.get("q");
  if (query) filters.query = sanitizeSearchQuery(query);

  const categoryId = searchParams.get("category");
  if (categoryId) filters.categoryId = categoryId;

  const farmId = searchParams.get("farm");
  if (farmId) filters.farmId = farmId;

  const minPrice = searchParams.get("minPrice");
  if (minPrice) filters.minPrice = parseFloat(minPrice);

  const maxPrice = searchParams.get("maxPrice");
  if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

  const availability = searchParams.get("availability");
  if (availability === "IN_STOCK" || availability === "OUT_OF_STOCK") {
    filters.availability = availability;
  }

  const organic = searchParams.get("organic");
  if (organic === "true") filters.organic = true;

  const seasonal = searchParams.get("seasonal");
  if (seasonal === "true") filters.seasonal = true;

  const sortBy = searchParams.get("sort") as ProductSortOption;
  if (sortBy) filters.sortBy = sortBy;

  const page = searchParams.get("page");
  if (page) filters.page = parseInt(page, 10);

  const limit = searchParams.get("limit");
  if (limit) filters.limit = parseInt(limit, 10);

  return filters;
}

/**
 * Convert filters to URL search params
 * @param filters - Product search filters
 * @returns URLSearchParams object
 */
export function filtersToSearchParams(
  filters: ProductSearchFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.query) params.set("q", filters.query);
  if (filters.categoryId) params.set("category", filters.categoryId);
  if (filters.farmId) params.set("farm", filters.farmId);
  if (filters.minPrice !== undefined)
    params.set("minPrice", filters.minPrice.toString());
  if (filters.maxPrice !== undefined)
    params.set("maxPrice", filters.maxPrice.toString());
  if (filters.availability) params.set("availability", filters.availability);
  if (filters.organic) params.set("organic", "true");
  if (filters.seasonal) params.set("seasonal", "true");
  if (filters.sortBy) params.set("sort", filters.sortBy);
  if (filters.page) params.set("page", filters.page.toString());
  if (filters.limit) params.set("limit", filters.limit.toString());

  return params;
}

/**
 * Highlight search matches in text
 * @param text - Original text
 * @param query - Search query
 * @returns Text with <mark> tags around matches
 */
export function highlightMatches(text: string, query: string): string {
  if (!query || !text) return text;

  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

/**
 * Get price range presets
 * @returns Array of price range options
 */
export function getPriceRangePresets() {
  return [
    { label: "All Prices", min: undefined, max: undefined },
    { label: "Under $5", min: undefined, max: 5 },
    { label: "$5 - $10", min: 5, max: 10 },
    { label: "$10 - $20", min: 10, max: 20 },
    { label: "$20 - $50", min: 20, max: 50 },
    { label: "Over $50", min: 50, max: undefined },
  ];
}

/**
 * Sort options for dropdown
 */
export function getSortOptions(): Array<{
  label: string;
  value: ProductSortOption;
}> {
  return [
    { label: "Newest First", value: "NEWEST" },
    { label: "Price: Low to High", value: "PRICE_LOW_TO_HIGH" },
    { label: "Price: High to Low", value: "PRICE_HIGH_TO_LOW" },
    { label: "Name: A-Z", value: "NAME_A_Z" },
    { label: "Name: Z-A", value: "NAME_Z_A" },
    { label: "Most Popular", value: "POPULAR" },
    { label: "Highest Rated", value: "RATING" },
  ];
}
