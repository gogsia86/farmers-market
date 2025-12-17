/**
 * FARMERS MARKET HOME PAGE - DIVINE SERVER COMPONENT IMPLEMENTATION
 *
 * WEEK 1 DAY 3 - Performance Optimization
 *
 * Server Component Benefits:
 * - Zero client-side JavaScript for initial render
 * - Direct database access (no API calls)
 * - Automatic code splitting
 * - SEO optimized
 * - Faster Time to First Byte (TTFB)
 *
 * Features:
 * - Featured farms (real data from homepage.service.ts)
 * - Trending products (real data)
 * - Platform stats (real-time)
 * - Seasonal products
 * - Hero section with search
 * - How it works section
 * - Testimonials
 * - CTA sections
 */

import { Header } from "@/components/layout/Header";
import { SearchAutocomplete } from "@/components/homepage/SearchAutocomplete";
import { PlatformStats } from "@/components/homepage/PlatformStats";
import { FeaturedFarms } from "@/components/homepage/FeaturedFarms";
import {
  getFeaturedFarms,
  getTrendingProducts,
  getPlatformStats,
  getSeasonalProducts,
} from "@/lib/services/homepage.service";
import {
  ArrowRight,
  Award,
  Clock,
  Leaf,
  MapPin,
  Search,
  Shield,
  ShoppingBag,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

// Revalidate every 5 minutes for fresh data
export const revalidate = 300;

// ============================================================================
// Main Page Component (Server Component)
// ============================================================================

export default async function HomePage() {
  // Parallel data fetching for optimal performance
  const [featuredFarms, trendingProducts, platformStats, seasonalProducts] =
    await Promise.all([
      getFeaturedFarms({ limit: 6, featured: true }),
      getTrendingProducts({ limit: 8 }),
      getPlatformStats(),
      getSeasonalProducts({ limit: 4 }),
    ]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-20 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-sm">
                <Leaf className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Farm Fresh, Locally Grown
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Fresh From Farm
                <span className="block text-green-600">To Your Table</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Connect directly with local farmers. Get the freshest produce,
                support sustainable agriculture, and build a healthier
                community.
              </p>

              {/* Search Bar - Client Component */}
              <div className="max-w-2xl mx-auto mb-8">
                <Suspense fallback={<SearchBarSkeleton />}>
                  <SearchAutocomplete />
                </Suspense>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Shop Products
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/farms"
                  className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl border-2 border-green-600 transform hover:-translate-y-0.5"
                >
                  <MapPin className="h-5 w-5" />
                  Explore Farms
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Stats - Real-time Data */}
        <section className="py-12 bg-white border-b">
          <div className="container mx-auto px-4">
            <Suspense fallback={<StatsSkeleton />}>
              <PlatformStats stats={platformStats} />
            </Suspense>
          </div>
        </section>

        {/* Featured Farms - Real Data */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Featured Farms
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Meet our verified local farmers committed to sustainable
                agriculture and quality produce
              </p>
            </div>

            <Suspense fallback={<FarmsSkeleton />}>
              <FeaturedFarms farms={featuredFarms} />
            </Suspense>

            <div className="text-center mt-12">
              <Link
                href="/farms"
                className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 transition-colors group"
              >
                View All Farms
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Trending Products */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Trending Products
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Fresh, seasonal produce loved by our community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all border border-gray-100 overflow-hidden transform hover:-translate-y-1"
                >
                  <div className="relative h-48 bg-gray-100">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Leaf className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                    {product.isOrganic && (
                      <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Organic
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {product.farm.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        ${product.price.toFixed(2)}
                        <span className="text-sm text-gray-500 font-normal">
                          /{product.unit}
                        </span>
                      </span>
                      {product.averageRating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {product.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
              >
                <ShoppingBag className="h-5 w-5" />
                Browse All Products
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Seasonal Products */}
        {seasonalProducts.length > 0 && (
          <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-4 shadow-sm">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-900">
                    Limited Season
                  </span>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  In Season Now
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Fresh harvests available for a limited time
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {seasonalProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all border-2 border-amber-200 overflow-hidden transform hover:-translate-y-1"
                  >
                    <div className="relative h-48 bg-gray-100">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Leaf className="h-16 w-16 text-gray-300" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Seasonal
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {product.farm.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-amber-600">
                          ${product.price.toFixed(2)}
                          <span className="text-sm text-gray-500 font-normal">
                            /{product.unit}
                          </span>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Categories Grid */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Shop by Category
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover fresh produce organized by your favorite categories
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={`/products?category=${category.name.toLowerCase()}`}
                  className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 text-center hover:shadow-xl transition-all border border-gray-100 transform hover:-translate-y-1"
                  style={{ backgroundColor: `${category.color}10` }}
                >
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <category.icon
                      className="h-8 w-8"
                      style={{ color: category.color }}
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From farm to table in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.step} className="relative">
                  <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
                      <step.icon className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="absolute top-4 right-4 text-6xl font-bold text-green-100">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-center">
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-8 w-8 text-green-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose Our Platform
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Supporting local farmers and sustainable agriculture
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="text-center group hover:transform hover:-translate-y-2 transition-all"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 group-hover:bg-green-600 transition-colors">
                    <benefit.icon className="h-8 w-8 text-green-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What Our Community Says
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Real stories from farmers and customers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Support Local Farmers?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of community members enjoying fresh, sustainable
              produce delivered to their door
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <ShoppingBag className="h-5 w-5" />
                Start Shopping
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/farms"
                className="inline-flex items-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all"
              >
                <MapPin className="h-5 w-5" />
                Explore Farms
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

// ============================================================================
// Static Data
// ============================================================================

const categories = [
  { name: "Vegetables", icon: Leaf, color: "#059669" },
  { name: "Fruits", icon: Award, color: "#DC2626" },
  { name: "Dairy", icon: ShoppingBag, color: "#2563EB" },
  { name: "Meat", icon: Shield, color: "#DC2626" },
  { name: "Eggs", icon: Award, color: "#F59E0B" },
  { name: "Honey", icon: Star, color: "#F59E0B" },
];

const steps = [
  {
    step: 1,
    title: "Browse & Select",
    description:
      "Explore our marketplace of fresh, local products from verified farms",
    icon: Search,
  },
  {
    step: 2,
    title: "Order Direct",
    description:
      "Place your order directly with local farmers - no middlemen involved",
    icon: ShoppingBag,
  },
  {
    step: 3,
    title: "Pickup or Delivery",
    description:
      "Choose convenient pickup at the farm or schedule home delivery",
    icon: Clock,
  },
];

const benefits = [
  {
    icon: Leaf,
    title: "Fresh & Local",
    description: "Products harvested at peak freshness from nearby farms",
  },
  {
    icon: Shield,
    title: "Verified Farms",
    description: "All farms are verified for quality and sustainable practices",
  },
  {
    icon: Award,
    title: "Support Local",
    description: "Your purchase directly supports local farming families",
  },
  {
    icon: Star,
    title: "Quality Assured",
    description: "Highest quality standards with satisfaction guarantee",
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Regular Customer",
    content:
      "The freshness is unbeatable! I love knowing exactly where my food comes from and supporting local farmers.",
    rating: 5,
  },
  {
    name: "Mike Chen",
    role: "Local Farmer",
    content:
      "This platform has transformed my business. Direct connection with customers means better prices for everyone.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Health Enthusiast",
    content:
      "Finally, a reliable source for organic produce. The quality and taste difference is remarkable!",
    rating: 5,
  },
];

// ============================================================================
// Loading Skeletons
// ============================================================================

function SearchBarSkeleton() {
  return (
    <div className="relative">
      <div className="h-14 bg-white rounded-lg shadow-lg border-2 border-gray-200 animate-pulse"></div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="text-center">
          <div className="h-12 w-32 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 w-24 bg-gray-200 rounded mx-auto animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

function FarmsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-sm border overflow-hidden"
        >
          <div className="h-48 bg-gray-200 animate-pulse"></div>
          <div className="p-6 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
