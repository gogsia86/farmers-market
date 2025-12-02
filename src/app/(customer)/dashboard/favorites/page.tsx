/**
 * CONSUMER FAVORITES PAGE - WIREFRAME IMPLEMENTATION
 *
 * Complete favorites management with:
 * - Saved farms grid
 * - Saved products grid
 * - Toggle favorites
 * - Empty states
 * - Quick navigation to farms/products
 */

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EmptyState } from "@/components/dashboard/EmptyState";

interface FavoriteFarm {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  location?: {
    city: string;
    state: string;
  };
  productsCount: number;
  rating?: number;
}

interface FavoriteProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  unit: string;
  imageUrl?: string;
  farmName: string;
  farmSlug: string;
  inStock: boolean;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"farms" | "products">("farms");
  const [loading, setLoading] = useState(true);
  const [favoriteFarms, setFavoriteFarms] = useState<FavoriteFarm[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/dashboard/favorites");
      return;
    }

    if (status === "authenticated") {
      fetchFavorites();
    }
  }, [status, router]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/users/favorites");
      const data = await response.json();

      if (data.success) {
        setFavoriteFarms(data.farms || []);
        setFavoriteProducts(data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFarmFavorite = async (farmId: string) => {
    setRemovingId(farmId);
    try {
      const response = await fetch("/api/users/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmId, type: "farm" }),
      });

      if (response.ok) {
        setFavoriteFarms((prev) => prev.filter((f) => f.id !== farmId));
      }
    } catch (error) {
      console.error("Failed to remove farm favorite:", error);
    } finally {
      setRemovingId(null);
    }
  };

  const removeProductFavorite = async (productId: string) => {
    setRemovingId(productId);
    try {
      const response = await fetch("/api/users/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, type: "product" }),
      });

      if (response.ok) {
        setFavoriteProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch (error) {
      console.error("Failed to remove product favorite:", error);
    } finally {
      setRemovingId(null);
    }
  };

  if (status === "loading" || loading) {
    return <FavoritesSkeleton />;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-green-600 hover:text-green-700 font-medium mb-4 inline-flex items-center gap-2"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            My Favorites ❤️
          </h1>
          <p className="text-gray-600 mt-2">
            Quick access to your saved farms and products
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-3xl font-bold text-green-600">
              {favoriteFarms.length}
            </div>
            <div className="text-sm text-gray-600">Saved Farms</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-3xl font-bold text-blue-600">
              {favoriteProducts.length}
            </div>
            <div className="text-sm text-gray-600">Saved Products</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 hidden sm:block">
            <div className="text-3xl font-bold text-red-600">
              {favoriteFarms.length + favoriteProducts.length}
            </div>
            <div className="text-sm text-gray-600">Total Favorites</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("farms")}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === "farms"
                    ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                🏪 Farms ({favoriteFarms.length})
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === "products"
                    ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                🌽 Products ({favoriteProducts.length})
              </button>
            </nav>
          </div>

          {/* Farms Tab */}
          {activeTab === "farms" && (
            <div className="p-6">
              {favoriteFarms.length === 0 ? (
                <EmptyState
                  icon="❤️"
                  title="No favorite farms yet"
                  description="Start exploring and save your favorite farms for quick access"
                  action={
                    <Link href="/farms" className="inline-block btn-green">
                      Browse Farms
                    </Link>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteFarms.map((farm) => (
                    <div
                      key={farm.id}
                      className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-green-500 transition-all group"
                    >
                      {/* Farm Image */}
                      <Link href={`/farms/${farm.slug}`} className="block">
                        <div className="aspect-video bg-gray-200 overflow-hidden">
                          {farm.imageUrl ? (
                            <img
                              src={farm.imageUrl}
                              alt={farm.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl">
                              🏪
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Farm Info */}
                      <div className="p-4">
                        <Link href={`/farms/${farm.slug}`}>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-green-600 transition-colors">
                            {farm.name}
                          </h3>
                        </Link>

                        {farm.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <span>📍</span>
                            <span>
                              {farm.location.city}, {farm.location.state}
                            </span>
                          </div>
                        )}

                        {farm.rating && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <span>⭐</span>
                            <span>{farm.rating.toFixed(1)}</span>
                          </div>
                        )}

                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {farm.description}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <span className="text-sm text-gray-600">
                            {farm.productsCount} Products
                          </span>
                          <button
                            onClick={() => removeFarmFavorite(farm.id)}
                            disabled={removingId === farm.id}
                            className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors disabled:opacity-50"
                          >
                            {removingId === farm.id ? "Removing..." : "❤️ Remove"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="p-6">
              {favoriteProducts.length === 0 ? (
                <EmptyState
                  icon="🌽"
                  title="No favorite products yet"
                  description="Browse farms and save products you love for easy reordering"
                  action={
                    <Link href="/farms" className="inline-block btn-green">
                      Browse Products
                    </Link>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {favoriteProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-green-500 transition-all group"
                    >
                      {/* Product Image */}
                      <Link
                        href={`/farms/${product.farmSlug}/products/${product.slug}`}
                        className="block"
                      >
                        <div className="aspect-square bg-gray-200 overflow-hidden">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl">
                              🌽
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Stock Badge */}
                      {!product.inStock && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          Out of Stock
                        </div>
                      )}

                      {/* Product Info */}
                      <div className="p-4">
                        <Link
                          href={`/farms/${product.farmSlug}/products/${product.slug}`}
                        >
                          <h3 className="font-bold text-gray-900 mb-1 hover:text-green-600 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>

                        <Link
                          href={`/farms/${product.farmSlug}`}
                          className="text-sm text-gray-600 hover:text-green-600 transition-colors mb-3 block"
                        >
                          from {product.farmName}
                        </Link>

                        <div className="flex items-center justify-between mb-3">
                          <div className="text-lg font-bold text-green-600">
                            ${product.price.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            per {product.unit}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {product.inStock ? (
                            <Link
                              href={`/farms/${product.farmSlug}/products/${product.slug}`}
                              className="btn-green flex-1 text-center text-sm py-2"
                            >
                              Add to Cart
                            </Link>
                          ) : (
                            <button
                              disabled
                              className="btn-green flex-1 text-center text-sm py-2 opacity-50 cursor-not-allowed"
                            >
                              Out of Stock
                            </button>
                          )}
                          <button
                            onClick={() => removeProductFavorite(product.id)}
                            disabled={removingId === product.id}
                            className="btn-outline text-sm py-2 px-4 disabled:opacity-50"
                          >
                            {removingId === product.id ? "..." : "❤️"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">💡</span>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Pro Tip: Build Your Weekly Order
              </h3>
              <p className="text-gray-600 mb-4">
                Save your favorite products to quickly build recurring orders from
                your trusted farms
              </p>
              <Link href="/farms" className="btn-green inline-block">
                Discover More Farms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FavoritesSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
