/**
 * 🛒 CART CONTEXT - SHOPPING CART STATE MANAGEMENT
 *
 * Global shopping cart state using React Context API and useReducer
 *
 * Features:
 * - Add/remove/update cart items
 * - Persist to localStorage
 * - Auto-calculate totals
 * - Quantity validation
 * - Toast notifications
 *
 * @module CartContext
 */

"use client";

import { useToast } from "@/hooks/use-toast";
import { createLogger } from "@/lib/utils/logger";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";

const cartContextLogger = createLogger("CartContext");

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  maxStock: number;
  farmName: string;
  farmId: string;
  image?: string;
  category?: string;
}

export interface CartState {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { productId: string } }
  | {
      type: "UPDATE_QUANTITY";
      payload: { productId: string; quantity: number };
    }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

// ============================================================================
// CONTEXT
// ============================================================================

const CartContext = createContext<CartContextType | undefined>(undefined);

// ============================================================================
// REDUCER
// ============================================================================

const calculateTotals = (
  items: CartItem[],
): Pick<CartState, "totalAmount" | "itemCount"> => {
  return items.reduce(
    (acc, item) => ({
      totalAmount: acc.totalAmount + item.price * item.quantity,
      itemCount: acc.itemCount + item.quantity,
    }),
    { totalAmount: 0, itemCount: 0 },
  );
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newItems: CartItem[];

  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === action.payload.productId,
      );

      if (existingItemIndex > -1) {
        // Item already exists, increment quantity
        newItems = state.items.map((item, index) => {
          if (index === existingItemIndex) {
            const newQuantity = Math.min(
              item.quantity + action.payload.quantity,
              item.maxStock,
            );
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
      } else {
        // New item
        newItems = [...state.items, action.payload];
      }

      const totals = calculateTotals(newItems);
      return { items: newItems, ...totals };
    }

    case "REMOVE_ITEM": {
      newItems = state.items.filter(
        (item) => item.productId !== action.payload.productId,
      );
      const totals = calculateTotals(newItems);
      return { items: newItems, ...totals };
    }

    case "UPDATE_QUANTITY": {
      const { productId, quantity } = action.payload;

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        newItems = state.items.filter((item) => item.productId !== productId);
      } else {
        newItems = state.items.map((item) => {
          if (item.productId === productId) {
            const validQuantity = Math.min(quantity, item.maxStock);
            return { ...item, quantity: validQuantity };
          }
          return item;
        });
      }

      const totals = calculateTotals(newItems);
      return { items: newItems, ...totals };
    }

    case "CLEAR_CART": {
      return {
        items: [],
        totalAmount: 0,
        itemCount: 0,
      };
    }

    case "LOAD_CART": {
      const totals = calculateTotals(action.payload);
      return { items: action.payload, ...totals };
    }

    default:
      return state;
  }
};

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

const CART_STORAGE_KEY = "farmers-market-cart";

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { toast } = useToast();

  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalAmount: 0,
    itemCount: 0,
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const items = JSON.parse(savedCart) as CartItem[];
        dispatch({ type: "LOAD_CART", payload: items });
      }
    } catch (error) {
      cartContextLogger.error(
        "Failed to load cart from localStorage",
        error instanceof Error ? error : new Error(String(error)),
      );
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      cartContextLogger.error(
        "Failed to save cart to localStorage",
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }, [state.items]);

  // Add item to cart
  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
      if (quantity <= 0) {
        toast({
          title: "Invalid Quantity",
          description: "Quantity must be greater than 0",
          variant: "destructive",
        });
        return;
      }

      if (quantity > item.maxStock) {
        toast({
          title: "Stock Limit Exceeded",
          description: `Only ${item.maxStock} items available`,
          variant: "destructive",
        });
        return;
      }

      const existingItem = state.items.find(
        (i) => i.productId === item.productId,
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > item.maxStock) {
          toast({
            title: "Stock Limit Exceeded",
            description: `Only ${item.maxStock} items available`,
            variant: "destructive",
          });
          return;
        }
      }

      dispatch({
        type: "ADD_ITEM",
        payload: { ...item, quantity },
      });

      toast({
        title: "Added to Cart",
        description: `${item.name} added to your cart`,
      });
    },
    [state.items, toast],
  );

  // Remove item from cart
  const removeItem = useCallback(
    (productId: string) => {
      const item = state.items.find((i) => i.productId === productId);

      dispatch({ type: "REMOVE_ITEM", payload: { productId } });

      if (item) {
        toast({
          title: "Removed from Cart",
          description: `${item.name} removed from your cart`,
        });
      }
    },
    [state.items, toast],
  );

  // Update item quantity
  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      const item = state.items.find((i) => i.productId === productId);

      if (!item) {
        return;
      }

      if (quantity <= 0) {
        removeItem(productId);
        return;
      }

      if (quantity > item.maxStock) {
        toast({
          title: "Stock Limit Exceeded",
          description: `Only ${item.maxStock} items available`,
          variant: "destructive",
        });
        return;
      }

      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { productId, quantity },
      });
    },
    [state.items, removeItem, toast],
  );

  // Clear entire cart
  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });

    toast({
      title: "Cart Cleared",
      description: "All items removed from your cart",
    });
  }, [toast]);

  // Check if item is in cart
  const isInCart = useCallback(
    (productId: string): boolean => {
      return state.items.some((item) => item.productId === productId);
    },
    [state.items],
  );

  // Get item quantity
  const getItemQuantity = useCallback(
    (productId: string): number => {
      const item = state.items.find((i) => i.productId === productId);
      return item?.quantity || 0;
    },
    [state.items],
  );

  const value: CartContextType = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Hook to access cart context
 * @throws {Error} If used outside CartProvider
 */
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default CartContext;
