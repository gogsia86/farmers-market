/**
 * 🌾 ADMIN PRODUCTS MANAGEMENT PAGE
 * Divine Agricultural Platform - Product Management
 */

import { requireAdmin } from "@/lib/auth";
import { database } from "@/lib/database";
import {
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();

  // Fetch products with related data
  const [products, stats] = await Promise.all([
    database.product.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
    database.product.groupBy({
      by: ["status"],
      _count: true,
      _avg: {
        price: true,
      },
    }),
  ]);

  const statusStats = stats.reduce(
    (acc, stat) => {
      acc[stat.status] = stat._count;
      return acc;
    },
    {} as Record<string, number>,
  );

  const totalProducts = products.length;
  const activeProducts = statusStats.ACTIVE || 0;
  const draftProducts = statusStats.DRAFT || 0;
  const outOfStock = statusStats.OUT_OF_STOCK || 0;

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
              <ShoppingBagIcon className="h-8 w-8 mr-3 text-green-600" />
              Product Management
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage product listings, inventory, and pricing • Total:{" "}
              {totalProducts} products
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5 mr-2 text-gray-400" />
              Filter
            </button>
            <Link
              href="/admin/products/new"
              className="ml-3 inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Product
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Products
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {totalProducts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {activeProducts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Draft
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {draftProducts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Out of Stock
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {outOfStock}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-3 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
            placeholder="Search products by name, SKU, or category..."
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Product Image */}
            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-200">
              {product.images &&
              product.images.length > 0 &&
              product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex items-center justify-center h-48 bg-gray-100">
                  <ShoppingBagIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    product.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : product.status === "DRAFT"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.status}
                </span>
                <span className="text-xs text-gray-500">
                  {product.category}
                </span>
              </div>

              <h3 className="text-sm font-medium text-gray-900 mb-1 truncate">
                {product.name}
              </h3>

              <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                {product.description || "No description"}
              </p>

              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-gray-500">/{product.unit}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Stock: {product.quantityAvailable?.toNumber() || 0}
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                {product.farm?.name || "Unknown Farm"}
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="flex-1 text-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  View
                </Link>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="flex-1 text-center rounded-md bg-green-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No products
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first product.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Product
            </Link>
          </div>
        </div>
      )}

      {/* Pagination */}
      {products.length > 0 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow">
          <div className="flex flex-1 justify-between sm:hidden">
            <button className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Previous
            </button>
            <button className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{products.length}</span> of{" "}
                <span className="font-medium">{totalProducts}</span> results
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                  <span className="sr-only">Previous</span>←
                </button>
                <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-green-600 ring-1 ring-inset ring-green-600">
                  1
                </button>
                <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                  <span className="sr-only">Next</span>→
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
