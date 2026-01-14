/**
 * 🌾 FARMER ORDER DETAILS PAGE
 * Display detailed information about a specific order
 *
 * Route: /farmer/farms/[farmId]/orders/[orderId]
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Order Details | Farmer Dashboard",
  description: "View order details and manage fulfillment",
};

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ farmId: string; orderId: string }>;
}

const ORDER_STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
    description: "Order is awaiting your confirmation",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: CheckCircle,
    description: "Order has been confirmed and is being prepared",
  },
  PREPARING: {
    label: "Preparing",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Package,
    description: "Order is being prepared for fulfillment",
  },
  READY: {
    label: "Ready",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: ShoppingBag,
    description: "Order is ready for customer pickup",
  },
  FULFILLED: {
    label: "Fulfilled",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: Truck,
    description: "Order has been fulfilled",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    description: "Order has been completed successfully",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    description: "Order has been cancelled",
  },
} as const;

const PAYMENT_STATUS_CONFIG = {
  PENDING: { label: "Pending Payment", color: "text-yellow-600", icon: Clock },
  PAID: {
    label: "Payment Received",
    color: "text-green-600",
    icon: CheckCircle,
  },
  FAILED: { label: "Payment Failed", color: "text-red-600", icon: XCircle },
  REFUNDED: { label: "Refunded", color: "text-gray-600", icon: DollarSign },
  PARTIALLY_REFUNDED: {
    label: "Partially Refunded",
    color: "text-orange-600",
    icon: DollarSign,
  },
} as const;

const FULFILLMENT_METHOD_CONFIG = {
  PICKUP: { label: "Pickup", icon: ShoppingBag },
  DELIVERY: { label: "Delivery", icon: Truck },
  SHIPPING: { label: "Shipping", icon: Package },
} as const;

export default async function OrderDetailsPage({ params }: PageProps) {
  // Await params in Next.js 15 (params is now a Promise)
  const { farmId, orderId } = await params;

  // Authentication check
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/farmer/farms/${farmId}/orders/${orderId}`);
  }

  // Verify user is a farmer
  if (session.user.role !== "FARMER") {
    redirect("/");
  }

  // Get farm and verify ownership
  const farm = await database.farm.findUnique({
    where: { id: farmId },
    select: {
      id: true,
      name: true,
      ownerId: true,
    },
  });

  if (!farm) {
    notFound();
  }

  // Verify ownership
  if (farm.ownerId !== session.user.id) {
    redirect("/farmer/dashboard");
  }

  // Fetch order with all details
  const order = await database.order.findFirst({
    where: {
      id: orderId,
      farmId: farmId,
    },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatar: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              primaryPhotoUrl: true,
              status: true,
            },
          },
        },
        orderBy: {
          productName: "asc",
        },
      },
      deliveryAddress: true,
      Payment: {
        select: {
          id: true,
          amount: true,
          status: true,
          paymentMethod: true,
          stripePaymentIntentId: true,
          createdAt: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const statusConfig =
    ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG];
  const paymentConfig =
    PAYMENT_STATUS_CONFIG[
      order.paymentStatus as keyof typeof PAYMENT_STATUS_CONFIG
    ];
  const fulfillmentConfig =
    FULFILLMENT_METHOD_CONFIG[
      order.fulfillmentMethod as keyof typeof FULFILLMENT_METHOD_CONFIG
    ];

  const StatusIcon = statusConfig?.icon || Clock;
  const PaymentIcon = paymentConfig?.icon || CreditCard;
  const FulfillmentIcon = fulfillmentConfig?.icon || ShoppingBag;

  // Calculate totals
  const itemsSubtotal = order.items.reduce(
    (sum: number, item: any) => sum + Number(item.subtotal),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Navigation */}
          <Link
            href={`/farmer/farms/${farmId}/orders`}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order {order.orderNumber}
              </h1>
              <p className="mt-2 text-gray-600">{farm.name}</p>
            </div>

            {/* Status Badge */}
            <div
              className={`inline-flex items-center px-4 py-2 rounded-lg border ${statusConfig?.color || "bg-gray-100 text-gray-800 border-gray-200"}`}
            >
              <StatusIcon className="mr-2 h-5 w-5" />
              <span className="font-medium">
                {statusConfig?.label || order.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Status
              </h2>
              <div className="flex items-start space-x-4">
                <div
                  className={`flex-shrink-0 rounded-lg p-3 ${statusConfig?.color || "bg-gray-100"}`}
                >
                  <StatusIcon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {statusConfig?.label || order.status}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {statusConfig?.description || "Order status information"}
                  </p>
                  {order.confirmedAt && (
                    <p className="mt-2 text-xs text-gray-500">
                      Confirmed on{" "}
                      {format(new Date(order.confirmedAt), "PPP 'at' p")}
                    </p>
                  )}
                  {order.fulfilledAt && (
                    <p className="mt-1 text-xs text-gray-500">
                      Fulfilled on{" "}
                      {format(new Date(order.fulfilledAt), "PPP 'at' p")}
                    </p>
                  )}
                  {order.completedAt && (
                    <p className="mt-1 text-xs text-gray-500">
                      Completed on{" "}
                      {format(new Date(order.completedAt), "PPP 'at' p")}
                    </p>
                  )}
                </div>
              </div>

              {/* Cancel Info */}
              {order.status === "CANCELLED" && order.cancelReason && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-900">
                    Cancellation Reason:
                  </p>
                  <p className="mt-1 text-sm text-red-700">
                    {order.cancelReason}
                  </p>
                  {order.cancelledAt && (
                    <p className="mt-2 text-xs text-red-600">
                      Cancelled on{" "}
                      {format(new Date(order.cancelledAt), "PPP 'at' p")}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Order Items
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {order.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-6 flex items-center space-x-4"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {item.product?.primaryPhotoUrl ? (
                        <img
                          src={item.product.primaryPhotoUrl}
                          alt={item.productName}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.productName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(Number(item.unitPrice))} per {item.unit}
                      </p>
                      {item.product && (
                        <Link
                          href={`/farmer/farms/${farmId}/products/${item.product.id}`}
                          className="text-xs text-green-600 hover:text-green-700"
                        >
                          View Product →
                        </Link>
                      )}
                    </div>

                    {/* Quantity and Subtotal */}
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        Qty: {Number(item.quantity)}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {formatCurrency(Number(item.subtotal))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(Number(order.subtotal))}
                    </span>
                  </div>
                  {Number(order.deliveryFee) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(Number(order.deliveryFee))}
                      </span>
                    </div>
                  )}
                  {Number(order.tax) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(Number(order.tax))}
                      </span>
                    </div>
                  )}
                  {Number(order.platformFee) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Platform Fee</span>
                      <span className="font-medium text-gray-900">
                        -{formatCurrency(Number(order.platformFee))}
                      </span>
                    </div>
                  )}
                  {Number(order.discount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-green-600">
                        -{formatCurrency(Number(order.discount))}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900">
                        Total
                      </span>
                      <span className="text-base font-bold text-gray-900">
                        {formatCurrency(Number(order.total))}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-green-600">
                        Your Amount (after fees)
                      </span>
                      <span className="text-base font-bold text-green-600">
                        {formatCurrency(Number(order.farmerAmount))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fulfillment Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Fulfillment Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <FulfillmentIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Fulfillment Method
                    </p>
                    <p className="text-sm text-gray-600">
                      {fulfillmentConfig?.label || order.fulfillmentMethod}
                    </p>
                  </div>
                </div>

                {order.scheduledDate && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Scheduled Date
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(order.scheduledDate), "PPP")}
                        {order.scheduledTimeSlot &&
                          ` • ${order.scheduledTimeSlot}`}
                      </p>
                    </div>
                  </div>
                )}

                {order.deliveryAddress && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Delivery Address
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.deliveryAddress.street}
                        {order.deliveryAddress.street2 &&
                          `, ${order.deliveryAddress.street2}`}
                        <br />
                        {order.deliveryAddress.city},{" "}
                        {order.deliveryAddress.state}{" "}
                        {order.deliveryAddress.zipCode}
                      </p>
                    </div>
                  </div>
                )}

                {order.trackingNumber && (
                  <div className="flex items-start space-x-3">
                    <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Tracking Information
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.shippingService && `${order.shippingService}: `}
                        <span className="font-mono">
                          {order.trackingNumber}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {order.fulfillmentNotes && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-900">
                      Fulfillment Notes:
                    </p>
                    <p className="mt-1 text-sm text-yellow-700">
                      {order.fulfillmentNotes}
                    </p>
                  </div>
                )}

                {order.specialInstructions && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">
                      Special Instructions from Customer:
                    </p>
                    <p className="mt-1 text-sm text-blue-700">
                      {order.specialInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Name</p>
                    <p className="text-sm text-gray-600">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <a
                      href={`mailto:${order.customer.email}`}
                      className="text-sm text-green-600 hover:text-green-700"
                    >
                      {order.customer.email}
                    </a>
                  </div>
                </div>

                {order.customer.phone && (
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        {order.customer.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <PaymentIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Status</p>
                    <p
                      className={`text-sm font-medium ${paymentConfig?.color}`}
                    >
                      {paymentConfig?.label || order.paymentStatus}
                    </p>
                  </div>
                </div>

                {order.Payment && (
                  <>
                    <div className="flex items-start space-x-3">
                      <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Payment Method
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {order.Payment.paymentMethod || "Card"}
                        </p>
                      </div>
                    </div>

                    {order.Payment.stripePaymentIntentId && (
                      <div className="flex items-start space-x-3">
                        <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Payment Intent ID
                          </p>
                          <p className="text-xs font-mono text-gray-600 break-all">
                            {order.Payment.stripePaymentIntentId}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {order.paidAt && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Paid on {format(new Date(order.paidAt), "PPP 'at' p")}
                    </p>
                  </div>
                )}

                {order.stripePaymentIntentId && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Payment Intent:{" "}
                      <span className="font-mono">
                        {order.stripePaymentIntentId}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Timeline
              </h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Order Placed
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(order.createdAt), "PPP 'at' p")}
                    </p>
                  </div>
                </div>

                {order.confirmedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order Confirmed
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(order.confirmedAt), "PPP 'at' p")}
                      </p>
                    </div>
                  </div>
                )}

                {order.fulfilledAt && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order Fulfilled
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(order.fulfilledAt), "PPP 'at' p")}
                      </p>
                    </div>
                  </div>
                )}

                {order.completedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 bg-green-600 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order Completed
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(order.completedAt), "PPP 'at' p")}
                      </p>
                    </div>
                  </div>
                )}

                {order.cancelledAt && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order Cancelled
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(order.cancelledAt), "PPP 'at' p")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {order.status === "PENDING" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <button
                    type="button"
                    className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Confirm Order
                  </button>
                  <button
                    type="button"
                    className="w-full px-4 py-2 bg-white text-red-600 font-medium rounded-lg border border-red-300 hover:bg-red-50 transition-colors"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            )}

            {/* Help */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900">
                    Need Help?
                  </h3>
                  <p className="mt-1 text-xs text-blue-700">
                    Contact customer support if you have questions about this
                    order or need to make changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
