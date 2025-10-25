/**
 * CART BADGE - SHOPPING CART ICON WITH ITEM COUNT
 *
 * Shows cart icon with item count badge.
 * Opens cart drawer when clicked.
 */

"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";

interface CartBadgeProps {
  onClick: () => void;
  className?: string;
}

export default function CartBadge({ onClick, className = "" }: CartBadgeProps) {
  const { cart } = useCart();

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-700 hover:text-agricultural-600 transition-colors ${className}`}
      aria-label={`Shopping cart with ${cart.itemCount} items`}
    >
      <ShoppingCart className="h-6 w-6" />

      {cart.itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-agricultural-600 text-xs font-bold text-white">
          {cart.itemCount > 99 ? "99+" : cart.itemCount}
        </span>
      )}
    </button>
  );
}
