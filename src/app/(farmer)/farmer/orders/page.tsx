/**
 * 🌾 FARMER ORDERS MANAGEMENT PAGE
 * Complete order management and fulfillment for farmers
 *
 * Divine Patterns Applied:
 * - Next.js Divine Implementation (04_NEXTJS_DIVINE_IMPLEMENTATION)
 * - Agricultural Quantum Mastery (02_AGRICULTURAL_QUANTUM_MASTERY)
 * - Security Divinity (05_TESTING_SECURITY_DIVINITY)
 *
 * Functional Requirements: FR-003 (Farmer Management - Order Processing)
 */

import { requireFarmer } from "@/lib/auth";
import { database } from "@/lib/database";
import Link from "next/link";
import {
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  EyeIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}

interface SearchParams {
  status?: string;
  page?: string;
}

interface PageProps {
  searchParams: SearchParams;
}

export default async function FarmerOrdersPage({ searchParams }: PageProps) {
  // Require farmer authentication
  const session = await requireFarmer();

  // Fetch farmer's farm
  const farm = await database.farm.findFirst({
    where: { ownerId: session.id },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });

  // Redirect if no farm
  if (!farm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div
            className="bg-yellow-50 border-l-4 border-yellow-400 p-4"
            data-testid="no-farm-alert"
          >
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  No Farm Found
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You need to set up your farm before you can manage orders.
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    href="/register-farm"
                    className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
                  >
                    Set up farm →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get filter parameters
  const statusFilter = searchParams.status;
  const currentPage = parseInt(searchParams.page || "1", 10);
  const itemsPerPage = 20;
  const skip = (currentPage - 1) * itemsPerPage;

  // Build where clause for orders
  const whereClause: any = {
    items: {
      some: {
        product: {
          farmId: farm.id,
        },
      },
    },
  };

  if (statusFilter && statusFilter !== "all") {
    whereClause.status = statusFilter.toUpperCase();
  }

  // Fetch orders with pagination
  const [orders, totalOrders] = await Promise.all([
    database.order.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                farmId: true,
              },
            },
          },
          where: {
            product: {
              farmId: farm.id,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: itemsPerPage,
      skip,
    }),
    database.order.count({ where: whereClause }),
  ]);

  // Calculate order statistics
  const allOrders = await database.order.findMany({
    where: {
      items: {
        some: {
          product: {
            farmId: farm.id,
          },
        },
      },
    },
    include: {
      items: {
        where: {
          product: {
            farmId: farm.id,
          },
        },
      },
    },
  });

  const stats: OrderStats = {
    total: allOrders.length,
    pending: allOrders.filter((o) => o.status === "PENDING").length,
    confirmed: allOrders.filter((o) => o.status === "CONFIRMED").length,
    processing: allOrders.filter((o) => o.status === "PREPARING").length,
    shipped: allOrders.filter((o) => o.status === "READY").length,
    delivered: allOrders.filter((o) => o.status === "FULFILLED").length,
    cancelled: allOrders.filter((o) => o.status === "CANCELLED").length,
    totalRevenue: allOrders.reduce((sum, order) => {
      const farmItemsTotal = order.items.reduce(
        (itemSum, item) =>
          itemSum + Number(item.unitPrice) * Number(item.quantity),
        0,
      );
      return sum + farmItemsTotal;
    }, 0),
  };

  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  // Status options for filter
  const statusOptions = [
    { value: "all", label: "All Orders", count: stats.total },
    { value: "pending", label: "Pending", count: stats.pending },
    { value: "confirmed", label: "Confirmed", count: stats.confirmed },
    { value: "processing", label: "Processing", count: stats.processing },
    { value: "shipped", label: "Shipped", count: stats.shipped },
    { value: "delivered", label: "Delivered", count: stats.delivered },
    { value: "cancelled", label: "Cancelled", count: stats.cancelled },
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="farmer-orders-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8" data-testid="page-header">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage and fulfill customer orders for {farm.name}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div
            className="bg-white overflow-hidden shadow rounded-lg"
            data-testid="stat-total-orders"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Orders
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div
            className="bg-white overflow-hidden shadow rounded-lg"
            data-testid="stat-pending-orders"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats.pending}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div
            className="bg-white overflow-hidden shadow rounded-lg"
            data-testid="stat-processing-orders"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TruckIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Processing
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stats.processing}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div
            className="bg-white overflow-hidden shadow rounded-lg"
            data-testid="stat-total-revenue"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Revenue
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      ${stats.totalRevenue.toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          className="bg-white shadow rounded-lg mb-6"
          data-testid="order-filters"
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900">
                Filter Orders
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <Link
                  key={option.value}
                  href={`/farmer/orders?status=${option.value}`}
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                    (statusFilter || "all") === option.value
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  data-testid={`filter-${option.value}`}
                >
                  {option.label}
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                    {option.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div
          className="bg-white shadow rounded-lg overflow-hidden"
          data-testid="orders-list"
        >
          {orders.length === 0 ? (
            <div className="text-center py-12" data-testid="no-orders-message">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No orders
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter && statusFilter !== "all"
                  ? `No ${statusFilter} orders found.`
                  : "You don't have any orders yet."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {orders.map((order) => {
                const farmItems = order.items.filter(
                  (item) => item.product.farmId === farm.id,
                );
                const orderTotal = farmItems.reduce(
                  (sum, item) =>
                    sum + Number(item.unitPrice) * Number(item.quantity),
                  0,
                );

                return (
                  <li
                    key={order.id}
                    className="hover:bg-gray-50"
                    data-testid={`order-${order.id}`}
                  >
                    <div className="px-4 py-5 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900">
                              Order #{order.id.slice(0, 8)}
                            </h3>
                            <div className="ml-2 flex-shrink-0 flex">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  order.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : order.status === "CONFIRMED"
                                      ? "bg-blue-100 text-blue-800"
                                      : order.status === "PREPARING"
                                        ? "bg-purple-100 text-purple-800"
                                        : order.status === "READY"
                                          ? "bg-indigo-100 text-indigo-800"
                                          : order.status === "FULFILLED"
                                            ? "bg-green-100 text-green-800"
                                            : order.status === "COMPLETED"
                                              ? "bg-green-200 text-green-900"
                                              : "bg-red-100 text-red-800"
                                }`}
                                data-testid={`order-status-${order.id}`}
                              >
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                Customer:{" "}
                                {order.customer.name || order.customer.email}
                              </p>
                              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                {farmItems.length} item
                                {farmItems.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <p>
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              Total: ${orderTotal.toFixed(2)}
                            </p>
                            <Link
                              href={`/farmer/orders/${order.id}`}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              data-testid={`view-order-${order.id}`}
                            >
                              <EyeIcon className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="mt-6 flex items-center justify-between"
            data-testid="pagination"
          >
            <div className="flex-1 flex justify-between sm:hidden">
              <Link
                href={`/farmer/orders?status=${statusFilter || "all"}&page=${currentPage - 1}`}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Previous
              </Link>
              <Link
                href={`/farmer/orders?status=${statusFilter || "all"}&page=${currentPage + 1}`}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }`}
              >
                Next
              </Link>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{skip + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(skip + itemsPerPage, totalOrders)}
                  </span>{" "}
                  of <span className="font-medium">{totalOrders}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Link
                        key={page}
                        href={`/farmer/orders?status=${statusFilter || "all"}&page=${page}`}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? "z-10 bg-green-50 border-green-500 text-green-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                        data-testid={`page-${page}`}
                      >
                        {page}
                      </Link>
                    ),
                  )}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
