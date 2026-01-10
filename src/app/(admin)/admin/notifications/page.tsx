/**
 * 📬 ADMIN NOTIFICATIONS PAGE
 * View and manage platform notifications
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { Notification, NotificationType } from "@prisma/client";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Notifications | Admin Dashboard",
  description: "View and manage platform notifications",
};

export default async function AdminNotificationsPage() {
  const session = await auth();

  // Require admin access
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch recent notifications
  const notifications = await database.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Get notification stats
  const stats = {
    total: await database.notification.count(),
    unread: await database.notification.count({
      where: { isRead: false },
    }),
    today: await database.notification.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">
              Platform notifications and user alerts
            </p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Notifications
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.total}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📬</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {stats.unread}
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔔</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.today}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Notifications
          </h2>
        </div>

        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <span className="text-3xl">📭</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-600">
              Notifications will appear here when users receive alerts
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map(
              (
                notification: Notification & {
                  user: {
                    id: string;
                    name: string | null;
                    email: string;
                  } | null;
                },
              ) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        !notification.isRead
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              !notification.isRead
                                ? "text-gray-900"
                                : "text-gray-700"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.body}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500">
                              {notification.user?.name || "System"}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {formatDate(notification.createdAt)}
                            </span>
                            {!notification.isRead && (
                              <>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs font-medium text-blue-600">
                                  Unread
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Type Badge */}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClass(
                            notification.type,
                          )}`}
                        >
                          {notification.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getNotificationIcon(type: NotificationType): string {
  const icons: Record<string, string> = {
    ORDER: "📦",
    PAYMENT: "💳",
    DELIVERY: "🚚",
    MESSAGE: "💬",
    SYSTEM: "⚙️",
    ALERT: "⚠️",
    SUCCESS: "✅",
    INFO: "ℹ️",
  };
  return icons[type] || "🔔";
}

function getTypeBadgeClass(type: NotificationType): string {
  const classes: Record<string, string> = {
    ORDER: "bg-blue-100 text-blue-800",
    PAYMENT: "bg-green-100 text-green-800",
    DELIVERY: "bg-purple-100 text-purple-800",
    MESSAGE: "bg-yellow-100 text-yellow-800",
    SYSTEM: "bg-gray-100 text-gray-800",
    ALERT: "bg-red-100 text-red-800",
    SUCCESS: "bg-green-100 text-green-800",
    INFO: "bg-blue-100 text-blue-800",
  };
  return classes[type] || "bg-gray-100 text-gray-800";
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      new Date(date).getFullYear() !== now.getFullYear()
        ? "numeric"
        : undefined,
  });
}
