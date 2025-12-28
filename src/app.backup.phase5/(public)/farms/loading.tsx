/**
 * PUBLIC FARMS PAGE LOADING STATE
 *
 * Week 1 Day 3 - Performance Optimization
 *
 * Provides skeleton loading for public farms page while data fetches
 * - Grid layout matching actual farms page
 * - Animated skeletons for smooth UX
 * - Map placeholder
 * - Search and filter skeletons
 */

import { MapPin, Search } from "lucide-react";

export default function FarmsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-10 w-64 bg-white/50 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 w-96 bg-white/50 rounded mx-auto mb-8 animate-pulse"></div>

            {/* Search Bar Skeleton */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="h-14 bg-white rounded-lg shadow-lg animate-pulse"></div>
                <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter Bar Skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Buttons */}
            <div className="h-10 w-32 bg-white border rounded-lg shadow-sm animate-pulse"></div>
            <div className="h-10 w-32 bg-white border rounded-lg shadow-sm animate-pulse"></div>
            <div className="h-10 w-24 bg-white border rounded-lg shadow-sm animate-pulse"></div>
          </div>
        </div>

        {/* View Toggle Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Farms Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border overflow-hidden animate-pulse"
            >
              {/* Farm Image Skeleton */}
              <div className="relative h-48 bg-gradient-to-br from-green-100 to-emerald-200">
                <div className="absolute top-4 right-4 space-y-2">
                  <div className="h-8 w-8 bg-white/50 rounded-full"></div>
                  <div className="h-8 w-8 bg-white/50 rounded-full"></div>
                </div>
              </div>

              {/* Farm Content Skeleton */}
              <div className="p-6 space-y-4">
                {/* Farm Name & Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-300" />
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="h-6 w-20 bg-green-100 rounded-full"></div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 py-3 border-t border-b">
                  <div className="text-center">
                    <div className="h-5 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-5 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-5 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-10 w-10 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="fixed bottom-8 right-8 bg-white rounded-full shadow-lg px-4 py-3 flex items-center gap-3 border border-green-200 animate-pulse">
        <div className="relative">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-ping"></div>
          <div className="h-2 w-2 bg-green-500 rounded-full absolute top-0 left-0"></div>
        </div>
        <span className="text-sm font-medium text-gray-700">
          Loading farms...
        </span>
      </div>
    </div>
  );
}
