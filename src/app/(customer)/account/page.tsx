// 🧠 DIVINE PATTERN: Consumer Account Consciousness Dashboard
// 📚 Reference: 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
// 🌾 Domain: Consumer Agricultural Experience Management
// ⚡ Performance: Quantum Data Loading with Parallel Queries

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";

// Force dynamic rendering for database access
export const dynamic = "force-dynamic";
export const revalidate = 0;
import {
  BellIcon,
  ChevronRightIcon,
  CreditCardIcon,
  HeartIcon,
  MapPinIcon,
  ShoppingBagIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { redirect } from "next/navigation";

/**
 * Divine Consumer Account Dashboard
 * Manifests user consciousness and order history across agricultural quantum dimensions
 */
export default async function CustomerAccountPage() {
  // Authenticate user consciousness
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  // Manifest user quantum data in parallel for optimal performance
  const [user, recentOrders, orderStats, savedFarms] = await Promise.all([
    database.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    }),

    database.order.findMany({
      where: { customerId: session.user.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    }),

    database.order.aggregate({
      where: {
        customerId: session.user.id,
        status: { not: "CANCELLED" },
      },
      _count: true,
      _sum: {
        total: true,
      },
    }),

    // Get farms from user's orders (representing "favorite" farms)
    database.farm.findMany({
      where: {
        orders: {
          some: {
            customerId: session.user.id,
          },
        },
      },
      take: 4,
      select: {
        id: true,
        name: true,
        description: true,
        images: true,
        city: true,
        state: true,
      },
      distinct: ["id"],
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  const totalOrders = orderStats._count || 0;
  const totalSpent = Number(orderStats._sum.total || 0);

  // Helper function for order status styling
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      PREPARING: "bg-purple-100 text-purple-800",
      READY: "bg-indigo-100 text-indigo-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-agricultural-50">
      {/* Divine Header - User Consciousness Overview */}
      <header className="bg-white shadow-sm border-b border-agricultural-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center">
                <UserCircleIcon className="h-12 w-12 text-agricultural-600 mr-4" />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-agricultural-900">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="mt-1 text-sm text-agricultural-600">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex md:ml-4 md:mt-0">
              <Link
                href="/account/edit"
                className="inline-flex items-center rounded-md bg-agricultural-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-agricultural-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-agricultural-600"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Account Stats - Quantum Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white rounded-lg shadow border border-agricultural-200 p-6">
            <div className="flex items-center">
              <ShoppingBagIcon className="h-8 w-8 text-agricultural-600 mr-3" />
              <div>
                <div className="text-sm font-medium text-agricultural-500">
                  Total Orders
                </div>
                <div className="text-2xl font-semibold text-agricultural-900">
                  {totalOrders}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-agricultural-200 p-6">
            <div className="flex items-center">
              <CreditCardIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <div className="text-sm font-medium text-agricultural-500">
                  Total Spent
                </div>
                <div className="text-2xl font-semibold text-green-600">
                  ${totalSpent.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-agricultural-200 p-6">
            <div className="flex items-center">
              <HeartIcon className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <div className="text-sm font-medium text-agricultural-500">
                  Favorite Farms
                </div>
                <div className="text-2xl font-semibold text-red-600">
                  {savedFarms.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Divine Navigation */}
        <div className="bg-white rounded-lg shadow border border-agricultural-200 mb-8">
          <div className="px-6 py-4 border-b border-agricultural-200">
            <h2 className="text-lg font-medium text-agricultural-900">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-agricultural-200">
            <Link
              href="/account/orders"
              className="px-6 py-4 hover:bg-agricultural-50 transition-colors duration-200 flex items-center justify-between"
            >
              <div className="flex items-center">
                <ShoppingBagIcon className="h-5 w-5 text-agricultural-600 mr-3" />
                <span className="text-sm font-medium text-agricultural-900">
                  View All Orders
                </span>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-agricultural-400" />
            </Link>

            <Link
              href="/account/addresses"
              className="px-6 py-4 hover:bg-agricultural-50 transition-colors duration-200 flex items-center justify-between"
            >
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 text-agricultural-600 mr-3" />
                <span className="text-sm font-medium text-agricultural-900">
                  Manage Addresses
                </span>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-agricultural-400" />
            </Link>

            <Link
              href="/account/preferences"
              className="px-6 py-4 hover:bg-agricultural-50 transition-colors duration-200 flex items-center justify-between"
            >
              <div className="flex items-center">
                <BellIcon className="h-5 w-5 text-agricultural-600 mr-3" />
                <span className="text-sm font-medium text-agricultural-900">
                  Preferences
                </span>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-agricultural-400" />
            </Link>

            <Link
              href="/account/favorites"
              className="px-6 py-4 hover:bg-agricultural-50 transition-colors duration-200 flex items-center justify-between"
            >
              <div className="flex items-center">
                <HeartIcon className="h-5 w-5 text-agricultural-600 mr-3" />
                <span className="text-sm font-medium text-agricultural-900">
                  Favorites
                </span>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-agricultural-400" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders - Order Consciousness Timeline */}
          <div className="bg-white rounded-lg shadow border border-agricultural-200">
            <div className="px-6 py-4 border-b border-agricultural-200">
              <h2 className="text-lg font-medium text-agricultural-900">
                Recent Orders
              </h2>
              <p className="text-sm text-agricultural-500">
                Your latest agricultural purchases
              </p>
            </div>

            <div className="divide-y divide-agricultural-200">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="px-6 py-4 hover:bg-agricultural-50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="font-medium text-agricultural-900">
                          Order #{order.id.slice(0, 8)}
                        </div>
                        <span
                          className={`ml-3 inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-agricultural-900">
                        ${Number(order.total).toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-agricultural-500">
                        {order.farm.name} • {order._count.items} items
                      </div>
                      <div className="text-sm text-agricultural-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-2">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-sm font-medium text-agricultural-600 hover:text-agricultural-500"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <ShoppingBagIcon className="mx-auto h-12 w-12 text-agricultural-400" />
                  <h3 className="mt-2 text-sm font-semibold text-agricultural-900">
                    No orders yet
                  </h3>
                  <p className="mt-1 text-sm text-agricultural-500">
                    Start shopping to see your order history here.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/search"
                      className="inline-flex items-center rounded-md bg-agricultural-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-agricultural-500"
                    >
                      Browse Farms & Products
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {recentOrders.length > 0 && (
              <div className="px-6 py-3 bg-agricultural-50 border-t border-agricultural-200">
                <Link
                  href="/account/orders"
                  className="text-sm font-medium text-agricultural-600 hover:text-agricultural-500"
                >
                  View all orders →
                </Link>
              </div>
            )}
          </div>

          {/* Favorite Farms - Agricultural Consciousness Connections */}
          <div className="bg-white rounded-lg shadow border border-agricultural-200">
            <div className="px-6 py-4 border-b border-agricultural-200">
              <h2 className="text-lg font-medium text-agricultural-900">
                Farms You've Ordered From
              </h2>
              <p className="text-sm text-agricultural-500">
                Your trusted agricultural partners
              </p>
            </div>

            <div className="divide-y divide-agricultural-200">
              {savedFarms.length > 0 ? (
                savedFarms.map((farm) => (
                  <Link
                    key={farm.id}
                    href={`/farms/${farm.id}`}
                    className="px-6 py-4 hover:bg-agricultural-50 transition-colors duration-200 flex items-center"
                  >
                    {farm.images && farm.images.length > 0 && (
                      <img
                        src={farm.images[0]}
                        alt={farm.name}
                        className="h-12 w-12 rounded-lg object-cover mr-4"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-agricultural-900">
                        {farm.name}
                      </div>
                      <div className="text-sm text-agricultural-500">
                        {farm.city}, {farm.state}
                      </div>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-agricultural-400" />
                  </Link>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <HeartIcon className="mx-auto h-12 w-12 text-agricultural-400" />
                  <h3 className="mt-2 text-sm font-semibold text-agricultural-900">
                    No favorite farms yet
                  </h3>
                  <p className="mt-1 text-sm text-agricultural-500">
                    Order from farms to build your favorites list.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/search"
                      className="inline-flex items-center rounded-md bg-agricultural-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-agricultural-500"
                    >
                      Discover Farms
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {savedFarms.length > 0 && (
              <div className="px-6 py-3 bg-agricultural-50 border-t border-agricultural-200">
                <Link
                  href="/account/favorites"
                  className="text-sm font-medium text-agricultural-600 hover:text-agricultural-500"
                >
                  View all favorites →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Account Information Section */}
        <div className="mt-8 bg-white rounded-lg shadow border border-agricultural-200">
          <div className="px-6 py-4 border-b border-agricultural-200">
            <h2 className="text-lg font-medium text-agricultural-900">
              Account Information
            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-agricultural-100">
              <div>
                <div className="text-sm font-medium text-agricultural-500">
                  Email Address
                </div>
                <div className="mt-1 text-sm text-agricultural-900">
                  {user.email}
                </div>
              </div>
              <Link
                href="/account/edit"
                className="text-sm font-medium text-agricultural-600 hover:text-agricultural-500"
              >
                Edit
              </Link>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-agricultural-100">
              <div>
                <div className="text-sm font-medium text-agricultural-500">
                  Phone Number
                </div>
                <div className="mt-1 text-sm text-agricultural-900">
                  {user.phone || "Not provided"}
                </div>
              </div>
              <Link
                href="/account/edit"
                className="text-sm font-medium text-agricultural-600 hover:text-agricultural-500"
              >
                Edit
              </Link>
            </div>

            <div className="flex justify-between items-center py-3">
              <div>
                <div className="text-sm font-medium text-agricultural-500">
                  Member Since
                </div>
                <div className="mt-1 text-sm text-agricultural-900">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
