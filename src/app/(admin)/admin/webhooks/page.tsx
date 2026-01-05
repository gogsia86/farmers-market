/**
 * Webhook Monitoring Dashboard
 * Real-time webhook health status, metrics, and management
 * Admin-only page with auto-refresh capabilities
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

// ============================================================================
// Types
// ============================================================================

type HealthStatus = "HEALTHY" | "DEGRADED" | "CRITICAL";

interface HealthCheck {
  passed: boolean;
  value: number | string | null;
  threshold: number | string;
  message: string;
}

interface WebhookHealthStatus {
  healthy: boolean;
  status: HealthStatus;
  checks: {
    recentFailures: HealthCheck;
    processingBacklog: HealthCheck;
    oldestPending: HealthCheck;
    averageProcessingTime: HealthCheck;
    duplicateEvents: HealthCheck;
  };
  metrics: {
    totalEvents: number;
    processedEvents: number;
    failedEvents: number;
    pendingEvents: number;
    successRate: number;
    averageAttempts: number;
    eventsByProvider: Record<string, number>;
    eventsByType: Record<string, number>;
  };
  timestamp: string;
}

interface Alert {
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  type: string;
  message: string;
  details: Record<string, any>;
  timestamp: string;
}

interface MonitoringReport {
  health: WebhookHealthStatus;
  alerts: Alert[];
  recommendations: string[];
}

// ============================================================================
// Component
// ============================================================================

export default function WebhookMonitoringPage() {
  const [report, setReport] = useState<MonitoringReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch webhook health report
  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/webhooks/monitor?report=true&timeWindow=60");
      const data = await response.json();

      if (data.success) {
        setReport(data.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(data.error || "Failed to fetch webhook health");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchReport();

    if (!autoRefresh) return;

    const interval = setInterval(fetchReport, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchReport]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchReport();
  };

  // Handle maintenance actions
  const handleAction = async (action: string, params?: any) => {
    try {
      const response = await fetch("/api/admin/webhooks/monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, params }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Action "${action}" completed successfully`);
        fetchReport(); // Refresh after action
      } else {
        alert(`Action failed: ${data.error}`);
      }
    } catch (err) {
      alert(`Action failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading webhook health status...</p>
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="p-6">
        <Card variant="elevated" className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error Loading Webhook Health</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!report) return null;

  const statusColor =
    report.health.status === "HEALTHY"
      ? "green"
      : report.health.status === "DEGRADED"
        ? "yellow"
        : "red";

  const statusEmoji =
    report.health.status === "HEALTHY"
      ? "🟢"
      : report.health.status === "DEGRADED"
        ? "🟡"
        : "🔴";

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔐 Webhook Monitoring</h1>
          <p className="text-gray-600 mt-1">
            Real-time webhook event health and metrics
          </p>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh
          </label>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      {lastUpdated && (
        <p className="text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {/* Overall Status */}
      <Card
        variant="elevated"
        className={`border-${statusColor}-300 bg-${statusColor}-50`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-4xl">{statusEmoji}</span>
            <span className={`text-${statusColor}-700`}>
              System Status: {report.health.status}
            </span>
          </CardTitle>
          <CardDescription>
            {report.health.healthy
              ? "All webhook systems operating normally"
              : "Issues detected with webhook processing"}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Events (1h)</CardDescription>
            <CardTitle className="text-3xl">
              {report.health.metrics.totalEvents}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Success Rate</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {(report.health.metrics.successRate * 100).toFixed(1)}%
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Failed Events</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {report.health.metrics.failedEvents}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Pending Events</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {report.health.metrics.pendingEvents}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Health Checks */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Health Checks</CardTitle>
          <CardDescription>Detailed system health validation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(report.health.checks).map(([key, check]) => (
              <div
                key={key}
                className={`flex items-center justify-between p-3 rounded-lg ${check.passed ? "bg-green-50" : "bg-red-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{check.passed ? "✅" : "❌"}</span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className={`text-sm ${check.passed ? "text-green-700" : "text-red-700"}`}>
                      {check.message}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {typeof check.value === "number"
                      ? check.value.toFixed(2)
                      : check.value || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Threshold: {check.threshold}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {report.alerts.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>🚨 Active Alerts ({report.alerts.length})</CardTitle>
            <CardDescription>Issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.alerts.map((alert, index) => {
                const severityColor =
                  alert.severity === "CRITICAL"
                    ? "red"
                    : alert.severity === "ERROR"
                      ? "orange"
                      : alert.severity === "WARNING"
                        ? "yellow"
                        : "blue";

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 border-${severityColor}-500 bg-${severityColor}-50`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`font-semibold text-${severityColor}-900`}>
                          {alert.severity}: {alert.type}
                        </p>
                        <p className={`text-sm mt-1 text-${severityColor}-700`}>
                          {alert.message}
                        </p>
                        {Object.keys(alert.details).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-600 cursor-pointer">
                              View details
                            </summary>
                            <pre className="mt-2 text-xs bg-white p-2 rounded overflow-x-auto">
                              {JSON.stringify(alert.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>💡 Recommendations</CardTitle>
            <CardDescription>Suggested actions to improve system health</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <span className="mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Events by Provider */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Events by Provider</CardTitle>
          <CardDescription>Distribution of webhook events across providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(report.health.metrics.eventsByProvider).map(
              ([provider, count]) => (
                <div key={provider} className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{provider}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-64 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(count / report.health.metrics.totalEvents) * 100
                            }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Actions */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>🔧 Maintenance Actions</CardTitle>
          <CardDescription>Manual maintenance and troubleshooting tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => handleAction("auto-remediate")}
              className="p-4 text-left border-2 border-green-200 rounded-lg hover:bg-green-50 transition"
            >
              <p className="font-semibold text-green-700">🔄 Auto-Remediate</p>
              <p className="text-sm text-gray-600 mt-1">
                Automatically fix common issues
              </p>
            </button>
            <button
              onClick={() => handleAction("cleanup", { olderThanDays: 90 })}
              className="p-4 text-left border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition"
            >
              <p className="font-semibold text-blue-700">🧹 Cleanup Old Events</p>
              <p className="text-sm text-gray-600 mt-1">
                Delete processed events &gt;90 days
              </p>
            </button>
            <button
              onClick={() => handleAction("retry-failed", { maxAttempts: 5, limit: 50 })}
              className="p-4 text-left border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 transition"
            >
              <p className="font-semibold text-yellow-700">🔁 Retry Failed</p>
              <p className="text-sm text-gray-600 mt-1">
                Get failed events for retry
              </p>
            </button>
            <button
              onClick={() => handleAction("find-duplicates")}
              className="p-4 text-left border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition"
            >
              <p className="font-semibold text-purple-700">🔍 Find Duplicates</p>
              <p className="text-sm text-gray-600 mt-1">
                Detect duplicate webhook events
              </p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
