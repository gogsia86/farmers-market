/**
 * 🌾 FARMER PRODUCTS REDIRECT PAGE
 * Simplified product management access - finds farmer's farm and redirects
 *
 * Route: /farmer/products
 * Redirects to: /farmer/farms/[farmId]/products
 *
 * This provides a simpler URL for farmers who only have one farm,
 * and enables bot compatibility with /farmer/products route.
 */

import { auth } from "@/lib/auth";
import { database } from "@/lib/database";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Product Management | Farmer Dashboard",
  description: "Manage your farm products and inventory",
};

export default async function FarmerProductsPage() {
  // Check authentication
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/farmer/products");
  }

  // Verify user is a farmer
  if (session.user.role !== "FARMER") {
    redirect("/");
  }

  // Find farmer's farm(s)
  const farms = await database.farm.findMany({
    where: {
      ownerId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      status: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 1, // Get the most recent farm
  });

  // No farms found - redirect to create farm
  if (farms.length === 0) {
    redirect("/farmer/farms/new");
  }

  // Redirect to the farm's product management page
  const farm = farms[0];
  redirect(`/farmer/farms/${farm.id}/products`);
}
