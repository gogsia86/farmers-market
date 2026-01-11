// 🧠 DIVINE PATTERN: Socket.io Server Integration
// 📚 Reference: 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
// 🌾 Domain: Real-time Communication Infrastructure
// ⚡ Performance: Optimized WebSocket connections with agricultural consciousness

import { Server as HTTPServer } from "http";
import type { NextApiResponse } from "next";
import { Socket, Server as SocketIOServer } from "socket.io";

import { logger } from "@/lib/monitoring/logger";

/**
 * Socket.io event types for type safety
 */
export enum SocketEvent {
  // Connection events
  CONNECTION = "connection",
  DISCONNECT = "disconnect",
  ERROR = "error",

  // Room management
  JOIN_USER_ROOM = "join-user-room",
  JOIN_ORDER_ROOM = "join-order-room",
  JOIN_FARM_ROOM = "join-farm-room",
  LEAVE_ROOM = "leave-room",

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
 * Socket event payload interfaces
 */
export interface OrderUpdatePayload {
  orderId: string;
  status: string;
  timestamp: string;
  message?: string;
  metadata?: Record<string, any>;
}

export interface FarmUpdatePayload {
  farmId: string;
  updateType: "profile" | "product" | "status";
  data: Record<string, any>;
  timestamp: string;
}

export interface NotificationPayload {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Global Socket.io server instance
 */
let io: SocketIOServer | null = null;

/**
 * Initialize Socket.io server
 * Call this once when the server starts
 */
export function initializeSocketServer(httpServer: HTTPServer): SocketIOServer {
  if (io) {
    logger.info("⚡ Socket.io server already initialized");
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Connection handler
  io.on(SocketEvent.CONNECTION, (socket: Socket) => {
    logger.info("🌾 Client connected:", { data: socket.id });

    // Agricultural consciousness metadata
    socket.data.agriculturalConsciousness = "active";
    socket.data.connectedAt = new Date().toISOString();

    // Join user room
    socket.on(SocketEvent.JOIN_USER_ROOM, (userId: string) => {
      if (!userId) {
        socket.emit(SocketEvent.ERROR, { message: "User ID required" });
        return;
      }

      const roomName = `user:${userId}`;
      socket.join(roomName);
      socket.data.userId = userId;

      logger.info(`🌾 User ${userId} joined room: ${roomName}`);
      socket.emit("room-joined", { room: roomName, userId });
    });

    // Join order room
    socket.on(SocketEvent.JOIN_ORDER_ROOM, (orderId: string) => {
      if (!orderId) {
        socket.emit(SocketEvent.ERROR, { message: "Order ID required" });
        return;
      }

      const roomName = `order:${orderId}`;
      socket.join(roomName);

      logger.info(`📦 Joined order room: ${roomName}`);
      socket.emit("room-joined", { room: roomName, orderId });
    });

    // Join farm room
    socket.on(SocketEvent.JOIN_FARM_ROOM, (farmId: string) => {
      if (!farmId) {
        socket.emit(SocketEvent.ERROR, { message: "Farm ID required" });
        return;
      }

      const roomName = `farm:${farmId}`;
      socket.join(roomName);

      logger.info(`🌾 Joined farm room: ${roomName}`);
      socket.emit("room-joined", { room: roomName, farmId });
    });

    // Leave room
    socket.on(SocketEvent.LEAVE_ROOM, (roomName: string) => {
      socket.leave(roomName);
      logger.info(`👋 Left room: ${roomName}`);
      socket.emit("room-left", { room: roomName });
    });

    // Disconnect handler
    socket.on(SocketEvent.DISCONNECT, (reason: string) => {
      logger.info(`🌾 Client disconnected: ${socket.id} (${reason})`);
    });

    // Error handler
    socket.on(SocketEvent.ERROR, (error: Error) => {
      logger.error("⚠️ Socket error:", {
        error: error instanceof Error ? error.message : String(error),
      });
    });
  });

  logger.info(
    "⚡ Socket.io server initialized with agricultural consciousness",
  );
  return io;
}

/**
 * Get the Socket.io server instance
 */
export function getSocketServer(): SocketIOServer | null {
  return io;
}

/**
 * Emit order update to specific order room
 */
export function emitOrderUpdate(
  orderId: string,
  payload: OrderUpdatePayload,
): void {
  if (!io) {
    logger.warn("⚠️ Socket.io server not initialized");
    return;
  }

  const roomName = `order:${orderId}`;
  io.to(roomName).emit(SocketEvent.ORDER_UPDATE, {
    ...payload,
    agriculturalConsciousness: "active",
  });

  logger.info(`📦 Order update emitted to room: ${roomName}`, {
    data: payload,
  });
}

/**
 * Emit notification to specific user
 */
export function emitNotification(
  userId: string,
  payload: NotificationPayload,
): void {
  if (!io) {
    logger.warn("⚠️ Socket.io server not initialized");
    return;
  }

  const roomName = `user:${userId}`;
  io.to(roomName).emit(SocketEvent.NOTIFICATION, {
    ...payload,
    agriculturalConsciousness: "active",
  });

  logger.info(`🔔 Notification emitted to user: ${userId}`);
}

/**
 * Emit farm update to farm room
 */
export function emitFarmUpdate(
  farmId: string,
  payload: FarmUpdatePayload,
): void {
  if (!io) {
    logger.warn("⚠️ Socket.io server not initialized");
    return;
  }

  const roomName = `farm:${farmId}`;
  io.to(roomName).emit(SocketEvent.FARM_UPDATE, {
    ...payload,
    agriculturalConsciousness: "active",
  });

  logger.info(`🌾 Farm update emitted to room: ${roomName}`);
}

/**
 * Broadcast to all connected clients
 */
export function broadcast(event: string, payload: any): void {
  if (!io) {
    logger.warn("⚠️ Socket.io server not initialized");
    return;
  }

  io.emit(event, {
    ...payload,
    agriculturalConsciousness: "active",
    timestamp: new Date().toISOString(),
  });

  logger.info(`📢 Broadcast event: ${event}`);
}

/**
 * Get connection statistics
 */
export function getConnectionStats(): {
  connectedClients: number;
  rooms: string[];
  agriculturalConsciousness: string;
} {
  if (!io) {
    return {
      connectedClients: 0,
      rooms: [],
      agriculturalConsciousness: "inactive",
    };
  }

  const sockets = io.sockets.sockets;
  const rooms = Array.from(io.sockets.adapter.rooms.keys()).filter(
    (room) => !sockets.has(room), // Filter out socket IDs
  );

  return {
    connectedClients: io.engine.clientsCount,
    rooms,
    agriculturalConsciousness: "active",
  };
}

/**
 * Close Socket.io server
 */
export function closeSocketServer(): void {
  if (io) {
    io.close();
    io = null;
    logger.info("⚡ Socket.io server closed");
  }
}

/**
 * Middleware to add Socket.io to Next.js API routes
 * Usage: Add to API route that needs real-time capabilities
 */
export function withSocketIO(handler: (req: any, res: any) => Promise<void>) {
  return async (req: any, res: NextApiResponse) => {
    // Attach Socket.io to response object
    if (!res.socket) {
      throw new Error("Socket not available on response object");
    }

    const socket = res.socket as any;
    if (!socket.server) {
      throw new Error("Server not available on socket");
    }

    if (!socket.server.io) {
      logger.info("🌾 Initializing Socket.io on API route...");
      const httpServer = socket.server;
      socket.server.io = initializeSocketServer(httpServer);
    }

    return handler(req, res);
  };
}

/**
 * Type declarations for global Socket.io
 */
declare global {
  var io: SocketIOServer | undefined;
}

// Store Socket.io instance globally in development
if (process.env.NODE_ENV === "development") {
  if (!global.io) {
    global.io = io as any;
  }
}

export default {
  initializeSocketServer,
  getSocketServer,
  emitOrderUpdate,
  emitNotification,
  emitFarmUpdate,
  broadcast,
  getConnectionStats,
  closeSocketServer,
  withSocketIO,
};
