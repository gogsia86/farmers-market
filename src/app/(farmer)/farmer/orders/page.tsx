import { auth } from "@/lib/auth";
import type { Order } from "@prisma/client";

import { database } from "@/lib/database";
import { formatCurrency } from "@/lib/utils/currency";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Orders | Farmer Dashboard",
  description: "View and manage your farm orders",
};

export default async function FarmerOrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/farmer/orders");
  }

  if (session.user.role !== "FARMER") {
    redirect("/");
  }

  // Get farmer's farms
  const farms = await database.farm.findMany({
    where: {
      ownerId: session.user.id,
    },
    select: {
      id: true,
      name: true,
    },
  });

  const farmIds = farms.map((f: any) => f.id);

  // Get all orders for farmer's farms
  const orders =
    farmIds.length > 0
      ? await database.order.findMany({
          where: {
            farmId: {
              in: farmIds,
            },
          },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            farm: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 100,
        })
      : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📦 Orders</h1>
              <p className="mt-2 text-gray-600">
                View and manage orders from your farms
              </p>
            </div>
            <Link
              href="/farmer/dashboard"
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Orders List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              All Orders ({orders.length})
            </h2>
          </div>
          <div className="p-6" data-testid="orders-list">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm font-medium text-gray-900">
                  No orders yet
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Orders will appear here once customers make purchases
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Farm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
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
                          <div className="text-sm text-gray-900">
                            {order.createdAt.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.createdAt.toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.customer.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.farm.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : order.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.status === "CANCELLED"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(Number(order.total))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/farmer/orders/${order.id}`}
                            className="text-green-600 hover:text-green-700 font-medium"
                          >
                            View Details →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        {orders.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600">
                Total Orders
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {orders.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600">
                Total Revenue
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(
                  orders.reduce(
                    (sum: any, order: any) => sum + Number(order.total),
                    0,
                  ),
                )}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600">
                Pending Orders
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {orders.filter((o: any) => o.status === "PENDING").length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
