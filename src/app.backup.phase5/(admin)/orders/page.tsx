import { requireAdmin } from "@/lib/auth";
import { database } from "@/lib/database";
import {
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

// Force dynamic rendering - no static generation
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Divine Order Management - Transaction Flow Harmonization Portal
 * Oversees order consciousness across agricultural quantum dimensions
 */
export default async function AdminOrdersPage() {
  await requireAdmin(); // Ensure divine admin access

  // Manifest order consciousness entities
  const orders = await database.order.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      farm: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
    preparing: orders.filter((o) => o.status === "PREPARING").length,
    ready: orders.filter((o) => o.status === "READY").length,
    fulfilled: orders.filter((o) => o.status === "FULFILLED").length,
    completed: orders.filter((o) => o.status === "COMPLETED").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
    totalRevenue: orders.reduce((sum, order) => sum + Number(order.total), 0),
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PREPARING":
        return "bg-purple-100 text-purple-800";
      case "READY":
        return "bg-green-100 text-green-800";
      case "FULFILLED":
        return "bg-emerald-100 text-emerald-800";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <ClockIcon className="h-4 w-4" />;
      case "CONFIRMED":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "PREPARING":
        return <ExclamationCircleIcon className="h-4 w-4" />;
      case "READY":
        return <TruckIcon className="h-4 w-4" />;
      case "FULFILLED":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "COMPLETED":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "CANCELLED":
        return <ExclamationCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-agricultural-50">
      {/* Divine Header */}
      <header className="bg-white shadow-sm border-b border-agricultural-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-agricultural-900">
                Order Consciousness Management
              </h1>
              <p className="mt-1 text-sm text-agricultural-600">
                Monitor transaction flows and order states across the
                agricultural quantum realm
              </p>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {/* Quantum Order Statistics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white rounded-lg shadow border border-agricultural-200 p-6">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600 mr-3" />
                <dl>
                  <dt className="text-sm font-medium text-agricultural-500">
                    Total Revenue
                  </dt>
                  <dd className="text-2xl font-semibold text-green-600">
                    ${orderStats.totalRevenue.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow border border-agricultural-200 p-6">
              <div className="flex items-center">
                <TruckIcon className="h-8 w-8 text-agricultural-600 mr-3" />
                <dl>
                  <dt className="text-sm font-medium text-agricultural-500">
                    Total Orders
                  </dt>
                  <dd className="text-2xl font-semibold text-agricultural-600">
                    {orderStats.total}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow border border-agricultural-200 p-6">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-amber-600 mr-3" />
                <dl>
                  <dt className="text-sm font-medium text-agricultural-500">
                    Pending
                  </dt>
                  <dd className="text-2xl font-semibold text-amber-600">
                    {orderStats.pending}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow border border-agricultural-200 p-6">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                <dl>
                  <dt className="text-sm font-medium text-agricultural-500">
                    Completed
                  </dt>
                  <dd className="text-2xl font-semibold text-green-600">
                    {orderStats.completed}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Status Overview */}
          <div className="bg-white rounded-lg shadow border border-agricultural-200 mb-6 p-6">
            <h3 className="text-lg font-medium text-agricultural-900 mb-4">
              Order Status Distribution
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {[
                {
                  status: "PENDING",
                  count: orderStats.pending,
                  color: "amber",
                },
                {
                  status: "CONFIRMED",
                  count: orderStats.confirmed,
                  color: "blue",
                },
                {
                  status: "PREPARING",
                  count: orderStats.preparing,
                  color: "purple",
                },
                { status: "READY", count: orderStats.ready, color: "green" },
                {
                  status: "FULFILLED",
                  count: orderStats.fulfilled,
                  color: "emerald",
                },
                {
                  status: "CANCELLED",
                  count: orderStats.cancelled,
                  color: "red",
                },
              ].map(({ status, count, color }) => (
                <div key={status} className="text-center">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-${color}-100 mb-2`}
                  >
                    {getStatusIcon(status)}
                  </div>
                  <div className="text-2xl font-semibold text-agricultural-900">
                    {count}
                  </div>
                  <div className="text-sm text-agricultural-500">{status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quantum Filters & Search */}
          <div className="bg-white shadow rounded-lg border border-agricultural-200 mb-6">
            <div className="px-6 py-4 border-b border-agricultural-200">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-agricultural-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search orders by number, customer, or farm..."
                      className="block w-full pl-10 pr-3 py-2 border border-agricultural-300 rounded-md leading-5 bg-white placeholder-agricultural-500 focus:outline-none focus:placeholder-agricultural-400 focus:ring-1 focus:ring-agricultural-500 focus:border-agricultural-500"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="flex gap-3">
                  <select
                    className="block pl-3 pr-10 py-2 text-base border-agricultural-300 focus:outline-none focus:ring-agricultural-500 focus:border-agricultural-500 rounded-md"
                    aria-label="Filter by order status"
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="READY">Ready</option>
                    <option value="FULFILLED">Fulfilled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>

                  <select
                    className="block pl-3 pr-10 py-2 text-base border-agricultural-300 focus:outline-none focus:ring-agricultural-500 focus:border-agricultural-500 rounded-md"
                    aria-label="Filter by fulfillment method"
                  >
                    <option value="">All Fulfillment</option>
                    <option value="DELIVERY">Delivery</option>
                    <option value="FARM_PICKUP">Farm Pickup</option>
                    <option value="MARKET_PICKUP">Market Pickup</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Divine Order List */}
          <div className="bg-white shadow rounded-lg border border-agricultural-200">
            <div className="px-6 py-4 border-b border-agricultural-200">
              <h3 className="text-lg font-medium text-agricultural-900">
                Transaction Consciousness Registry
              </h3>
              <p className="text-sm text-agricultural-500">
                Active order states in the agricultural quantum field
              </p>
            </div>

            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-agricultural-200">
                <thead className="bg-agricultural-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      Farm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      Delivery
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-agricultural-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-agricultural-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-agricultural-900">
                            #{order.orderNumber || order.id.slice(-8)}
                          </div>
                          <div className="text-sm text-agricultural-500">
                            {order._count.items} items
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-agricultural-900">
                            {(() => {
                              const firstName = order.customer.firstName;
                              const lastName = order.customer.lastName;
                              if (firstName && lastName)
                                return `${firstName} ${lastName}`;
                              if (firstName) return firstName;
                              if (lastName) return lastName;
                              return "Unnamed Customer";
                            })()}
                          </div>
                          <div className="text-sm text-agricultural-500">
                            {order.customer.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-agricultural-900">
                          {order.farm.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}
                        >
                          <span className="mr-1">
                            {getStatusIcon(order.status)}
                          </span>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-agricultural-900">
                          ${Number(order.total).toFixed(2)}
                        </div>
                        <div className="text-sm text-agricultural-500">
                          {order.paymentStatus}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-agricultural-500">
                          {order.fulfillmentMethod}
                          {order.scheduledDate && (
                            <div className="text-xs">
                              {new Date(
                                order.scheduledDate,
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-agricultural-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          className="text-agricultural-600 hover:text-agricultural-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-agricultural-50 px-6 py-3 border-t border-agricultural-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-agricultural-700">
                  Showing 1 to {orders.length} of {orders.length} orders
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm border border-agricultural-300 rounded-md text-agricultural-700 bg-white hover:bg-agricultural-50">
                    Previous
                  </button>
                  <button className="px-3 py-1 text-sm border border-agricultural-300 rounded-md text-agricultural-700 bg-white hover:bg-agricultural-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
