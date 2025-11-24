"use client";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  DollarSign,
  Edit,
  Eye,
  Package,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/**
 * 🌾 FARMER DASHBOARD - Fall Harvest Theme
 * Main dashboard for farmer portal
 */

interface DashboardStats {
  totalRevenue: number;
  pendingOrders: number;
  activeProducts: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  items: number;
  total: number;
  status: "pending" | "confirmed" | "ready" | "completed";
  pickupDate: string;
}

export default function FarmerDashboardPage() {
  const [stats] = useState<DashboardStats>({
    totalRevenue: 12450,
    pendingOrders: 8,
    activeProducts: 24,
    totalCustomers: 156,
    revenueChange: 12.5,
    ordersChange: 8.3,
  });

  const [recentOrders] = useState<RecentOrder[]>([
    {
      id: "1",
      orderNumber: "FM-2025-105",
      customer: "Sarah Johnson",
      items: 3,
      total: 42.97,
      status: "pending",
      pickupDate: "2025-11-10",
    },
    {
      id: "2",
      orderNumber: "FM-2025-104",
      customer: "Mike Chen",
      items: 2,
      total: 28.5,
      status: "confirmed",
      pickupDate: "2025-11-11",
    },
    {
      id: "3",
      orderNumber: "FM-2025-103",
      customer: "Emma Davis",
      items: 5,
      total: 67.45,
      status: "ready",
      pickupDate: "2025-11-09",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "confirmed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300";
      case "ready":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300";
      case "completed":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Farmer Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Welcome back! Here's what's happening with your farm.
                </p>
              </div>
              <Link
                href="/farmer/products/new"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-glow"
              >
                <Plus className="h-5 w-5" />
                Add Product
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary-600" />
                  </div>
                  <span className="text-xs font-medium text-accent-600 bg-accent-900/10 px-2 py-1 rounded">
                    +{stats.revenueChange}%
                  </span>
                </div>
                <div className="text-2xl font-bold text-gradient-warm mb-1">
                  ${stats.totalRevenue.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Revenue
                </div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-secondary-600" />
                  </div>
                  <span className="text-xs font-medium text-accent-600 bg-accent-900/10 px-2 py-1 rounded">
                    +{stats.ordersChange}%
                  </span>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {stats.pendingOrders}
                </div>
                <div className="text-sm text-muted-foreground">
                  Pending Orders
                </div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/20 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-accent-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {stats.activeProducts}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Products
                </div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {stats.totalCustomers}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Customers
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Recent Orders */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">
                      Recent Orders
                    </h2>
                    <Link
                      href="/farmer/orders"
                      className="text-sm font-medium text-primary-600 hover:text-primary-500"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 border-2 border-border rounded-xl hover:border-primary-500 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {order.orderNumber}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {order.customer}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              order.status,
                            )}`}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {order.items} items • Pickup:{" "}
                            {new Date(order.pickupDate).toLocaleDateString()}
                          </span>
                          <span className="font-semibold text-foreground">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors">
                            View Details
                          </button>
                          {order.status === "pending" && (
                            <button className="flex-1 px-4 py-2 border-2 border-border hover:border-primary-500 rounded-lg text-sm font-medium transition-colors">
                              Accept Order
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-foreground mb-6">
                    Quick Actions
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Link
                      href="/farmer/products"
                      className="p-4 border-2 border-border hover:border-primary-500 rounded-xl transition-all group"
                    >
                      <Edit className="h-8 w-8 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold text-foreground mb-1">
                        Manage Products
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Edit inventory and pricing
                      </p>
                    </Link>
                    <Link
                      href="/farmer/analytics"
                      className="p-4 border-2 border-border hover:border-primary-500 rounded-xl transition-all group"
                    >
                      <BarChart3 className="h-8 w-8 text-secondary-600 mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold text-foreground mb-1">
                        View Analytics
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Sales reports and trends
                      </p>
                    </Link>
                    <Link
                      href="/farms/your-farm-id"
                      className="p-4 border-2 border-border hover:border-primary-500 rounded-xl transition-all group"
                    >
                      <Eye className="h-8 w-8 text-accent-600 mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold text-foreground mb-1">
                        View Your Farm
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        See public farm page
                      </p>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Performance */}
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary-600" />
                    This Week
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Sales</span>
                        <span className="font-semibold text-foreground">
                          $1,245
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary-600 to-accent-600 rounded-full w-3/4" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Orders</span>
                        <span className="font-semibold text-foreground">
                          23
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-secondary-600 to-primary-600 rounded-full w-3/5" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">
                          New Customers
                        </span>
                        <span className="font-semibold text-foreground">
                          12
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-accent-600 to-secondary-600 rounded-full w-[45%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alerts */}
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-accent-600" />
                    Alerts
                  </h2>
                  <div className="space-y-3">
                    <div className="p-3 bg-accent-900/10 border border-accent-500/30 rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-1">
                        Low Stock Alert
                      </p>
                      <p className="text-xs text-muted-foreground">
                        3 products are running low on inventory
                      </p>
                    </div>
                    <div className="p-3 bg-blue-900/10 border border-blue-500/30 rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-1">
                        Payment Scheduled
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Next payout: Nov 15, 2025 ($850.00)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resources */}
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-foreground mb-4">
                    Farmer Resources
                  </h2>
                  <div className="space-y-2">
                    <Link
                      href="/resources"
                      className="block text-sm text-primary-600 hover:text-primary-500"
                    >
                      → Growing Guides
                    </Link>
                    <Link
                      href="/resources"
                      className="block text-sm text-primary-600 hover:text-primary-500"
                    >
                      → Marketing Tips
                    </Link>
                    <Link
                      href="/support"
                      className="block text-sm text-primary-600 hover:text-primary-500"
                    >
                      → Contact Support
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
