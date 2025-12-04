/**
 * REAL-TIME NOTIFICATIONS HOOK
 * Client-side hook for consuming Server-Sent Events (SSE) notifications
 *
 * Features:
 * - Automatic reconnection
 * - Connection state management
 * - Notification queue
 * - Event callbacks
 * - Error handling
 */

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

// ============================================
// TYPES
// ============================================

interface Notification {
  id: string;
  type: "ORDER" | "MESSAGE" | "REVIEW" | "SYSTEM" | "PAYMENT" | "PRODUCT";
  title: string;
  message: string;
  data?: Record<string, any>;
  createdAt: string;
  read: boolean;
  userId: string;
}

interface UseRealtimeNotificationsOptions {
  enabled?: boolean;
  onNotification?: (notification: Notification) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

interface UseRealtimeNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  clearNotifications: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  reconnect: () => void;
}

// ============================================
// HOOK
// ============================================

export function useRealtimeNotifications(
  options: UseRealtimeNotificationsOptions = {},
): UseRealtimeNotificationsReturn {
  const {
    enabled = true,
    onNotification,
    onConnect,
    onDisconnect,
    onError,
    reconnectDelay = 3000,
    maxReconnectAttempts = 10,
  } = options;

  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Connect to SSE endpoint
  const connect = useCallback(() => {
    // Don't connect if disabled, not authenticated, or already connected
    if (!enabled || status !== "authenticated" || !session?.user) {
      return;
    }

    if (eventSourceRef.current) {
      return; // Already connected
    }

    setIsConnecting(true);
    setError(null);

    try {
      const eventSource = new EventSource("/api/notifications/stream", {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        console.log("✅ Notifications SSE connected");
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttemptRef.current = 0;
        onConnect?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "connected") {
            console.log("🔔 Notification stream initialized:", data);
            return;
          }

          // Handle notification
          const notification = data as Notification;

          setNotifications((prev) => {
            // Prevent duplicates
            if (prev.some((n) => n.id === notification.id)) {
              return prev;
            }
            return [notification, ...prev];
          });

          // Play notification sound (optional)
          if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "granted") {
              new Notification(notification.title, {
                body: notification.message,
                icon: "/icons/icon-192x192.png",
                badge: "/icons/icon-72x72.png",
                tag: notification.id,
              });
            }
          }

          // Call callback
          onNotification?.(notification);
        } catch (err) {
          console.error("Error parsing notification:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("❌ Notifications SSE error:", err);
        setIsConnected(false);
        setIsConnecting(false);

        const error = new Error("SSE connection error");
        setError(error);
        onError?.(error);

        // Close current connection
        eventSource.close();
        eventSourceRef.current = null;

        // Attempt reconnection
        if (reconnectAttemptRef.current < maxReconnectAttempts) {
          reconnectAttemptRef.current++;
          console.log(
            `🔄 Reconnecting... (attempt ${reconnectAttemptRef.current}/${maxReconnectAttempts})`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay * reconnectAttemptRef.current);
        } else {
          console.error("❌ Max reconnection attempts reached");
          const maxError = new Error(
            "Failed to connect after maximum attempts",
          );
          setError(maxError);
          onError?.(maxError);
        }
      };

      eventSourceRef.current = eventSource;
    } catch (err) {
      console.error("❌ Failed to create SSE connection:", err);
      setIsConnecting(false);
      const error = err instanceof Error ? err : new Error("Failed to connect");
      setError(error);
      onError?.(error);
    }
  }, [
    enabled,
    status,
    session,
    onNotification,
    onConnect,
    onError,
    reconnectDelay,
    maxReconnectAttempts,
  ]);

  // Disconnect from SSE
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      console.log("🔌 Disconnecting notifications SSE");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
      onDisconnect?.();
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, [onDisconnect]);

  // Reconnect manually
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptRef.current = 0;
    connect();
  }, [connect, disconnect]);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );

    // Sync with server
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
      });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    // Sync with server
    try {
      await fetch("/api/notifications/read-all", {
        method: "PUT",
      });
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, []);

  // Remove notification
  const removeNotification = useCallback(async (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

    // Sync with server
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          console.log("📬 Notification permission:", permission);
        });
      }
    }
  }, []);

  // Load initial notifications from server
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setNotifications(data.data);
          }
        })
        .catch((err) => {
          console.error("Failed to load notifications:", err);
        });
    }
  }, [status, session]);

  return {
    notifications,
    unreadCount,
    isConnected,
    isConnecting,
    error,
    clearNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    reconnect,
  };
}

// ============================================
// HELPER: Request Notification Permission
// ============================================

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

// ============================================
// HELPER: Show Browser Notification
// ============================================

export function showBrowserNotification(
  title: string,
  options?: NotificationOptions,
): void {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  new Notification(title, {
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    ...options,
  });
}
