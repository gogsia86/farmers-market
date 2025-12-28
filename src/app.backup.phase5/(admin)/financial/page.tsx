/**
 * 🌾 ADMIN FINANCIAL MANAGEMENT PAGE
 * Divine Agricultural Platform - Financial Overview & Analytics
 */

import { requireAdmin } from "@/lib/auth";
import { database } from "@/lib/database";
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  CreditCardIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default async function AdminFinancialPage() {
  await requireAdmin();

  // Fetch financial data
  const [orders, recentTransactions, payouts] = await Promise.all([
    database.order.findMany({
      where: {
        status: {
          in: ["COMPLETED"],
        },
      },
      include: {
        Payment: true,
      },
    }),
    database.payment.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            id: true,
            customer: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    }),
    database.payout.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        farm: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  // Calculate financial metrics
  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total),
    0,
  );
  const totalTransactions = orders.length;
  const successfulPayments = orders
    .filter((o) => o.Payment)
    .map((o) => o.Payment!)
    .filter((p) => p.status === "PAID").length;
  const pendingPayouts = payouts.filter((p) => p.status === "PENDING").length;

  // Calculate this month's revenue
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthRevenue = orders
    .filter((o) => new Date(o.createdAt) >= firstDayOfMonth)
    .reduce((sum, order) => sum + Number(order.total), 0);

  // Calculate last month's revenue for comparison
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const lastMonthRevenue = orders
    .filter(
      (o) =>
        new Date(o.createdAt) >= lastMonthStart &&
        new Date(o.createdAt) <= lastMonthEnd,
    )
    .reduce((sum, order) => sum + Number(order.total), 0);

  const revenueGrowth =
    lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  // Average order value
  const avgOrderValue =
    totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
              <BanknotesIcon className="h-8 w-8 mr-3 text-green-600" />
              Financial Overview
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Track revenue, payments, and payouts • Divine financial
              consciousness
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <ChartBarIcon className="h-5 w-5 mr-2 text-gray-400" />
              Export Report
            </button>
            <Link
              href="/admin/financial/payouts"
              className="ml-3 inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
            >
              <BanknotesIcon className="h-5 w-5 mr-2" />
              Process Payouts
            </Link>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Revenue */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    ${totalRevenue.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* This Month Revenue */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon
                  className={`h-6 w-6 ${revenueGrowth >= 0 ? "text-green-400" : "text-red-400"}`}
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    This Month
                  </dt>
                  <dd className="flex items-baseline">
                    <span className="text-2xl font-semibold text-gray-900">
                      ${thisMonthRevenue.toFixed(2)}
                    </span>
                    <span
                      className={`ml-2 text-sm font-medium ${revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {revenueGrowth >= 0 ? "+" : ""}
                      {revenueGrowth.toFixed(1)}%
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ReceiptPercentIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Avg Order Value
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    ${avgOrderValue.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Payouts */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Payouts
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {pendingPayouts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold leading-6 text-gray-900 flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2 text-green-600" />
              Recent Transactions
            </h3>
          </div>
          <div className="overflow-hidden">
            <ul role="list" className="divide-y divide-gray-200">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((payment) => (
                  <li key={payment.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {payment.order?.customer?.name ||
                            payment.order?.customer?.email ||
                            "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Order #{payment.orderId.slice(0, 8)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(payment.createdAt).toLocaleDateString()} •{" "}
                          {payment.paymentMethod || "N/A"}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex items-center">
                        <div className="text-right mr-3">
                          <p className="text-sm font-semibold text-gray-900">
                            ${payment.amount.toFixed(2)}
                          </p>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              payment.status === "PAID"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-8 text-center">
                  <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    No transactions yet
                  </p>
                </li>
              )}
            </ul>
          </div>
          {recentTransactions.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <Link
                href="/admin/financial/transactions"
                className="text-sm font-semibold text-green-600 hover:text-green-500"
              >
                View all transactions →
              </Link>
            </div>
          )}
        </div>

        {/* Recent Payouts */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold leading-6 text-gray-900 flex items-center">
              <BanknotesIcon className="h-5 w-5 mr-2 text-green-600" />
              Recent Payouts
            </h3>
          </div>
          <div className="overflow-hidden">
            <ul role="list" className="divide-y divide-gray-200">
              {payouts.length > 0 ? (
                payouts.map((payout) => (
                  <li key={payout.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {payout.farm?.owner?.name ||
                            payout.farm?.owner?.email ||
                            "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Payout #{payout.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(payout.createdAt).toLocaleDateString()}
                          {payout.paidDate &&
                            ` • Paid: ${new Date(payout.paidDate).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex items-center">
                        <div className="text-right mr-3">
                          <p className="text-sm font-semibold text-gray-900">
                            ${payout.amount.toFixed(2)}
                          </p>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              payout.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : payout.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : payout.status === "PROCESSING"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {payout.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-8 text-center">
                  <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No payouts yet</p>
                </li>
              )}
            </ul>
          </div>
          {payouts.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <Link
                href="/admin/financial/payouts"
                className="text-sm font-semibold text-green-600 hover:text-green-500"
              >
                View all payouts →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Financial Summary Stats */}
      <div className="mt-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold leading-6 text-gray-900">
            Financial Summary
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="overflow-hidden">
              <dt className="text-sm font-medium text-gray-500">
                Total Transactions
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {totalTransactions}
              </dd>
            </div>
            <div className="overflow-hidden">
              <dt className="text-sm font-medium text-gray-500">
                Successful Payments
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {successfulPayments}
              </dd>
            </div>
            <div className="overflow-hidden">
              <dt className="text-sm font-medium text-gray-500">
                Success Rate
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {totalTransactions > 0
                  ? ((successfulPayments / totalTransactions) * 100).toFixed(1)
                  : 0}
                %
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
