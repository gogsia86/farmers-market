/**
 * 🏞️ FARM DETAILS & EDIT PAGE
 * Comprehensive farm management page with view/edit capabilities
 * Following: 10_AGRICULTURAL_FEATURE_PATTERNS & 08_UX_DESIGN_CONSCIOUSNESS
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/currency";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  MapPin,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Farm Management | Farmers Market Platform",
  description: "Manage your farm profile and settings",
};

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    farmId: string;
  };
}

export default async function FarmDetailsPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/farmer/farms/${params.farmId}`);
  }

  // Fetch farm with relationships
  const farm = await database.farm.findUnique({
    where: { id: params.farmId },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      products: {
        select: {
          id: true,
          status: true,
          price: true,
          quantityAvailable: true,
        },
      },
      orders: {
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
        },
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          products: true,
          orders: true,
          reviews: true,
        },
      },
    },
  });

  if (!farm) {
    notFound();
  }

  // Authorization check - only owner can access
  const isOwner = farm.ownerId === session.user.id;

  if (!isOwner && session.user.role !== "ADMIN") {
    redirect("/farmer/dashboard");
  }

  // Calculate statistics
  const activeProducts = farm.products.filter((p) => p.status === "ACTIVE").length;
  const totalRevenue = farm.orders
    .filter((o) => ["DELIVERED", "COMPLETED"].includes(o.status))
    .reduce((sum, order) => sum + Number(order.total), 0);

  const inventoryValue = farm.products.reduce((sum, product) => {
    const qty = product.quantityAvailable ? Number(product.quantityAvailable) : 0;
    const price = Number(product.price);
    return sum + qty * price;
  }, 0);

  const pendingOrders = farm.orders.filter(
    (o) => o.status === "PENDING" || o.status === "CONFIRMED"
  ).length;

  // Get verification status badge
  const getVerificationBadge = () => {
    switch (farm.verificationStatus) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Verified
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
            <Clock className="mr-1.5 h-4 w-4" />
            Pending Verification
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
            <XCircle className="mr-1.5 h-4 w-4" />
            Verification Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
            <Clock className="mr-1.5 h-4 w-4" />
            Not Verified
          </span>
        );
    }
  };

  // Parse operating hours if exists
  const operatingHours = farm.operatingHours as any;

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/farmer/dashboard"
            className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{farm.name}</h1>
                {getVerificationBadge()}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                <span className="flex items-center">
                  <MapPin className="mr-1.5 h-4 w-4" />
                  {farm.city}, {farm.state}
                </span>
                <span className="flex items-center">
                  <Calendar className="mr-1.5 h-4 w-4" />
                  Joined {new Date(farm.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Eye className="mr-1.5 h-4 w-4" />
                  {farm.viewsCount || 0} views
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/farms/${farm.slug}`}
                target="_blank"
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Public Profile
              </Link>
              <Link
                href={`/farmer/farms/${farm.id}/edit`}
                className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Farm
              </Link>
            </div>
          </div>
        </div>

        {/* Verification Alert */}
        {farm.verificationStatus === "PENDING" && (
          <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <div className="flex items-start">
              <Clock className="h-5 w-5 mt-0.5 mr-3 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-900">
                  Verification Pending
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Your farm is currently under review. You can add products, but they won't
                  be visible to customers until your farm is verified (usually within 24-48
                  hours).
                </p>
              </div>
            </div>
          </div>
        )}

        {farm.verificationStatus === "REJECTED" && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-start">
              <XCircle className="h-5 w-5 mt-0.5 mr-3 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-900">
                  Verification Rejected
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  Your farm verification was rejected. Please review the feedback and update
                  your farm information. Contact support if you need assistance.
                </p>
                {farm.verificationNotes && (
                  <p className="mt-2 text-sm text-red-800 font-medium">
                    Reason: {farm.verificationNotes}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="overflow-hidden rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-green-100 p-3">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Active Products
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {activeProducts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-blue-100 p-3">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Total Orders
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {farm._count.orders}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-purple-100 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Total Revenue
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {formatCurrency(totalRevenue)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-yellow-100 p-3">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Total Reviews
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {farm._count.reviews}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Farm Information */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Farm Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {farm.description || "No description provided"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {farm.address}
                    <br />
                    {farm.city}, {farm.state} {farm.zipCode}
                  </p>
                </div>

                {farm.farmingPractices && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Farming Practices
                    </p>
                    <p className="mt-1 text-sm text-gray-900">{farm.farmingPractices}</p>
                  </div>
                )}

                {farm.certifications && Array.isArray(farm.certifications) && farm.certifications.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Certifications
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(farm.certifications as string[]).map((cert, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Operating Hours */}
            {operatingHours && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Operating Hours
                </h2>
                <div className="space-y-2">
                  {Object.entries(operatingHours).map(([day, hours]: [string, any]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700 capitalize">{day}</span>
                      <span className="text-gray-600">
                        {hours.open && hours.close
                          ? `${hours.open} - ${hours.close}`
                          : "Closed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <Link
                  href={`/farmer/farms/${farm.id}/orders`}
                  className="text-sm font-medium text-green-600 hover:text-green-700"
                >
                  View All →
                </Link>
              </div>
              {farm.orders.length > 0 ? (
                <div className="space-y-3">
                  {farm.orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(Number(order.total))}
                        </p>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            order.status === "PENDING" && "bg-yellow-100 text-yellow-800",
                            order.status === "CONFIRMED" && "bg-blue-100 text-blue-800",
                            order.status === "DELIVERED" && "bg-green-100 text-green-800"
                          )}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500 py-8">
                  No orders yet
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href={`/farmer/farms/${farm.id}/products`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                >
                  <span className="text-sm font-medium text-gray-900">
                    Manage Products
                  </span>
                  <Package className="h-5 w-5 text-gray-400" />
                </Link>
                <Link
                  href={`/farmer/farms/${farm.id}/products/new`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                >
                  <span className="text-sm font-medium text-gray-900">Add Product</span>
                  <Package className="h-5 w-5 text-gray-400" />
                </Link>
                <Link
                  href={`/farmer/farms/${farm.id}/orders`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                >
                  <span className="text-sm font-medium text-gray-900">View Orders</span>
                  <ShoppingBag className="h-5 w-5 text-gray-400" />
                </Link>
              </div>
            </div>

            {/* Farm Metrics */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Performance</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Inventory Value</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(inventoryValue)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Pending Orders</span>
                    <span className="font-semibold text-gray-900">{pendingOrders}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Profile Views</span>
                    <span className="font-semibold text-gray-900">
                      {farm.viewsCount || 0}
                    </span>
                  </div>
                </div>
                {farm.rating && (
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Average Rating</span>
                      <span className="font-semibold text-gray-900">
                        ⭐ {Number(farm.rating).toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Contact Information
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="mt-1 font-medium text-gray-900">{farm.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="mt-1 font-medium text-gray-900">{farm.email}</p>
                </div>
                {farm.website && (
                  <div>
                    <p className="text-gray-500">Website</p>
                    <a
                      href={farm.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 font-medium text-green-600 hover:text-green-700"
                    >
                      {farm.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
