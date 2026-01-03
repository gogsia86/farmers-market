"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { farmLogger } from "@/lib/utils/logger";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

interface FinancialStats {
  currentBalance: number;
  pendingBalance: number;
  totalRevenue: number;
  totalPayout: number;
  revenueChange: number;
  orderCount: number;
  averageOrderValue: number;
}

interface Transaction {
  id: string;
  type: "SALE" | "PAYOUT" | "REFUND" | "FEE";
  amount: number;
  status: "COMPLETED" | "PENDING" | "FAILED";
  description: string;
  orderNumber?: string;
  createdAt: string;
}

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface FinancialOverviewProps {
  farmId: string;
  className?: string;
}

export function FinancialOverview({
  farmId,
  className = "",
}: FinancialOverviewProps) {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  useEffect(() => {
    fetchFinancialData();
  }, [farmId, period]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/farmer/finances?farmId=${farmId}&period=${period}`,
      );
      if (!response.ok) throw new Error("Failed to fetch financial data");

      const data = await response.json();
      setStats(data.stats);
      setTransactions(data.transactions);
      setRevenueData(data.revenueData);
    } catch (error) {
      farmLogger.error("Error fetching financial data", error instanceof Error ? error : new Error(String(error)), {
        farmId,
        period,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "SALE":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case "PAYOUT":
        return <ArrowDownRight className="h-4 w-4 text-blue-600" />;
      case "REFUND":
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case "FEE":
        return <ArrowDownRight className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: Transaction["status"]) => {
    const styles = {
      COMPLETED: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      FAILED: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {status.toLowerCase()}
      </span>
    );
  };

  const downloadStatement = async () => {
    try {
      const response = await fetch(
        `/api/farmer/finances/statement?farmId=${farmId}&period=${period}`,
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financial-statement-${period}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      farmLogger.error("Error downloading statement", error instanceof Error ? error : new Error(String(error)), {
        farmId,
        period,
      });
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-500">Failed to load financial data</p>
        <Button onClick={fetchFinancialData} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Financial Overview
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Track your revenue, payouts, and transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={period}
            onValueChange={(value: any) => setPeriod(value)}
          >
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={downloadStatement} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Statement
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Available Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Available Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.currentBalance)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Ready for payout</p>
          </CardContent>
        </Card>

        {/* Pending Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Balance
            </CardTitle>
            <CreditCard className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.pendingBalance)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Processing orders</p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            {stats.revenueChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p
              className={`text-xs mt-1 flex items-center ${stats.revenueChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
            >
              {stats.revenueChange >= 0 ? "+" : ""}
              {stats.revenueChange.toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg. Order Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.averageOrderValue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.orderCount} orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {revenueData.map((data, index) => {
              const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));
              const height = (data.revenue / maxRevenue) * 100;

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="w-full flex flex-col items-center">
                    <div className="relative group w-full">
                      <div
                        className="w-full bg-green-500 rounded-t-md hover:bg-green-600 transition-colors cursor-pointer"
                        style={{ height: `${height * 2}px` }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {formatCurrency(data.revenue)}
                          <br />
                          {data.orders} orders
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {formatDate(data.date)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No transactions yet
              </p>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {transaction.orderNumber && (
                          <span className="text-xs text-gray-500">
                            Order #{transaction.orderNumber}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p
                        className={`font-semibold ${transaction.type === "SALE"
                            ? "text-green-600"
                            : "text-gray-900"
                          }`}
                      >
                        {transaction.type === "SALE" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
