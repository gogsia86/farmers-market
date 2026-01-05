/**
 * 🌾 FARMS BROWSING PAGE
 * Browse all active farms with search and filters
 */

import { farmService } from "@/lib/services/farm.service";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Browse Farms | Farmers Market",
  description: "Discover local farms and their fresh, organic produce",
};

export default async function FarmsPage() {
  const { farms, total } = await farmService.getAllFarms({
    status: "ACTIVE",
    page: 1,
    limit: 24,
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Explore Local Farms
          </h1>
          <p className="text-lg text-gray-600">
            Discover {total} amazing local farms and their fresh produce
          </p>
        </div>

        {/* Farms Grid */}
        {farms.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <span className="text-3xl">🌾</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No farms found
            </h3>
            <p className="text-gray-600">
              Check back soon! New farms are joining regularly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {farms.map((farm) => (
              <Link
                key={farm.id}
                href={`/farms/${farm.slug}`}
                className="group overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-lg"
              >
                {/* Farm Image */}
                <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                  {farm.images && farm.images.length > 0 ? (
                    <Image
                      src={farm.images[0] || "/placeholder-farm.jpg"}
                      alt={farm.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-6xl">
                      🌾
                    </div>
                  )}
                </div>

                {/* Farm Info */}
                <div className="p-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-green-700">
                    {farm.name}
                  </h3>
                  {farm.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                      {farm.description}
                    </p>
                  )}

                  {/* Location */}
                  {farm.location && (
                    <div className="mb-3 flex items-center text-sm text-gray-500">
                      <svg
                        className="mr-1 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {typeof farm.location === 'object' && 'city' in farm.location
                        ? `${farm.location.city}, ${farm.location.state}`
                        : "Location available"}
                    </div>
                  )}

                  {/* Visit Farm */}
                  <div className="flex items-center justify-end border-t pt-3">
                    <span className="text-sm font-medium text-green-700 group-hover:underline">
                      Visit Farm →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
