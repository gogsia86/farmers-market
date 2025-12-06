/**
 * 🛒 CHECKOUT PAGE - Divine Agricultural Commerce Flow
 * Multi-step checkout with address, payment, and order review
 *
 * Features:
 * - Multi-step wizard (Cart → Address → Payment → Review → Confirmation)
 * - Address selection and validation
 * - Payment method integration
 * - Order preview with real-time calculations
 * - Agricultural consciousness UI patterns
 * - Mobile-responsive design
 */

import { Suspense } from "react";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";

export const metadata = {
  title: "Checkout | Farmers Market Platform",
  description: "Complete your order from local farmers",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<CheckoutSkeleton />}>
          <CheckoutFlow />
        </Suspense>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for checkout flow
 */
function CheckoutSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Progress bar skeleton */}
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full animate-pulse" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
