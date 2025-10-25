/**
 * CART PROVIDER - DIVINE SHOPPING CART STATE MANAGEMENT
 *
 * Provides cart state and operations throughout the application.
 * Persists cart to localStorage for quantum persistence.
 *
 * Divine Patterns:
 * - React Context for global state
 * - LocalStorage persistence
 * - Agricultural consciousness
 */

"use client";

import type {
  CartAction,
  CartContextValue,
  CartItem,
  ShoppingCart,
} from "@/types/cart.types";
import type { ProductId, QuantumProduct } from "@/types/product.types";
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";

// ============================================================================
// INITIAL CART STATE
// ============================================================================

const initialCart: ShoppingCart = {
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  total: 0,
  itemCount: 0,
  updatedAt: new Date(),
};

// ============================================================================
// CART CALCULATIONS
// ============================================================================

function calculateCartTotals(
  items: CartItem[]
): Omit<ShoppingCart, "items" | "updatedAt"> {
  const subtotal = items.reduce((sum, item) => {
    const price =
      item.product.pricing.salePrice || item.product.pricing.basePrice;
    return sum + price * item.quantity;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Simple tax calculation (8% - adjust based on location)
  const tax = Math.round(subtotal * 0.08);

  // Free shipping over $50
  const shipping = subtotal >= 5000 ? 0 : 500; // $5 shipping

  const total = subtotal + tax + shipping;

  return {
    subtotal,
    tax,
    shipping,
    discount: 0,
    total,
    itemCount,
  };
}

// ============================================================================
// CART REDUCER
// ============================================================================

function cartReducer(state: ShoppingCart, action: CartAction): ShoppingCart {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.identity.id === product.identity.id
      );

      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        };
      } else {
        // Add new item
        newItems = [
          ...state.items,
          {
            product,
            quantity,
            addedAt: new Date(),
          },
        ];
      }

      const totals = calculateCartTotals(newItems);

      return {
        ...state,
        items: newItems,
        ...totals,
        updatedAt: new Date(),
      };
    }

    case "REMOVE_ITEM": {
      const { productId } = action.payload;
      const newItems = state.items.filter(
        (item) => item.product.identity.id !== productId
      );

      const totals = calculateCartTotals(newItems);

      return {
        ...state,
        items: newItems,
        ...totals,
        updatedAt: new Date(),
      };
    }

    case "UPDATE_QUANTITY": {
      const { productId, quantity } = action.payload;

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return cartReducer(state, {
          type: "REMOVE_ITEM",
          payload: { productId },
        });
      }

      const newItems = state.items.map((item) =>
        item.product.identity.id === productId ? { ...item, quantity } : item
      );

      const totals = calculateCartTotals(newItems);

      return {
        ...state,
        items: newItems,
        ...totals,
        updatedAt: new Date(),
      };
    }

    case "CLEAR_CART":
      return {
        ...initialCart,
        updatedAt: new Date(),
      };

    case "SET_CART":
      return action.payload;

    default:
      return state;
  }
}

// ============================================================================
// CART CONTEXT
// ============================================================================

const CartContext = createContext<CartContextValue | undefined>(undefined);

// ============================================================================
// CART PROVIDER COMPONENT
// ============================================================================

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("farmers-market-cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart) as ShoppingCart;
        // Convert date strings back to Date objects
        parsed.updatedAt = new Date(parsed.updatedAt);
        parsed.items = parsed.items.map((item) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }));
        dispatch({ type: "SET_CART", payload: parsed });
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("farmers-market-cart", JSON.stringify(cart));
  }, [cart]);

  // Cart operations
  const addItem = (product: QuantumProduct, quantity = 1) => {
    dispatch({ type: "ADD_ITEM", payload: { product, quantity } });
  };

  const removeItem = (productId: ProductId) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId } });
  };

  const updateQuantity = (productId: ProductId, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const isInCart = (productId: ProductId): boolean => {
    return cart.items.some((item) => item.product.identity.id === productId);
  };

  const getItemQuantity = (productId: ProductId): number => {
    const item = cart.items.find(
      (item) => item.product.identity.id === productId
    );
    return item?.quantity || 0;
  };

  const value: CartContextValue = {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ============================================================================
// USE CART HOOK
// ============================================================================

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
