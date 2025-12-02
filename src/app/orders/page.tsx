/**
 * 🔄 ORDERS ROUTE - ROLE-BASED REDIRECT
 *
 * This route intelligently redirects users to their appropriate order management page
 * based on their role within the platform.
 *
 * Routes:
 * - FARMER → /farmer/orders (farmer order management)
 * - ADMIN → /admin/orders (admin order oversight)
 * - CONSUMER/CUSTOMER → /account/orders (customer order history)
 * - Unauthenticated → /login (with callback to /orders)
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
  // Get current session
  const session = await auth();

  // Redirect unauthenticated users to login
  if (!session?.user) {
    redirect("/login?callbackUrl=/orders");
  }

  // Role-based routing
  switch (session.user.role) {
    case "FARMER":
      // Farmers manage orders they've received
      redirect("/farmer/orders");

    case "ADMIN":
      // Admins oversee all platform orders
      redirect("/admin/orders");

    case "CONSUMER":
    case "CUSTOMER":
      // Customers view their order history
      redirect("/account/orders");

    default:
      // Default to customer orders for any other role
      redirect("/account/orders");
  }
}
