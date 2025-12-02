import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { PayoutManagement } from "@/components/farmer/PayoutManagement";

export const metadata: Metadata = {
  title: "Payouts | Farmer Dashboard",
  description: "Manage your payout accounts and schedule",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FarmerPayoutsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "FARMER") {
    redirect("/dashboard");
  }

  // Get farmer's farm
  const farm = await database.farm.findFirst({
    where: {
      ownerId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      status: true,
      stripeAccountId: true,
    },
  });

  if (!farm) {
    redirect("/farmer/onboarding");
  }

  if (farm.status !== "ACTIVE") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <h2 className="text-2xl font-bold text-yellow-900 mb-2">
              Farm Verification Pending
            </h2>
            <p className="text-yellow-800">
              Your farm is currently under review. Payout features will be
              available once your farm is approved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if Stripe Connect is set up
  if (!farm.stripeAccountId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="p-8 bg-blue-50 border-2 border-blue-200 rounded-lg text-center">
            <div className="mb-6">
              <svg
                className="w-16 h-16 text-blue-600 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-3">
              Connect Your Bank Account
            </h2>
            <p className="text-blue-800 mb-6">
              To receive payouts, you need to connect your bank account through
              Stripe Connect. This is a secure process that takes just a few
              minutes.
            </p>
            <form action="/api/farmer/stripe/connect" method="POST">
              <input type="hidden" name="farmId" value={farm.id} />
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Connect with Stripe
              </button>
            </form>
            <p className="text-xs text-blue-600 mt-4">
              Powered by Stripe • Your data is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PayoutManagement farmId={farm.id} />
    </div>
  );
}
