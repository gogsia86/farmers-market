/**
 * 🔄 ORDERS ROUTE - ROLE-BASED REDIRECT
 *
 * This route intelligently redirects users to their appropriate order management page
 * based on their role within the platform.
 *
 * Divine Patterns Applied:
 * - Next.js Divine Implementation (04_NEXTJS_DIVINE_IMPLEMENTATION)
 * - Single Responsibility Principle
 * - Role-Based Access Control
 *
 * Routes:
 * - FARMER → /farmer/orders (farmer order management)
 * - ADMIN → /admin/orders (admin order oversight)
 * - CONSUMER/CUSTOMER → /dashboard/orders (customer order history)
 * - Unauthenticated → /login (with callback to /orders)
 *
 * @reference .github/instructions/04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
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

  // Role-based routing with agricultural consciousness
  const userRole = session.user.role;

  switch (userRole) {
    case "FARMER":
      // Farmers manage incoming orders from their farm
      redirect("/farmer/orders");
      break;

    case "ADMIN":
    case "SUPER_ADMIN":
    case "MODERATOR":
      // Admins oversee all platform orders
      redirect("/admin/orders");
      break;

    case "CONSUMER":
    case "CUSTOMER":
      // Customers view their order history (canonical route)
      redirect("/dashboard/orders");
      break;

    default:
      // Default to customer orders for any unrecognized role
      redirect("/dashboard/orders");
  }
}
