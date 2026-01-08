/**
 * 🌾 FARMER PRODUCT MANAGEMENT PAGE
 * Divine product management dashboard with agricultural consciousness
 *
 * Features:
 * - List all products for a farm
 * - Quick actions (edit, delete, toggle status)
 * - Product metrics and inventory status
 * - Filtering and sorting
 * - Server Component with real-time data
 * - Responsive grid layout
 *
 * Route: /farmer/farms/[farmId]/products
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { productService } from "@/lib/services/product.service";
import Link from "next/link";
import { redirect } from "next/navigation";

/**
 * 🌱 PAGE PROPS
 */
interface PageProps {
  params: Promise<{
    farmId: string;
  }>;
  searchParams: Promise<{
    status?: string;
    category?: string;
  }>;
}

/**
 * 🌾 PRODUCT MANAGEMENT PAGE
 */
export default async function ProductsManagementPage({
  params,
  searchParams,
}: PageProps) {
  // Await params and searchParams (Next.js 15+)
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Authentication check
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/farmer/farms");
  }

  // Fetch farm and verify ownership
  const farm = await database.farm.findUnique({
    where: { id: resolvedParams.farmId },
    select: {
      id: true,
      name: true,
      slug: true,
      ownerId: true,
      status: true,
      verificationStatus: true,
      teamMembers: {
        where: { userId: session.user.id },
        select: { id: true, role: true },
      },
    },
  });

  // Farm not found
  if (!farm) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <h2 className="text-2xl font-bold text-red-900">Farm Not Found</h2>
          <p className="mt-2 text-red-700">
            The farm you're trying to manage doesn't exist.
          </p>
          <Link
            href="/farmer/farms"
            className="mt-4 inline-block rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Back to Farms
          </Link>
        </div>
      </div>
    );
  }

  // Authorization check
  const isOwner = farm.ownerId === session.user.id;
  const isTeamMember = farm.teamMembers.length > 0;
  const hasAccess = isOwner || isTeamMember;

  if (!hasAccess) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-yellow-50 p-6 text-center">
          <h2 className="text-2xl font-bold text-yellow-900">Access Denied</h2>
          <p className="mt-2 text-yellow-700">
            You don't have permission to manage this farm's products.
          </p>
          <Link
            href="/farmer/farms"
            className="mt-4 inline-block rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
          >
            Back to Farms
          </Link>
        </div>
      </div>
    );
  }

  // Fetch products for this farm
  const { products, total } = await productService.getProductsByFarm(
    resolvedParams.farmId,
    {
      status: resolvedSearchParams.status as any,
      category: resolvedSearchParams.category as any,
      limit: 100,
    }
  );

  // Calculate summary stats
  const activeProducts = products.filter((p) => p.status === "ACTIVE").length;
  const outOfStock = products.filter((p) => p.status === "OUT_OF_STOCK").length;
  const totalInventoryValue = products.reduce((sum, p) => {
    const qty = p.quantityAvailable ? Number(p.quantityAvailable) : 0;
    const price = Number(p.price);
    return sum + qty * price;
  }, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="mb-4 flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/farmer/farms" className="hover:text-gray-900">
            Farms
          </Link>
          <span>/</span>
          <Link
            href={`/farmer/farms/${farm.id}`}
            className="hover:text-gray-900"
          >
            {farm.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">Products</span>
        </nav>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🌱 Product Catalog
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your farm's products and inventory
            </p>
          </div>
          <Link
            href={`/farmer/farms/${farm.id}/products/new`}
            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Total Products
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {total}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Active Products
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-green-600">
            {activeProducts}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Out of Stock
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-red-600">
            {outOfStock}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Inventory Value
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            ${totalInventoryValue.toFixed(2)}
          </dd>
        </div>
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="rounded-lg bg-white p-12 text-center shadow">
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
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No products yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first product to the catalog.
          </p>
          <div className="mt-6">
            <Link
              href={`/farmer/farms/${farm.id}/products/new`}
              className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
            >
              <svg
                className="-ml-0.5 mr-1.5 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Add First Product
            </Link>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const quantity = product.quantityAvailable
              ? Number(product.quantityAvailable)
              : 0;
            const lowStock = quantity > 0 && quantity < 10;

            return (
              <div
                key={product.id}
                className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5 transition hover:shadow-md"
              >
                {/* Product Image */}
                <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0] as string}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <svg
                        className="h-16 w-16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute left-2 top-2">
                    {product.status === "ACTIVE" && (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                        Active
                      </span>
                    )}
                    {product.status === "OUT_OF_STOCK" && (
                      <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                        Out of Stock
                      </span>
                    )}
                    {product.status === "ARCHIVED" && (
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
                        Archived
                      </span>
                    )}
                  </div>

                  {/* Organic Badge */}
                  {product.organic && (
                    <div className="absolute right-2 top-2">
                      <span className="inline-flex rounded-full bg-green-600 px-2 py-1 text-xs font-semibold text-white">
                        🌿 Organic
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                    {product.description}
                  </p>

                  {/* Price and Unit */}
                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      <span className="ml-1 text-sm text-gray-500">
                        / {product.unit}
                      </span>
                    </div>
                  </div>

                  {/* Inventory */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Inventory:</span>
                      <span
                        className={`font-medium ${quantity === 0
                          ? "text-red-600"
                          : lowStock
                            ? "text-yellow-600"
                            : "text-gray-900"
                          }`}
                      >
                        {quantity} {product.unit}
                      </span>
                    </div>
                    {lowStock && (
                      <p className="mt-1 text-xs text-yellow-600">
                        ⚠️ Low stock warning
                      </p>
                    )}
                  </div>

                  {/* Metrics */}
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-gray-200 pt-3">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Views</div>
                      <div className="mt-1 text-sm font-semibold text-gray-900">
                        {product.viewsCount || 0}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Cart Adds</div>
                      <div className="mt-1 text-sm font-semibold text-gray-900">
                        {product.cartAddsCount || 0}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Sales</div>
                      <div className="mt-1 text-sm font-semibold text-gray-900">
                        {product.purchaseCount || 0}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/farmer/farms/${farm.id}/products/${product.id}/edit`}
                      className="flex-1 rounded-md bg-gray-100 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-200"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/products/${product.slug}`}
                      target="_blank"
                      className="flex-1 rounded-md bg-green-100 px-3 py-2 text-center text-sm font-medium text-green-700 hover:bg-green-200"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * 📄 METADATA
 */
export const metadata = {
  title: "Product Management | Farmer Dashboard",
  description: "Manage your farm's product catalog and inventory",
};
