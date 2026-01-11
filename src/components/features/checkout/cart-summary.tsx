"use client";

// 📊 CART SUMMARY - Divine Order Summary Sidebar
// Displays cart items and order totals in checkout sidebar
// Follows divine component patterns with agricultural consciousness

import { formatCurrency } from "@/lib/utils/currency";
import type { CartItem, Farm, Product } from "@prisma/client";
import { Package, ShoppingBag } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface CartSummaryProps {
  cart: (CartItem & {
    product: Product & {
      farm: Pick<
        Farm,
        "id" | "name" | "slug" | "address" | "city" | "state" | "zipCode"
      >;
    };
  })[];
}

// ============================================================================
// CART SUMMARY COMPONENT
// ============================================================================

export function CartSummary({ cart }: CartSummaryProps) {
  // ==========================================================================
  // CALCULATIONS
  // ==========================================================================

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum: any, item: any) => {
      const itemTotal = Number(item.priceAtAdd) * Number(item.quantity);
      return sum + itemTotal;
    }, 0);

    const deliveryFee = 5.99; // Flat rate for now (could be dynamic)
    const platformFee = subtotal * 0.15; // 15% platform fee
    const tax = (subtotal + deliveryFee + platformFee) * 0.08; // 8% tax
    const total = subtotal + deliveryFee + platformFee + tax;

    return {
      subtotal,
      deliveryFee,
      platformFee,
      tax,
      total,
    };
  };

  const totals = calculateTotals();

  // Group items by farm
  const itemsByFarm = cart.reduce(
    (groups: any, item: any) => {
      const farmId = item.farmId;
      if (!groups[farmId]) {
        groups[farmId] = {
          farmName: item.product.farm.name,
          farmId,
          items: [],
        };
      }
      groups[farmId].items.push(item);
      return groups;
    },
    {} as Record<
      string,
      { farmName: string; farmId: string; items: typeof cart }
    >,
  );

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <ShoppingBag className="h-5 w-5 text-green-600" />
          Order Summary
        </h2>
      </div>

      {/* Cart Items */}
      <div className="max-h-[400px] overflow-y-auto p-4">
        <div className="space-y-4">
          {Object.values(itemsByFarm).map((farmGroup: any) => (
            <div key={farmGroup.farmId} className="space-y-3">
              {/* Farm Name */}
              <div className="flex items-center gap-2 border-b pb-2">
                <Package className="h-4 w-4 text-green-600" />
                <p className="text-sm font-semibold text-gray-900">
                  {farmGroup.farmName}
                </p>
              </div>

              {/* Farm Items */}
              <div className="space-y-2">
                {farmGroup.items.map((item: any) => (
                  <div key={item.id} className="flex items-start gap-3 text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Number(item.quantity)} {item.unit} ×{" "}
                        {formatCurrency(Number(item.priceAtAdd))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(
                          Number(item.priceAtAdd) * Number(item.quantity),
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 p-4">
        <div className="space-y-2 text-sm">
          {/* Subtotal */}
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>

          {/* Delivery Fee */}
          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>{formatCurrency(totals.deliveryFee)}</span>
          </div>

          {/* Platform Fee */}
          <div className="flex justify-between text-gray-600">
            <span>Platform Fee (15%)</span>
            <span>{formatCurrency(totals.platformFee)}</span>
          </div>

          {/* Tax */}
          <div className="flex justify-between text-gray-600">
            <span>Tax (8%)</span>
            <span>{formatCurrency(totals.tax)}</span>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between font-bold text-gray-900 text-lg">
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="border-t border-gray-200 bg-green-50 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600">
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-green-900">
              Secure Checkout
            </p>
            <p className="text-xs text-green-700">
              Your information is protected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
