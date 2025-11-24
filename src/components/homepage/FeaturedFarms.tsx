"use client";

/**
 * 🌟 FEATURED FARMS COMPONENT
 * Displays featured farms on homepage with real API data
 *
 * Divine Patterns:
 * - Client component for interactivity
 * - Fetches real data from /api/featured/farms
 * - Loading states and error handling
 * - Responsive grid layout
 */

import { MapPin, Star, Leaf } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Farm {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string | null;
  state: string | null;
  coverImage: string | null;
  averageRating?: number;
  totalReviews?: number;
  _count?: {
    products: number;
    reviews: number;
  };
}

interface FeaturedFarmsResponse {
  success: boolean;
  data: Farm[];
  meta: {
    count: number;
    strategy: string;
  };
}

export function FeaturedFarms() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeaturedFarms() {
      try {
        setLoading(true);
        const response = await fetch(
          "/api/featured/farms?limit=6&strategy=top-rated",
        );

        if (!response.ok) {
          throw new Error("Failed to fetch featured farms");
        }

        const data: FeaturedFarmsResponse = await response.json();

        if (data.success) {
          setFarms(data.data);
        } else {
          throw new Error("API returned unsuccessful response");
        }
      } catch (err) {
        console.error("Error fetching featured farms:", err);
        setError(err instanceof Error ? err.message : "Failed to load farms");
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedFarms();
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 animate-pulse"
          >
            <div className="h-48 bg-gray-200" />
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-3 w-3/4" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <Leaf className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to Load Farms
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-agricultural-600 hover:bg-agricultural-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (farms.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-agricultural-100 rounded-full mb-4">
          <Leaf className="h-8 w-8 text-agricultural-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Featured Farms Yet
        </h3>
        <p className="text-gray-600">
          Check back soon for amazing local farms!
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {farms.map((farm) => {
        const rating = farm.averageRating || 0;
        const reviewCount = farm.totalReviews || farm._count?.reviews || 0;
        const productCount = farm._count?.products || 0;

        return (
          <Link
            key={farm.id}
            href={`/farms/${farm.slug}`}
            className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100"
          >
            {/* Farm Cover Image */}
            <div className="relative h-48 bg-gradient-to-br from-agricultural-50 to-green-50 overflow-hidden">
              {farm.coverImage ? (
                <img
                  src={farm.coverImage}
                  alt={farm.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Leaf className="h-20 w-20 text-agricultural-300" />
                </div>
              )}

              {/* Rating Badge */}
              {rating > 0 && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold text-gray-900">
                    {rating.toFixed(1)}
                  </span>
                </div>
              )}

              {/* Product Count Badge */}
              {productCount > 0 && (
                <div className="absolute top-4 left-4 bg-agricultural-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                  {productCount} Products
                </div>
              )}
            </div>

            {/* Farm Info */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-agricultural-600 transition-colors">
                {farm.name}
              </h3>

              {/* Location */}
              {(farm.city || farm.state) && (
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {farm.city}
                    {farm.city && farm.state && ", "}
                    {farm.state}
                  </span>
                </div>
              )}

              {/* Description */}
              {farm.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {farm.description}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {reviewCount > 0 && <span>{reviewCount} reviews</span>}
                </div>
                <span className="text-agricultural-600 font-medium text-sm group-hover:gap-2 flex items-center gap-1 transition-all">
                  Visit Farm
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
