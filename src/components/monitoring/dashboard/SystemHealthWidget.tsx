/**
 * 🌟 System Health Widget
 * Farmers Market Platform - Monitoring Dashboard
 *
 * Displays current system health status including database,
 * API, cache, and external service checks.
 */

"use client";

import { useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface SystemHealthWidgetProps {
  healthChecks: Array<{
    id: string;
    healthy: boolean;
    checkedAt: Date;
    responseTime: number | null;
    details: any;
  }>;
  systemHealthy: boolean;
}

interface HealthCheckDetails {
  database: boolean;
  api: boolean;
  cache: boolean;
  externalServices: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse health check details from JSON
 */
function parseHealthDetails(details: any): HealthCheckDetails {
  try {
    const parsed = typeof details === "string" ? JSON.parse(details) : details;
    return {
      database: parsed?.database?.healthy ?? false,
      api: parsed?.api?.healthy ?? false,
      cache: parsed?.cache?.healthy ?? false,
      externalServices: parsed?.externalServices?.healthy ?? false,
    };
  } catch {
    return {
      database: false,
      api: false,
      cache: false,
      externalServices: false,
    };
  }
}

/**
 * Format time ago from date
 */
function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SystemHealthWidget({
  healthChecks,
  systemHealthy,
}: SystemHealthWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get latest health check
  const latestCheck = healthChecks[0];
  const healthDetails = latestCheck
    ? parseHealthDetails(latestCheck.details)
    : {
        database: false,
        api: false,
        cache: false,
        externalServices: false,
      };

  // Calculate health percentage
  const healthyServices = Object.values(healthDetails).filter(Boolean).length;
  const totalServices = Object.keys(healthDetails).length;
  const healthPercentage = (healthyServices / totalServices) * 100;

  return (
    <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200">
      {/* Widget Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          <div
            className={`h-2 w-2 rounded-full ${
              systemHealthy ? "bg-green-500" : "bg-red-500"
            } ${mounted ? "animate-pulse" : ""}`}
          />
        </div>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
            autoRefresh
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {autoRefresh ? "🔄 Live" : "⏸️ Paused"}
        </button>
      </div>

      {/* Overall Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Overall Status
          </span>
          <span
            className={`text-sm font-semibold ${
              systemHealthy ? "text-green-600" : "text-red-600"
            }`}
          >
            {systemHealthy ? "✓ Healthy" : "✗ Degraded"}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              healthPercentage === 100
                ? "bg-green-500"
                : healthPercentage >= 75
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {healthyServices} / {totalServices} services operational
        </p>
      </div>

      {/* Service Checks */}
      <div className="space-y-3">
        {/* Database */}
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <div className="flex items-center space-x-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                healthDetails.database ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <span className="text-lg">
                {healthDetails.database ? "✓" : "✗"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Database</p>
              <p className="text-xs text-gray-500">PostgreSQL Connection</p>
            </div>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              healthDetails.database
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {healthDetails.database ? "Connected" : "Disconnected"}
          </div>
        </div>

        {/* API */}
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <div className="flex items-center space-x-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                healthDetails.api ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <span className="text-lg">{healthDetails.api ? "✓" : "✗"}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">API</p>
              <p className="text-xs text-gray-500">REST Endpoints</p>
            </div>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              healthDetails.api
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {healthDetails.api ? "Responsive" : "Unresponsive"}
          </div>
        </div>

        {/* Cache */}
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <div className="flex items-center space-x-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                healthDetails.cache ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <span className="text-lg">{healthDetails.cache ? "✓" : "✗"}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Cache</p>
              <p className="text-xs text-gray-500">Redis Connection</p>
            </div>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              healthDetails.cache
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {healthDetails.cache ? "Active" : "Inactive"}
          </div>
        </div>

        {/* External Services */}
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <div className="flex items-center space-x-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                healthDetails.externalServices ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <span className="text-lg">
                {healthDetails.externalServices ? "✓" : "✗"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                External Services
              </p>
              <p className="text-xs text-gray-500">Third-party APIs</p>
            </div>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              healthDetails.externalServices
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {healthDetails.externalServices ? "Available" : "Unavailable"}
          </div>
        </div>
      </div>

      {/* Last Check Time */}
      {latestCheck && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Last checked: {timeAgo(new Date(latestCheck.checkedAt))}
            </span>
            {latestCheck.responseTime && (
              <span>Response: {latestCheck.responseTime}ms</span>
            )}
          </div>
        </div>
      )}

      {/* Warning Message */}
      {!systemHealthy && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3">
          <div className="flex items-start space-x-2">
            <span className="text-red-600 text-lg">⚠️</span>
            <div>
              <p className="text-sm font-medium text-red-900">
                System Degraded
              </p>
              <p className="text-xs text-red-700 mt-1">
                Some services are experiencing issues. Check the service status
                above for details.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
