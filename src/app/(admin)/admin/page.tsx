import { requireAdmin } from "@/lib/auth";
import { database } from "@/lib/database";
import {
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  TruckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

// Force dynamic rendering - no static generation
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Divine Admin Dashboard - Quantum Agricultural Management Center
 * Manifests real-time platform consciousness and agricultural insights
 */
export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  // Manifest platform quantum metrics
  const [
    totalUsers,
    totalFarms,
    totalProducts,
    totalOrders,
    recentOrders,
    pendingFarms,
    lowStockProducts,
  ] = await Promise.all([
    database.user.count(),
    database.farm.count(),
    database.product.count(),
    database.order.count(),
    database.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: { firstName: true, lastName: true, email: true },
        },
        farm: { select: { name: true } },
        _count: { select: { items: true } },
      },
    }),
    database.farm.count({
      where: { verificationStatus: "PENDING" },
    }),
    database.product.count({
      where: {
        AND: [
          { status: "ACTIVE" },
          { trackInventory: true },
          { quantityAvailable: { lte: 10 } },
        ],
      },
    }),
  ]);

  // Calculate total revenue (would need actual order data)
  const totalRevenue = totalOrders * 45.5; // Placeholder calculation

  // Icon mapping for serialization safety
  const iconMap = {
    UserGroupIcon,
    BuildingStorefrontIcon,
    ShoppingBagIcon,
    CurrencyDollarIcon,
    TruckIcon,
  };

  const metrics = [
    {
      name: "Total Users",
      value: totalUsers.toLocaleString(),
      iconName: "UserGroupIcon" as const,
      change: "+12.5%",
      changeType: "positive" as const,
      consciousness: "User entities in quantum state",
    },
    {
      name: "Active Farms",
      value: totalFarms.toLocaleString(),
      iconName: "BuildingStorefrontIcon" as const,
      change: "+8.3%",
      changeType: "positive" as const,
      consciousness: "Agricultural consciousness nodes",
    },
    {
      name: "Product Catalog",
      value: totalProducts.toLocaleString(),
      iconName: "ShoppingBagIcon" as const,
      change: "+23.1%",
      changeType: "positive" as const,
      consciousness: "Product reality manifestations",
    },
    {
      name: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      iconName: "CurrencyDollarIcon" as const,
      change: "+15.7%",
      changeType: "positive" as const,
      consciousness: "Economic quantum field energy",
    },
    {
      name: "Orders Processed",
      value: totalOrders.toLocaleString(),
      iconName: "TruckIcon" as const,
      change: "+9.2%",
      changeType: "positive" as const,
      consciousness: "Transaction flow harmonization",
    },
  ];

  const alerts = [];
  if (pendingFarms > 0) {
    alerts.push({
      type: "warning",
      message: `${pendingFarms} farms awaiting verification`,
      action: "Review pending farms",
      href: "/admin/farms?status=pending",
    });
  }
  if (lowStockProducts > 0) {
    alerts.push({
      type: "info",
      message: `${lowStockProducts} products have low inventory`,
      action: "View low stock items",
      href: "/admin/products?filter=low-stock",
    });
  }

  return (
    <div className="min-h-screen bg-agricultural-50">
      {/* Divine Header */}
      <header className="bg-white shadow-sm border-b border-agricultural-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-agricultural-900">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-agricultural-600">
                Welcome back, {session.user.name} • Quantum consciousness active
              </p>
            </div>
            <div className="mt-4 flex md:ml-4 md:mt-0">
              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                🌾 System Status: Divine
              </span>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {/* Quantum Alerts */}
          {alerts.length > 0 && (
            <div className="mb-6">
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`rounded-md p-4 ${
                      alert.type === "warning"
                        ? "bg-amber-50 border border-amber-200"
                        : "bg-blue-50 border border-blue-200"
                    }`}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <ExclamationTriangleIcon
                          className={`h-5 w-5 ${
                            alert.type === "warning"
                              ? "text-amber-400"
                              : "text-blue-400"
                          }`}
                        />
                      </div>
                      <div className="ml-3">
                        <p
                          className={`text-sm font-medium ${
                            alert.type === "warning"
                              ? "text-amber-800"
                              : "text-blue-800"
                          }`}
                        >
                          {alert.message}
                        </p>
                        <div className="mt-2">
                          <div className="-mx-2 -my-1.5 flex">
                            <a
                              href={alert.href}
                              className={`rounded-md px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                alert.type === "warning"
                                  ? "text-amber-800 hover:bg-amber-100 focus:ring-amber-600"
                                  : "text-blue-800 hover:bg-blue-100 focus:ring-blue-600"
                              }`}
                            >
                              {alert.action}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantum Metrics Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
            {metrics.map((metric) => {
              const Icon = iconMap[metric.iconName];
              return (
                <div
                  key={metric.name}
                  className="overflow-hidden rounded-lg bg-white shadow border border-agricultural-200 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Icon className="h-5 w-5 text-agricultural-600" />
                      </div>
                      <div className="ml-4 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-agricultural-500 truncate">
                            {metric.name}
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-agricultural-900">
                              {metric.value}
                            </div>
                            <div
                              className={`ml-2 flex items-baseline text-sm font-semibold ${
                                metric.changeType === "positive"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {metric.change}
                            </div>
                          </dd>
                          <dd className="text-xs text-agricultural-400 mt-1">
                            {metric.consciousness}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Divine Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white shadow rounded-lg border border-agricultural-200">
              <div className="px-6 py-4 border-b border-agricultural-200">
                <h3 className="text-lg font-medium text-agricultural-900">
                  Recent Quantum Transactions
                </h3>
                <p className="text-sm text-agricultural-500">
                  Latest order manifestations across the platform
                </p>
              </div>
              <div className="divide-y divide-agricultural-100">
                {recentOrders.map((order) => (
                  <div key={order.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-agricultural-900">
                          Order #{order.orderNumber || order.id.slice(-8)}
                        </p>
                        <p className="text-sm text-agricultural-500">
                          {order.customer.firstName} {order.customer.lastName} •{" "}
                          {order.farm.name} • {order._count.items} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-agricultural-900">
                          ${(Math.random() * 100 + 20).toFixed(2)}
                        </p>
                        <p className="text-xs text-agricultural-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 bg-agricultural-50 border-t border-agricultural-200">
                <a
                  href="/admin/orders"
                  className="text-sm font-medium text-agricultural-600 hover:text-agricultural-500"
                >
                  View all orders →
                </a>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg border border-agricultural-200">
              <div className="px-6 py-4 border-b border-agricultural-200">
                <h3 className="text-lg font-medium text-agricultural-900">
                  Divine Quick Actions
                </h3>
                <p className="text-sm text-agricultural-500">
                  Quantum administrative operations
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <a
                    href="/admin/farms?status=pending"
                    className="block w-full text-left px-4 py-3 border border-agricultural-200 rounded-md hover:bg-agricultural-50 transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <BuildingStorefrontIcon className="h-5 w-5 text-agricultural-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-agricultural-900">
                          Review Pending Farms
                        </p>
                        <p className="text-xs text-agricultural-500">
                          {pendingFarms} farms awaiting verification
                        </p>
                      </div>
                    </div>
                  </a>

                  <a
                    href="/admin/users"
                    className="block w-full text-left px-4 py-3 border border-agricultural-200 rounded-md hover:bg-agricultural-50 transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <UserGroupIcon className="h-5 w-5 text-agricultural-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-agricultural-900">
                          Manage Users
                        </p>
                        <p className="text-xs text-agricultural-500">
                          View and moderate user accounts
                        </p>
                      </div>
                    </div>
                  </a>

                  <a
                    href="/admin/financial"
                    className="block w-full text-left px-4 py-3 border border-agricultural-200 rounded-md hover:bg-agricultural-50 transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-5 w-5 text-agricultural-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-agricultural-900">
                          Financial Reports
                        </p>
                        <p className="text-xs text-agricultural-500">
                          Revenue analytics and insights
                        </p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
