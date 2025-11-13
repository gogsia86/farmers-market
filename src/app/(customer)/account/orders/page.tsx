// 🧠 DIVINE PATTERN: Order History Consciousness Portal
// 📚 Reference: 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
// 🌾 Domain: Consumer Order Management & Tracking
// ⚡ Performance: Optimized Pagination with Quantum Loading

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { FunnelIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { redirect } from "next/navigation";

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * Divine Order History Dashboard
 * Manifests complete order consciousness timeline for consumer
 */
export default async function CustomerOrdersPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string };
}) {
  // Authenticate user consciousness
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/account/orders");
  }

  const page = Number.parseInt(searchParams.page || "1");
  const pageSize = 20;
  const statusFilter = searchParams.status;

  // Build filter conditions
  const whereCondition: any = {
    customerId: session.user.id,
  };

  if (statusFilter && statusFilter !== "all") {
    whereCondition.status = statusFilter.toUpperCase();
  }

  // Manifest orders with quantum pagination
  const [orders, totalCount] = await Promise.all([
    database.order.findMany({
      where: whereCondition,
      take: pageSize,
      skip: (page - 1) * pageSize,
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
    database.order.count({
      where: whereCondition,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

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

  const statuses = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "preparing", label: "Preparing" },
    { value: "ready", label: "Ready" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="min-h-screen bg-agricultural-50">
      {/* Divine Header */}
      <header className="bg-white shadow-sm border-b border-agricultural-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-agricultural-900">
                Order History
              </h1>
              <p className="mt-1 text-sm text-agricultural-600">
                View and track all your agricultural purchases
              </p>
            </div>
            <div className="mt-4 flex md:ml-4 md:mt-0">
              <Link
                href="/account"
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-agricultural-900 shadow-sm ring-1 ring-inset ring-agricultural-300 hover:bg-agricultural-50"
              >
                ← Back to Account
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow border border-agricultural-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-agricultural-600" />
              <span className="text-sm font-medium text-agricultural-900">
                Filter by Status:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <Link
                  key={status.value}
                  href={`/account/orders?status=${status.value}`}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    (statusFilter || "all") === status.value
                      ? "bg-agricultural-600 text-white"
                      : "bg-agricultural-100 text-agricultural-700 hover:bg-agricultural-200"
                  }`}
                >
                  {status.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow border border-agricultural-200">
          <div className="px-6 py-4 border-b border-agricultural-200">
            <h2 className="text-lg font-medium text-agricultural-900">
              {totalCount} {totalCount === 1 ? "Order" : "Orders"} Found
            </h2>
          </div>

          {orders.length > 0 ? (
            <div className="divide-y divide-agricultural-200">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="px-6 py-4 hover:bg-agricultural-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {order.farm.images && order.farm.images.length > 0 && (
                        <img
                          src={order.farm.images[0]}
                          alt={order.farm.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium text-agricultural-900">
                          {order.farm.name}
                        </div>
                        <div className="text-sm text-agricultural-500">
                          Order #{order.id.slice(0, 8)}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-agricultural-500">
                        Order Date
                      </div>
                      <div className="text-sm text-agricultural-900">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-agricultural-500">
                        Total Amount
                      </div>
                      <div className="text-sm font-medium text-agricultural-900">
                        ${Number(order.total).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-agricultural-500">Items</div>
                      <div className="text-sm text-agricultural-900">
                        {order._count.items}{" "}
                        {order._count.items === 1 ? "item" : "items"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-agricultural-500">
                      {order.fulfillmentMethod === "DELIVERY"
                        ? "Delivery"
                        : "Pickup"}{" "}
                      {order.scheduledDate &&
                        `• ${new Date(order.scheduledDate).toLocaleDateString()}`}
                    </div>
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-sm font-medium text-agricultural-600 hover:text-agricultural-500"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <ShoppingBagIcon className="mx-auto h-16 w-16 text-agricultural-400" />
              <h3 className="mt-4 text-lg font-semibold text-agricultural-900">
                No orders found
              </h3>
              <p className="mt-2 text-sm text-agricultural-500">
                {statusFilter && statusFilter !== "all"
                  ? `You don't have any ${statusFilter} orders yet.`
                  : "You haven't placed any orders yet."}
              </p>
              <div className="mt-6">
                <Link
                  href="/search"
                  className="inline-flex items-center rounded-md bg-agricultural-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-agricultural-500"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-agricultural-200 flex items-center justify-between">
              <div className="text-sm text-agricultural-700">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={
                      statusFilter
                        ? `/account/orders?page=${page - 1}&status=${statusFilter}`
                        : `/account/orders?page=${page - 1}`
                    }
                    className="px-3 py-1 rounded-md text-sm font-medium bg-agricultural-100 text-agricultural-700 hover:bg-agricultural-200"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={
                      statusFilter
                        ? `/account/orders?page=${page + 1}&status=${statusFilter}`
                        : `/account/orders?page=${page + 1}`
                    }
                    className="px-3 py-1 rounded-md text-sm font-medium bg-agricultural-600 text-white hover:bg-agricultural-500"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
