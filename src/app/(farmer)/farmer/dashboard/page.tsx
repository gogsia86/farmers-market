import { auth } from "@/lib/auth";

import { database } from "@/lib/database";
import { farmService } from "@/lib/services/farm.service";
import { formatCurrency } from "@/lib/utils/currency";
import { startOfMonth } from "date-fns";
import { DollarSign, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Farmer Dashboard | Farmers Market",
  description: "Manage your farms and products",
};

export default async function FarmerDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/farmer/dashboard");
  }

  // Get farmer's farms
  const { farms } = await farmService.getAllFarms({
    ownerId: session.user.id,
    page: 1,
    limit: 10,
  });

  // Get farmer's statistics
  const farmIds = farms.map((f) => f.id);

  // Calculate monthly revenue and orders
  const orders =
    farmIds.length > 0
      ? await database.order.findMany({
          where: {
            farmId: {
              in: farmIds,
            },
            createdAt: {
              gte: startOfMonth(new Date()),
            },
          },
          select: {
            total: true,
            status: true,
            createdAt: true,
          },
        })
      : [];

  const monthlyRevenue = orders.reduce(
    (sum: any, order: any) => sum + Number(order.total),
    0,
  );
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o: any) =>
    ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(o.status),
  ).length;

  // Get today's orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter(
    (o: any) => new Date(o.createdAt) >= today,
  ).length;

  // Get total products count
  const totalProducts =
    farmIds.length > 0
      ? await database.product.count({
          where: {
            farmId: {
              in: farmIds,
            },
          },
        })
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🧑‍🌾 Farmer Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Welcome back, {session.user.name}!
              </p>
            </div>
            <Link
              href="/farmer/farms/new"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Farm
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid - Enhanced with Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Monthly Revenue Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Monthly Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(monthlyRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">This Month</p>
              </div>
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {totalOrders}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {activeOrders} active • {todayOrders} today
                </p>
              </div>
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <ShoppingBag className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Products Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {totalProducts}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Across {farms.length} farm{farms.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Farms Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Farms</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {farms.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {farms.filter((f) => f.status === "ACTIVE").length} active
                </p>
              </div>
              <div className="flex-shrink-0 bg-amber-100 rounded-lg p-3">
                <svg
                  className="w-8 h-8 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              📦 Recent Orders
            </h2>
            {totalOrders > 0 && (
              <Link
                href="/farmer/orders"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View All Orders →
              </Link>
            )}
          </div>
          <div className="p-6" data-testid="farmer-orders-section">
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm font-medium text-gray-900">
                  No orders yet
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Orders will appear here once customers make purchases
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order: any, index: any) => (
                  <div
                    key={`${order.createdAt.toISOString()}-${index}`}
                    className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        Order from {order.createdAt.toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Status:{" "}
                        <span
                          className={`font-medium ${
                            order.status === "COMPLETED"
                              ? "text-green-600"
                              : order.status === "PENDING"
                                ? "text-yellow-600"
                                : "text-blue-600"
                          }`}
                        >
                          {order.status}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(Number(order.total))}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Farms List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Farms</h2>
          </div>
          <div className="p-6">
            {farms.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No farms yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first farm.
                </p>
                <div className="mt-6">
                  <Link
                    href="/farmer/farms/new"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                  >
                    Create Farm
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {farms.map((farm: any) => (
                  <Link
                    key={farm.id}
                    href={`/farmer/farms/${farm.id}`}
                    className="block group"
                  >
                    <div className="bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 transition-colors p-6">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600">
                        {farm.name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {farm.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            farm.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : farm.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {farm.status.replace(/_/g, " ")}
                        </span>
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
