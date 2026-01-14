"use client";

/**
 * 🔔 REAL-TIME NOTIFICATION BELL COMPONENT
 * Displays notification count with real-time updates via Socket.io
 * Following: Real-time Communication Patterns & Agricultural Consciousness
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRealtimeNotifications } from "@/hooks/realtime";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  BellRing,
  Check,
  Package,
  Radio,
  ShoppingCart,
  Sparkles,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface NotificationBellProps {
  userId?: string;
  className?: string;
  showBadge?: boolean;
}

export function NotificationBell({
  userId,
  className,
  showBadge = true,
}: NotificationBellProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead } =
    useRealtimeNotifications({
      userId,
      autoSubscribe: !!userId,
      onNewNotification: (notification) => {
        // Show toast for new notifications
        toast.info(notification.title, {
          description: notification.message,
          icon: getNotificationIcon(notification.type),
          duration: 5000,
        });
      },
    });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (!isOpen) return;

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to update notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to update notifications");
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate if action URL exists
    if (notification.actionUrl) {
      setIsOpen(false);
      router.push(notification.actionUrl);
    }
  };

  // Don't render if no user ID
  if (!userId) {
    return null;
  }

  const hasNotifications = notifications.length > 0;
  const hasUnread = unreadCount > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn("relative text-gray-700 hover:text-green-700", className)}
        aria-label={`Notifications ${hasUnread ? `(${unreadCount} unread)` : ""}`}
      >
        {hasUnread ? (
          <BellRing className="h-5 w-5 animate-pulse" />
        ) : (
          <Bell className="h-5 w-5" />
        )}

        {/* Unread badge */}
        {showBadge && hasUnread && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}

        {/* Connection indicator */}
        {isConnected && (
          <span className="absolute -bottom-1 -right-1 h-2 w-2 bg-green-500 rounded-full border border-white" />
        )}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-[500px] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold">Notifications</span>
              {isConnected && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Radio className="w-3 h-3 animate-pulse text-green-500" />
                  Live
                </Badge>
              )}
            </div>
            {hasUnread && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-auto p-1 text-xs text-blue-600 hover:text-blue-700"
              >
                Mark all read
              </Button>
            )}
          </div>

          {/* Notifications list */}
          <div className="overflow-y-auto flex-1 max-h-[400px]">
            {!hasNotifications ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-900">
                  No notifications
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="space-y-1 py-1">
                {notifications.slice(0, 10).map((notification: any) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 p-3 cursor-pointer group relative hover:bg-gray-50",
                      !notification.read && "bg-blue-50 hover:bg-blue-100",
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                        getNotificationColor(notification.type),
                      )}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium text-gray-900 truncate",
                          !notification.read && "font-semibold",
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.timestamp), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          title="Mark as read"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <span className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {hasNotifications && (
            <>
              <div className="border-t border-gray-200" />
              <div className="p-2">
                <Link
                  href="/notifications"
                  className="block w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  View all notifications →
                </Link>
              </div>
            </>
          )}

          {/* Agricultural Consciousness Badge */}
          {isConnected && (
            <div className="border-t border-gray-200 p-2">
              <div className="flex items-center justify-center">
                <Badge variant="outline" className="text-xs gap-1">
                  🌾 Agricultural Consciousness Active
                </Badge>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Get notification icon based on type
 */
function getNotificationIcon(type: string) {
  switch (type) {
    case "ORDER_UPDATE":
    case "ORDER_STATUS":
    case "ORDER_NEW":
      return <Package className="w-4 h-4" />;
    case "ORDER_DELIVERY":
      return <Truck className="w-4 h-4" />;
    case "PAYMENT":
      return <ShoppingCart className="w-4 h-4" />;
    case "FARM_UPDATE":
    case "PRODUCT_UPDATE":
      return <Sparkles className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
}

/**
 * Get notification color based on type
 */
function getNotificationColor(type: string) {
  switch (type) {
    case "ORDER_UPDATE":
    case "ORDER_STATUS":
    case "ORDER_NEW":
      return "bg-blue-100 text-blue-600";
    case "ORDER_DELIVERY":
      return "bg-green-100 text-green-600";
    case "PAYMENT":
      return "bg-yellow-100 text-yellow-600";
    case "FARM_UPDATE":
    case "PRODUCT_UPDATE":
      return "bg-purple-100 text-purple-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

/**
 * Compact notification badge (for mobile/minimalist view)
 */
export function NotificationBadge({
  userId,
  className,
}: {
  userId?: string;
  className?: string;
}) {
  const { unreadCount, isConnected } = useRealtimeNotifications({
    userId,
    autoSubscribe: !!userId,
  });

  if (!userId || unreadCount === 0) {
    return null;
  }

  return (
    <Badge variant="destructive" className={cn("gap-1", className)}>
      <BellRing className="w-3 h-3" />
      {unreadCount}
      {isConnected && <Radio className="w-2 h-2 animate-pulse ml-1" />}
    </Badge>
  );
}
