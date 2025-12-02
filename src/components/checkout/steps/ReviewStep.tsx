"use client";

/**
 * 📋 REVIEW STEP - Checkout Flow Step 4
 * Final order review before placing the order
 *
 * Features:
 * - Complete order summary
 * - Cart items review
 * - Shipping address confirmation
 * - Payment method confirmation
 * - Final price breakdown
 * - Order placement action
 * - Agricultural consciousness UI
 */

import { useState } from "react";
import {
  MapPin,
  CreditCard,
  Package,
  Leaf,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { useCheckoutStore } from "@/stores/checkoutStore";

// ============================================================================
// REVIEW STEP COMPONENT
// ============================================================================

export function ReviewStep() {
  const [orderError, _setOrderError] = useState<string | null>(null);

  // Store state
  const shippingAddress = useCheckoutStore((state) => state.shippingAddress);
  const paymentMethod = useCheckoutStore((state) => state.paymentMethod);
  const fulfillmentMethod = useCheckoutStore(
    (state) => state.fulfillmentMethod,
  );
  const orderPreview = useCheckoutStore((state) => state.orderPreview);
  const specialInstructions = useCheckoutStore(
    (state) => state.specialInstructions,
  );
  const deliveryInstructions = useCheckoutStore(
    (state) => state.deliveryInstructions,
  );

  // Note: Order placement will be handled by the checkout flow navigation
  // This component is for review only

  if (!orderPreview) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Error */}
      {orderError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Order Failed</h4>
              <p className="text-sm text-red-800">{orderError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Shipping/Fulfillment Information */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <MapPin className="h-5 w-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {fulfillmentMethod === "DELIVERY"
              ? "Shipping Address"
              : "Pickup Information"}
          </h3>
        </div>

        {fulfillmentMethod === "DELIVERY" && shippingAddress ? (
          <div className="text-gray-700">
            <p className="font-medium">{shippingAddress.street}</p>
            {shippingAddress.street2 && <p>{shippingAddress.street2}</p>}
            <p>
              {shippingAddress.city}, {shippingAddress.state}{" "}
              {shippingAddress.zipCode}
            </p>
            {deliveryInstructions && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Delivery Instructions:</span>{" "}
                  {deliveryInstructions}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-700">
            <p className="font-medium mb-2">Farm Pickup</p>
            <p className="text-sm text-gray-600">
              You'll pick up your order directly from each farm. Pickup
              locations and times will be confirmed after your order is placed.
            </p>
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Payment Method
          </h3>
        </div>

        {paymentMethod && (
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {paymentMethod.brand} •••• {paymentMethod.last4}
              </p>
              <p className="text-sm text-gray-600">
                Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
          </div>
        </div>

        <div className="p-6">
          {orderPreview.items && orderPreview.items.length > 0 ? (
            <div className="space-y-4">
              {orderPreview.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-0"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {item.productName}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Leaf className="h-3 w-3 text-green-600" />
                      <span>{item.farmName}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <p>No items available</p>
            </div>
          )}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Order Summary
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal ({orderPreview.itemCount} items)</span>
            <span className="font-medium">
              ${orderPreview.subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-gray-700">
            <span>
              {fulfillmentMethod === "DELIVERY" ? "Delivery Fee" : "Pickup Fee"}
            </span>
            <span className="font-medium">
              {orderPreview.deliveryFee === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                `$${orderPreview.deliveryFee.toFixed(2)}`
              )}
            </span>
          </div>

          <div className="flex justify-between text-gray-700">
            <span>Tax</span>
            <span className="font-medium">${orderPreview.tax.toFixed(2)}</span>
          </div>

          {orderPreview.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span className="font-medium">
                -${orderPreview.discount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                ${orderPreview.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Special Instructions */}
      {specialInstructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">
            Special Instructions
          </h4>
          <p className="text-sm text-blue-800">{specialInstructions}</p>
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <input type="checkbox" id="terms" className="mt-1" defaultChecked />
          <label htmlFor="terms" className="text-sm text-gray-700">
            I agree to the{" "}
            <a
              href="/terms"
              className="text-amber-600 hover:text-amber-700 underline"
            >
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="text-amber-600 hover:text-amber-700 underline"
            >
              Privacy Policy
            </a>
            . I understand that my payment will be processed upon order
            confirmation.
          </label>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-6 py-6 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Leaf className="h-4 w-4 text-green-600" />
          </div>
          <span>Support Local Farms</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <span>Fresh Products</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-purple-600" />
          </div>
          <span>Secure Payment</span>
        </div>
      </div>
    </div>
  );
}
