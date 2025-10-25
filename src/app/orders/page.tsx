/**
 * MY ORDERS PAGE - USER ORDER HISTORY
 *
 * Shows all orders placed by the authenticated user.
 * Displays order status, items, and totals.
 *
 * Features:
 * - Order list with status
 * - Order details
 * - Reorder functionality
 * - Order tracking
 */

"use client";

import Header from "@/components/layout/Header";
import {
  CheckCircle,
  ChevronRight,
  Clock,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Order {
  id: string;
  orderNumber: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  total: number;
  itemCount: number;
  createdAt: string;
  estimatedDelivery?: string;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/orders");
    }
  }, [status, router]);

  useEffect(() => {
    // Mock orders - replace with API call
    const mockOrders: Order[] = [
      {
        id: "1",
        orderNumber: "ORD-2025-001",
        status: "DELIVERED",
        total: 4599,
        itemCount: 3,
        createdAt: "2025-10-20T10:00:00Z",
        estimatedDelivery: "2025-10-22T10:00:00Z",
      },
      {
        id: "2",
        orderNumber: "ORD-2025-002",
        status: "SHIPPED",
        total: 2999,
        itemCount: 2,
        createdAt: "2025-10-24T14:30:00Z",
        estimatedDelivery: "2025-10-26T14:30:00Z",
      },
      {
        id: "3",
        orderNumber: "ORD-2025-003",
        status: "PROCESSING",
        total: 1599,
        itemCount: 1,
        createdAt: "2025-10-25T09:15:00Z",
        estimatedDelivery: "2025-10-27T09:15:00Z",
      },
    ];

    setTimeout(() => {
      setOrders(mockOrders);
      setIsLoading(false);
    }, 500);
  }, []);

  if (status === "loading" || isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-agricultural-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
      </>
    );
  }

  if (!session?.user) {
    return null;
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "PROCESSING":
        return <Package className="h-5 w-5 text-blue-600" />;
      case "SHIPPED":
        return <Truck className="h-5 w-5 text-purple-600" />;
      case "DELIVERED":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="mt-2 text-gray-600">View and track all your orders</p>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start shopping to see your orders here
              </p>
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-agricultural-600 text-white rounded-lg hover:bg-agricultural-700 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-agricultural-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Order Header */}
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(order.status)}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-600">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            Status
                          </p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status.replace("_", " ")}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            Items
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {order.itemCount}{" "}
                            {order.itemCount === 1 ? "item" : "items"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            Total
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            ${(order.total / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Estimated Delivery */}
                      {order.estimatedDelivery &&
                        order.status !== "DELIVERED" &&
                        order.status !== "CANCELLED" && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">
                              Estimated delivery:
                            </span>{" "}
                            {formatDate(order.estimatedDelivery)}
                          </p>
                        )}
                    </div>

                    {/* Chevron */}
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
