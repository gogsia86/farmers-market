/**
 * 🌾 FARMER PRODUCT CREATION PAGE
 * Divine product creation page with agricultural consciousness
 *
 * Features:
 * - Server Component for data fetching
 * - Farm verification and authorization
 * - Product creation form integration
 * - Type-safe params handling
 * - Error boundaries
 *
 * Route: /farmer/farms/[farmId]/products/new
 */

import { CreateProductForm } from "@/components/features/products/create-product-form";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { redirect } from "next/navigation";

/**
 * 🌱 PAGE PROPS
 */
interface PageProps {
  params: Promise<{
    farmId: string;
  }>;
}

/**
 * 🌾 NEW PRODUCT PAGE
 */
export default async function NewProductPage({ params }: PageProps) {
  // Await params in Next.js 15 (params is now a Promise)
  const { farmId } = await params;

  // Authentication check
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/farmer/farms");
  }

  // Fetch farm and verify ownership
  const farm = await database.farm.findUnique({
    where: { id: farmId },
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
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <h2 className="text-2xl font-bold text-red-900">Farm Not Found</h2>
          <p className="mt-2 text-red-700">
            The farm you're trying to add products to doesn't exist.
          </p>
          <a
            href="/farmer/farms"
            className="mt-4 inline-block rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Back to Farms
          </a>
        </div>
      </div>
    );
  }

  // Authorization check - user must be farm owner or team member
  const isOwner = farm.ownerId === session.user.id;
  const isTeamMember = farm.teamMembers.length > 0;
  const hasAccess = isOwner || isTeamMember;

  if (!hasAccess) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-yellow-50 p-6 text-center">
          <h2 className="text-2xl font-bold text-yellow-900">
            Access Denied
          </h2>
          <p className="mt-2 text-yellow-700">
            You don't have permission to add products to this farm.
          </p>
          <a
            href="/farmer/farms"
            className="mt-4 inline-block rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
          >
            Back to Farms
          </a>
        </div>
      </div>
    );
  }

  // Farm status check
  if (farm.status === "SUSPENDED" || farm.status === "INACTIVE") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-yellow-50 p-6 text-center">
          <h2 className="text-2xl font-bold text-yellow-900">
            Farm Inactive
          </h2>
          <p className="mt-2 text-yellow-700">
            You cannot add products to an inactive or suspended farm. Please
            contact support if you believe this is an error.
          </p>
          <a
            href={`/farmer/farms/${farm.id}`}
            className="mt-4 inline-block rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
          >
            Back to Farm
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-600">
        <a href="/farmer/farms" className="hover:text-gray-900">
          Farms
        </a>
        <span>/</span>
        <a
          href={`/farmer/farms/${farm.id}/products`}
          className="hover:text-gray-900"
        >
          {farm.name}
        </a>
        <span>/</span>
        <span className="text-gray-900">New Product</span>
      </nav>

      {/* Verification Warning */}
      {farm.verificationStatus !== "VERIFIED" && (
        <div className="mb-6 rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Farm Pending Verification
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Your farm is pending verification. You can add products now,
                  but they will only be visible to customers once your farm is
                  verified.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Creation Form */}
      <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5">
        <div className="p-6">
          <CreateProductForm farmId={farm.id} farmName={farm.name} />
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 rounded-md bg-gray-50 p-4">
        <h3 className="text-sm font-medium text-gray-900">
          💡 Tips for Creating Great Products
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-gray-600">
          <li>
            • Use clear, descriptive names that customers will search for
          </li>
          <li>
            • Include detailed descriptions about taste, growing methods, and
            uses
          </li>
          <li>• Add high-quality images to showcase your products</li>
          <li>
            • Set accurate quantities to avoid overselling and disappointing
            customers
          </li>
          <li>
            • Use tags like "heirloom", "seasonal", "local" to improve
            discoverability
          </li>
          <li>
            • Keep storage instructions clear and practical for your customers
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * 📄 METADATA
 */
export const metadata = {
  title: "Add New Product | Farmer Dashboard",
  description: "Add a new product to your farm catalog",
};
