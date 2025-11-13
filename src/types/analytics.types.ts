/**
 * ANALYTICS TYPES - Quantum Business Intelligence
 * Divine agricultural analytics consciousness
 *
 * @divine-pattern Holographic analytics containing full system intelligence
 * @agricultural-consciousness Seasonal performance tracking
 * @reference .github/instructions/02_AGRICULTURAL_QUANTUM_MASTERY.instructions.md
 */

import { Season } from "@prisma/client"; // Use Prisma-generated Season enum

// ============================================
// BRANDED TYPES
// ============================================

export type ReportId = string & { readonly brand: unique symbol };
export type AnalyticsId = string & { readonly brand: unique symbol };
export type MetricId = string & { readonly brand: unique symbol };

export function createReportId(id: string): ReportId {
  return id as ReportId;
}

export function createAnalyticsId(id: string): AnalyticsId {
  return id as AnalyticsId;
}

// ============================================
// TIME PERIODS & RANGES
// ============================================

export type TimePeriod =
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "custom";

export interface TimeRange {
  start: Date;
  end: Date;
  period: TimePeriod;
  label: string;
}

export interface SeasonalTimeRange extends TimeRange {
  season: Season;
  year: number;
}

// ============================================
// SALES ANALYTICS
// ============================================

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;

  revenueGrowth: number; // Percentage vs previous period
  ordersGrowth: number;

  topProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
    orders: number;
  }>;

  salesByCategory: Record<
    string,
    {
      revenue: number;
      orders: number;
      percentage: number;
    }
  >;

  salesByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;

  customerMetrics: {
    newCustomers: number;
    returningCustomers: number;
    retentionRate: number;
  };
}

export interface SeasonalSalesAnalytics extends SalesMetrics {
  season: Season;
  year: number;
  compareToPreviousSeason: {
    revenueChange: number;
    ordersChange: number;
    customerChange: number;
  };
}

// ============================================
// FARM PERFORMANCE ANALYTICS
// ============================================

export interface FarmPerformanceMetrics {
  farmId: string;
  farmName: string;

  // Revenue metrics
  totalRevenue: number;
  revenueGrowth: number;
  averageRevenuePerProduct: number;

  // Product metrics
  totalProducts: number;
  activeProducts: number;
  soldOutProducts: number;

  // Inventory metrics
  totalInventoryValue: number;
  inventoryTurnoverRate: number;
  daysOfSupply: number;

  // Order metrics
  totalOrders: number;
  fulfilledOrders: number;
  cancelledOrders: number;
  fulfillmentRate: number;

  // Customer metrics
  uniqueCustomers: number;
  averageOrdersPerCustomer: number;
  customerSatisfactionScore: number | null;

  // Efficiency metrics
  averageTimeToFulfill: number; // hours
  orderAccuracyRate: number; // percentage
}

export interface MultiFarmComparison {
  period: TimeRange;
  farms: FarmPerformanceMetrics[];

  rankings: {
    byRevenue: string[]; // Farm IDs
    byOrders: string[];
    byCustomerSatisfaction: string[];
    byFulfillmentRate: string[];
  };

  averages: {
    revenue: number;
    orders: number;
    fulfillmentRate: number;
    customerSatisfaction: number;
  };
}

// ============================================
// PRODUCT ANALYTICS
// ============================================

export interface ProductPerformanceMetrics {
  productId: string;
  productName: string;
  farmId: string;
  farmName: string;

  // Sales metrics
  totalRevenue: number;
  totalQuantitySold: number;
  totalOrders: number;

  // Performance indicators
  averageSellingPrice: number;
  revenueGrowth: number;
  popularityScore: number; // 0-100

  // Inventory metrics
  currentStock: number;
  turnoverRate: number;
  daysInStock: number;

  // Customer interaction
  views: number;
  addToCartRate: number; // percentage
  conversionRate: number; // percentage

  // Ratings
  averageRating: number | null;
  totalReviews: number;

  // Seasonal data
  bestSellingSeasons: Season[];
}

export interface CategoryAnalytics {
  category: string;

  totalProducts: number;
  totalRevenue: number;
  totalOrders: number;

  averagePrice: number;
  averageRating: number;

  topProducts: Array<{
    productId: string;
    productName: string;
    revenue: number;
  }>;

  seasonalTrends: Record<
    Season,
    {
      revenue: number;
      orders: number;
      avgPrice: number;
    }
  >;
}

// ============================================
// CUSTOMER ANALYTICS
// ============================================

export interface CustomerSegmentMetrics {
  segment: "new" | "returning" | "loyal" | "at_risk" | "churned";

  count: number;
  percentage: number;

  averageOrderValue: number;
  averageOrderFrequency: number; // orders per month
  totalRevenue: number;

  preferredCategories: string[];
  preferredFarms: string[];
}

export interface CustomerBehaviorAnalytics {
  totalCustomers: number;
  activeCustomers: number; // Ordered in period

  segments: CustomerSegmentMetrics[];

  lifetimeValue: {
    average: number;
    median: number;
    top10Percent: number;
  };

  retentionMetrics: {
    monthlyRetention: number[];
    cohortAnalysis: CohortData[];
  };

  acquisitionMetrics: {
    newCustomers: number;
    costPerAcquisition: number | null;
    channels: Record<string, number>;
  };
}

export interface CohortData {
  cohortMonth: string;
  customersCount: number;
  retentionByMonth: number[]; // Retention percentage for each month after signup
}

// ============================================
// FINANCIAL REPORTS
// ============================================

export interface FinancialReport {
  period: TimeRange;

  revenue: {
    gross: number;
    net: number;
    growth: number;
  };

  costs: {
    productCosts: number;
    shippingCosts: number;
    platformFees: number;
    marketingCosts: number;
    total: number;
  };

  profit: {
    gross: number;
    net: number;
    margin: number; // percentage
  };

  transactions: {
    successful: number;
    refunded: number;
    disputed: number;
    total: number;
  };

  paymentMethods: Record<
    string,
    {
      count: number;
      amount: number;
      percentage: number;
    }
  >;
}

export interface CashFlowReport {
  period: TimeRange;

  inflows: {
    sales: number;
    refunds: number; // negative
    adjustments: number;
    total: number;
  };

  outflows: {
    farmerPayments: number;
    operatingExpenses: number;
    marketingExpenses: number;
    total: number;
  };

  netCashFlow: number;

  projections: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  };
}

// ============================================
// OPERATIONAL REPORTS
// ============================================

export interface InventoryReport {
  period: TimeRange;

  overview: {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    expiringItems: number;
  };

  turnover: {
    averageRate: number;
    byCategory: Record<string, number>;
    fastMoving: Array<{
      productId: string;
      name: string;
      turnoverRate: number;
    }>;
    slowMoving: Array<{
      productId: string;
      name: string;
      daysInStock: number;
    }>;
  };

  spoilage: {
    totalUnits: number;
    totalValue: number;
    byProduct: Array<{
      productId: string;
      name: string;
      quantity: number;
      value: number;
    }>;
  };

  stockLevels: Array<{
    date: string;
    totalValue: number;
    itemCount: number;
  }>;
}

export interface FulfillmentReport {
  period: TimeRange;

  orderMetrics: {
    totalOrders: number;
    fulfilled: number;
    pending: number;
    cancelled: number;
    fulfillmentRate: number;
  };

  timeMetrics: {
    averageProcessingTime: number; // hours
    averageShippingTime: number; // hours
    averageTotalTime: number; // hours
    onTimeDeliveryRate: number; // percentage
  };

  shippingMetrics: {
    totalShipments: number;
    byCarrier: Record<string, number>;
    byMethod: Record<string, number>;
    averageCost: number;
  };

  issues: {
    damaged: number;
    lost: number;
    delayed: number;
    totalRate: number; // percentage
  };
}

// ============================================
// CUSTOM REPORT BUILDER
// ============================================

export interface ReportDefinition {
  id: ReportId;
  name: string;
  description: string;

  type: "sales" | "inventory" | "financial" | "operational" | "custom";

  metrics: ReportMetric[];
  dimensions: ReportDimension[];
  filters: ReportFilter[];

  schedule: ReportSchedule | null;

  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportMetric {
  id: MetricId;
  name: string;
  field: string;
  aggregation: "sum" | "avg" | "count" | "min" | "max" | "median";
  format: "number" | "currency" | "percentage" | "duration";
}

export interface ReportDimension {
  field: string;
  label: string;
  type: "date" | "category" | "farm" | "product" | "customer";
}

export interface ReportFilter {
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "greater_than"
    | "less_than"
    | "between";
  value: string | number | Date | [Date, Date];
}

export interface ReportSchedule {
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:mm format
  recipients: string[]; // Email addresses
  format: "pdf" | "excel" | "csv";
}

// ============================================
// DASHBOARD WIDGETS
// ============================================

export interface DashboardWidget {
  id: string;
  type: "metric" | "chart" | "table" | "map";
  title: string;

  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  config: WidgetConfig;

  refreshInterval?: number; // seconds
}

export interface WidgetConfig {
  dataSource: string;
  metrics: string[];
  dimensions?: string[];
  filters?: ReportFilter[];

  visualization?: {
    chartType?: "line" | "bar" | "pie" | "area" | "scatter";
    colors?: string[];
    showLegend?: boolean;
    showValues?: boolean;
  };
}

// ============================================
// EXPORT FORMATS
// ============================================

export interface ExportOptions {
  format: "pdf" | "excel" | "csv" | "json";
  includeCharts: boolean;
  includeSummary: boolean;
  dateRange: TimeRange;
  filters?: Record<string, unknown>;
}

export interface ExportResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  error?: string;
}

// ============================================
// QUERY HELPERS
// ============================================

export interface AnalyticsQuery {
  metrics: string[];
  dimensions?: string[];
  filters?: ReportFilter[];
  timeRange: TimeRange;
  groupBy?: string[];
  orderBy?: Array<{
    field: string;
    direction: "asc" | "desc";
  }>;
  limit?: number;
}

export interface AnalyticsResult<T = Record<string, unknown>> {
  data: T[];
  total: number;
  aggregations?: Record<string, number>;
  timeRange: TimeRange;
  generatedAt: Date;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function getTimeRangeLabel(range: TimeRange): string {
  const start = range.start.toLocaleDateString();
  const end = range.end.toLocaleDateString();
  return `${start} - ${end}`;
}

export function getPreviousPeriod(range: TimeRange): TimeRange {
  const duration = range.end.getTime() - range.start.getTime();
  return {
    start: new Date(range.start.getTime() - duration),
    end: new Date(range.end.getTime() - duration),
    period: range.period,
    label: `Previous ${range.period}`,
  };
}

export function getQuarterFromDate(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1;
}

export function getSeasonFromMonth(month: number): Season {
  if (month >= 3 && month <= 5) return "SPRING";
  if (month >= 6 && month <= 8) return "SUMMER";
  if (month >= 9 && month <= 11) return "FALL"; // FALL, not AUTUMN
  return "WINTER";
}

export function getTimeRangeForPeriod(
  period: TimePeriod,
  date: Date = new Date()
): TimeRange {
  const start = new Date(date);
  const end = new Date(date);

  switch (period) {
    case "day":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "week":
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + (6 - day));
      end.setHours(23, 59, 59, 999);
      break;

    case "month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "quarter":
      const quarter = getQuarterFromDate(date);
      start.setMonth((quarter - 1) * 3, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(quarter * 3, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "year":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;

    default:
      // For custom, return today
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
  }

  return {
    start,
    end,
    period,
    label: period.charAt(0).toUpperCase() + period.slice(1),
  };
}
