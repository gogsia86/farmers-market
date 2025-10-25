/**
 * FARMER ANALYTICS DASHBOARD PAGE
 * Divine agricultural business intelligence
 */

import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { SalesAnalytics } from "@/components/analytics/SalesAnalytics";
import { requireAuth } from "@/lib/auth/require-auth";
import { Suspense } from "react";

export default async function FarmerAnalyticsPage() {
  const session = await requireAuth({ role: "FARMER" });
  const farmId = session.user.farmId; // Assuming user has farmId

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Main Dashboard */}
      <Suspense fallback={<DashboardSkeleton />}>
        <AnalyticsDashboard farmId={farmId} />
      </Suspense>

      {/* Sales Details */}
      <Suspense fallback={<SalesSkeleton />}>
        <SalesAnalytics farmId={farmId} />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function SalesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export const metadata = {
  title: "Analytics Dashboard | Farmer",
  description: "Your farm performance analytics",
};
