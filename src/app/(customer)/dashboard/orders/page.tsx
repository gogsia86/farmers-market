/**
 * CONSUMER ORDERS PAGE - WIREFRAME IMPLEMENTATION
 *
 * Complete order management with:
 * - Tab-based filtering (Active/Completed/Cancelled)
 * - Order cards with status badges
 * - Action buttons (View Details, Contact Farmer, Leave Review)
 * - Empty states for each tab
 */

"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { OrderCard } from "@/components/dashboard/OrderCard";
import { EmptyState } from "@/components/dashboard/EmptyState";

type OrderStatus = "active" | "completed" | "cancelled";

interface Order {
  id: string;
  orderNumber: string;
  farmName: string;
  status: string;
  totalAmount: number;
  createdAt: Date | string;
  items?: Array<{
    id: string;
    productName: string;
    quantity: number;
    unit: string;
    price: number;
  }>;
  deliveryFee?: number;
  estimatedReadyTime?: Date | string;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("status") as OrderStatus) || "active";

  const [activeTab, setActiveTab] = useState<OrderStatus>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    active: 0,
    completed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/dashboard/orders");
      return;
    }

    if (status === "authenticated") {
      fetchOrders(activeTab);
      fetchOrderCounts();
    }
  }, [status, activeTab, router]);

  const fetchOrders = async (statusFilter: OrderStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders?status=${statusFilter}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderCounts = async () => {
    try {
      const response = await fetch("/api/orders/counts");
      const data = await response.json();

      if (data.success) {
        setCounts(data.counts);
      }
    } catch (error) {
      console.error("Failed to fetch order counts:", error);
    }
  };

  const handleTabChange = (tab: OrderStatus) => {
    setActiveTab(tab);
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set("status", tab);
    window.history.pushState({}, "", url);
  };

  if (status === "loading") {
    return <OrderListSkeleton />;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">
            Track and manage your orders from local farms
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <TabButton
              active={activeTab === "active"}
              onClick={() => handleTabChange("active")}
              label="Active"
              count={counts.active}
            />
            <TabButton
              active={activeTab === "completed"}
              onClick={() => handleTabChange("completed")}
              label="Completed"
              count={counts.completed}
            />
            <TabButton
              active={activeTab === "cancelled"}
              onClick={() => handleTabChange("cancelled")}
              label="Cancelled"
              count={counts.cancelled}
            />
          </div>

          {/* Order List */}
          <div className="p-6">
            {loading ? (
              <OrderListContentSkeleton />
            ) : orders.length === 0 ? (
              <EmptyOrderState tab={activeTab} />
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    showItems={true}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">ℹ️</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Order Questions?
              </h3>
              <p className="text-gray-600 mb-4">
                If you have any questions about your orders, order status, or
                need to make changes, contact the farm directly or reach out to
                our support team.
              </p>
              <div className="flex gap-3">
                <Link href="/help" className="btn-green">
                  Help Center
                </Link>
                <Link href="/contact" className="btn-outline">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab Button Component
function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-6 py-4 font-medium text-base sm:text-lg transition-all duration-200 ${
        active
          ? "bg-green-50 text-green-700 border-b-4 border-green-600"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`ml-2 px-2 py-1 rounded-full text-xs sm:text-sm font-semibold ${
            active ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-700"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// Empty State for Each Tab
function EmptyOrderState({ tab }: { tab: OrderStatus }) {
  const messages = {
    active: {
      icon: "📦",
      title: "No active orders",
      description:
        "Orders you place will appear here. Start shopping from local farms!",
      action: (
        <Link href="/farms" className="inline-block btn-green">
          Browse Farms
        </Link>
      ),
    },
    completed: {
      icon: "✅",
      title: "No completed orders yet",
      description:
        "Your order history will appear here once orders are delivered.",
      action: (
        <Link href="/farms" className="inline-block btn-green">
          Start Shopping
        </Link>
      ),
    },
    cancelled: {
      icon: "❌",
      title: "No cancelled orders",
      description:
        "Cancelled orders will appear here if you need to cancel an order.",
      action: null,
    },
  };

  const message = messages[tab];

  return (
    <EmptyState
      icon={message.icon}
      title={message.title}
      description={message.description}
      action={message.action}
    />
  );
}

// Loading Skeleton for Full Page
function OrderListSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Tabs Skeleton */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="flex border-b">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 h-16 bg-gray-100"></div>
            ))}
          </div>
          <div className="p-6">
            <OrderListContentSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton for Order List Content
function OrderListContentSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border-2 rounded-lg p-6 animate-pulse">
          <div className="flex justify-between mb-4">
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-24 bg-gray-200 rounded mb-4"></div>
          <div className="flex gap-3">
            <div className="flex-1 h-12 bg-gray-200 rounded"></div>
            <div className="flex-1 h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
