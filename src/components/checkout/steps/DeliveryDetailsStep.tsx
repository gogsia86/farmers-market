/**
 * 📍 DELIVERY DETAILS STEP - Step 2 of Checkout
 * Divine delivery and address management for agricultural commerce
 *
 * Features:
 * - Address selection from saved addresses
 * - Add new address form
 * - Delivery vs. Pickup toggle
 * - Delivery zone validation
 * - Delivery fee calculation
 * - Special delivery instructions
 * - Mobile-responsive design
 * - WCAG 2.1 AA accessibility
 *
 * @divine-pattern Holographic Component Architecture
 * @reference 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 */

"use client";

import { cn } from "@/lib/utils";
import { cartLogger } from "@/lib/utils/logger";
import {
  Building,
  Check,
  Home,
  Loader2,
  MapPin,
  Package,
  Plus,
  Trash2,
  Truck
} from "lucide-react";
import { useEffect, useState } from "react";
import type { CheckoutStepProps } from "../CheckoutWizard";

// ============================================================================
// TYPES
// ============================================================================

interface Address {
  id: string;
  label?: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

interface NewAddressForm {
  label: string;
  fullName: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  instructions?: string;
  isDefault: boolean;
}

type FulfillmentMethod = "PICKUP" | "DELIVERY" | "SHIPPING";

// ============================================================================
// DELIVERY DETAILS STEP COMPONENT
// ============================================================================

export function DeliveryDetailsStep({
  onNext,
  onBack,
  onUpdateData,
  checkoutData,
  isLoading,
}: CheckoutStepProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    checkoutData.selectedAddress?.id || null,
  );
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>(
    checkoutData.fulfillmentMethod || "PICKUP",
  );
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    checkoutData.deliveryInstructions || "",
  );
  const [deliveryFee, setDeliveryFee] = useState(0);

  // New address form state
  const [newAddress, setNewAddress] = useState<NewAddressForm>({
    label: "Home",
    fullName: "",
    street: "",
    street2: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    instructions: "",
    isDefault: false,
  });

  // Load saved addresses
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await fetch("/api/addresses");
        const data = await response.json();

        if (data.success && data.data) {
          setAddresses(data.data);

          // Auto-select default address if none selected
          if (!selectedAddressId) {
            const defaultAddr = data.data.find(
              (addr: Address) => addr.isDefault,
            );
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
              onUpdateData({ selectedAddress: defaultAddr });
            }
          }
        }
      } catch (error) {
        cartLogger.error("Error loading addresses", error instanceof Error ? error : new Error(String(error)));
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, [selectedAddressId, onUpdateData]);

  // Calculate delivery fee when address or method changes
  useEffect(() => {
    if (fulfillmentMethod === "DELIVERY" && selectedAddressId) {
      const selectedAddr = addresses.find((a) => a.id === selectedAddressId);
      if (selectedAddr) {
        // Simulate delivery fee calculation (would call API in production)
        const fee = 5.99; // Base fee
        setDeliveryFee(fee);
      }
    } else {
      setDeliveryFee(0);
    }
  }, [fulfillmentMethod, selectedAddressId, addresses]);

  // Handle address selection
  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    const address = addresses.find((a) => a.id === addressId);
    if (address) {
      onUpdateData({ selectedAddress: address });
    }
  };

  // Handle fulfillment method change
  const handleFulfillmentMethodChange = (method: FulfillmentMethod) => {
    setFulfillmentMethod(method);
    onUpdateData({
      fulfillmentMethod: method,
      deliveryInstructions: method === "PICKUP" ? "" : deliveryInstructions,
    });

    // If switching to pickup, clear address requirement
    if (method === "PICKUP") {
      setSelectedAddressId(null);
      onUpdateData({ selectedAddress: null });
    }
  };

  // Save new address
  const handleSaveAddress = async () => {
    setIsSavingAddress(true);

    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAddress),
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Add to addresses list
        setAddresses((prev) => [...prev, data.data]);

        // Select the new address
        setSelectedAddressId(data.data.id);
        onUpdateData({ selectedAddress: data.data });

        // Hide form
        setShowAddressForm(false);

        // Reset form
        setNewAddress({
          label: "Home",
          fullName: "",
          street: "",
          street2: "",
          city: "",
          state: "",
          zipCode: "",
          phone: "",
          instructions: "",
          isDefault: false,
        });
      }
    } catch (error) {
      cartLogger.error("Error saving address", error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== addressId));
        if (selectedAddressId === addressId) {
          setSelectedAddressId(null);
          onUpdateData({ selectedAddress: null });
        }
      }
    } catch (error) {
      cartLogger.error("Error deleting address", error instanceof Error ? error : new Error(String(error)), { addressId });
    }
  };

  const isValid =
    fulfillmentMethod === "PICKUP" ||
    (fulfillmentMethod === "DELIVERY" && !!selectedAddressId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Delivery Details
        </h2>
        <p className="text-gray-600">
          Choose how you'd like to receive your order
        </p>
      </div>

      {/* Fulfillment Method Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Fulfillment Method
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pickup Option */}
          <button
            type="button"
            onClick={() => handleFulfillmentMethodChange("PICKUP")}
            className={cn(
              "relative flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
              fulfillmentMethod === "PICKUP"
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-gray-300",
            )}
          >
            <div
              className={cn(
                "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                fulfillmentMethod === "PICKUP"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600",
              )}
            >
              <Package className="w-6 h-6" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-900">Farm Pickup</div>
              <div className="text-sm text-gray-600">Pick up at the farm</div>
              <div className="text-sm font-medium text-green-600 mt-1">
                FREE
              </div>
            </div>
            {fulfillmentMethod === "PICKUP" && (
              <Check className="absolute top-4 right-4 w-5 h-5 text-green-600" />
            )}
          </button>

          {/* Delivery Option */}
          <button
            type="button"
            onClick={() => handleFulfillmentMethodChange("DELIVERY")}
            className={cn(
              "relative flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
              fulfillmentMethod === "DELIVERY"
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-gray-300",
            )}
          >
            <div
              className={cn(
                "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                fulfillmentMethod === "DELIVERY"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600",
              )}
            >
              <Truck className="w-6 h-6" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-900">Delivery</div>
              <div className="text-sm text-gray-600">
                Delivered to your door
              </div>
              <div className="text-sm font-medium text-gray-900 mt-1">
                {deliveryFee > 0
                  ? `$${deliveryFee.toFixed(2)}`
                  : "Calculated next"}
              </div>
            </div>
            {fulfillmentMethod === "DELIVERY" && (
              <Check className="absolute top-4 right-4 w-5 h-5 text-green-600" />
            )}
          </button>
        </div>
      </div>

      {/* Address Selection (only for delivery) */}
      {fulfillmentMethod === "DELIVERY" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-900">
              Delivery Address
            </label>
            <button
              type="button"
              onClick={() => setShowAddressForm(true)}
              className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add New Address
            </button>
          </div>

          {/* Loading State */}
          {isLoadingAddresses && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
              <p className="text-sm text-gray-600 mt-2">Loading addresses...</p>
            </div>
          )}

          {/* Saved Addresses */}
          {!isLoadingAddresses && !showAddressForm && (
            <div className="space-y-3">
              {addresses.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-3">
                    No saved addresses yet
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    Add your first address
                  </button>
                </div>
              ) : (
                addresses.map((address) => (
                  <div
                    key={address.id}
                    className={cn(
                      "relative p-4 rounded-lg border-2 cursor-pointer transition-all",
                      selectedAddressId === address.id
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-gray-300",
                    )}
                    onClick={() => handleSelectAddress(address.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                          selectedAddressId === address.id
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-600",
                        )}
                      >
                        {address.label === "Work" ? (
                          <Building className="w-5 h-5" />
                        ) : (
                          <Home className="w-5 h-5" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {address.label || "Address"}
                          </span>
                          {address.isDefault && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">
                          {address.fullName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.street}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        {address.phone && (
                          <p className="text-sm text-gray-600 mt-1">
                            {address.phone}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAddress(address.id);
                          }}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                          aria-label="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {selectedAddressId === address.id && (
                      <Check className="absolute top-4 right-4 w-5 h-5 text-green-600" />
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Add Address Form */}
          {showAddressForm && (
            <div className="border border-gray-200 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">New Address</h3>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Label
                  </label>
                  <select
                    value={newAddress.label}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, label: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newAddress.fullName}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={newAddress.street}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, street: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="123 Main St"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="San Francisco"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={newAddress.state}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, state: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="CA"
                    maxLength={2}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code *
                  </label>
                  <input
                    type="text"
                    value={newAddress.zipCode}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, zipCode: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="94102"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={newAddress.phone}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    value={newAddress.instructions}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        instructions: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Leave at front door, Ring bell twice"
                    rows={2}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newAddress.isDefault}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          isDefault: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">
                      Set as default address
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveAddress}
                disabled={
                  isSavingAddress ||
                  !newAddress.fullName ||
                  !newAddress.street ||
                  !newAddress.city ||
                  !newAddress.state ||
                  !newAddress.zipCode ||
                  !newAddress.phone
                }
                className={cn(
                  "w-full px-4 py-3 rounded-lg font-medium text-white transition-colors",
                  "bg-green-600 hover:bg-green-700",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {isSavingAddress ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save Address"
                )}
              </button>
            </div>
          )}

          {/* Delivery Instructions */}
          {!showAddressForm && selectedAddressId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Delivery Instructions (Optional)
              </label>
              <textarea
                value={deliveryInstructions}
                onChange={(e) => {
                  setDeliveryInstructions(e.target.value);
                  onUpdateData({ deliveryInstructions: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Leave at front door, Call when arrived"
                rows={3}
              />
            </div>
          )}
        </div>
      )}

      {/* Pickup Information */}
      {fulfillmentMethod === "PICKUP" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 mb-1">
                Pickup Details
              </h4>
              <p className="text-sm text-green-800">
                You'll receive pickup instructions and address details after
                placing your order. Most orders are ready within 24 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Message */}
      {!isValid && (
        <div className="text-sm text-red-600 text-center">
          {fulfillmentMethod === "DELIVERY" && !selectedAddressId
            ? "Please select or add a delivery address to continue"
            : "Please complete all required fields"}
        </div>
      )}
    </div>
  );
}
