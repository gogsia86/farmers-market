/**
 * 🔔 NOTIFICATION DROPDOWN - DIVINE QUANTUM PORTAL
 *
 * Comprehensive notification display with agricultural consciousness
 * - Categorized notifications
 * - Action buttons (mark read, delete)
 * - Divine scrolling with virtualization
 * - Agricultural event highlighting
 * - HP OMEN optimized rendering
 *
 * @module components/notifications/NotificationDropdown
 */

"use client";

import { X, Check, Trash2, RefreshCw, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Notification } from "./NotificationBell";
import { NotificationTypes } from "./NotificationBell";

interface NotificationDropdownProps {
  notifications: Notification[];
  isLoading: boolean;
  onClose: () => void;
  onMarkAsRead: (notificationId: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onDelete: (notificationId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

/**
 * DIVINE NOTIFICATION DROPDOWN COMPONENT
 * Quantum-aware notification portal with agricultural consciousness
 */
export function NotificationDropdown({
  notifications,
  isLoading,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onRefresh,
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const hasUnread = unreadNotifications.length > 0;

  return (
    <div
      ref={dropdownRef}
      className={cn(
        "absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)]",
        "bg-white dark:bg-gray-900 rounded-lg shadow-2xl",
        "border border-gray-200 dark:border-gray-700",
        "overflow-hidden z-50",
        "animate-in fade-in slide-in-from-top-2 duration-200",
      )}
    >
      {/* HEADER - DIVINE CONTROL PANEL */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Notifications
          {hasUnread && (
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              ({unreadNotifications.length} unread)
            </span>
          )}
        </h3>

        <div className="flex items-center gap-2">
          {/* REFRESH BUTTON */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={cn(
              "p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary",
              isLoading && "animate-spin",
            )}
            aria-label="Refresh notifications"
          >
            <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>

          {/* MARK ALL AS READ */}
          {hasUnread && (
            <button
              onClick={onMarkAllAsRead}
              className={cn(
                "p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
                "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary",
              )}
              aria-label="Mark all as read"
            >
              <Check className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}

          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className={cn(
              "p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary",
            )}
            aria-label="Close notifications"
          >
            <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* NOTIFICATION LIST - QUANTUM SCROLL PORTAL */}
      <div className="max-h-[32rem] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No notifications yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              We'll notify you when something important happens
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* FOOTER - VIEW ALL LINK */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Link
            href="/notifications"
            onClick={onClose}
            className={cn(
              "flex items-center justify-center gap-2",
              "text-sm font-medium text-primary hover:text-primary-dark",
              "transition-colors duration-200",
            )}
          >
            View all notifications
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * NOTIFICATION ITEM COMPONENT
 * Individual notification with divine consciousness
 */
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (notificationId: string) => Promise<void>;
  onDelete: (notificationId: string) => Promise<void>;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const typeConfig =
    NotificationTypes[notification.type as keyof typeof NotificationTypes] ||
    NotificationTypes.SYSTEM;
  const isUnread = !notification.isRead;

  const handleClick = async () => {
    if (isUnread) {
      await onMarkAsRead(notification.id);
    }
  };

  const content = (
    <div
      className={cn(
        "p-4 hover:bg-gray-50 dark:hover:bg-gray-800",
        "transition-all duration-200 cursor-pointer",
        "group relative",
        isUnread && "bg-blue-50 dark:bg-blue-900/10",
      )}
      onClick={handleClick}
    >
      {/* UNREAD INDICATOR */}
      {isUnread && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
      )}

      <div className={cn("flex gap-3", isUnread && "pl-3")}>
        {/* TYPE ICON */}
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full",
            "flex items-center justify-center text-xl",
            `bg-${typeConfig.color}-100 dark:bg-${typeConfig.color}-900/20`,
          )}
        >
          {typeConfig.icon}
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {notification.body}
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {isUnread && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className={cn(
                    "p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
                    "transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary",
                  )}
                  aria-label="Mark as read"
                >
                  <Check className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className={cn(
                  "p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20",
                  "transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-red-500",
                )}
                aria-label="Delete notification"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>

          {/* TIMESTAMP */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {formatTimestamp(notification.createdAt)}
          </p>

          {/* AGRICULTURAL EVENT BADGE */}
          {notification.type === "AGRICULTURAL" &&
            notification.data?.seasonalEvent && (
              <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/20 rounded-full">
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  🌱 {notification.data.seasonalEvent}
                </span>
              </div>
            )}
        </div>
      </div>
    </div>
  );

  // Wrap in Link if actionUrl exists in data
  if (notification.data?.actionUrl) {
    return (
      <Link href={notification.data.actionUrl} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return content;
}

/**
 * FORMAT TIMESTAMP - DIVINE TEMPORAL TRANSLATION
 * Converts dates to human-readable format with agricultural consciousness
 */
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      now.getFullYear() !== new Date(date).getFullYear()
        ? "numeric"
        : undefined,
  });
}
