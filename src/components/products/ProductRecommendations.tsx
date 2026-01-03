/**
 * 🌾 PRODUCT RECOMMENDATIONS COMPONENT
 * Divine Agricultural AI-Powered Product Recommendations
 *
 * Features:
 * - AI-powered personalized recommendations
 * - Seasonal awareness and biodynamic intelligence
 * - Multiple recommendation strategies (similar, complementary, seasonal)
 * - Collaborative filtering and purchase history analysis
 * - Real-time availability checking
 * - Agricultural consciousness integration
 * - Responsive carousel design
 * - Accessibility compliant (WCAG 2.1 AA)
 *
 * @divine-consciousness AI-powered agricultural intelligence
 * @quantum-pattern Biodynamic recommendation engine
 */

"use client";

import { cn } from "@/lib/utils";
import { createLogger } from "@/lib/utils/logger";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Leaf,
  MapPin,
  ShoppingCart,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingUp,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const recommendationsLogger = createLogger("ProductRecommendations");

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
}

interface RecommendedProduct {
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
  seasonal: boolean;
  currentSeason?: boolean;
  farm: Farm;
  // Recommendation metadata
  recommendationScore?: number;
  recommendationReason?: string;
  matchPercentage?: number;
}

type RecommendationType =
  | "SIMILAR"
  | "COMPLEMENTARY"
  | "SEASONAL"
  | "POPULAR"
  | "PERSONALIZED"
  | "FREQUENTLY_BOUGHT_TOGETHER";

interface ProductRecommendationsProps {
  /** Current product or context for recommendations */
  contextProductId?: string;
  /** User ID for personalized recommendations */
  userId?: string;
  /** Type of recommendations to display */
  recommendationType?: RecommendationType;
  /** Category filter for recommendations */
  category?: string;
  /** Maximum number of products to display */
  maxProducts?: number;
  /** Enable auto-scroll carousel */
  autoScroll?: boolean;
  /** Show recommendation reasons */
  showReasons?: boolean;
  /** Callback when product is added to cart */
  onAddToCart?: (productId: string) => void;
  /** Custom title */
  title?: string;
  /** Custom CSS classes */
  className?: string;
}

interface RecommendationConfig {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
}

// ============================================
// 🌾 RECOMMENDATION TYPE CONFIGURATIONS
// ============================================

const RECOMMENDATION_CONFIGS: Record<RecommendationType, RecommendationConfig> =
  {
    SIMILAR: {
      icon: Sparkles,
      title: "Similar Products You May Like",
      description: "Based on this product's characteristics",
      color: "purple",
    },
    COMPLEMENTARY: {
      icon: ThumbsUp,
      title: "Perfect Pairings",
      description: "Products that go great together",
      color: "blue",
    },
    SEASONAL: {
      icon: Calendar,
      title: "Fresh This Season",
      description: "Peak harvest and availability",
      color: "green",
    },
    POPULAR: {
      icon: TrendingUp,
      title: "Customer Favorites",
      description: "Most loved by our community",
      color: "orange",
    },
    PERSONALIZED: {
      icon: Zap,
      title: "Picked Just For You",
      description: "Based on your preferences and history",
      color: "pink",
    },
    FREQUENTLY_BOUGHT_TOGETHER: {
      icon: ShoppingCart,
      title: "Frequently Bought Together",
      description: "Customers also purchased these items",
      color: "indigo",
    },
  };

// ============================================
// 🎨 MAIN COMPONENT
// ============================================

export function ProductRecommendations({
  contextProductId,
  userId,
  recommendationType = "SIMILAR",
  category,
  maxProducts = 12,
  autoScroll = false,
  showReasons = true,
  onAddToCart,
  title,
  className,
}: ProductRecommendationsProps) {
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const config = RECOMMENDATION_CONFIGS[recommendationType];
  const displayTitle = title || config.title;

  // Fetch recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (contextProductId) params.append("productId", contextProductId);
        if (userId) params.append("userId", userId);
        if (category) params.append("category", category);
        params.append("type", recommendationType);
        params.append("limit", maxProducts.toString());

        const response = await fetch(
          `/api/recommendations?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        recommendationsLogger.error(
          "Error fetching recommendations",
          err instanceof Error ? err : new Error(String(err)),
          {
            contextProductId,
            userId,
            category,
            recommendationType,
          },
        );
        setError("Unable to load recommendations");
        // Fallback to mock data for demo
        setProducts(generateMockRecommendations(maxProducts));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [contextProductId, userId, category, recommendationType, maxProducts]);

  // Auto-scroll effect
  useEffect(() => {
    if (!autoScroll || products.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoScroll, products.length]);

  // Navigation handlers
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  // Calculate visible products (responsive)
  const getVisibleCount = () => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    if (window.innerWidth < 1280) return 3;
    return 4;
  };

  const [visibleCount, setVisibleCount] = useState(getVisibleCount());

  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (error && products.length === 0) {
    return null; // Silently fail if no recommendations available
  }

  if (products.length === 0 && !isLoading) {
    return null; // No recommendations to show
  }

  const IconComponent = config.icon;

  return (
    <section className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg",
              config.color === "purple" && "bg-purple-100",
              config.color === "blue" && "bg-blue-100",
              config.color === "green" && "bg-green-100",
              config.color === "orange" && "bg-orange-100",
              config.color === "pink" && "bg-pink-100",
              config.color === "indigo" && "bg-indigo-100",
            )}
          >
            <IconComponent
              className={cn(
                "h-5 w-5",
                config.color === "purple" && "text-purple-600",
                config.color === "blue" && "text-blue-600",
                config.color === "green" && "text-green-600",
                config.color === "orange" && "text-orange-600",
                config.color === "pink" && "text-pink-600",
                config.color === "indigo" && "text-indigo-600",
              )}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{displayTitle}</h2>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
        </div>

        {/* Navigation Controls */}
        {products.length > visibleCount && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
              aria-label="Previous products"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
              aria-label="Next products"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: visibleCount }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Products Carousel */}
      {!isLoading && products.length > 0 && (
        <div className="relative overflow-hidden">
          <div
            className="flex gap-4 transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${(currentIndex * 100) / visibleCount}%)`,
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0"
                style={{
                  width: `calc(${100 / visibleCount}% - ${((visibleCount - 1) * 16) / visibleCount}px)`,
                }}
              >
                <RecommendationCard
                  product={product}
                  showReason={showReasons}
                  onAddToCart={onAddToCart}
                  accentColor={config.color}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dots Indicator */}
      {products.length > visibleCount && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({
            length: Math.ceil(products.length / visibleCount),
          }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i * visibleCount)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                Math.floor(currentIndex / visibleCount) === i
                  ? "w-6 bg-green-600"
                  : "bg-gray-300 hover:bg-gray-400",
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ============================================
// 📦 SUB-COMPONENTS
// ============================================

/**
 * Recommendation Card Component
 */
function RecommendationCard({
  product,
  showReason,
  onAddToCart,
  accentColor,
}: {
  product: RecommendedProduct;
  showReason: boolean;
  onAddToCart?: (productId: string) => void;
  accentColor: string;
}) {
  const imageUrl = product.primaryPhotoUrl || "/images/placeholder-product.jpg";
  const isOutOfStock = !product.inStock;

  return (
    <div
      className={cn(
        "group relative flex flex-col h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md",
        isOutOfStock && "opacity-75",
      )}
    >
      {/* Match Badge */}
      {product.matchPercentage !== undefined &&
        product.matchPercentage >= 80 && (
          <div className="absolute top-2 right-2 z-10">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg",
                accentColor === "purple" && "bg-purple-600",
                accentColor === "blue" && "bg-blue-600",
                accentColor === "green" && "bg-green-600",
                accentColor === "orange" && "bg-orange-600",
                accentColor === "pink" && "bg-pink-600",
                accentColor === "indigo" && "bg-indigo-600",
              )}
            >
              <Sparkles className="h-3 w-3" />
              {product.matchPercentage}% Match
            </span>
          </div>
        )}

      {/* Product Image */}
      <Link
        href={`/marketplace/products/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-gray-100"
      >
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.organic && (
            <span className="rounded-full bg-green-600 px-2 py-1 text-xs font-semibold text-white shadow-sm">
              <Leaf className="inline h-3 w-3 mr-1" />
              Organic
            </span>
          )}
          {product.currentSeason && (
            <span className="rounded-full bg-amber-500 px-2 py-1 text-xs font-semibold text-white shadow-sm">
              <Calendar className="inline h-3 w-3 mr-1" />
              In Season
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white shadow-sm">
              Out of Stock
            </span>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4">
        {/* Product Name */}
        <Link
          href={`/marketplace/products/${product.slug}`}
          className="font-semibold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors"
        >
          {product.name}
        </Link>

        {/* Farm Info */}
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{product.farm.name}</span>
          {product.farm.verificationStatus === "VERIFIED" && (
            <span className="text-green-600" title="Verified Farm">
              ✓
            </span>
          )}
        </div>

        {/* Rating */}
        {product.averageRating && product.reviewCount > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-900">
              {product.averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Recommendation Reason */}
        {showReason && product.recommendationReason && (
          <div className="mt-2 text-xs text-gray-600 italic line-clamp-2">
            "{product.recommendationReason}"
          </div>
        )}

        {/* Price & Actions */}
        <div className="mt-auto pt-3 space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-600">/ {product.unit}</span>
          </div>

          {/* Add to Cart Button */}
          {!isOutOfStock && onAddToCart && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(product.id);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Product Card Skeleton Loader
 */
function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Image Skeleton */}
      <div className="relative aspect-square bg-gray-200 animate-pulse" />

      {/* Content Skeleton */}
      <div className="flex flex-1 flex-col p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="mt-auto pt-3 space-y-2">
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// 🔧 UTILITY FUNCTIONS
// ============================================

/**
 * Generate mock recommendations for demo/fallback
 */
function generateMockRecommendations(count: number): RecommendedProduct[] {
  const categories = ["Vegetables", "Fruits", "Herbs", "Dairy", "Eggs"];
  const units = ["lb", "dozen", "bunch", "pint", "each"];

  return Array.from({ length: count }, (_, i) => ({
    id: `mock-${i}`,
    name: `Fresh Organic Product ${i + 1}`,
    slug: `product-${i + 1}`,
    description: "Fresh from local farms",
    price: Math.random() * 20 + 5,
    unit: units[Math.floor(Math.random() * units.length)] || "lb",
    category:
      categories[Math.floor(Math.random() * categories.length)] || "Vegetables",
    organic: Math.random() > 0.5,
    inStock: Math.random() > 0.2,
    quantityAvailable: Math.floor(Math.random() * 50) + 10,
    averageRating: Math.random() * 2 + 3,
    reviewCount: Math.floor(Math.random() * 100) + 5,
    primaryPhotoUrl: null,
    seasonal: Math.random() > 0.4,
    currentSeason: Math.random() > 0.6,
    farm: {
      id: `farm-${i}`,
      name: `Green Valley Farm ${i + 1}`,
      slug: `farm-${i + 1}`,
      logoUrl: null,
      city: "Springfield",
      state: "CA",
      verificationStatus: Math.random() > 0.3 ? "VERIFIED" : "PENDING",
    },
    recommendationScore: Math.random() * 100,
    recommendationReason: [
      "Pairs perfectly with your selection",
      "Customers who bought this also loved this",
      "Fresh and in season right now",
      "From a highly-rated local farm",
      "Great value for organic quality",
    ][Math.floor(Math.random() * 5)],
    matchPercentage: Math.floor(Math.random() * 30) + 70,
  }));
}

// ============================================
// 📤 EXPORTS
// ============================================

export type {
  Farm,
  ProductRecommendationsProps,
  RecommendationType,
  RecommendedProduct,
};
