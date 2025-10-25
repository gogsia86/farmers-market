/**
 * FARMER REPORTS PAGE
 * Divine agricultural report generation
 */

import { ReportGenerator } from "@/components/reports/ReportGenerator";
import { ScheduledReports } from "@/components/reports/ScheduledReports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAuth } from "@/lib/auth/require-auth";
import { Suspense } from "react";

export default async function FarmerReportsPage() {
  const session = await requireAuth({ role: "FARMER" });
  const farmId = session.user.farmId;

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <Suspense fallback={<GeneratorSkeleton />}>
            <ReportGenerator farmId={farmId} />
          </Suspense>
        </TabsContent>

        <TabsContent value="scheduled">
          <Suspense fallback={<ScheduledSkeleton />}>
            <ScheduledReports farmId={farmId} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GeneratorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function ScheduledSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export const metadata = {
  title: "Reports | Farmer",
  description: "Generate and schedule farm reports",
};
