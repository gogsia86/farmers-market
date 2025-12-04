/**
 * 🌟 Workflow Execution Widget
 * Farmers Market Platform - Monitoring Dashboard
 *
 * Displays recent workflow executions with status, duration,
 * and success/failure indicators.
 */

"use client";

import { useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface WorkflowExecutionWidgetProps {
  executions: Array<{
    id: string;
    workflowId: string;
    status: string;
    startedAt: Date;
    completedAt: Date | null;
    durationMs: number | null;
    errorMessage: string | null;
  }>;
  stats: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format duration in human-readable format
 */
function formatDuration(ms: number | null): string {
  if (ms === null) return "N/A";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}

/**
 * Format time ago
 */
function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Get status badge styling
 */
function getStatusBadge(status: string): {
  bg: string;
  text: string;
  icon: string;
} {
  switch (status.toUpperCase()) {
    case "SUCCESS":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: "✓",
      };
    case "FAILED":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: "✗",
      };
    case "RUNNING":
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: "▶",
      };
    case "PENDING":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: "⏳",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: "?",
      };
  }
}

/**
 * Format workflow name (remove hyphens, capitalize)
 */
function formatWorkflowName(workflowId: string): string {
  return workflowId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ============================================================================
// COMPONENT
// ============================================================================

export function WorkflowExecutionWidget({
  executions,
  stats,
}: WorkflowExecutionWidgetProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedExecutions = showAll ? executions : executions.slice(0, 5);

  return (
    <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200">
      {/* Widget Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Workflow Executions
          </h3>
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
            {executions.length}
          </span>
        </div>
        <a
          href="/dashboard/workflows"
          className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
        >
          View All →
        </a>
      </div>

      {/* Stats Bar */}
      <div className="mb-4 grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4">
        <div>
          <p className="text-xs text-gray-600">Success Rate</p>
          <p className="text-2xl font-bold text-green-600">
            {stats.successRate}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Successful</p>
          <p className="text-2xl font-bold text-gray-900">{stats.successful}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
        </div>
      </div>

      {/* Executions List */}
      {executions.length === 0 ? (
        <div className="py-8 text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm font-medium text-gray-600">No executions yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Workflow executions will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayedExecutions.map((execution) => {
            const statusBadge = getStatusBadge(execution.status);
            return (
              <div
                key={execution.id}
                className="group rounded-lg border border-gray-200 p-3 transition-all hover:border-green-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Workflow Name */}
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {formatWorkflowName(execution.workflowId)}
                      </p>
                      <span
                        className={`inline-flex items-center space-x-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                      >
                        <span>{statusBadge.icon}</span>
                        <span>{execution.status}</span>
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <span>🕐</span>
                        <span>{timeAgo(new Date(execution.startedAt))}</span>
                      </span>
                      {execution.durationMs !== null && (
                        <span className="flex items-center space-x-1">
                          <span>⚡</span>
                          <span>{formatDuration(execution.durationMs)}</span>
                        </span>
                      )}
                    </div>

                    {/* Error Message */}
                    {execution.errorMessage && (
                      <div className="mt-2 rounded bg-red-50 px-2 py-1 text-xs text-red-700">
                        <span className="font-medium">Error:</span>{" "}
                        {execution.errorMessage}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    className="ml-2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    aria-label="View details"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Show More/Less Button */}
      {executions.length > 5 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
          >
            {showAll ? "Show Less ↑" : `Show ${executions.length - 5} More ↓`}
          </button>
        </div>
      )}

      {/* Footer Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last 24 hours</span>
          <span>{stats.total} total executions</span>
        </div>
      </div>
    </div>
  );
}
