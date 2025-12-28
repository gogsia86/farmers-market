"use client";

import { Filter, Leaf, MapPin, Search, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/**
 * 🔍 UNIVERSAL SEARCH PAGE - Fall Harvest Theme
 * Search across farms, products, and categories
 */

interface SearchResult {
  id: string;
  type: "farm" | "product" | "category";
  name: string;
  description: string;
  image: string;
  url: string;
  metadata?: {
    location?: string;
    price?: string;
    farm?: string;
    rating?: number;
    productCount?: number;
  };
}

// Mock search results - Replace with actual search API
const MOCK_RESULTS: SearchResult[] = [
  {
    id: "1",
    type: "farm",
    name: "Harvest Moon Farm",
    description: "Certified organic farm with seasonal vegetables and pumpkins",
    image: "/images/farms/harvest-moon.jpg",
    url: "/farms/1",
    metadata: {
      location: "Portland, OR",
      rating: 4.9,
    },
  },
  {
    id: "2",
    type: "product",
    name: "Organic Pumpkins",
    description: "Perfect for carving or cooking. Grown without pesticides.",
    image: "/images/products/pumpkin.jpg",
    url: "/products/1",
    metadata: {
      price: "$8.99 each",
      farm: "Harvest Moon Farm",
      rating: 4.9,
    },
  },
  {
    id: "3",
    type: "product",
    name: "Honeycrisp Apples",
    description: "Sweet and crisp, perfect for fresh eating or baking.",
    image: "/images/products/apples.jpg",
    url: "/products/2",
    metadata: {
      price: "$4.99/lb",
      farm: "Autumn Ridge Orchard",
      rating: 4.8,
    },
  },
  {
    id: "4",
    type: "category",
    name: "Vegetables",
    description: "Farm-fresh vegetables and greens",
    image: "/images/categories/vegetables.jpg",
    url: "/products?category=vegetables",
    metadata: {
      productCount: 78,
    },
  },
  {
    id: "5",
    type: "farm",
    name: "Autumn Ridge Orchard",
    description: "Apple orchard with over 20 varieties and fresh cider",
    image: "/images/farms/autumn-ridge.jpg",
    url: "/farms/2",
    metadata: {
      location: "Hillsboro, OR",
      rating: 4.8,
    },
  },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<
    "all" | "farm" | "product" | "category"
  >("all");
  const [results, setResults] = useState<SearchResult[]>(MOCK_RESULTS);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Replace with actual search API call
    if (query.trim() === "") {
      setResults(MOCK_RESULTS);
    } else {
      const filtered = MOCK_RESULTS.filter(
        (result) =>
          result.name.toLowerCase().includes(query.toLowerCase()) ||
          result.description.toLowerCase().includes(query.toLowerCase()),
      );
      setResults(filtered);
    }
  };

  const filteredResults =
    selectedType === "all"
      ? results
      : results.filter((r) => r.type === selectedType);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "farm":
        return "🌾";
      case "product":
        return "🍎";
      case "category":
        return "🗂️";
      default:
        return "📦";
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "farm":
        return "bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300";
      case "product":
        return "bg-secondary-100 text-secondary-700 dark:bg-secondary-900/20 dark:text-secondary-300";
      case "category":
        return "bg-accent-100 text-accent-700 dark:bg-accent-900/20 dark:text-accent-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Search
            </h1>
            <p className="text-muted-foreground">
              Find farms, products, and categories
            </p>
          </div>

          {/* Search Bar */}
          <div className="glass-card rounded-2xl p-6 mb-6">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for farms, products, or categories..."
                className="w-full pl-14 pr-4 py-4 text-lg rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                autoFocus
              />
            </div>

            {/* Filter by Type */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Show:
              </span>
              {[
                { value: "all", label: "All Results" },
                { value: "farm", label: "Farms" },
                { value: "product", label: "Products" },
                { value: "category", label: "Categories" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() =>
                    setSelectedType(filter.value as typeof selectedType)
                  }
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedType === filter.value
                      ? "bg-primary-600 border-primary-600 text-white"
                      : "border-border hover:border-primary-500"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">
                {filteredResults.length}
              </span>{" "}
              results {searchQuery && `for "${searchQuery}"`}
            </p>
          </div>

          {filteredResults.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                No Results Found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try searching with different keywords
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("all");
                  setResults(MOCK_RESULTS);
                }}
                className="btn-primary px-6 py-3"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <Link key={result.id} href={result.url} className="block group">
                  <div className="glass-card rounded-2xl p-6 hover:shadow-glow-lg transition-all duration-300">
                    <div className="flex gap-4">
                      {/* Result Image */}
                      <div className="w-24 h-24 bg-gradient-to-br from-primary-900 to-secondary-900 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-4xl">
                          {getTypeIcon(result.type)}
                        </span>
                      </div>

                      {/* Result Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-semibold ${getTypeBadgeColor(
                                  result.type,
                                )}`}
                              >
                                {result.type.charAt(0).toUpperCase() +
                                  result.type.slice(1)}
                              </span>
                              {result.metadata?.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-secondary-500 text-secondary-500" />
                                  <span className="text-sm font-semibold">
                                    {result.metadata.rating}
                                  </span>
                                </div>
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-foreground group-hover:text-primary-600 transition-colors">
                              {result.name}
                            </h3>
                          </div>
                          {result.metadata?.price && (
                            <div className="text-lg font-bold text-gradient-warm whitespace-nowrap">
                              {result.metadata.price}
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {result.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm">
                          {result.metadata?.location && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{result.metadata.location}</span>
                            </div>
                          )}
                          {result.metadata?.farm && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Leaf className="h-4 w-4" />
                              <span>{result.metadata.farm}</span>
                            </div>
                          )}
                          {result.metadata?.productCount && (
                            <div className="text-muted-foreground">
                              {result.metadata.productCount} products
                            </div>
                          )}
                          {result.type === "product" && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                alert("Added to cart!");
                              }}
                              data-testid="add-to-cart-button"
                              className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              <span>Add to Cart</span>
                            </button>
                          )}
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
    </main>
  );
}
