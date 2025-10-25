/**
 * SALES ANALYTICS COMPONENT
 * Detailed sales metrics and trends visualization
 */

"use client";

import { QuantumButton } from "@/components/ui/QuantumButton";
import { Calendar, DollarSign, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SalesData {
  period: {
    startDate: string;
    endDate: string;
  };
  revenue: {
    total: number;
    average: number;
    growth: number;
  };
  orders: {
    total: number;
    completed: number;
    cancelled: number;
    growth: number;
  };
  products: {
    totalSold: number;
    uniqueProducts: number;
  };
  customers: {
    total: number;
  };
}

type DateRange = "7d" | "30d" | "90d" | "custom";

export function SalesAnalytics({ farmId }: { farmId?: string }) {
  const [data, setData] = useState<SalesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  useEffect(() => {
    fetchSalesData();
  }, [farmId, dateRange]);

  const fetchSalesData = async () => {
    setIsLoading(true);
    try {
      const { startDate, endDate } = getDateRange(dateRange);
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      if (farmId) {
        params.append("farmId", farmId);
      }

      const response = await fetch(`/api/analytics/sales?${params}`);
      const result = await response.json();

      if (response.ok) {
        setData(result);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error("Failed to load sales data");
    } finally {
      setIsLoading(false);
    }
  };

  const getDateRange = (
    range: DateRange
  ): { startDate: Date; endDate: Date } => {
    const endDate = new Date();
    const startDate = new Date();

    switch (range) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(endDate.getDate() - 90);
        break;
    }

    return { startDate, endDate };
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading sales data...</div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-500">
        Failed to load sales data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Analytics</h2>
          <p className="text-gray-600 mt-1">
            {new Date(data.period.startDate).toLocaleDateString()} -{" "}
            {new Date(data.period.endDate).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-2">
          <QuantumButton
            variant={dateRange === "7d" ? "agricultural" : "secondary"}
            size="sm"
            onClick={() => setDateRange("7d")}
          >
            7 Days
          </QuantumButton>
          <QuantumButton
            variant={dateRange === "30d" ? "agricultural" : "secondary"}
            size="sm"
            onClick={() => setDateRange("30d")}
          >
            30 Days
          </QuantumButton>
          <QuantumButton
            variant={dateRange === "90d" ? "agricultural" : "secondary"}
            size="sm"
            onClick={() => setDateRange("90d")}
          >
            90 Days
          </QuantumButton>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SalesMetricCard
          title="Total Revenue"
          value={`$${data.revenue.total.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          growth={data.revenue.growth}
          color="green"
        />

        <SalesMetricCard
          title="Average Order Value"
          value={`$${data.revenue.average.toFixed(2)}`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="blue"
        />

        <SalesMetricCard
          title="Total Orders"
          value={data.orders.total.toString()}
          icon={<Calendar className="w-6 h-6" />}
          growth={data.orders.growth}
          color="purple"
        />

        <SalesMetricCard
          title="Unique Customers"
          value={data.customers.total.toString()}
          icon={<Users className="w-6 h-6" />}
          color="agricultural"
        />
      </div>

      {/* Order Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Order Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Completed Orders</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {data.orders.completed}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {((data.orders.completed / data.orders.total) * 100).toFixed(1)}%
              completion rate
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Cancelled Orders</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {data.orders.cancelled}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {((data.orders.cancelled / data.orders.total) * 100).toFixed(1)}%
              cancellation rate
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Products Sold</p>
            <p className="text-2xl font-bold text-agricultural-600 mt-1">
              {data.products.totalSold}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {data.products.uniqueProducts} unique products
            </p>
          </div>
        </div>
      </div>

      {/* Growth Indicators */}
      {(data.revenue.growth !== 0 || data.orders.growth !== 0) && (
        <div className="bg-agricultural-50 border border-agricultural-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Growth Trends
          </h3>
          <div className="space-y-3">
            {data.revenue.growth !== 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Revenue Growth</span>
                <span
                  className={`font-semibold ${
                    data.revenue.growth > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {data.revenue.growth > 0 ? "+" : ""}
                  {data.revenue.growth.toFixed(1)}%
                </span>
              </div>
            )}
            {data.orders.growth !== 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Order Growth</span>
                <span
                  className={`font-semibold ${
                    data.orders.growth > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {data.orders.growth > 0 ? "+" : ""}
                  {data.orders.growth.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface SalesMetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  growth?: number;
  color: "green" | "blue" | "purple" | "agricultural";
}

function SalesMetricCard({
  title,
  value,
  icon,
  growth,
  color,
}: SalesMetricCardProps) {
  const colorClasses = {
    green: "from-green-50 to-green-100",
    blue: "from-blue-50 to-blue-100",
    purple: "from-purple-50 to-purple-100",
    agricultural: "from-agricultural-50 to-agricultural-100",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg p-6 border border-gray-200`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className="p-2 bg-white rounded-lg">{icon}</div>
      </div>

      <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>

      {growth !== undefined && growth !== 0 && (
        <p
          className={`text-sm font-medium ${
            growth > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {growth > 0 ? "+" : ""}
          {growth.toFixed(1)}% vs previous period
        </p>
      )}
    </div>
  );
}
