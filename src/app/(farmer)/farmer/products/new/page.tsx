/**
 * 🌾 FARMER NEW PRODUCT PAGE
 * Simplified product creation - finds farmer's farm and shows creation form
 *
 * Route: /farmer/products/new
 *
 * This provides a simpler URL for farmers who only have one farm,
 * and enables bot compatibility with /farmer/products/new route.
 */

import { CreateProductForm } from "@/components/features/products/create-product-form";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create Product | Farmer Dashboard",
  description: "Add a new product to your farm catalog",
};

export default async function NewProductPage() {
  // Check authentication
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/farmer/products/new");
  }

  // Verify user is a farmer
  if (session.user.role !== "FARMER") {
    redirect("/");
  }

  // Find farmer's farm
  const farm = await database.farm.findFirst({
    where: {
      ownerId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      status: true,
      verificationStatus: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // No farm found - redirect to create farm
  if (!farm) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-yellow-50 p-6 text-center">
          <h2 className="text-2xl font-bold text-yellow-900">No Farm Found</h2>
          <p className="mt-2 text-yellow-700">
            You need to create a farm before adding products.
          </p>
          <Link
            href="/farmer/farms/new"
            className="mt-4 inline-block rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
          >
            Create Your Farm
          </Link>
        </div>
      </div>
    );
  }

  // Farm not verified warning
  const showVerificationWarning = farm.verificationStatus !== "VERIFIED";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/farmer/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/farmer/products" className="hover:text-gray-900">
          Products
        </Link>
        <span>/</span>
        <span className="text-gray-900">New Product</span>
      </nav>

      {/* Verification Warning */}
      {showVerificationWarning && (
        <div className="mb-6 rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Farm Pending Verification
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Your farm is currently pending verification. You can create
                  products now, but they won't be visible to customers until
                  your farm is approved by an admin.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Creation Form */}
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <CreateProductForm farmId={farm.id} farmName={farm.name} />
      </div>

      {/* Help Text */}
      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <h3 className="text-sm font-medium text-blue-900">
          💡 Tips for Creating Products
        </h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-700">
          <li>
            Use clear, descriptive names that customers can easily search for
          </li>
          <li>
            Include detailed descriptions with growing methods and
            characteristics
          </li>
          <li>Set competitive prices based on your local market</li>
          <li>Keep inventory quantities accurate to avoid overselling</li>
          <li>Add high-quality images to attract more customers</li>
          <li>Use relevant tags to improve product discoverability</li>
        </ul>
      </div>
    </div>
  );
}
