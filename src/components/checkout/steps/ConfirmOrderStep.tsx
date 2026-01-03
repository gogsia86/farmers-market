/**
 * ✅ CONFIRM ORDER STEP - Step 4 of Checkout
 * Divine order confirmation and review for agricultural commerce
 *
 * Features:
 * - Complete order summary with all details
 * - Editable sections (click to go back)
 * - Terms and conditions acceptance
 * - Marketing opt-in checkbox
 * - Order notes field
 * - Final pricing breakdown
 * - Place Order button (prominent)
 * - Agricultural consciousness summary
 * - Mobile-responsive design
 * - WCAG 2.1 AA accessibility
 *
 * @divine-pattern Holographic Component Architecture
 * @reference 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  Package,
  Truck,
  DollarSign,
  Edit,
  Leaf,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheckoutStepProps } from "../CheckoutWizard";

// ============================================================================
// TYPES
// ============================================================================

interface OrderSummaryItem {
  id: string;
  productName: string;
  farmName: string;
  quantity: number;
  unit: string;
  price: number;
  imageUrl?: string;
  organic?: boolean;
  seasonal?: boolean;
}

// ============================================================================
// CONFIRM ORDER STEP COMPONENT
// ============================================================================

export function ConfirmOrderStep({
  onNext,
  onBack,
  onUpdateData,
  checkoutData,
  isLoading,
}: CheckoutStepProps) {
  const [termsAccepted, setTermsAccepted] = useState(
    checkoutData.termsAccepted || false,
  );
  const [marketingOptIn, setMarketingOptIn] = useState(
    checkoutData.marketingOptIn || false,
  );
  const [orderNotes, setOrderNotes] = useState(checkoutData.orderNotes || "");

  // Handle terms acceptance
  const handleTermsChange = (checked: boolean) => {
    setTermsAccepted(checked);
    onUpdateData({ termsAccepted: checked });
  };

  // Handle marketing opt-in
  const handleMarketingChange = (checked: boolean) => {
    setMarketingOptIn(checked);
    onUpdateData({ marketingOptIn: checked });
  };

  // Handle order notes
  const handleOrderNotesChange = (notes: string) => {
    setOrderNotes(notes);
    onUpdateData({ orderNotes: notes });
  };

  const isValid = termsAccepted;

  // Calculate totals
  const subtotal = checkoutData.cartSummary.subtotal;
  const tax = checkoutData.cartSummary.tax;
  const deliveryFee = checkoutData.cartSummary.deliveryFee || 0;
  const total = subtotal + tax + deliveryFee;

  // Group items by farm
  interface FarmGroup {
    farmId: string;
    farmName: string;
    items: any[];
  }

  const items = checkoutData.cartSummary.items || [];
  const itemsByFarm = items.reduce(
    (acc, item: any) => {
      const farmId = item.farmId || "unknown";
      if (!acc[farmId]) {
        acc[farmId] = {
          farmId,
          farmName: item.farmName || "Unknown Farm",
          items: [],
        };
      }
      acc[farmId].items.push(item);
      return acc;
    },
    {} as Record<string, FarmGroup>,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review & Confirm Order
        </h2>
        <p className="text-gray-600">
          Please review all details before placing your order
        </p>
      </div>

      {/* Order Items Review */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Order Items</h3>
            <span className="text-sm text-gray-500">
              ({items.length} items)
            </span>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
          >
            <Edit className="w-4 h-4" />
            Edit Cart
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {(Object.values(itemsByFarm) as FarmGroup[]).map((farmGroup) => (
            <div key={farmGroup.farmId} className="p-4">
              {/* Farm Name */}
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">
                  {farmGroup.farmName}
                </span>
              </div>

              {/* Farm Items */}
              <div className="space-y-3">
                {farmGroup.items.map((item: any) => (
                  <div key={item.id} className="flex gap-3">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {item.productName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {item.organic && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 rounded-full px-2 py-0.5">
                            <Leaf className="w-3 h-3" />
                            Organic
                          </span>
                        )}
                        {item.seasonal && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full px-2 py-0.5">
                            <Calendar className="w-3 h-3" />
                            Seasonal
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {item.quantity} {item.unit} × ${item.price.toFixed(2)}
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <span className="font-medium text-gray-900">
                        ${(item.quantity * item.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery/Pickup Details */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {checkoutData.fulfillmentMethod === "PICKUP" ? (
              <Package className="w-5 h-5 text-green-600" />
            ) : (
              <Truck className="w-5 h-5 text-green-600" />
            )}
            <h3 className="font-semibold text-gray-900">
              {checkoutData.fulfillmentMethod === "PICKUP"
                ? "Pickup Details"
                : "Delivery Details"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>

        <div className="p-4">
          {checkoutData.fulfillmentMethod === "PICKUP" ? (
            <div className="text-sm text-gray-700">
              <p className="font-medium text-gray-900 mb-1">Farm Pickup</p>
              <p>
                You'll receive pickup instructions and address details after
                placing your order.
              </p>
            </div>
          ) : checkoutData.selectedAddress ? (
            <div className="text-sm text-gray-700">
              <p className="font-medium text-gray-900 mb-2">Deliver to:</p>
              <div className="space-y-1">
                <p>{checkoutData.selectedAddress.fullName}</p>
                <p>{checkoutData.selectedAddress.street}</p>
                <p>
                  {checkoutData.selectedAddress.city},{" "}
                  {checkoutData.selectedAddress.state}{" "}
                  {checkoutData.selectedAddress.zipCode}
                </p>
                {checkoutData.selectedAddress.phone && (
                  <p className="mt-2">
                    Phone: {checkoutData.selectedAddress.phone}
                  </p>
                )}
              </div>
              {checkoutData.deliveryInstructions && (
                <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Delivery Instructions:
                  </p>
                  <p className="text-xs text-gray-600">
                    {checkoutData.deliveryInstructions}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No address selected</p>
          )}
        </div>
      </div>

      {/* Payment Method */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {checkoutData.paymentMethod === "CASH" ? (
              <DollarSign className="w-5 h-5 text-green-600" />
            ) : (
              <CreditCard className="w-5 h-5 text-green-600" />
            )}
            <h3 className="font-semibold text-gray-900">Payment Method</h3>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>

        <div className="p-4">
          {checkoutData.paymentMethod === "CASH" ? (
            <div className="text-sm text-gray-700">
              <p className="font-medium text-gray-900 mb-1">
                Cash on{" "}
                {checkoutData.fulfillmentMethod === "PICKUP"
                  ? "Pickup"
                  : "Delivery"}
              </p>
              <p>
                Payment due when you{" "}
                {checkoutData.fulfillmentMethod === "PICKUP"
                  ? "pick up"
                  : "receive"}{" "}
                your order
              </p>
            </div>
          ) : checkoutData.paymentMethod === "CARD" ? (
            <div className="text-sm text-gray-700">
              <p className="font-medium text-gray-900 mb-1">
                Credit/Debit Card
              </p>
              <p>Your card will be charged after order confirmation</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">No payment method selected</p>
          )}
        </div>
      </div>

      {/* Order Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Order Notes (Optional)
        </label>
        <textarea
          value={orderNotes}
          onChange={(e) => handleOrderNotesChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Any special requests or notes for the farmer..."
          rows={3}
          maxLength={500}
        />
        <div className="text-xs text-gray-500 text-right mt-1">
          {orderNotes.length}/500 characters
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-3">
        <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (8%)</span>
          <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
        </div>

        {deliveryFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="font-medium text-gray-900">
              ${deliveryFee.toFixed(2)}
            </span>
          </div>
        )}

        <div className="border-t border-gray-300 pt-3">
          <div className="flex justify-between">
            <span className="text-base font-semibold text-gray-900">
              Total Amount
            </span>
            <span className="text-2xl font-bold text-green-600">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Agricultural Consciousness Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Leaf className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-green-900 mb-1">
              Supporting Local Agriculture
            </h4>
            <p className="text-sm text-green-800">
              Your order supports {Object.keys(itemsByFarm).length} local{" "}
              {Object.keys(itemsByFarm).length === 1 ? "farm" : "farms"} and
              promotes sustainable farming practices in your community.
            </p>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-3">
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => handleTermsChange(e.target.checked)}
              className="w-5 h-5 mt-0.5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              required
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">
                I accept the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="text-green-600 hover:text-green-700 underline"
                >
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="text-green-600 hover:text-green-700 underline"
                >
                  Privacy Policy
                </Link>{" "}
                *
              </span>
              <p className="text-xs text-gray-600 mt-1">
                By checking this box, you agree to our terms of service and
                understand our cancellation and refund policies.
              </p>
            </div>
          </label>
        </div>

        {/* Marketing Opt-in */}
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => handleMarketingChange(e.target.checked)}
              className="w-5 h-5 mt-0.5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">
                Keep me updated about new products and offers
              </span>
              <p className="text-xs text-gray-600 mt-1">
                Receive emails about seasonal products, special promotions, and
                farm updates. You can unsubscribe anytime.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Validation Message */}
      {!isValid && (
        <div
          className="rounded-lg bg-orange-50 border border-orange-200 p-4"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-orange-900 mb-1">
                Action Required
              </h3>
              <p className="text-sm text-orange-800">
                Please accept the Terms and Conditions to place your order.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message Preview */}
      {isValid && (
        <div
          className="rounded-lg bg-green-50 border border-green-200 p-4"
          role="status"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-green-900 mb-1">
                Ready to Place Order
              </h3>
              <p className="text-sm text-green-800">
                Click "Place Order" below to confirm your purchase. You'll
                receive an email confirmation with order details and tracking
                information.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Place Order Info */}
      <div className="text-center text-sm text-gray-600">
        <p>
          By placing this order, you'll receive a confirmation email with all
          order details.
        </p>
        <p className="mt-1">
          Need help?{" "}
          <Link
            href="/support"
            className="text-green-600 hover:text-green-700 underline"
          >
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
