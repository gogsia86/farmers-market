import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import { FinancialOverview } from "@/components/farmer/FinancialOverview";

export const metadata: Metadata = {
  title: "Finances | Farmer Dashboard",
  description: "Manage your farm finances, revenue, and transactions",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FarmerFinancesPage() {
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
    },
  });

  if (!farm) {
    redirect("/register-farm");
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
              Your farm is currently under review. Financial features will be
              available once your farm is approved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FinancialOverview farmId={farm.id} />
    </div>
  );
}
