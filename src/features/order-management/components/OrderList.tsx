// ============================================================================
// DIVINE ORDER LIST COMPONENT
// Agricultural Quantum Order Grid with Filtering & Consciousness
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import { OrderCard } from "./OrderCard";
import type { OrderWithRelations, OrderFilterOptions } from "../types";
import type { OrderStatus } from "@prisma/client";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

// ============================================================================
// PROPS INTERFACE
// ============================================================================

export interface OrderListProps {
  orders?: OrderWithRelations[];
  isLoading?: boolean;
  variant?: "customer" | "farmer" | "admin";
  filters?: OrderFilterOptions;
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  onFilterChange?: (filters: OrderFilterOptions) => void;
  onPageChange?: (page: number) => void;
  onViewDetails?: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
  onMessage?: (orderId: string) => void;
  onUpdateStatus?: (orderId: string, status: OrderStatus) => void;
  emptyMessage?: string;
  className?: string;
}

// ============================================================================
// ORDER LIST COMPONENT
// ============================================================================

export function OrderList({
  orders = [],
  isLoading = false,
  variant = "customer",
  filters = {},
  pagination,
  onFilterChange,
  onPageChange,
  onViewDetails,
  onCancel,
  onMessage,
  onUpdateStatus,
  emptyMessage = "No orders found",
  className,
}: OrderListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<OrderFilterOptions>(filters);
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || "");

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
    setSearchQuery(filters.searchQuery || "");
  }, [filters]);

  // Handle filter change
  const handleFilterChange = (
    key: keyof OrderFilterOptions,
    value: unknown,
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // Handle search
  const handleSearch = () => {
    handleFilterChange("searchQuery", searchQuery);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    const clearedFilters: OrderFilterOptions = {
      page: 1,
      pageSize: filters.pageSize || 20,
    };
    setLocalFilters(clearedFilters);
    setSearchQuery("");
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  // Check if filters are active
  const hasActiveFilters = Object.keys(localFilters).some(
    (key) =>
      key !== "page" &&
      key !== "pageSize" &&
      key !== "sortBy" &&
      key !== "sortOrder" &&
      localFilters[key as keyof OrderFilterOptions] !== undefined,
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Orders</h2>
              <p className="text-sm text-gray-600">
                {pagination
                  ? `Showing ${orders.length} of ${pagination.totalCount} orders`
                  : `${orders.length} orders`}
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium",
                showFilters
                  ? "bg-blue-600 text-white"
                  : "bg-white border hover:bg-gray-50",
              )}
            >
              🔍 Filters
            </button>
          </div>
        </CardHeader>

        {/* Filters Panel */}
        {showFilters && (
          <CardBody className="border-t">
            <div className="space-y-4">
              {/* Search */}
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  Search
                </label>
                <div className="flex gap-2">
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by order number, customer, farm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Search
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Status
                  </label>
                  <select
                    id="status"
                    value={(localFilters.status as string) || "all"}
                    onChange={(e) =>
                      handleFilterChange(
                        "status",
                        e.target.value === "all" ? undefined : e.target.value,
                      )
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="READY">Ready</option>
                    <option value="FULFILLED">Fulfilled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                {/* Payment Status Filter */}
                <div className="space-y-2">
                  <label
                    htmlFor="paymentStatus"
                    className="text-sm font-medium"
                  >
                    Payment Status
                  </label>
                  <select
                    id="paymentStatus"
                    value={(localFilters.paymentStatus as string) || "all"}
                    onChange={(e) =>
                      handleFilterChange(
                        "paymentStatus",
                        e.target.value === "all" ? undefined : e.target.value,
                      )
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Payment Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SUCCEEDED">Succeeded</option>
                    <option value="FAILED">Failed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                {/* Fulfillment Method Filter */}
                <div className="space-y-2">
                  <label
                    htmlFor="fulfillmentMethod"
                    className="text-sm font-medium"
                  >
                    Fulfillment Method
                  </label>
                  <select
                    id="fulfillmentMethod"
                    value={(localFilters.fulfillmentMethod as string) || "all"}
                    onChange={(e) =>
                      handleFilterChange(
                        "fulfillmentMethod",
                        e.target.value === "all" ? undefined : e.target.value,
                      )
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Methods</option>
                    <option value="DELIVERY">Delivery</option>
                    <option value="PICKUP">Pickup</option>
                    <option value="SHIPPING">Shipping</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <label htmlFor="sortBy" className="text-sm font-medium">
                    Sort By
                  </label>
                  <select
                    id="sortBy"
                    value={localFilters.sortBy || "createdAt"}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="updatedAt">Date Updated</option>
                    <option value="total">Total Amount</option>
                    <option value="status">Status</option>
                    <option value="scheduledDate">Scheduled Date</option>
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={handleClearFilters}
                  disabled={!hasActiveFilters}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ❌ Clear Filters
                </button>
                {hasActiveFilters && (
                  <span className="text-sm text-gray-600">Filters active</span>
                )}
              </div>
            </div>
          </CardBody>
        )}
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mt-2" />
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="h-20 w-full bg-gray-200 animate-pulse rounded" />
                <div className="h-20 w-full bg-gray-200 animate-pulse rounded" />
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && orders.length === 0 && (
        <Card>
          <CardBody className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
            <p className="text-gray-600 text-center max-w-sm">{emptyMessage}</p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 border rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                Clear Filters
              </button>
            )}
          </CardBody>
        </Card>
      )}

      {/* Order Cards Grid */}
      {!isLoading && orders.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              variant={variant}
              onViewDetails={onViewDetails}
              onCancel={onCancel}
              onMessage={onMessage}
              onUpdateStatus={onUpdateStatus}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination && pagination.totalPages > 1 && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    onPageChange && onPageChange(pagination.page - 1)
                  }
                  disabled={!pagination.hasPrevious}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  ← Previous
                </button>
                <button
                  onClick={() =>
                    onPageChange && onPageChange(pagination.page + 1)
                  }
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Next →
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// DIVINE ORDER LIST - AGRICULTURAL CONSCIOUSNESS
// Complete order management with quantum filtering and pagination
// ============================================================================
