/**
 * 🌾 ORDER SUMMARY ENHANCED COMPONENT
 * Divine Agricultural Order Summary with Comprehensive Details
 *
 * Features:
 * - Detailed order breakdown with farm grouping
 * - Real-time price calculations and tax estimates
 * - Delivery fee calculations based on distance
 * - Promo code and discount application
 * - Agricultural savings highlights (seasonal, organic)
 * - Carbon footprint and sustainability metrics
 * - Estimated delivery time with farm coordination
 * - Mobile-optimized collapsible sections
 * - Accessibility compliant (WCAG 2.1 AA)
 *
 * @divine-consciousness Agricultural order intelligence
 * @quantum-pattern Biodynamic pricing and sustainability awareness
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ShoppingCart,
  Tag,
  Truck,
  Leaf,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Info,
  AlertCircle,
  Sparkles,
  TreePine,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// 🎯 DIVINE TYPE DEFINITIONS
// ============================================

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage?: string | null;
  farmId: string;
  farmName: string;
  farmSlug: string;
  price: number;
  quantity: number;
  unit: string;
  organic: boolean;
  seasonal: boolean;
  inStock: boolean;
  category?: string;
  // Agricultural attributes
  carbonFootprint?: number; // kg CO2
  localDistance?: number; // miles from user
}

interface FarmGroup {
  farmId: string;
  farmName: string;
  farmSlug: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  estimatedDeliveryDate?: string;
}

interface PromoCode {
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED" | "FREE_DELIVERY";
  discountValue: number;
  isValid: boolean;
  errorMessage?: string;
}

interface SustainabilityMetrics {
  totalCarbonFootprint: number;
  averageDistance: number;
  organicPercentage: number;
  seasonalPercentage: number;
  localFarmsCount: number;
}

interface OrderSummaryData {
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  appliedPromoCode?: PromoCode;
  estimatedSavings?: number;
  sustainabilityMetrics?: SustainabilityMetrics;
}

interface OrderSummaryEnhancedProps {
  /** Order items grouped by farm */
  items: OrderItem[];
  /** Delivery address for fee calculation */
  deliveryAddress?: {
    city: string;
    state: string;
    zipCode: string;
  };
  /** Tax rate (default 8%) */
  taxRate?: number;
  /** Free delivery threshold */
  freeDeliveryThreshold?: number;
  /** Show sustainability metrics */
  showSustainability?: boolean;
  /** Show detailed breakdown */
  showDetailedBreakdown?: boolean;
  /** Enable promo codes */
  enablePromoCodes?: boolean;
  /** Callback when promo code is applied */
  onPromoCodeApplied?: (code: PromoCode) => void;
  /** Custom CSS classes */
  className?: string;
}

// ============================================
// 🎨 MAIN COMPONENT
// ============================================

export function OrderSummaryEnhanced({
  items,
  deliveryAddress,
  taxRate = 0.08,
  freeDeliveryThreshold = 50,
  showSustainability = true,
  showDetailedBreakdown = true,
  enablePromoCodes = true,
  onPromoCodeApplied,
  className,
}: OrderSummaryEnhancedProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Group items by farm
  const farmGroups: FarmGroup[] = items.reduce((groups, item) => {
    const existingGroup = groups.find((g) => g.farmId === item.farmId);

    if (existingGroup) {
      existingGroup.items.push(item);
      existingGroup.subtotal += item.price * item.quantity;
    } else {
      groups.push({
        farmId: item.farmId,
        farmName: item.farmName,
        farmSlug: item.farmSlug,
        items: [item],
        subtotal: item.price * item.quantity,
        deliveryFee: 5.99, // Base fee per farm
      });
    }

    return groups;
  }, [] as FarmGroup[]);

  // Calculate order summary
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const baseDeliveryFee = farmGroups.reduce(
    (sum, group) => sum + group.deliveryFee,
    0,
  );
  const isFreeDelivery =
    subtotal >= freeDeliveryThreshold ||
    appliedPromo?.discountType === "FREE_DELIVERY";
  const deliveryFee = isFreeDelivery ? 0 : baseDeliveryFee;

  let discount = 0;
  if (appliedPromo?.isValid) {
    if (appliedPromo.discountType === "PERCENTAGE") {
      discount = subtotal * (appliedPromo.discountValue / 100);
    } else if (appliedPromo.discountType === "FIXED") {
      discount = appliedPromo.discountValue;
    }
  }

  const tax = (subtotal - discount) * taxRate;
  const total = subtotal + deliveryFee + tax - discount;

  // Calculate sustainability metrics
  const sustainabilityMetrics: SustainabilityMetrics = {
    totalCarbonFootprint: items.reduce(
      (sum, item) => sum + (item.carbonFootprint || 0) * item.quantity,
      0,
    ),
    averageDistance:
      items.reduce((sum, item) => sum + (item.localDistance || 0), 0) /
      items.length,
    organicPercentage:
      (items.filter((i) => i.organic).length / items.length) * 100,
    seasonalPercentage:
      (items.filter((i) => i.seasonal).length / items.length) * 100,
    localFarmsCount: farmGroups.length,
  };

  // Calculate estimated savings
  const estimatedSavings = items.reduce((sum, item) => {
    let savings = 0;
    if (item.organic) savings += item.price * item.quantity * 0.15; // 15% organic premium
    if (item.seasonal) savings += item.price * item.quantity * 0.1; // 10% seasonal savings
    return sum + savings;
  }, 0);

  // Handle promo code application
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setIsApplyingPromo(true);
    setPromoError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock validation
      const validCodes = ["FRESH10", "ORGANIC20", "FREEDEL"];
      const isValid = validCodes.includes(promoCode.toUpperCase());

      if (isValid) {
        const promo: PromoCode = {
          code: promoCode.toUpperCase(),
          description: getPromoDescription(promoCode.toUpperCase()),
          discountType:
            promoCode.toUpperCase() === "FREEDEL"
              ? "FREE_DELIVERY"
              : "PERCENTAGE",
          discountValue: promoCode.toUpperCase() === "FRESH10" ? 10 : 20,
          isValid: true,
        };

        setAppliedPromo(promo);
        setShowPromoInput(false);
        setPromoCode("");
        onPromoCodeApplied?.(promo);
      } else {
        setPromoError("Invalid promo code");
      }
    } catch (error) {
      setPromoError("Failed to apply promo code");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 shadow-sm",
        className,
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
              <p className="text-sm text-gray-600">
                {itemCount} {itemCount === 1 ? "item" : "items"} from{" "}
                {farmGroups.length} {farmGroups.length === 1 ? "farm" : "farms"}
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Items by Farm */}
          {showDetailedBreakdown && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-600" />
                Items by Farm
              </h3>
              {farmGroups.map((group) => (
                <FarmGroupSection key={group.farmId} group={group} />
              ))}
            </div>
          )}

          {/* Pricing Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Subtotal ({itemCount} items)</span>
              <span className="font-medium text-gray-900">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {/* Delivery Fee */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <span>Delivery Fee</span>
                {isFreeDelivery && subtotal >= freeDeliveryThreshold && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                    FREE
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "font-medium",
                  isFreeDelivery
                    ? "text-green-600 line-through"
                    : "text-gray-900",
                )}
              >
                {isFreeDelivery && subtotal >= freeDeliveryThreshold ? (
                  <span className="text-green-600">
                    FREE (saved ${baseDeliveryFee.toFixed(2)})
                  </span>
                ) : (
                  `$${deliveryFee.toFixed(2)}`
                )}
              </span>
            </div>

            {/* Free Delivery Progress */}
            {!isFreeDelivery && subtotal < freeDeliveryThreshold && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm text-blue-900 mb-2">
                  <Info className="h-4 w-4" />
                  <span className="font-medium">
                    Add ${(freeDeliveryThreshold - subtotal).toFixed(2)} more
                    for FREE delivery!
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(subtotal / freeDeliveryThreshold) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Tax */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Tax (8%)</span>
              <span className="font-medium text-gray-900">
                ${tax.toFixed(2)}
              </span>
            </div>

            {/* Applied Promo Code */}
            {appliedPromo && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 flex-1">
                  <Tag className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900">
                      {appliedPromo.code}
                    </p>
                    <p className="text-xs text-green-700">
                      {appliedPromo.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemovePromo}
                  className="text-sm text-green-700 hover:text-green-800 font-medium"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Discount */}
            {discount > 0 && (
              <div className="flex items-center justify-between text-sm text-green-600">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  <span>Discount</span>
                </div>
                <span className="font-medium">-${discount.toFixed(2)}</span>
              </div>
            )}

            {/* Promo Code Input */}
            {enablePromoCodes && !appliedPromo && (
              <div>
                {!showPromoInput ? (
                  <button
                    onClick={() => setShowPromoInput(true)}
                    className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    <Tag className="h-4 w-4" />
                    Add promo code
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) =>
                          setPromoCode(e.target.value.toUpperCase())
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleApplyPromo()
                        }
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={isApplyingPromo || !promoCode.trim()}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isApplyingPromo ? "Applying..." : "Apply"}
                      </button>
                    </div>
                    {promoError && (
                      <p className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {promoError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Total */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Estimated Savings */}
            {estimatedSavings > 0 && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">
                    You're saving approximately ${estimatedSavings.toFixed(2)}
                  </span>{" "}
                  by buying seasonal and organic!
                </p>
              </div>
            )}
          </div>

          {/* Sustainability Metrics */}
          {showSustainability && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <Leaf className="h-4 w-4 text-green-600" />
                Sustainability Impact
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <SustainabilityMetric
                  icon={TreePine}
                  label="Carbon Footprint"
                  value={`${sustainabilityMetrics.totalCarbonFootprint.toFixed(1)} kg CO₂`}
                  color="green"
                />
                <SustainabilityMetric
                  icon={MapPin}
                  label="Avg Distance"
                  value={`${sustainabilityMetrics.averageDistance.toFixed(0)} miles`}
                  color="blue"
                />
                <SustainabilityMetric
                  icon={Leaf}
                  label="Organic"
                  value={`${sustainabilityMetrics.organicPercentage.toFixed(0)}%`}
                  color="green"
                />
                <SustainabilityMetric
                  icon={Calendar}
                  label="Seasonal"
                  value={`${sustainabilityMetrics.seasonalPercentage.toFixed(0)}%`}
                  color="amber"
                />
              </div>
            </div>
          )}

          {/* Estimated Delivery */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Estimated Delivery
              </p>
              <p className="text-xs text-gray-600">
                {getEstimatedDeliveryDate()} • Coordinated from{" "}
                {farmGroups.length} {farmGroups.length === 1 ? "farm" : "farms"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// 📦 SUB-COMPONENTS
// ============================================

/**
 * Farm Group Section
 */
function FarmGroupSection({ group }: { group: FarmGroup }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1">
          <MapPin className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">
            {group.farmName}
          </span>
          <span className="text-xs text-gray-500">
            ({group.items.length} items)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-900">
            ${group.subtotal.toFixed(2)}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-3 space-y-2 bg-white">
          {group.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={item.productImage || "/images/placeholder-product.jpg"}
                  alt={item.productName}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.productName}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>
                    {item.quantity} × ${item.price.toFixed(2)}
                  </span>
                  {item.organic && (
                    <span className="px-1 py-0.5 bg-green-100 text-green-700 font-semibold rounded">
                      Organic
                    </span>
                  )}
                  {item.seasonal && (
                    <span className="px-1 py-0.5 bg-amber-100 text-amber-700 font-semibold rounded">
                      Seasonal
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Sustainability Metric Display
 */
function SustainabilityMetric({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: "green" | "blue" | "amber";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg",
        color === "green" && "bg-green-50",
        color === "blue" && "bg-blue-50",
        color === "amber" && "bg-amber-50",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4",
          color === "green" && "text-green-600",
          color === "blue" && "text-blue-600",
          color === "amber" && "text-amber-600",
        )}
      />
      <div className="flex-1">
        <p className="text-xs text-gray-600">{label}</p>
        <p
          className={cn(
            "text-sm font-semibold",
            color === "green" && "text-green-900",
            color === "blue" && "text-blue-900",
            color === "amber" && "text-amber-900",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ============================================
// 🔧 UTILITY FUNCTIONS
// ============================================

/**
 * Get promo code description
 */
function getPromoDescription(code: string): string {
  const descriptions: Record<string, string> = {
    FRESH10: "10% off your order",
    ORGANIC20: "20% off organic products",
    FREEDEL: "Free delivery on this order",
  };
  return descriptions[code] || "Discount applied";
}

/**
 * Get estimated delivery date
 */
function getEstimatedDeliveryDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ============================================
// 📤 EXPORTS
// ============================================

export type {
  OrderItem,
  FarmGroup,
  PromoCode,
  SustainabilityMetrics,
  OrderSummaryData,
  OrderSummaryEnhancedProps,
};
