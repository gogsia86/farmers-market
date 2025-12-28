/**
 * 🌾 FARMER NEW PRODUCT PAGE
 * Create new product with comprehensive form and validation
 *
 * Divine Patterns Applied:
 * - Next.js Divine Implementation (04_NEXTJS_DIVINE_IMPLEMENTATION)
 * - Agricultural Quantum Mastery (02_AGRICULTURAL_QUANTUM_MASTERY)
 * - UX Design Consciousness (08_UX_DESIGN_CONSCIOUSNESS)
 *
 * Functional Requirements: FR-003 (Farmer Management - Product Creation)
 */

import { requireFarmer } from "@/lib/auth";
import { database } from "@/lib/database";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/features/farmer/ProductForm";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewProductPage() {
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

  // Check if farm is active
  if (farm.status !== "ACTIVE") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div
            className="bg-yellow-50 border-l-4 border-yellow-400 p-4"
            data-testid="farm-pending-alert"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
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
                  Farm Not Active
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Your farm is currently {farm.status.toLowerCase()}. You'll
                    be able to add products once your farm is active.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="new-product-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8" data-testid="page-header">
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create a new product for {farm.name}. Fill in all required fields to
            list your product.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow-sm rounded-lg">
          <ProductForm farmId={farm.id} mode="create" />
        </div>
      </div>
    </div>
  );
}
