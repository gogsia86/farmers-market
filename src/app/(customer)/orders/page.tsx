/**
 * 📦 ORDERS LIST PAGE - Divine Order History
 * Displays customer's order history with filters and status
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 10_AGRICULTURAL_FEATURE_PATTERNS
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { formatCurrency } from "@/lib/utils/currency";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  MapPin,
  Package,
  Truck,
  XCircle
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Orders | Farmers Market Platform",
  description: "View your order history and track deliveries",
};

// Force dynamic rendering - don't pre-render at build time
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}

// Order status configuration
const ORDER_STATUSES = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  PROCESSING: {
    label: "Processing",
    icon: Package,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  READY: {
    label: "Ready",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  IN_TRANSIT: {
    label: "In Transit",
    icon: Truck,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle,
    color: "text-green-700",
    bg: "bg-green-100",
    border: "border-green-300",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  REFUNDED: {
    label: "Refunded",
    icon: AlertCircle,
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
} as const;

export default async function OrdersPage({ searchParams }: PageProps) {
  // ==========================================================================
  // AUTHENTICATION CHECK
  // ==========================================================================
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/orders");
  }

  const userId = session.user.id;

  // Await searchParams (Next.js 15+)
  const params = await searchParams;

  // ==========================================================================
  // PARSE FILTERS
  // ==========================================================================
  const statusFilter = params.status as keyof typeof ORDER_STATUSES | undefined;
  const page = parseInt(params.page || "1", 10);
  const limit = 20;
  const skip = (page - 1) * limit;

  // ==========================================================================
  // FETCH ORDERS
  // ==========================================================================
  const whereClause: any = {
    customerId: userId,
  };

  if (statusFilter && ORDER_STATUSES[statusFilter]) {
    whereClause.status = statusFilter;
  }

  const [orders, totalCount] = await Promise.all([
    database.order.findMany({
      where: whereClause,
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
        items: {
          select: {
            id: true,
            productName: true,
            quantity: true,
            unit: true,
            unitPrice: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip,
    }),
    database.order.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">
            View and track your orders from local farms
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/orders"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${!statusFilter
              ? "bg-green-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
          >
            All Orders ({totalCount})
          </Link>
          {Object.entries(ORDER_STATUSES).map(([status, config]) => (
            <Link
              key={status}
              href={`/orders?status=${status}`}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${statusFilter === status
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
            >
              {config.label}
            </Link>
          ))}
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No orders found
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {statusFilter
                ? `You don't have any ${ORDER_STATUSES[statusFilter].label.toLowerCase()} orders.`
                : "Start shopping from local farms to see your orders here."}
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-3 text-base font-medium text-white shadow hover:bg-green-700"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = order.status as keyof typeof ORDER_STATUSES;
              const statusConfig = ORDER_STATUSES[status] || ORDER_STATUSES.PENDING;
              const StatusIcon = statusConfig.icon;

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}/confirmation`}
                  className="block overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-md"
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {order.farm.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(Number(order.total))}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="space-y-2">
                        {order.items.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-700">
                              {item.productName}
                            </span>
                            <span className="text-gray-600">
                              {Number(item.quantity)} {item.unit} × {formatCurrency(Number(item.unitPrice))}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-sm text-gray-500">
                            + {order.items.length - 3} more item{order.items.length - 3 !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delivery Date */}
                    {order.scheduledDate && (
                      <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm">
                        <Truck className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-900">
                          Scheduled for:{" "}
                          <span className="font-medium">
                            {new Date(order.scheduledDate).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          {order.scheduledTimeSlot && ` - ${order.scheduledTimeSlot}`}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/orders?${new URLSearchParams({
                  ...(statusFilter && { status: statusFilter }),
                  page: String(page - 1),
                }).toString()}`}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/orders?${new URLSearchParams({
                  ...(statusFilter && { status: statusFilter }),
                  page: String(page + 1),
                }).toString()}`}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
