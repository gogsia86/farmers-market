/**
 * CONSUMER DASHBOARD - WIREFRAME IMPLEMENTATION
 *
 * Complete dashboard overview with:
 * - Quick stats grid
 * - Recent orders
 * - Favorite farms
 * - Quick actions
 */

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { OrderCard } from "@/components/dashboard/OrderCard";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { EmptyState } from "@/components/dashboard/EmptyState";

interface DashboardStats {
  activeOrders: number;
  totalOrders: number;
  favoriteCount: number;
  pendingReviews: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  farmName: string;
  status: string;
  totalAmount: number;
  createdAt: Date | string;
}

interface FavoriteFarm {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
}

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [favoriteFarms, setFavoriteFarms] = useState<FavoriteFarm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/dashboard");
      return;
    }

    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/users/dashboard");
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setFavoriteFarms(data.favoriteFarms || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <DashboardSkeleton />;
  }

  if (!session?.user) {
    return null;
  }

  const userName = session.user.name?.split(" ")[0] || "Friend";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome Back, {userName}! 🌾
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your orders and favorites
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            title="Active Orders"
            value={stats?.activeOrders || 0}
            icon="🛒"
            link="/dashboard/orders?status=active"
            color="blue"
          />
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            icon="📦"
            link="/dashboard/orders"
            color="green"
          />
          <StatCard
            title="Favorite Farms"
            value={stats?.favoriteCount || 0}
            icon="❤️"
            link="/dashboard/favorites"
            color="red"
          />
          <StatCard
            title="Pending Reviews"
            value={stats?.pendingReviews || 0}
            icon="⭐"
            link="/dashboard/reviews"
            color="yellow"
          />
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
            <Link
              href="/dashboard/orders"
              className="text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              View All →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <EmptyState
              icon="🛒"
              title="No orders yet"
              description="Start shopping from local farms to see your orders here"
              action={
                <Link href="/farms" className="inline-block btn-green">
                  Browse Farms
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {recentOrders.slice(0, 3).map((order) => (
                <OrderCard
                  key={order.id}
                  order={{
                    ...order,
                    createdAt: order.createdAt,
                  }}
                  showItems={false}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Favorite Farms Section */}
        {favoriteFarms.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Favorite Farms
              </h2>
              <Link
                href="/dashboard/favorites"
                className="text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {favoriteFarms.slice(0, 5).map((farm) => (
                <Link
                  key={farm.id}
                  href={`/farms/${farm.slug}`}
                  className="group"
                >
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-2">
                    {farm.imageUrl ? (
                      <img
                        src={farm.imageUrl}
                        alt={farm.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🏪
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 text-center truncate">
                    {farm.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickActionCard
              title="Browse Markets"
              description="Discover local farms near you"
              icon="🏪"
              link="/farms"
              color="green"
            />
            <QuickActionCard
              title="Manage Favorites"
              description="View your saved farms and products"
              icon="❤️"
              link="/dashboard/favorites"
              color="red"
            />
            <QuickActionCard
              title="Leave Reviews"
              description="Share your experience with farms"
              icon="⭐"
              link="/dashboard/reviews"
              color="yellow"
            />
          </div>
        </div>

        {/* Help & Support */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">💬</span>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Need Help?
              </h3>
              <p className="text-gray-600 mb-4">
                Have questions about your orders or the platform? We're here to
                help!
              </p>
              <div className="flex gap-3">
                <Link href="/help" className="btn-green">
                  Visit Help Center
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

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>

        {/* Recent Orders Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
