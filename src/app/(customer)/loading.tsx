/**
 * 🛒 CUSTOMER ROUTES LOADING STATE
 *
 * Loading skeleton for customer-facing routes
 * Provides visual feedback during page transitions
 */

import { ShoppingCart } from "lucide-react";

export default function CustomerLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header Skeleton */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
              <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Animated Loading Indicator */}
          <div className="flex flex-col items-center justify-center py-12 mb-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
              <div className="relative bg-primary/10 p-4 rounded-full animate-bounce">
                <ShoppingCart className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="h-6 w-48 bg-muted animate-pulse rounded mx-auto" />
              <div className="h-4 w-64 bg-muted animate-pulse rounded mx-auto" />
            </div>
          </div>

          {/* Product Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-lg overflow-hidden"
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              >
                {/* Image Skeleton */}
                <div className="aspect-square bg-muted animate-pulse" />

                {/* Content Skeleton */}
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />

                  <div className="flex items-center justify-between pt-2">
                    <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                    <div className="h-9 w-24 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Loading Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground animate-pulse">
              🌾 Loading fresh products...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
