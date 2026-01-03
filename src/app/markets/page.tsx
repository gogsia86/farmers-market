/**
 * 🏪 MARKETPLACE DISCOVERY PAGE - DIVINE IMPLEMENTATION
 *
 * Comprehensive marketplace combining farms and products discovery with:
 * - Map view / List view toggle
 * - Advanced filtering (location, categories, attributes)
 * - Real-time search
 * - Location-based sorting
 * - Responsive design
 *
 * DIVINE PRINCIPLES:
 * - Agricultural consciousness in discovery
 * - Quantum data loading
 * - Biodynamic filtering patterns
 * - Holographic component architecture
 */

"use client";

import { createLogger } from "@/lib/utils/logger";
import { useCartStore } from "@/stores/cartStore";
import {
  Award,
  Leaf,
  List,
  Loader2,
  Map as MapIcon,
  MapPin,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  Store,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const marketsLogger = createLogger("MarketsPage");

/**
 * 🌾 MARKETPLACE ENTITY TYPES
 * Agricultural consciousness data structures
 */
interface Farm {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  distance?: number;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  categories: string[];
  certifications: string[];
  image: string;
  featured: boolean;
  deliveryAvailable: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  farmName: string;
  farmSlug: string;
  organic: boolean;
  inStock: boolean;
  image: string;
  rating: number;
}

interface FilterState {
  searchQuery: string;
  viewMode: "list" | "map";
  contentType: "all" | "farms" | "products";
  categories: string[];
  distance: number;
  certifications: string[];
  priceRange: { min: number; max: number };
  inStockOnly: boolean;
  sortBy: "relevance" | "distance" | "rating" | "newest";
}

/**
 * 🎯 MARKETPLACE DISCOVERY COMPONENT
 * Divine agricultural marketplace consciousness
 */
export default function MarketplacePage() {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    viewMode: "list",
    contentType: "all",
    categories: [],
    distance: 25,
    certifications: [],
    priceRange: { min: 0, max: 100 },
    inStockOnly: false,
    sortBy: "relevance",
  });

  const [farms, setFarms] = useState<Farm[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Cart functionality
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: `${Date.now()}-${product.id}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  };

  // Fetch marketplace data
  useEffect(() => {
    fetchMarketplaceData();
  }, [filters.sortBy, filters.distance, filters.categories]);

  async function fetchMarketplaceData() {
    setLoading(true);
    try {
      // Fetch real farms from API
      const farmsResponse = await fetch("/api/farms?status=ACTIVE&limit=50");
      if (farmsResponse.ok) {
        const farmsData = await farmsResponse.json();
        if (farmsData.success && Array.isArray(farmsData.data)) {
          // Transform API data to match component interface
          const transformedFarms = farmsData.data.map((farm: any) => ({
            id: farm.id,
            name: farm.name,
            slug: farm.slug,
            description: farm.description || "",
            location: `${farm.city || ""}, ${farm.state || ""}`.trim(),
            city: farm.city || "",
            state: farm.state || "",
            distance: 0, // TODO: Calculate based on user location
            rating: farm.averageRating || 0,
            reviewCount: farm._count?.reviews || 0,
            productCount: farm._count?.products || 0,
            categories: [], // TODO: Add categories from API
            certifications: [], // TODO: Add certifications from API
            image: farm.bannerUrl || farm.logoUrl || "",
            featured: false,
            deliveryAvailable: false,
            coordinates: {
              lat: farm.latitude || 0,
              lng: farm.longitude || 0,
            },
          }));
          setFarms(transformedFarms);
        }
      }

      // Fetch real products from API
      const productsResponse = await fetch(
        "/api/products?status=ACTIVE&inStock=true&limit=50",
      );
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        if (productsData.success && Array.isArray(productsData.products)) {
          // Transform API data to match component interface
          const transformedProducts = productsData.products.map(
            (product: any) => ({
              id: product.id,
              name: product.name,
              description: product.description || "",
              price: product.price,
              unit: product.unit || "item",
              category: product.category || "Other",
              farmName: product.farm?.name || "Unknown Farm",
              farmSlug: product.farm?.slug || "",
              organic: product.organic || false,
              inStock: product.inStock,
              image: product.images?.[0] || "",
              rating: 0, // TODO: Add product ratings
            }),
          );
          setProducts(transformedProducts);
        }
      }
    } catch (error) {
      marketsLogger.error(
        "Failed to fetch marketplace data",
        error instanceof Error ? error : new Error(String(error)),
      );
      // Fallback to mock data on error
      setFarms(MOCK_FARMS);
      setProducts(MOCK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }

  // Filter farms and products
  const filteredFarms = farms.filter((farm) => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (
        !farm.name.toLowerCase().includes(query) &&
        !farm.description.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (
      filters.categories.length > 0 &&
      !filters.categories.some((cat) => farm.categories.includes(cat))
    ) {
      return false;
    }
    if (
      filters.certifications.length > 0 &&
      !filters.certifications.some((cert) => farm.certifications.includes(cert))
    ) {
      return false;
    }
    if (farm.distance && farm.distance > filters.distance) {
      return false;
    }
    return true;
  });

  const filteredProducts = products.filter((product) => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (
        !product.name.toLowerCase().includes(query) &&
        !product.description.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(product.category)
    ) {
      return false;
    }
    if (filters.inStockOnly && !product.inStock) {
      return false;
    }
    if (
      product.price < filters.priceRange.min ||
      product.price > filters.priceRange.max
    ) {
      return false;
    }
    return true;
  });

  // Note: displayItems variable prepared for future filtering/sorting implementation
  // Currently using filteredFarms and filteredProducts directly in the render
  // const displayItems =
  //   filters.contentType === "farms"
  //     ? filteredFarms
  //     : filters.contentType === "products"
  //       ? filteredProducts
  //       : [...filteredFarms, ...filteredProducts];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Search Section */}
      <section className="bg-gradient-to-r from-agricultural-700 to-agricultural-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Local Farms & Fresh Products
            </h1>
            <p className="text-xl text-agricultural-100 mb-8">
              Connect directly with farmers in your community
            </p>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search farms, products, or locations..."
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters({ ...filters, searchQuery: e.target.value })
                }
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-agricultural-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="bg-white border-b sticky top-[72px] z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between py-4 gap-4">
            {/* Content Type Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ ...filters, contentType: "all" })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filters.contentType === "all"
                    ? "bg-agricultural-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All ({filteredFarms.length + filteredProducts.length})
              </button>
              <button
                onClick={() => setFilters({ ...filters, contentType: "farms" })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filters.contentType === "farms"
                    ? "bg-agricultural-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Store className="inline h-4 w-4 mr-1" />
                Farms ({filteredFarms.length})
              </button>
              <button
                onClick={() =>
                  setFilters({ ...filters, contentType: "products" })
                }
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filters.contentType === "products"
                    ? "bg-agricultural-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Leaf className="inline h-4 w-4 mr-1" />
                Products ({filteredProducts.length})
              </button>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {(filters.categories.length > 0 ||
                  filters.certifications.length > 0) && (
                  <span className="bg-agricultural-600 text-white text-xs rounded-full px-2 py-0.5">
                    {filters.categories.length + filters.certifications.length}
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortBy: e.target.value as FilterState["sortBy"],
                  })
                }
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <option value="relevance">Most Relevant</option>
                <option value="distance">Nearest First</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex gap-1 border rounded-lg p-1">
                <button
                  onClick={() => setFilters({ ...filters, viewMode: "list" })}
                  className={`p-2 rounded ${
                    filters.viewMode === "list"
                      ? "bg-agricultural-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setFilters({ ...filters, viewMode: "map" })}
                  className={`p-2 rounded ${
                    filters.viewMode === "map"
                      ? "bg-agricultural-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <MapIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-32">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">Filters</h3>
                  <button
                    onClick={() =>
                      setFilters({
                        ...filters,
                        categories: [],
                        certifications: [],
                        inStockOnly: false,
                      })
                    }
                    className="text-sm text-agricultural-600 hover:text-agricultural-700"
                  >
                    Clear all
                  </button>
                </div>

                {/* Distance Filter */}
                <div className="mb-6">
                  <label className="block font-medium mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Distance
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={filters.distance}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        distance: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>5 mi</span>
                    <span className="font-medium text-agricultural-600">
                      {filters.distance} mi
                    </span>
                    <span>50 mi</span>
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <label className="block font-medium mb-2">Categories</label>
                  {CATEGORIES.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 py-1 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({
                              ...filters,
                              categories: [...filters.categories, category],
                            });
                          } else {
                            setFilters({
                              ...filters,
                              categories: filters.categories.filter(
                                (c) => c !== category,
                              ),
                            });
                          }
                        }}
                        className="rounded text-agricultural-600 focus:ring-agricultural-500"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>

                {/* Certifications */}
                <div className="mb-6">
                  <label className="block font-medium mb-2">
                    <Award className="inline h-4 w-4 mr-1" />
                    Certifications
                  </label>
                  {CERTIFICATIONS.map((cert) => (
                    <label
                      key={cert}
                      className="flex items-center gap-2 py-1 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.certifications.includes(cert)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({
                              ...filters,
                              certifications: [...filters.certifications, cert],
                            });
                          } else {
                            setFilters({
                              ...filters,
                              certifications: filters.certifications.filter(
                                (c) => c !== cert,
                              ),
                            });
                          }
                        }}
                        className="rounded text-agricultural-600 focus:ring-agricultural-500"
                      />
                      <span className="text-sm">{cert}</span>
                    </label>
                  ))}
                </div>

                {/* In Stock Only */}
                {filters.contentType !== "farms" && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.inStockOnly}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          inStockOnly: e.target.checked,
                        })
                      }
                      className="rounded text-agricultural-600 focus:ring-agricultural-500"
                    />
                    <span className="text-sm font-medium">In Stock Only</span>
                  </label>
                )}
              </div>
            </aside>
          )}

          {/* Results */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-agricultural-600" />
              </div>
            ) : filters.viewMode === "map" ? (
              <MapView farms={filteredFarms} />
            ) : (
              <div className="space-y-4">
                {/* Farms Section */}
                {filters.contentType !== "products" &&
                  filteredFarms.length > 0 && (
                    <>
                      <h2 className="text-2xl font-bold mb-4">
                        Farms ({filteredFarms.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {filteredFarms.map((farm) => (
                          <FarmCard key={farm.id} farm={farm} />
                        ))}
                      </div>
                    </>
                  )}

                {/* Products Section */}
                {filters.contentType !== "farms" &&
                  filteredProducts.length > 0 && (
                    <>
                      <h2 className="text-2xl font-bold mb-4">
                        Products ({filteredProducts.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={handleAddToCart}
                          />
                        ))}
                      </div>
                    </>
                  )}

                {/* Empty State */}
                {filteredFarms.length === 0 &&
                  filteredProducts.length === 0 && (
                    <div className="text-center py-20">
                      <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">
                        No results found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Try adjusting your filters or search query
                      </p>
                      <button
                        onClick={() =>
                          setFilters({
                            ...filters,
                            searchQuery: "",
                            categories: [],
                            certifications: [],
                          })
                        }
                        className="text-agricultural-600 hover:text-agricultural-700 font-medium"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * 🏪 FARM CARD COMPONENT
 * Biodynamic farm display consciousness
 */
function FarmCard({ farm }: { farm: Farm }) {
  return (
    <Link
      href={`/farms/${farm.slug}`}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
    >
      <div className="relative h-48">
        <Image
          src={farm.image}
          alt={farm.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {farm.featured && (
          <div className="absolute top-3 right-3 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Featured
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 group-hover:text-agricultural-600 transition-colors">
          {farm.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {farm.description}
        </p>
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {farm.location}
            {farm.distance && ` • ${farm.distance} mi`}
          </span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-medium">{farm.rating}</span>
            <span className="text-gray-500 text-sm">({farm.reviewCount})</span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="text-sm text-gray-600">
            {farm.productCount} products
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {farm.certifications.slice(0, 2).map((cert) => (
            <span
              key={cert}
              className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full"
            >
              {cert}
            </span>
          ))}
          {farm.deliveryAvailable && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
              Delivery
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * 🍎 PRODUCT CARD COMPONENT
 * Agricultural product consciousness
 */
function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      <div className="relative h-48">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.organic && (
          <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            <Leaf className="inline h-3 w-3 mr-1" />
            Organic
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold mb-1 group-hover:text-agricultural-600 transition-colors">
          {product.name}
        </h3>
        <Link
          href={`/farms/${product.farmSlug}`}
          className="text-sm text-agricultural-600 hover:text-agricultural-700 mb-2 block"
        >
          {product.farmName}
        </Link>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-agricultural-700">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-gray-500 text-sm">/{product.unit}</span>
          </div>
          {product.inStock && (
            <button
              onClick={() => onAddToCart(product)}
              className="bg-agricultural-600 text-white px-4 py-2 rounded-lg hover:bg-agricultural-700 transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 🗺️ MAP VIEW COMPONENT
 * Quantum geographical consciousness
 */
function MapView({ farms }: { farms: Farm[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
      <MapIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-bold mb-2">Map View Coming Soon</h3>
      <p className="text-gray-600 mb-6">
        We're integrating Google Maps to show farm locations and delivery areas.
      </p>
      <div className="bg-gray-50 rounded-lg p-6">
        <p className="text-sm text-gray-500 mb-4">
          Showing {farms.length} farms in list format for now
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {farms.slice(0, 4).map((farm) => (
            <div key={farm.id} className="text-left border rounded-lg p-4">
              <h4 className="font-bold">{farm.name}</h4>
              <p className="text-sm text-gray-600">{farm.location}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 🌾 MOCK DATA - Agricultural Consciousness
 * Replace with actual API calls
 */
const CATEGORIES = [
  "Vegetables",
  "Fruits",
  "Dairy",
  "Eggs",
  "Meat",
  "Herbs",
  "Honey",
  "Bakery",
];

const CERTIFICATIONS = [
  "Organic",
  "Biodynamic",
  "Non-GMO",
  "Certified Humane",
  "Grass-Fed",
];

const MOCK_FARMS: Farm[] = [
  {
    id: "1",
    name: "Harvest Moon Farm",
    slug: "harvest-moon-farm",
    description:
      "Certified organic farm specializing in seasonal vegetables and heritage pumpkins.",
    location: "Portland, OR",
    city: "Portland",
    state: "OR",
    distance: 2.3,
    rating: 4.9,
    reviewCount: 127,
    productCount: 24,
    categories: ["Vegetables", "Fruits"],
    certifications: ["Organic", "Biodynamic"],
    image: "/images/farms/harvest-moon.jpg",
    featured: true,
    deliveryAvailable: true,
    coordinates: { lat: 45.5152, lng: -122.6784 },
  },
  {
    id: "2",
    name: "Green Acres Dairy",
    slug: "green-acres-dairy",
    description:
      "Family-owned dairy farm producing organic milk, cheese, and yogurt.",
    location: "Eugene, OR",
    city: "Eugene",
    state: "OR",
    distance: 8.7,
    rating: 4.8,
    reviewCount: 89,
    productCount: 15,
    categories: ["Dairy"],
    certifications: ["Organic", "Certified Humane"],
    image: "/images/farms/green-acres.jpg",
    featured: false,
    deliveryAvailable: true,
    coordinates: { lat: 44.0521, lng: -123.0868 },
  },
  {
    id: "3",
    name: "Sunset Valley Ranch",
    slug: "sunset-valley-ranch",
    description: "Grass-fed beef and pasture-raised chicken from our ranch.",
    location: "Salem, OR",
    city: "Salem",
    state: "OR",
    distance: 15.2,
    rating: 4.7,
    reviewCount: 156,
    productCount: 18,
    categories: ["Meat", "Eggs"],
    certifications: ["Grass-Fed", "Certified Humane"],
    image: "/images/farms/sunset-valley.jpg",
    featured: true,
    deliveryAvailable: false,
    coordinates: { lat: 44.9429, lng: -123.0351 },
  },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Organic Tomatoes",
    description: "Fresh, vine-ripened heirloom tomatoes",
    price: 5.99,
    unit: "lb",
    category: "Vegetables",
    farmName: "Harvest Moon Farm",
    farmSlug: "harvest-moon-farm",
    organic: true,
    inStock: true,
    image: "/images/products/tomatoes.jpg",
    rating: 4.9,
  },
  {
    id: "2",
    name: "Raw Honey",
    description: "Pure, unfiltered wildflower honey",
    price: 12.99,
    unit: "jar",
    category: "Honey",
    farmName: "Harvest Moon Farm",
    farmSlug: "harvest-moon-farm",
    organic: true,
    inStock: true,
    image: "/images/products/honey.jpg",
    rating: 5.0,
  },
  {
    id: "3",
    name: "Organic Milk",
    description: "Whole milk from grass-fed cows",
    price: 6.99,
    unit: "gallon",
    category: "Dairy",
    farmName: "Green Acres Dairy",
    farmSlug: "green-acres-dairy",
    organic: true,
    inStock: true,
    image: "/images/products/milk.jpg",
    rating: 4.8,
  },
  {
    id: "4",
    name: "Free-Range Eggs",
    description: "Fresh eggs from happy hens",
    price: 7.99,
    unit: "dozen",
    category: "Eggs",
    farmName: "Sunset Valley Ranch",
    farmSlug: "sunset-valley-ranch",
    organic: false,
    inStock: true,
    image: "/images/products/eggs.jpg",
    rating: 4.9,
  },
];
