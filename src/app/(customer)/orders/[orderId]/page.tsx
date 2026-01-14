/**
 * 📦 ORDER DETAILS PAGE - Complete Order Information & Tracking
 * Displays comprehensive order details with status tracking and timeline
 * Following: 04_NEXTJS_DIVINE_IMPLEMENTATION & 10_AGRICULTURAL_FEATURE_PATTERNS
 */

import { InvoiceDownloadButton } from "@/components/orders/InvoiceDownloadButton";
import { OrderDetailPageClient } from "@/components/orders/OrderDetailPageClient";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import {
  Check,
  CheckCircle2,
  Clock,
  MessageCircle,
  Package,
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
              name: true,
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

        {/* Client-side component with real-time tracking */}
        <OrderDetailPageClient
          order={order}
          orderStatusSteps={ORDER_STATUS_STEPS}
          currentStatusIndex={currentStatusIndex}
          isCancelled={isCancelled}
          isCompleted={isCompleted}
          estimatedDelivery={estimatedDelivery}
          shippingAddress={shippingAddress}
        />
      </div>
    </main>
  );
}
