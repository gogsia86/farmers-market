/**
 * 🌟 Divine Monitoring Dashboard
 * Farmers Market Platform - Real-Time System Monitoring
 * Version: 1.0.0
 *
 * Main dashboard page displaying system health, workflow executions,
 * alerts, and performance metrics in real-time.
 */

import { Suspense } from "react";
import { Metadata } from "next";
import { database } from "@/lib/database";
import { DashboardLayout } from "@/components/monitoring/dashboard/DashboardLayout";
import { SystemHealthWidget } from "@/components/monitoring/dashboard/SystemHealthWidget";
import { WorkflowExecutionWidget } from "@/components/monitoring/dashboard/WorkflowExecutionWidget";
import { AlertsWidget } from "@/components/monitoring/dashboard/AlertsWidget";
import { PerformanceMetricsWidget } from "@/components/monitoring/dashboard/PerformanceMetricsWidget";
import { DashboardSkeleton } from "@/components/monitoring/dashboard/DashboardSkeleton";

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: "Monitoring Dashboard | Farmers Market Platform",
  description: "Real-time system monitoring and workflow execution tracking",
};

// Revalidate every 30 seconds for fresh data
export const revalidate = 30;

// ============================================================================
// DATA FETCHING
// ============================================================================

/**
 * Fetch dashboard overview data
 */
async function getDashboardData() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  try {
    // Parallel data fetching for optimal performance
    const [
      recentExecutions,
      executionStats,
      recentHealthChecks,
      recentNotifications,
      activeSchedules,
    ] = await Promise.all([
      // Recent workflow executions (last 10)
      database.workflowExecution.findMany({
        take: 10,
        orderBy: {
          startedAt: "desc",
        },
        select: {
          id: true,
          workflowName: true,
          status: true,
          startedAt: true,
          completedAt: true,
          durationMs: true,
          errorMessage: true,
        },
      }),

      // Execution statistics (last 24 hours)
      database.workflowExecution.groupBy({
        by: ["status"],
        where: {
          startedAt: {
            gte: oneDayAgo,
          },
        },
        _count: {
          status: true,
        },
      }),

      // Recent health checks
      database.systemHealthCheck.findMany({
        take: 5,
        orderBy: {
          checkedAt: "desc",
        },
        select: {
          id: true,
          status: true,
          checkedAt: true,
          responseTimeMs: true,
          details: true,
          errorMessage: true,
          checkId: true,
          checkName: true,
        },
      }),

      // Recent notifications (last hour)
      database.notificationLog.findMany({
        take: 10,
        where: {
          sentAt: {
            gte: oneHourAgo,
          },
        },
        orderBy: {
          sentAt: "desc",
        },
        select: {
          id: true,
          notificationType: true,
          channel: true,
          status: true,
          message: true,
          sentAt: true,
          subject: true,
        },
      }),

      // Active workflow schedules
      database.workflowSchedule.findMany({
        where: {
          enabled: true,
        },
        select: {
          id: true,
          workflowName: true,
          cronExpression: true,
          lastRunAt: true,
          nextRunAt: true,
          enabled: true,
        },
      }),
    ]);

    // Calculate metrics
    const totalExecutions = executionStats.reduce(
      (sum, stat) => sum + stat._count.status,
      0,
    );
    const successfulExecutions =
      executionStats.find((s) => s.status === "SUCCESS")?._count.status || 0;
    const failedExecutions =
      executionStats.find((s) => s.status === "FAILED")?._count.status || 0;

    const successRate =
      totalExecutions > 0
        ? (successfulExecutions / totalExecutions) * 100
        : 100;

    // Calculate average response time
    const avgResponseTime =
      recentExecutions.length > 0
        ? recentExecutions.reduce((sum, e) => sum + (e.durationMs || 0), 0) /
          recentExecutions.length
        : 0;

    // System health status
    const latestHealthCheck = recentHealthChecks[0];
    const systemHealthy =
      latestHealthCheck?.status === "HEALTHY" ||
      latestHealthCheck?.status === "SUCCESS";

    // Alert count (high priority notifications in last hour)
    const alertCount = recentNotifications.filter(
      (n) => n.status === "FAILED" || n.status === "ERROR",
    ).length;

    return {
      overview: {
        systemHealthy,
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        successRate: parseFloat(successRate.toFixed(2)),
        avgResponseTime: Math.round(avgResponseTime),
        alertCount,
        activeWorkflows: activeSchedules.length,
      },
      recentExecutions,
      recentHealthChecks,
      recentNotifications,
      activeSchedules,
      lastUpdated: now.toISOString(),
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return null;
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default async function MonitoringDashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">
              ❌ Error Loading Dashboard
            </h2>
            <p className="mt-2 text-gray-600">
              Unable to fetch monitoring data. Please check database connection.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🌾 Monitoring Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Real-time system health and workflow execution tracking
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Last Updated</div>
            <div className="font-mono text-sm text-gray-900">
              {new Date(data.lastUpdated).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <p className="mt-2 text-3xl font-bold">
                {data.overview.systemHealthy ? (
                  <span className="text-green-600">✓ Healthy</span>
                ) : (
                  <span className="text-red-600">✗ Degraded</span>
                )}
              </p>
            </div>
            <div
              className={`rounded-full p-3 ${
                data.overview.systemHealthy ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <span className="text-2xl">
                {data.overview.systemHealthy ? "🟢" : "🔴"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {data.overview.successRate}%
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <span className="text-2xl">📊</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {data.overview.successfulExecutions} /{" "}
            {data.overview.totalExecutions} executions (24h)
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Avg Response Time
              </p>
              <p className="mt-2 text-3xl font-bold text-purple-600">
                {data.overview.avgResponseTime}ms
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <span className="text-2xl">⚡</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Recent executions average
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p
                className={`mt-2 text-3xl font-bold ${
                  data.overview.alertCount > 0
                    ? "text-orange-600"
                    : "text-green-600"
                }`}
              >
                {data.overview.alertCount}
              </p>
            </div>
            <div
              className={`rounded-full p-3 ${
                data.overview.alertCount > 0 ? "bg-orange-100" : "bg-green-100"
              }`}
            >
              <span className="text-2xl">
                {data.overview.alertCount > 0 ? "⚠️" : "✅"}
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {data.overview.activeWorkflows} workflows active
          </p>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* System Health Widget */}
        <Suspense fallback={<DashboardSkeleton />}>
          <SystemHealthWidget
            healthChecks={data.recentHealthChecks.map((hc) => ({
              id: hc.id,
              healthy: hc.status === "HEALTHY" || hc.status === "SUCCESS",
              checkedAt: hc.checkedAt,
              responseTime: hc.responseTimeMs,
              details: hc.details,
            }))}
            systemHealthy={data.overview.systemHealthy}
          />
        </Suspense>

        {/* Workflow Execution Widget */}
        <Suspense fallback={<DashboardSkeleton />}>
          <WorkflowExecutionWidget
            executions={data.recentExecutions.map((exec) => ({
              id: exec.id,
              workflowId: exec.workflowName,
              status: exec.status,
              startedAt: exec.startedAt,
              completedAt: exec.completedAt,
              durationMs: exec.durationMs,
              errorMessage: exec.errorMessage,
            }))}
            stats={{
              total: data.overview.totalExecutions,
              successful: data.overview.successfulExecutions,
              failed: data.overview.failedExecutions,
              successRate: data.overview.successRate,
            }}
          />
        </Suspense>

        {/* Alerts Widget */}
        <Suspense fallback={<DashboardSkeleton />}>
          <AlertsWidget
            notifications={data.recentNotifications.map((notif) => ({
              id: notif.id,
              type: notif.notificationType,
              priority:
                notif.status === "FAILED" || notif.status === "ERROR"
                  ? "HIGH"
                  : "MEDIUM",
              message: notif.message,
              sentAt: notif.sentAt,
              successful: notif.status === "SUCCESS",
            }))}
            alertCount={data.overview.alertCount}
          />
        </Suspense>

        {/* Performance Metrics Widget */}
        <Suspense fallback={<DashboardSkeleton />}>
          <PerformanceMetricsWidget
            avgResponseTime={data.overview.avgResponseTime}
            executions={data.recentExecutions.map((exec) => ({
              id: exec.id,
              startedAt: exec.startedAt,
              completedAt: exec.completedAt,
              durationMs: exec.durationMs,
              status: exec.status,
            }))}
          />
        </Suspense>
      </div>

      {/* Auto-refresh indicator */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Dashboard auto-refreshes every 30 seconds</p>
      </div>
    </DashboardLayout>
  );
}
