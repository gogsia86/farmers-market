/**
 * 📦 ADMIN ORDERS PAGE
 * View and manage all platform orders
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Orders | Admin Dashboard",
  description: "View and manage all platform orders",
};

export default async function AdminOrdersPage() {
  const session = await auth();

  // Require admin access
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch recent orders with relations
  const orders = await database.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
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
              slug: true,
            },
          },
        },
      },
    },
  });

  // Calculate stats
  const stats = {
    total: await database.order.count(),
    pending: await database.order.count({
      where: { status: "PENDING" },
    }),
    processing: await database.order.count({
      where: { status: "PROCESSING" },
    }),
    completed: await database.order.count({
      where: { status: "COMPLETED" },
    }),
    cancelled: await database.order.count({
      where: { status: "CANCELLED" },
    }),
  };

  // Calculate total revenue
  const totalRevenue = orders.reduce((sum: any, order: any) => {
    return sum + Number(order.totalAmount);
  }, 0);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Orders</h1>
            <p className="text-gray-600 mt-2">
              View and manage platform orders
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-yellow-200">
          <p className="text-sm font-medium text-yellow-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">
            {stats.pending}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Processing</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {stats.processing}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-green-200">
          <p className="text-sm font-medium text-green-600">Completed</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {stats.completed}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-red-200">
          <p className="text-sm font-medium text-red-600">Cancelled</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {stats.cancelled}
          </p>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 mb-8 text-white">
        <p className="text-sm font-medium opacity-90">Total Revenue</p>
        <p className="text-4xl font-bold mt-2">${totalRevenue.toFixed(2)}</p>
        <p className="text-sm opacity-75 mt-2">
          From {orders.length} recent orders
        </p>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <span className="text-3xl">📦</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-600">
              Orders will appear here when customers make purchases
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
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
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {order.orderNumber || order.id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {order.user.name}
                        </div>
                        <div className="text-gray-500">{order.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.items.slice(0, 2).map((item: any, i: number) => (
                          <div key={item.id}>
                            {item.product.name}
                            {i === 1 &&
                              order.items.length > 2 &&
                              ` +${order.items.length - 2} more`}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${Number(order.totalAmount).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-green-600 hover:text-green-900 font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {orders.length >= 100 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Showing first 100 orders. Use filters to see more.
          </p>
        </div>
      )}
    </div>
  );
}

// Helper function for status badge styling
function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    REFUNDED: "bg-purple-100 text-purple-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
}
