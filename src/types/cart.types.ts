/**
 * SHOPPING CART TYPES - QUANTUM COMMERCE CONSCIOUSNESS
 *
 * Divine types for shopping cart state management.
 * Embodies agricultural commerce wisdom.
 */

import type { ProductId, QuantumProduct } from "./product.types";

// ============================================================================
// CART ITEM - Individual Product in Cart
// ============================================================================

export interface CartItem {
  product: QuantumProduct;
  quantity: number;
  addedAt: Date;
  notes?: string; // Special instructions
}

// ============================================================================
// CART STATE - Full Shopping Cart
// ============================================================================

export interface ShoppingCart {
  items: CartItem[];
  subtotal: number; // In cents
  tax: number; // In cents
  shipping: number; // In cents
  discount: number; // In cents
  total: number; // In cents
  itemCount: number;
  updatedAt: Date;
}

// ============================================================================
// CART ACTIONS - Divine Cart Operations
// ============================================================================

export type CartAction =
  | { type: "ADD_ITEM"; payload: { product: QuantumProduct; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: { productId: ProductId } }
  | {
      type: "UPDATE_QUANTITY";
      payload: { productId: ProductId; quantity: number };
    }
  | { type: "CLEAR_CART" }
  | { type: "APPLY_DISCOUNT"; payload: { code: string; amount: number } }
  | { type: "SET_CART"; payload: ShoppingCart };

// ============================================================================
// CART CONTEXT - Divine State Management
// ============================================================================

export interface CartContextValue {
  cart: ShoppingCart;
  addItem: (product: QuantumProduct, quantity?: number) => void;
  removeItem: (productId: ProductId) => void;
  updateQuantity: (productId: ProductId, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: ProductId) => boolean;
  getItemQuantity: (productId: ProductId) => number;
}
