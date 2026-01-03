/**
 * @file index.ts
 * @description Cart components barrel export file
 *
 * Provides centralized exports for all cart-related components
 * for easier imports throughout the application.
 *
 * @module components/features/cart
 */

// ============================================================================
// Main Components
// ============================================================================

export { CartButton, HeaderCartButton, MobileCartButton } from "./CartButton";
export { CartDrawer, MobileCartDrawer } from "./CartDrawer";
export { CartItem, CompactCartItem } from "./CartItem";
export {
  CartSummary,
  MinimalCartSummary,
  DetailedCartSummary,
  CheckoutSummary,
} from "./CartSummary";
export { EmptyCart, CompactEmptyCart, CheckoutEmptyState } from "./EmptyCart";

// ============================================================================
// Type Exports
// ============================================================================

export type { CartButtonProps } from "./CartButton";
export type { CartDrawerProps } from "./CartDrawer";
export type { CartItemProps } from "./CartItem";
export type { CartSummaryProps } from "./CartSummary";
export type { EmptyCartProps } from "./EmptyCart";
