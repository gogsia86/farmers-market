"use client";

// 🛒 USE CART HOOK - Divine Cart State Management
// Client-side hook for cart operations with optimistic updates and local storage sync

import {
  addToCartAction,
  clearCartAction,
  clearFarmCartAction,
  getCartCountAction,
  getCartSummaryAction,
  mergeGuestCartAction,
  removeFromCartAction,
  syncCartPricesAction,
  updateCartItemAction,
  validateCartAction,
} from "@/app/actions/cart.actions";
import { useToast } from "@/hooks/use-toast";
import type {
  AddToCartRequest,
  CartSummary,
  CartValidationResult,
} from "@/lib/services/cart.service";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

import { logger } from '@/lib/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

interface UseCartOptions {
  autoSync?: boolean;
  syncInterval?: number; // milliseconds
}

interface CartState {
  summary: CartSummary | null;
  count: number;
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;
}

interface GuestCartItem {
  productId: string;
  quantity: number;
}

// ============================================================================
// LOCAL STORAGE HELPERS
// ============================================================================

const GUEST_CART_KEY = "farmers-market-guest-cart";

function getGuestCart(): GuestCartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setGuestCart(items: GuestCartItem[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch (error) {
    logger.error("Failed to save guest cart:", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function clearGuestCart(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch (error) {
    logger.error("Failed to clear guest cart:", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// ============================================================================
// USE CART HOOK
// ============================================================================

export function useCart(options: UseCartOptions = {}) {
  const { autoSync = true, syncInterval = 30000 } = options;
  const { data: session, status: sessionStatus } = useSession();
  const userId = session?.user?.id;
  const { toast } = useToast();

  // Prevent hydration mismatch by deferring localStorage access
  const [mounted, setMounted] = useState(false);

  const [state, setState] = useState<CartState>({
    summary: null,
    count: 0,
    isLoading: false,
    isValidating: false,
    error: null,
  });

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // ==========================================================================
  // CART LOADING
  // ==========================================================================

  const loadCart = useCallback(async () => {
    // Don't access localStorage until mounted to prevent hydration mismatch
    if (!mounted) return;

    // Wait for session to load
    if (sessionStatus === "loading") {
      return;
    }

    if (!userId) {
      // Load guest cart from local storage
      const guestItems = getGuestCart();
      setState((prev) => ({
        ...prev,
        count: guestItems.reduce((sum, item) => sum + item.quantity, 0),
        isLoading: false,
        summary: null,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [summaryResponse, countResponse] = await Promise.all([
        getCartSummaryAction(),
        getCartCountAction(),
      ]);

      if (summaryResponse.success && countResponse.success) {
        setState({
          summary: summaryResponse.data || null,
          count: countResponse.data || 0,
          isLoading: false,
          isValidating: false,
          error: null,
        });
      } else {
        // Log error but don't throw - fail gracefully
        logger.error("Failed to load cart", {
          summaryError: summaryResponse.error,
          countError: countResponse.error,
          userId,
        });

        // Set safe defaults instead of showing error
        setState({
          summary: null,
          count: 0,
          isLoading: false,
          isValidating: false,
          error: null, // Don't show error to user
        });
      }
    } catch (error) {
      // Log error but set safe defaults - don't show error to user
      logger.error("Cart load exception", {
        error: error instanceof Error ? error.message : String(error),
        userId,
      });

      setState({
        summary: null,
        count: 0,
        isLoading: false,
        isValidating: false,
        error: null, // Don't show error to user, just show empty cart
      });
    }
  }, [userId, mounted, sessionStatus]);

  // ==========================================================================
  // CART OPERATIONS
  // ==========================================================================

  const addToCart = useCallback(
    async (request: Omit<AddToCartRequest, "userId">) => {
      if (!userId) {
        // Guest cart - add to local storage
        const guestItems = getGuestCart();
        const existingIndex = guestItems.findIndex(
          (item) => item.productId === request.productId
        );

        if (existingIndex >= 0 && guestItems[existingIndex]) {
          guestItems[existingIndex].quantity += request.quantity;
        } else {
          guestItems.push({
            productId: request.productId,
            quantity: request.quantity,
          });
        }

        setGuestCart(guestItems);
        setState((prev) => ({
          ...prev,
          count: guestItems.reduce((sum, item) => sum + item.quantity, 0),
        }));

        toast({
          title: "Added to cart",
          description: "Item added to your cart. Sign in to checkout.",
        });

        return { success: true };
      }

      // Optimistic update
      setState((prev) => ({
        ...prev,
        count: prev.count + request.quantity,
      }));

      const response = await addToCartAction(request);

      if (response.success) {
        // Reload cart to get accurate data
        await loadCart();

        toast({
          title: "Added to cart",
          description: response.data?.message || "Item added to your cart",
        });
      } else {
        // Revert optimistic update
        setState((prev) => ({
          ...prev,
          count: Math.max(0, prev.count - request.quantity),
        }));

        toast({
          title: "Failed to add to cart",
          description: response.error?.message || "Please try again",
          variant: "destructive",
        });
      }

      return response;
    },
    [userId, loadCart, toast]
  );

  const updateCartItem = useCallback(
    async (itemId: string, quantity: number) => {
      if (!userId) return { success: false };

      // Optimistic update
      setState((prev) => {
        if (!prev.summary) return prev;

        const oldItem = prev.summary.items.find((item) => item.id === itemId);
        if (!oldItem) return prev;

        const quantityDiff = quantity - oldItem.quantity.toNumber();

        return {
          ...prev,
          count: Math.max(0, prev.count + quantityDiff),
        };
      });

      const response = await updateCartItemAction({ itemId, quantity });

      if (response.success) {
        await loadCart();

        toast({
          title: "Cart updated",
          description: "Quantity updated successfully",
        });
      } else {
        // Revert optimistic update
        await loadCart();

        toast({
          title: "Failed to update cart",
          description: response.error?.message || "Please try again",
          variant: "destructive",
        });
      }

      return response;
    },
    [userId, loadCart, toast]
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      if (!userId) return { success: false };

      // Optimistic update
      setState((prev) => {
        if (!prev.summary) return prev;

        const item = prev.summary.items.find((item) => item.id === itemId);
        if (!item) return prev;

        return {
          ...prev,
          count: Math.max(0, prev.count - item.quantity.toNumber()),
        };
      });

      const response = await removeFromCartAction(itemId);

      if (response.success) {
        await loadCart();

        toast({
          title: "Removed from cart",
          description: "Item removed successfully",
        });
      } else {
        // Revert optimistic update
        await loadCart();

        toast({
          title: "Failed to remove item",
          description: response.error?.message || "Please try again",
          variant: "destructive",
        });
      }

      return response;
    },
    [userId, loadCart, toast]
  );

  const clearCart = useCallback(async () => {
    if (!userId) {
      clearGuestCart();
      setState((prev) => ({ ...prev, count: 0, summary: null }));
      toast({
        title: "Cart cleared",
        description: "All items removed from your cart",
      });
      return { success: true };
    }

    const response = await clearCartAction();

    if (response.success) {
      setState({
        summary: null,
        count: 0,
        isLoading: false,
        isValidating: false,
        error: null,
      });

      toast({
        title: "Cart cleared",
        description: "All items removed from your cart",
      });
    } else {
      toast({
        title: "Failed to clear cart",
        description: response.error?.message || "Please try again",
        variant: "destructive",
      });
    }

    return response;
  }, [userId, toast]);

  const clearFarmCart = useCallback(
    async (farmId: string) => {
      if (!userId) return { success: false };

      const response = await clearFarmCartAction(farmId);

      if (response.success) {
        await loadCart();

        toast({
          title: "Farm items removed",
          description: "All items from this farm removed from your cart",
        });
      } else {
        toast({
          title: "Failed to remove items",
          description: response.error?.message || "Please try again",
          variant: "destructive",
        });
      }

      return response;
    },
    [userId, loadCart, toast]
  );

  // ==========================================================================
  // CART VALIDATION & SYNC
  // ==========================================================================

  const validateCart = useCallback(async (): Promise<CartValidationResult | null> => {
    if (!userId) return null;

    setState((prev) => ({ ...prev, isValidating: true }));

    const response = await validateCartAction();

    setState((prev) => ({ ...prev, isValidating: false }));

    if (response.success && response.data) {
      if (!response.data.isValid) {
        toast({
          title: "Cart validation issues",
          description: `Found ${response.data.errors.length} issue(s) with your cart`,
          variant: "destructive",
        });
      }

      if (response.data.warnings.length > 0) {
        toast({
          title: "Cart notices",
          description: `${response.data.warnings.length} item(s) have price or stock changes`,
        });
      }

      return response.data;
    }

    return null;
  }, [userId, toast]);

  const syncPrices = useCallback(async () => {
    if (!userId) return { success: false };

    const response = await syncCartPricesAction();

    if (response.success) {
      await loadCart();

      if (response.data?.updatedCount > 0) {
        toast({
          title: "Prices updated",
          description: response.data.message,
        });
      }
    }

    return response;
  }, [userId, loadCart, toast]);

  const mergeGuestCart = useCallback(async () => {
    if (!userId || !mounted) return;

    const guestItems = getGuestCart();
    if (guestItems.length === 0) return;

    const response = await mergeGuestCartAction(guestItems);

    if (response.success) {
      clearGuestCart();
      await loadCart();

      toast({
        title: "Cart merged",
        description: "Your items have been added to your cart",
      });
    }
  }, [userId, mounted, loadCart, toast]);

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  // Load cart on mount and when userId changes
  useEffect(() => {
    if (mounted && sessionStatus !== "loading") {
      loadCart();
    }
  }, [loadCart, mounted, sessionStatus]);

  // Merge guest cart on login
  useEffect(() => {
    if (userId && mounted && sessionStatus === "authenticated") {
      mergeGuestCart();
    }
  }, [userId, mounted, sessionStatus, mergeGuestCart]);

  // Auto-sync cart at intervals
  useEffect(() => {
    if (!userId || !autoSync || !mounted) return;

    const interval = setInterval(() => {
      loadCart();
    }, syncInterval);

    return () => clearInterval(interval);
  }, [userId, autoSync, syncInterval, mounted, loadCart]);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // State
    cart: state.summary,
    count: state.count,
    isLoading: state.isLoading,
    isValidating: state.isValidating,
    error: state.error,
    isEmpty: state.count === 0,

    // Operations
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    clearFarmCart,

    // Utilities
    validateCart,
    syncPrices,
    refreshCart: loadCart,
  };
}
