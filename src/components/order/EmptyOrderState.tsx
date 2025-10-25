// src/components/order/EmptyOrderState.tsx
import Link from "next/link";

interface EmptyOrderStateProps {
  role: "customer" | "farmer";
}

export function EmptyOrderState({ role }: EmptyOrderStateProps) {
  if (role === "customer") {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No orders yet
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Start your journey to fresh, local produce by exploring farms and
          adding items to your cart.
        </p>
        <Link
          href="/farms"
          className="inline-block px-6 py-3 bg-agricultural-600 text-white rounded-md hover:bg-agricultural-700 font-medium"
        >
          Browse Farms
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div className="text-6xl mb-4">📦</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No orders received yet
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Orders from customers will appear here. Make sure your farm and products
        are visible to start receiving orders.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/farm/products"
          className="inline-block px-6 py-3 bg-agricultural-600 text-white rounded-md hover:bg-agricultural-700 font-medium"
        >
          Manage Products
        </Link>
        <Link
          href="/farm/profile"
          className="inline-block px-6 py-3 bg-white text-agricultural-600 border-2 border-agricultural-600 rounded-md hover:bg-agricultural-50 font-medium"
        >
          Edit Farm Profile
        </Link>
      </div>
    </div>
  );
}
