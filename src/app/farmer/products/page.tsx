/**
 * 🌾 FARMER PRODUCTS MANAGEMENT PAGE
 * Complete product inventory management for farmers
 *
 * Divine Patterns Applied:
 * - Next.js Divine Implementation (04_NEXTJS_DIVINE_IMPLEMENTATION)
 * - Agricultural Quantum Mastery (02_AGRICULTURAL_QUANTUM_MASTERY)
 * - Security Divinity (05_TESTING_SECURITY_DIVINITY)
 *
 * Functional Requirements: FR-003 (Farmer Management)
 */

import { requireFarmer } from "@/lib/auth";
import { database } from "@/lib/database";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  lowStock: number;
}

export default async function FarmerProductsPage() {
  // Require farmer authentication
  const session = await requireFarmer();

  // Fetch farmer's farm
  const farm = await database.farm.findFirst({
    where: { ownerId: session.id },
  });

  // Redirect if no farm
  if (!farm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              No Farm Found
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Please create a farm before managing products.
            </p>
            <Link
              href="/register-farm"
              className="inline-flex items-center px-6 py-3 bg-agricultural-600 text-white font-medium rounded-lg hover:bg-agricultural-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Your Farm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fetch all products for this farm
  const products = await database.product.findMany({
    where: { farmId: farm.id },
    orderBy: { createdAt: "desc" },
  });

  // Calculate product statistics
  const stats: ProductStats = {
    total: products.length,
    active: products.filter((p) => p.inStock && p.status === "ACTIVE").length,
    inactive: products.filter((p) => !p.inStock || p.status !== "ACTIVE")
      .length,
    lowStock: products.filter(
      (p) => p.quantityAvailable !== null && Number(p.quantityAvailable) < 10,
    ).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-3xl font-bold text-gray-900"
                data-testid="products-page-heading"
              >
                📦 Product Management
              </h1>
              <p className="mt-1 text-gray-600" data-testid="farm-name">
                {farm.name}
              </p>
            </div>
            <Link
              href="/farmer/products/new"
              className="inline-flex items-center px-4 py-2 bg-agricultural-600 text-white font-medium rounded-lg hover:bg-agricultural-700 transition-colors"
              data-testid="add-product-button"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New Product
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          data-testid="product-stats"
        >
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Products
                </p>
                <p
                  className="text-3xl font-bold text-gray-900 mt-2"
                  data-testid="stat-total"
                >
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Products
                </p>
                <p
                  className="text-3xl font-bold text-green-600 mt-2"
                  data-testid="stat-active"
                >
                  {stats.active}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <EyeIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Inactive Products
                </p>
                <p
                  className="text-3xl font-bold text-gray-600 mt-2"
                  data-testid="stat-inactive"
                >
                  {stats.inactive}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <EyeSlashIcon className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p
                  className="text-3xl font-bold text-yellow-600 mt-2"
                  data-testid="stat-low-stock"
                >
                  {stats.lowStock}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Products
            </h2>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-state">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No products yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first product.
              </p>
              <div className="mt-6">
                <Link
                  href="/farmer/products/new"
                  className="inline-flex items-center px-4 py-2 bg-agricultural-600 text-white font-medium rounded-lg hover:bg-agricultural-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Product
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table
                className="min-w-full divide-y divide-gray-200"
                data-testid="products-table"
              >
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50"
                      data-testid="product-row"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.primaryPhotoUrl ? (
                            <div className="flex-shrink-0 h-10 w-10 relative">
                              <Image
                                src={product.primaryPhotoUrl}
                                alt={product.name}
                                fill
                                className="rounded-lg object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <svg
                                className="h-6 w-6 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                          <div className="ml-4">
                            <div
                              className="text-sm font-medium text-gray-900"
                              data-testid="product-name"
                            >
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.unit}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.category
                            .replace(/_/g, " ")
                            .toLowerCase()
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="text-sm font-medium text-gray-900"
                          data-testid="product-price"
                        >
                          ${product.price.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.quantityAvailable !== null ? (
                          <div
                            className={`text-sm font-medium ${
                              Number(product.quantityAvailable) < 10
                                ? "text-yellow-600"
                                : "text-gray-900"
                            }`}
                            data-testid="product-stock"
                          >
                            {Number(product.quantityAvailable)}
                            {Number(product.quantityAvailable) < 10 && (
                              <span className="ml-1 text-xs">(Low)</span>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            Not tracked
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.inStock && product.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                          data-testid="product-status"
                        >
                          {product.inStock && product.status === "ACTIVE"
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <Link
                            href={`/farmer/products/${product.id}`}
                            className="text-agricultural-600 hover:text-agricultural-900"
                            data-testid="edit-product-button"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            className="text-red-600 hover:text-red-900"
                            data-testid="delete-product-button"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8">
          <Link
            href="/farmer/dashboard"
            className="inline-flex items-center text-agricultural-600 hover:text-agricultural-700 font-medium"
            data-testid="back-to-dashboard"
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
