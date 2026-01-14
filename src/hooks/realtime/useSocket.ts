// 🧠 DIVINE PATTERN: Socket.io Client Hook
// 📚 Reference: Real-time Communication Client
// 🌾 Domain: WebSocket Client Management
// ⚡ Performance: Optimized connection lifecycle with React

"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

/**
 * Socket.io event types for type safety
 */
export enum SocketEvent {
  // Connection events
  CONNECTION = "connection",
  CONNECTED = "connected",
  DISCONNECT = "disconnect",
  ERROR = "error",

  // Room management
  JOIN_USER_ROOM = "join-user-room",
  JOIN_ORDER_ROOM = "join-order-room",
  JOIN_FARM_ROOM = "join-farm-room",
  LEAVE_ROOM = "leave-room",
  ROOM_JOINED = "room-joined",
  ROOM_LEFT = "room-left",

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
 * Socket connection status
 */
export type SocketStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error"
  | "reconnecting";

/**
 * Socket hook configuration
 */
export interface UseSocketConfig {
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Socket hook return type
 */
export interface UseSocketReturn {
  socket: Socket | null;
  status: SocketStatus;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
  joinRoom: (room: string, id: string) => void;
  leaveRoom: (room: string) => void;
}

/**
 * React hook for Socket.io client
 *
 * @example
 * ```tsx
 * const { socket, isConnected, joinRoom } = useSocket({
 *   autoConnect: true,
 *   onConnect: () => console.log('Connected!'),
 * });
 *
 * useEffect(() => {
 *   if (isConnected && userId) {
 *     joinRoom('user', userId);
 *   }
 * }, [isConnected, userId]);
 * ```
 */
export function useSocket(config: UseSocketConfig = {}): UseSocketReturn {
  const {
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
    onConnect,
    onDisconnect,
    onError,
  } = config;

  const [status, setStatus] = useState<SocketStatus>("disconnected");
  const socketRef = useRef<Socket | null>(null);

  // Initialize Socket.io client
  useEffect(() => {
    // Get WebSocket URL from environment or default to current host
    const socketUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3001");

    // Create socket instance
    const socket = io(socketUrl, {
      autoConnect,
      reconnection,
      reconnectionAttempts,
      reconnectionDelay,
      transports: ["websocket", "polling"],
      upgrade: true,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("🌾 Socket.io connected:", socket.id);
      setStatus("connected");
      onConnect?.();
    });

    socket.on(SocketEvent.CONNECTED, (data) => {
      console.log("🌾 Welcome message received:", data);
    });

    socket.on("disconnect", (reason) => {
      console.log("🌾 Socket.io disconnected:", reason);
      setStatus("disconnected");
      onDisconnect?.(reason);
    });

    socket.on("connect_error", (error) => {
      console.error("⚠️ Socket.io connection error:", error);
      setStatus("error");
      onError?.(error);
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
      setStatus("reconnecting");
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      setStatus("connected");
    });

    socket.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed");
      setStatus("error");
    });

    // Connect if autoConnect is true
    if (autoConnect) {
      setStatus("connecting");
    }

    // Cleanup on unmount
    return () => {
      console.log("🌾 Cleaning up socket connection");
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [autoConnect, reconnection, reconnectionAttempts, reconnectionDelay]);

  // Connect function
  const connect = () => {
    if (socketRef.current && !socketRef.current.connected) {
      console.log("🌾 Manually connecting socket...");
      setStatus("connecting");
      socketRef.current.connect();
    }
  };

  // Disconnect function
  const disconnect = () => {
    if (socketRef.current && socketRef.current.connected) {
      console.log("🌾 Manually disconnecting socket...");
      socketRef.current.disconnect();
      setStatus("disconnected");
    }
  };

  // Emit event
  const emit = (event: string, data?: any) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn("⚠️ Socket not connected, cannot emit event:", event);
    }
  };

  // Listen to event
  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  // Stop listening to event
  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  };

  // Join a room (user, order, or farm)
  const joinRoom = (roomType: string, id: string) => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.warn("⚠️ Socket not connected, cannot join room");
      return;
    }

    const eventMap: Record<string, string> = {
      user: SocketEvent.JOIN_USER_ROOM,
      order: SocketEvent.JOIN_ORDER_ROOM,
      farm: SocketEvent.JOIN_FARM_ROOM,
    };

    const event = eventMap[roomType];
    if (!event) {
      console.error("⚠️ Invalid room type:", roomType);
      return;
    }

    console.log(`🌾 Joining ${roomType} room:`, id);
    socketRef.current.emit(event, id);
  };

  // Leave a room
  const leaveRoom = (room: string) => {
    if (socketRef.current && socketRef.current.connected) {
      console.log("👋 Leaving room:", room);
      socketRef.current.emit(SocketEvent.LEAVE_ROOM, room);
    }
  };

  return {
    socket: socketRef.current,
    status,
    isConnected: status === "connected",
    connect,
    disconnect,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
  };
}

/**
 * Hook to automatically join user room on connection
 */
export function useUserRoom(userId: string | undefined | null) {
  const { isConnected, joinRoom, leaveRoom } = useSocket();

  useEffect(() => {
    if (isConnected && userId) {
      joinRoom("user", userId);

      return () => {
        leaveRoom(`user:${userId}`);
      };
    }
    return undefined;
  }, [isConnected, userId, joinRoom, leaveRoom]);
}

/**
 * Hook to automatically join order room on connection
 */
export function useOrderRoom(orderId: string | undefined | null) {
  const { isConnected, joinRoom, leaveRoom } = useSocket();

  useEffect(() => {
    if (isConnected && orderId) {
      joinRoom("order", orderId);

      return () => {
        leaveRoom(`order:${orderId}`);
      };
    }
    return undefined;
  }, [isConnected, orderId, joinRoom, leaveRoom]);
}

/**
 * Hook to automatically join farm room on connection
 */
export function useFarmRoom(farmId: string | undefined | null) {
  const { isConnected, joinRoom, leaveRoom } = useSocket();

  useEffect(() => {
    if (isConnected && farmId) {
      joinRoom("farm", farmId);

      return () => {
        leaveRoom(`farm:${farmId}`);
      };
    }
    return undefined;
  }, [isConnected, farmId, joinRoom, leaveRoom]);
}
