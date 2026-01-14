// 🧠 DIVINE PATTERN: Real-time Order Updates Hook
// 📚 Reference: Real-time Communication for Orders
// 🌾 Domain: Order Management with WebSocket
// ⚡ Performance: Optimized order update streaming

"use client";

import type { Order } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import { SocketEvent, useSocket } from "./useSocket";

/**
 * Order update payload interface
 */
export interface OrderUpdatePayload {
  orderId: string;
  status: string;
  timestamp: string;
  message?: string;
  metadata?: Record<string, any>;
  agriculturalConsciousness?: string;
}

/**
 * Order status change payload
 */
export interface OrderStatusChangePayload {
  orderId: string;
  previousStatus: string;
  newStatus: string;
  timestamp: string;
  updatedBy?: string;
  reason?: string;
}

/**
 * New order notification payload
 */
export interface NewOrderPayload {
  order: Partial<Order>;
  farmId: string;
  customerId: string;
  timestamp: string;
}

/**
 * Hook configuration
 */
export interface UseRealtimeOrdersConfig {
  orderId?: string;
  farmId?: string;
  userId?: string;
  autoSubscribe?: boolean;
  onOrderUpdate?: (update: OrderUpdatePayload) => void;
  onStatusChange?: (change: OrderStatusChangePayload) => void;
  onNewOrder?: (order: NewOrderPayload) => void;
}

/**
 * Hook return type
 */
export interface UseRealtimeOrdersReturn {
  isConnected: boolean;
  updates: OrderUpdatePayload[];
  latestUpdate: OrderUpdatePayload | null;
  subscribeToOrder: (orderId: string) => void;
  unsubscribeFromOrder: (orderId: string) => void;
  subscribeToFarm: (farmId: string) => void;
  clearUpdates: () => void;
}

/**
 * React hook for real-time order updates
 *
 * @example
 * ```tsx
 * // In order detail page
 * const { latestUpdate, isConnected } = useRealtimeOrders({
 *   orderId: order.id,
 *   onOrderUpdate: (update) => {
 *     toast.success(`Order ${update.status}`);
 *     refetchOrder();
 *   }
 * });
 *
 * // In farmer dashboard
 * const { updates } = useRealtimeOrders({
 *   farmId: farm.id,
 *   onNewOrder: (order) => {
 *     toast.info('New order received!');
 *     playNotificationSound();
 *   }
 * });
 * ```
 */
export function useRealtimeOrders(
  config: UseRealtimeOrdersConfig = {}
): UseRealtimeOrdersReturn {
  const {
    orderId,
    farmId,
    userId,
    autoSubscribe = true,
    onOrderUpdate,
    onStatusChange,
    onNewOrder,
  } = config;

  const { isConnected, joinRoom, leaveRoom, on, off } = useSocket({
    autoConnect: true,
  });

  const [updates, setUpdates] = useState<OrderUpdatePayload[]>([]);
  const [latestUpdate, setLatestUpdate] = useState<OrderUpdatePayload | null>(
    null
  );

  // Subscribe to order room
  const subscribeToOrder = useCallback(
    (orderIdToSubscribe: string) => {
      if (isConnected) {
        console.log("📦 Subscribing to order updates:", orderIdToSubscribe);
        joinRoom("order", orderIdToSubscribe);
      }
    },
    [isConnected, joinRoom]
  );

  // Unsubscribe from order room
  const unsubscribeFromOrder = useCallback(
    (orderIdToUnsubscribe: string) => {
      console.log("📦 Unsubscribing from order:", orderIdToUnsubscribe);
      leaveRoom(`order:${orderIdToUnsubscribe}`);
    },
    [leaveRoom]
  );

  // Subscribe to farm room (for new orders)
  const subscribeToFarm = useCallback(
    (farmIdToSubscribe: string) => {
      if (isConnected) {
        console.log("🌾 Subscribing to farm orders:", farmIdToSubscribe);
        joinRoom("farm", farmIdToSubscribe);
      }
    },
    [isConnected, joinRoom]
  );

  // Clear updates history
  const clearUpdates = useCallback(() => {
    setUpdates([]);
    setLatestUpdate(null);
  }, []);

  // Handle order updates
  useEffect(() => {
    if (!isConnected) return;

    const handleOrderUpdate = (update: OrderUpdatePayload) => {
      console.log("📦 Order update received:", update);

      setLatestUpdate(update);
      setUpdates((prev) => [...prev, update]);

      onOrderUpdate?.(update);
    };

    const handleStatusChange = (change: OrderStatusChangePayload) => {
      console.log("📦 Order status changed:", change);

      const update: OrderUpdatePayload = {
        orderId: change.orderId,
        status: change.newStatus,
        timestamp: change.timestamp,
        message: `Status changed from ${change.previousStatus} to ${change.newStatus}`,
        metadata: {
          previousStatus: change.previousStatus,
          updatedBy: change.updatedBy,
          reason: change.reason,
        },
      };

      setLatestUpdate(update);
      setUpdates((prev) => [...prev, update]);

      onStatusChange?.(change);
    };

    const handleNewOrder = (orderPayload: NewOrderPayload) => {
      console.log("📦 New order received:", orderPayload);

      const update: OrderUpdatePayload = {
        orderId: orderPayload.order.id || "",
        status: "PENDING",
        timestamp: orderPayload.timestamp,
        message: "New order received",
        metadata: {
          farmId: orderPayload.farmId,
          customerId: orderPayload.customerId,
        },
      };

      setLatestUpdate(update);
      setUpdates((prev) => [...prev, update]);

      onNewOrder?.(orderPayload);
    };

    // Register event listeners
    on(SocketEvent.ORDER_UPDATE, handleOrderUpdate);
    on(SocketEvent.ORDER_STATUS_CHANGE, handleStatusChange);
    on(SocketEvent.ORDER_NEW, handleNewOrder);

    // Cleanup
    return () => {
      off(SocketEvent.ORDER_UPDATE, handleOrderUpdate);
      off(SocketEvent.ORDER_STATUS_CHANGE, handleStatusChange);
      off(SocketEvent.ORDER_NEW, handleNewOrder);
    };
  }, [isConnected, on, off, onOrderUpdate, onStatusChange, onNewOrder]);

  // Auto-subscribe to rooms on connection
  useEffect(() => {
    if (!isConnected || !autoSubscribe) return;

    // Subscribe to user room for order notifications
    if (userId) {
      joinRoom("user", userId);
    }

    // Subscribe to specific order
    if (orderId) {
      subscribeToOrder(orderId);
    }

    // Subscribe to farm for new orders
    if (farmId) {
      subscribeToFarm(farmId);
    }

    // Cleanup
    return () => {
      if (userId) {
        leaveRoom(`user:${userId}`);
      }
      if (orderId) {
        unsubscribeFromOrder(orderId);
      }
      if (farmId) {
        leaveRoom(`farm:${farmId}`);
      }
    };
  }, [
    isConnected,
    autoSubscribe,
    orderId,
    farmId,
    userId,
    subscribeToOrder,
    subscribeToFarm,
    unsubscribeFromOrder,
    joinRoom,
    leaveRoom,
  ]);

  return {
    isConnected,
    updates,
    latestUpdate,
    subscribeToOrder,
    unsubscribeFromOrder,
    subscribeToFarm,
    clearUpdates,
  };
}

/**
 * Simplified hook for single order tracking
 */
export function useOrderTracking(orderId: string | undefined | null) {
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { latestUpdate, isConnected } = useRealtimeOrders({
    orderId: orderId || undefined,
    autoSubscribe: !!orderId,
    onOrderUpdate: (update) => {
      setOrderStatus(update.status);
      setLastUpdated(new Date(update.timestamp));
    },
  });

  return {
    orderStatus,
    lastUpdated,
    isConnected,
    latestUpdate,
  };
}

/**
 * Hook for farmer to track new orders in real-time
 */
export function useFarmOrders(farmId: string | undefined | null) {
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [newOrders, setNewOrders] = useState<NewOrderPayload[]>([]);

  const { isConnected } = useRealtimeOrders({
    farmId: farmId || undefined,
    autoSubscribe: !!farmId,
    onNewOrder: (order) => {
      setNewOrderCount((prev) => prev + 1);
      setNewOrders((prev) => [order, ...prev]);
    },
  });

  const clearNewOrders = useCallback(() => {
    setNewOrderCount(0);
    setNewOrders([]);
  }, []);

  return {
    newOrderCount,
    newOrders,
    isConnected,
    clearNewOrders,
  };
}
