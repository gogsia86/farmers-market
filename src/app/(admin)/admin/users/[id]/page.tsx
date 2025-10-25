import { requireAdmin } from "@/lib/auth";
import { database } from "@/lib/database";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CreditCardIcon,
  EnvelopeIcon,
  MapPinIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserActionButtons } from "./UserActionButtons";

/**
 * Divine User Detail View - Individual User Consciousness Profile
 * Complete user entity manifestation with activity logs and admin actions
 */

// Helper function for status badge colors
function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800";
    case "SUSPENDED":
      return "bg-red-100 text-red-800";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
}

export default async function UserDetailPage({
  params,
}: {
  readonly params: { id: string };
}) {
  await requireAdmin(); // Ensure admin access

  // Manifest user consciousness with complete relational data
  const user = await database.user.findUnique({
    where: { id: params.id },
    include: {
      farms: {
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              inStock: true,
            },
            take: 5,
          },
          _count: {
            select: { products: true },
          },
        },
      },
      orders: {
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
        take: 10,
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Calculate user metrics
  const totalSpent = user.orders.reduce(
    (sum, order) => sum + Number(order.total),
    0
  );
  const avgOrderValue =
    user._count.orders > 0 ? totalSpent / user._count.orders : 0;
  const lastOrderDate = user.orders[0]?.createdAt;

  return (
    <div className="min-h-screen bg-agricultural-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-agricultural-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/users"
                className="inline-flex items-center text-agricultural-600 hover:text-agricultural-500"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Users
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-agricultural-900">
                  {user.name || "Unnamed User"}
                </h1>
                <p className="text-sm text-agricultural-600">
                  User ID: {user.id} • {user.role} • {user.status}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <UserActionButtons user={user} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg border border-agricultural-200">
              <div className="px-6 py-6">
                <div className="flex items-center">
                  <div className="h-20 w-20 rounded-full bg-agricultural-600 flex items-center justify-center">
                    <span className="text-white text-2xl font-medium">
                      {user.name?.[0] || user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-xl font-semibold text-agricultural-900">
                      {user.name || "Unnamed User"}
                    </h3>
                    <p className="text-sm text-agricultural-500">
                      {user.email}
                    </p>
                    <div className="mt-2 flex items-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(user.status)}`}
                      >
                        {user.status}
                      </span>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-agricultural-100 text-agricultural-800">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-agricultural-200 pt-6">
                  <dl className="space-y-4">
                    <div className="flex items-center">
                      <dt className="flex items-center text-sm text-agricultural-500">
                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                        Email
                      </dt>
                      <dd className="ml-auto text-sm text-agricultural-900">
                        {user.email}
                      </dd>
                    </div>
                    <div className="flex items-center">
                      <dt className="flex items-center text-sm text-agricultural-500">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Joined
                      </dt>
                      <dd className="ml-auto text-sm text-agricultural-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="flex items-center">
                      <dt className="flex items-center text-sm text-agricultural-500">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Last Active
                      </dt>
                      <dd className="ml-auto text-sm text-agricultural-900">
                        {new Date(user.updatedAt).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* User Statistics */}
            <div className="mt-6 bg-white shadow rounded-lg border border-agricultural-200">
              <div className="px-6 py-4 border-b border-agricultural-200">
                <h3 className="text-lg font-medium text-agricultural-900">
                  Activity Metrics
                </h3>
              </div>
              <div className="px-6 py-6">
                <dl className="space-y-4">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-agricultural-500">
                      Total Orders
                    </dt>
                    <dd className="text-lg font-semibold text-agricultural-900">
                      {user._count.orders}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-agricultural-500">
                      Total Spent
                    </dt>
                    <dd className="text-lg font-semibold text-agricultural-900">
                      ${totalSpent.toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-agricultural-500">
                      Avg Order Value
                    </dt>
                    <dd className="text-lg font-semibold text-agricultural-900">
                      ${avgOrderValue.toFixed(2)}
                    </dd>
                  </div>
                  {lastOrderDate && (
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-agricultural-500">
                        Last Order
                      </dt>
                      <dd className="text-sm text-agricultural-900">
                        {new Date(lastOrderDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Farm Information (if farmer) */}
            {user.farm && (
              <div className="bg-white shadow rounded-lg border border-agricultural-200">
                <div className="px-6 py-4 border-b border-agricultural-200">
                  <h3 className="text-lg font-medium text-agricultural-900">
                    Farm Information
                  </h3>
                </div>
                <div className="px-6 py-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xl font-semibold text-agricultural-900">
                        {user.farm.name}
                      </h4>
                      <p className="text-sm text-agricultural-500 mt-1">
                        {user.farm.description}
                      </p>
                      <div className="mt-4 flex items-center space-x-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.farm.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {user.farm.status}
                        </span>
                        <span className="text-sm text-agricultural-500">
                          {user.farm._count.products} products
                        </span>
                      </div>
                    </div>
                  </div>

                  {user.farm.products.length > 0 && (
                    <div className="mt-6">
                      <h5 className="text-sm font-medium text-agricultural-900 mb-3">
                        Recent Products
                      </h5>
                      <div className="space-y-2">
                        {user.farm.products.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between py-2 px-3 bg-agricultural-50 rounded-md"
                          >
                            <span className="text-sm text-agricultural-900">
                              {product.name}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-agricultural-600">
                                ${product.price}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  product.inStock
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {product.inStock ? "In Stock" : "Out of Stock"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <div className="bg-white shadow rounded-lg border border-agricultural-200">
              <div className="px-6 py-4 border-b border-agricultural-200">
                <h3 className="text-lg font-medium text-agricultural-900">
                  Recent Orders
                </h3>
              </div>
              <div className="px-6 py-6">
                {user.orders.length > 0 ? (
                  <div className="space-y-4">
                    {user.orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-agricultural-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-sm font-medium text-agricultural-900">
                              Order #{order.id.slice(-8)}
                            </span>
                            <span className="ml-2 text-sm text-agricultural-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(order.status)}`}
                            >
                              {order.status}
                            </span>
                            <span className="text-sm font-medium text-agricultural-900">
                              ${order.total}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-agricultural-600">
                          {order.orderItems.length} items •{" "}
                          {order.orderItems[0]?.product.name}
                          {order.orderItems.length > 1 &&
                            ` +${order.orderItems.length - 1} more`}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-agricultural-500 text-center py-8">
                    No orders found for this user.
                  </p>
                )}
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-white shadow rounded-lg border border-agricultural-200">
              <div className="px-6 py-4 border-b border-agricultural-200">
                <h3 className="text-lg font-medium text-agricultural-900">
                  Activity Log
                </h3>
              </div>
              <div className="px-6 py-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-agricultural-900">
                        User account created
                      </p>
                      <p className="text-xs text-agricultural-500">
                        {new Date(user.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {user.farm && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-agricultural-100 flex items-center justify-center">
                          <MapPinIcon className="h-4 w-4 text-agricultural-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-agricultural-900">
                          Farm &ldquo;{user.farm.name}&rdquo; registered
                        </p>
                        <p className="text-xs text-agricultural-500">
                          {new Date(user.farm.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {lastOrderDate && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <CreditCardIcon className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-agricultural-900">
                          Last order placed
                        </p>
                        <p className="text-xs text-agricultural-500">
                          {new Date(lastOrderDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
