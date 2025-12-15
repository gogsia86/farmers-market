/**
 * 🔔 NOTIFICATION BELL - DIVINE REAL-TIME CONSCIOUSNESS
 *
 * Quantum notification system with agricultural awareness
 * - Real-time updates via WebSocket
 * - Divine badge animations
 * - Agricultural event consciousness
 * - HP OMEN optimized rendering
 *
 * @module components/notifications/NotificationBell
 */

"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { NotificationDropdown } from "./NotificationDropdown";
import { useSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date | null;
  data?: {
    actionUrl?: string;
    orderId?: string;
    farmId?: string;
    productId?: string;
    seasonalEvent?: string;
  } | null;
}

interface NotificationBellProps {
  className?: string;
}

/**
 * DIVINE NOTIFICATION BELL COMPONENT
 * Quantum-aware notification center with real-time consciousness
 */
export function NotificationBell({ className }: NotificationBellProps) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications on mount
  useEffect(() => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    fetchNotifications();
  }, [session]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!session?.user) return;

    // TODO: Implement WebSocket connection
    // const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/notifications`);

    // ws.onmessage = (event) => {
    //   const notification = JSON.parse(event.data);
    //   addNotification(notification);
    // };

    // return () => ws.close();
  }, [session]);

  /**
   * FETCH NOTIFICATIONS FROM API
   * Divine data retrieval with agricultural consciousness
   */
  async function fetchNotifications() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/notifications");

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * ADD NEW NOTIFICATION
   * Quantum notification manifestation
   */
  // Removed addNotification - handled by WebSocket in future implementation

  /**
   * MARK NOTIFICATION AS READ
   * Temporal state update with quantum coherence
   */
  async function markAsRead(notificationId: string) {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
        },
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? { ...n, isRead: true, readAt: new Date() }
              : n,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }

  /**
   * MARK ALL AS READ
   * Bulk temporal update with divine efficiency
   */
  async function markAllAsRead() {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "PATCH",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date() })),
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }

  /**
   * DELETE NOTIFICATION
   * Quantum entity annihilation
   */
  async function deleteNotification(notificationId: string) {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }

  // Don't render if not authenticated
  if (!session?.user) {
    return null;
  }

  return (
    <div className="relative">
      {/* NOTIFICATION BELL BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800",
          "transition-all duration-200 ease-in-out",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          isOpen && "bg-gray-100 dark:bg-gray-800",
          className,
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="h-6 w-6 text-gray-700 dark:text-gray-300" />

        {/* UNREAD BADGE - DIVINE QUANTUM INDICATOR */}
        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute -top-1 -right-1",
              "min-w-[20px] h-5 px-1",
              "flex items-center justify-center",
              "text-xs font-bold text-white",
              "bg-red-500 rounded-full",
              "animate-pulse",
              "shadow-lg shadow-red-500/50",
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* NOTIFICATION DROPDOWN - QUANTUM PORTAL */}
      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          isLoading={isLoading}
          onClose={() => setIsOpen(false)}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
          onRefresh={fetchNotifications}
        />
      )}
    </div>
  );
}

/**
 * DIVINE NOTIFICATION TYPES
 * Agricultural consciousness categorization
 */
export const NotificationTypes = {
  ORDER: {
    color: "blue",
    icon: "🛒",
    label: "Order",
  },
  FARM: {
    color: "green",
    icon: "🌾",
    label: "Farm",
  },
  PRODUCT: {
    color: "yellow",
    icon: "🥕",
    label: "Product",
  },
  SYSTEM: {
    color: "gray",
    icon: "⚙️",
    label: "System",
  },
  AGRICULTURAL: {
    color: "emerald",
    icon: "🌱",
    label: "Agricultural Event",
  },
} as const;
