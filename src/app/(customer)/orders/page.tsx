// src/app/(customer)/orders/page.tsx
import { OrderList } from "@/components/order/OrderList";
import { auth } from "@/lib/auth/config";
import { OrderService } from "@/lib/services/order.service";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Orders | Farmers Market",
  description: "View and manage your orders",
};

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/orders");
  }

  // Fetch customer orders
  const orders = await OrderService.getCustomerOrders(session.user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-2">
          Track and manage your orders from local farms
        </p>
      </div>

      <OrderList
        orders={orders}
        role="customer"
        emptyMessage="You haven't placed any orders yet"
      />
    </div>
  );
}
