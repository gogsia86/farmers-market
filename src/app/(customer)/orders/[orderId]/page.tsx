/**
 * 📦 ORDER DETAILS PAGE - Complete Order Information & Tracking
 * Displays comprehensive order details with status tracking and timeline
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 10_AGRICULTURAL_FEATURE_PATTERNS
 */

import { InvoiceDownloadButton } from "@/components/orders/InvoiceDownloadButton";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/currency";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Truck,
  XCircle,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Order Details | Farmers Market Platform",
  description: "View your order details and tracking information",
};

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    orderId: string;
  }>;
}

const ORDER_STATUS_STEPS = [
  { key: "PENDING", label: "Order Placed", icon: Package },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { key: "PREPARING", label: "Preparing", icon: Clock },
  { key: "READY", label: "Ready", icon: CheckCircle2 },
  { key: "FULFILLED", label: "Fulfilled", icon: Truck },
  { key: "COMPLETED", label: "Completed", icon: Check },
];

export default async function OrderDetailsPage({ params }: PageProps) {
  const session = await auth();

  // Await params in Next.js 15 (params is now a Promise)
  const { orderId } = await params;

  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/orders/${orderId}`);
  }

  // Fetch order with all relationships
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
              tax: true,
              slug: true,
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
          address: true,
          city: true,
          state: true,
          zipCode: true,
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

  // Calculate status progress
  const currentStatusIndex = ORDER_STATUS_STEPS.findIndex(
    (step) => step.key === order.status,
  );
  const isCancelled = order.status === "CANCELLED";
  const isCompleted = order.status === "COMPLETED";

  // Determine estimated delivery
  const estimatedDelivery = order.scheduledDate
    ? new Date(order.scheduledDate)
    : new Date(new Date(order.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/orders"
            className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Orders
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex gap-3">
              <InvoiceDownloadButton
                orderId={order.id}
                orderNumber={order.orderNumber}
                variant="outline"
                size="sm"
              />
              <Link
                href={`/messages?farmId=${order.farm.id}`}
                className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Farm
              </Link>
            </div>
          </div>
        </div>

        {/* Status Alert for Cancelled */}
        {isCancelled && (
          <div className="mb-6 rounded-lg p-4 bg-red-50 border border-red-200">
            <div className="flex items-start">
              <XCircle className="h-5 w-5 mt-0.5 mr-3 text-red-600" />
              <div>
                <h3 className="text-sm font-medium text-red-900">
                  Order Cancelled
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  This order has been cancelled. If you have any questions,
                  please contact the farm.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Timeline */}
            {!isCancelled && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-6 text-lg font-semibold text-gray-900">
                  Order Status
                </h2>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-5 top-8 h-[calc(100%-4rem)] w-0.5 bg-gray-200" />
                  <div
                    className="absolute left-5 top-8 w-0.5 bg-green-600 transition-all duration-500"
                    style={{
                      height: `${(currentStatusIndex / (ORDER_STATUS_STEPS.length - 1)) * 100}%`,
                    }}
                  />

                  {/* Steps */}
                  <div className="space-y-8">
                    {ORDER_STATUS_STEPS.map((step: any, index: any) => {
                      const isStepCompleted = index < currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;
                      const Icon = step.icon;

                      return (
                        <div
                          key={step.key}
                          className="relative flex items-start"
                        >
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white transition-all",
                              isCompleted
                                ? "border-green-600 bg-green-50"
                                : "border-gray-300",
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-5 w-5",
                                isCompleted
                                  ? "text-green-600"
                                  : "text-gray-400",
                              )}
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <p
                              className={cn(
                                "text-sm font-medium",
                                isStepCompleted
                                  ? "text-gray-900"
                                  : "text-gray-500",
                              )}
                            >
                              {step.label}
                            </p>
                            {isCurrent && (
                              <p className="mt-1 text-xs text-green-600 font-medium">
                                Current Status
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Estimated Delivery */}
                {order.status !== "COMPLETED" && (
                  <div className="mt-6 rounded-lg bg-green-50 p-4">
                    <div className="flex items-start">
                      <Calendar className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900">
                          Estimated Delivery
                        </p>
                        <p className="mt-1 text-sm text-green-700">
                          {estimatedDelivery.toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                          {order.scheduledTimeSlot &&
                            ` • ${order.scheduledTimeSlot}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Order Items */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                <Package className="mr-2 h-5 w-5" />
                Order Items ({order.items.length})
              </h2>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                  >
                    {/* Product Image */}
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="flex-shrink-0"
                    >
                      {item.product.images[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100">
                          <Package className="h-10 w-10 text-gray-400" />
                        </div>
                      )}
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-base font-medium text-gray-900 hover:text-green-600"
                      >
                        {item.productName}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span>
                          Quantity: {Number(item.quantity)} {item.unit}
                        </span>
                        <span>•</span>
                        <span>
                          {formatCurrency(Number(item.unitPrice))} per{" "}
                          {item.unit}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(Number(item.subtotal))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                <Truck className="mr-2 h-5 w-5" />
                Delivery Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Delivery Address
                  </p>
                  <div className="mt-1 text-sm text-gray-600">
                    <p>{shippingAddress?.fullName}</p>
                    <p>{shippingAddress?.street}</p>
                    {shippingAddress?.street2 && (
                      <p>{shippingAddress.street2}</p>
                    )}
                    <p>
                      {shippingAddress?.city}, {shippingAddress?.state}{" "}
                      {shippingAddress?.zipCode}
                    </p>
                    <p className="mt-1">{shippingAddress?.phone}</p>
                  </div>
                </div>

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

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Order Summary
              </h2>
              <div className="space-y-3">
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
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(Number(order.total))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="mt-4 rounded-lg bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Payment Status
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      order.paymentStatus === "PAID"
                        ? "bg-green-100 text-green-800"
                        : order.paymentStatus === "REFUNDED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800",
                    )}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Farm Information */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Farm Details
              </h2>
              <div>
                <Link
                  href={`/farms/${order.farm.id}`}
                  className="text-base font-medium text-green-600 hover:text-green-700"
                >
                  {order.farm.name}
                </Link>
                <div className="mt-4 space-y-3">
                  <div className="flex items-start">
                    <MapPin className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      <p>{order.farm.address}</p>
                      <p>
                        {order.farm.city}, {order.farm.state}{" "}
                        {order.farm.zipCode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                    <a
                      href={`tel:${order.farm.phone}`}
                      className="text-sm text-gray-600 hover:text-green-600"
                    >
                      {order.farm.phone}
                    </a>
                  </div>
                  <div className="flex items-start">
                    <Mail className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                    <a
                      href={`mailto:${order.farm.email}`}
                      className="text-sm text-gray-600 hover:text-green-600"
                    >
                      {order.farm.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="rounded-lg bg-blue-50 p-6">
              <h3 className="mb-2 text-sm font-semibold text-blue-900">
                Need Help?
              </h3>
              <p className="mb-4 text-sm text-blue-700">
                Have questions about your order? We're here to help.
              </p>
              <Link
                href="/support"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
