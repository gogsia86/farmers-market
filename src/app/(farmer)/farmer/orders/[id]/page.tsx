/**
 * 📦 FARMER ORDER DETAILS PAGE
 * Divine implementation of order detail viewing and management
 * Features: Full order details, status updates, timeline, customer info
 */

import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  MapPinIcon,
  CubeIcon,
  TruckIcon,
  UserIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const order = await database.order.findUnique({
    where: { id: params.id },
    select: { orderNumber: true },
  });

  return {
    title: order ? `Order ${order.orderNumber}` : "Order Not Found",
    description: "View and manage order details",
  };
}

export default async function FarmerOrderDetailsPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Verify farmer owns a farm
  const farm = await database.farm.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true, name: true },
  });

  if (!farm) {
    redirect("/onboarding/farm");
  }

  // Fetch order with all details
  const order = await database.order.findUnique({
    where: { id: params.id },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
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
              images: true,
              farmId: true,
            },
          },
        },
      },
      fulfillment: true,
      reviews: {
        select: {
          id: true,
          rating: true,
          reviewText: true,
          createdAt: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Verify this order contains items from this farmer's farm
  const hasFarmItems =
    order.items?.some((item: any) => item.product.farmId === farm.id) ?? false;

  if (!hasFarmItems) {
    notFound();
  }

  // Filter items to only show this farm's products
  const farmItems =
    order.items?.filter((item: any) => item.product.farmId === farm.id) ?? [];

  // Calculate farm-specific totals
  const farmSubtotal = farmItems.reduce(
    (sum: number, item: any) => sum + Number(item.subtotal),
    0,
  );

  // Parse shipping address
  const shippingAddress =
    typeof order.shippingAddress === "string"
      ? JSON.parse(order.shippingAddress)
      : order.shippingAddress;

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
      PREPARING: "bg-purple-100 text-purple-800 border-purple-200",
      READY: "bg-indigo-100 text-indigo-800 border-indigo-200",
      FULFILLED: "bg-green-100 text-green-800 border-green-200",
      COMPLETED: "bg-green-100 text-green-800 border-green-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PAID: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      REFUNDED: "bg-gray-100 text-gray-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  // Order timeline
  const timeline = [
    {
      status: "PENDING",
      label: "Order Placed",
      date: order.createdAt,
      completed: true,
      icon: CubeIcon,
    },
    {
      status: "CONFIRMED",
      label: "Order Confirmed",
      date: order.confirmedAt,
      completed: !!order.confirmedAt,
      icon: CheckCircleIcon,
    },
    {
      status: "PREPARING",
      label: "Preparing Order",
      date: null,
      completed: ["PREPARING", "READY", "FULFILLED", "COMPLETED"].includes(
        order.status,
      ),
      icon: ClockIcon,
    },
    {
      status: "READY",
      label: "Ready for Pickup/Delivery",
      date: null,
      completed: ["READY", "FULFILLED", "COMPLETED"].includes(order.status),
      icon: TruckIcon,
    },
    {
      status: "FULFILLED",
      label: "Fulfilled",
      date: order.fulfilledAt,
      completed: ["FULFILLED", "COMPLETED"].includes(order.status),
      icon: CheckCircleIcon,
    },
    {
      status: "COMPLETED",
      label: "Completed",
      date: order.completedAt,
      completed: order.status === "COMPLETED",
      icon: CheckCircleIcon,
    },
  ];

  // Filter out completed status if fulfilled
  const activeTimeline =
    order.status === "CANCELLED"
      ? [
          timeline[0],
          {
            status: "CANCELLED",
            label: "Order Cancelled",
            date: order.cancelledAt,
            completed: true,
            icon: XCircleIcon,
          },
        ]
      : timeline;

  return (
    <div
      className="min-h-screen bg-gray-50 py-8"
      data-testid="order-details-page"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/farmer/orders"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            data-testid="back-to-orders-link"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-3xl font-bold text-gray-900"
                data-testid="order-number"
              >
                Order {order.orderNumber}
              </h1>
              <p
                className="mt-1 text-sm text-gray-500"
                data-testid="order-date"
              >
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold ${getStatusBadge(
                  order.status,
                )}`}
                data-testid="order-status-badge"
              >
                {order.status.replace("_", " ")}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold ${getPaymentStatusBadge(
                  order.paymentStatus,
                )}`}
                data-testid="payment-status-badge"
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            <div
              className="bg-white rounded-lg shadow-sm p-6"
              data-testid="order-timeline"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Order Status
              </h2>
              <div className="space-y-4">
                {activeTimeline.map((step, index) => {
                  if (!step) return null;
                  return (
                    <div key={step.status} className="flex items-start">
                      <div className="flex-shrink-0">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            step.completed
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          <step.icon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p
                          className={`text-sm font-medium ${
                            step.completed ? "text-gray-900" : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.date && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            {new Date(step.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                      {index < activeTimeline.length - 1 && (
                        <div className="absolute left-5 top-10 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div
              className="bg-white rounded-lg shadow-sm p-6"
              data-testid="order-items"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Items ({farmItems.length})
              </h2>
              <div className="divide-y divide-gray-200">
                {farmItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center py-4 first:pt-0 last:pb-0"
                    data-testid={`order-item-${item.id}`}
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={
                            typeof item.product.images === "string"
                              ? item.product.images
                              : Array.isArray(item.product.images)
                                ? item.product.images[0]
                                : "/placeholder-product.jpg"
                          }
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100">
                          <CubeIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.productName}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Qty: {Number(item.quantity)} {item.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${Number(item.subtotal).toFixed(2)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        ${Number(item.unitPrice).toFixed(2)}/{item.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Farm Subtotal */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Your Items Total</p>
                  <p data-testid="farm-subtotal">${farmSubtotal.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Fulfillment Details */}
            {order.fulfillment && (
              <div
                className="bg-white rounded-lg shadow-sm p-6"
                data-testid="fulfillment-details"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Fulfillment Details
                </h2>
                <dl className="space-y-3">
                  {order.fulfillment.trackingNumber && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Tracking Number
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {order.fulfillment.trackingNumber}
                      </dd>
                    </div>
                  )}
                  {order.fulfillment.carrierName && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Carrier
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {order.fulfillment.carrierName}
                      </dd>
                    </div>
                  )}
                  {order.fulfillment.estimatedDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Estimated Delivery
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(
                          order.fulfillment.estimatedDate,
                        ).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div
              className="bg-white rounded-lg shadow-sm p-6"
              data-testid="customer-info"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {order.customer?.name || "Guest Customer"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.customer?.email}
                    </p>
                    {order.customer?.phone && (
                      <p className="text-sm text-gray-500">
                        {order.customer.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div
              className="bg-white rounded-lg shadow-sm p-6"
              data-testid="delivery-info"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Delivery Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <TruckIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {order.fulfillmentMethod.replace("_", " ")}
                    </p>
                    {shippingAddress && (
                      <div className="mt-2 text-sm text-gray-500">
                        <p>{shippingAddress.street}</p>
                        <p>
                          {shippingAddress.city}, {shippingAddress.state}{" "}
                          {shippingAddress.zipCode}
                        </p>
                        {shippingAddress.country && (
                          <p>{shippingAddress.country}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {order.scheduledDate && (
                  <div className="flex items-start">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Scheduled Date
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.scheduledDate).toLocaleDateString()}
                        {order.scheduledTimeSlot &&
                          ` - ${order.scheduledTimeSlot}`}
                      </p>
                    </div>
                  </div>
                )}

                {order.specialInstructions && (
                  <div className="flex items-start">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Special Instructions
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.specialInstructions}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div
              className="bg-white rounded-lg shadow-sm p-6"
              data-testid="payment-info"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">
                    ${Number(order.subtotal).toFixed(2)}
                  </span>
                </div>
                {Number(order.deliveryFee) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery Fee</span>
                    <span className="text-gray-900">
                      ${Number(order.deliveryFee).toFixed(2)}
                    </span>
                  </div>
                )}
                {Number(order.tax) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span className="text-gray-900">
                      ${Number(order.tax).toFixed(2)}
                    </span>
                  </div>
                )}
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-green-600">
                      -${Number(order.discount).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-medium">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900" data-testid="order-total">
                    ${Number(order.total).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-sm">
                  <span className="text-gray-500">Your Earnings</span>
                  <span
                    className="text-green-600 font-semibold"
                    data-testid="farmer-earnings"
                  >
                    ${Number(order.farmerAmount).toFixed(2)}
                  </span>
                </div>
                {order.paidAt && (
                  <div className="flex items-center text-sm text-gray-500">
                    <CreditCardIcon className="h-4 w-4 mr-1" />
                    Paid on {new Date(order.paidAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Order Actions */}
            {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
              <div
                className="bg-white rounded-lg shadow-sm p-6"
                data-testid="order-actions"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Actions
                </h2>
                <div className="space-y-2">
                  {order.status === "PENDING" && (
                    <button
                      className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                      data-testid="confirm-order-button"
                    >
                      Confirm Order
                    </button>
                  )}
                  {order.status === "CONFIRMED" && (
                    <button
                      className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      data-testid="mark-preparing-button"
                    >
                      Mark as Preparing
                    </button>
                  )}
                  {order.status === "PREPARING" && (
                    <button
                      className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                      data-testid="mark-ready-button"
                    >
                      Mark as Ready
                    </button>
                  )}
                  {order.status === "READY" && (
                    <button
                      className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                      data-testid="mark-fulfilled-button"
                    >
                      Mark as Fulfilled
                    </button>
                  )}
                  <button
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    data-testid="contact-customer-button"
                  >
                    Contact Customer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
