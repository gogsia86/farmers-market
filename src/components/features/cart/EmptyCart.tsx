/**
 * @file EmptyCart.tsx
 * @description Empty cart state component with illustration and CTA
 *
 * Features:
 * - Friendly empty state illustration
 * - Call-to-action buttons
 * - Browse products link
 * - Helpful messaging
 * - Mobile responsive
 * - Accessibility compliant
 *
 * @module components/features/cart/EmptyCart
 */

"use client";

import { ShoppingBagIcon, SparklesIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface EmptyCartProps {
  /**
   * Callback when close/continue shopping is clicked
   */
  onClose?: () => void;

  /**
   * Custom title message
   */
  title?: string;

  /**
   * Custom description message
   */
  description?: string;

  /**
   * Show browse products button
   * @default true
   */
  showBrowseButton?: boolean;

  /**
   * Show recommendations
   * @default false
   */
  showRecommendations?: boolean;

  /**
   * Custom CSS classes
   */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Empty cart state component
 *
 * @example
 * ```tsx
 * import { EmptyCart } from '@/components/features/cart/EmptyCart';
 *
 * function CartDrawer() {
 *   const items = useCartItems();
 *
 *   if (items.length === 0) {
 *     return <EmptyCart onClose={() => setDrawerOpen(false)} />;
 *   }
 *
 *   return <CartItemsList items={items} />;
 * }
 * ```
 */
export function EmptyCart({
  onClose,
  title = "Your cart is empty",
  description = "Add some fresh, locally-grown produce to get started!",
  showBrowseButton = true,
  showRecommendations = false,
  className = "",
}: EmptyCartProps) {
  const router = useRouter();

  /**
   * Handle browse products click
   */
  const handleBrowseProducts = () => {
    if (onClose) {
      onClose();
    }
    router.push("/products");
  };

  /**
   * Handle browse farms click
   */
  const handleBrowseFarms = () => {
    if (onClose) {
      onClose();
    }
    router.push("/farms");
  };

  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}
      data-testid="empty-cart"
    >
      {/* Icon Illustration */}
      <div className="relative mb-6">
        <div className="relative">
          {/* Background Circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full bg-green-50" />
          </div>

          {/* Shopping Bag Icon */}
          <div className="relative flex items-center justify-center h-32 w-32">
            <ShoppingBagIcon
              className="h-20 w-20 text-green-600"
              aria-hidden="true"
            />
          </div>

          {/* Sparkle Accent */}
          <div className="absolute -top-2 -right-2">
            <SparklesIcon
              className="h-8 w-8 text-green-400"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>

      {/* Description */}
      <p className="text-base text-gray-600 mb-8 max-w-sm">{description}</p>

      {/* Action Buttons */}
      {showBrowseButton && (
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          {/* Browse Products Button */}
          <button
            type="button"
            onClick={handleBrowseProducts}
            className="
              flex-1
              inline-flex items-center justify-center
              rounded-md
              bg-green-600 hover:bg-green-700
              px-6 py-3
              text-base font-medium text-white
              shadow-sm
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
            "
            data-testid="browse-products-button"
          >
            <ShoppingBagIcon className="h-5 w-5 mr-2" aria-hidden="true" />
            Browse Products
          </button>

          {/* Browse Farms Button */}
          <button
            type="button"
            onClick={handleBrowseFarms}
            className="
              flex-1
              inline-flex items-center justify-center
              rounded-md
              bg-white hover:bg-gray-50
              border border-gray-300
              px-6 py-3
              text-base font-medium text-gray-700
              shadow-sm
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
            "
            data-testid="browse-farms-button"
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Browse Farms
          </button>
        </div>
      )}

      {/* Helpful Tips */}
      <div className="mt-10 w-full max-w-md">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            💡 Shopping Tips
          </h4>
          <ul className="text-sm text-blue-800 space-y-1 text-left">
            <li>• Support local farmers and get the freshest produce</li>
            <li>• Free delivery on orders over $50</li>
            <li>• Save favorites for quick reordering</li>
          </ul>
        </div>
      </div>

      {/* Recommendations Section */}
      {showRecommendations && (
        <div className="mt-8 w-full max-w-md">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Popular This Week
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/products?category=vegetables"
              className="
                p-3 rounded-lg border border-gray-200 hover:border-green-500
                text-sm text-gray-700 hover:text-green-600
                transition-colors duration-200
              "
            >
              🥕 Fresh Vegetables
            </Link>
            <Link
              href="/products?category=fruits"
              className="
                p-3 rounded-lg border border-gray-200 hover:border-green-500
                text-sm text-gray-700 hover:text-green-600
                transition-colors duration-200
              "
            >
              🍎 Seasonal Fruits
            </Link>
            <Link
              href="/products?category=dairy"
              className="
                p-3 rounded-lg border border-gray-200 hover:border-green-500
                text-sm text-gray-700 hover:text-green-600
                transition-colors duration-200
              "
            >
              🥛 Dairy Products
            </Link>
            <Link
              href="/products?category=eggs"
              className="
                p-3 rounded-lg border border-gray-200 hover:border-green-500
                text-sm text-gray-700 hover:text-green-600
                transition-colors duration-200
              "
            >
              🥚 Farm Fresh Eggs
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Compact Empty Cart Variant
// ============================================================================

/**
 * Compact empty cart state for smaller displays
 */
export function CompactEmptyCart({ onClose }: { onClose?: () => void }) {
  const router = useRouter();

  const handleBrowse = () => {
    if (onClose) {
      onClose();
    }
    router.push("/products");
  };

  return (
    <div
      className="flex flex-col items-center justify-center py-8 px-4"
      data-testid="compact-empty-cart"
    >
      <ShoppingBagIcon
        className="h-12 w-12 text-gray-400 mb-3"
        aria-hidden="true"
      />
      <p className="text-sm text-gray-600 mb-4">Your cart is empty</p>
      <button
        type="button"
        onClick={handleBrowse}
        className="
          inline-flex items-center
          rounded-md
          bg-green-600 hover:bg-green-700
          px-4 py-2
          text-sm font-medium text-white
          transition-colors duration-200
        "
      >
        Start Shopping
      </button>
    </div>
  );
}

// ============================================================================
// Checkout Empty State Variant
// ============================================================================

/**
 * Empty state for checkout page
 */
export function CheckoutEmptyState() {
  const router = useRouter();

  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4"
      data-testid="checkout-empty-state"
    >
      <div className="rounded-full bg-yellow-100 p-6 mb-6">
        <svg
          className="h-16 w-16 text-yellow-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Can't proceed to checkout
      </h3>
      <p className="text-base text-gray-600 mb-6 max-w-md text-center">
        Your cart is empty. Add some items to your cart before checking out.
      </p>

      <button
        type="button"
        onClick={() => router.push("/products")}
        className="
          inline-flex items-center
          rounded-md
          bg-green-600 hover:bg-green-700
          px-6 py-3
          text-base font-medium text-white
          shadow-sm
          transition-colors duration-200
        "
      >
        <ShoppingBagIcon className="h-5 w-5 mr-2" aria-hidden="true" />
        Browse Products
      </button>
    </div>
  );
}
