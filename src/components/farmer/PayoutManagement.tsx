"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PayoutAccount {
  id: string;
  accountType: "BANK" | "STRIPE";
  last4: string;
  bankName?: string;
  accountHolderName?: string;
  isDefault: boolean;
  status: "ACTIVE" | "PENDING" | "INACTIVE";
  createdAt: string;
}

interface Payout {
  id: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  stripePayoutId?: string;
  periodStart: string;
  periodEnd: string;
  orderCount: number;
  scheduledDate: string;
  completedDate?: string;
  failureReason?: string;
  accountLast4: string;
}

interface PayoutSchedule {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  dayOfWeek?: number;
  dayOfMonth?: number;
  minimumAmount: number;
}

interface PayoutManagementProps {
  farmId: string;
  className?: string;
}

export function PayoutManagement({
  farmId,
  className = "",
}: PayoutManagementProps) {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [accounts, setAccounts] = useState<PayoutAccount[]>([]);
  const [schedule, setSchedule] = useState<PayoutSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [scheduleFrequency, setScheduleFrequency] = useState<
    "DAILY" | "WEEKLY" | "MONTHLY"
  >("WEEKLY");
  const [minimumAmount, setMinimumAmount] = useState<number>(10);

  useEffect(() => {
    fetchPayoutData();
  }, [farmId]);

  const fetchPayoutData = async () => {
    try {
      setLoading(true);
      const [payoutsRes, accountsRes, scheduleRes, balanceRes] =
        await Promise.all([
          fetch(`/api/farmer/payouts?farmId=${farmId}`),
          fetch(`/api/farmer/payout-accounts?farmId=${farmId}`),
          fetch(`/api/farmer/payout-schedule?farmId=${farmId}`),
          fetch(`/api/farmer/finances?farmId=${farmId}`),
        ]);

      const payoutsData = await payoutsRes.json();
      const accountsData = await accountsRes.json();
      const scheduleData = await scheduleRes.json();
      const balanceData = await balanceRes.json();

      setPayouts(payoutsData.payouts || []);
      setAccounts(accountsData.accounts || []);
      setSchedule(scheduleData.schedule || null);
      setAvailableBalance(balanceData.stats?.currentBalance || 0);
    } catch (error) {
      console.error("Error fetching payout data:", error);
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

  const getPayoutStatusIcon = (status: Payout["status"]) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "PROCESSING":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "FAILED":
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getPayoutStatusBadge = (status: Payout["status"]) => {
    const styles = {
      COMPLETED: "bg-green-100 text-green-800 border-green-200",
      PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      FAILED: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <Badge variant="outline" className={styles[status]}>
        {status.toLowerCase()}
      </Badge>
    );
  };

  const requestInstantPayout = async () => {
    if (availableBalance < 10) {
      alert("Minimum payout amount is $10.00");
      return;
    }

    try {
      const response = await fetch(`/api/farmer/payouts/instant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmId }),
      });

      if (!response.ok) throw new Error("Failed to request payout");

      await response.json();
      alert("Payout requested successfully!");
      fetchPayoutData();
    } catch (error) {
      console.error("Error requesting payout:", error);
      alert("Failed to request payout. Please try again.");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updatePayoutSchedule = async (newSchedule: PayoutSchedule) => {
    try {
      const response = await fetch(`/api/farmer/payout-schedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmId, schedule: newSchedule }),
      });

      if (!response.ok) throw new Error("Failed to update schedule");

      setSchedule(newSchedule);
      setIsScheduleDialogOpen(false);
      alert("Payout schedule updated successfully!");
    } catch (error) {
      console.error("Error updating schedule:", error);
      alert("Failed to update schedule. Please try again.");
    }
  };

  const connectStripeAccount = async () => {
    try {
      const response = await fetch(`/api/farmer/stripe/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmId }),
      });

      if (!response.ok) throw new Error("Failed to connect Stripe");

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error("Error connecting Stripe:", error);
      alert("Failed to connect Stripe. Please try again.");
    }
  };

  const setDefaultAccount = async (accountId: string) => {
    try {
      const response = await fetch(
        `/api/farmer/payout-accounts/${accountId}/default`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ farmId }),
        },
      );

      if (!response.ok) throw new Error("Failed to set default account");

      fetchPayoutData();
    } catch (error) {
      console.error("Error setting default account:", error);
      alert("Failed to set default account. Please try again.");
    }
  };

  const removeAccount = async (accountId: string) => {
    if (!confirm("Are you sure you want to remove this payout account?")) {
      return;
    }

    try {
      const response = await fetch(`/api/farmer/payout-accounts/${accountId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmId }),
      });

      if (!response.ok) throw new Error("Failed to remove account");

      fetchPayoutData();
    } catch (error) {
      console.error("Error removing account:", error);
      alert("Failed to remove account. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const defaultAccount = accounts.find((acc) => acc.isDefault);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Payout Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your payout accounts and schedule
          </p>
        </div>
      </div>

      {/* Available Balance Card */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Available for Payout
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(availableBalance)}
              </p>
              {defaultAccount && (
                <p className="text-sm text-gray-500 mt-2">
                  Deposits to ••••{defaultAccount.last4}
                </p>
              )}
            </div>
            <Button
              onClick={requestInstantPayout}
              disabled={availableBalance < 10}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Request Payout
            </Button>
          </div>
          {availableBalance < 10 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Minimum payout amount is $10.00. Continue selling to reach the
                minimum.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Schedule & Accounts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Payout Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payout Schedule</CardTitle>
            <Dialog
              open={isScheduleDialogOpen}
              onOpenChange={setIsScheduleDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Payout Schedule</DialogTitle>
                  <DialogDescription>
                    Choose how often you want to receive payouts
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Frequency</Label>
                    <Select
                      value={scheduleFrequency}
                      onValueChange={(value) =>
                        setScheduleFrequency(
                          value as "DAILY" | "WEEKLY" | "MONTHLY",
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Minimum Amount</Label>
                    <Input
                      type="number"
                      value={minimumAmount}
                      onChange={(e) => setMinimumAmount(Number(e.target.value))}
                      min={10}
                      step={5}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() =>
                      updatePayoutSchedule({
                        frequency: scheduleFrequency,
                        minimumAmount,
                      })
                    }
                  >
                    Save Schedule
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {schedule ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Frequency</span>
                  <span className="font-medium">
                    {schedule.frequency.toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Minimum Amount</span>
                  <span className="font-medium">
                    {formatCurrency(schedule.minimumAmount)}
                  </span>
                </div>
                {schedule.frequency === "WEEKLY" && schedule.dayOfWeek && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Payout Day</span>
                    <span className="font-medium">
                      {
                        [
                          "Sunday",
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                        ][schedule.dayOfWeek]
                      }
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No schedule configured</p>
            )}
          </CardContent>
        </Card>

        {/* Payout Accounts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payout Accounts</CardTitle>
            <Button variant="outline" size="sm" onClick={connectStripeAccount}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-6">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-4">
                  No payout accounts connected
                </p>
                <Button onClick={connectStripeAccount} variant="outline">
                  Connect Stripe Account
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className={`p-3 rounded-lg border ${
                      account.isDefault
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {account.bankName || "Bank Account"}
                          </p>
                          <p className="text-sm text-gray-500">
                            ••••{account.last4}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {account.isDefault && (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 border-green-200"
                          >
                            Default
                          </Badge>
                        )}
                        {!account.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDefaultAccount(account.id)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAccount(account.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No payouts yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Payouts will appear here once processed
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getPayoutStatusIcon(payout.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(payout.amount)}
                        </p>
                        {getPayoutStatusBadge(payout.status)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(payout.periodStart)} -{" "}
                        {formatDate(payout.periodEnd)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {payout.orderCount} orders • ••••{payout.accountLast4}
                      </p>
                      {payout.failureReason && (
                        <p className="text-xs text-red-600 mt-1">
                          {payout.failureReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {payout.status === "COMPLETED" && payout.completedDate
                        ? `Paid ${formatDate(payout.completedDate)}`
                        : `Scheduled ${formatDate(payout.scheduledDate)}`}
                    </p>
                    {payout.stripePayoutId && (
                      <a
                        href={`https://dashboard.stripe.com/payouts/${payout.stripePayoutId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                      >
                        View in Stripe
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
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
