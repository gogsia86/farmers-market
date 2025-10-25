// src/app/(customer)/orders/[id]/page.tsx
import { OrderDetail } from "@/components/order/OrderDetail";
import { auth } from "@/lib/auth/config";
import { OrderService } from "@/lib/services/order.service";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const order = await OrderService.getOrderById(params.id);

  if (!order) {
    return {
      title: "Order Not Found | Farmers Market",
    };
  }

  return {
    title: `Order #${order.orderNumber} | Farmers Market`,
    description: `View details for order #${order.orderNumber}`,
  };
}

export default async function OrderDetailPage({ params }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/orders/${params.id}`);
  }

  const order = await OrderService.getOrderById(params.id);

  if (!order) {
    notFound();
  }

  // Ensure user owns this order
  if (order.customerId !== session.user.id) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <OrderDetail order={order} role="customer" />
    </div>
  );
}
