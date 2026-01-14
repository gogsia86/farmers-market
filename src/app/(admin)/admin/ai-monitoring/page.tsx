/**
 * 🤖 AI Cost Monitoring Dashboard
 *
 * Admin dashboard for monitoring AI usage, costs, and quotas.
 * Tracks OpenAI API usage, token consumption, and cost analytics.
 *
 * @page /admin/ai-monitoring
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { formatCurrency } from "@/lib/utils/currency";
import {
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import {
  Activity,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { redirect } from "next/navigation";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Cost Monitoring | Admin Dashboard",
  description: "Monitor AI usage, costs, and quotas across the platform",
};

// Cost per 1K tokens (approximate rates for GPT-4o)
const TOKEN_COSTS = {
  "gpt-4o": { input: 0.005, output: 0.015 },
  "gpt-4-turbo": { input: 0.01, output: 0.03 },
  "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
};

export default async function AIMonitoringPage() {
  const session = await auth();

  // Check authentication and admin role
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/ai-monitoring");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Date ranges
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  // Fetch current month AI usage
  const currentMonthUsage = await database.aIUsageLog.findMany({
    where: {
      createdAt: {
        gte: currentMonthStart,
        lte: currentMonthEnd,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch last month usage for comparison
  const lastMonthUsage = await database.aIUsageLog.findMany({
    where: {
      createdAt: {
        gte: lastMonthStart,
        lte: lastMonthEnd,
      },
    },
  });

  // Fetch today's usage
  const todayUsage = await database.aIUsageLog.findMany({
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  // Fetch user quotas
  const userQuotas = await database.aIUsageQuota.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      monthlyTokenUsed: "desc",
    },
  });

  // Calculate current month statistics
  const currentMonthStats = {
    totalRequests: currentMonthUsage.length,
    totalTokens: currentMonthUsage.reduce(
      (sum: number, log) => sum + (log.tokensUsed || 0),
      0,
    ),
    totalCost: currentMonthUsage.reduce(
      (sum: number, log) => sum + Number(log.costUSD || 0),
      0,
    ),
    uniqueUsers: new Set(currentMonthUsage.map((log) => log.userId)).size,
    avgTokensPerRequest:
      currentMonthUsage.length > 0
        ? Math.round(
            currentMonthUsage.reduce(
              (sum: number, log) => sum + (log.tokensUsed || 0),
              0,
            ) / currentMonthUsage.length,
          )
        : 0,
  };

  // Calculate last month statistics for comparison
  const lastMonthStats = {
    totalRequests: lastMonthUsage.length,
    totalTokens: lastMonthUsage.reduce(
      (sum: number, log) => sum + (log.tokensUsed || 0),
      0,
    ),
    totalCost: lastMonthUsage.reduce(
      (sum: number, log) => sum + Number(log.costUSD || 0),
      0,
    ),
  };

  // Calculate today's statistics
  const todayStats = {
    totalRequests: todayUsage.length,
    totalTokens: todayUsage.reduce(
      (sum: number, log) => sum + (log.tokensUsed || 0),
      0,
    ),
    totalCost: todayUsage.reduce(
      (sum: number, log) => sum + Number(log.costUSD || 0),
      0,
    ),
  };

  // Calculate percentage changes
  const requestChange =
    lastMonthStats.totalRequests > 0
      ? ((currentMonthStats.totalRequests - lastMonthStats.totalRequests) /
          lastMonthStats.totalRequests) *
        100
      : 0;

  const costChange =
    lastMonthStats.totalCost > 0
      ? ((currentMonthStats.totalCost - lastMonthStats.totalCost) /
          lastMonthStats.totalCost) *
        100
      : 0;

  // Group usage by endpoint
  const usageByEndpoint = currentMonthUsage.reduce(
    (
      acc: Record<string, { count: number; tokens: number; cost: number }>,
      log,
    ) => {
      const endpoint = log.endpoint || "unknown";
      if (!acc[endpoint]) {
        acc[endpoint] = {
          count: 0,
          tokens: 0,
          cost: 0,
        };
      }
      acc[endpoint].count++;
      acc[endpoint].tokens += log.tokensUsed || 0;
      acc[endpoint].cost += Number(log.costUSD || 0);
      return acc;
    },
    {} as Record<string, { count: number; tokens: number; cost: number }>,
  );

  // Find users exceeding quotas
  const usersExceedingQuota = userQuotas.filter(
    (quota: any) => quota.monthlyTokenUsed > quota.monthlyTokenLimit,
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span className="text-4xl">🤖</span>
          AI Cost Monitoring
        </h1>
        <p className="mt-2 text-gray-600">
          Track AI usage, costs, and user quotas across the platform
        </p>
      </div>

      {/* Alert for users exceeding quota */}
      {usersExceedingQuota.length > 0 && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">
                {usersExceedingQuota.length} User(s) Exceeding Quota
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Some users have exceeded their monthly token limits. Consider
                reviewing their usage or increasing quotas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Cost This Month */}
        <MetricCard
          icon={<DollarSign className="h-6 w-6" />}
          title="Total Cost (This Month)"
          value={formatCurrency(currentMonthStats.totalCost)}
          change={costChange}
          subtitle={`vs last month: ${formatCurrency(lastMonthStats.totalCost)}`}
          color="green"
        />

        {/* Total Requests */}
        <MetricCard
          icon={<Activity className="h-6 w-6" />}
          title="Total Requests"
          value={currentMonthStats.totalRequests.toLocaleString()}
          change={requestChange}
          subtitle={`${todayStats.totalRequests} today`}
          color="blue"
        />

        {/* Total Tokens */}
        <MetricCard
          icon={<Zap className="h-6 w-6" />}
          title="Total Tokens"
          value={(currentMonthStats.totalTokens / 1000).toFixed(1) + "K"}
          subtitle={`Avg: ${currentMonthStats.avgTokensPerRequest} per request`}
          color="purple"
        />

        {/* Active Users */}
        <MetricCard
          icon={<Users className="h-6 w-6" />}
          title="Active Users"
          value={currentMonthStats.uniqueUsers.toString()}
          subtitle={`${userQuotas.length} total with quotas`}
          color="orange"
        />
      </div>

      {/* Today's Usage */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📊</span>
          Today's Usage
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Requests</p>
            <p className="text-2xl font-bold text-gray-900">
              {todayStats.totalRequests}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Tokens</p>
            <p className="text-2xl font-bold text-gray-900">
              {(todayStats.totalTokens / 1000).toFixed(1)}K
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Cost</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(todayStats.totalCost)}
            </p>
          </div>
        </div>
      </div>

      {/* Usage by Endpoint */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Usage by Endpoint
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Requests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tokens
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Avg Tokens/Req
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(usageByEndpoint)
                .sort(([, a], [, b]) => (b as any).cost - (a as any).cost)
                .map(([endpoint, stats]: [string, any]) => (
                  <tr key={endpoint} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {endpoint}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {stats.count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {(stats.tokens / 1000).toFixed(1)}K
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(stats.cost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {Math.round(stats.tokens / stats.count)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Quotas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">User Quotas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Used / Limit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Usage %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userQuotas.map((quota: any) => {
                const usagePercent =
                  (quota.monthlyTokenUsed / quota.monthlyTokenLimit) * 100;
                const isExceeded = usagePercent > 100;
                const isWarning = usagePercent > 80 && usagePercent <= 100;

                return (
                  <tr
                    key={quota.id}
                    className={`hover:bg-gray-50 ${isExceeded ? "bg-red-50" : ""}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {quota.user.name || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {quota.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {quota.user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {(quota.monthlyTokenUsed / 1000).toFixed(1)}K /{" "}
                      {(quota.monthlyTokenLimit / 1000).toFixed(0)}K
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              isExceeded
                                ? "bg-red-600"
                                : isWarning
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(100, usagePercent)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {usagePercent.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isExceeded ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Exceeded
                        </span>
                      ) : isWarning ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Warning
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Reference */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          💡 Token Cost Reference
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(TOKEN_COSTS).map(([model, costs]) => (
            <div key={model} className="bg-white rounded-lg p-4 border">
              <p className="font-medium text-gray-900 mb-2">{model}</p>
              <p className="text-sm text-gray-600">
                Input: ${costs.input}/1K tokens
              </p>
              <p className="text-sm text-gray-600">
                Output: ${costs.output}/1K tokens
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: number;
  subtitle: string;
  color: "green" | "blue" | "purple" | "orange";
}

function MetricCard({
  icon,
  title,
  value,
  change,
  subtitle,
  color,
}: MetricCardProps) {
  const colorClasses = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              change >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            <TrendingUp
              className={`h-4 w-4 ${change < 0 ? "rotate-180" : ""}`}
            />
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}
