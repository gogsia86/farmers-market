/**
 * 🌾 FARMER EDIT PRODUCT PAGE
 * Edit existing product with prepopulated form and validation
 *
 * Divine Patterns Applied:
 * - Next.js Divine Implementation (04_NEXTJS_DIVINE_IMPLEMENTATION)
 * - Agricultural Quantum Mastery (02_AGRICULTURAL_QUANTUM_MASTERY)
 * - UX Design Consciousness (08_UX_DESIGN_CONSCIOUSNESS)
 *
 * Functional Requirements: FR-003 (Farmer Management - Product Updates)
 */

import { requireFarmer } from "@/lib/auth";
import { database } from "@/lib/database";
import { notFound, redirect } from "next/navigation";
import { ProductForm } from "@/components/features/farmer/ProductForm";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: PageProps) {
  // Require farmer authentication
  const session = await requireFarmer();

  // Fetch farmer's farm
  const farm = await database.farm.findFirst({
    where: { ownerId: session.id },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });

  // Redirect if no farm
  if (!farm) {
    redirect("/register-farm");
  }

  // Fetch product with ownership verification
  const product = await database.product.findFirst({
    where: {
      id: params.id,
      farmId: farm.id, // Ensure farmer owns this product
    },
    include: {
      farm: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Return 404 if product not found or doesn't belong to farmer
  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="edit-product-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8" data-testid="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="mt-2 text-sm text-gray-600">
                Update details for{" "}
                <span className="font-medium">{product.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  product.inStock
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
                data-testid="product-stock-status"
              >
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
              {product.featured && (
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"
                  data-testid="product-featured-badge"
                >
                  Featured
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Product Images Preview */}
        {product.images && product.images.length > 0 && (
          <div className="mb-6" data-testid="product-images-preview">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200"
                  data-testid={`product-image-${index}`}
                >
                  <img
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow-sm rounded-lg">
          <ProductForm
            farmId={farm.id}
            mode="edit"
            initialData={{
              id: product.id,
              name: product.name,
              description: product.description || "",
              category: product.category as any,
              unit: product.unit as any,
              basePrice: Number(product.price),
              salePrice: product.compareAtPrice
                ? Number(product.compareAtPrice)
                : 0,
              quantity: product.quantityAvailable
                ? Number(product.quantityAvailable)
                : 0,
              lowStockThreshold: product.lowStockThreshold
                ? Number(product.lowStockThreshold)
                : 10,
              organic: product.organic,
              seasonal: product.seasonal,
              locallyGrown: true, // Default value
              inStock: product.inStock,
              featured: product.featured,
              weight: 0, // Default value
              certifications: "",
              allergens: "",
              storageInstructions: product.storageInstructions || "",
              images: product.images || [],
            }}
          />
        </div>

        {/* Product Metadata */}
        <div
          className="mt-6 bg-white shadow-sm rounded-lg p-6"
          data-testid="product-metadata"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Product Information
          </h2>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Product ID</dt>
              <dd
                className="mt-1 text-sm text-gray-900"
                data-testid="product-id"
              >
                {product.id}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd
                className="mt-1 text-sm text-gray-900"
                data-testid="product-category"
              >
                {product.category}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Unit</dt>
              <dd
                className="mt-1 text-sm text-gray-900"
                data-testid="product-unit"
              >
                {product.unit}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd
                className="mt-1 text-sm text-gray-900"
                data-testid="product-created-date"
              >
                {new Date(product.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Last Updated
              </dt>
              <dd
                className="mt-1 text-sm text-gray-900"
                data-testid="product-updated-date"
              >
                {new Date(product.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
            {product.slug && (
              <div>
                <dt className="text-sm font-medium text-gray-500">URL Slug</dt>
                <dd
                  className="mt-1 text-sm text-gray-900"
                  data-testid="product-slug"
                >
                  {product.slug}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
