// ============================================================================
// DIVINE USE ORDERS HOOK
// Agricultural Quantum Order Management with React Consciousness
// ============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  OrderWithRelations,
  OrderFilterOptions,
  PaginatedOrdersResponse,
  CreateOrderRequest,
  UpdateOrderRequest,
  CancelOrderRequest,
  OrderApiResponse,
} from "../types";
import type { OrderStatus } from "@prisma/client";

// ============================================================================
// HOOK OPTIONS
// ============================================================================

export interface UseOrdersOptions {
  initialFilters?: OrderFilterOptions;
  autoFetch?: boolean;
  refetchInterval?: number;
}

// ============================================================================
// HOOK STATE
// ============================================================================

export interface UseOrdersState {
  orders: OrderWithRelations[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  filters: OrderFilterOptions;
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  } | null;
}

// ============================================================================
// HOOK ACTIONS
// ============================================================================

export interface UseOrdersActions {
  fetchOrders: () => Promise<void>;
  setFilters: (filters: OrderFilterOptions) => void;
  setPage: (page: number) => void;
  createOrder: (request: CreateOrderRequest) => Promise<OrderWithRelations>;
  updateOrder: (
    orderId: string,
    updates: UpdateOrderRequest,
  ) => Promise<OrderWithRelations>;
  cancelOrder: (request: CancelOrderRequest) => Promise<OrderWithRelations>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
  ) => Promise<OrderWithRelations>;
  refreshOrders: () => Promise<void>;
}

// ============================================================================
// USE ORDERS HOOK
// ============================================================================

export function useOrders(
  options: UseOrdersOptions = {},
): UseOrdersState & UseOrdersActions {
  const { initialFilters = {}, autoFetch = true, refetchInterval } = options;

  // State
  const [state, setState] = useState<UseOrdersState>({
    orders: [],
    isLoading: autoFetch,
    isError: false,
    error: null,
    filters: initialFilters,
    pagination: null,
  });

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, isError: false }));

    try {
      const queryParams = new URLSearchParams();

      // Add filters to query params
      Object.entries(state.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v: any) => queryParams.append(key, String(v)));
          } else if (value instanceof Date) {
            queryParams.append(key, value.toISOString());
          } else {
            queryParams.append(key, String(value));
          }
        }
      });

      const response = await fetch(`/api/orders?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data: OrderApiResponse<PaginatedOrdersResponse> =
        await response.json();

      if (data.success && data.data) {
        setState((prev) => ({
          ...prev,
          orders: data.data!.orders,
          pagination: data.data!.pagination,
          isLoading: false,
          isError: false,
          error: null,
        }));
      } else {
        throw new Error(data.error?.message || "Failed to fetch orders");
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isError: true,
        error: error instanceof Error ? error : new Error("Unknown error"),
      }));
    }
  }, [state.filters]);

  // Set filters
  const setFilters = useCallback((filters: OrderFilterOptions) => {
    setState((prev) => ({
      ...prev,
      filters: { ...filters, page: filters.page || 1 },
    }));
  }, []);

  // Set page
  const setPage = useCallback((page: number) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, page },
    }));
  }, []);

  // Create order
  const createOrder = useCallback(
    async (request: CreateOrderRequest): Promise<OrderWithRelations> => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to create order");
      }

      const data: OrderApiResponse<OrderWithRelations> = await response.json();

      if (data.success && data.data) {
        // Refresh orders list
        await fetchOrders();
        return data.data;
      } else {
        throw new Error(data.error?.message || "Failed to create order");
      }
    },
    [fetchOrders],
  );

  // Update order
  const updateOrder = useCallback(
    async (
      orderId: string,
      updates: UpdateOrderRequest,
    ): Promise<OrderWithRelations> => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to update order");
      }

      const data: OrderApiResponse<OrderWithRelations> = await response.json();

      if (data.success && data.data) {
        // Update order in local state
        setState((prev) => ({
          ...prev,
          orders: prev.orders.map((order: any) =>
            order.id === orderId ? data.data! : order,
          ),
        }));
        return data.data;
      } else {
        throw new Error(data.error?.message || "Failed to update order");
      }
    },
    [],
  );

  // Cancel order
  const cancelOrder = useCallback(
    async (request: CancelOrderRequest): Promise<OrderWithRelations> => {
      const response = await fetch(`/api/orders/${request.orderId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to cancel order");
      }

      const data: OrderApiResponse<OrderWithRelations> = await response.json();

      if (data.success && data.data) {
        // Update order in local state
        setState((prev) => ({
          ...prev,
          orders: prev.orders.map((order: any) =>
            order.id === request.orderId ? data.data! : order,
          ),
        }));
        return data.data;
      } else {
        throw new Error(data.error?.message || "Failed to cancel order");
      }
    },
    [],
  );

  // Update order status (convenience method)
  const updateOrderStatus = useCallback(
    async (
      orderId: string,
      status: OrderStatus,
    ): Promise<OrderWithRelations> => {
      return updateOrder(orderId, { status });
    },
    [updateOrder],
  );

  // Refresh orders
  const refreshOrders = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchOrders();
    }
  }, [autoFetch, fetchOrders]);

  // Auto-fetch when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchOrders();
    }
  }, [state.filters, autoFetch, fetchOrders]);

  // Auto-refetch interval
  useEffect(() => {
    if (refetchInterval && autoFetch) {
      const interval = setInterval(() => {
        fetchOrders();
      }, refetchInterval);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [refetchInterval, autoFetch, fetchOrders]);

  return {
    ...state,
    fetchOrders,
    setFilters,
    setPage,
    createOrder,
    updateOrder,
    cancelOrder,
    updateOrderStatus,
    refreshOrders,
  };
}

// ============================================================================
// USE SINGLE ORDER HOOK
// ============================================================================

export interface UseSingleOrderOptions {
  orderId: string;
  autoFetch?: boolean;
}

export interface UseSingleOrderState {
  order: OrderWithRelations | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export interface UseSingleOrderActions {
  fetchOrder: () => Promise<void>;
  updateOrder: (updates: UpdateOrderRequest) => Promise<OrderWithRelations>;
  cancelOrder: (
    cancelledBy: string,
    cancelReason: string,
  ) => Promise<OrderWithRelations>;
  refreshOrder: () => Promise<void>;
}

export function useSingleOrder(
  options: UseSingleOrderOptions,
): UseSingleOrderState & UseSingleOrderActions {
  const { orderId, autoFetch = true } = options;

  // State
  const [state, setState] = useState<UseSingleOrderState>({
    order: null,
    isLoading: autoFetch,
    isError: false,
    error: null,
  });

  // Fetch single order
  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    setState((prev) => ({ ...prev, isLoading: true, isError: false }));

    try {
      const response = await fetch(`/api/orders/${orderId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }

      const data: OrderApiResponse<OrderWithRelations> = await response.json();

      if (data.success && data.data) {
        setState({
          order: data.data,
          isLoading: false,
          isError: false,
          error: null,
        });
      } else {
        throw new Error(data.error?.message || "Failed to fetch order");
      }
    } catch (error) {
      setState({
        order: null,
        isLoading: false,
        isError: true,
        error: error instanceof Error ? error : new Error("Unknown error"),
      });
    }
  }, [orderId]);

  // Update order
  const updateOrder = useCallback(
    async (updates: UpdateOrderRequest): Promise<OrderWithRelations> => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to update order");
      }

      const data: OrderApiResponse<OrderWithRelations> = await response.json();

      if (data.success && data.data) {
        setState((prev) => ({
          ...prev,
          order: data.data!,
        }));
        return data.data;
      } else {
        throw new Error(data.error?.message || "Failed to update order");
      }
    },
    [orderId],
  );

  // Cancel order
  const cancelOrder = useCallback(
    async (
      cancelledBy: string,
      cancelReason: string,
    ): Promise<OrderWithRelations> => {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          cancelledBy,
          cancelReason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to cancel order");
      }

      const data: OrderApiResponse<OrderWithRelations> = await response.json();

      if (data.success && data.data) {
        setState((prev) => ({
          ...prev,
          order: data.data!,
        }));
        return data.data;
      } else {
        throw new Error(data.error?.message || "Failed to cancel order");
      }
    },
    [orderId],
  );

  // Refresh order
  const refreshOrder = useCallback(async () => {
    await fetchOrder();
  }, [fetchOrder]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && orderId) {
      fetchOrder();
    }
  }, [autoFetch, orderId, fetchOrder]);

  return {
    ...state,
    fetchOrder,
    updateOrder,
    cancelOrder,
    refreshOrder,
  };
}

// ============================================================================
// DIVINE ORDER HOOKS - AGRICULTURAL CONSCIOUSNESS
// Complete order management with quantum React state synchronization
// ============================================================================
