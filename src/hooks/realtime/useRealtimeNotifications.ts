// 🧠 DIVINE PATTERN: Real-time Notifications Hook
// 📚 Reference: Real-time Communication for Notifications
// 🌾 Domain: Notification Management with WebSocket
// ⚡ Performance: Optimized notification streaming

"use client";

import { useCallback, useEffect, useState } from "react";
import { SocketEvent, useSocket } from "./useSocket";

/**
 * Notification type enum
 */
export enum NotificationType {
  ORDER = "ORDER",
  PAYMENT = "PAYMENT",
  FARM = "FARM",
  PRODUCT = "PRODUCT",
  HARVEST = "HARVEST",
  SEASONAL = "SEASONAL",
  SYSTEM = "SYSTEM",
  PROMOTIONAL = "PROMOTIONAL",
}

/**
 * Notification priority
 */
export enum NotificationPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

/**
 * Notification payload interface
 */
export interface NotificationPayload {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  priority?: NotificationPriority;
  read?: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  agriculturalConsciousness?: string;
}

/**
 * Hook configuration
 */
export interface UseRealtimeNotificationsConfig {
  userId?: string;
  autoSubscribe?: boolean;
  playSound?: boolean;
  maxNotifications?: number;
  onNotification?: (notification: NotificationPayload) => void;
  onNewNotification?: (notification: NotificationPayload) => void;
  filterTypes?: NotificationType[];
}

/**
 * Hook return type
 */
export interface UseRealtimeNotificationsReturn {
  isConnected: boolean;
  notifications: NotificationPayload[];
  unreadCount: number;
  latestNotification: NotificationPayload | null;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  removeNotification: (notificationId: string) => void;
}

/**
 * React hook for real-time notifications
 *
 * @example
 * ```tsx
 * const {
 *   notifications,
 *   unreadCount,
 *   markAsRead,
 *   markAllAsRead
 * } = useRealtimeNotifications({
 *   userId: session?.user?.id,
 *   playSound: true,
 *   onNewNotification: (notification) => {
 *     toast.info(notification.title);
 *   }
 * });
 *
 * <Badge>{unreadCount}</Badge>
 * ```
 */
export function useRealtimeNotifications(
  config: UseRealtimeNotificationsConfig = {}
): UseRealtimeNotificationsReturn {
  const {
    userId,
    autoSubscribe = true,
    playSound = false,
    maxNotifications = 50,
    onNotification,
    onNewNotification,
    filterTypes,
  } = config;

  const { isConnected, joinRoom, leaveRoom, on, off } = useSocket({
    autoConnect: true,
  });

  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [latestNotification, setLatestNotification] =
    useState<NotificationPayload | null>(null);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!playSound || typeof window === "undefined") return;

    try {
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.3;
      audio.play().catch((error) => {
        console.warn("Failed to play notification sound:", error);
      });
    } catch (error) {
      console.warn("Notification sound not available:", error);
    }
  }, [playSound]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setLatestNotification(null);
  }, []);

  // Remove specific notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== notificationId)
    );
  }, []);

  // Filter notification by type
  const shouldAcceptNotification = useCallback(
    (notification: NotificationPayload): boolean => {
      if (!filterTypes || filterTypes.length === 0) return true;
      return filterTypes.includes(notification.type);
    },
    [filterTypes]
  );

  // Handle incoming notifications
  useEffect(() => {
    if (!isConnected) return;

    const handleNotification = (notification: NotificationPayload) => {
      console.log("🔔 Notification received:", notification);

      // Filter by type if configured
      if (!shouldAcceptNotification(notification)) {
        console.log("🔕 Notification filtered out by type");
        return;
      }

      // Set as latest
      setLatestNotification(notification);

      // Add to notifications list
      setNotifications((prev) => {
        const newNotifications = [notification, ...prev];

        // Limit to maxNotifications
        if (newNotifications.length > maxNotifications) {
          return newNotifications.slice(0, maxNotifications);
        }

        return newNotifications;
      });

      // Play sound for high priority notifications
      if (
        playSound &&
        (notification.priority === NotificationPriority.HIGH ||
          notification.priority === NotificationPriority.URGENT)
      ) {
        playNotificationSound();
      }

      // Call callbacks
      onNotification?.(notification);
      onNewNotification?.(notification);
    };

    const handleSeasonalUpdate = (update: any) => {
      console.log("🌾 Seasonal update received:", update);

      const notification: NotificationPayload = {
        id: `seasonal-${Date.now()}`,
        userId: userId || "",
        type: NotificationType.SEASONAL,
        title: "Seasonal Update",
        message: update.message || "A new seasonal update is available",
        timestamp: new Date().toISOString(),
        priority: NotificationPriority.MEDIUM,
        read: false,
        metadata: update,
      };

      handleNotification(notification);
    };

    const handleHarvestAlert = (alert: any) => {
      console.log("🌾 Harvest alert received:", alert);

      const notification: NotificationPayload = {
        id: `harvest-${Date.now()}`,
        userId: userId || "",
        type: NotificationType.HARVEST,
        title: "Harvest Alert",
        message: alert.message || "Harvest time approaching",
        timestamp: new Date().toISOString(),
        priority: NotificationPriority.HIGH,
        read: false,
        metadata: alert,
      };

      handleNotification(notification);
      playNotificationSound();
    };

    // Register event listeners
    on(SocketEvent.NOTIFICATION, handleNotification);
    on(SocketEvent.SEASONAL_UPDATE, handleSeasonalUpdate);
    on(SocketEvent.HARVEST_ALERT, handleHarvestAlert);

    // Cleanup
    return () => {
      off(SocketEvent.NOTIFICATION, handleNotification);
      off(SocketEvent.SEASONAL_UPDATE, handleSeasonalUpdate);
      off(SocketEvent.HARVEST_ALERT, handleHarvestAlert);
    };
  }, [
    isConnected,
    on,
    off,
    userId,
    playSound,
    maxNotifications,
    onNotification,
    onNewNotification,
    shouldAcceptNotification,
    playNotificationSound,
  ]);

  // Auto-subscribe to user room on connection
  useEffect(() => {
    if (!isConnected || !autoSubscribe || !userId) return;

    console.log("🔔 Subscribing to user notifications:", userId);
    joinRoom("user", userId);

    // Cleanup
    return () => {
      console.log("🔕 Unsubscribing from user notifications:", userId);
      leaveRoom(`user:${userId}`);
    };
  }, [isConnected, autoSubscribe, userId, joinRoom, leaveRoom]);

  return {
    isConnected,
    notifications,
    unreadCount,
    latestNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    removeNotification,
  };
}

/**
 * Simplified hook for notification badge count
 */
export function useNotificationCount(userId: string | undefined | null) {
  const { unreadCount, isConnected } = useRealtimeNotifications({
    userId: userId || undefined,
    autoSubscribe: !!userId,
    maxNotifications: 100,
  });

  return { unreadCount, isConnected };
}

/**
 * Hook for specific notification types only
 */
export function useNotificationsByType(
  userId: string | undefined | null,
  types: NotificationType[]
) {
  const { notifications, unreadCount, isConnected, ...rest } =
    useRealtimeNotifications({
      userId: userId || undefined,
      autoSubscribe: !!userId,
      filterTypes: types,
    });

  return {
    notifications,
    unreadCount,
    isConnected,
    ...rest,
  };
}

/**
 * Hook for order notifications only
 */
export function useOrderNotifications(userId: string | undefined | null) {
  return useNotificationsByType(userId, [NotificationType.ORDER]);
}

/**
 * Hook for harvest and seasonal notifications (for farmers)
 */
export function useAgriculturalNotifications(
  userId: string | undefined | null
) {
  return useNotificationsByType(userId, [
    NotificationType.HARVEST,
    NotificationType.SEASONAL,
  ]);
}
