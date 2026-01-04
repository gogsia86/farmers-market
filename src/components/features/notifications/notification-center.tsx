/**
 * Notification Center Component
 * Real-time notification display for users with filtering and actions
 * Shows in-app notifications with read/unread status
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

// ============================================================================
// Types
// ============================================================================

type NotificationType =
  | "ORDER_CONFIRMED"
  | "ORDER_READY"
  | "ORDER_CANCELLED"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_FAILED"
  | "FARM_APPROVED"
  | "FARM_REJECTED"
  | "PRODUCT_LOW_STOCK"
  | "NEW_REVIEW"
  | "NEW_MESSAGE"
  | "SYSTEM_ALERT";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

interface NotificationCenterProps {
  userId: string;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function NotificationCenter({ userId, className = "" }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data.notifications || []);
        setError(null);
      } else {
        setError(data.error || "Failed to load notifications");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);

      await Promise.all(
        unreadIds.map((id) =>
          fetch(`/api/notifications/${id}/read`, { method: "POST" })
        )
      );

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: NotificationType): string => {
    const icons: Record<NotificationType, string> = {
      ORDER_CONFIRMED: "✅",
      ORDER_READY: "📦",
      ORDER_CANCELLED: "❌",
      PAYMENT_RECEIVED: "💰",
      PAYMENT_FAILED: "⚠️",
      FARM_APPROVED: "🎉",
      FARM_REJECTED: "😞",
      PRODUCT_LOW_STOCK: "📉",
      NEW_REVIEW: "⭐",
      NEW_MESSAGE: "💬",
      SYSTEM_ALERT: "🔔",
    };
    return icons[type] || "📢";
  };

  // Get notification color
  const getNotificationColor = (type: NotificationType): string => {
    const colors: Record<NotificationType, string> = {
      ORDER_CONFIRMED: "green",
      ORDER_READY: "blue",
      ORDER_CANCELLED: "red",
      PAYMENT_RECEIVED: "green",
      PAYMENT_FAILED: "red",
      FARM_APPROVED: "green",
      FARM_REJECTED: "red",
      PRODUCT_LOW_STOCK: "yellow",
      NEW_REVIEW: "purple",
      NEW_MESSAGE: "blue",
      SYSTEM_ALERT: "gray",
    };
    return colors[type] || "gray";
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) =>
    filter === "all" ? true : !notif.read
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading && notifications.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>🔔 Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>🔔 Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchNotifications}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              🔔 Notifications
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </CardTitle>
            <CardDescription>Your recent notifications</CardDescription>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={fetchNotifications}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              🔄
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 border-b border-gray-200">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-sm font-medium transition ${filter === "all"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
              }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 text-sm font-medium transition ${filter === "unread"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredNotifications.map((notification) => {
              const icon = getNotificationIcon(notification.type);
              const color = getNotificationColor(notification.type);

              return (
                <div
                  key={notification.id}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  className={`p-4 rounded-lg border-l-4 transition cursor-pointer ${notification.read
                      ? "bg-gray-50 border-gray-300"
                      : `bg-${color}-50 border-${color}-500 hover:bg-${color}-100`
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`font-semibold ${notification.read ? "text-gray-700" : "text-gray-900"
                            }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5"></span>
                        )}
                      </div>
                      <p
                        className={`text-sm mt-1 ${notification.read ? "text-gray-600" : "text-gray-700"
                          }`}
                      >
                        {notification.body}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>

                      {/* Action Button (if applicable) */}
                      {notification.data?.actionUrl && (
                        <a
                          href={notification.data.actionUrl}
                          className={`inline-block mt-3 text-sm font-medium text-${color}-700 hover:text-${color}-900`}
                        >
                          View Details →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
