"use client";

/**
 * ✅ CONFIRMATION STEP - Checkout Flow Step 5
 * Order confirmation and success page
 *
 * Features:
 * - Order confirmation display
 * - Order number and details
 * - Next steps information
 * - Order tracking link
 * - Receipt download option
 * - Agricultural consciousness UI
 */

import { cartLogger } from "@/lib/utils/logger";
import { useCheckoutStore } from "@/stores/checkoutStore";
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Download,
  Leaf,
  Mail,
  Package,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// ============================================================================
// CONFIRMATION STEP COMPONENT
// ============================================================================

export function ConfirmationStep() {
  const router = useRouter();

  // Store state
  const orderId = useCheckoutStore((state) => state.orderId);
  const orderNumber = useCheckoutStore((state) => state.orderNumber);
  const orderPreview = useCheckoutStore((state) => state.orderPreview);
  const shippingAddress = useCheckoutStore((state) => state.shippingAddress);
  const fulfillmentMethod = useCheckoutStore(
    (state) => state.fulfillmentMethod,
  );
  const resetCheckout = useCheckoutStore((state) => state.resetCheckout);

  // Clear cart on confirmation (do this once)
  useEffect(() => {
    const clearCart = async () => {
      try {
        await fetch("/api/cart", { method: "DELETE" });
      } catch (error) {
        cartLogger.error(
          "Failed to clear cart",
          error instanceof Error ? error : new Error(String(error)),
          { orderId },
        );
      }
    };

    if (orderId) {
      clearCart();
    }
  }, [orderId]);

  // Handle starting new order
  const handleNewOrder = () => {
    resetCheckout();
    router.push("/marketplace/products");
  };

  if (!orderId || !orderNumber) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Order Found
        </h3>
        <p className="text-gray-600 mb-6">
          We couldn't find your order information.
        </p>
        <Link
          href="/marketplace/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg transition-all"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-lg text-gray-600">
          Thank you for supporting local farmers
        </p>
      </div>

      {/* Order Number */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Order Number</p>
          <p className="text-3xl font-bold text-gray-900 mb-3">{orderNumber}</p>
          <p className="text-sm text-gray-600">
            A confirmation email has been sent to your email address
          </p>
        </div>
      </div>

      {/* Order Summary */}
      {orderPreview && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Order Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Items</span>
              <span className="font-medium">{orderPreview.itemCount}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Farms</span>
              <span className="font-medium">{orderPreview.farmCount}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Total Amount</span>
              <span className="font-semibold text-lg">
                ${orderPreview.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          What's Next?
        </h2>
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Order Confirmation
              </h3>
              <p className="text-sm text-gray-600">
                You'll receive an email confirmation with your order details and
                tracking information.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Leaf className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Farm Preparation
              </h3>
              <p className="text-sm text-gray-600">
                The farms will prepare your fresh products and get them ready
                for {fulfillmentMethod === "DELIVERY" ? "delivery" : "pickup"}.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              {fulfillmentMethod === "DELIVERY" ? (
                <Package className="h-5 w-5 text-purple-600" />
              ) : (
                <Calendar className="h-5 w-5 text-purple-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {fulfillmentMethod === "DELIVERY" ? "Delivery" : "Pickup"}
              </h3>
              <p className="text-sm text-gray-600">
                {fulfillmentMethod === "DELIVERY"
                  ? "Your order will be delivered to your specified address. Track your delivery in real-time."
                  : "Pick up your order at the designated farm location. You'll receive pickup instructions via email."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery/Pickup Info */}
      {fulfillmentMethod === "DELIVERY" && shippingAddress && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Delivery Address
          </h2>
          <div className="text-gray-700">
            <p className="font-medium">{shippingAddress.street}</p>
            {shippingAddress.street2 && <p>{shippingAddress.street2}</p>}
            <p>
              {shippingAddress.city}, {shippingAddress.state}{" "}
              {shippingAddress.zipCode}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Link
          href={`/orders/${orderId}`}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <Package className="h-5 w-5" />
          View Order Details
          <ArrowRight className="h-4 w-4" />
        </Link>

        <button
          onClick={handleNewOrder}
          className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-amber-500 text-amber-700 hover:bg-amber-50 font-semibold rounded-lg transition-all"
        >
          <Leaf className="h-5 w-5" />
          Continue Shopping
        </button>
      </div>

      {/* Receipt Download */}
      <div className="text-center">
        <button className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-amber-600 transition-colors">
          <Download className="h-4 w-4" />
          Download Receipt
        </button>
      </div>

      {/* Support Message */}
      <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Leaf className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-900 mb-2">
              Thank You for Supporting Local Agriculture!
            </h3>
            <p className="text-sm text-green-800">
              Your purchase directly supports local farmers in your community.
              By choosing farm-fresh products, you're helping to sustain local
              agriculture and reduce environmental impact.
            </p>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          Need help?{" "}
          <Link
            href="/support"
            className="text-amber-600 hover:text-amber-700 underline"
          >
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
