// 🧠 DIVINE PATTERN: Order Updates Real-time Hook
// 📚 Reference: 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
// 🌾 Domain: Real-time Order Tracking
// ⚡ Performance: Optimized WebSocket connection with agricultural consciousness

'use client';

import type { OrderUpdatePayload } from '@/lib/realtime/socket-server';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseOrderUpdatesOptions {
  orderId: string;
  userId?: string;
  enabled?: boolean;
  onUpdate?: (update: OrderUpdatePayload) => void;
  onError?: (error: Error) => void;
}

interface UseOrderUpdatesReturn {
  updates: OrderUpdatePayload[];
  isConnected: boolean;
  lastUpdate: OrderUpdatePayload | null;
  error: Error | null;
  reconnect: () => void;
}

/**
 * Hook for real-time order updates
 *
 * Provides WebSocket connection to receive live order status changes
 * with agricultural consciousness and automatic reconnection.
 *
 * @example
 * ```tsx
 * const { updates, isConnected, lastUpdate } = useOrderUpdates({
 *   orderId: 'order_123',
 *   userId: 'user_456',
 *   onUpdate: (update) => {
 *     console.log('Order updated:', update);
 *   }
 * });
 * ```
 */
export function useOrderUpdates({
  orderId,
  userId,
  enabled = true,
  onUpdate,
  onError,
}: UseOrderUpdatesOptions): UseOrderUpdatesReturn {
  const [updates, setUpdates] = useState<OrderUpdatePayload[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<OrderUpdatePayload | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!enabled || !orderId) return;

    const socketUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create socket connection
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = socket;

    // Connection established
    socket.on('connect', () => {
      console.log('🌾 Socket connected:', socket.id);
      setIsConnected(true);
      setError(null);

      // Join order room
      socket.emit('join-order-room', orderId);

      // Join user room if userId provided
      if (userId) {
        socket.emit('join-user-room', userId);
      }
    });

    // Room joined confirmation
    socket.on('room-joined', (data: { room: string; orderId?: string }) => {
      console.log('📦 Joined room:', data.room);
    });

    // Order update received
    socket.on('order-update', (update: OrderUpdatePayload) => {
      console.log('📦 Order update received:', update);

      setUpdates((prev) => [...prev, update]);
      setLastUpdate(update);

      // Call custom update handler
      if (onUpdate) {
        try {
          onUpdate(update);
        } catch (err) {
          console.error('Error in onUpdate callback:', err);
        }
      }
    });

    // Order status change
    socket.on('order-status-change', (data: OrderUpdatePayload) => {
      console.log('📦 Order status changed:', data);

      const update: OrderUpdatePayload = {
        ...data,
        message: data.message || `Order status changed to ${data.status}`,
      };

      setUpdates((prev) => [...prev, update]);
      setLastUpdate(update);

      if (onUpdate) {
        try {
          onUpdate(update);
        } catch (err) {
          console.error('Error in onUpdate callback:', err);
        }
      }
    });

    // Notification received
    socket.on('notification', (notification: any) => {
      console.log('🔔 Notification received:', notification);

      // Convert notification to order update format
      if (notification.type?.includes('order')) {
        const update: OrderUpdatePayload = {
          orderId: notification.metadata?.orderId || orderId,
          status: notification.metadata?.status || 'UNKNOWN',
          timestamp: notification.timestamp,
          message: notification.message,
          metadata: notification.metadata,
        };

        setUpdates((prev) => [...prev, update]);
        setLastUpdate(update);
      }
    });

    // Disconnection
    socket.on('disconnect', (reason: string) => {
      console.log('🌾 Socket disconnected:', reason);
      setIsConnected(false);

      // Attempt to reconnect if disconnected unexpectedly
      if (reason === 'io server disconnect') {
        // Server disconnected, manually reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          socket.connect();
        }, 1000);
      }
    });

    // Connection error
    socket.on('connect_error', (err: Error) => {
      console.error('⚠️ Socket connection error:', err);
      setError(err);
      setIsConnected(false);

      if (onError) {
        try {
          onError(err);
        } catch (callbackErr) {
          console.error('Error in onError callback:', callbackErr);
        }
      }
    });

    // Generic error
    socket.on('error', (err: Error) => {
      console.error('⚠️ Socket error:', err);
      setError(err);

      if (onError) {
        try {
          onError(err);
        } catch (callbackErr) {
          console.error('Error in onError callback:', callbackErr);
        }
      }
    });

    // Cleanup on unmount
    return () => {
      console.log('🌾 Cleaning up socket connection');

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (socket) {
        socket.emit('leave-room', `order:${orderId}`);
        if (userId) {
          socket.emit('leave-room', `user:${userId}`);
        }
        socket.disconnect();
      }
    };
  }, [orderId, userId, enabled, onUpdate, onError]);

  // Manual reconnect function
  const reconnect = () => {
    if (socketRef.current) {
      console.log('🌾 Manually reconnecting socket...');
      socketRef.current.connect();
    }
  };

  return {
    updates,
    isConnected,
    lastUpdate,
    error,
    reconnect,
  };
}

/**
 * Hook for real-time notifications (user-specific)
 */
export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const socketUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-user-room', userId);
    });

    socket.on('notification', (notification: any) => {
      console.log('🔔 Notification received:', notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      if (socket) {
        socket.emit('leave-room', `user:${userId}`);
        socket.disconnect();
      }
    };
  }, [userId]);

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    clearAll,
  };
}

/**
 * Hook for farm real-time updates
 */
export function useFarmUpdates(farmId: string | undefined) {
  const [updates, setUpdates] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!farmId) return;

    const socketUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-farm-room', farmId);
    });

    socket.on('farm-update', (update: any) => {
      console.log('🌾 Farm update received:', update);
      setUpdates((prev) => [update, ...prev]);
    });

    socket.on('product-update', (update: any) => {
      console.log('🌾 Product update received:', update);
      setUpdates((prev) => [update, ...prev]);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.emit('leave-room', `farm:${farmId}`);
      socket.disconnect();
    };
  }, [farmId]);

  return {
    updates,
    isConnected,
  };
}
