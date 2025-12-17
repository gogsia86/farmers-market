/**
 * 🌾 PRODUCT COMPARISON COMPONENT
 * Divine Agricultural Product Comparison System
 *
 * Features:
 * - Side-by-side product comparison (up to 4 products)
 * - Agricultural attribute awareness (seasonality, soil health impact)
 * - Price comparison with seasonal pricing indicators
 * - Nutritional and certification comparison
 * - Farm comparison and verification status
 * - Responsive design with mobile optimizations
 * - Accessibility compliant (WCAG 2.1 AA)
 *
 * @divine-consciousness Agricultural comparison intelligence
 * @quantum-pattern Biodynamic product analysis
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Check,
  Minus,
  Star,
  MapPin,
  Leaf,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Droplets,
  Sun,
  Award,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// 🎯 DIVINE TYPE DEFINITIONS
// ============================================

interface Farm {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  city?: string | null;
  state?: string | null;
  verificationStatus?: "VERIFIED" | "PENDING" | "UNVERIFIED";
  averageRating?: number | null;
}

interface ProductImage {
  url: string;
  isPrimary: boolean;
  alt?: string;
}

interface SeasonalAvailability {
  spring: boolean;
  summer: boolean;
  fall: boolean;
  winter: boolean;
}

interface NutritionalInfo {
  calories?: number;
  protein?: number;
  fiber?: number;
  vitamins?: string[];
}

interface ComparisonProduct {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  unit: string;
  category: string;
  organic: boolean;
  inStock: boolean;
  quantityAvailable?: number | null;
  averageRating?: number | null;
  reviewCount: number;
  primaryPhotoUrl?: string | null;
  images?: ProductImage[];
  seasonalAvailability?: SeasonalAvailability;
  nutritionalInfo?: NutritionalInfo;
  certifications?: string[];
  harvestDate?: string | null;
  shelfLife?: number | null; // days
  growingMethod?: "CONVENTIONAL" | "ORGANIC" | "BIODYNAMIC" | "HYDROPONIC";
  soilHealthImpact?: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  waterUsage?: "LOW" | "MEDIUM" | "HIGH";
  farm: Farm;
}

interface ProductComparisonProps {
  products: ComparisonProduct[];
  onRemoveProduct?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  maxProducts?: number;
  className?: string;
}

// ============================================
// 🌾 COMPARISON FEATURES CONFIGURATION
// ============================================

const COMPARISON_FEATURES = [
  { id: "basic", label: "Basic Information", icon: AlertCircle },
  { id: "pricing", label: "Pricing & Value", icon: TrendingUp },
  { id: "agricultural", label: "Agricultural Attributes", icon: Leaf },
  { id: "seasonal", label: "Seasonal Availability", icon: Calendar },
  { id: "sustainability", label: "Sustainability", icon: Droplets },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "nutrition", label: "Nutritional Info", icon: Sun },
] as const;

// ============================================
// 🎨 MAIN COMPONENT
// ============================================

export function ProductComparison({
  products,
  onRemoveProduct,
  onAddToCart,
  maxProducts = 4,
  className,
}: ProductComparisonProps) {
  const [selectedFeature, setSelectedFeature] = useState<string>("all");

  // Limit products to max
  const displayProducts = products.slice(0, maxProducts);

  if (displayProducts.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <AlertCircle className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Products to Compare
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Add products to your comparison list to see side-by-side details.
        </p>
        <Link
          href="/marketplace/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Compare Products
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Comparing {displayProducts.length} of {maxProducts} products
          </p>
        </div>

        {/* Feature Filter */}
        <div className="hidden md:flex items-center gap-2">
          <select
            value={selectedFeature}
            onChange={(e) => setSelectedFeature(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Filter comparison features"
          >
            <option value="all">All Features</option>
            {COMPARISON_FEATURES.map((feature) => (
              <option key={feature.id} value={feature.id}>
                {feature.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Product Headers */}
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-10 bg-gray-50 px-6 py-4 text-left text-sm font-semibold text-gray-900"
                  >
                    Feature
                  </th>
                  {displayProducts.map((product) => (
                    <th
                      key={product.id}
                      scope="col"
                      className="px-6 py-4 text-center min-w-[250px]"
                    >
                      <ProductHeader
                        product={product}
                        onRemove={onRemoveProduct}
                        onAddToCart={onAddToCart}
                      />
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Comparison Rows */}
              <tbody className="divide-y divide-gray-200 bg-white">
                {/* Basic Information */}
                {(selectedFeature === "all" || selectedFeature === "basic") && (
                  <>
                    <ComparisonRow
                      label="Category"
                      products={displayProducts}
                      renderCell={(product) => (
                        <span className="text-sm text-gray-900">
                          {product.category}
                        </span>
                      )}
                    />
                    <ComparisonRow
                      label="Stock Status"
                      products={displayProducts}
                      renderCell={(product) => (
                        <StockBadge product={product} />
                      )}
                    />
                    <ComparisonRow
                      label="Rating"
                      products={displayProducts}
                      renderCell={(product) => (
                        <RatingDisplay product={product} />
                      )}
                    />
                  </>
                )}

                {/* Pricing & Value */}
                {(selectedFeature === "all" || selectedFeature === "pricing") && (
                  <>
                    <ComparisonRow
                      label="Price"
                      products={displayProducts}
                      renderCell={(product) => (
                        <PriceDisplay product={product} allProducts={displayProducts} />
                      )}
                      highlight
                    />
                    <ComparisonRow
                      label="Unit"
                      products={displayProducts}
                      renderCell={(product) => (
                        <span className="text-sm text-gray-900">{product.unit}</span>
                      )}
                    />
                  </>
                )}

                {/* Agricultural Attributes */}
                {(selectedFeature === "all" ||
                  selectedFeature === "agricultural") && (
                  <>
                    <ComparisonRow
                      label="Organic"
                      products={displayProducts}
                      renderCell={(product) => (
                        <BooleanIndicator value={product.organic} />
                      )}
                    />
                    <ComparisonRow
                      label="Growing Method"
                      products={displayProducts}
                      renderCell={(product) => (
                        <GrowingMethodBadge method={product.growingMethod} />
                      )}
                    />
                    <ComparisonRow
                      label="Harvest Date"
                      products={displayProducts}
                      renderCell={(product) => (
                        <span className="text-sm text-gray-700">
                          {product.harvestDate
                            ? new Date(product.harvestDate).toLocaleDateString()
                            : "N/A"}
                        </span>
                      )}
                    />
                    <ComparisonRow
                      label="Shelf Life"
                      products={displayProducts}
                      renderCell={(product) => (
                        <span className="text-sm text-gray-700">
                          {product.shelfLife ? `${product.shelfLife} days` : "N/A"}
                        </span>
                      )}
                    />
                  </>
                )}

                {/* Seasonal Availability */}
                {(selectedFeature === "all" || selectedFeature === "seasonal") && (
                  <ComparisonRow
                    label="Seasonal Availability"
                    products={displayProducts}
                    renderCell={(product) => (
                      <SeasonalDisplay availability={product.seasonalAvailability} />
                    )}
                  />
                )}

                {/* Sustainability */}
                {(selectedFeature === "all" ||
                  selectedFeature === "sustainability") && (
                  <>
                    <ComparisonRow
                      label="Soil Health Impact"
                      products={displayProducts}
                      renderCell={(product) => (
                        <SustainabilityBadge
                          type="soil"
                          value={product.soilHealthImpact}
                        />
                      )}
                    />
                    <ComparisonRow
                      label="Water Usage"
                      products={displayProducts}
                      renderCell={(product) => (
                        <SustainabilityBadge
                          type="water"
                          value={product.waterUsage}
                        />
                      )}
                    />
                  </>
                )}

                {/* Certifications */}
                {(selectedFeature === "all" ||
                  selectedFeature === "certifications") && (
                  <ComparisonRow
                    label="Certifications"
                    products={displayProducts}
                    renderCell={(product) => (
                      <CertificationsList certifications={product.certifications} />
                    )}
                  />
                )}

                {/* Nutritional Info */}
                {(selectedFeature === "all" || selectedFeature === "nutrition") && (
                  <ComparisonRow
                    label="Nutritional Highlights"
                    products={displayProducts}
                    renderCell={(product) => (
                      <NutritionalDisplay info={product.nutritionalInfo} />
                    )}
                  />
                )}

                {/* Farm Information */}
                {selectedFeature === "all" && (
                  <ComparisonRow
                    label="Farm"
                    products={displayProducts}
                    renderCell={(product) => <FarmDisplay farm={product.farm} />}
                  />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Feature Navigation */}
      <div className="md:hidden space-y-2">
        <p className="text-sm font-medium text-gray-700">View Features:</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSelectedFeature("all")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              selectedFeature === "all"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            All Features
          </button>
          {COMPARISON_FEATURES.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setSelectedFeature(feature.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                selectedFeature === feature.id
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <feature.icon className="h-4 w-4" />
              {feature.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 📦 SUB-COMPONENTS
// ============================================

/**
 * Product Header with Image and Remove Button
 */
function ProductHeader({
  product,
  onRemove,
  onAddToCart,
}: {
  product: ComparisonProduct;
  onRemove?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={() => onRemove(product.id)}
          className="ml-auto flex items-center justify-center w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors"
          aria-label={`Remove ${product.name} from comparison`}
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Product Image */}
      <Link
        href={`/marketplace/products/${product.slug}`}
        className="block relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
      >
        <Image
          src={product.primaryPhotoUrl || "/images/placeholder-product.jpg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform"
          sizes="250px"
        />
      </Link>

      {/* Product Name */}
      <Link
        href={`/marketplace/products/${product.slug}`}
        className="block font-semibold text-gray-900 hover:text-green-600 transition-colors"
      >
        {product.name}
      </Link>

      {/* Add to Cart Button */}
      {onAddToCart && product.inStock && (
        <button
          onClick={() => onAddToCart(product.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
      )}
    </div>
  );
}

/**
 * Generic Comparison Row
 */
function ComparisonRow({
  label,
  products,
  renderCell,
  highlight = false,
}: {
  label: string;
  products: ComparisonProduct[];
  renderCell: (product: ComparisonProduct) => React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <tr className={cn(highlight && "bg-green-50")}>
      <td className="sticky left-0 z-10 bg-white px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-200">
        {label}
      </td>
      {products.map((product) => (
        <td
          key={product.id}
          className={cn("px-6 py-4 text-center", highlight && "bg-green-50")}
        >
          {renderCell(product)}
        </td>
      ))}
    </tr>
  );
}

/**
 * Stock Badge
 */
function StockBadge({ product }: { product: ComparisonProduct }) {
  if (!product.inStock) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
        <Minus className="h-3 w-3" />
        Out of Stock
      </span>
    );
  }

  const isLowStock =
    product.quantityAvailable !== null &&
    product.quantityAvailable !== undefined &&
    product.quantityAvailable < 10;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full",
        isLowStock
          ? "bg-yellow-100 text-yellow-700"
          : "bg-green-100 text-green-700"
      )}
    >
      <Check className="h-3 w-3" />
      {isLowStock ? "Low Stock" : "In Stock"}
    </span>
  );
}

/**
 * Rating Display
 */
function RatingDisplay({ product }: { product: ComparisonProduct }) {
  if (!product.averageRating || product.reviewCount === 0) {
    return <span className="text-sm text-gray-500">No reviews</span>;
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      <span className="text-sm font-medium text-gray-900">
        {product.averageRating.toFixed(1)}
      </span>
      <span className="text-xs text-gray-500">({product.reviewCount})</span>
    </div>
  );
}

/**
 * Price Display with Best Value Indicator
 */
function PriceDisplay({
  product,
  allProducts,
}: {
  product: ComparisonProduct;
  allProducts: ComparisonProduct[];
}) {
  const lowestPrice = Math.min(...allProducts.map((p) => p.price));
  const isBestValue = product.price === lowestPrice;

  return (
    <div className="space-y-1">
      <div className="text-lg font-bold text-gray-900">
        ${product.price.toFixed(2)}
      </div>
      {isBestValue && allProducts.length > 1 && (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
          <TrendingUp className="h-3 w-3" />
          Best Value
        </span>
      )}
    </div>
  );
}

/**
 * Boolean Indicator (Check/X)
 */
function BooleanIndicator({ value }: { value: boolean }) {
  return value ? (
    <Check className="h-5 w-5 text-green-600 mx-auto" aria-label="Yes" />
  ) : (
    <Minus className="h-5 w-5 text-gray-400 mx-auto" aria-label="No" />
  );
}

/**
 * Growing Method Badge
 */
function GrowingMethodBadge({
  method,
}: {
  method?: ComparisonProduct["growingMethod"];
}) {
  if (!method) {
    return <span className="text-sm text-gray-500">N/A</span>;
  }

  const methodConfig = {
    CONVENTIONAL: { label: "Conventional", color: "gray" },
    ORGANIC: { label: "Organic", color: "green" },
    BIODYNAMIC: { label: "Biodynamic", color: "purple" },
    HYDROPONIC: { label: "Hydroponic", color: "blue" },
  };

  const config = methodConfig[method];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full",
        config.color === "gray" && "bg-gray-100 text-gray-700",
        config.color === "green" && "bg-green-100 text-green-700",
        config.color === "purple" && "bg-purple-100 text-purple-700",
        config.color === "blue" && "bg-blue-100 text-blue-700"
      )}
    >
      <Leaf className="h-3 w-3" />
      {config.label}
    </span>
  );
}

/**
 * Seasonal Availability Display
 */
function SeasonalDisplay({
  availability,
}: {
  availability?: SeasonalAvailability;
}) {
  if (!availability) {
    return <span className="text-sm text-gray-500">N/A</span>;
  }

  const seasons = [
    { key: "spring" as const, label: "Spring", emoji: "🌱" },
    { key: "summer" as const, label: "Summer", emoji: "☀️" },
    { key: "fall" as const, label: "Fall", emoji: "🍂" },
    { key: "winter" as const, label: "Winter", emoji: "❄️" },
  ];

  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {seasons.map((season) => (
        <span
          key={season.key}
          className={cn(
            "px-2 py-1 text-xs rounded-full",
            availability[season.key]
              ? "bg-green-100 text-green-700 font-semibold"
              : "bg-gray-100 text-gray-400"
          )}
          title={season.label}
        >
          {season.emoji}
        </span>
      ))}
    </div>
  );
}

/**
 * Sustainability Badge
 */
function SustainabilityBadge({
  type,
  value,
}: {
  type: "soil" | "water";
  value?: string;
}) {
  if (!value) {
    return <span className="text-sm text-gray-500">N/A</span>;
  }

  const config = {
    soil: {
      POSITIVE: { label: "Positive", color: "green" },
      NEUTRAL: { label: "Neutral", color: "yellow" },
      NEGATIVE: { label: "Negative", color: "red" },
    },
    water: {
      LOW: { label: "Low", color: "green" },
      MEDIUM: { label: "Medium", color: "yellow" },
      HIGH: { label: "High", color: "red" },
    },
  };

  const typeConfig = config[type];
  const valueConfig = typeConfig[value as keyof typeof typeConfig];

  if (!valueConfig) {
    return <span className="text-sm text-gray-500">N/A</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full",
        valueConfig.color === "green" && "bg-green-100 text-green-700",
        valueConfig.color === "yellow" && "bg-yellow-100 text-yellow-700",
        valueConfig.color === "red" && "bg-red-100 text-red-700"
      )}
    >
      {type === "soil" ? (
        <Leaf className="h-3 w-3" />
      ) : (
        <Droplets className="h-3 w-3" />
      )}
      {valueConfig.label}
    </span>
  );
}

/**
 * Certifications List
 */
function CertificationsList({
  certifications,
}: {
  certifications?: string[];
}) {
  if (!certifications || certifications.length === 0) {
    return <span className="text-sm text-gray-500">None</span>;
  }

  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {certifications.map((cert) => (
        <span
          key={cert}
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full"
        >
          <Award className="h-3 w-3" />
          {cert}
        </span>
      ))}
    </div>
  );
}

/**
 * Nutritional Display
 */
function NutritionalDisplay({ info }: { info?: NutritionalInfo }) {
  if (!info) {
    return <span className="text-sm text-gray-500">N/A</span>;
  }

  return (
    <div className="text-xs text-gray-700 space-y-1">
      {info.calories && <div>Calories: {info.calories}</div>}
      {info.protein && <div>Protein: {info.protein}g</div>}
      {info.fiber && <div>Fiber: {info.fiber}g</div>}
      {info.vitamins && info.vitamins.length > 0 && (
        <div className="mt-2">
          <span className="font-semibold">Vitamins:</span>{" "}
          {info.vitamins.join(", ")}
        </div>
      )}
    </div>
  );
}

/**
 * Farm Display
 */
function FarmDisplay({ farm }: { farm: Farm }) {
  return (
    <div className="space-y-2">
      <Link
        href={`/farms/${farm.slug}`}
        className="text-sm font-medium text-gray-900 hover:text-green-600 transition-colors"
      >
        {farm.name}
      </Link>
      <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
        <MapPin className="h-3 w-3" />
        {farm.city && farm.state ? (
          <span>
            {farm.city}, {farm.state}
          </span>
        ) : (
          <span>Location N/A</span>
        )}
      </div>
      {farm.verificationStatus === "VERIFIED" && (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
          <Check className="h-3 w-3" />
          Verified
        </span>
      )}
      {farm.averageRating && (
        <div className="flex items-center justify-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium text-gray-900">
            {farm.averageRating.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================
// 📤 EXPORTS
// ============================================

export type {
  ComparisonProduct,
  ProductComparisonProps,
  Farm,
  SeasonalAvailability,
  NutritionalInfo,
};
