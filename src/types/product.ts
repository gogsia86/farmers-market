/**
 * PRODUCT TYPE SYSTEM
 * Divine TypeScript definitions for agricultural product catalog
 * Quantum patterns for farm product consciousness
 */

// ============================================
// PRODUCT CATEGORIES & CLASSIFICATIONS
// ============================================

/**
 * Agricultural product categories following farming domain consciousness
 */
export enum ProductCategory {
  VEGETABLES = "VEGETABLES",
  FRUITS = "FRUITS",
  DAIRY = "DAIRY",
  MEAT = "MEAT",
  EGGS = "EGGS",
  HONEY = "HONEY",
  GRAINS = "GRAINS",
  HERBS = "HERBS",
  FLOWERS = "FLOWERS",
  PRESERVES = "PRESERVES",
  BAKED_GOODS = "BAKED_GOODS",
  OTHER = "OTHER",
}

/**
 * Product sub-categories for detailed classification
 */
export type ProductSubCategory = {
  VEGETABLES:
    | "LEAFY_GREENS"
    | "ROOT_VEGETABLES"
    | "CRUCIFEROUS"
    | "NIGHTSHADES"
    | "LEGUMES"
    | "SQUASH";
  FRUITS:
    | "BERRIES"
    | "STONE_FRUITS"
    | "CITRUS"
    | "APPLES_PEARS"
    | "MELONS"
    | "TROPICAL";
  DAIRY: "MILK" | "CHEESE" | "YOGURT" | "BUTTER" | "CREAM";
  MEAT: "BEEF" | "PORK" | "CHICKEN" | "TURKEY" | "LAMB" | "GOAT";
  HERBS: "CULINARY" | "MEDICINAL" | "AROMATIC";
};

/**
 * Product unit types for pricing and measurements
 */
export enum ProductUnit {
  POUND = "lb",
  OUNCE = "oz",
  KILOGRAM = "kg",
  GRAM = "g",
  PIECE = "piece",
  BUNCH = "bunch",
  DOZEN = "dozen",
  PINT = "pint",
  QUART = "quart",
  GALLON = "gallon",
  LITER = "liter",
  BAG = "bag",
  BOX = "box",
}

/**
 * Product availability status
 */
export enum ProductStatus {
  AVAILABLE = "AVAILABLE",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  SEASONAL = "SEASONAL",
  DISCONTINUED = "DISCONTINUED",
  COMING_SOON = "COMING_SOON",
}

/**
 * Seasonal availability windows
 */
export enum Season {
  SPRING = "SPRING",
  SUMMER = "SUMMER",
  FALL = "FALL",
  WINTER = "WINTER",
  YEAR_ROUND = "YEAR_ROUND",
}

// ============================================
// PRODUCT ATTRIBUTES & CERTIFICATIONS
// ============================================

/**
 * Product certification types
 */
export interface ProductCertification {
  type:
    | "ORGANIC"
    | "NON_GMO"
    | "GRASS_FED"
    | "FREE_RANGE"
    | "PASTURE_RAISED"
    | "BIODYNAMIC";
  certifier: string;
  certificateNumber?: string;
  verifiedDate?: Date;
}

/**
 * Product growing/raising methods
 */
export interface ProductAttributes {
  isOrganic: boolean;
  isNonGMO: boolean;
  isLocallyGrown: boolean;
  isSeasonal: boolean;
  isPesticideFree: boolean;
  isGrassFed?: boolean; // For meat/dairy
  isFreeRange?: boolean; // For eggs/poultry
  isPastureRaised?: boolean; // For meat
}

// ============================================
// PRICING MODELS
// ============================================

/**
 * Base pricing structure
 */
export interface ProductPrice {
  amount: number;
  unit: ProductUnit;
  currency: string; // "USD"
}

/**
 * Bulk pricing tiers for volume discounts
 */
export interface BulkPricing {
  minQuantity: number;
  maxQuantity?: number;
  pricePerUnit: number;
  discountPercentage?: number;
}

/**
 * Complete pricing structure with bulk options
 */
export interface ProductPricing {
  basePrice: ProductPrice;
  bulkPricing?: BulkPricing[];
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
}

// ============================================
// PRODUCT INVENTORY
// ============================================

/**
 * Inventory tracking for product availability
 */
export interface ProductInventory {
  inStock: boolean;
  quantity: number;
  reservedQuantity: number; // Items in pending orders
  availableQuantity: number; // quantity - reservedQuantity
  lowStockThreshold: number;
  isLowStock: boolean;
  reorderPoint?: number;
  lastRestocked?: Date;
  nextHarvestDate?: Date; // For seasonal products
}

// ============================================
// PRODUCT MEDIA
// ============================================

/**
 * Product image with metadata
 */
export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
  uploadedAt: Date;
}

// ============================================
// CORE PRODUCT INTERFACE
// ============================================

/**
 * Complete product profile with quantum agricultural consciousness
 * Holographic product entity containing all product intelligence
 */
export interface Product {
  // Identity
  id: string;
  farmId: string;
  name: string;
  slug: string;
  description?: string;

  // Classification
  category: ProductCategory;
  subCategory?: string;
  tags: string[];

  // Pricing
  pricing: ProductPricing;

  // Inventory
  inventory: ProductInventory;

  // Attributes
  attributes: ProductAttributes;
  certifications: ProductCertification[];

  // Seasonality
  seasons: Season[];
  harvestPeriod?: {
    start: Date;
    end: Date;
  };

  // Media
  images: ProductImage[];
  primaryImageUrl?: string;

  // Status
  status: ProductStatus;
  isActive: boolean;
  isFeatured: boolean;

  // Farm relation (populated)
  farm?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    verificationStatus: string;
  };

  // Metadata
  sku?: string;
  barcode?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// ============================================
// INPUT/UPDATE TYPES
// ============================================

/**
 * Product creation input (omits auto-generated fields)
 */
export type CreateProductInput = Omit<
  Product,
  "id" | "slug" | "createdAt" | "updatedAt" | "farm" | "primaryImageUrl"
> & {
  farmId: string;
};

/**
 * Product update input (all fields optional except ID)
 */
export type UpdateProductInput = Partial<Omit<CreateProductInput, "farmId">>;

/**
 * Product search/filter parameters
 */
export interface ProductFilters {
  // Farm filtering
  farmId?: string;
  farmIds?: string[];

  // Category filtering
  category?: ProductCategory;
  categories?: ProductCategory[];
  subCategory?: string;

  // Status filtering
  status?: ProductStatus;
  isActive?: boolean;
  inStock?: boolean;
  isFeatured?: boolean;

  // Attribute filtering
  isOrganic?: boolean;
  isNonGMO?: boolean;
  isLocallyGrown?: boolean;
  isSeasonal?: boolean;

  // Seasonal filtering
  season?: Season;
  availableNow?: boolean;

  // Price filtering
  minPrice?: number;
  maxPrice?: number;

  // Location filtering
  city?: string;
  state?: string;
  zipCode?: string;
  radius?: number; // miles from zipCode

  // Search
  search?: string; // Full-text search across name, description, tags

  // Sorting
  sortBy?: "name" | "price" | "newest" | "popular" | "season";
  sortOrder?: "asc" | "desc";
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Paginated product response
 */
export interface PaginatedProducts {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ============================================
// PRODUCT ANALYTICS
// ============================================

/**
 * Product performance metrics
 */
export interface ProductStats {
  productId: string;
  views: number;
  orders: number;
  revenue: number;
  averageRating?: number;
  reviewCount: number;
  inWishlistCount: number;
  lastOrderDate?: Date;
}

/**
 * Product validation result
 */
export interface ProductValidation {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}

// ============================================
// QUANTUM PRODUCT OPERATIONS
// ============================================

/**
 * Product batch operation result
 */
export interface BatchProductResult {
  successful: string[]; // Product IDs
  failed: {
    productId: string;
    error: string;
  }[];
  total: number;
  successCount: number;
  failureCount: number;
}

/**
 * Product export format
 */
export interface ProductExport {
  format: "CSV" | "JSON" | "XLSX";
  products: Product[];
  exportedAt: Date;
  exportedBy: string;
}
