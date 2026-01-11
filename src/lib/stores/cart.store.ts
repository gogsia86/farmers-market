/**
 * @file cart.store.ts
 * @description Zustand store for shopping cart state management with persistence
 *
 * Features:
 * - LocalStorage persistence for guest carts
 * - Session sync for authenticated users
 * - Optimistic UI updates
 * - Real-time total calculations
 * - Cart expiration handling
 * - Multi-tab synchronization
 *
 * @module lib/stores/cart.store
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { logger } from "@/lib/monitoring/logger";

import type { Product } from "@prisma/client";

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Cart item with product details and metadata
 */
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  farmId: string;
  farmName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
  notes?: string;
  variantId?: string;
  variantName?: string;
  availability: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  addedAt: Date;
  maxQuantity?: number;
  organic?: boolean;
}

/**
 * Cart totals breakdown
 */
export interface CartTotals {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

/**
 * Cart metadata
 */
export interface CartMetadata {
  farmId?: string; // Single farm per cart (for now)
  couponCode?: string;
  deliveryZoneId?: string;
  lastUpdated: Date;
  expiresAt: Date;
}

/**
 * Complete cart state
 */
export interface CartState {
  // State
  items: CartItem[];
  totals: CartTotals;
  metadata: CartMetadata;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;

  // Computed
  itemCount: number;
  isEmpty: boolean;
  hasMultipleFarms: boolean;

  // Actions
  addItem: (product: Product, quantity: number, notes?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  setDeliveryZone: (zoneId: string) => void;

  // Server sync
  syncWithServer: () => Promise<void>;
  mergeGuestCart: (userId: string) => Promise<void>;

  // Helpers
  calculateTotals: () => void;
  validateCart: () => Promise<boolean>;
  checkExpiration: () => boolean;
  getItemById: (itemId: string) => CartItem | undefined;

  // State management
  setLoading: (loading: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const CART_STORAGE_KEY = "farmers-market-cart";
const CART_EXPIRATION_HOURS = 24;
const TAX_RATE = 0.08; // 8% tax rate
const BASE_DELIVERY_FEE = 5.0;

// ============================================================================
// Initial State
// ============================================================================

const initialTotals: CartTotals = {
  subtotal: 0,
  tax: 0,
  deliveryFee: 0,
  discount: 0,
  total: 0,
};

const initialMetadata: CartMetadata = {
  lastUpdated: new Date(),
  expiresAt: new Date(Date.now() + CART_EXPIRATION_HOURS * 60 * 60 * 1000),
};

// ============================================================================
// Store Implementation
// ============================================================================

/**
 * Cart store with Zustand and persistence
 *
 * @example
 * ```tsx
 * import { useCartStore } from '@/lib/stores/cart.store';
 *
 * function CartButton() {
 *   const { items, itemCount, addItem } = useCartStore();
 *   // Use cart state and actions
 * }
 * ```
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // ======================================================================
      // Initial State
      // ======================================================================
      items: [],
      totals: initialTotals,
      metadata: initialMetadata,
      isLoading: false,
      isSyncing: false,
      error: null,

      // ======================================================================
      // Computed Properties
      // ======================================================================
      get itemCount() {
        return get().items.reduce(
          (count: any, item: any) => count + item.quantity,
          0,
        );
      },

      get isEmpty() {
        return get().items.length === 0;
      },

      get hasMultipleFarms() {
        const farmIds = new Set(get().items.map((item: any) => item.farmId));
        return farmIds.size > 1;
      },

      // ======================================================================
      // Cart Actions
      // ======================================================================

      /**
       * Add item to cart with optimistic update
       */
      addItem: (product: Product, quantity: number, notes?: string) => {
        set((state) => {
          // Check if item already exists
          const existingItemIndex = state.items.findIndex(
            (item) => item.productId === product.id,
          );

          let newItems: CartItem[];

          if (existingItemIndex >= 0) {
            // Update existing item quantity
            newItems = [...state.items];
            const existingItem = newItems[existingItemIndex];
            if (existingItem) {
              newItems[existingItemIndex] = {
                ...existingItem,
                quantity: existingItem.quantity + quantity,
                subtotal:
                  (existingItem.quantity + quantity) * existingItem.unitPrice,
                notes: notes || existingItem.notes,
              };
            }
          } else {
            // Add new item
            const newItem: CartItem = {
              id: `temp-${Date.now()}`, // Temporary ID until synced
              productId: product.id,
              productName: product.name,
              productImage: product.images?.[0] as string | undefined,
              farmId: product.farmId,
              farmName: (product as any).farmName || "Unknown Farm",
              quantity,
              unit: product.unit || "unit",
              unitPrice: Number(product.price),
              subtotal: quantity * Number(product.price),
              notes,
              availability: product.inStock ? "IN_STOCK" : "OUT_OF_STOCK",
              addedAt: new Date(),
            };

            newItems = [...state.items, newItem];
          }

          return { items: newItems };
        });

        // Recalculate totals and trigger sync
        get().calculateTotals();
        void get().syncWithServer();
      },

      /**
       * Remove item from cart
       */
      removeItem: (itemId: string) => {
        set((state) => ({
          items: state.items.filter((item: any) => item.id !== itemId),
        }));

        get().calculateTotals();
        void get().syncWithServer();
      },

      /**
       * Update item quantity
       */
      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item: any) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity,
                  subtotal: quantity * item.unitPrice,
                }
              : item,
          ),
        }));

        get().calculateTotals();
        void get().syncWithServer();
      },

      /**
       * Update item notes
       */
      updateNotes: (itemId: string, notes: string) => {
        set((state) => ({
          items: state.items.map((item: any) =>
            item.id === itemId ? { ...item, notes } : item,
          ),
        }));

        void get().syncWithServer();
      },

      /**
       * Clear entire cart
       */
      clearCart: () => {
        set({
          items: [],
          totals: initialTotals,
          metadata: initialMetadata,
          error: null,
        });

        void get().syncWithServer();
      },

      /**
       * Apply coupon code
       */
      applyCoupon: async (code: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/cart/coupon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Invalid coupon code");
          }

          const { discount } = await response.json();

          set((state) => ({
            metadata: {
              ...state.metadata,
              couponCode: code,
            },
            totals: {
              ...state.totals,
              discount,
              total:
                state.totals.subtotal +
                state.totals.tax +
                state.totals.deliveryFee -
                discount,
            },
          }));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to apply coupon";
          set({ error: message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Remove coupon code
       */
      removeCoupon: () => {
        set((state) => ({
          metadata: {
            ...state.metadata,
            couponCode: undefined,
          },
          totals: {
            ...state.totals,
            discount: 0,
          },
        }));

        get().calculateTotals();
      },

      /**
       * Set delivery zone for fee calculation
       */
      setDeliveryZone: (zoneId: string) => {
        set((state) => ({
          metadata: {
            ...state.metadata,
            deliveryZoneId: zoneId,
          },
        }));

        // Recalculate delivery fee based on zone
        void get().syncWithServer();
      },

      // ======================================================================
      // Server Synchronization
      // ======================================================================

      /**
       * Sync cart with server
       */
      syncWithServer: async () => {
        const state = get();

        // Don't sync if cart is empty
        if (state.isEmpty) return;

        set({ isSyncing: true });

        try {
          const response = await fetch("/api/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: state.items,
              metadata: state.metadata,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to sync cart");
          }

          const { cart } = await response.json();

          // Update with server response (may have updated prices, availability)
          if (cart) {
            set({
              items: cart.items,
              totals: cart.totals,
              metadata: {
                ...state.metadata,
                lastUpdated: new Date(),
              },
            });
          }
        } catch (error) {
          logger.error("Cart sync error:", {
            error: error instanceof Error ? error.message : String(error),
          });
          // Don't show error to user for background syncs
        } finally {
          set({ isSyncing: false });
        }
      },

      /**
       * Merge guest cart with user cart on login
       */
      mergeGuestCart: async (userId: string) => {
        const state = get();

        if (state.isEmpty) return;

        set({ isLoading: true });

        try {
          const response = await fetch("/api/cart/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              guestItems: state.items,
              userId,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to merge carts");
          }

          const { cart } = await response.json();

          set({
            items: cart.items,
            totals: cart.totals,
            metadata: {
              ...state.metadata,
              lastUpdated: new Date(),
            },
          });
        } catch (error) {
          logger.error("Cart merge error:", {
            error: error instanceof Error ? error.message : String(error),
          });
          set({ error: "Failed to merge carts" });
        } finally {
          set({ isLoading: false });
        }
      },

      // ======================================================================
      // Helper Methods
      // ======================================================================

      /**
       * Calculate cart totals
       */
      calculateTotals: () => {
        const state = get();

        const subtotal = state.items.reduce(
          (sum, item) => sum + item.subtotal,
          0,
        );

        const tax = subtotal * TAX_RATE;
        const deliveryFee = subtotal > 0 ? BASE_DELIVERY_FEE : 0;
        const discount = state.totals.discount || 0;
        const total = subtotal + tax + deliveryFee - discount;

        set({
          totals: {
            subtotal,
            tax,
            deliveryFee,
            discount,
            total,
          },
          metadata: {
            ...state.metadata,
            lastUpdated: new Date(),
          },
        });
      },

      /**
       * Validate cart before checkout
       */
      validateCart: async () => {
        const state = get();

        if (state.isEmpty) {
          set({ error: "Cart is empty" });
          return false;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/cart/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: state.items,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Cart validation failed");
          }

          const { valid, issues } = await response.json();

          if (!valid && issues?.length > 0) {
            set({ error: issues[0].message });
            return false;
          }

          return true;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Validation failed";
          set({ error: message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Check if cart has expired
       */
      checkExpiration: () => {
        const state = get();
        const now = new Date();
        const expiresAt = new Date(state.metadata.expiresAt);

        if (now > expiresAt) {
          get().clearCart();
          return true;
        }

        return false;
      },

      /**
       * Get cart item by ID
       */
      getItemById: (itemId: string) => {
        return get().items.find((item: any) => item.id === itemId);
      },

      // ======================================================================
      // State Management
      // ======================================================================

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setSyncing: (syncing: boolean) => set({ isSyncing: syncing }),
      setError: (error: string | null) => set({ error }),

      /**
       * Reset cart to initial state
       */
      reset: () => {
        set({
          items: [],
          totals: initialTotals,
          metadata: initialMetadata,
          isLoading: false,
          isSyncing: false,
          error: null,
        });
      },
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist essential data
        items: state.items,
        metadata: state.metadata,
        totals: state.totals,
      }),
      onRehydrateStorage: () => (state) => {
        // Check expiration on rehydration
        if (state) {
          state.checkExpiration();
        }
      },
    },
  ),
);

// ============================================================================
// Selectors (for performance optimization)
// ============================================================================

/**
 * Select only cart items (prevents unnecessary re-renders)
 */
export const selectCartItems = (state: CartState) => state.items;

/**
 * Select only cart totals
 */
export const selectCartTotals = (state: CartState) => state.totals;

/**
 * Select only item count
 */
export const selectItemCount = (state: CartState) => state.itemCount;

/**
 * Select cart loading state
 */
export const selectCartLoading = (state: CartState) =>
  state.isLoading || state.isSyncing;

/**
 * Select cart error
 */
export const selectCartError = (state: CartState) => state.error;

// ============================================================================
// Hooks (convenience wrappers)
// ============================================================================

/**
 * Hook to get cart items only
 */
export const useCartItems = () => useCartStore(selectCartItems);

/**
 * Hook to get cart totals only
 */
export const useCartTotals = () => useCartStore(selectCartTotals);

/**
 * Hook to get item count only
 */
export const useCartItemCount = () => useCartStore(selectItemCount);

/**
 * Hook to get cart actions only (no state)
 */
export const useCartActions = () => {
  const {
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clearCart,
    applyCoupon,
    removeCoupon,
    setDeliveryZone,
    syncWithServer,
    mergeGuestCart,
    validateCart,
  } = useCartStore();

  return {
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clearCart,
    applyCoupon,
    removeCoupon,
    setDeliveryZone,
    syncWithServer,
    mergeGuestCart,
    validateCart,
  };
};
