// 🧠 DIVINE PATTERN: Socket.io Emit Helpers for API Routes
// 📚 Reference: Real-time Communication Utilities
// 🌾 Domain: Server-side WebSocket Event Emission
// ⚡ Performance: Type-safe event emitters with agricultural consciousness

import { logger } from "@/lib/monitoring/logger";
import type { Order } from "@prisma/client";

/**
 * Socket.io event types (server-side)
 */
export enum SocketEvent {
  // Order events
  ORDER_UPDATE = "order-update",
  ORDER_STATUS_CHANGE = "order-status-change",
  ORDER_NEW = "order-new",

  // Farm events
  FARM_UPDATE = "farm-update",
  PRODUCT_UPDATE = "product-update",

  // Notification events
  NOTIFICATION = "notification",

  // Agricultural events
  SEASONAL_UPDATE = "seasonal-update",
  HARVEST_ALERT = "harvest-alert",
}

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
 * Notification payload interface
 */
export interface NotificationPayload {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  actionUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Farm update payload interface
 */
export interface FarmUpdatePayload {
  farmId: string;
  updateType: "profile" | "product" | "status";
  data: Record<string, any>;
  timestamp: string;
}

/**
 * Product update payload interface
 */
export interface ProductUpdatePayload {
  productId: string;
  farmId: string;
  updateType: "created" | "updated" | "deleted" | "stock";
  data: Record<string, any>;
  timestamp: string;
}

/**
 * Get Socket.io instance from global context
 */
function getSocketIO() {
  if (typeof global.getSocketIO === "function") {
    return global.getSocketIO();
  }
  return (global as any).io || null;
}

/**
 * Check if Socket.io is initialized
 */
export function isSocketIOInitialized(): boolean {
  return getSocketIO() !== null;
}

/**
 * Emit order update to specific order room
 */
export function emitOrderUpdate(
  orderId: string,
  payload: Omit<
    OrderUpdatePayload,
    "orderId" | "timestamp" | "agriculturalConsciousness"
  >,
): void {
  const io = getSocketIO();

  if (!io) {
    logger.warn("⚠️ Socket.io not initialized, cannot emit order update", {
      orderId,
    });
    return;
  }

  const fullPayload: OrderUpdatePayload = {
    orderId,
    ...payload,
    timestamp: new Date().toISOString(),
    agriculturalConsciousness: "active",
  };

  const roomName = `order:${orderId}`;
  io.to(roomName).emit(SocketEvent.ORDER_UPDATE, fullPayload);

  logger.info(`📦 Order update emitted to room: ${roomName}`, {
    data: fullPayload,
  });
}

/**
 * Emit order status change
 */
export function emitOrderStatusChange(payload: OrderStatusChangePayload): void {
  const io = getSocketIO();

  if (!io) {
    logger.warn("⚠️ Socket.io not initialized, cannot emit status change", {
      orderId: payload.orderId,
    });
    return;
  }

  // Emit to order room
  const orderRoom = `order:${payload.orderId}`;
  io.to(orderRoom).emit(SocketEvent.ORDER_STATUS_CHANGE, payload);

  // Also emit as general order update
  emitOrderUpdate(payload.orderId, {
    status: payload.newStatus,
    message: `Status changed from ${payload.previousStatus} to ${payload.newStatus}`,
    metadata: {
      previousStatus: payload.previousStatus,
      updatedBy: payload.updatedBy,
      reason: payload.reason,
    },
  });

  logger.info(`📦 Order status change emitted: ${payload.orderId}`, {
    data: payload,
  });
}

/**
 * Emit new order notification to farm
 */
export function emitNewOrder(farmId: string, order: Partial<Order>): void {
  const io = getSocketIO();

  if (!io) {
    logger.warn("⚠️ Socket.io not initialized, cannot emit new order", {
      farmId,
    });
    return;
  }

  const payload = {
    order,
    farmId,
    customerId: order.customerId,
    timestamp: new Date().toISOString(),
    agriculturalConsciousness: "active",
  };

  const farmRoom = `farm:${farmId}`;
  io.to(farmRoom).emit(SocketEvent.ORDER_NEW, payload);

  logger.info(`📦 New order emitted to farm room: ${farmRoom}`, {
    data: { orderId: order.id, farmId },
  });
}

/**
 * Emit notification to specific user
 */
export function emitNotification(
  userId: string,
  notification: Omit<NotificationPayload, "userId" | "timestamp">,
): void {
  const io = getSocketIO();

  if (!io) {
    logger.warn("⚠️ Socket.io not initialized, cannot emit notification", {
      userId,
    });
    return;
  }

  const fullPayload: NotificationPayload = {
    ...notification,
    userId,
    timestamp: new Date().toISOString(),
  };

  const userRoom = `user:${userId}`;
  io.to(userRoom).emit(SocketEvent.NOTIFICATION, fullPayload);

  logger.info(`🔔 Notification emitted to user: ${userId}`, {
    data: { type: notification.type, title: notification.title },
  });
}

/**
 * Emit farm update to farm room
 */
export function emitFarmUpdate(
  farmId: string,
  updateType: FarmUpdatePayload["updateType"],
  data: Record<string, any>,
): void {
  const io = getSocketIO();

  if (!io) {
    logger.warn("⚠️ Socket.io not initialized, cannot emit farm update", {
      farmId,
    });
    return;
  }

  const payload: FarmUpdatePayload = {
    farmId,
    updateType,
    data,
    timestamp: new Date().toISOString(),
  };

  const farmRoom = `farm:${farmId}`;
  io.to(farmRoom).emit(SocketEvent.FARM_UPDATE, payload);

  logger.info(`🌾 Farm update emitted to room: ${farmRoom}`, {
    data: { updateType },
  });
}

/**
 * Emit product update to farm room
 */
export function emitProductUpdate(
  productId: string,
  farmId: string,
  updateType: ProductUpdatePayload["updateType"],
  data: Record<string, any>,
): void {
  const io = getSocketIO();

  if (!io) {
    logger.warn("⚠️ Socket.io not initialized, cannot emit product update", {
      productId,
      farmId,
    });
    return;
  }

  const payload: ProductUpdatePayload = {
    productId,
    farmId,
    updateType,
    data,
    timestamp: new Date().toISOString(),
  };

  const farmRoom = `farm:${farmId}`;
  io.to(farmRoom).emit(SocketEvent.PRODUCT_UPDATE, payload);

  logger.info(`🌾 Product update emitted to room: ${farmRoom}`, {
    data: { productId, updateType },
  });
}

/**
 * Emit seasonal update to all connected users
 */
export function emitSeasonalUpdate(
  season: string,
  message: string,
  data?: Record<string, any>,
): void {
  const io = getSocketIO();

  if (!io) {
    logger.warn("⚠️ Socket.io not initialized, cannot emit seasonal update");
    return;
  }

  const payload = {
    season,
    message,
    data,
    timestamp: new Date().toISOString(),
    agriculturalConsciousness: "active",
  };

  io.emit(SocketEvent.SEASONAL_UPDATE, payload);

  logger.info("🌾 Seasonal update broadcast to all users", {
    data: { season, message },
  });
}

/**
 * Emit harvest alert to farm
 */
export function emitHarvestAlert(
  farmId: string,
  cropId: string,
  message: string,
  metadata?: Record<string, any>,
): void {
  const io = getSocketIO();

  if (!io) {
    logger.warn("⚠️ Socket.io not initialized, cannot emit harvest alert", {
      farmId,
    });
    return;
  }

  const payload = {
    farmId,
    cropId,
    message,
    metadata,
    timestamp: new Date().toISOString(),
    priority: "HIGH" as const,
    agriculturalConsciousness: "active",
  };

  const farmRoom = `farm:${farmId}`;
  io.to(farmRoom).emit(SocketEvent.HARVEST_ALERT, payload);

  // Also send as notification to farm owner
  // (Assuming farm owner would join user room)
  logger.info(`🌾 Harvest alert emitted to farm: ${farmId}`, {
    data: { cropId, message },
  });
}

/**
 * Broadcast event to all connected clients
 */
export function broadcastToAll(event: string, payload: any): void {
  const io = getSocketIO();

  if (!io) {
    logger.warn("⚠️ Socket.io not initialized, cannot broadcast", { event });
    return;
  }

  io.emit(event, {
    ...payload,
    timestamp: new Date().toISOString(),
    agriculturalConsciousness: "active",
  });

  logger.info(`📢 Broadcast event: ${event}`);
}

/**
 * Get connection statistics
 */
export function getConnectionStats(): {
  connectedClients: number;
  rooms: string[];
  initialized: boolean;
  agriculturalConsciousness: string;
} {
  const io = getSocketIO();

  if (!io) {
    return {
      connectedClients: 0,
      rooms: [],
      initialized: false,
      agriculturalConsciousness: "inactive",
    };
  }

  try {
    const sockets = io.sockets.sockets;
    const rooms = Array.from(io.sockets.adapter.rooms.keys()).filter(
      (room: unknown) => !sockets.has(room as string), // Filter out socket IDs
    ) as string[];

    return {
      connectedClients: io.engine.clientsCount,
      rooms,
      initialized: true,
      agriculturalConsciousness: "active",
    };
  } catch (error) {
    logger.error("Failed to get connection stats", { error });
    return {
      connectedClients: 0,
      rooms: [],
      initialized: true,
      agriculturalConsciousness: "error",
    };
  }
}

/**
 * Helper to emit multiple events in sequence
 */
export function emitBatch(
  emissions: Array<{
    type: "order" | "notification" | "farm" | "product";
    data: any;
  }>,
): void {
  for (const emission of emissions) {
    try {
      switch (emission.type) {
        case "order":
          if (emission.data.orderId && emission.data.status) {
            emitOrderUpdate(emission.data.orderId, emission.data);
          }
          break;
        case "notification":
          if (emission.data.userId) {
            emitNotification(emission.data.userId, emission.data);
          }
          break;
        case "farm":
          if (emission.data.farmId) {
            emitFarmUpdate(
              emission.data.farmId,
              emission.data.updateType,
              emission.data.data,
            );
          }
          break;
        case "product":
          if (emission.data.productId && emission.data.farmId) {
            emitProductUpdate(
              emission.data.productId,
              emission.data.farmId,
              emission.data.updateType,
              emission.data.data,
            );
          }
          break;
      }
    } catch (error) {
      logger.error("Failed to emit in batch", {
        error,
        emission: emission.type,
      });
    }
  }
}

// Type declarations for global Socket.io
declare global {
  var getSocketIO: (() => any) | undefined;
}

export default {
  isSocketIOInitialized,
  emitOrderUpdate,
  emitOrderStatusChange,
  emitNewOrder,
  emitNotification,
  emitFarmUpdate,
  emitProductUpdate,
  emitSeasonalUpdate,
  emitHarvestAlert,
  broadcastToAll,
  getConnectionStats,
  emitBatch,
};
