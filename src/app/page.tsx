/**
 * FARMERS MARKET HOME PAGE - DIVINE REDESIGN
 *
 * Comprehensive landing page featuring:
 * - Hero section with search
 * - Featured products
 * - Featured farms
 * - Categories grid
 * - How it works section
 * - Testimonials
 * - Stats counter
 * - CTA sections
 */

import Header from "@/components/layout/Header";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  MapPin,
  Star,
  Leaf,
  Clock,
  Shield,
  Award,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero Section with Search */}
        <section className="relative bg-gradient-to-br from-agricultural-50 via-white to-green-50 py-20 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] bg-repeat"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Hero Content */}
              <div className="mb-8">
                <span className="inline-flex items-center gap-2 bg-agricultural-100 text-agricultural-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Leaf className="h-4 w-4" />
                  Fresh, Local, Sustainable
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
                  Farm Fresh to{" "}
                  <span className="text-agricultural-600">Your Door</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-8">
                  Connect directly with local farmers and discover the freshest
                  organic produce in your area
                </p>
              </div>

              {/* Hero Search Bar */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for fresh tomatoes, local honey, organic eggs..."
                    className="w-full px-6 py-5 pr-32 rounded-full border-2 border-agricultural-200 focus:border-agricultural-500 focus:outline-none text-lg shadow-lg"
                  />
                  <Link
                    href="/search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-agricultural-600 hover:bg-agricultural-700 text-white px-8 py-3 rounded-full font-semibold transition-colors flex items-center gap-2"
                  >
                    <Search className="h-5 w-5" />
                    Search
                  </Link>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="text-sm text-gray-600">Popular:</span>
                  {["Tomatoes", "Organic Eggs", "Fresh Milk", "Honey"].map(
                    (term) => (
                      <Link
                        key={term}
                        href={`/search?q=${term.toLowerCase()}`}
                        className="text-sm text-agricultural-600 hover:text-agricultural-700 hover:underline"
                      >
                        {term}
                      </Link>
                    )
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                {[
                  { label: "Local Farms", value: "500+" },
                  { label: "Fresh Products", value: "2,000+" },
                  { label: "Happy Customers", value: "10,000+" },
                  { label: "Cities Covered", value: "50+" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl md:text-4xl font-bold text-agricultural-600">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Shop by Category
              </h2>
              <p className="text-xl text-gray-600">
                Explore our wide range of fresh, local products
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { name: "Vegetables", icon: "🥕", color: "green" },
                { name: "Fruits", icon: "🍎", color: "red" },
                { name: "Dairy", icon: "🥛", color: "blue" },
                { name: "Meat", icon: "🥩", color: "orange" },
                { name: "Honey", icon: "🍯", color: "yellow" },
                { name: "Bakery", icon: "🍞", color: "amber" },
              ].map((category) => (
                <Link
                  key={category.name}
                  href={`/products?category=${category.name.toLowerCase()}`}
                  className="group bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-agricultural-200"
                >
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">
                  Featured Products
                </h2>
                <p className="text-xl text-gray-600">
                  Handpicked fresh produce from local farms
                </p>
              </div>
              <Link
                href="/products"
                className="hidden md:flex items-center gap-2 text-agricultural-600 hover:text-agricultural-700 font-semibold"
              >
                View All
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: "Organic Tomatoes",
                  farm: "Sunny Valley Farm",
                  price: "$5.99/lb",
                  rating: 4.8,
                  image: "🍅",
                },
                {
                  name: "Farm Fresh Eggs",
                  farm: "Happy Hen Farm",
                  price: "$6.99/dozen",
                  rating: 4.9,
                  image: "🥚",
                },
                {
                  name: "Local Honey",
                  farm: "Bee Happy Apiary",
                  price: "$12.99/jar",
                  rating: 5.0,
                  image: "🍯",
                },
                {
                  name: "Organic Carrots",
                  farm: "Green Earth Farm",
                  price: "$3.99/lb",
                  rating: 4.7,
                  image: "🥕",
                },
              ].map((product) => (
                <div
                  key={product.name}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100"
                >
                  <div className="bg-gradient-to-br from-agricultural-50 to-green-50 p-12 flex items-center justify-center">
                    <div className="text-7xl group-hover:scale-110 transition-transform">
                      {product.image}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {product.rating}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{product.farm}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-agricultural-600">
                        {product.price}
                      </span>
                      <button className="bg-agricultural-600 hover:bg-agricultural-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gradient-to-br from-agricultural-50 to-green-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600">
                From farm to table in 3 simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: "1",
                  title: "Browse & Select",
                  description:
                    "Explore fresh products from local farms in your area",
                  icon: Search,
                },
                {
                  step: "2",
                  title: "Order Online",
                  description:
                    "Add to cart and checkout securely with multiple payment options",
                  icon: ShoppingBag,
                },
                {
                  step: "3",
                  title: "Get Delivered",
                  description:
                    "Receive farm-fresh products at your doorstep within 24 hours",
                  icon: MapPin,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-agricultural-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                      {item.step}
                    </div>
                    <div className="bg-agricultural-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                      <Icon className="h-8 w-8 text-agricultural-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose Farmers Market?
              </h2>
              <p className="text-xl text-gray-600">
                Your trusted partner for fresh, local produce
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Leaf,
                  title: "100% Organic",
                  description: "Certified organic products from trusted farms",
                },
                {
                  icon: Clock,
                  title: "24hr Delivery",
                  description: "Fresh products delivered to your door daily",
                },
                {
                  icon: Shield,
                  title: "Quality Guaranteed",
                  description: "Money-back guarantee on all products",
                },
                {
                  icon: Award,
                  title: "Award Winning",
                  description: "Recognized for excellence in local farming",
                },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="bg-white rounded-2xl p-8 text-center hover:shadow-lg transition-shadow"
                  >
                    <div className="bg-agricultural-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="h-8 w-8 text-agricultural-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What Our Customers Say
              </h2>
              <p className="text-xl text-gray-600">
                Real stories from real customers
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Home Chef",
                  content:
                    "The freshest vegetables I've ever had! Knowing exactly where my food comes from makes all the difference.",
                  rating: 5,
                },
                {
                  name: "Michael Chen",
                  role: "Restaurant Owner",
                  content:
                    "We've partnered with local farms through this platform and our customers love the quality and freshness!",
                  rating: 5,
                },
                {
                  name: "Emily Rodriguez",
                  role: "Busy Mom",
                  content:
                    "Convenient, fresh, and supports local farmers. What's not to love? My family is eating healthier than ever!",
                  rating: 5,
                },
              ].map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-agricultural-100 rounded-full flex items-center justify-center text-xl font-bold text-agricultural-600">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-agricultural-600 to-green-600">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Eat Fresh & Support Local?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Join thousands of customers who choose fresh, local, and
                sustainable
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="bg-white text-agricultural-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/products"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Browse Products
                  <ShoppingBag className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl">🌾</span>
                  <span className="text-xl font-bold">Farmers Market</span>
                </div>
                <p className="text-gray-400">
                  Connecting local farmers with conscious consumers for a
                  sustainable future.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-4">Shop</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/products" className="hover:text-white">
                      All Products
                    </Link>
                  </li>
                  <li>
                    <Link href="/farms" className="hover:text-white">
                      Local Farms
                    </Link>
                  </li>
                  <li>
                    <Link href="/categories" className="hover:text-white">
                      Categories
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/help" className="hover:text-white">
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-white">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="hover:text-white">
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/about" className="hover:text-white">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/careers" className="hover:text-white">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="hover:text-white">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Farmers Market. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
