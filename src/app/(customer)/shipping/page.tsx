/**
 * 🚚 SHIPPING INFORMATION PAGE
 * Shipping policies, delivery options, and FAQ
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping Information | Farmers Market Platform",
  description: "Learn about our shipping policies, delivery options, and how we ensure fresh produce arrives at your door",
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <span className="text-3xl">🚚</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Shipping & Delivery
          </h1>
          <p className="text-lg text-gray-600">
            Fresh from the farm to your doorstep
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          {/* Delivery Options */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-2xl">📦</span>
              Delivery Options
            </h2>

            <div className="space-y-4">
              {/* Farm Pickup */}
              <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🌾 Farm Pickup (Free)
                </h3>
                <p className="text-gray-700 mb-2">
                  Pick up your order directly from the farm at your convenience.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Available within 24-48 hours of order</li>
                  <li>Flexible pickup times (coordinated with farmer)</li>
                  <li>Meet the farmer and see the farm</li>
                  <li>Perfect for local customers</li>
                </ul>
              </div>

              {/* Local Delivery */}
              <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🚗 Local Delivery ($5-15)
                </h3>
                <p className="text-gray-700 mb-2">
                  Same-day or next-day delivery within 20 miles of the farm.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Delivery within 20 miles of farm location</li>
                  <li>Cost based on distance from farm</li>
                  <li>Same-day delivery for orders before 12 PM</li>
                  <li>Contactless delivery available</li>
                </ul>
              </div>

              {/* Standard Shipping */}
              <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  📮 Standard Shipping ($10-25)
                </h3>
                <p className="text-gray-700 mb-2">
                  Regional shipping for fresh produce with cooling methods.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>3-5 business day delivery</li>
                  <li>Insulated packaging with ice packs</li>
                  <li>Available to most US states</li>
                  <li>Tracking number provided</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Freshness Guarantee */}
          <section className="mb-10 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-2xl">✨</span>
              Freshness Guarantee
            </h2>
            <p className="text-gray-700 mb-4">
              We take pride in delivering the freshest produce possible. All perishable items are:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Harvested Fresh</h4>
                  <p className="text-sm text-gray-600">Picked within 24-48 hours of shipping</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Temperature Controlled</h4>
                  <p className="text-sm text-gray-600">Insulated packaging with ice packs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Quality Checked</h4>
                  <p className="text-sm text-gray-600">Inspected before packaging</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Satisfaction Guaranteed</h4>
                  <p className="text-sm text-gray-600">Full refund if not satisfied</p>
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Policies */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-2xl">📋</span>
              Shipping Policies
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Processing Time
                </h3>
                <p className="text-gray-700">
                  Orders are typically processed within 24-48 hours. During peak seasons (harvest time),
                  processing may take up to 72 hours. You'll receive a confirmation email when your order
                  is ready for pickup or has been shipped.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delivery Areas
                </h3>
                <p className="text-gray-700 mb-2">
                  We currently ship to most states in the continental United States. Shipping availability
                  depends on the distance from the farm and the type of products ordered.
                </p>
                <p className="text-sm text-gray-600 italic">
                  Note: Some perishable items cannot be shipped to extremely remote areas or during extreme
                  weather conditions to ensure quality.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Shipping Costs
                </h3>
                <p className="text-gray-700 mb-2">
                  Shipping costs are calculated based on:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Distance from farm to delivery address</li>
                  <li>Weight and size of the order</li>
                  <li>Delivery method selected</li>
                  <li>Special handling requirements (refrigeration, fragile items)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Package Tracking
                </h3>
                <p className="text-gray-700">
                  For shipped orders, you'll receive a tracking number via email once your order has been
                  dispatched. You can track your package status in your account dashboard or through the
                  carrier's website.
                </p>
              </div>
            </div>
          </section>

          {/* Weather & Seasonal Considerations */}
          <section className="mb-10 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-2xl">🌤️</span>
              Weather & Seasonal Considerations
            </h2>
            <p className="text-gray-700 mb-4">
              Fresh produce is sensitive to extreme temperatures. During very hot summers or cold winters,
              we may:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Temporarily suspend shipping to certain regions</li>
              <li>Require signature upon delivery to minimize time outside</li>
              <li>Use expedited shipping methods automatically</li>
              <li>Recommend farm pickup or local delivery as alternatives</li>
            </ul>
            <p className="text-sm text-gray-600 mt-4 italic">
              We'll always notify you if weather conditions may affect your delivery.
            </p>
          </section>

          {/* FAQs */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-2xl">❓</span>
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What if I'm not home when my order arrives?
                </h3>
                <p className="text-gray-700">
                  For local deliveries, we'll leave your order in a safe location or coordinate with you
                  for a redelivery. For shipped orders, the carrier will typically leave a notice and
                  attempt delivery again or hold it at a local facility for pickup.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What if my produce arrives damaged or spoiled?
                </h3>
                <p className="text-gray-700">
                  We stand behind our freshness guarantee. Contact us within 24 hours of delivery with
                  photos of the damaged items, and we'll issue a full refund or send a replacement at no
                  additional cost.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I change my delivery address after placing an order?
                </h3>
                <p className="text-gray-700">
                  Yes, but only before the order has been processed or shipped. Contact the farm directly
                  or email us at <a href="mailto:support@farmersmarket.com" className="text-green-600 hover:text-green-700 font-semibold">support@farmersmarket.com</a> as soon as possible.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Do you ship internationally?
                </h3>
                <p className="text-gray-700">
                  Currently, we only ship within the continental United States due to customs regulations
                  and the perishable nature of our products. We're working on expanding to Canada in the future.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I schedule a specific delivery date?
                </h3>
                <p className="text-gray-700">
                  For farm pickups, yes! You can coordinate directly with the farmer. For shipped orders,
                  we can provide an estimated delivery window but cannot guarantee specific dates due to
                  carrier schedules.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-3">
              Have More Questions?
            </h2>
            <p className="mb-4 opacity-90">
              Our support team is here to help with any shipping or delivery questions.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                <span>📧</span>
                Contact Support
              </Link>
              <Link
                href="/faq"
                className="bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors inline-flex items-center gap-2"
              >
                <span>❓</span>
                View All FAQs
              </Link>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-2"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
