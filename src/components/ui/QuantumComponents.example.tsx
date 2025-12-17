/**
 * 🌾 QUANTUM COMPONENTS - Usage Examples
 *
 * Comprehensive examples for QuantumDataTable, AgriculturalChart, and BiodynamicMetric.
 * Use these patterns in your agricultural platform features.
 *
 * DIVINE PATTERN:
 * - Real-world agricultural use cases
 * - Type-safe implementations
 * - Seasonal consciousness integration
 * - Performance optimization examples
 */

"use client";

import React from "react";
import { QuantumDataTable, createColumn } from "./QuantumDataTable";
import {
  AgriculturalChart,
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
} from "./AgriculturalChart";
import {
  BiodynamicMetric,
  BiodynamicMetricGrid,
  calculateTrend,
  createMetrics,
} from "./BiodynamicMetric";
import {
  ShoppingBagIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

// ============================================================================
// TYPE DEFINITIONS (Example Data Structures)
// ============================================================================

interface Farm {
  id: string;
  name: string;
  owner: string;
  productsCount: number;
  ordersCount: number;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  createdAt: Date;
}

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface CategoryData {
  category: string;
  sales: number;
}

// ============================================================================
// EXAMPLE 1: QUANTUM DATA TABLE - Farm Management
// ============================================================================

export function FarmManagementTableExample() {
  // Sample farm data
  const farms: Farm[] = [
    {
      id: "1",
      name: "Green Valley Farm",
      owner: "John Smith",
      productsCount: 25,
      ordersCount: 142,
      status: "ACTIVE",
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Sunrise Orchards",
      owner: "Maria Garcia",
      productsCount: 18,
      ordersCount: 98,
      status: "ACTIVE",
      createdAt: new Date("2024-02-20"),
    },
    {
      id: "3",
      name: "Mountain View Ranch",
      owner: "David Lee",
      productsCount: 32,
      ordersCount: 215,
      status: "PENDING",
      createdAt: new Date("2024-03-10"),
    },
    {
      id: "4",
      name: "Organic Meadows",
      owner: "Sarah Johnson",
      productsCount: 12,
      ordersCount: 67,
      status: "ACTIVE",
      createdAt: new Date("2024-01-25"),
    },
    {
      id: "5",
      name: "Heritage Homestead",
      owner: "Michael Brown",
      productsCount: 45,
      ordersCount: 324,
      status: "ACTIVE",
      createdAt: new Date("2023-12-05"),
    },
  ];

  // Define columns with type safety
  const columns = [
    createColumn<Farm>({
      key: "name",
      label: "Farm Name",
      accessor: (farm) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{farm.name}</span>
          <span className="text-xs text-gray-500">{farm.owner}</span>
        </div>
      ),
      sortable: true,
      sortFn: (a, b) => a.name.localeCompare(b.name),
    }),
    createColumn<Farm>({
      key: "products",
      label: "Products",
      accessor: (farm) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {farm.productsCount} items
        </span>
      ),
      sortable: true,
      sortFn: (a, b) => a.productsCount - b.productsCount,
      align: "center",
      hideOnMobile: true,
    }),
    createColumn<Farm>({
      key: "orders",
      label: "Orders",
      accessor: (farm) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {farm.ordersCount} orders
        </span>
      ),
      sortable: true,
      sortFn: (a, b) => a.ordersCount - b.ordersCount,
      align: "center",
    }),
    createColumn<Farm>({
      key: "status",
      label: "Status",
      accessor: (farm) => {
        const statusColors = {
          ACTIVE: "bg-green-100 text-green-800",
          PENDING: "bg-yellow-100 text-yellow-800",
          SUSPENDED: "bg-red-100 text-red-800",
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[farm.status]}`}
          >
            {farm.status}
          </span>
        );
      },
      sortable: true,
      align: "center",
    }),
    createColumn<Farm>({
      key: "createdAt",
      label: "Joined",
      accessor: (farm) => farm.createdAt.toLocaleDateString(),
      sortable: true,
      sortFn: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      hideOnMobile: true,
    }),
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">
        Farm Management Table
      </h2>
      <QuantumDataTable
        data={farms}
        columns={columns}
        keyExtractor={(farm) => farm.id}
        selectable
        pagination
        pageSize={5}
        hoverable
        striped
        agricultural={{
          season: "SPRING",
          consciousness: "DIVINE",
        }}
        emptyMessage="No farms found. Start by adding your first farm!"
        onRowClick={(farm) => {
          console.log("Farm clicked:", farm.name);
          // Navigate to farm details
        }}
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: AGRICULTURAL CHARTS - Sales Analytics
// ============================================================================

export function SalesAnalyticsChartsExample() {
  // Sample sales data
  const monthlySales: SalesData[] = [
    { date: "Jan", revenue: 12500, orders: 145 },
    { date: "Feb", revenue: 15200, orders: 178 },
    { date: "Mar", revenue: 18900, orders: 210 },
    { date: "Apr", revenue: 22400, orders: 265 },
    { date: "May", revenue: 28600, orders: 312 },
    { date: "Jun", revenue: 32100, orders: 378 },
  ];

  const categoryData: CategoryData[] = [
    { category: "Vegetables", sales: 45000 },
    { category: "Fruits", sales: 38500 },
    { category: "Dairy", sales: 28200 },
    { category: "Meat", sales: 22800 },
    { category: "Grains", sales: 15500 },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">
        Sales Analytics Dashboard
      </h2>

      {/* Line Chart - Revenue Trend */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-agricultural-200">
        <LineChart
          data={monthlySales}
          xKey="date"
          yKey="revenue"
          title="Monthly Revenue Trend"
          season="SPRING"
          showPoints
          smooth
          height={300}
          consciousness="DIVINE"
        />
      </div>

      {/* Bar Chart - Category Sales */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-agricultural-200">
        <BarChart
          data={categoryData}
          xKey="category"
          yKey="sales"
          title="Sales by Category"
          season="SUMMER"
          height={300}
          consciousness="DIVINE"
        />
      </div>

      {/* Pie Chart - Market Share */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-agricultural-200">
        <PieChart
          data={categoryData}
          labelKey="category"
          valueKey="sales"
          title="Market Share Distribution"
          season="FALL"
          showPercentages
          innerRadius={0.5} // Donut chart
          height={400}
          consciousness="DIVINE"
        />
      </div>

      {/* Area Chart - Cumulative Orders */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-agricultural-200">
        <AreaChart
          data={monthlySales}
          xKey="date"
          yKey="orders"
          title="Cumulative Orders Over Time"
          season="WINTER"
          fillOpacity={0.4}
          height={300}
          consciousness="DIVINE"
        />
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: BIODYNAMIC METRICS - Dashboard KPIs
// ============================================================================

export function DashboardMetricsExample() {
  // Current and previous period data
  const currentRevenue = 125400;
  const previousRevenue = 98200;

  const currentOrders = 1543;
  const previousOrders = 1298;

  const currentCustomers = 3847;
  const previousCustomers = 3421;

  const avgOrderValue = 81.3;
  const previousAvgOrderValue = 75.6;

  // Calculate trends
  const revenueTrend = calculateTrend(currentRevenue, previousRevenue);
  const ordersTrend = calculateTrend(currentOrders, previousOrders);
  const customersTrend = calculateTrend(currentCustomers, previousCustomers);
  const avgOrderTrend = calculateTrend(avgOrderValue, previousAvgOrderValue);

  // Create metrics array
  const metrics = createMetrics([
    {
      label: "Total Revenue",
      value: currentRevenue,
      format: "currency",
      trend: revenueTrend,
      comparison: "vs last month",
      icon: CurrencyDollarIcon,
      season: "SPRING",
      size: "lg",
      helperText: "All-time high for this quarter",
    },
    {
      label: "Total Orders",
      value: currentOrders,
      format: "number",
      trend: ordersTrend,
      comparison: "vs last month",
      icon: ShoppingBagIcon,
      season: "SUMMER",
      size: "lg",
    },
    {
      label: "Active Customers",
      value: currentCustomers,
      format: "number",
      trend: customersTrend,
      comparison: "vs last month",
      icon: UserGroupIcon,
      season: "FALL",
      size: "lg",
    },
    {
      label: "Avg Order Value",
      value: avgOrderValue,
      format: "currency",
      trend: avgOrderTrend,
      comparison: "vs last month",
      icon: ChartBarIcon,
      season: "WINTER",
      size: "lg",
    },
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Metrics</h2>

      {/* Metrics Grid */}
      <BiodynamicMetricGrid metrics={metrics} columns={4} gap="md" />

      {/* Individual Metrics Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {/* Small Size */}
        <BiodynamicMetric
          label="Conversion Rate"
          value={4.2}
          format="percentage"
          trend={{ value: 0.8, direction: "up" }}
          season="SPRING"
          size="sm"
          consciousness="QUANTUM"
        />

        {/* Medium Size (Default) */}
        <BiodynamicMetric
          label="Cart Value"
          value={156.8}
          format="currency"
          trend={{ value: 5.3, direction: "up" }}
          season="SUMMER"
          size="md"
          consciousness="DIVINE"
        />

        {/* Large Size */}
        <BiodynamicMetric
          label="Customer Satisfaction"
          value={4.8}
          customFormat={(val) => `${val}/5.0 ⭐`}
          trend={{ value: 0.2, direction: "up" }}
          season="FALL"
          size="lg"
          consciousness="BIODYNAMIC"
        />

        {/* XL Size with Click */}
        <BiodynamicMetric
          label="Total Farms"
          value={247}
          format="number"
          trend={{ value: 12, direction: "up", label: "this week" }}
          icon={ChartBarIcon}
          season="WINTER"
          size="xl"
          onClick={() => alert("Navigate to farms page")}
          helperText="Click to view all farms"
          consciousness="DIVINE"
        />
      </div>

      {/* Loading States */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Loading States</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BiodynamicMetric
            label="Loading Metric"
            value={0}
            loading
            season="SPRING"
          />
          <BiodynamicMetric
            label="Loading Metric"
            value={0}
            loading
            season="SUMMER"
            size="lg"
          />
          <BiodynamicMetric
            label="Loading Metric"
            value={0}
            loading
            season="FALL"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: COMBINED DASHBOARD - All Components Together
// ============================================================================

export function CompleteDashboardExample() {
  return (
    <div className="space-y-8 p-6 bg-agricultural-25 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌾 Farmers Market Analytics
          </h1>
          <p className="text-gray-600">
            Divine agricultural dashboard with quantum components
          </p>
        </div>

        {/* Metrics Section */}
        <section className="mb-8">
          <DashboardMetricsExample />
        </section>

        {/* Charts Section */}
        <section className="mb-8">
          <SalesAnalyticsChartsExample />
        </section>

        {/* Table Section */}
        <section>
          <FarmManagementTableExample />
        </section>

        {/* Divine Footer */}
        <footer className="mt-12 text-center text-sm text-agricultural-600">
          <p>
            🌾 Quantum Components • Divine Agricultural Consciousness • Built
            with TypeScript & Next.js 15
          </p>
        </footer>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================

export default {
  FarmManagement: FarmManagementTableExample,
  SalesAnalytics: SalesAnalyticsChartsExample,
  DashboardMetrics: DashboardMetricsExample,
  CompleteDashboard: CompleteDashboardExample,
};
