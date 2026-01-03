/**
 * @file CartButton.tsx
 * @description Floating cart button with item count badge and drawer toggle
 *
 * Features:
 * - Floating action button
 * - Item count badge
 * - Animated on cart updates
 * - Opens cart drawer
 * - Mobile responsive
 * - Accessibility compliant
 *
 * @module components/features/cart/CartButton
 */

"use client";

import { useState } from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCartItemCount } from "@/lib/stores/cart.store";
import { CartDrawer } from "./CartDrawer";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface CartButtonProps {
  /**
   * Position of the button
   * @default "bottom-right"
   */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";

  /**
   * Size of the button
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * Custom CSS classes
   */
  className?: string;

  /**
   * Whether to show the button
   * @default true
   */
  show?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Floating cart button with item count badge
 *
 * @example
 * ```tsx
 * import { CartButton } from '@/components/features/cart/CartButton';
 *
 * function Layout() {
 *   return (
 *     <>
 *       <main>{children}</main>
 *       <CartButton />
 *     </>
 *   );
 * }
 * ```
 */
export function CartButton({
  position = "bottom-right",
  size = "md",
  className = "",
  show = true,
}: CartButtonProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const itemCount = useCartItemCount();

  // Don't render if explicitly hidden
  if (!show) return null;

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  // Size classes
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-14 w-14",
    lg: "h-16 w-16",
  };

  const iconSizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-7 w-7",
  };

  const badgeSizeClasses = {
    sm: "h-5 w-5 text-xs",
    md: "h-6 w-6 text-sm",
    lg: "h-7 w-7 text-base",
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsDrawerOpen(true)}
        className={`
          fixed z-40
          ${positionClasses[position]}
          ${sizeClasses[size]}
          ${className}
          flex items-center justify-center
          rounded-full
          bg-green-600 hover:bg-green-700
          text-white
          shadow-lg hover:shadow-xl
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          active:scale-95
          group
        `}
        aria-label={`Shopping cart with ${itemCount} items`}
        data-testid="cart-button"
      >
        {/* Cart Icon */}
        <ShoppingCartIcon
          className={`
            ${iconSizeClasses[size]}
            transition-transform duration-200
            group-hover:scale-110
          `}
          aria-hidden="true"
        />

        {/* Item Count Badge */}
        {itemCount > 0 && (
          <span
            className={`
              absolute -top-1 -right-1
              ${badgeSizeClasses[size]}
              flex items-center justify-center
              rounded-full
              bg-red-500
              text-white font-bold
              border-2 border-white
              animate-bounce
            `}
            aria-label={`${itemCount} items in cart`}
            data-testid="cart-item-count"
          >
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </button>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}

// ============================================================================
// Header Cart Button Variant
// ============================================================================

/**
 * Cart button for header/navbar
 * Inline variant without floating
 */
export function HeaderCartButton() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const itemCount = useCartItemCount();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsDrawerOpen(true)}
        className="
          relative
          p-2
          text-gray-700 hover:text-green-600
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          rounded-md
        "
        aria-label={`Shopping cart with ${itemCount} items`}
        data-testid="header-cart-button"
      >
        <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />

        {itemCount > 0 && (
          <span
            className="
              absolute -top-1 -right-1
              h-5 w-5
              flex items-center justify-center
              rounded-full
              bg-red-500
              text-white text-xs font-bold
              border-2 border-white
            "
            aria-label={`${itemCount} items in cart`}
            data-testid="header-cart-item-count"
          >
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </button>

      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}

// ============================================================================
// Mobile Bottom Bar Cart Button
// ============================================================================

/**
 * Cart button for mobile bottom navigation bar
 */
export function MobileCartButton() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const itemCount = useCartItemCount();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsDrawerOpen(true)}
        className="
          relative
          flex flex-col items-center justify-center
          p-2
          text-gray-600
          transition-colors duration-200
          focus:outline-none
        "
        aria-label={`Shopping cart with ${itemCount} items`}
        data-testid="mobile-cart-button"
      >
        <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
        <span className="text-xs mt-1">Cart</span>

        {itemCount > 0 && (
          <span
            className="
              absolute top-0 right-0
              h-5 w-5
              flex items-center justify-center
              rounded-full
              bg-red-500
              text-white text-xs font-bold
            "
            aria-label={`${itemCount} items in cart`}
            data-testid="mobile-cart-item-count"
          >
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </button>

      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
