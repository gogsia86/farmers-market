/**
 * AUTOMATED SEQUENCES PAGE
 * Manage automated email sequences
 */

import { AutomatedSequencesDashboard } from "@/components/marketing/AutomatedSequencesDashboard";
import { Suspense } from "react";

export default function AutomatedSequencesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<LoadingSkeleton />}>
        <AutomatedSequencesDashboard />
      </Suspense>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export const metadata = {
  title: "Automated Email Sequences | Marketing",
  description: "Manage automated email sequences and workflows",
};
