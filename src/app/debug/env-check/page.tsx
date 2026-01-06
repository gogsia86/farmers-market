"use client";

/**
 * 🔍 ENVIRONMENT VARIABLES CHECK PAGE
 *
 * Visual interface to check which environment variables are set
 *
 * ⚠️ DISABLE IN PRODUCTION - Only for debugging
 */

import { useEffect, useState } from "react";

interface EnvStatus {
  exists: boolean;
  masked?: string;
  length?: number;
}

interface EnvCheckResponse {
  success: boolean;
  timestamp: string;
  environment: string;
  vercel: {
    isVercel: boolean;
    env?: string;
    url: string;
  };
  summary: {
    totalChecked: number;
    totalSet: number;
    totalMissing: number;
    percentageSet: number;
  };
  critical: {
    allCriticalSet: boolean;
    missingCritical: string[];
  };
  variables: Record<string, EnvStatus>;
  recommendations: string[];
}

export default function EnvCheckPage() {
  const [data, setData] = useState<EnvCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/debug/env-check")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg shadow-xl p-8">
            <div className="flex items-start">
              <svg
                className="w-8 h-8 text-red-600 mr-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h2 className="text-2xl font-bold text-red-900 mb-2">Error</h2>
                <p className="text-red-800">{error}</p>
                <p className="text-sm text-red-600 mt-4">
                  This endpoint is only available in development mode.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const criticalVars = ["NEXTAUTH_SECRET", "NEXTAUTH_URL", "DATABASE_URL"];
  const authVars = ["NEXTAUTH_SECRET", "NEXTAUTH_URL", "NEXT_PUBLIC_APP_URL"];
  const databaseVars = ["DATABASE_URL"];
  const buildVars = ["NODE_ENV", "TURBOPACK", "SENTRY_UPLOAD_DRY_RUN", "NEXT_DISABLE_SOURCEMAPS"];
  const sentryVars = ["SENTRY_DSN", "NEXT_PUBLIC_SENTRY_DSN", "SENTRY_AUTH_TOKEN"];
  const redisVars = ["REDIS_HOST", "REDIS_PORT", "REDIS_PASSWORD"];
  const stripeVars = ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"];

  const getVarsByCategory = (category: string[]) => {
    return category.map(varName => ({
      name: varName,
      status: data.variables[varName],
    }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🔍 Environment Variables Check
              </h1>
              <p className="text-gray-600">
                Diagnostic tool to verify environment configuration
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Environment</div>
              <div className="text-xl font-semibold text-gray-900">
                {data.environment}
              </div>
            </div>
          </div>

          {/* Vercel Info */}
          {data.vercel.isVercel && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 19.5h20L12 2z" />
                </svg>
                <div>
                  <div className="font-semibold text-blue-900">Running on Vercel</div>
                  <div className="text-sm text-blue-700">
                    Environment: {data.vercel.env || "unknown"} | URL: {data.vercel.url}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 mb-1">Total Checked</div>
              <div className="text-3xl font-bold text-blue-900">
                {data.summary.totalChecked}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 mb-1">Set</div>
              <div className="text-3xl font-bold text-green-900">
                {data.summary.totalSet}
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm text-red-600 mb-1">Missing</div>
              <div className="text-3xl font-bold text-red-900">
                {data.summary.totalMissing}
              </div>
            </div>
            <div className={`rounded-lg p-4 ${data.summary.percentageSet === 100 ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className={`text-sm mb-1 ${data.summary.percentageSet === 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                Completion
              </div>
              <div className={`text-3xl font-bold ${data.summary.percentageSet === 100 ? 'text-green-900' : 'text-yellow-900'}`}>
                {data.summary.percentageSet}%
              </div>
            </div>
          </div>

          {/* Critical Status */}
          {!data.critical.allCriticalSet && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <div className="font-semibold text-red-900 mb-2">
                    ⚠️ Critical Variables Missing
                  </div>
                  <div className="text-red-800">
                    {data.critical.missingCritical.join(", ")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {data.critical.allCriticalSet && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-green-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="font-semibold text-green-900">
                  ✅ All critical environment variables are set!
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-bold text-yellow-900 mb-4">💡 Recommendations</h2>
            <ul className="space-y-2">
              {data.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start text-yellow-800">
                  <span className="mr-2">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Auth Variables */}
        <VariableCategory
          title="🔐 Authentication (Required)"
          variables={getVarsByCategory(authVars)}
          critical={true}
        />

        {/* Database Variables */}
        <VariableCategory
          title="🗄️ Database (Required)"
          variables={getVarsByCategory(databaseVars)}
          critical={true}
        />

        {/* Build Variables */}
        <VariableCategory
          title="🔧 Build Configuration"
          variables={getVarsByCategory(buildVars)}
          critical={false}
        />

        {/* Sentry Variables */}
        <VariableCategory
          title="📊 Sentry (Optional)"
          variables={getVarsByCategory(sentryVars)}
          critical={false}
        />

        {/* Redis Variables */}
        <VariableCategory
          title="⚡ Redis Caching (Optional)"
          variables={getVarsByCategory(redisVars)}
          critical={false}
        />

        {/* Stripe Variables */}
        <VariableCategory
          title="💳 Stripe Payment (Optional)"
          variables={getVarsByCategory(stripeVars)}
          critical={false}
        />

        {/* Back Button */}
        <div className="text-center py-8">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}

interface VariableCategoryProps {
  title: string;
  variables: Array<{
    name: string;
    status: EnvStatus;
  }>;
  critical: boolean;
}

function VariableCategory({ title, variables, critical }: VariableCategoryProps) {
  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-3">
        {variables.map((variable) => (
          <div
            key={variable.name}
            className={`flex items-center justify-between p-4 rounded-lg border-2 ${variable.status.exists
                ? "bg-green-50 border-green-200"
                : critical
                  ? "bg-red-50 border-red-200"
                  : "bg-gray-50 border-gray-200"
              }`}
          >
            <div className="flex items-center flex-1">
              {variable.status.exists ? (
                <svg
                  className="w-6 h-6 text-green-600 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className={`w-6 h-6 mr-3 flex-shrink-0 ${critical ? "text-red-600" : "text-gray-400"
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              <div>
                <div className="font-mono text-sm font-semibold text-gray-900">
                  {variable.name}
                </div>
                {variable.status.exists && variable.status.masked && (
                  <div className="text-xs text-gray-600 mt-1">
                    Value: {variable.status.masked} ({variable.status.length} chars)
                  </div>
                )}
                {!variable.status.exists && (
                  <div className={`text-xs mt-1 ${critical ? "text-red-600" : "text-gray-500"}`}>
                    Not set
                  </div>
                )}
              </div>
            </div>
            <div>
              {variable.status.exists ? (
                <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-semibold rounded-full">
                  SET
                </span>
              ) : (
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${critical
                      ? "bg-red-200 text-red-800"
                      : "bg-gray-200 text-gray-600"
                    }`}
                >
                  MISSING
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
