/**
 * 🎉 ORDER CONFIRMATION PAGE - Divine Success Experience
 * Displays order confirmation with divine agricultural consciousness
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 10_AGRICULTURAL_FEATURE_PATTERNS
 */

import { OrderConfirmationTracking } from "@/components/orders/OrderConfirmationTracking";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { formatCurrency } from "@/lib/utils/currency";
import {
  Calendar,
  Check,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Order Confirmation | Farmers Market Platform",
  description: "Your order has been confirmed",
};

// Force dynamic rendering - don't pre-render at build time
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/orders");
  }

  // Await params in Next.js 15 (params is now a Promise)
  const { orderId } = await params;

  // Fetch order with relationships
  const order = await database.order.findFirst({
    where: {
      id: orderId,
      customerId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
      },
      farm: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          city: true,
          state: true,
        },
      },
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Parse shipping address
  const shippingAddress = order.shippingAddress as any;

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      {/* Analytics Tracking */}
      <OrderConfirmationTracking
        orderId={order.id}
        orderNumber={order.orderNumber}
        totalValue={Number(order.total)}
        tax={Number(order.tax || 0)}
        shipping={Number(order.deliveryFee || 0)}
        items={order.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          price: Number(item.unitPrice),
          quantity: Number(item.quantity),
        }))}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Order Confirmed! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for supporting local agriculture
          </p>
        </div>

        {/* Order Details Card */}
        <div className="mb-6 overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Order #{order.orderNumber}
                </h2>
                <p className="text-sm text-gray-500">
                  Placed on{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Order Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(Number(order.total))}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="px-6 py-6">
            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <Package className="mr-2 h-5 w-5" />
              Order Items
            </h3>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0"
                >
                  <div className="flex items-center space-x-4">
                    {item.product.images[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {item.productName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Quantity: {Number(item.quantity)} {item.unit}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(Number(item.unitPrice))} per {item.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(Number(item.subtotal))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="mt-6 space-y-2 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(Number(order.subtotal))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(Number(order.deliveryFee))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platform Fee</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(Number(order.platformFee))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(Number(order.tax))}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-base">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(Number(order.total))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Farm Information */}
        <div className="mb-6 overflow-hidden rounded-lg bg-white shadow">
          <div className="px-6 py-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              From {order.farm.name}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">
                    {order.farm.city}, {order.farm.state}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-sm text-gray-600">{order.farm.phone}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">{order.farm.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="mb-6 overflow-hidden rounded-lg bg-white shadow">
          <div className="px-6 py-6">
            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <Truck className="mr-2 h-5 w-5" />
              Delivery Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Delivery Address
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {shippingAddress?.fullName}
                </p>
                <p className="text-sm text-gray-600">
                  {shippingAddress?.street}
                </p>
                {shippingAddress?.street2 && (
                  <p className="text-sm text-gray-600">
                    {shippingAddress.street2}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  {shippingAddress?.city}, {shippingAddress?.state}{" "}
                  {shippingAddress?.zipCode}
                </p>
                <p className="text-sm text-gray-600">
                  {shippingAddress?.phone}
                </p>
              </div>

              {order.scheduledDate && (
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Scheduled Delivery
                  </p>
                  <p className="mt-1 flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    {new Date(order.scheduledDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {order.scheduledTimeSlot && ` - ${order.scheduledTimeSlot}`}
                  </p>
                </div>
              )}

              {order.specialInstructions && (
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Delivery Instructions
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {order.specialInstructions}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div className="mb-6 overflow-hidden rounded-lg bg-blue-50 shadow">
          <div className="px-6 py-6">
            <h3 className="mb-2 text-lg font-semibold text-blue-900">
              What's Next?
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>✅ Your order has been received and is being processed</p>
              <p>📧 You'll receive a confirmation email shortly</p>
              <p>🚜 The farm will prepare your order with care</p>
              <p>📦 You'll be notified when your order is ready for delivery</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/orders"
            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-3 text-base font-medium text-white shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            View All Orders
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-medium text-gray-700 shadow hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Support Information */}
        <div className="mt-8 rounded-lg bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-600">
            Need help with your order?{" "}
            <Link
              href="/support"
              className="font-medium text-green-600 hover:text-green-700"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
