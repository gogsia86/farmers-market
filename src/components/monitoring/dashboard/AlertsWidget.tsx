/**
 * 🌟 Alerts Widget
 * Farmers Market Platform - Monitoring Dashboard
 *
 * Displays active alerts, notifications, and warnings with
 * priority indicators and filtering options.
 */

"use client";

import { useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface AlertsWidgetProps {
  notifications: Array<{
    id: string;
    type: string;
    priority: string;
    message: string;
    sentAt: Date;
    successful: boolean;
  }>;
  alertCount: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get priority badge styling
 */
function getPriorityBadge(priority: string): {
  bg: string;
  text: string;
  icon: string;
  border: string;
} {
  switch (priority.toUpperCase()) {
    case "CRITICAL":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: "🔴",
        border: "border-red-300",
      };
    case "HIGH":
      return {
        bg: "bg-orange-100",
        text: "text-orange-800",
        icon: "⚠️",
        border: "border-orange-300",
      };
    case "MEDIUM":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: "⚡",
        border: "border-yellow-300",
      };
    case "LOW":
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: "ℹ️",
        border: "border-blue-300",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: "📌",
        border: "border-gray-300",
      };
  }
}

/**
 * Format time ago
 */
function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Format notification type
 */
function formatNotificationType(type: string): string {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AlertsWidget({
  notifications,
  alertCount,
}: AlertsWidgetProps) {
  const [filter, setFilter] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    return notification.priority.toLowerCase() === filter.toLowerCase();
  });

  const displayedNotifications = showAll
    ? filteredNotifications
    : filteredNotifications.slice(0, 5);

  // Count by priority
  const criticalCount = notifications.filter(
    (n) => n.priority === "CRITICAL",
  ).length;
  const highCount = notifications.filter((n) => n.priority === "HIGH").length;
  const mediumCount = notifications.filter(
    (n) => n.priority === "MEDIUM",
  ).length;

  return (
    <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200">
      {/* Widget Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Active Alerts
          </h3>
          {alertCount > 0 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">
              {alertCount}
            </span>
          )}
        </div>
        <a
          href="/dashboard/alerts"
          className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
        >
          View All →
        </a>
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 flex space-x-2 overflow-x-auto">
        <button
          onClick={() => setFilter("all")}
          className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("critical")}
          className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === "critical"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Critical ({criticalCount})
        </button>
        <button
          onClick={() => setFilter("high")}
          className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === "high"
              ? "bg-orange-100 text-orange-800"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          High ({highCount})
        </button>
        <button
          onClick={() => setFilter("medium")}
          className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === "medium"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Medium ({mediumCount})
        </button>
      </div>

      {/* Alerts List */}
      {filteredNotifications.length === 0 ? (
        <div className="py-8 text-center">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-sm font-medium text-gray-600">
            No alerts at this time
          </p>
          <p className="text-xs text-gray-500 mt-1">
            All systems operating normally
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedNotifications.map((notification) => {
            const priorityBadge = getPriorityBadge(notification.priority);
            return (
              <div
                key={notification.id}
                className={`group rounded-lg border-l-4 bg-gray-50 p-3 transition-all hover:shadow-sm ${priorityBadge.border}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Priority and Type */}
                    <div className="flex items-center space-x-2 mb-1">
                      <span
                        className={`inline-flex items-center space-x-1 rounded-full px-2 py-0.5 text-xs font-medium ${priorityBadge.bg} ${priorityBadge.text}`}
                      >
                        <span>{priorityBadge.icon}</span>
                        <span>{notification.priority}</span>
                      </span>
                      <span className="text-xs text-gray-600">
                        {formatNotificationType(notification.type)}
                      </span>
                    </div>

                    {/* Message */}
                    <p className="text-sm text-gray-900 mb-2">
                      {notification.message}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <span>🕐</span>
                        <span>{timeAgo(new Date(notification.sentAt))}</span>
                      </span>
                      <span
                        className={`flex items-center space-x-1 ${
                          notification.successful
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        <span>{notification.successful ? "✓" : "✗"}</span>
                        <span>
                          {notification.successful ? "Sent" : "Failed"}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    className="ml-2 rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                    aria-label="Dismiss alert"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Show More/Less Button */}
      {filteredNotifications.length > 5 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
          >
            {showAll
              ? "Show Less ↑"
              : `Show ${filteredNotifications.length - 5} More ↓`}
          </button>
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600">Critical</p>
            <p className="text-lg font-bold text-red-600">{criticalCount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">High</p>
            <p className="text-lg font-bold text-orange-600">{highCount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Medium</p>
            <p className="text-lg font-bold text-yellow-600">{mediumCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
