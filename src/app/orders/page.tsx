"use client";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Filter,
  MapPin,
  Package,
  Search,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/**
 * 📦 ORDERS PAGE - Customer Order History & Tracking
 * View all orders with status tracking
 */

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "confirmed" | "ready" | "completed" | "cancelled";
  total: number;
  farm: string;
  pickupDate: string;
  pickupTime: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

// Mock orders - Replace with actual API call
const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    orderNumber: "FM-2025-001",
    date: "2025-11-08",
    status: "ready",
    total: 47.95,
    farm: "Harvest Moon Farm",
    pickupDate: "2025-11-10",
    pickupTime: "2:00 PM",
    items: [
      { name: "Organic Pumpkins", quantity: 2, price: 8.99 },
      { name: "Fresh Eggs", quantity: 2, price: 6.99 },
      { name: "Butternut Squash", quantity: 3, price: 3.49 },
    ],
  },
  {
    id: "2",
    orderNumber: "FM-2025-002",
    date: "2025-11-07",
    status: "confirmed",
    total: 27.96,
    farm: "Autumn Ridge Orchard",
    pickupDate: "2025-11-11",
    pickupTime: "10:00 AM",
    items: [
      { name: "Honeycrisp Apples", quantity: 3, price: 4.99 },
      { name: "Apple Cider", quantity: 2, price: 7.99 },
    ],
  },
  {
    id: "3",
    orderNumber: "FM-2025-003",
    date: "2025-11-05",
    status: "completed",
    total: 32.97,
    farm: "Maple Leaf Dairy",
    pickupDate: "2025-11-06",
    pickupTime: "3:00 PM",
    items: [
      { name: "Artisan Cheddar Cheese", quantity: 1, price: 12.99 },
      { name: "Fresh Milk", quantity: 2, price: 5.99 },
      { name: "Greek Yogurt", quantity: 2, price: 6.99 },
    ],
  },
  {
    id: "4",
    orderNumber: "FM-2025-004",
    date: "2025-11-01",
    status: "completed",
    total: 45.92,
    farm: "Green Valley Produce",
    pickupDate: "2025-11-02",
    pickupTime: "11:00 AM",
    items: [
      { name: "Mixed Vegetables Box", quantity: 1, price: 24.99 },
      { name: "Fresh Kale", quantity: 3, price: 3.99 },
      { name: "Cherry Tomatoes", quantity: 2, price: 5.99 },
    ],
  },
];

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders = MOCK_ORDERS.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.farm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          color:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300",
          icon: Clock,
        };
      case "confirmed":
        return {
          label: "Confirmed",
          color:
            "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
          icon: CheckCircle,
        };
      case "ready":
        return {
          label: "Ready for Pickup",
          color:
            "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300",
          icon: Package,
        };
      case "completed":
        return {
          label: "Completed",
          color:
            "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300",
          icon: CheckCircle,
        };
      case "cancelled":
        return {
          label: "Cancelled",
          color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300",
          icon: Clock,
        };
    }
  };

  const statusCounts = {
    all: MOCK_ORDERS.length,
    pending: MOCK_ORDERS.filter((o) => o.status === "pending").length,
    confirmed: MOCK_ORDERS.filter((o) => o.status === "confirmed").length,
    ready: MOCK_ORDERS.filter((o) => o.status === "ready").length,
    completed: MOCK_ORDERS.filter((o) => o.status === "completed").length,
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                My Orders
              </h1>
              <p className="text-muted-foreground">
                Track and manage your farm orders
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Orders", value: statusCounts.all, icon: "📦" },
                {
                  label: "Active",
                  value: statusCounts.pending + statusCounts.confirmed,
                  icon: "⏳",
                },
                { label: "Ready", value: statusCounts.ready, icon: "✅" },
                {
                  label: "Completed",
                  value: statusCounts.completed,
                  icon: "🎉",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="glass-card rounded-xl p-4 text-center"
                >
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-bold text-gradient-warm">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Search and Filters */}
            <div className="glass-card rounded-2xl p-6 mb-6">
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by order number, farm, or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                  />
                </div>

                {/* Status Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Status:
                  </span>
                  {[
                    { value: "all", label: "All Orders" },
                    { value: "pending", label: "Pending" },
                    { value: "confirmed", label: "Confirmed" },
                    { value: "ready", label: "Ready" },
                    { value: "completed", label: "Completed" },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setStatusFilter(filter.value)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        statusFilter === filter.value
                          ? "bg-primary-600 border-primary-600 text-white"
                          : "border-border hover:border-primary-500"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  No Orders Found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm
                    ? "Try adjusting your search or filters"
                    : "You haven't placed any orders yet"}
                </p>
                {!searchTerm && (
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Start Shopping
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="block group"
                    >
                      <div className="glass-card rounded-2xl p-6 hover:shadow-glow-lg transition-all duration-300">
                        {/* Order Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-foreground text-lg group-hover:text-primary-600 transition-colors">
                                {order.orderNumber}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusInfo.color}`}
                              >
                                <StatusIcon className="h-3 w-3" />
                                {statusInfo.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Ordered:{" "}
                                  {new Date(order.date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{order.farm}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gradient-warm">
                              ${order.total.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {order.items.length} items
                            </div>
                          </div>
                        </div>

                        {/* Pickup Info */}
                        {(order.status === "ready" ||
                          order.status === "confirmed") && (
                          <div className="p-4 bg-accent-900/10 rounded-lg mb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Truck className="h-4 w-4 text-accent-600" />
                              <span className="font-semibold text-foreground text-sm">
                                Pickup Information
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.pickupDate).toLocaleDateString()}{" "}
                              at {order.pickupTime} • {order.farm}
                            </p>
                          </div>
                        )}

                        {/* Items Preview */}
                        <div className="space-y-2">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="text-foreground font-medium">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-sm text-muted-foreground">
                              +{order.items.length - 2} more items
                            </p>
                          )}
                        </div>

                        {/* View Details Arrow */}
                        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Click to view details
                          </span>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
