"use client";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import {
  Calendar,
  Filter,
  Leaf,
  MapPin,
  Search,
  ShoppingCart,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * 🍎 PRODUCTS CATALOG PAGE - Fall Harvest Theme
 * Browse, filter, and shop seasonal products
 */

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  season: string;
  farm: {
    name: string;
    location: string;
  };
  inStock: boolean;
  quantity: number;
  organic: boolean;
  image: string;
  rating: number;
  reviewCount: number;
}

// Mock data - Replace with actual API call
const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Organic Pumpkins",
    description: "Perfect for carving or cooking. Grown without pesticides.",
    price: 8.99,
    unit: "each",
    category: "Vegetables",
    season: "Fall",
    farm: {
      name: "Harvest Moon Farm",
      location: "Portland, OR",
    },
    inStock: true,
    quantity: 45,
    organic: true,
    image: "/images/products/pumpkin.jpg",
    rating: 4.9,
    reviewCount: 87,
  },
  {
    id: "2",
    name: "Honeycrisp Apples",
    description: "Sweet and crisp, perfect for fresh eating or baking.",
    price: 4.99,
    unit: "lb",
    category: "Fruits",
    season: "Fall",
    farm: {
      name: "Autumn Ridge Orchard",
      location: "Hillsboro, OR",
    },
    inStock: true,
    quantity: 120,
    organic: true,
    image: "/images/products/apples.jpg",
    rating: 4.8,
    reviewCount: 143,
  },
  {
    id: "3",
    name: "Butternut Squash",
    description: "Sweet, nutty flavor. Great for soups and roasting.",
    price: 3.49,
    unit: "lb",
    category: "Vegetables",
    season: "Fall",
    farm: {
      name: "Green Valley Produce",
      location: "Beaverton, OR",
    },
    inStock: true,
    quantity: 67,
    organic: false,
    image: "/images/products/squash.jpg",
    rating: 4.7,
    reviewCount: 54,
  },
  {
    id: "4",
    name: "Artisan Cheddar Cheese",
    description: "Aged 12 months, from grass-fed cows. Sharp and tangy.",
    price: 12.99,
    unit: "8oz",
    category: "Dairy",
    season: "Year-Round",
    farm: {
      name: "Maple Leaf Dairy",
      location: "Forest Grove, OR",
    },
    inStock: true,
    quantity: 28,
    organic: false,
    image: "/images/products/cheese.jpg",
    rating: 5,
    reviewCount: 76,
  },
  {
    id: "5",
    name: "Fresh Kale",
    description: "Tender baby kale, perfect for salads and smoothies.",
    price: 3.99,
    unit: "bunch",
    category: "Greens",
    season: "Year-Round",
    farm: {
      name: "Green Valley Produce",
      location: "Beaverton, OR",
    },
    inStock: true,
    quantity: 89,
    organic: true,
    image: "/images/products/kale.jpg",
    rating: 4.6,
    reviewCount: 34,
  },
  {
    id: "6",
    name: "Heritage Wheat Flour",
    description:
      "Stone-ground from ancient grains. Perfect for artisan baking.",
    price: 7.99,
    unit: "2lb bag",
    category: "Grains",
    season: "Year-Round",
    farm: {
      name: "Heritage Grains Collective",
      location: "Cornelius, OR",
    },
    inStock: true,
    quantity: 42,
    organic: true,
    image: "/images/products/flour.jpg",
    rating: 4.9,
    reviewCount: 61,
  },
  {
    id: "7",
    name: "Fresh Eggs",
    description: "Free-range, farm-fresh eggs from happy chickens.",
    price: 6.99,
    unit: "dozen",
    category: "Eggs",
    season: "Year-Round",
    farm: {
      name: "Harvest Moon Farm",
      location: "Portland, OR",
    },
    inStock: true,
    quantity: 156,
    organic: true,
    image: "/images/products/eggs.jpg",
    rating: 5,
    reviewCount: 198,
  },
  {
    id: "8",
    name: "Heirloom Tomatoes",
    description: "Colorful mix of heirloom varieties, bursting with flavor.",
    price: 5.99,
    unit: "lb",
    category: "Vegetables",
    season: "Summer",
    farm: {
      name: "Green Valley Produce",
      location: "Beaverton, OR",
    },
    inStock: false,
    quantity: 0,
    organic: true,
    image: "/images/products/tomatoes.jpg",
    rating: 4.8,
    reviewCount: 92,
  },
];

const CATEGORIES = [
  "All",
  "Fruits",
  "Vegetables",
  "Dairy",
  "Grains",
  "Greens",
  "Eggs",
];
const SEASONS = ["All", "Fall", "Summer", "Spring", "Winter", "Year-Round"];

export default function ProductsPage() {
  const searchParams = useSearchParams();

  // Initialize state from URL parameters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSeason, setSelectedSeason] = useState("All");
  const [showOrganic, setShowOrganic] = useState(false);
  const [showInStock, setShowInStock] = useState(true);
  const [sortBy, setSortBy] = useState("featured");

  // Read URL parameters and update filters
  useEffect(() => {
    const category = searchParams.get("category");
    const season = searchParams.get("season");
    const organic = searchParams.get("organic");
    const search = searchParams.get("search");

    if (category) {
      // Capitalize first letter to match category format
      const formattedCategory =
        category.charAt(0).toUpperCase() + category.slice(1);
      setSelectedCategory(formattedCategory);
    }
    if (season) {
      const formattedSeason = season.charAt(0).toUpperCase() + season.slice(1);
      setSelectedSeason(formattedSeason);
    }
    if (organic === "true") {
      setShowOrganic(true);
    }
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.farm.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesSeason =
      selectedSeason === "All" || product.season === selectedSeason;
    const matchesOrganic = !showOrganic || product.organic;
    const matchesStock = !showInStock || product.inStock;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSeason &&
      matchesOrganic &&
      matchesStock
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="hero-gradient py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,106,37,0.3)_0%,transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(184,56,56,0.3)_0%,transparent_50%)]"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 bg-secondary-600/20 border border-secondary-500/30 text-secondary-200 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-semibold mb-6">
                <Leaf className="h-5 w-5" />
                Fresh, Local, Seasonal Products
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Shop Fresh{" "}
                <span className="text-gradient-warm">Fall Harvest</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Discover seasonal produce, artisan goods, and farm-fresh
                products from local farmers.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                {[
                  { label: "Products", value: "500+", icon: "🍎" },
                  { label: "Local Farms", value: "50+", icon: "🌾" },
                  { label: "Daily Fresh", value: "100%", icon: "✨" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="glass-card p-4 rounded-xl text-center"
                  >
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-2xl font-bold text-gradient-warm">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 border-b border-border bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products, farms, or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                />
              </div>

              {/* Category Filters */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      data-category={category}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedCategory === category
                          ? "bg-primary-600 border-primary-600 text-white"
                          : "border-border hover:border-primary-500"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Season Filters */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Season
                </label>
                <div className="flex flex-wrap gap-2">
                  {SEASONS.map((season) => (
                    <button
                      key={season}
                      onClick={() => setSelectedSeason(season)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedSeason === season
                          ? "bg-secondary-600 border-secondary-600 text-white"
                          : "border-border hover:border-secondary-500"
                      }`}
                    >
                      {season}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Filters & Sort */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOrganic}
                      onChange={(e) => setShowOrganic(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium">Organic Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showInStock}
                      onChange={(e) => setShowInStock(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium">In Stock Only</span>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {sortedProducts.length}
                    </span>{" "}
                    products
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20"
                    aria-label="Sort products by"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {sortedProducts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🍎</div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    No Products Found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search terms
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("All");
                      setSelectedSeason("All");
                      setShowOrganic(false);
                      setShowInStock(true);
                    }}
                    className="btn-primary px-6 py-3"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group"
                    >
                      <div className="glass-card rounded-2xl overflow-hidden hover:shadow-glow-lg transition-all duration-300 h-full flex flex-col">
                        {/* Product Image */}
                        <div className="relative h-48 bg-gradient-to-br from-primary-900 to-secondary-900 overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center text-6xl">
                            🍎
                          </div>
                          {!product.inStock && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                                Out of Stock
                              </span>
                            </div>
                          )}
                          {product.organic && (
                            <div className="absolute top-4 left-4">
                              <span className="bg-accent-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <Leaf className="h-3 w-3" />
                                Organic
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="mb-3">
                            <h3 className="text-lg font-bold text-foreground group-hover:text-primary-600 transition-colors mb-1">
                              {product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {product.description}
                            </p>
                          </div>

                          {/* Farm Info */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <MapPin className="h-4 w-4" />
                            <span>{product.farm.name}</span>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-secondary-500 text-secondary-500" />
                              <span className="font-semibold text-foreground text-sm">
                                {product.rating}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              ({product.reviewCount} reviews)
                            </span>
                          </div>

                          {/* Price & Add to Cart */}
                          <div className="mt-auto pt-4 border-t border-border">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-2xl font-bold text-gradient-warm">
                                  ${product.price.toFixed(2)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  per {product.unit}
                                </div>
                              </div>
                              <button
                                data-testid="add-to-cart"
                                className={`p-3 rounded-xl transition-all ${
                                  product.inStock
                                    ? "bg-primary-600 hover:bg-primary-500 text-white shadow-glow hover:shadow-glow-lg"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                                disabled={!product.inStock}
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (product.inStock) {
                                    alert(`Added ${product.name} to cart!`);
                                  }
                                }}
                                aria-label={`Add ${product.name} to cart`}
                              >
                                <ShoppingCart className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-accent-600 to-primary-600">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Want to Sell Your Products?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join our marketplace and reach thousands of customers looking
                for fresh, local products.
              </p>
              <Link
                href="/register-farm"
                className="inline-flex items-center gap-2 bg-white text-accent-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                <TrendingUp className="h-5 w-5" />
                Start Selling Today
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
