import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Register as Farmer | Farmers Market Platform",
  description: "Join as a farmer and start selling your products",
};

/**
 * 🌾 FARMER REGISTRATION ALIAS
 * Redirects to main registration with farmer role pre-selected
 * Provides backwards compatibility for /register-farm route
 */
export default function RegisterFarmPage() {
  // Redirect to main register page with farmer role parameter
  redirect("/register?role=farmer");
}
