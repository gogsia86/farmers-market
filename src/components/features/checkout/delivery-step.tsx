"use client";

// 🚚 DELIVERY STEP - Divine Delivery Scheduling
// Handles delivery date/time selection and special instructions
// Follows React Hook Form + Zod validation patterns

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Clock, Truck } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { DeliveryInfo } from "./checkout-wizard";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const deliverySchema = z.object({
  preferredDate: z
    .string()
    .min(1, "Please select a delivery date")
    .refine(
      (date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      { message: "Delivery date must be today or later" }
    ),
  preferredTime: z
    .string()
    .min(1, "Please select a delivery time slot"),
  deliveryInstructions: z
    .string()
    .max(500, "Instructions must be less than 500 characters")
    .optional(),
});

type DeliveryFormData = z.infer<typeof deliverySchema>;

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface DeliveryStepProps {
  formData: {
    shipping: any;
    delivery: DeliveryInfo | null;
    payment: any;
  };
  onComplete: (data: DeliveryInfo) => void;
  onBack: () => void;
}

// ============================================================================
// DELIVERY STEP COMPONENT
// ============================================================================

export function DeliveryStep({
  formData,
  onComplete,
  onBack,
}: DeliveryStepProps) {
  // ==========================================================================
  // FORM INITIALIZATION
  // ==========================================================================
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: formData.delivery || {
      preferredDate: "",
      preferredTime: "",
      deliveryInstructions: "",
    },
  });

  // ==========================================================================
  // DELIVERY TIME SLOTS
  // ==========================================================================
  const timeSlots = [
    { value: "morning", label: "Morning (8:00 AM - 12:00 PM)" },
    { value: "afternoon", label: "Afternoon (12:00 PM - 4:00 PM)" },
    { value: "evening", label: "Evening (4:00 PM - 8:00 PM)" },
  ];

  // ==========================================================================
  // DATE HELPERS
  // ==========================================================================
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days in advance
    return maxDate.toISOString().split("T")[0];
  };

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const onSubmit = (data: DeliveryFormData) => {
    onComplete(data);
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  const selectedDate = watch("preferredDate");
  const selectedTime = watch("preferredTime");
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Truck className="h-6 w-6 text-green-600" />
          Delivery Schedule
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Choose when you'd like to receive your fresh farm products
        </p>
      </div>

      {/* Delivery Info Alert */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex gap-3">
          <Calendar className="h-5 w-5 flex-shrink-0 text-green-600" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-900">
              Fresh Farm Delivery
            </h3>
            <p className="mt-1 text-xs text-green-800">
              Your products will be freshly harvested and delivered within your
              selected time window. Orders are processed 24-48 hours in advance
              to ensure peak freshness.
            </p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Preferred Delivery Date */}
        <div>
          <Label htmlFor="preferredDate" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            Preferred Delivery Date *
          </Label>
          <Input
            id="preferredDate"
            type="date"
            min={getMinDate()}
            max={getMaxDate()}
            {...register("preferredDate")}
            className={`text-base ${errors.preferredDate ? "border-red-500" : ""}`}
          />
          {errors.preferredDate && (
            <p className="mt-1 text-xs text-red-600">
              {errors.preferredDate.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Select a date between tomorrow and 30 days from now
          </p>
        </div>

        {/* Preferred Time Slot */}
        <div>
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            Preferred Time Slot *
          </Label>
          <div className="mt-2 space-y-2">
            {timeSlots.map((slot) => (
              <label
                key={slot.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${selectedTime === slot.value
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50"
                  }`}
              >
                <input
                  type="radio"
                  value={slot.value}
                  {...register("preferredTime")}
                  className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {slot.label}
                  </p>
                </div>
                {selectedTime === slot.value && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>
          {errors.preferredTime && (
            <p className="mt-1 text-xs text-red-600">
              {errors.preferredTime.message}
            </p>
          )}
        </div>

        {/* Delivery Instructions */}
        <div>
          <Label htmlFor="deliveryInstructions">
            Delivery Instructions (Optional)
          </Label>
          <textarea
            id="deliveryInstructions"
            rows={4}
            placeholder="E.g., Leave at front door, Ring doorbell, Gate code: 1234"
            {...register("deliveryInstructions")}
            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.deliveryInstructions ? "border-red-500" : ""
              }`}
          />
          {errors.deliveryInstructions && (
            <p className="mt-1 text-xs text-red-600">
              {errors.deliveryInstructions.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Maximum 500 characters. Help us deliver your order smoothly.
          </p>
        </div>

        {/* Summary Preview */}
        {selectedDate && selectedTime && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Delivery Summary
            </h3>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Date:</span>{" "}
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p>
                <span className="font-medium">Time:</span>{" "}
                {timeSlots.find((s) => s.value === selectedTime)?.label}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Summary */}
      {hasErrors && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            Please fix the errors above to continue
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back to Shipping
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? "Saving..." : "Continue to Payment"}
        </Button>
      </div>
    </form>
  );
}
