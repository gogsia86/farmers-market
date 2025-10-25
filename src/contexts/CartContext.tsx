/**
 * CART CONTEXT - Divine Shopping Cart State Management
 * Agricultural consciousness-driven cart management
 *
 * Features:
 * - Quantum cart state synchronization
 * - Local storage persistence
 * - Optimistic updates
 * - Real-time calculations
 */

"use client";

import type { Product } from "@prisma/client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// Cart item with quantity
export interface CartItem {
  product: Product;
  quantity: number;
}

// Cart state interface
export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  itemCount: number; // Alias for totalItems (compatibility)
  state: "IDLE" | "LOADING" | "ERROR"; // Cart state
}

// Cart actions interface
export interface CartActions {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

// Combined cart context type
export type CartContextType = CartState & CartActions;

// Create context with undefined default (will be provided by provider)
const CartContext = createContext<CartContextType | undefined>(undefined);

// Local storage key
const CART_STORAGE_KEY = "farmers-market-cart";

/**
 * Cart Provider Component
 * Wraps app to provide cart state and actions
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setItems(parsed);
      }
    } catch (error) {
      console.error("Failed to load cart from storage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error("Failed to save cart to storage:", error);
      }
    }
  }, [items, isLoaded]);

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  // Add item to cart
  const addItem = useCallback((product: Product, quantity: number = 1) => {
    setItems((current) => {
      const existingIndex = current.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingIndex > -1) {
        // Update existing item quantity
        const updated = [...current];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        // Add new item
        return [...current, { product, quantity }];
      }
    });
  }, []);

  // Remove item from cart
  const removeItem = useCallback((productId: string) => {
    setItems((current) =>
      current.filter((item) => item.product.id !== productId)
    );
  }, []);

  // Update item quantity
  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }

      setItems((current) => {
        const index = current.findIndex(
          (item) => item.product.id === productId
        );
        if (index === -1) return current;

        const updated = [...current];
        updated[index] = { ...updated[index], quantity };
        return updated;
      });
    },
    [removeItem]
  );

  // Clear entire cart
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Check if product is in cart
  const isInCart = useCallback(
    (productId: string) => {
      return items.some((item) => item.product.id === productId);
    },
    [items]
  );

  // Get quantity of specific product
  const getItemQuantity = useCallback(
    (productId: string) => {
      const item = items.find((item) => item.product.id === productId);
      return item?.quantity ?? 0;
    },
    [items]
  );

  const value: CartContextType = {
    items,
    totalItems,
    totalPrice,
    itemCount: totalItems, // Alias for compatibility
    state: "IDLE", // Cart state (could be enhanced with loading states)
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * useCart Hook
 * Access cart state and actions from any component
 *
 * @throws {Error} If used outside CartProvider
 */
export function useCart() {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}

// Export context for testing
export { CartContext };
