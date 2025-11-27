/**
 * 🚜 FARMER DASHBOARD - Divine Agricultural Management
 * Main dashboard for authenticated farmers
 *
 * Divine Patterns Applied:
 * - Next.js Divine Implementation (04_NEXTJS_DIVINE_IMPLEMENTATION)
 * - Agricultural Quantum Mastery (02_AGRICULTURAL_QUANTUM_MASTERY)
 * - Security Divinity (05_TESTING_SECURITY_DIVINITY)
 *
 * Functional Requirements: FR-003 (Farmer Management)
 */

import { requireFarmer } from "@/lib/auth";
import { database } from "@/lib/database";
import {
  CubeIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ChartBarIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface DashboardMetrics {
  totalProducts: number;
  activeProducts: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export default async function FarmerDashboardPage() {
  // Require farmer authentication
  const session = await requireFarmer();

  // Fetch farmer's farm
  const farm = await database.farm.findFirst({
    where: { ownerId: session.id },
    include: {
      products: {
        where: { available: true },
        take: 5,
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  // If no farm exists, redirect to create farm
  if (!farm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1
              className="text-3xl font-bold text-gray-900 mb-4"
              data-testid="no-farm-heading"
            >
              Welcome, Farmer!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              You haven't created a farm yet. Let's get started!
            </p>
            <Link
              href="/register-farm"
              className="inline-flex items-center px-6 py-3 bg-agricultural-600 text-white font-medium rounded-lg hover:bg-agricultural-700 transition-colors"
              data-testid="create-farm-button"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Your Farm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fetch dashboard metrics
  const [products, orders, revenue] = await Promise.all([
    // Products count
    database.product.count({
      where: { farmId: farm.id },
    }),
    // Orders
    database.order.findMany({
      where: { farmId: farm.id },
      include: {
        customer: {
          select: { firstName: true, lastName: true, email: true },
        },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    // Revenue calculation
    database.order.aggregate({
      where: {
        farmId: farm.id,
        status: { in: ["CONFIRMED", "READY_FOR_PICKUP", "COMPLETED"] },
      },
      _sum: { total: true },
    }),
  ]);

  const activeProducts = await database.product.count({
    where: { farmId: farm.id, available: true },
  });

  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING",
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "COMPLETED",
  ).length;

  const metrics: DashboardMetrics = {
    totalProducts: products,
    activeProducts,
    pendingOrders,
    completedOrders,
    totalRevenue: revenue._sum.total?.toNumber() || 0,
    averageOrderValue:
      completedOrders > 0
        ? (revenue._sum.total?.toNumber() || 0) / completedOrders
        : 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-3xl font-bold text-gray-900"
                data-testid="dashboard-heading"
              >
                🌾 My Farm Dashboard
              </h1>
              <p className="mt-1 text-gray-600" data-testid="farm-name">
                {farm.name}
              </p>
            </div>
            <Link
              href="/farmer/products/new"
              className="inline-flex items-center px-4 py-2 bg-agricultural-600 text-white font-medium rounded-lg hover:bg-agricultural-700 transition-colors"
              data-testid="add-product-button"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Product
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Products */}
          <div
            className="bg-white rounded-lg shadow p-6"
            data-testid="metric-products"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Products
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {metrics.totalProducts}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {metrics.activeProducts} active
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CubeIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div
            className="bg-white rounded-lg shadow p-6"
            data-testid="metric-orders"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Orders
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {metrics.pendingOrders}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {metrics.completedOrders} completed
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <ShoppingCartIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div
            className="bg-white rounded-lg shadow p-6"
            data-testid="metric-revenue"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${metrics.totalRevenue.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ${metrics.averageOrderValue.toFixed(2)} avg order
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Products Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Products
                </h2>
                <Link
                  href="/farmer/products"
                  className="text-sm text-agricultural-600 hover:text-agricultural-700 font-medium"
                  data-testid="view-all-products"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {farm.products.length > 0 ? (
                <div className="space-y-4">
                  {farm.products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      data-testid="product-item"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          ${product.price.toFixed(2)} / {product.unit}
                        </p>
                      </div>
                      <Link
                        href={`/farmer/products/${product.id}`}
                        className="text-sm text-agricultural-600 hover:text-agricultural-700"
                      >
                        Edit
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No products yet. Add your first product!
                </p>
              )}
            </div>
          </div>

          {/* Orders Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Orders
                </h2>
                <Link
                  href="/farmer/orders"
                  className="text-sm text-agricultural-600 hover:text-agricultural-700 font-medium"
                  data-testid="view-all-orders"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      data-testid="order-item"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.customer.firstName} {order.customer.lastName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${order.total.toFixed(2)}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                            order.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No orders yet. They'll appear here when customers place
                  orders.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/farmer/products"
            className="flex items-center p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            data-testid="nav-products"
          >
            <CubeIcon className="h-8 w-8 text-agricultural-600 mr-4" />
            <div>
              <p className="font-semibold text-gray-900">Products</p>
              <p className="text-sm text-gray-600">Manage inventory</p>
            </div>
          </Link>

          <Link
            href="/farmer/orders"
            className="flex items-center p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            data-testid="nav-orders"
          >
            <ShoppingCartIcon className="h-8 w-8 text-agricultural-600 mr-4" />
            <div>
              <p className="font-semibold text-gray-900">Orders</p>
              <p className="text-sm text-gray-600">Process orders</p>
            </div>
          </Link>

          <Link
            href="/farmer/analytics"
            className="flex items-center p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            data-testid="nav-analytics"
          >
            <ChartBarIcon className="h-8 w-8 text-agricultural-600 mr-4" />
            <div>
              <p className="font-semibold text-gray-900">Analytics</p>
              <p className="text-sm text-gray-600">View insights</p>
            </div>
          </Link>

          <Link
            href="/farmer/settings"
            className="flex items-center p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            data-testid="nav-settings"
          >
            <TruckIcon className="h-8 w-8 text-agricultural-600 mr-4" />
            <div>
              <p className="font-semibold text-gray-900">Farm Settings</p>
              <p className="text-sm text-gray-600">Update details</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
