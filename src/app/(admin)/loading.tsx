/**
 * 👨‍💼 ADMIN ROUTES LOADING STATE
 *
 * Loading skeleton for admin-facing routes
 * Provides visual feedback during admin dashboard transitions
 */

import { Shield } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header Skeleton */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-32 bg-muted animate-pulse rounded" />
              <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Animated Loading Indicator */}
          <div className="flex flex-col items-center justify-center py-12 mb-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
              <div className="relative bg-blue-500/10 p-4 rounded-full animate-bounce">
                <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="h-6 w-64 bg-muted animate-pulse rounded mx-auto" />
              <div className="h-4 w-80 bg-muted animate-pulse rounded mx-auto" />
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-lg p-6"
                style={{
                  animationDelay: `${i * 75}ms`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                </div>
                <div className="h-9 w-28 bg-muted animate-pulse rounded mb-2" />
                <div className="flex items-center gap-2">
                  <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Charts & Analytics */}
            <div className="lg:col-span-2 space-y-6">
              {/* Chart Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 w-40 bg-muted animate-pulse rounded" />
                  <div className="h-9 w-32 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-64 bg-muted animate-pulse rounded" />
              </div>

              {/* Table Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="h-6 w-48 bg-muted animate-pulse rounded mb-4" />
                <div className="space-y-3">
                  {/* Table Header */}
                  <div className="grid grid-cols-4 gap-4 pb-2 border-b border-border">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-4 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                  {/* Table Rows */}
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="grid grid-cols-4 gap-4 py-3">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="h-4 bg-muted animate-pulse rounded" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar Info */}
            <div className="space-y-6">
              {/* Quick Actions Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="h-6 w-32 bg-muted animate-pulse rounded mb-4" />
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              </div>

              {/* Recent Activity Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="h-6 w-36 bg-muted animate-pulse rounded mb-4" />
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-muted animate-pulse rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-full bg-muted animate-pulse rounded" />
                        <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Status Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="h-6 w-28 bg-muted animate-pulse rounded mb-4" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                      <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Loading Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground animate-pulse">
              🔒 Loading admin dashboard...
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-700 dark:text-amber-300 text-center animate-pulse">
              🔐 Secure admin area • All actions are logged and monitored
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
