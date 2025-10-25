// src/components/order/OrderList.tsx
"use client";

import { OrderWithRelations } from "@/types/order.types";
import { OrderStatus } from "@prisma/client";
import { useState } from "react";
import { OrderCard } from "./OrderCard";

interface OrderListProps {
  orders: OrderWithRelations[];
  role?: "customer" | "farmer";
  emptyMessage?: string;
}

const statusFilters: Array<{ label: string; value: OrderStatus | "ALL" }> = [
  { label: "All Orders", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Ready", value: "READY_FOR_PICKUP" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function OrderList({
  orders,
  role = "customer",
  emptyMessage = "No orders found",
}: OrderListProps) {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (statusFilter !== "ALL" && order.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(query) ||
        (role === "customer"
          ? order.farm.name.toLowerCase().includes(query)
          : order.customer.name?.toLowerCase().includes(query))
      );
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="sr-only">
              Search orders
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
              <input
                type="text"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-agricultural-600 focus:border-agricultural-600 sm:text-sm"
                placeholder={`Search by order number${role === "customer" ? " or farm name" : " or customer name"}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === filter.value
                    ? "bg-agricultural-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
      </div>

      {/* Order List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {emptyMessage}
          </h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== "ALL"
              ? "Try adjusting your filters"
              : role === "customer"
                ? "Start shopping to place your first order"
                : "Orders will appear here once customers place them"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} role={role} />
          ))}
        </div>
      )}
    </div>
  );
}
