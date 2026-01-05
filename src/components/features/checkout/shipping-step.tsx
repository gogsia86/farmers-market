"use client";

// 📦 SHIPPING STEP - Divine Address Collection
// Handles shipping address form with validation and saved addresses
// Follows React Hook Form + Zod validation patterns

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UserAddress } from "@prisma/client";
import { Home, MapPin, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { ShippingAddress } from "./checkout-wizard";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const shippingSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone must be 10 digits (no spaces or dashes)"),
  street: z
    .string()
    .min(5, "Street address must be at least 5 characters")
    .max(255, "Street address is too long"),
  street2: z.string().max(255, "Address line 2 is too long").optional(),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City name is too long"),
  state: z
    .string()
    .length(2, "State must be 2 characters (e.g., CA, NY, TX)")
    .regex(/^[A-Z]{2}$/, "State must be uppercase letters"),
  zipCode: z
    .string()
    .regex(/^\d{5}$/, "ZIP code must be 5 digits"),
  country: z.string(),
  saveAddress: z.boolean().optional(),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface ShippingStepProps {
  formData: {
    shipping: ShippingAddress | null;
    delivery: any;
    payment: any;
  };
  onComplete: (data: ShippingAddress) => void;
  onBack: () => void;
  savedAddresses: UserAddress[];
}

// ============================================================================
// SHIPPING STEP COMPONENT
// ============================================================================

export function ShippingStep({
  formData,
  onComplete,
  savedAddresses,
}: ShippingStepProps) {
  // ==========================================================================
  // FORM INITIALIZATION
  // ==========================================================================
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ShippingAddress>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: formData.shipping?.fullName || "",
      phone: formData.shipping?.phone || "",
      street: formData.shipping?.street || "",
      street2: formData.shipping?.street2 || "",
      city: formData.shipping?.city || "",
      state: formData.shipping?.state || "",
      zipCode: formData.shipping?.zipCode || "",
      country: formData.shipping?.country || "US",
      saveAddress: formData.shipping?.saveAddress ?? true,
    },
  });

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const onSubmit = (data: ShippingAddress) => {
    onComplete(data);
  };

  const loadSavedAddress = (address: UserAddress) => {
    setValue("fullName", `${address.street.split(",")[0]}`); // Parse if needed
    setValue("phone", ""); // Phone not stored in UserAddress schema, user must enter
    setValue("street", address.street);
    setValue("street2", address.street2 || "");
    setValue("city", address.city);
    setValue("state", address.state);
    setValue("zipCode", address.zipCode);
    setValue("country", address.country);
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <MapPin className="h-6 w-6 text-green-600" />
          Shipping Address
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Where should we deliver your fresh farm products?
        </p>
      </div>

      {/* Saved Addresses Section */}
      {savedAddresses.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Use a saved address
          </Label>
          <div className="space-y-2">
            {savedAddresses.slice(0, 3).map((address) => (
              <button
                key={address.id}
                type="button"
                onClick={() => loadSavedAddress(address)}
                className="w-full rounded-lg border-2 border-gray-200 bg-white p-4 text-left transition-all hover:border-green-500 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <Home className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {address.label && (
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          {address.label}
                        </span>
                      )}
                      {address.isDefault && (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {address.street}
                      {address.street2 && `, ${address.street2}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">
                or enter a new address
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <Label htmlFor="fullName" className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            Full Name *
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            {...register("fullName")}
            className={errors.fullName ? "border-red-500" : ""}
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-600">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="5551234567 (10 digits)"
            {...register("phone")}
            className={errors.phone ? "border-red-500" : ""}
            maxLength={10}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Street Address */}
        <div>
          <Label htmlFor="street">Street Address *</Label>
          <Input
            id="street"
            type="text"
            placeholder="123 Main Street"
            {...register("street")}
            className={errors.street ? "border-red-500" : ""}
          />
          {errors.street && (
            <p className="mt-1 text-xs text-red-600">
              {errors.street.message}
            </p>
          )}
        </div>

        {/* Address Line 2 */}
        <div>
          <Label htmlFor="street2">
            Apartment, Suite, etc. (Optional)
          </Label>
          <Input
            id="street2"
            type="text"
            placeholder="Apt 4B"
            {...register("street2")}
            className={errors.street2 ? "border-red-500" : ""}
          />
          {errors.street2 && (
            <p className="mt-1 text-xs text-red-600">
              {errors.street2.message}
            </p>
          )}
        </div>

        {/* City, State, ZIP (Grid) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* City */}
          <div className="md:col-span-1">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              type="text"
              placeholder="Los Angeles"
              {...register("city")}
              className={errors.city ? "border-red-500" : ""}
            />
            {errors.city && (
              <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>
            )}
          </div>

          {/* State */}
          <div className="md:col-span-1">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              type="text"
              placeholder="CA"
              maxLength={2}
              {...register("state")}
              className={`uppercase ${errors.state ? "border-red-500" : ""}`}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
              }}
            />
            {errors.state && (
              <p className="mt-1 text-xs text-red-600">
                {errors.state.message}
              </p>
            )}
          </div>

          {/* ZIP Code */}
          <div className="md:col-span-1">
            <Label htmlFor="zipCode">ZIP Code *</Label>
            <Input
              id="zipCode"
              type="text"
              placeholder="90210"
              maxLength={5}
              {...register("zipCode")}
              className={errors.zipCode ? "border-red-500" : ""}
            />
            {errors.zipCode && (
              <p className="mt-1 text-xs text-red-600">
                {errors.zipCode.message}
              </p>
            )}
          </div>
        </div>

        {/* Save Address Checkbox */}
        <div className="flex items-center gap-2">
          <input
            id="saveAddress"
            type="checkbox"
            {...register("saveAddress")}
            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <Label
            htmlFor="saveAddress"
            className="cursor-pointer text-sm font-normal"
          >
            Save this address for future orders
          </Label>
        </div>
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
      <div className="flex items-center justify-end gap-3 border-t pt-6">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? "Saving..." : "Continue to Delivery"}
        </Button>
      </div>
    </form>
  );
}
