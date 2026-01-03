"use client";

// 📍 DELIVERY ADDRESS FORM - Address Collection Component
// Comprehensive address form with validation and agricultural consciousness

import type { DeliveryAddress } from "@/app/(customer)/checkout/page";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface DeliveryAddressFormProps {
  initialData: DeliveryAddress | null;
  onSubmit: (address: DeliveryAddress) => void;
  isProcessing?: boolean;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

// ============================================================================
// US STATES
// ============================================================================

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

// ============================================================================
// DELIVERY ADDRESS FORM COMPONENT
// ============================================================================

export function DeliveryAddressForm({
  initialData,
  onSubmit,
  isProcessing = false,
}: DeliveryAddressFormProps) {
  // Form state
  const [formData, setFormData] = useState<DeliveryAddress>({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    deliveryInstructions: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  const validateField = (name: keyof DeliveryAddress, value: string): string | undefined => {
    switch (name) {
      case "fullName":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return undefined;

      case "phone": {
        if (!value.trim()) return "Phone number is required";
        const phoneRegex = /^[\d\s\-()]+$/;
        if (!phoneRegex.test(value)) return "Invalid phone number format";
        const digitsOnly = value.replace(/\D/g, "");
        if (digitsOnly.length < 10) return "Phone number must be at least 10 digits";
        return undefined;
      }

      case "addressLine1":
        if (!value.trim()) return "Street address is required";
        if (value.trim().length < 5) return "Address must be at least 5 characters";
        return undefined;

      case "city":
        if (!value.trim()) return "City is required";
        if (value.trim().length < 2) return "City must be at least 2 characters";
        return undefined;

      case "state":
        if (!value) return "State is required";
        return undefined;

      case "zipCode": {
        if (!value.trim()) return "ZIP code is required";
        const zipRegex = /^\d{5}(-\d{4})?$/;
        if (!zipRegex.test(value)) return "Invalid ZIP code format (e.g., 12345 or 12345-6789)";
        return undefined;
      }

      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    (["fullName", "phone", "addressLine1", "city", "state", "zipCode"] as const).forEach(
      (field) => {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
        }
      }
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate on blur
    const error = validateField(name as keyof DeliveryAddress, formData[name as keyof DeliveryAddress] || "");
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      fullName: true,
      phone: true,
      addressLine1: true,
      city: true,
      state: true,
      zipCode: true,
    });

    // Validate
    if (!validateForm()) {
      return;
    }

    // Submit
    onSubmit(formData);
  };

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  const showError = (field: keyof FormErrors) => {
    return touched[field] && errors[field];
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-100 p-2">
            <MapPin className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
            <p className="text-sm text-gray-600">Where should we deliver your fresh produce?</p>
          </div>
        </div>
      </CardHeader>

      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Contact Information</h3>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${showError("fullName")
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-green-500"
                  }`}
                placeholder="John Doe"
                disabled={isProcessing}
              />
              {showError("fullName") && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${showError("phone")
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-green-500"
                  }`}
                placeholder="(555) 123-4567"
                disabled={isProcessing}
              />
              {showError("phone") && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Address</h3>

            {/* Address Line 1 */}
            <div>
              <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="addressLine1"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${showError("addressLine1")
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-green-500"
                  }`}
                placeholder="123 Main Street"
                disabled={isProcessing}
              />
              {showError("addressLine1") && (
                <p className="mt-1 text-sm text-red-600">{errors.addressLine1}</p>
              )}
            </div>

            {/* Address Line 2 */}
            <div>
              <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                Apartment, Suite, etc. (Optional)
              </label>
              <input
                type="text"
                id="addressLine2"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Apt 4B"
                disabled={isProcessing}
              />
            </div>

            {/* City, State, ZIP */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              {/* City */}
              <div className="sm:col-span-3">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${showError("city")
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-500"
                    }`}
                  placeholder="San Francisco"
                  disabled={isProcessing}
                />
                {showError("city") && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              {/* State */}
              <div className="sm:col-span-1">
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${showError("state")
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-500"
                    }`}
                  disabled={isProcessing}
                >
                  <option value="">--</option>
                  {US_STATES.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.value}
                    </option>
                  ))}
                </select>
                {showError("state") && (
                  <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                )}
              </div>

              {/* ZIP Code */}
              <div className="sm:col-span-2">
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${showError("zipCode")
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-500"
                    }`}
                  placeholder="94102"
                  disabled={isProcessing}
                />
                {showError("zipCode") && (
                  <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Instructions */}
          <div>
            <label
              htmlFor="deliveryInstructions"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Delivery Instructions (Optional)
            </label>
            <textarea
              id="deliveryInstructions"
              name="deliveryInstructions"
              value={formData.deliveryInstructions}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Leave at front door, ring doorbell, etc."
              disabled={isProcessing}
            />
            <p className="mt-1 text-xs text-gray-500">
              Let us know if there are any special instructions for delivery.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Continue to Delivery Options"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
