/**
 * USER DASHBOARD - AUTHENTICATED USER HOME
 *
 * Divine dashboard for authenticated users.
 * Shows personalized content, stats, and quick actions.
 *
 * Features:
 * - User stats (orders, favorites, etc.)
 * - Quick actions
 * - Recent activity
 * - Personalized recommendations
 */

"use client";

import { Header } from "@/components/layout/Header";
import { Heart, MapPin, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-agricultural-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const { user } = session;

  // Mock stats - replace with real data
  const stats = [
    {
      label: "Total Orders",
      value: "12",
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Favorites",
      value: "8",
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Active Orders",
      value: "2",
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Total Spent",
      value: "$324",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const quickActions = [
    {
      title: "Browse Products",
      description: "Discover fresh products from local farms",
      icon: Package,
      href: "/products",
      color: "agricultural",
    },
    {
      title: "My Orders",
      description: "Track your orders and view history",
      icon: ShoppingBag,
      href: "/orders",
      color: "blue",
    },
    {
      title: "Favorites",
      description: "View your saved products and farms",
      icon: Heart,
      href: "/favorites",
      color: "red",
    },
    {
      title: "Find Farms",
      description: "Explore local farms near you",
      icon: MapPin,
      href: "/farms",
      color: "green",
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.name?.split(" ")[0] || "there"}! 👋
            </h1>
            <p className="mt-2 text-gray-600">
              Here's what's happening with your account
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-agricultural-300 transition-all group"
                  >
                    <div
                      className={`bg-${action.color}-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className={`h-6 w-6 text-${action.color}-600`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {/* Mock activity items */}
              <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                <div className="bg-green-50 p-2 rounded-lg">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Order delivered
                  </p>
                  <p className="text-sm text-gray-600">
                    Your order #1234 has been delivered
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    New order placed
                  </p>
                  <p className="text-sm text-gray-600">
                    Order #1235 is being processed
                  </p>
                  <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-red-50 p-2 rounded-lg">
                  <Heart className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    New favorite added
                  </p>
                  <p className="text-sm text-gray-600">
                    You saved "Organic Tomatoes" to favorites
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
