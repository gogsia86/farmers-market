/**
 * About Us Page
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Farmers Market",
  description:
    "Learn about our mission to connect local farmers with customers",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-4xl font-bold text-gray-900">About Us</h1>

          <div className="prose prose-lg">
            <p className="text-xl text-gray-600 mb-8">
              Connecting local farmers with customers for fresh, sustainable
              produce.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-700 mb-6">
              We believe in supporting local agriculture and providing
              communities with access to fresh, organic produce directly from
              farms. Our platform makes it easy for farmers to reach customers
              and for customers to discover amazing local products.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Why Choose Us?
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Direct from farm to table - no middlemen</li>
              <li>Support local farmers and sustainable agriculture</li>
              <li>Fresh, organic produce delivered to your door</li>
              <li>Know where your food comes from</li>
              <li>Build community connections</li>
            </ul>

            <div className="mt-12 rounded-lg bg-green-50 p-8 text-center">
              <h3 className="mb-4 text-2xl font-semibold text-green-900">
                Ready to Get Started?
              </h3>
              <p className="mb-6 text-gray-700">
                Browse our selection of fresh local produce
              </p>
              <Link
                href="/products"
                className="inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
              >
                Shop Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
