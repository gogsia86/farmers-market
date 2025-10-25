import { requireAdmin } from "@/lib/auth";
import { database } from "@/lib/database";
import {
  BanknotesIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

/**
 * Divine Financial Analytics - Monetary Flow Consciousness Portal
 * Monitors agricultural commerce quantum states and revenue harmonics
 */
export default async function AdminFinancialsPage() {
  await requireAdmin(); // Ensure divine financial access

  // Manifest financial consciousness data
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const lastThirtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    currentPeriodOrders,
    previousPeriodOrders,
    totalRevenue,
    pendingPayouts,
    recentPayouts,
  ] = await Promise.all([
    // Current 30 days orders
    database.order.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        farm: {
          select: {
            name: true,
          },
        },
      },
    }),

    // Previous 30 days orders for comparison
    database.order.findMany({
      where: {
        createdAt: {
          gte: lastThirtyDaysAgo,
          lt: thirtyDaysAgo,
        },
        status: {
          not: "CANCELLED",
        },
      },
    }),

    // Total platform revenue (all time)
    database.order.aggregate({
      where: {
        status: {
          not: "CANCELLED",
        },
      },
      _sum: {
        platformFee: true,
        total: true,
      },
      _count: true,
    }),

    // Pending payouts
    database.payout.findMany({
      where: {
        status: "pending",
      },
      include: {
        farm: {
          select: {
            name: true,
          },
        },
      },
    }),

    // Recent payouts
    database.payout.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        farm: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  // Calculate financial metrics
  const currentRevenue = currentPeriodOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0
  );
  const previousRevenue = previousPeriodOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0
  );
  const currentPlatformFees = currentPeriodOrders.reduce(
    (sum, order) => sum + Number(order.platformFee),
    0
  );
  const previousPlatformFees = previousPeriodOrders.reduce(
    (sum, order) => sum + Number(order.platformFee),
    0
  );

  const revenueGrowth =
    previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

  const platformFeeGrowth =
    previousPlatformFees > 0
      ? ((currentPlatformFees - previousPlatformFees) / previousPlatformFees) *
        100
      : 0;

  const pendingPayoutAmount = pendingPayouts.reduce(
    (sum, payout) => sum + Number(payout.amount),
    0
  );

  // Group orders by day for chart data
  const dailyRevenue = currentPeriodOrders.reduce(
    (acc, order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + Number(order.total);
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen bg-agricultural-50">
      {/* Divine Header */}
      <header className="bg-white shadow-sm border-b border-agricultural-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-agricultural-900">
                Financial Consciousness Analytics
              </h1>
              <p className="mt-1 text-sm text-agricultural-600">
                Monitor monetary flows and revenue harmonics across the
                agricultural quantum marketplace
              </p>
            </div>
            <div className="mt-4 flex md:ml-4 md:mt-0">
              <button
                type="button"
                className="ml-3 inline-flex items-center rounded-md bg-agricultural-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-agricultural-500"
              >
                <ChartBarIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {/* Quantum Financial Metrics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white rounded-lg shadow border border-agricultural-200 p-6">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600 mr-3" />
                <div className="flex-1">
                  <dt className="text-sm font-medium text-agricultural-500">
                    Total Revenue (30d)
                  </dt>
                  <dd className="text-2xl font-semibold text-green-600">
                    ${currentRevenue.toFixed(2)}
                  </dd>
                  <div className="flex items-center mt-1">
                    {revenueGrowth >= 0 ? (
                      <ChevronUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm ${revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {Math.abs(revenueGrowth).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-agricultural-200 p-6">
              <div className="flex items-center">
                <BanknotesIcon className="h-8 w-8 text-agricultural-600 mr-3" />
                <div className="flex-1">
                  <dt className="text-sm font-medium text-agricultural-500">
                    Platform Fees (30d)
                  </dt>
                  <dd className="text-2xl font-semibold text-agricultural-600">
                    ${currentPlatformFees.toFixed(2)}
                  </dd>
                  <div className="flex items-center mt-1">
                    {platformFeeGrowth >= 0 ? (
                      <ChevronUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm ${platformFeeGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {Math.abs(platformFeeGrowth).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-agricultural-200 p-6">
              <div className="flex items-center">
                <CalendarDaysIcon className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <dt className="text-sm font-medium text-agricultural-500">
                    Pending Payouts
                  </dt>
                  <dd className="text-2xl font-semibold text-purple-600">
                    ${pendingPayoutAmount.toFixed(2)}
                  </dd>
                  <div className="text-sm text-agricultural-500 mt-1">
                    {pendingPayouts.length} farms
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-agricultural-200 p-6">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <dt className="text-sm font-medium text-agricultural-500">
                    All-Time Platform Fees
                  </dt>
                  <dd className="text-2xl font-semibold text-blue-600">
                    ${Number(totalRevenue._sum.platformFee || 0).toFixed(2)}
                  </dd>
                  <div className="text-sm text-agricultural-500 mt-1">
                    {totalRevenue._count} orders
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Trend Chart Placeholder */}
          <div className="bg-white rounded-lg shadow border border-agricultural-200 mb-6 p-6">
            <h3 className="text-lg font-medium text-agricultural-900 mb-4">
              Daily Revenue Consciousness (Last 30 Days)
            </h3>
            <div className="h-64 flex items-center justify-center bg-agricultural-50 rounded-lg border-2 border-dashed border-agricultural-300">
              <div className="text-center">
                <ChartBarIcon className="mx-auto h-12 w-12 text-agricultural-400" />
                <h3 className="mt-2 text-sm font-semibold text-agricultural-900">
                  Revenue Chart
                </h3>
                <p className="mt-1 text-sm text-agricultural-500">
                  Chart visualization will be implemented using a charting
                  library
                </p>
                <div className="mt-4 grid grid-cols-7 gap-2 text-xs">
                  {Object.entries(dailyRevenue)
                    .slice(0, 7)
                    .map(([date, amount]) => (
                      <div key={date} className="text-center">
                        <div className="text-agricultural-500">
                          {new Date(date).getDate()}
                        </div>
                        <div className="font-semibold text-agricultural-900">
                          ${amount.toFixed(0)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pending Payouts */}
          <div className="bg-white rounded-lg shadow border border-agricultural-200 mb-6">
            <div className="px-6 py-4 border-b border-agricultural-200">
              <h3 className="text-lg font-medium text-agricultural-900">
                Pending Farm Payouts
              </h3>
              <p className="text-sm text-agricultural-500">
                Farms awaiting payment for completed orders
              </p>
            </div>

            {pendingPayouts.length > 0 ? (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-agricultural-200">
                  <thead className="bg-agricultural-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                        Farm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                        Scheduled
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-agricultural-200">
                    {pendingPayouts.map((payout) => (
                      <tr key={payout.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-agricultural-900">
                          {payout.farm.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-agricultural-900">
                          ${Number(payout.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-agricultural-500">
                          {new Date(payout.periodStart).toLocaleDateString()} -{" "}
                          {new Date(payout.periodEnd).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-agricultural-500">
                          {payout.orderCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-agricultural-500">
                          {new Date(payout.scheduledDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <BanknotesIcon className="mx-auto h-12 w-12 text-agricultural-400" />
                <h3 className="mt-2 text-sm font-semibold text-agricultural-900">
                  No pending payouts
                </h3>
                <p className="mt-1 text-sm text-agricultural-500">
                  All farms are up to date with their payments.
                </p>
              </div>
            )}
          </div>

          {/* Recent Payouts */}
          <div className="bg-white rounded-lg shadow border border-agricultural-200">
            <div className="px-6 py-4 border-b border-agricultural-200">
              <h3 className="text-lg font-medium text-agricultural-900">
                Recent Payout History
              </h3>
              <p className="text-sm text-agricultural-500">
                Recently processed farm payments
              </p>
            </div>

            {recentPayouts.length > 0 ? (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-agricultural-200">
                  <thead className="bg-agricultural-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                        Farm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                        Processed Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-agricultural-500 uppercase tracking-wider">
                        Orders
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-agricultural-200">
                    {recentPayouts.map((payout) => (
                      <tr key={payout.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-agricultural-900">
                          {payout.farm.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-agricultural-900">
                          ${Number(payout.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              payout.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : payout.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {payout.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-agricultural-500">
                          {payout.paidDate
                            ? new Date(payout.paidDate).toLocaleDateString()
                            : "Pending"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-agricultural-500">
                          {payout.orderCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <ChartBarIcon className="mx-auto h-12 w-12 text-agricultural-400" />
                <h3 className="mt-2 text-sm font-semibold text-agricultural-900">
                  No payout history
                </h3>
                <p className="mt-1 text-sm text-agricultural-500">
                  Payout history will appear here once payments are processed.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
