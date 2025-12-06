"use client";

/**
 * 📍 ADDRESS STEP - Checkout Flow Step 2
 * Shipping address selection and entry
 *
 * Features:
 * - Saved address selection
 * - New address entry form
 * - Address validation
 * - Fulfillment method selection (Delivery/Pickup)
 * - Delivery instructions
 * - Agricultural consciousness UI
 */

import { useState, useEffect } from "react";
import { MapPin, Plus, Check, Truck, Store } from "lucide-react";
import { useCheckoutStore } from "@/stores/checkoutStore";

// ============================================================================
// TYPES
// ============================================================================

interface SavedAddress {
  id: string;
  type: "HOME" | "WORK" | "OTHER";
  label?: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

// ============================================================================
// ADDRESS STEP COMPONENT
// ============================================================================

export function AddressStep() {
  const [localSavedAddresses, setLocalSavedAddresses] = useState<
    SavedAddress[]
  >([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newAddress, setNewAddress] = useState({
    street: "",
    street2: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const shippingAddress = useCheckoutStore((state) => state.shippingAddress);
  const fulfillmentMethod = useCheckoutStore(
    (state) => state.fulfillmentMethod,
  );
  const deliveryInstructions = useCheckoutStore(
    (state) => state.deliveryInstructions,
  );
  const setShippingAddress = useCheckoutStore(
    (state) => state.setShippingAddress,
  );
  const setFulfillmentMethod = useCheckoutStore(
    (state) => state.setFulfillmentMethod,
  );
  const setDeliveryInstructions = useCheckoutStore(
    (state) => state.setDeliveryInstructions,
  );

  // Fetch saved addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoading(true);
        // TODO: Fetch from API
        // const response = await fetch("/api/user/addresses");
        // const data = await response.json();

        // Mock data for now
        const mockAddresses: SavedAddress[] = [
          {
            id: "1",
            type: "HOME",
            label: "Home",
            street: "123 Main Street",
            city: "Portland",
            state: "OR",
            zipCode: "97201",
            isDefault: true,
          },
        ];

        setLocalSavedAddresses(mockAddresses);

        // Set default address if exists
        const defaultAddr = mockAddresses.find((a) => a.isDefault);
        if (defaultAddr && !shippingAddress) {
          setSelectedAddressId(defaultAddr.id);
          setShippingAddress({
            id: defaultAddr.id,
            street: defaultAddr.street,
            street2: defaultAddr.street2,
            city: defaultAddr.city,
            state: defaultAddr.state,
            zipCode: defaultAddr.zipCode,
            country: "US",
          });
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  // Handle address selection
  const handleSelectAddress = (address: SavedAddress) => {
    setSelectedAddressId(address.id);
    setShippingAddress({
      id: address.id,
      street: address.street,
      street2: address.street2,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: "US",
    });
    setShowNewAddressForm(false);
  };

  // Handle new address submission
  const handleSubmitNewAddress = () => {
    if (
      !newAddress.street ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.zipCode
    ) {
      return;
    }

    setShippingAddress({
      street: newAddress.street,
      street2: newAddress.street2,
      city: newAddress.city,
      state: newAddress.state,
      zipCode: newAddress.zipCode,
      country: "US",
    });
    setShowNewAddressForm(false);
  };

  if (isLoading) {
    return <AddressSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Fulfillment Method Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Fulfillment Method
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setFulfillmentMethod("DELIVERY")}
            className={`p-4 border-2 rounded-lg transition-all ${
              fulfillmentMethod === "DELIVERY"
                ? "border-amber-500 bg-amber-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Truck className="h-8 w-8 text-amber-600" />
              <span className="font-medium text-gray-900">Delivery</span>
              <span className="text-xs text-gray-600">
                Ships to your address
              </span>
            </div>
          </button>

          <button
            onClick={() => setFulfillmentMethod("FARM_PICKUP")}
            className={`p-4 border-2 rounded-lg transition-all ${
              fulfillmentMethod === "FARM_PICKUP"
                ? "border-amber-500 bg-amber-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Store className="h-8 w-8 text-amber-600" />
              <span className="font-medium text-gray-900">Pickup</span>
              <span className="text-xs text-gray-600">Pick up at farm</span>
            </div>
          </button>
        </div>
      </div>

      {/* Address Selection (only for delivery) */}
      {fulfillmentMethod === "DELIVERY" && (
        <>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Shipping Address
            </h3>

            {/* Saved Addresses */}
            {localSavedAddresses.length > 0 && !showNewAddressForm && (
              <div className="space-y-3 mb-4">
                {localSavedAddresses.map((address) => (
                  <button
                    key={address.id}
                    onClick={() => handleSelectAddress(address)}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                      selectedAddressId === address.id
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {address.label || address.type}
                            </span>
                            {address.isDefault && (
                              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {address.street}
                            {address.street2 && `, ${address.street2}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                        </div>
                      </div>
                      {selectedAddressId === address.id && (
                        <Check className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Add New Address Button */}
            {!showNewAddressForm && (
              <button
                onClick={() => setShowNewAddressForm(true)}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all text-gray-600 hover:text-amber-700 flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Add New Address</span>
              </button>
            )}

            {/* New Address Form */}
            {showNewAddressForm && (
              <div className="border-2 border-gray-300 rounded-lg p-6 space-y-4">
                <h4 className="font-semibold text-gray-900 mb-4">
                  New Address
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={newAddress.street}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, street: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apartment, suite, etc. (optional)
                  </label>
                  <input
                    type="text"
                    value={newAddress.street2}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, street2: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Apt 4B"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Portland"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={newAddress.state}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, state: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="OR"
                      maxLength={2}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={newAddress.zipCode}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, zipCode: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="97201"
                    maxLength={10}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowNewAddressForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitNewAddress}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-lg"
                  >
                    Use This Address
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Instructions (Optional)
            </label>
            <textarea
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
              placeholder="Leave at front door, ring doorbell, etc."
            />
          </div>
        </>
      )}

      {/* Pickup Instructions */}
      {(fulfillmentMethod === "FARM_PICKUP" ||
        fulfillmentMethod === "MARKET_PICKUP") && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">
            Pickup Information
          </h4>
          <p className="text-sm text-blue-800">
            You'll be able to schedule your pickup time for each farm in the
            next step. Pickup locations will be shown during the review process.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function AddressSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
      <div>
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
