/**
 * 🔔 Notification Center Component - Divine User Notification System
 * Real-time notification display with proper API integration
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 11_KILO_SCALE_ARCHITECTURE
 *
 * @version 2.0.0 - Framer Motion Integration
 * Features:
 * - List animations with stagger effects
 * - Filter/sort transitions
 * - Mark as read animations
 * - Empty state animations
 * - Loading state animations
 * - Accessibility with reduced motion support
 */

"use client";

import {
  emptyStateVariants,
  filterTransitionVariants,
  getAccessibleListVariants,
  listContainerVariants,
  listItemVariants,
  markAsReadVariants,
  skeletonVariants,
  staggerTransition,
} from "@/components/notifications/animations/list-animations";
import { useReducedMotion } from "@/components/notifications/hooks/useReducedMotion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

// ============================================================================
// Types
// ============================================================================

type NotificationType =
  | "ORDER_PLACED"
  | "ORDER_CONFIRMED"
  | "ORDER_READY"
  | "ORDER_FULFILLED"
  | "ORDER_CANCELLED"
  | "PAYMENT_RECEIVED"
  | "PAYOUT_PROCESSED"
  | "NEW_MESSAGE"
  | "REVIEW_RECEIVED"
  | "QUALITY_ISSUE"
  | "LOW_STOCK"
  | "SYSTEM_ANNOUNCEMENT";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  data?: Record<string, any>;
}

interface NotificationCenterProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

interface NotificationsData {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

// ============================================================================
// Component
// ============================================================================

export function NotificationCenter({
  className = "",
  autoRefresh = true,
  refreshInterval = 30000,
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);

  // Animation support
  const prefersReducedMotion = useReducedMotion();

  // Fetch notifications
  const fetchNotifications = async (options?: { unreadOnly?: boolean; page?: number }) => {
    try {
      const params = new URLSearchParams({
        page: String(options?.page || page),
        limit: "20",
        ...(options?.unreadOnly && { unreadOnly: "true" }),
      });

      const response = await fetch(`/api/notifications?${params}`);
      const data: ApiResponse<NotificationsData> = await response.json();

      if (data.success && data.data) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
        setTotalPages(data.data.pagination.totalPages);
        setError(null);
      } else {
        setError(data.error?.message || "Failed to load notifications");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications({ unreadOnly: filter === "unread" });

    if (!autoRefresh) return;

    // Poll for new notifications
    const interval = setInterval(() => {
      fetchNotifications({ unreadOnly: filter === "unread" });
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [filter, page, autoRefresh, refreshInterval]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      setMarkingAsRead(notificationId);

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead: true }),
      });

      const data: ApiResponse<{ id: string; isRead: boolean }> = await response.json();

      if (data.success) {
        // Delay state update to allow animation to complete
        setTimeout(() => {
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === notificationId
                ? { ...notif, isRead: true, readAt: new Date().toISOString() }
                : notif
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
          setMarkingAsRead(null);
        }, prefersReducedMotion ? 0 : 300);
      } else {
        setMarkingAsRead(null);
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setMarkingAsRead(null);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);

      if (unreadIds.length === 0) return;

      // Mark all through individual PATCH requests
      await Promise.all(
        unreadIds.map((id) =>
          fetch(`/api/notifications/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isRead: true }),
          })
        )
      );

      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          isRead: true,
          readAt: notif.readAt || new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Clear read notifications
  const clearReadNotifications = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
      });

      const data: ApiResponse<{ cleared: number }> = await response.json();

      if (data.success) {
        setNotifications((prev) => prev.filter((n) => !n.isRead));
        // Refresh to get accurate counts
        await fetchNotifications({ unreadOnly: filter === "unread" });
      }
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: NotificationType): string => {
    const icons: Record<NotificationType, string> = {
      ORDER_PLACED: "🛒",
      ORDER_CONFIRMED: "✅",
      ORDER_READY: "📦",
      ORDER_FULFILLED: "🚚",
      ORDER_CANCELLED: "❌",
      PAYMENT_RECEIVED: "💰",
      PAYOUT_PROCESSED: "💸",
      NEW_MESSAGE: "💬",
      REVIEW_RECEIVED: "⭐",
      QUALITY_ISSUE: "⚠️",
      LOW_STOCK: "📉",
      SYSTEM_ANNOUNCEMENT: "📢",
    };
    return icons[type] || "🔔";
  };

  // Get notification color
  const getNotificationColor = (type: NotificationType): string => {
    const colorMap: Record<NotificationType, string> = {
      ORDER_PLACED: "blue",
      ORDER_CONFIRMED: "green",
      ORDER_READY: "blue",
      ORDER_FULFILLED: "green",
      ORDER_CANCELLED: "red",
      PAYMENT_RECEIVED: "green",
      PAYOUT_PROCESSED: "green",
      NEW_MESSAGE: "blue",
      REVIEW_RECEIVED: "purple",
      QUALITY_ISSUE: "yellow",
      LOW_STOCK: "orange",
      SYSTEM_ANNOUNCEMENT: "gray",
    };
    return colorMap[type] || "gray";
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) =>
    filter === "all" ? true : !notif.isRead
  );

  // Animation variants
  const containerVariants = prefersReducedMotion
    ? getAccessibleListVariants(true)
    : listContainerVariants;

  const itemVariants = prefersReducedMotion
    ? getAccessibleListVariants(true)
    : listItemVariants;

  // Loading state
  if (loading && notifications.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>🔔 Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            className="flex items-center justify-center py-8"
            variants={skeletonVariants}
            initial="initial"
            animate="pulse"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>🔔 Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchNotifications()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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
                className="text-sm text-blue-600 hover:text-blue-800 transition"
                title="Mark all as read"
              >
                Mark all read
              </button>
            )}
            {notifications.some((n) => n.isRead) && (
              <button
                onClick={clearReadNotifications}
                className="text-sm text-gray-600 hover:text-gray-800 transition"
                title="Clear read notifications"
              >
                Clear read
              </button>
            )}
            <button
              onClick={() => fetchNotifications()}
              className="text-sm text-gray-600 hover:text-gray-800 transition"
              title="Refresh"
            >
              🔄
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filter Tabs */}
        <motion.div
          className="flex gap-2 mb-4 border-b border-gray-200"
          variants={filterTransitionVariants}
          initial="initial"
          animate="filtered"
          key={filter}
        >
          <button
            onClick={() => {
              setFilter("all");
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium transition ${filter === "all"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => {
              setFilter("unread");
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium transition ${filter === "unread"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Unread ({unreadCount})
          </button>
        </motion.div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <motion.div
            className="text-center py-8"
            variants={emptyStateVariants}
            initial="initial"
            animate="animate"
          >
            <p className="text-gray-500">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-3 max-h-96 overflow-y-auto"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notification, index) => {
                const icon = getNotificationIcon(notification.type);
                const color = getNotificationColor(notification.type);
                const isBeingMarked = markingAsRead === notification.id;

                return (
                  <motion.div
                    key={notification.id}
                    variants={isBeingMarked ? markAsReadVariants : itemVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    layout
                    transition={{
                      ...staggerTransition,
                      delay: prefersReducedMotion ? 0 : index * 0.05,
                    }}
                    onClick={() => !notification.isRead && !isBeingMarked && markAsRead(notification.id)}
                    className={`p-4 rounded-lg border-l-4 transition cursor-pointer ${notification.isRead
                      ? "bg-gray-50 border-gray-300"
                      : `bg-${color}-50 border-${color}-500 hover:bg-${color}-100`
                      } ${isBeingMarked ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`font-semibold ${notification.isRead ? "text-gray-700" : "text-gray-900"
                              }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <motion.span
                              className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            />
                          )}
                        </div>
                        <p
                          className={`text-sm mt-1 ${notification.isRead ? "text-gray-600" : "text-gray-700"
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
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Details →
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
