// src/components/order/OrderActions.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface OrderActionsProps {
  orderId: string;
  currentStatus: string;
  role: "customer" | "farmer";
}

export function OrderActions({
  orderId,
  currentStatus,
  role,
}: OrderActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateOrderStatus = async (newStatus: string) => {
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update order");
      }

      toast.success("Order status updated successfully");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update order"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel order");
      }

      toast.success("Order cancelled successfully");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel order"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (role === "farmer" && currentStatus !== "DELIVERED") {
    return (
      <div className="space-y-2">
        {currentStatus === "PENDING" && (
          <button
            onClick={() => updateOrderStatus("CONFIRMED")}
            disabled={isUpdating}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Confirm Order
          </button>
        )}

        {currentStatus === "CONFIRMED" && (
          <button
            onClick={() => updateOrderStatus("PREPARING")}
            disabled={isUpdating}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            Start Preparing
          </button>
        )}

        {currentStatus === "PREPARING" && (
          <button
            onClick={() => updateOrderStatus("READY")}
            disabled={isUpdating}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Mark as Ready
          </button>
        )}

        {currentStatus === "READY" && (
          <button
            onClick={() => updateOrderStatus("FULFILLED")}
            disabled={isUpdating}
            className="w-full px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:opacity-50"
          >
            Mark as Fulfilled
          </button>
        )}

        {currentStatus === "FULFILLED" && (
          <button
            onClick={() => updateOrderStatus("COMPLETED")}
            disabled={isUpdating}
            className="w-full px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-900 disabled:opacity-50"
          >
            Complete Order
          </button>
        )}

        <button
          onClick={cancelOrder}
          disabled={isUpdating}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          Cancel Order
        </button>
      </div>
    );
  }

  if (
    role === "customer" &&
    currentStatus !== "DELIVERED" &&
    currentStatus !== "CANCELLED"
  ) {
    return (
      <button
        onClick={cancelOrder}
        disabled={isUpdating}
        className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
      >
        Cancel Order
      </button>
    );
  }

  return null;
}
