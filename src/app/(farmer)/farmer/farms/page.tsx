/**
 * 🌾 FARMER FARMS LIST PAGE
 * Display all farms owned by the authenticated farmer
 *
 * Route: /farmer/farms
 * Access: FARMER role only
 *
 * Features:
 * - List all farms owned by farmer
 * - Quick stats for each farm
 * - Create new farm button
 * - Navigate to farm details
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { farmService } from "@/lib/services/farm.service";
import { formatCurrency } from "@/lib/utils/currency";
import {
  Building2,
  MapPin,
  Package,
  Plus,
  ShoppingBag,
  Store,
  TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Farms | Farmers Market Platform",
  description: "Manage your farms",
};

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FarmerFarmsPage() {
  // ==========================================================================
  // AUTHENTICATION CHECK
  // ==========================================================================
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/farmer/farms");
  }

  if (session.user.role !== "FARMER") {
    redirect("/");
  }

  // ==========================================================================
  // FETCH FARMER'S FARMS
  // ==========================================================================
  const { farms, total } = await farmService.getAllFarms({
    ownerId: session.user.id,
    page: 1,
    limit: 50,
  });

  // Get statistics for each farm
  const farmsWithStats = await Promise.all(
    farms.map(async (farm) => {
      const [productCount, orderCount, monthlyRevenue] = await Promise.all([
        database.product.count({
          where: { farmId: farm.id, status: "ACTIVE" },
        }),
        database.order.count({
          where: {
            farmId: farm.id,
            createdAt: {
              gte: new Date(new Date().setDate(1)), // This month
            },
          },
        }),
        database.order
          .aggregate({
            where: {
              farmId: farm.id,
              createdAt: {
                gte: new Date(new Date().setDate(1)), // This month
              },
              status: {
                in: ["CONFIRMED", "PREPARING", "READY", "FULFILLED"],
              },
            },
            _sum: {
              total: true,
            },
          })
          .then((result: any) =>
            result._sum?.total ? Number(result._sum.total) : 0,
          ),
      ]);

      return {
        ...farm,
        stats: {
          productCount,
          orderCount,
          monthlyRevenue: Number(monthlyRevenue),
        },
      };
    }),
  );

  // ==========================================================================
  // STATUS BADGE HELPER
  // ==========================================================================
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        label: "Pending Approval",
        className: "bg-yellow-100 text-yellow-800",
      },
      ACTIVE: {
        label: "Active",
        className: "bg-green-100 text-green-800",
      },
      SUSPENDED: {
        label: "Suspended",
        className: "bg-red-100 text-red-800",
      },
      ARCHIVED: {
        label: "Archived",
        className: "bg-gray-100 text-gray-800",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Farms</h1>
            <p className="mt-2 text-gray-600">
              Manage your farms and view performance
            </p>
          </div>
          <Link
            href="/farmer/farms/new"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Plus className="h-5 w-5" />
            Add New Farm
          </Link>
        </div>

        {/* Empty State */}
        {farms.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <Store
              className="mx-auto h-12 w-12 text-gray-400"
              aria-hidden="true"
            />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No farms yet
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Get started by creating your first farm.
            </p>
            <Link
              href="/farmer/farms/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-green-700"
            >
              <Plus className="h-5 w-5" />
              Create Your First Farm
            </Link>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Farms
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{total}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Products
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {farmsWithStats.reduce(
                        (sum, f) => sum + f.stats.productCount,
                        0,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ShoppingBag className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      This Month Orders
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {farmsWithStats.reduce(
                        (sum, f) => sum + f.stats.orderCount,
                        0,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Monthly Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(
                        farmsWithStats.reduce(
                          (sum, f) => sum + f.stats.monthlyRevenue,
                          0,
                        ),
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Farms Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {farmsWithStats.map((farm) => (
                <Link
                  key={farm.id}
                  href={`/farmer/farms/${farm.id}`}
                  className="group relative overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-lg"
                >
                  {/* Farm Image */}
                  {farm.images && farm.images.length > 0 ? (
                    <div className="aspect-video w-full overflow-hidden bg-gray-100">
                      <img
                        src={farm.images[0]}
                        alt={farm.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                      <Store className="h-16 w-16 text-green-600" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute right-4 top-4">
                    {getStatusBadge(farm.status)}
                  </div>

                  {/* Farm Details */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600">
                      {farm.name}
                    </h3>

                    {/* Location */}
                    {(farm.city || farm.state) && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {[farm.city, farm.state].filter(Boolean).join(", ")}
                      </p>
                    )}

                    {/* Description */}
                    {farm.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                        {farm.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                      <div>
                        <p className="text-xs text-gray-500">Products</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          {farm.stats.productCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Orders</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          {farm.stats.orderCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Revenue</p>
                        <p className="mt-1 text-sm font-semibold text-green-600">
                          {formatCurrency(farm.stats.monthlyRevenue)}
                        </p>
                      </div>
                    </div>

                    {/* View Details Link */}
                    <div className="mt-4 text-sm font-medium text-green-600 group-hover:text-green-700">
                      View details →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
