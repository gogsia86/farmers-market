/**
 * 🎯 HOW IT WORKS PAGE
 * Explains how the platform works for customers and farmers
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works | Farmers Market",
  description: "Learn how to buy fresh produce from local farms or sell your farm products",
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            How It Works
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            Connect directly with local farmers to buy fresh, seasonal produce
          </p>
        </div>

        {/* For Customers Section */}
        <section className="mb-20">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <span className="text-3xl">🛒</span>
            </div>
            <h2 className="mb-2 text-3xl font-bold text-gray-900">For Customers</h2>
            <p className="text-lg text-gray-600">
              Fresh produce delivered from local farms to your door
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="relative rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-xl font-bold text-white">
                  1
                </div>
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Browse Local Farms
              </h3>
              <p className="text-gray-600">
                Discover farms in your area and explore their fresh, seasonal produce. Filter by organic, certifications, and more.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-xl font-bold text-white">
                  2
                </div>
                <span className="text-4xl">🛍️</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Add to Cart
              </h3>
              <p className="text-gray-600">
                Select products from multiple farms, choose quantities, and add them to your cart. See real-time availability and pricing.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-xl font-bold text-white">
                  3
                </div>
                <span className="text-4xl">💳</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Secure Checkout
              </h3>
              <p className="text-gray-600">
                Complete your order with secure payment processing. Choose delivery or pickup options based on farm preferences.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-xl font-bold text-white">
                  4
                </div>
                <span className="text-4xl">📦</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Receive Fresh Produce
              </h3>
              <p className="text-gray-600">
                Get your fresh produce delivered or pick it up from the farm. Track your orders and communicate directly with farmers.
              </p>
            </div>
          </div>

          {/* Customer CTA */}
          <div className="mt-8 text-center">
            <Link
              href="/marketplace"
              className="inline-block rounded-lg bg-green-700 px-8 py-3 font-semibold text-white transition-colors hover:bg-green-800"
            >
              Start Shopping
            </Link>
          </div>
        </section>

        {/* Divider */}
        <div className="mb-20 border-t border-gray-200"></div>

        {/* For Farmers Section */}
        <section className="mb-20">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <span className="text-3xl">🌾</span>
            </div>
            <h2 className="mb-2 text-3xl font-bold text-gray-900">For Farmers</h2>
            <p className="text-lg text-gray-600">
              Sell directly to customers and grow your farm business
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="relative rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-xl font-bold text-white">
                  1
                </div>
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Create Your Farm Profile
              </h3>
              <p className="text-gray-600">
                Register your farm with photos, story, certifications, and location. Showcase what makes your farm unique.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-xl font-bold text-white">
                  2
                </div>
                <span className="text-4xl">📦</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                List Your Products
              </h3>
              <p className="text-gray-600">
                Add your fresh produce with photos, descriptions, pricing, and availability. Update inventory in real-time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-xl font-bold text-white">
                  3
                </div>
                <span className="text-4xl">🔔</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Receive Orders
              </h3>
              <p className="text-gray-600">
                Get instant notifications when customers place orders. Manage orders through your farmer dashboard.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-xl font-bold text-white">
                  4
                </div>
                <span className="text-4xl">💰</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Get Paid Directly
              </h3>
              <p className="text-gray-600">
                Receive payments directly to your bank account. Track sales, revenue, and analytics from your dashboard.
              </p>
            </div>
          </div>

          {/* Farmer CTA */}
          <div className="mt-8 text-center">
            <Link
              href="/register-farm"
              className="inline-block rounded-lg bg-green-700 px-8 py-3 font-semibold text-white transition-colors hover:bg-green-800"
            >
              Register Your Farm
            </Link>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-20">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Why Choose Our Platform?
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Benefit 1 */}
            <div className="rounded-lg bg-white p-8 text-center shadow-md">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <span className="text-3xl">🌱</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Farm-to-Table Direct
              </h3>
              <p className="text-gray-600">
                Skip the middleman and connect directly with local farmers. Fresher produce, better prices, and support local agriculture.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="rounded-lg bg-white p-8 text-center shadow-md">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Verified Farms
              </h3>
              <p className="text-gray-600">
                All farms are verified and many hold organic or other certifications. Shop with confidence knowing where your food comes from.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="rounded-lg bg-white p-8 text-center shadow-md">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <span className="text-3xl">🌍</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Sustainable Impact
              </h3>
              <p className="text-gray-600">
                Reduce carbon footprint with local sourcing, support sustainable farming practices, and help build resilient local food systems.
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-20 rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            Platform Features
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start">
              <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <svg className="h-5 w-5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="mb-1 font-semibold text-gray-900">Real-Time Inventory</h4>
                <p className="text-sm text-gray-600">See what's available right now</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <svg className="h-5 w-5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="mb-1 font-semibold text-gray-900">Multiple Payment Options</h4>
                <p className="text-sm text-gray-600">Credit cards, digital wallets supported</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <svg className="h-5 w-5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="mb-1 font-semibold text-gray-900">Order Tracking</h4>
                <p className="text-sm text-gray-600">Track your order from farm to door</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <svg className="h-5 w-5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="mb-1 font-semibold text-gray-900">Direct Messaging</h4>
                <p className="text-sm text-gray-600">Chat with farmers directly</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <svg className="h-5 w-5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="mb-1 font-semibold text-gray-900">Reviews & Ratings</h4>
                <p className="text-sm text-gray-600">Share and read customer experiences</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <svg className="h-5 w-5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="mb-1 font-semibold text-gray-900">Mobile Friendly</h4>
                <p className="text-sm text-gray-600">Shop on any device, anywhere</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="mb-12 text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Still Have Questions?
          </h2>
          <p className="mb-6 text-gray-600">
            Check out our FAQ or contact our support team
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/faq"
              className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-800"
            >
              View FAQ
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border-2 border-green-700 px-6 py-3 font-semibold text-green-700 transition-colors hover:bg-green-50"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
