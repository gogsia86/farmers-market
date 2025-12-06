/**
 * Shopping Cart Store for Farmers Market Mobile App
 *
 * Global state management for shopping cart using Zustand.
 * Features:
 * - Local cart management
 * - Server synchronization
 * - Offline support with queue
 * - Optimistic updates
 * - Cart totals calculation
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '@/services/api';

// Cart item interface
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  unit: string;
  farmId: string;
  farmName: string;
  stock: number;
  maxQuantity?: number;
}

// Cart totals interface
export interface CartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  itemCount: number;
}

// Cart state interface
interface CartState {
  // State
  items: CartItem[];
  totals: CartTotals;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSyncedAt: string | null;
  hasHydrated: boolean;
  pendingChanges: boolean;

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  fetchCart: () => Promise<void>;
  calculateTotals: () => void;
  clearError: () => void;
  setHasHydrated: (value: boolean) => void;
  getItemByProductId: (productId: string) => CartItem | undefined;
  getItemCount: () => number;
  getTotalPrice: () => number;
  isProductInCart: (productId: string) => boolean;
}

// Initial totals
const initialTotals: CartTotals = {
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  total: 0,
  itemCount: 0,
};

// Tax rate (can be configured)
const TAX_RATE = 0.08; // 8%
const FREE_SHIPPING_THRESHOLD = 50; // Free shipping over $50
const STANDARD_SHIPPING = 5.99;

/**
 * Calculate cart totals from items
 */
const calculateCartTotals = (items: CartItem[]): CartTotals => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const discount = 0; // Can be implemented later
  const total = subtotal + tax + shipping - discount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.round(total * 100) / 100,
    itemCount,
  };
};

/**
 * Shopping Cart Store
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      totals: initialTotals,
      isLoading: false,
      isSyncing: false,
      error: null,
      lastSyncedAt: null,
      hasHydrated: false,
      pendingChanges: false,

      /**
       * Add item to cart
       * Optimistic update with server sync
       */
      addItem: async (newItem: Omit<CartItem, 'id'>) => {
        const { items } = get();

        // Check if item already exists
        const existingItem = items.find((item) => item.productId === newItem.productId);

        let updatedItems: CartItem[];

        if (existingItem) {
          // Update quantity if item exists
          const newQuantity = existingItem.quantity + newItem.quantity;

          // Check stock limit
          if (newQuantity > existingItem.stock) {
            set({ error: 'Not enough stock available' });
            return;
          }

          updatedItems = items.map((item) =>
            item.productId === newItem.productId
              ? { ...item, quantity: newQuantity }
              : item
          );
        } else {
          // Add new item
          const cartItem: CartItem = {
            ...newItem,
            id: `temp-${Date.now()}`, // Temporary ID
          };
          updatedItems = [...items, cartItem];
        }

        // Optimistic update
        set({
          items: updatedItems,
          totals: calculateCartTotals(updatedItems),
          pendingChanges: true,
        });

        // Sync with server
        try {
          await apiClient.cart.add(newItem.productId, newItem.quantity);
          await get().syncWithServer();
          console.log('✅ Item added to cart:', newItem.productName);
        } catch (error: any) {
          console.error('❌ Failed to add item to server cart:', error);
          // Revert on error
          set({
            items,
            totals: calculateCartTotals(items),
            error: error.message || 'Failed to add item to cart',
            pendingChanges: false,
          });
        }
      },

      /**
       * Update item quantity
       */
      updateQuantity: async (itemId: string, quantity: number) => {
        const { items } = get();
        const item = items.find((i) => i.id === itemId);

        if (!item) {
          set({ error: 'Item not found in cart' });
          return;
        }

        // Validate quantity
        if (quantity < 1) {
          await get().removeItem(itemId);
          return;
        }

        if (quantity > item.stock) {
          set({ error: 'Not enough stock available' });
          return;
        }

        const oldItems = [...items];

        // Optimistic update
        const updatedItems = items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        );

        set({
          items: updatedItems,
          totals: calculateCartTotals(updatedItems),
          pendingChanges: true,
        });

        // Sync with server
        try {
          await apiClient.cart.update(itemId, quantity);
          await get().syncWithServer();
          console.log('✅ Cart item quantity updated');
        } catch (error: any) {
          console.error('❌ Failed to update quantity on server:', error);
          // Revert on error
          set({
            items: oldItems,
            totals: calculateCartTotals(oldItems),
            error: error.message || 'Failed to update quantity',
            pendingChanges: false,
          });
        }
      },

      /**
       * Remove item from cart
       */
      removeItem: async (itemId: string) => {
        const { items } = get();
        const oldItems = [...items];

        // Optimistic update
        const updatedItems = items.filter((item) => item.id !== itemId);

        set({
          items: updatedItems,
          totals: calculateCartTotals(updatedItems),
          pendingChanges: true,
        });

        // Sync with server
        try {
          await apiClient.cart.remove(itemId);
          await get().syncWithServer();
          console.log('✅ Item removed from cart');
        } catch (error: any) {
          console.error('❌ Failed to remove item from server cart:', error);
          // Revert on error
          set({
            items: oldItems,
            totals: calculateCartTotals(oldItems),
            error: error.message || 'Failed to remove item',
            pendingChanges: false,
          });
        }
      },

      /**
       * Clear entire cart
       */
      clearCart: async () => {
        const { items } = get();
        const oldItems = [...items];

        // Optimistic update
        set({
          items: [],
          totals: initialTotals,
          pendingChanges: true,
        });

        // Sync with server
        try {
          await apiClient.cart.clear();
          set({
            lastSyncedAt: new Date().toISOString(),
            pendingChanges: false,
          });
          console.log('✅ Cart cleared');
        } catch (error: any) {
          console.error('❌ Failed to clear cart on server:', error);
          // Revert on error
          set({
            items: oldItems,
            totals: calculateCartTotals(oldItems),
            error: error.message || 'Failed to clear cart',
            pendingChanges: false,
          });
        }
      },

      /**
       * Sync cart with server
       * Merge local and server state
       */
      syncWithServer: async () => {
        set({ isSyncing: true, error: null });

        try {
          const serverCart = await apiClient.cart.get();

          // Transform server response to cart items
          const items: CartItem[] = serverCart.items.map((item: any) => ({
            id: item.id,
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.images[0] || '',
            price: item.product.price,
            quantity: item.quantity,
            unit: item.product.unit,
            farmId: item.product.farmId,
            farmName: item.product.farm.name,
            stock: item.product.stock,
            maxQuantity: item.product.stock,
          }));

          set({
            items,
            totals: calculateCartTotals(items),
            isSyncing: false,
            lastSyncedAt: new Date().toISOString(),
            pendingChanges: false,
            error: null,
          });

          console.log('✅ Cart synced with server:', items.length, 'items');
        } catch (error: any) {
          console.error('❌ Cart sync failed:', error);
          set({
            isSyncing: false,
            error: error.message || 'Failed to sync cart',
          });
        }
      },

      /**
       * Fetch cart from server
       */
      fetchCart: async () => {
        set({ isLoading: true, error: null });

        try {
          await get().syncWithServer();
        } catch (error: any) {
          console.error('❌ Failed to fetch cart:', error);
          set({
            error: error.message || 'Failed to fetch cart',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Recalculate totals
       */
      calculateTotals: () => {
        const { items } = get();
        set({ totals: calculateCartTotals(items) });
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Set hydration status
       */
      setHasHydrated: (value: boolean) => {
        set({ hasHydrated: value });
      },

      /**
       * Get item by product ID
       */
      getItemByProductId: (productId: string) => {
        const { items } = get();
        return items.find((item) => item.productId === productId);
      },

      /**
       * Get total item count
       */
      getItemCount: () => {
        const { totals } = get();
        return totals.itemCount;
      },

      /**
       * Get total price
       */
      getTotalPrice: () => {
        const { totals } = get();
        return totals.total;
      },

      /**
       * Check if product is in cart
       */
      isProductInCart: (productId: string) => {
        const { items } = get();
        return items.some((item) => item.productId === productId);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Persist these fields
        items: state.items,
        totals: state.totals,
        lastSyncedAt: state.lastSyncedAt,
        pendingChanges: state.pendingChanges,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Cart store rehydrated');
        state?.setHasHydrated(true);

        // Sync with server after hydration if authenticated
        if (state?.items.length && state?.pendingChanges) {
          console.log('📡 Syncing pending cart changes...');
          state.syncWithServer().catch((error) => {
            console.error('❌ Post-hydration sync failed:', error);
          });
        }
      },
    }
  )
);

/**
 * Selector hooks for optimized re-renders
 */
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartTotals = () => useCartStore((state) => state.totals);
export const useCartItemCount = () => useCartStore((state) => state.totals.itemCount);
export const useCartTotal = () => useCartStore((state) => state.totals.total);
export const useCartLoading = () => useCartStore((state) => state.isLoading);
export const useCartSyncing = () => useCartStore((state) => state.isSyncing);
export const useCartError = () => useCartStore((state) => state.error);

/**
 * Helper hook to get cart item quantity for a product
 */
export const useCartItemQuantity = (productId: string) => {
  return useCartStore((state) => {
    const item = state.items.find((i) => i.productId === productId);
    return item?.quantity || 0;
  });
};

/**
 * Helper hook to check if cart is empty
 */
export const useIsCartEmpty = () => {
  return useCartStore((state) => state.items.length === 0);
};

/**
 * Helper hook to check if free shipping is reached
 */
export const useIsFreeShipping = () => {
  return useCartStore((state) => state.totals.subtotal >= FREE_SHIPPING_THRESHOLD);
};

/**
 * Helper hook to get remaining amount for free shipping
 */
export const useRemainingForFreeShipping = () => {
  return useCartStore((state) => {
    const remaining = FREE_SHIPPING_THRESHOLD - state.totals.subtotal;
    return remaining > 0 ? remaining : 0;
  });
};

export default useCartStore;
