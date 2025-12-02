/**
 * 🔄 MARKETPLACE LOADING STATE
 * Divine loading consciousness for marketplace discovery
 */

import { Loader2 } from "lucide-react";

export default function MarketplaceLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Skeleton */}
      <div className="bg-gradient-to-r from-agricultural-700 to-agricultural-600 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="h-12 bg-white/20 rounded-lg mb-4 animate-pulse" />
            <div className="h-6 bg-white/10 rounded-lg mb-8 max-w-md mx-auto animate-pulse" />
            <div className="h-14 bg-white rounded-xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Toolbar Skeleton */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-agricultural-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              Loading marketplace...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Discovering fresh farms and products near you
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
