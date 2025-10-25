/**
 * FARM CREATION FORM PAGE - DIVINE AGRICULTURAL INTERFACE
 *
 * Manifest new farm entities through guided consciousness input.
 * Server component that renders client-side form with real-time validation.
 *
 * Divine Patterns Applied:
 * - Server Components (Next.js 14+)
 * - Client-side form validation
 * - Agricultural consciousness guidance
 * - Enlightening error handling
 *
 * Functional Requirements: FR-011 (Farm Profile Creation)
 *
 * @route /dashboard/farm/new
 * @access Private (FARMER role only)
 */

import { FarmCreationForm } from "@/components/farm/FarmCreationForm";
import { auth } from "@/lib/auth";
import { checkExistingFarm } from "@/lib/services/farm.service";
import type { UserId } from "@/types/farm.types";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Create Farm Profile | Farmers Market",
  description: "Register your farm on the divine agricultural platform",
};

export default async function CreateFarmPage() {
  // ========================================================================
  // AUTHENTICATION - VERIFY DIVINE IDENTITY
  // ========================================================================

  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard/farm/new");
  }

  if (session.user.role !== "FARMER") {
    redirect("/dashboard?error=farmer_only");
  }

  // ========================================================================
  // CHECK EXISTING FARM
  // ========================================================================

  const existingCheck = await checkExistingFarm(session.user.id as UserId);

  if (existingCheck.exists && existingCheck.farm) {
    // Farmer already has a farm - redirect to edit page
    redirect(`/dashboard/farm/${existingCheck.farm.slug}/edit`);
  }

  // ========================================================================
  // RENDER FARM CREATION FORM
  // ========================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-agricultural-50 via-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌾 Create Your Farm Profile
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome to the divine agricultural marketplace! Let&apos;s manifest
            your farm&apos;s quantum presence and connect you with conscious
            consumers.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-agricultural-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-agricultural-600">
                Farm Details
              </span>
            </div>
            <div className="w-16 h-1 bg-gray-300" />
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">
                Products
              </span>
            </div>
            <div className="w-16 h-1 bg-gray-300" />
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">
                Payments
              </span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-agricultural-200 overflow-hidden">
          <div className="bg-gradient-to-r from-agricultural-600 to-green-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">
              Step 1: Tell Us About Your Farm
            </h2>
            <p className="text-agricultural-100 mt-2">
              Share your farm&apos;s story, location, and practices
            </p>
          </div>

          <div className="px-8 py-10">
            <FarmCreationForm userId={session.user.id} />
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <span aria-label="Tip icon">💡</span>
            <span>Tips for Success</span>
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Be descriptive:</strong> Tell your unique story to
                connect with customers
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Location accuracy:</strong> Precise coordinates help
                customers find you and calculate delivery
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Farming practices:</strong> Highlight organic,
                biodynamic, or sustainable methods
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Contact info:</strong> Make it easy for customers to
                reach you with questions
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
