import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Register Your Farm | Farmers Market",
  description:
    "Join our platform to sell your fresh produce directly to local customers. Create your farm profile and start selling today.",
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
