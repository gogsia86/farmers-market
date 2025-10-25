/**
 * DIVINE PRODUCT TYPES - AGRICULTURAL QUANTUM CATALOG
 *
 * These types embody the quantum essence of agricultural products,
 * manifesting fresh produce reality through biodynamic consciousness.
 *
 * Related Divine Instructions:
 * - 02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 * - 01_DIVINE_CORE_PRINCIPLES.instructions.md
 * - 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 *
 * Functional Requirements: FR-001 (Product Catalog)
 */

import { FarmId, Season } from "./farm.types";

// ============================================================================
// QUANTUM IDENTIFIERS - Branded Types for Compile-Time Safety
// ============================================================================

type Brand<K, T> = K & { __brand: T };

export type ProductId = Brand<string, "ProductId">;
export type CategoryId = Brand<string, "CategoryId">;
export type ProductSlug = Brand<string, "ProductSlug">;

export function createProductId(id: string): ProductId {
  return id as ProductId;
}

export function createCategoryId(id: string): CategoryId {
  return id as CategoryId;
}

export function createProductSlug(slug: string): ProductSlug {
  return slug as ProductSlug;
}

// ============================================================================
// AGRICULTURAL CONSCIOUSNESS - Product Categories
// ============================================================================

export enum AgriculturalProductCategory {
  // Fresh Produce
  VEGETABLES = "VEGETABLES",
  FRUITS = "FRUITS",
  HERBS = "HERBS",
  GREENS = "GREENS",
  ROOT_VEGETABLES = "ROOT_VEGETABLES",

  // Value-Added Products
  PRESERVES = "PRESERVES",
  DAIRY = "DAIRY",
  EGGS = "EGGS",
  HONEY = "HONEY",
  BAKED_GOODS = "BAKED_GOODS",

  // Specialty Items
  FLOWERS = "FLOWERS",
  PLANTS = "PLANTS",
  SEEDS = "SEEDS",
  MUSHROOMS = "MUSHROOMS",

  // Other
  MEAT = "MEAT",
  SEAFOOD = "SEAFOOD",
  OTHER = "OTHER",
}

// ============================================================================
// SEASONAL PRODUCT AWARENESS
// ============================================================================

export interface SeasonalAvailability {
  season: Season;
  peakSeason: boolean;
  availability: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  expectedYield?: number;
}

export interface ProductSeasonality {
  primarySeasons: Season[];
  availability: SeasonalAvailability[];
  isYearRound: boolean;
  nextHarvestDate?: Date;
}

// ============================================================================
// PRODUCT QUANTUM STATE
// ============================================================================

export enum ProductQuantumState {
  AVAILABLE = "AVAILABLE", // In stock, ready to sell
  LOW_STOCK = "LOW_STOCK", // Running low, almost sold out
  OUT_OF_STOCK = "OUT_OF_STOCK", // Temporarily unavailable
  COMING_SOON = "COMING_SOON", // Not yet harvested
  SEASONAL_END = "SEASONAL_END", // Season ended
  DISCONTINUED = "DISCONTINUED", // No longer offered
}

export interface ProductInventory {
  quantumState: ProductQuantumState;
  quantityAvailable: number;
  quantityReserved: number;
  quantityTotal: number;
  unit: string; // "lb", "oz", "bunch", "each", etc.
  restockDate?: Date;
  lastHarvestDate?: Date;
}

// ============================================================================
// PRICING CONSCIOUSNESS
// ============================================================================

export interface ProductPricing {
  basePrice: number; // Price per unit in cents (to avoid floating point issues)
  currency: string; // "USD"
  pricePerUnit: string; // Formatted string: "$5.99/lb"

  // Bulk pricing
  bulkPricing?: BulkPricingTier[];

  // Discounts
  onSale: boolean;
  salePrice?: number;
  saleEndDate?: Date;

  // Price history for analytics
  priceHistory?: PriceHistoryEntry[];
}

export interface BulkPricingTier {
  minQuantity: number;
  maxQuantity?: number;
  pricePerUnit: number; // In cents
  discount: number; // Percentage discount
}

export interface PriceHistoryEntry {
  price: number;
  effectiveDate: Date;
  reason?: string;
}

// ============================================================================
// PRODUCT QUALITY & CERTIFICATION
// ============================================================================

export interface ProductQuality {
  organic: boolean;
  certifications: ProductCertification[];
  grade?: "A" | "B" | "C" | "PREMIUM";
  freshness: number; // 0-100 score
  harvestedAt?: Date;
  shelfLife?: number; // Days until expiration
}

export interface ProductCertification {
  type:
    | "USDA_ORGANIC"
    | "NON_GMO"
    | "FAIR_TRADE"
    | "RAINFOREST_ALLIANCE"
    | "BIODYNAMIC"
    | "LOCAL";
  certifiedBy: string;
  certificationDate: Date;
  expirationDate?: Date;
  verified: boolean;
}

// ============================================================================
// PRODUCT METADATA
// ============================================================================

export interface ProductMetadata {
  // Taxonomy
  category: AgriculturalProductCategory;
  subcategory?: string;
  variety?: string; // "Heirloom Tomato", "Honeycrisp Apple", etc.

  // Origin
  farmId: FarmId;
  growingMethod?: "ORGANIC" | "CONVENTIONAL" | "BIODYNAMIC" | "REGENERATIVE";

  // Attributes
  color?: string;
  size?: "SMALL" | "MEDIUM" | "LARGE" | "EXTRA_LARGE";
  weight?: number; // Average weight in grams

  // Tags for search
  tags: string[];
  searchKeywords: string[];
}

// ============================================================================
// PRODUCT IMAGES
// ============================================================================

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  width: number;
  height: number;
  format: "JPEG" | "PNG" | "WEBP";
  optimizedUrl?: string; // CDN/optimized version
  thumbnailUrl?: string;
  order: number; // Display order
}

export interface ProductGallery {
  images: ProductImage[];
  primaryImage: ProductImage;
  thumbnails: ProductImage[];
}

// ============================================================================
// NUTRITION INFORMATION (Optional but valuable)
// ============================================================================

export interface NutritionInfo {
  servingSize: string;
  servingSizeGrams: number;
  calories: number;
  totalFat?: number;
  saturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  sodium?: number;
  totalCarbohydrates?: number;
  dietaryFiber?: number;
  sugars?: number;
  protein?: number;
  vitamins?: Record<string, number>; // Vitamin name -> percentage of daily value
  minerals?: Record<string, number>;
}

// ============================================================================
// QUANTUM PRODUCT ENTITY - Divine Agricultural Product
// ============================================================================

export interface QuantumProduct {
  // Core Identity
  identity: {
    id: ProductId;
    slug: ProductSlug;
    name: string;
    description: string;
    shortDescription?: string;
  };

  // Product Metadata
  metadata: ProductMetadata;

  // Quantum State & Inventory
  inventory: ProductInventory;

  // Pricing
  pricing: ProductPricing;

  // Quality & Certifications
  quality: ProductQuality;

  // Seasonal Awareness
  seasonality: ProductSeasonality;

  // Visual Representation
  gallery: ProductGallery;

  // Nutrition (optional)
  nutrition?: NutritionInfo;

  // Temporal Data
  temporal: {
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    archivedAt?: Date;
  };

  // Engagement Metrics
  metrics?: {
    views: number;
    likes: number;
    purchases: number;
    rating: number; // 0-5
    reviewCount: number;
  };
}

// ============================================================================
// PRODUCT FILTERS & SEARCH
// ============================================================================

export interface ProductFilters {
  // Category filters
  categories?: AgriculturalProductCategory[];
  farmIds?: FarmId[];

  // Seasonal filters
  seasons?: Season[];
  availableNow?: boolean;

  // Quality filters
  organic?: boolean;
  certifications?: string[];

  // Price filters
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;

  // Availability filters
  inStock?: boolean;
  quantumStates?: ProductQuantumState[];

  // Search
  searchQuery?: string;
  tags?: string[];

  // Sorting
  sortBy?: "name" | "price" | "newest" | "popularity" | "rating" | "season";
  sortOrder?: "asc" | "desc";

  // Pagination
  page?: number;
  limit?: number;
}

export interface ProductSearchResult {
  products: QuantumProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
  filters: ProductFilters;
  facets?: ProductFacets; // For filter UI
}

export interface ProductFacets {
  categories: Array<{ category: AgriculturalProductCategory; count: number }>;
  seasons: Array<{ season: Season; count: number }>;
  priceRanges: Array<{ min: number; max: number; count: number }>;
  certifications: Array<{ certification: string; count: number }>;
}

// ============================================================================
// PRODUCT VARIANTS (for products with multiple options)
// ============================================================================

export interface ProductVariant {
  id: string;
  productId: ProductId;
  name: string; // "Small", "Medium", "Large"
  sku?: string;

  // Variant-specific overrides
  pricing: ProductPricing;
  inventory: ProductInventory;
  weight?: number;
  size?: string;

  // Variant attributes
  attributes: Record<string, string>; // { "size": "large", "color": "red" }

  isDefault: boolean;
}

export interface ProductWithVariants extends QuantumProduct {
  variants: ProductVariant[];
  defaultVariant: ProductVariant;
  variantOptions: VariantOption[]; // For UI rendering
}

export interface VariantOption {
  name: string; // "Size", "Color"
  values: string[]; // ["Small", "Medium", "Large"]
}

// ============================================================================
// CART ITEM (for shopping cart)
// ============================================================================

export interface CartItem {
  productId: ProductId;
  variantId?: string;
  quantity: number;
  unitPrice: number; // Price at time of adding to cart (in cents)
  totalPrice: number; // quantity * unitPrice
  addedAt: Date;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isQuantumProduct(obj: unknown): obj is QuantumProduct {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof obj === "object" &&
    "identity" in obj &&
    "metadata" in obj &&
    "inventory" in obj &&
    "pricing" in obj
  );
}

export function isProductAvailable(product: QuantumProduct): boolean {
  return (
    product.inventory.quantumState === ProductQuantumState.AVAILABLE &&
    product.inventory.quantityAvailable > 0
  );
}

export function isProductInSeason(
  product: QuantumProduct,
  currentSeason: Season
): boolean {
  return (
    product.seasonality.isYearRound ||
    product.seasonality.primarySeasons.includes(currentSeason)
  );
}

export function getProductAvailabilityForSeason(
  product: QuantumProduct,
  season: Season
): SeasonalAvailability | undefined {
  return product.seasonality.availability.find((a) => a.season === season);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format price in cents to USD string
 */
export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`;
}

/**
 * Format price per unit
 */
export function formatPricePerUnit(priceInCents: number, unit: string): string {
  return `${formatPrice(priceInCents)}/${unit}`;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(
  regularPrice: number,
  salePrice: number
): number {
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
}

/**
 * Get seasonal badge color
 */
export function getSeasonalBadgeColor(season: Season): string {
  const colors: Record<Season, string> = {
    [Season.SPRING]: "bg-green-100 text-green-800",
    [Season.SUMMER]: "bg-yellow-100 text-yellow-800",
    [Season.FALL]: "bg-orange-100 text-orange-800",
    [Season.WINTER]: "bg-blue-100 text-blue-800",
  };
  return colors[season];
}

/**
 * Get quantum state badge color
 */
export function getQuantumStateBadgeColor(state: ProductQuantumState): string {
  const colors: Record<ProductQuantumState, string> = {
    [ProductQuantumState.AVAILABLE]: "bg-green-100 text-green-800",
    [ProductQuantumState.LOW_STOCK]: "bg-yellow-100 text-yellow-800",
    [ProductQuantumState.OUT_OF_STOCK]: "bg-red-100 text-red-800",
    [ProductQuantumState.COMING_SOON]: "bg-blue-100 text-blue-800",
    [ProductQuantumState.SEASONAL_END]: "bg-gray-100 text-gray-800",
    [ProductQuantumState.DISCONTINUED]: "bg-gray-100 text-gray-800",
  };
  return colors[state];
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type { Product, ProductCategory, ProductStatus } from "@prisma/client";
