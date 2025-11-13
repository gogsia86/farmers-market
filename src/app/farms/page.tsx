"use client";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import {
  Award,
  Filter,
  Heart,
  Leaf,
  MapPin,
  Search,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/**
 * 🌾 FARMS DISCOVERY PAGE - Fall Harvest Theme
 * Browse, filter, and discover local farms
 */

interface Farm {
  id: string;
  name: string;
  description: string;
  location: string;
  distance: string;
  rating: number;
  reviewCount: number;
  products: string[];
  certifications: string[];
  image: string;
  featured: boolean;
}

// Mock data - Replace with actual API call
const MOCK_FARMS: Farm[] = [
  {
    id: "1",
    name: "Harvest Moon Farm",
    description:
      "Certified organic farm specializing in seasonal vegetables and heritage pumpkins. Family-owned for 3 generations.",
    location: "Portland, OR",
    distance: "2.3 miles",
    rating: 4.9,
    reviewCount: 127,
    products: ["Pumpkins", "Squash", "Root Vegetables", "Herbs"],
    certifications: ["Organic", "Biodynamic"],
    image: "/images/farms/harvest-moon.jpg",
    featured: true,
  },
  {
    id: "2",
    name: "Autumn Ridge Orchard",
    description:
      "Apple orchard with over 20 varieties. Pick-your-own and fresh cider available daily.",
    location: "Hillsboro, OR",
    distance: "5.7 miles",
    rating: 4.8,
    reviewCount: 89,
    products: ["Apples", "Cider", "Honey", "Preserves"],
    certifications: ["Organic"],
    image: "/images/farms/autumn-ridge.jpg",
    featured: true,
  },
  {
    id: "3",
    name: "Green Valley Produce",
    description:
      "Sustainable farm growing seasonal vegetables, with weekly CSA boxes and farm stand.",
    location: "Beaverton, OR",
    distance: "3.1 miles",
    rating: 4.7,
    reviewCount: 64,
    products: ["Mixed Vegetables", "Greens", "Tomatoes", "Peppers"],
    certifications: ["Sustainable"],
    image: "/images/farms/green-valley.jpg",
    featured: false,
  },
  {
    id: "4",
    name: "Maple Leaf Dairy",
    description:
      "Small family dairy producing artisan cheeses, fresh milk, and butter from grass-fed cows.",
    location: "Forest Grove, OR",
    distance: "8.4 miles",
    rating: 4.9,
    reviewCount: 112,
    products: ["Cheese", "Milk", "Butter", "Yogurt"],
    certifications: ["Grass-Fed", "Humane"],
    image: "/images/farms/maple-leaf.jpg",
    featured: true,
  },
  {
    id: "5",
    name: "Sunset Berry Farm",
    description:
      "U-pick berry farm with strawberries, blueberries, and seasonal produce from June to October.",
    location: "Tigard, OR",
    distance: "4.2 miles",
    rating: 4.6,
    reviewCount: 78,
    products: ["Berries", "Seasonal Produce"],
    certifications: ["Organic"],
    image: "/images/farms/sunset-berry.jpg",
    featured: false,
  },
  {
    id: "6",
    name: "Heritage Grains Collective",
    description:
      "Growing ancient grains and milling flour on-site. Specialty flours and baking mixes available.",
    location: "Cornelius, OR",
    distance: "11.2 miles",
    rating: 4.8,
    reviewCount: 45,
    products: ["Flour", "Grains", "Baking Mixes"],
    certifications: ["Organic", "Heritage"],
    image: "/images/farms/heritage-grains.jpg",
    featured: false,
  },
];

export default function FarmsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("distance");

  const filters = [
    "Organic",
    "Biodynamic",
    "Sustainable",
    "Grass-Fed",
    "Pick-Your-Own",
    "CSA Available",
    "Farm Stand",
    "Online Ordering",
  ];

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const filteredFarms = MOCK_FARMS.filter((farm) => {
    const matchesSearch =
      farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farm.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farm.products.some((p) =>
        p.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesSearch;
  });

  const sortedFarms = [...filteredFarms].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "distance":
        return (
          parseFloat(a.distance.split(" ")[0] || "0") -
          parseFloat(b.distance.split(" ")[0] || "0")
        );
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
                Discover Local Fall Harvest Farms
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Browse Local{" "}
                <span className="text-gradient-warm">Farms & Orchards</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Connect with sustainable farms in your area. Support local
                agriculture and enjoy fresh, seasonal produce.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                {[
                  { label: "Local Farms", value: "50+", icon: "🌾" },
                  { label: "Happy Customers", value: "2,500+", icon: "😊" },
                  { label: "Products", value: "500+", icon: "🍎" },
                ].map((stat, idx) => (
                  <div
                    key={idx}
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

        {/* Search and Filters */}
        <section className="py-8 border-b border-border bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search farms by name, location, or products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                />
              </div>

              {/* Filter Tags */}
              <div className="flex flex-wrap gap-2">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-border hover:border-primary-500 transition-colors">
                  <Filter className="h-4 w-4" />
                  <span className="font-medium">Filters</span>
                </button>
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => toggleFilter(filter)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedFilters.includes(filter)
                        ? "bg-primary-600 border-primary-600 text-white"
                        : "border-border hover:border-primary-500"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Sort and Count */}
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {sortedFarms.length}
                  </span>{" "}
                  farms found
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20"
                  aria-label="Sort farms by"
                >
                  <option value="distance">Sort by Distance</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Farm Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {sortedFarms.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🌾</div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    No Farms Found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search or filters
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedFilters([]);
                    }}
                    className="btn-primary px-6 py-3"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {sortedFarms.map((farm) => (
                    <Link
                      key={farm.id}
                      href={`/farms/${farm.id}`}
                      className="group"
                    >
                      <div
                        data-testid="farm-card"
                        className="glass-card rounded-2xl overflow-hidden hover:shadow-glow-lg transition-all duration-300 h-full"
                      >
                        {/* Image */}
                        <div className="relative h-48 bg-gradient-to-br from-primary-900 to-secondary-900 overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center text-6xl">
                            🏡
                          </div>
                          {farm.featured && (
                            <div className="absolute top-4 left-4">
                              <span className="bg-secondary-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                Featured
                              </span>
                            </div>
                          )}
                          <button
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                            aria-label="Add to favorites"
                            title="Add to favorites"
                          >
                            <Heart className="h-5 w-5 text-primary-600" />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-foreground group-hover:text-primary-600 transition-colors mb-1">
                                {farm.name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{farm.location}</span>
                                <span>•</span>
                                <span>{farm.distance}</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {farm.description}
                          </p>

                          {/* Products */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {farm.products.slice(0, 3).map((product, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-lg bg-accent-900/20 text-accent-200 text-xs font-medium"
                              >
                                {product}
                              </span>
                            ))}
                            {farm.products.length > 3 && (
                              <span className="px-3 py-1 rounded-lg bg-accent-900/20 text-accent-200 text-xs font-medium">
                                +{farm.products.length - 3} more
                              </span>
                            )}
                          </div>

                          {/* Certifications */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {farm.certifications.map((cert, idx) => (
                              <span
                                key={idx}
                                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary-900/20 text-primary-300 text-xs font-medium"
                              >
                                <Leaf className="h-3 w-3" />
                                {cert}
                              </span>
                            ))}
                          </div>

                          {/* Rating */}
                          <div className="flex items-center justify-between pt-4 border-t border-border">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-secondary-500 text-secondary-500" />
                                <span className="font-semibold text-foreground">
                                  {farm.rating}
                                </span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                ({farm.reviewCount} reviews)
                              </span>
                            </div>
                            <span className="text-sm font-medium text-primary-600 group-hover:text-primary-500 transition-colors">
                              View Farm →
                            </span>
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
        <section className="py-16 bg-gradient-to-br from-primary-600 to-secondary-600">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Are You a Farmer?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join our community of local farms and connect with customers who
                value sustainable agriculture.
              </p>
              <Link
                href="/register-farm"
                className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                <TrendingUp className="h-5 w-5" />
                Become a Farmer Partner
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
