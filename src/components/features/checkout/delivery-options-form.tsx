"use client";

// 🚚 DELIVERY OPTIONS FORM - Pickup/Delivery Selection Component
// Per-farm delivery method selection with agricultural consciousness

import type { DeliveryOption } from "@/app/(customer)/checkout/page";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Package, Truck } from "lucide-react";
import { useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface DeliveryOptionsFormProps {
  farmGroups: Array<{
    farmId: string;
    farmName: string;
    farmSlug: string;
    itemCount: number;
    subtotal: number;
    items: any[];
  }>;
  initialOptions: DeliveryOption[];
  onSubmit: (options: DeliveryOption[]) => void;
  onBack: () => void;
  isProcessing?: boolean;
}

interface FormErrors {
  [farmId: string]: string | undefined;
}

// ============================================================================
// DELIVERY OPTIONS FORM COMPONENT
// ============================================================================

export function DeliveryOptionsForm({
  farmGroups,
  initialOptions,
  onSubmit,
  onBack,
  isProcessing = false,
}: DeliveryOptionsFormProps) {
  // Form state
  const [options, setOptions] = useState<DeliveryOption[]>(() => {
    // Initialize with existing options or defaults
    return farmGroups.map((farm) => {
      const existing = initialOptions.find((opt) => opt.farmId === farm.farmId);
      return (
        existing || {
          farmId: farm.farmId,
          method: "DELIVERY" as const,
          scheduledDate: "",
          scheduledTime: "",
        }
      );
    });
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  const validateOptions = (): boolean => {
    const newErrors: FormErrors = {};

    options.forEach((option) => {
      // Validate that a method is selected
      if (!option.method) {
        newErrors[option.farmId] = "Please select a delivery method";
      }

      // Validate pickup location if method is PICKUP
      if (option.method === "PICKUP" && !option.pickupLocation) {
        newErrors[option.farmId] = "Please select a pickup location";
      }

      // Validate scheduled date
      if (!option.scheduledDate) {
        newErrors[option.farmId] = "Please select a delivery/pickup date";
      } else {
        // Check if date is in the future
        const selectedDate = new Date(option.scheduledDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          newErrors[option.farmId] = "Date must be today or in the future";
        }
      }

      // Validate scheduled time
      if (!option.scheduledTime) {
        newErrors[option.farmId] = "Please select a delivery/pickup time";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleMethodChange = (farmId: string, method: "DELIVERY" | "PICKUP") => {
    setOptions((prev) =>
      prev.map((opt) =>
        opt.farmId === farmId
          ? {
            ...opt,
            method,
            pickupLocation: method === "PICKUP" ? opt.pickupLocation : undefined,
          }
          : opt
      )
    );

    // Clear error when user makes a change
    if (errors[farmId]) {
      setErrors((prev) => ({ ...prev, [farmId]: undefined }));
    }
  };

  const handlePickupLocationChange = (farmId: string, location: string) => {
    setOptions((prev) =>
      prev.map((opt) =>
        opt.farmId === farmId ? { ...opt, pickupLocation: location } : opt
      )
    );

    // Clear error when user makes a change
    if (errors[farmId]) {
      setErrors((prev) => ({ ...prev, [farmId]: undefined }));
    }
  };

  const handleScheduledDateChange = (farmId: string, date: string) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.farmId === farmId ? { ...opt, scheduledDate: date } : opt))
    );

    // Clear error when user makes a change
    if (errors[farmId]) {
      setErrors((prev) => ({ ...prev, [farmId]: undefined }));
    }
  };

  const handleScheduledTimeChange = (farmId: string, time: string) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.farmId === farmId ? { ...opt, scheduledTime: time } : opt))
    );

    // Clear error when user makes a change
    if (errors[farmId]) {
      setErrors((prev) => ({ ...prev, [farmId]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!validateOptions()) {
      return;
    }

    // Submit
    onSubmit(options);
  };

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days ahead
    return maxDate.toISOString().split("T")[0];
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-100 p-2">
            <Truck className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Delivery Options</h2>
            <p className="text-sm text-gray-600">
              Choose delivery or pickup for each farm
            </p>
          </div>
        </div>
      </CardHeader>

      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Farm Delivery Options */}
          <div className="space-y-6">
            {farmGroups.map((farm) => {
              const farmOption = options.find((opt) => opt.farmId === farm.farmId);
              const farmError = errors[farm.farmId];

              return (
                <div
                  key={farm.farmId}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-6"
                >
                  {/* Farm Header */}
                  <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{farm.farmName}</h3>
                      <p className="text-sm text-gray-600">
                        {farm.itemCount} item{farm.itemCount !== 1 ? "s" : ""} · $
                        {farm.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Method Selection */}
                  <div className="mb-4">
                    <label className="mb-3 block text-sm font-medium text-gray-900">
                      Delivery Method <span className="text-red-500">*</span>
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {/* Delivery Option */}
                      <button
                        type="button"
                        onClick={() => handleMethodChange(farm.farmId, "DELIVERY")}
                        className={`flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all ${farmOption?.method === "DELIVERY"
                            ? "border-green-600 bg-green-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        disabled={isProcessing}
                      >
                        <div
                          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${farmOption?.method === "DELIVERY"
                              ? "border-green-600"
                              : "border-gray-300"
                            }`}
                        >
                          {farmOption?.method === "DELIVERY" && (
                            <div className="h-2.5 w-2.5 rounded-full bg-green-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-gray-900">Delivery</span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            Have your order delivered to your door
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            $5.99 fee (free over $50)
                          </p>
                        </div>
                      </button>

                      {/* Pickup Option */}
                      <button
                        type="button"
                        onClick={() => handleMethodChange(farm.farmId, "PICKUP")}
                        className={`flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all ${farmOption?.method === "PICKUP"
                            ? "border-green-600 bg-green-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        disabled={isProcessing}
                      >
                        <div
                          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${farmOption?.method === "PICKUP"
                              ? "border-green-600"
                              : "border-gray-300"
                            }`}
                        >
                          {farmOption?.method === "PICKUP" && (
                            <div className="h-2.5 w-2.5 rounded-full bg-green-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-gray-900">Pickup</span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            Pick up your order at the farm
                          </p>
                          <p className="mt-1 text-xs text-gray-500">No delivery fee</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Pickup Location (if PICKUP selected) */}
                  {farmOption?.method === "PICKUP" && (
                    <div className="mb-4">
                      <label
                        htmlFor={`pickup-location-${farm.farmId}`}
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Pickup Location <span className="text-red-500">*</span>
                      </label>
                      <select
                        id={`pickup-location-${farm.farmId}`}
                        value={farmOption.pickupLocation || ""}
                        onChange={(e) =>
                          handlePickupLocationChange(farm.farmId, e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isProcessing}
                      >
                        <option value="">Select pickup location</option>
                        <option value="farm_gate">Farm Gate</option>
                        <option value="farmstand">Farm Stand</option>
                        <option value="farmers_market">Farmer's Market Booth</option>
                      </select>
                    </div>
                  )}

                  {/* Scheduled Date & Time */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Date */}
                    <div>
                      <label
                        htmlFor={`date-${farm.farmId}`}
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {farmOption?.method === "PICKUP" ? "Pickup" : "Delivery"} Date{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id={`date-${farm.farmId}`}
                        value={farmOption?.scheduledDate || ""}
                        onChange={(e) =>
                          handleScheduledDateChange(farm.farmId, e.target.value)
                        }
                        min={getMinDate()}
                        max={getMaxDate()}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isProcessing}
                      />
                    </div>

                    {/* Time */}
                    <div>
                      <label
                        htmlFor={`time-${farm.farmId}`}
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {farmOption?.method === "PICKUP" ? "Pickup" : "Delivery"} Time{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        id={`time-${farm.farmId}`}
                        value={farmOption?.scheduledTime || ""}
                        onChange={(e) =>
                          handleScheduledTimeChange(farm.farmId, e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isProcessing}
                      >
                        <option value="">Select time</option>
                        <option value="8:00-10:00">8:00 AM - 10:00 AM</option>
                        <option value="10:00-12:00">10:00 AM - 12:00 PM</option>
                        <option value="12:00-14:00">12:00 PM - 2:00 PM</option>
                        <option value="14:00-16:00">2:00 PM - 4:00 PM</option>
                        <option value="16:00-18:00">4:00 PM - 6:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Farm Error */}
                  {farmError && (
                    <div className="mt-3 rounded-lg bg-red-50 p-3">
                      <p className="text-sm text-red-600">{farmError}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onBack}
              disabled={isProcessing}
            >
              Back to Address
            </Button>

            <Button
              type="submit"
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Continue to Payment"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
