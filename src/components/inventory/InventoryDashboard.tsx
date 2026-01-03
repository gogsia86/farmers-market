/**
 * INVENTORY DASHBOARD - Main View
 * Divine agricultural inventory management interface
 *
 * @divine-pattern Holographic component with quantum state
 * @agricultural-consciousness Real-time inventory tracking
 * @reference .github/instructions/08_UX_DESIGN_CONSCIOUSNESS.instructions.md
 */

"use client";

import { createLogger } from "@/lib/utils/logger";
import {
  InventoryItem,
  InventoryMetrics,
  InventoryStatus,
} from "@/types/inventory.types";
import { useEffect, useState } from "react";

const inventoryLogger = createLogger("InventoryDashboard");

export interface InventoryDashboardProps {
  farmId: string;
}

export function InventoryDashboard({ farmId }: InventoryDashboardProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [metrics, setMetrics] = useState<InventoryMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    status?: InventoryStatus;
    lowStock?: boolean;
    search?: string;
  }>({});

  useEffect(() => {
    loadInventoryData();
  }, [farmId, filter]);

  async function loadInventoryData() {
    setLoading(true);
    try {
      // Load inventory items
      const params = new URLSearchParams({
        farmId,
        ...(filter.status && { status: filter.status }),
        ...(filter.lowStock && { lowStock: "true" }),
        ...(filter.search && { search: filter.search }),
      });

      const [itemsResponse, metricsResponse] = await Promise.all([
        fetch(`/api/inventory?${params}`),
        fetch(`/api/inventory/metrics?farmId=${farmId}`),
      ]);

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        setItems(itemsData.data.items);
      }

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.data);
      }
    } catch (error) {
      inventoryLogger.error("Failed to load inventory", error instanceof Error ? error : new Error(String(error)), {
        farmId,
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Items"
            value={metrics.totalItems.toString()}
            icon="📦"
            trend="neutral"
          />
          <MetricCard
            title="Total Value"
            value={`$${metrics.totalValue.toLocaleString()}`}
            icon="💰"
            trend="neutral"
          />
          <MetricCard
            title="Low Stock Items"
            value={metrics.lowStockItems.toString()}
            icon="⚠️"
            trend={metrics.lowStockItems > 0 ? "warning" : "neutral"}
          />
          <MetricCard
            title="Expiring Soon"
            value={metrics.expiringWithin7Days.toString()}
            icon="⏰"
            trend={metrics.expiringWithin7Days > 0 ? "critical" : "neutral"}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-lg bg-white p-4 shadow">
        <input
          type="text"
          placeholder="Search products..."
          value={filter.search || ""}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />

        <select
          value={filter.status || ""}
          onChange={(e) =>
            setFilter({ ...filter, status: e.target.value as InventoryStatus })
          }
          className="rounded-md border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="">All Status</option>
          <option value={InventoryStatus.IN_STOCK}>In Stock</option>
          <option value={InventoryStatus.LOW_STOCK}>Low Stock</option>
          <option value={InventoryStatus.OUT_OF_STOCK}>Out of Stock</option>
        </select>

        <button
          onClick={() => setFilter({ ...filter, lowStock: !filter.lowStock })}
          className={`rounded-md px-4 py-2 transition-colors ${filter.lowStock
              ? "bg-orange-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          {filter.lowStock ? "✓ " : ""}Low Stock Only
        </button>
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Batch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Expiry
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No inventory items found
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.productId}
                        </div>
                        {item.isOrganic && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            🌱 Organic
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {item.batchId}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {item.quantity} {item.unit}
                    </div>
                    {item.reservedQuantity > 0 && (
                      <div className="text-xs text-gray-500">
                        ({item.reservedQuantity} reserved)
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {item.storageLocation}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {item.expiryDate
                      ? new Date(item.expiryDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button className="text-green-600 hover:text-green-900">
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string;
  icon: string;
  trend: "neutral" | "warning" | "critical";
}) {
  const trendColors = {
    neutral: "border-gray-200 bg-white",
    warning: "border-orange-300 bg-orange-50",
    critical: "border-red-300 bg-red-50",
  };

  return (
    <div className={`rounded-lg border-2 p-6 ${trendColors[trend]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: InventoryStatus }) {
  const statusConfig = {
    [InventoryStatus.IN_STOCK]: {
      label: "In Stock",
      classes: "bg-green-100 text-green-800",
    },
    [InventoryStatus.LOW_STOCK]: {
      label: "Low Stock",
      classes: "bg-orange-100 text-orange-800",
    },
    [InventoryStatus.OUT_OF_STOCK]: {
      label: "Out of Stock",
      classes: "bg-red-100 text-red-800",
    },
    [InventoryStatus.RESERVED]: {
      label: "Reserved",
      classes: "bg-blue-100 text-blue-800",
    },
    [InventoryStatus.DAMAGED]: {
      label: "Damaged",
      classes: "bg-gray-100 text-gray-800",
    },
    [InventoryStatus.EXPIRED]: {
      label: "Expired",
      classes: "bg-red-100 text-red-800",
    },
    [InventoryStatus.RECALLED]: {
      label: "Recalled",
      classes: "bg-red-100 text-red-800",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
