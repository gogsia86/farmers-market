/**
 * 🌟 Farm Creation Page - Divine Agricultural Interface
 * Complete form for creating new farm profiles
 * Following: 10_AGRICULTURAL_FEATURE_PATTERNS & 08_UX_DESIGN_CONSCIOUSNESS
 */

import { CreateFarmForm } from "@/components/features/farms/create-farm-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create Farm | Farmers Market Platform",
  description: "Register your farm on the platform",
};

export default async function CreateFarmPage() {
  const session = await auth();

  // Check authentication
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/farmer/farms/new");
  }

  // Check authorization - only farmers can create farms
  if (session.user.role !== "FARMER") {
    redirect("/");
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create Your Farm</h1>
        <p className="text-muted-foreground text-lg">
          Share your farm with the community and start selling your products
        </p>
      </div>

      <Card variant="agricultural" className="mb-8">
        <CardHeader>
          <CardTitle>🌾 Farm Information</CardTitle>
          <CardDescription>
            Provide details about your farm. This information will be visible to
            customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateFarmForm userId={session.user.id} />
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          📋 What happens next?
        </h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li className="flex items-start">
            <span className="mr-2">1.</span>
            <span>Your farm will be submitted for verification</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">2.</span>
            <span>
              Our team will review your information (usually within 24-48 hours)
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">3.</span>
            <span>Once verified, your farm will be visible to customers</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">4.</span>
            <span>You can then add products and start selling!</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
