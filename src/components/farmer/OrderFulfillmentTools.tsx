"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orderLogger } from "@/lib/utils/logger";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Clock,
  Download,
  Mail,
  Package,
  Printer,
  Search,
  Truck,
} from "lucide-react";
import { useState } from "react";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status:
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "FULFILLED"
  | "COMPLETED"
  | "CANCELLED";
  items: OrderItem[];
  total: number;
  pickupDate?: string;
  deliveryAddress?: string;
  deliveryType: "PICKUP" | "DELIVERY";
  notes?: string;
  createdAt: string;
}

interface OrderFulfillmentToolsProps {
  farmId: string;
  orders: Order[];
  onOrdersUpdate: () => void;
  className?: string;
}

export function OrderFulfillmentTools({
  farmId,
  orders,
  onOrdersUpdate,
  className = "",
}: OrderFulfillmentToolsProps) {
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deliveryFilter, setDeliveryFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL");
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;

    const matchesDelivery =
      deliveryFilter === "ALL" || order.deliveryType === deliveryFilter;

    const matchesDate =
      dateFilter === "ALL" ||
      (dateFilter === "TODAY" && isToday(order.createdAt)) ||
      (dateFilter === "WEEK" && isThisWeek(order.createdAt));

    return matchesSearch && matchesStatus && matchesDelivery && matchesDate;
  });

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isThisWeek = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo && date <= today;
  };

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const selectAllOrders = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map((o) => o.id)));
    }
  };

  const batchUpdateStatus = async (newStatus: Order["status"]) => {
    if (selectedOrders.size === 0) {
      alert("Please select orders to update");
      return;
    }

    if (!confirm(`Update ${selectedOrders.size} order(s) to ${newStatus}?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/farmer/orders/batch-update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId,
          orderIds: Array.from(selectedOrders),
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to update orders");

      setSelectedOrders(new Set());
      onOrdersUpdate();
      alert(`Successfully updated ${selectedOrders.size} order(s)`);
    } catch (error) {
      orderLogger.error("Failed to batch update order status", {
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        farmId,
        orderCount: selectedOrders.size,
        targetStatus: newStatus,
      });
      alert("Failed to update orders. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const printPackingSlips = async () => {
    if (selectedOrders.size === 0) {
      alert("Please select orders to print");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/farmer/orders/packing-slips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId,
          orderIds: Array.from(selectedOrders),
        }),
      });

      if (!response.ok) throw new Error("Failed to generate packing slips");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `packing-slips-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      orderLogger.error("Failed to generate packing slips", {
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        farmId,
        orderCount: selectedOrders.size,
      });
      alert("Failed to generate packing slips. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const sendCustomerNotifications = async () => {
    if (selectedOrders.size === 0) {
      alert("Please select orders to notify");
      return;
    }

    if (!confirm(`Send notifications to ${selectedOrders.size} customer(s)?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/farmer/orders/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId,
          orderIds: Array.from(selectedOrders),
        }),
      });

      if (!response.ok) throw new Error("Failed to send notifications");

      alert(`Notifications sent to ${selectedOrders.size} customer(s)`);
    } catch (error) {
      orderLogger.error("Failed to send customer notifications", {
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        farmId,
        orderCount: selectedOrders.size,
      });
      alert("Failed to send notifications. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const exportOrders = async () => {
    if (selectedOrders.size === 0) {
      alert("Please select orders to export");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/farmer/orders/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId,
          orderIds: Array.from(selectedOrders),
        }),
      });

      if (!response.ok) throw new Error("Failed to export orders");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      orderLogger.error("Failed to export orders", {
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        farmId,
        orderCount: selectedOrders.size,
      });
      alert("Failed to export orders. Please try again.");
    } finally {
      setIsProcessing(false);
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
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "CONFIRMED":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "PREPARING":
        return <Package className="h-4 w-4 text-purple-600" />;
      case "READY":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "FULFILLED":
        return <Truck className="h-4 w-4 text-indigo-600" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-700" />;
      case "CANCELLED":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    const styles: Record<Order["status"], string> = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
      PREPARING: "bg-purple-100 text-purple-800 border-purple-200",
      READY: "bg-green-100 text-green-800 border-green-200",
      FULFILLED: "bg-indigo-100 text-indigo-800 border-indigo-200",
      COMPLETED: "bg-green-100 text-green-900 border-green-300",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <Badge
        variant="outline"
        className={`${styles[status]} flex items-center gap-1`}
      >
        {getStatusIcon(status)}
        {status.toLowerCase()}
      </Badge>
    );
  };

  const getWorkflowActions = (status: Order["status"]) => {
    const workflows = {
      PENDING: [
        { label: "Confirm Order", nextStatus: "CONFIRMED" as const },
        { label: "Cancel Order", nextStatus: "CANCELLED" as const },
      ],
      CONFIRMED: [
        { label: "Start Preparing", nextStatus: "PREPARING" as const },
        { label: "Mark Ready", nextStatus: "READY" as const },
      ],
      PREPARING: [{ label: "Mark Ready", nextStatus: "READY" as const }],
      READY: [
        { label: "Mark Fulfilled", nextStatus: "FULFILLED" as const },
        { label: "Mark Completed", nextStatus: "COMPLETED" as const },
      ],
      FULFILLED: [
        { label: "Mark Completed", nextStatus: "COMPLETED" as const },
      ],
      COMPLETED: [],
      CANCELLED: [],
    };

    type WorkflowAction = { label: string; nextStatus: Order["status"] };
    return (workflows[status] as WorkflowAction[] | undefined) || [];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Fulfillment</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {filteredOrders.length} orders
              </Badge>
              {selectedOrders.size > 0 && (
                <Badge className="bg-blue-600">
                  {selectedOrders.size} selected
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="grid gap-4 md:grid-cols-5">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="READY">Ready</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                </SelectContent>
              </Select>
              <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Delivery" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="PICKUP">Pickup</SelectItem>
                  <SelectItem value="DELIVERY">Delivery</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Time</SelectItem>
                  <SelectItem value="TODAY">Today</SelectItem>
                  <SelectItem value="WEEK">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Batch Actions */}
            {selectedOrders.size > 0 && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedOrders.size} order(s) selected
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isProcessing}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Update Status
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => batchUpdateStatus("CONFIRMED")}
                      >
                        Confirm
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => batchUpdateStatus("PREPARING")}
                      >
                        Preparing
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => batchUpdateStatus("READY")}
                      >
                        Ready
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => batchUpdateStatus("FULFILLED")}
                      >
                        Fulfilled
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => batchUpdateStatus("COMPLETED")}
                      >
                        Completed
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={printPackingSlips}
                    disabled={isProcessing}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Slips
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={sendCustomerNotifications}
                    disabled={isProcessing}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Notify
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={exportOrders}
                    disabled={isProcessing}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No orders found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {/* Select All Header */}
              <div className="p-4 bg-gray-50 flex items-center gap-3">
                <Checkbox
                  checked={
                    filteredOrders.length > 0 &&
                    selectedOrders.size === filteredOrders.length
                  }
                  onCheckedChange={selectAllOrders}
                />
                <span className="text-sm font-medium text-gray-700">
                  Select all ({filteredOrders.length})
                </span>
              </div>

              {/* Order Items */}
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${selectedOrders.has(order.id) ? "bg-blue-50" : ""
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedOrders.has(order.id)}
                      onCheckedChange={() => toggleOrderSelection(order.id)}
                    />
                    <div className="flex-1 space-y-3">
                      {/* Order Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              #{order.orderNumber}
                            </h3>
                            {getStatusBadge(order.status)}
                            <Badge variant="outline">
                              {order.deliveryType === "PICKUP"
                                ? "Pickup"
                                : "Delivery"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {order.customerName} • {order.customerEmail}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(order.total)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.items.length} item(s)
                          </p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-700">
                              {item.quantity} {item.unit} × {item.productName}
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(item.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery/Pickup Info */}
                      {(order.deliveryAddress || order.pickupDate) && (
                        <div className="text-sm text-gray-600">
                          {order.deliveryType === "DELIVERY" &&
                            order.deliveryAddress && (
                              <p>📍 {order.deliveryAddress}</p>
                            )}
                          {order.deliveryType === "PICKUP" &&
                            order.pickupDate && (
                              <p>📅 Pickup: {formatDate(order.pickupDate)}</p>
                            )}
                        </div>
                      )}

                      {/* Notes */}
                      {order.notes && (
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                          <p className="font-medium text-yellow-800">
                            Customer Note:
                          </p>
                          <p className="text-yellow-700">{order.notes}</p>
                        </div>
                      )}

                      {/* Workflow Actions */}
                      {getWorkflowActions(order.status).length > 0 && (
                        <div className="flex items-center gap-2 pt-2">
                          {getWorkflowActions(order.status).map(
                            (action: {
                              label: string;
                              nextStatus: Order["status"];
                            }) => (
                              <Button
                                key={action.label}
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedOrders(new Set([order.id]));
                                  batchUpdateStatus(action.nextStatus);
                                }}
                              >
                                {action.label}
                              </Button>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
