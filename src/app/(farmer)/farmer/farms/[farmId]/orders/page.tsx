/**
 * 🌾 FARMER FARM ORDERS LIST PAGE
 * Display all orders for a specific farm with filtering and management
 *
 * Route: /farmer/farms/[farmId]/orders
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Package,
  Search,
  ShoppingBag,
  TrendingUp,
  Truck,
  XCircle
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Farm Orders | Farmer Dashboard",
  description: "Manage orders for your farm",
};

// Force dynamic rendering for real-time order updates
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: { farmId: string };
  searchParams: {
    status?: string;
    page?: string;
    search?: string;
  };
}

const ORDER_STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
    description: "Waiting for confirmation",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircle,
    description: "Order confirmed",
  },
  PREPARING: {
    label: "Preparing",
    color: "bg-purple-100 text-purple-800",
    icon: Package,
    description: "Being prepared",
  },
  READY: {
    label: "Ready",
    color: "bg-green-100 text-green-800",
    icon: ShoppingBag,
    description: "Ready for pickup",
  },
  FULFILLED: {
    label: "Fulfilled",
    color: "bg-indigo-100 text-indigo-800",
    icon: Truck,
    description: "Order fulfilled",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    description: "Order completed",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    description: "Order cancelled",
  },
} as const;

const PAYMENT_STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "text-yellow-600" },
  PAID: { label: "Paid", color: "text-green-600" },
  FAILED: { label: "Failed", color: "text-red-600" },
  REFUNDED: { label: "Refunded", color: "text-gray-600" },
  PARTIALLY_REFUNDED: { label: "Partially Refunded", color: "text-orange-600" },
} as const;

export default async function FarmOrdersPage({ params, searchParams }: PageProps) {
  // Authentication check
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/farmer/farms/${params.farmId}/orders`);
  }

  // Verify user is a farmer
  if (session.user.role !== "FARMER") {
    redirect("/");
  }

  // Get farm and verify ownership
  const farm = await database.farm.findUnique({
    where: { id: params.farmId },
    select: {
      id: true,
      name: true,
      ownerId: true,
      status: true,
      verificationStatus: true,
    },
  });

  if (!farm) {
    notFound();
  }

  // Verify ownership
  const isOwner = farm.ownerId === session.user.id;

  if (!isOwner) {
    redirect("/farmer/dashboard");
  }

  // Parse query parameters
  const statusFilter = searchParams.status?.toUpperCase();
  const searchQuery = searchParams.search?.trim();
  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = 20;

  // Build where clause
  const where: any = {
    farmId: params.farmId,
  };

  if (statusFilter && statusFilter !== "ALL") {
    where.status = statusFilter;
  }

  if (searchQuery) {
    where.OR = [
      { orderNumber: { contains: searchQuery, mode: "insensitive" } },
      {
        customer: {
          OR: [
            { firstName: { contains: searchQuery, mode: "insensitive" } },
            { lastName: { contains: searchQuery, mode: "insensitive" } },
            { email: { contains: searchQuery, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  // Fetch orders with pagination
  const [orders, totalOrders] = await Promise.all([
    database.order.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        items: {
          select: {
            id: true,
            productName: true,
            quantity: true,
            unitPrice: true,
            subtotal: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    database.order.count({ where }),
  ]);

  // Calculate stats
  const statsWhere = { farmId: params.farmId };

  const [
    totalRevenueResult,
    pendingOrdersCount,
    processingOrdersCount,
    completedOrdersCount,
  ] = await Promise.all([
    database.order.aggregate({
      where: {
        ...statsWhere,
        paymentStatus: "PAID",
      },
      _sum: { total: true },
    }),
    database.order.count({
      where: { ...statsWhere, status: "PENDING" },
    }),
    database.order.count({
      where: {
        ...statsWhere,
        status: { in: ["CONFIRMED", "PREPARING", "READY", "FULFILLED"] },
      },
    }),
    database.order.count({
      where: { ...statsWhere, status: "COMPLETED" },
    }),
  ]);

  const totalRevenue = Number(totalRevenueResult._sum.total || 0);
  const totalPages = Math.ceil(totalOrders / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Navigation */}
          <Link
            href={`/farmer/farms/${params.farmId}`}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Farm Details
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
              <p className="mt-2 text-gray-600">{farm.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-2">
                  {pendingOrdersCount}
                </p>
              </div>
              <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Processing Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {processingOrdersCount}
                </p>
              </div>
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Completed Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {completedOrdersCount}
                </p>
              </div>
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <form method="get" className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="search"
                    defaultValue={searchQuery}
                    placeholder="Search by order number, customer name, or email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {statusFilter && (
                    <input type="hidden" name="status" value={statusFilter} />
                  )}
                </form>
              </div>

              {/* Status Filter */}
              <div className="sm:w-48">
                <form method="get">
                  <select
                    name="status"
                    defaultValue={statusFilter || "ALL"}
                    onChange={(e) => e.target.form?.submit()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="READY">Ready</option>
                    <option value="FULFILLED">Fulfilled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  {searchQuery && <input type="hidden" name="search" value={searchQuery} />}
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No orders found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchQuery || statusFilter
                  ? "Try adjusting your filters or search query."
                  : "Orders will appear here once customers place them."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => {
                    const statusConfig =
                      ORDER_STATUS_CONFIG[
                      order.status as keyof typeof ORDER_STATUS_CONFIG
                      ];
                    const paymentConfig =
                      PAYMENT_STATUS_CONFIG[
                      order.paymentStatus as keyof typeof PAYMENT_STATUS_CONFIG
                      ];
                    const StatusIcon = statusConfig?.icon || Clock;

                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <ShoppingBag className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {order.orderNumber}
                              </div>
                              <div className="text-xs text-gray-500">
                                {order._count.items} item
                                {order._count.items !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer.firstName} {order.customer.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.customer.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <div key={item.id} className="truncate max-w-xs">
                                {item.productName}
                                {idx === 1 && order.items.length > 2 && (
                                  <span className="text-gray-500">
                                    {" "}
                                    +{order.items.length - 2} more
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(Number(order.total))}
                          </div>
                          <div className="text-xs text-gray-500">
                            Farmer: {formatCurrency(Number(order.farmerAmount))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig?.color || "bg-gray-100 text-gray-800"}`}
                          >
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusConfig?.label || order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-xs font-medium ${paymentConfig?.color || "text-gray-600"}`}
                          >
                            {paymentConfig?.label || order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {format(new Date(order.createdAt), "MMM d, yyyy")}
                          </div>
                          <div className="text-xs text-gray-400">
                            {format(new Date(order.createdAt), "h:mm a")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/farmer/farms/${params.farmId}/orders/${order.id}`}
                            className="text-green-600 hover:text-green-900"
                          >
                            View Details →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                {page > 1 && (
                  <Link
                    href={`?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}${searchQuery ? `&search=${searchQuery}` : ""}`}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}${searchQuery ? `&search=${searchQuery}` : ""}`}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(page * pageSize, totalOrders)}
                    </span>{" "}
                    of <span className="font-medium">{totalOrders}</span> orders
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {page > 1 && (
                      <Link
                        href={`?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}${searchQuery ? `&search=${searchQuery}` : ""}`}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Previous
                      </Link>
                    )}

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <Link
                          key={pageNum}
                          href={`?page=${pageNum}${statusFilter ? `&status=${statusFilter}` : ""}${searchQuery ? `&search=${searchQuery}` : ""}`}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pageNum
                            ? "z-10 bg-green-50 border-green-500 text-green-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}

                    {page < totalPages && (
                      <Link
                        href={`?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}${searchQuery ? `&search=${searchQuery}` : ""}`}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Next
                      </Link>
                    )}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Order Management Tips
              </h3>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>
                  • <strong>Pending orders</strong> require your confirmation within 24
                  hours
                </li>
                <li>
                  • <strong>Processing orders</strong> should be prepared according to the
                  scheduled date
                </li>
                <li>
                  • Mark orders as <strong>Ready for Pickup</strong> when they're
                  complete
                </li>
                <li>
                  • Communicate with customers through the order details page for any
                  questions
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
