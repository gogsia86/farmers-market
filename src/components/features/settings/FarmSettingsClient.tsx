/**
 * 🚜 FARM SETTINGS CLIENT COMPONENT
 * Divine implementation of comprehensive farm settings management
 * Features: Business hours, delivery zones, payment methods, policies, features
 */

"use client";

import { useState } from "react";
import { BusinessHoursEditor } from "./BusinessHoursEditor";
import { DeliveryZonesManager } from "./DeliveryZonesManager";
import { PaymentMethodsSettings } from "./PaymentMethodsSettings";
import type {
  FarmSettingsData,
  UpdateFarmSettingsRequest,
  BusinessHoursData,
  DeliveryArea,
  FarmPolicies,
  FarmFeatures,
} from "@/types/settings";

interface FarmSettingsClientProps {
  /** Current farm settings */
  settings: FarmSettingsData;
  /** Farm ID */
  farmId: string;
  /** Farm location */
  farmLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  /** Callback when settings are saved successfully */
  onSaveSuccess?: () => void;
}

/**
 * FarmSettingsClient - Comprehensive farm settings management
 *
 * @example
 * ```tsx
 * <FarmSettingsClient
 *   settings={farmSettings}
 *   farmId={farm.id}
 *   farmLocation={farm.location}
 *   onSaveSuccess={() => console.log("Settings saved!")}
 * />
 * ```
 */
export function FarmSettingsClient({
  settings: initialSettings,
  farmId,
  farmLocation,
  onSaveSuccess,
}: FarmSettingsClientProps) {
  // Local state for form data
  const [businessHours, setBusinessHours] = useState<BusinessHoursData[]>(
    initialSettings.businessHours || [],
  );
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>(
    initialSettings.deliveryAreas || [],
  );
  const [deliveryFee, setDeliveryFee] = useState<number>(
    initialSettings.deliveryFee || 0,
  );
  const [minOrderValue, setMinOrderValue] = useState<number>(
    initialSettings.minOrderValue || 0,
  );
  const [acceptedPaymentMethods, setAcceptedPaymentMethods] = useState<
    string[]
  >(initialSettings.acceptedPaymentMethods || []);
  const [requireDeposit, setRequireDeposit] = useState<boolean>(
    initialSettings.requireDepositOnOrders || false,
  );
  const [depositPercentage, setDepositPercentage] = useState<number>(
    initialSettings.depositPercentage || 25,
  );
  const [policies, setPolicies] = useState<FarmPolicies>(
    initialSettings.policies || {
      cancellationPolicy: "",
      returnPolicy: "",
      termsAndConditions: "",
    },
  );
  const [features, setFeatures] = useState<FarmFeatures>(
    initialSettings.features || {
      enablePreOrders: false,
      enableSubscriptions: false,
      enableGiftCards: false,
    },
  );

  // UI state
  const [activeTab, setActiveTab] = useState<
    "hours" | "delivery" | "payment" | "policies" | "features"
  >("hours");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  /**
   * Check if form has unsaved changes
   */
  const hasChanges = (): boolean => {
    return (
      JSON.stringify(businessHours) !==
        JSON.stringify(initialSettings.businessHours) ||
      JSON.stringify(deliveryAreas) !==
        JSON.stringify(initialSettings.deliveryAreas) ||
      deliveryFee !== initialSettings.deliveryFee ||
      minOrderValue !== initialSettings.minOrderValue ||
      JSON.stringify(acceptedPaymentMethods) !==
        JSON.stringify(initialSettings.acceptedPaymentMethods) ||
      requireDeposit !== initialSettings.requireDepositOnOrders ||
      depositPercentage !== initialSettings.depositPercentage ||
      JSON.stringify(policies) !== JSON.stringify(initialSettings.policies) ||
      JSON.stringify(features) !== JSON.stringify(initialSettings.features)
    );
  };

  /**
   * Save farm settings
   */
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const updates: UpdateFarmSettingsRequest = {
        businessHours,
        deliveryAreas,
        deliveryFee,
        minOrderValue,
        acceptedPaymentMethods,
        requireDepositOnOrders: requireDeposit,
        depositPercentage,
        policies,
        features,
      };

      const response = await fetch(`/api/settings/farm/${farmId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to save settings");
      }

      setSaveSuccess(true);
      onSaveSuccess?.();

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save settings",
      );
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Reset to initial values
   */
  const handleReset = () => {
    setBusinessHours(initialSettings.businessHours || []);
    setDeliveryAreas(initialSettings.deliveryAreas || []);
    setDeliveryFee(initialSettings.deliveryFee || 0);
    setMinOrderValue(initialSettings.minOrderValue || 0);
    setAcceptedPaymentMethods(initialSettings.acceptedPaymentMethods || []);
    setRequireDeposit(initialSettings.requireDepositOnOrders || false);
    setDepositPercentage(initialSettings.depositPercentage || 25);
    setPolicies(
      initialSettings.policies || {
        cancellationPolicy: "",
        returnPolicy: "",
        termsAndConditions: "",
      },
    );
    setFeatures(
      initialSettings.features || {
        enablePreOrders: false,
        enableSubscriptions: false,
        enableGiftCards: false,
      },
    );
    setSaveError(null);
    setSaveSuccess(false);
  };

  const tabs = [
    { id: "hours", label: "Business Hours" },
    { id: "delivery", label: "Delivery" },
    { id: "payment", label: "Payment" },
    { id: "policies", label: "Policies" },
    { id: "features", label: "Features" },
  ] as const;

  return (
    <div className="space-y-6" data-testid="farm-settings-client">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Settings tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                activeTab === tab.id
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
              data-testid={`tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <div
          className="rounded-md bg-green-50 p-4 border border-green-200"
          data-testid="save-success-message"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Settings saved successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {saveError && (
        <div
          className="rounded-md bg-red-50 p-4 border border-red-200"
          data-testid="save-error-message"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{saveError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === "hours" && (
          <BusinessHoursEditor
            value={businessHours}
            onChange={setBusinessHours}
          />
        )}

        {activeTab === "delivery" && (
          <div className="space-y-6">
            <DeliveryZonesManager
              value={deliveryAreas}
              onChange={setDeliveryAreas}
              farmLocation={farmLocation}
            />

            {/* Base Delivery Fee */}
            <div className="border-t border-gray-200 pt-6">
              <label
                htmlFor="delivery-fee"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Base Delivery Fee
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <input
                  type="number"
                  id="delivery-fee"
                  min="0"
                  step="0.01"
                  value={deliveryFee}
                  onChange={(e) =>
                    setDeliveryFee(parseFloat(e.target.value) || 0)
                  }
                  className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  data-testid="delivery-fee-input"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Base fee applies to all deliveries (zone fees will be added on
                top)
              </p>
            </div>

            {/* Minimum Order Value */}
            <div>
              <label
                htmlFor="min-order-value"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Minimum Order Value
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <input
                  type="number"
                  id="min-order-value"
                  min="0"
                  step="0.01"
                  value={minOrderValue}
                  onChange={(e) =>
                    setMinOrderValue(parseFloat(e.target.value) || 0)
                  }
                  className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  data-testid="min-order-value-input"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Customers must order at least this amount (set to 0 for no
                minimum)
              </p>
            </div>
          </div>
        )}

        {activeTab === "payment" && (
          <PaymentMethodsSettings
            acceptedMethods={acceptedPaymentMethods}
            onMethodsChange={setAcceptedPaymentMethods}
            requireDeposit={requireDeposit}
            onRequireDepositChange={setRequireDeposit}
            depositPercentage={depositPercentage}
            onDepositPercentageChange={setDepositPercentage}
          />
        )}

        {activeTab === "policies" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Farm Policies
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Define your farm's policies for cancellations, refunds, and
                returns
              </p>
            </div>

            {/* Cancellation Policy */}
            <div>
              <label
                htmlFor="cancellation-policy"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Cancellation Policy
              </label>
              <textarea
                id="cancellation-policy"
                rows={4}
                value={policies.cancellationPolicy || ""}
                onChange={(e) =>
                  setPolicies({
                    ...policies,
                    cancellationPolicy: e.target.value,
                  })
                }
                placeholder="Describe your cancellation policy..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                data-testid="cancellation-policy-textarea"
              />
            </div>

            {/* Terms and Conditions */}
            <div>
              <label
                htmlFor="terms-conditions"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Terms and Conditions
              </label>
              <textarea
                id="terms-conditions"
                rows={4}
                value={policies.termsAndConditions || ""}
                onChange={(e) =>
                  setPolicies({
                    ...policies,
                    termsAndConditions: e.target.value,
                  })
                }
                placeholder="Describe your terms and conditions..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                data-testid="terms-conditions-textarea"
              />
            </div>

            {/* Return Policy */}
            <div>
              <label
                htmlFor="return-policy"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Return Policy
              </label>
              <textarea
                id="return-policy"
                rows={4}
                value={policies.returnPolicy || ""}
                onChange={(e) =>
                  setPolicies({ ...policies, returnPolicy: e.target.value })
                }
                placeholder="Describe your return policy..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                data-testid="return-policy-textarea"
              />
            </div>
          </div>
        )}

        {activeTab === "features" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Farm Features
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Enable or disable additional features for your farm
              </p>
            </div>

            <div className="space-y-4">
              {/* Pre-Orders */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={features.enablePreOrders}
                    onChange={(e) =>
                      setFeatures({
                        ...features,
                        enablePreOrders: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    data-testid="enable-preorders-checkbox"
                  />
                </div>
                <div className="ml-3">
                  <label className="text-sm font-medium text-gray-900">
                    Enable Pre-Orders
                  </label>
                  <p className="text-sm text-gray-500">
                    Allow customers to pre-order products before they're
                    available
                  </p>
                </div>
              </div>

              {/* Subscriptions */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={features.enableSubscriptions}
                    onChange={(e) =>
                      setFeatures({
                        ...features,
                        enableSubscriptions: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    data-testid="enable-subscriptions-checkbox"
                  />
                </div>
                <div className="ml-3">
                  <label className="text-sm font-medium text-gray-900">
                    Enable Subscriptions
                  </label>
                  <p className="text-sm text-gray-500">
                    Allow customers to subscribe for recurring product
                    deliveries
                  </p>
                </div>
              </div>

              {/* Gift Cards */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={features.enableGiftCards}
                    onChange={(e) =>
                      setFeatures({
                        ...features,
                        enableGiftCards: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    data-testid="enable-giftcards-checkbox"
                  />
                </div>
                <div className="ml-3">
                  <label className="text-sm font-medium text-gray-900">
                    Enable Gift Cards
                  </label>
                  <p className="text-sm text-gray-500">
                    Allow customers to purchase and redeem gift cards
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleReset}
          disabled={!hasChanges() || isSaving}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="reset-button"
        >
          Reset Changes
        </button>
        <div className="flex items-center gap-3">
          {hasChanges() && (
            <span
              className="text-sm text-amber-600"
              data-testid="unsaved-changes-indicator"
            >
              You have unsaved changes
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges() || isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="save-button"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
