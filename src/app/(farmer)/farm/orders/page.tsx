// src/app/(farmer)/farm/orders/page.tsx
import { OrderList } from "@/components/order/OrderList";
import { authOptions } from "@/lib/auth/config";
import { OrderService } from "@/lib/services/order.service";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Farm Orders | Farmers Market",
  description: "Manage your farm orders",
};

export default async function FarmOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/farm/orders");
  }

  if (session.user.role !== "FARMER") {
    redirect("/");
  }

  // Get farmer's farm ID - assuming user has farmId property
  const farmId = (session.user as any).farmId;

  if (!farmId) {
    redirect("/farm/setup");
  }

  // Fetch farm orders
  const orders = await OrderService.getFarmOrders(farmId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Farm Orders</h1>
        <p className="text-gray-600 mt-2">
          Manage and fulfill orders from your customers
        </p>
      </div>

      <OrderList
        orders={orders}
        role="farmer"
        emptyMessage="No orders received yet"
      />
    </div>
  );
}
