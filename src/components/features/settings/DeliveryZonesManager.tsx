/**
 * 🚚 DELIVERY ZONES MANAGER COMPONENT
 * Divine implementation for managing farm delivery areas
 * Features: Zone creation, radius configuration, fee management, map preview
 */

"use client";

import type { DeliveryArea } from "@/types/settings";
import {
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

interface DeliveryZonesManagerProps {
  /** Current delivery zones */
  value: DeliveryArea[];
  /** Callback when zones change */
  onChange: (zones: DeliveryArea[]) => void;
  /** Optional CSS class */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Farm location (center point for zones) */
  farmLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
}

/**
 * DeliveryZonesManager - Manage farm delivery areas
 *
 * @example
 * ```tsx
 * <DeliveryZonesManager
 *   value={deliveryZones}
 *   onChange={setDeliveryZones}
 *   farmLocation={farm.location}
 * />
 * ```
 */
export function DeliveryZonesManager({
  value,
  onChange,
  className = "",
  disabled = false,
  farmLocation,
}: DeliveryZonesManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newZone, setNewZone] = useState<Partial<DeliveryArea> | null>(null);

  /**
   * Start creating a new zone
   */
  const startNewZone = () => {
    setNewZone({
      zipCode: "",
      city: "",
      radius: 10,
      deliveryFee: 0,
    });
    setEditingIndex(null);
  };

  /**
   * Start editing an existing zone
   */
  const startEditZone = (index: number) => {
    setEditingIndex(index);
    setNewZone(null);
  };

  /**
   * Save new zone
   */
  const saveNewZone = () => {
    if (!newZone?.city || newZone.city.trim() === "") {
      return;
    }

    const zone: DeliveryArea = {
      city: newZone.city,
      zipCode: newZone.zipCode || "",
      radius: newZone.radius || 10,
      deliveryFee: newZone.deliveryFee || 0,
    };

    onChange([...value, zone]);
    setNewZone(null);
  };

  /**
   * Update existing zone
   */
  const updateZone = (index: number, updates: Partial<DeliveryArea>) => {
    const updated = value.map((zone, i) =>
      i === index ? { ...zone, ...updates } : zone,
    );
    onChange(updated);
  };

  /**
   * Delete zone
   */
  const deleteZone = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  /**
   * Cancel editing
   */
  const cancelEdit = () => {
    setEditingIndex(null);
    setNewZone(null);
  };

  /**
   * Update postal codes from comma-separated input
   */
  const updatePostalCodes = (index: number | null, input: string) => {
    const codes = input
      .split(",")
      .map((code) => code.trim())
      .filter((code) => code.length > 0);

    if (index !== null) {
      updateZone(index, { zipCode: codes.join(", ") });
    } else if (newZone) {
      setNewZone({ ...newZone, zipCode: codes.join(", ") });
    }
  };

  return (
    <div
      className={`space-y-4 ${className}`}
      data-testid="delivery-zones-manager"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPinIcon className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Delivery Zones</h3>
        </div>
        <button
          type="button"
          onClick={startNewZone}
          disabled={disabled || newZone !== null}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="add-zone-button"
        >
          <PlusIcon className="h-4 w-4" />
          Add Zone
        </button>
      </div>

      {/* Farm Location Info */}
      {farmLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Farm Location:</span>{" "}
            {farmLocation.address}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Delivery zones are calculated from this location
          </p>
        </div>
      )}

      {/* New Zone Form */}
      {newZone !== null && (
        <div
          className="border-2 border-green-500 rounded-lg p-4 bg-green-50"
          data-testid="new-zone-form"
        >
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            New Delivery Zone
          </h4>

          <div className="space-y-3">
            {/* Zone Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone Name *
              </label>
              <input
                type="text"
                value={newZone.city || ""}
                onChange={(e) =>
                  setNewZone({ ...newZone, city: e.target.value })
                }
                placeholder="e.g., Downtown, North County"
                disabled={disabled}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                data-testid="new-zone-name"
              />
            </div>

            {/* Delivery Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Radius (miles)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={newZone.radius || 10}
                onChange={(e) =>
                  setNewZone({
                    ...newZone,
                    radius: parseFloat(e.target.value) || 10,
                  })
                }
                disabled={disabled}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                data-testid="new-zone-radius"
              />
            </div>

            {/* Delivery Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Fee ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newZone.deliveryFee || 0}
                onChange={(e) =>
                  setNewZone({
                    ...newZone,
                    deliveryFee: parseFloat(e.target.value) || 0,
                  })
                }
                disabled={disabled}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                data-testid="new-zone-fee"
              />
            </div>

            {/* Postal Codes (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Codes (Optional)
              </label>
              <input
                type="text"
                value={newZone.zipCode || ""}
                onChange={(e) => updatePostalCodes(null, e.target.value)}
                placeholder="e.g., 12345, 12346, 12347"
                disabled={disabled}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                data-testid="new-zone-postal-codes"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate multiple postal codes with commas
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={saveNewZone}
                disabled={disabled || !newZone.city?.trim()}
                className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="save-new-zone"
              >
                Save Zone
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={disabled}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                data-testid="cancel-new-zone"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Zones List */}
      <div className="space-y-3">
        {value.length === 0 && newZone === null && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              No delivery zones configured
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Add a delivery zone to enable deliveries
            </p>
          </div>
        )}

        {value.map((zone, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${editingIndex === index
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-white"
              }`}
            data-testid={`zone-${index}`}
          >
            {editingIndex === index ? (
              // Edit Mode
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zone Name *
                  </label>
                  <input
                    type="text"
                    value={zone.city}
                    onChange={(e) =>
                      updateZone(index, { city: e.target.value })
                    }
                    disabled={disabled}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    data-testid={`edit-zone-name-${index}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Radius (miles)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={zone.radius || 10}
                      onChange={(e) =>
                        updateZone(index, {
                          radius: parseFloat(e.target.value) || 10,
                        })
                      }
                      disabled={disabled}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      data-testid={`edit-zone-radius-${index}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fee ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={zone.deliveryFee || 0}
                      onChange={(e) =>
                        updateZone(index, {
                          deliveryFee: parseFloat(e.target.value) || 0,
                        })
                      }
                      disabled={disabled}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      data-testid={`edit-zone-fee-${index}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Codes
                  </label>
                  <input
                    type="text"
                    value={zone.zipCode || ""}
                    onChange={(e) => updatePostalCodes(index, e.target.value)}
                    placeholder="e.g., 12345, 12346, 12347"
                    disabled={disabled}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    data-testid={`edit-zone-postal-codes-${index}`}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingIndex(null)}
                    disabled={disabled}
                    className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                    data-testid={`save-zone-${index}`}
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={disabled}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-medium text-gray-900">
                      {zone.city}
                    </h4>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Radius:</span>{" "}
                        {zone.radius} miles
                      </p>
                      <p>
                        <span className="font-medium">Delivery Fee:</span> $
                        {(zone.deliveryFee || 0).toFixed(2)}
                      </p>
                      {zone.zipCode && zone.zipCode.length > 0 && (
                        <p>
                          <span className="font-medium">Postal Codes:</span>{" "}
                          {zone.zipCode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() => startEditZone(index)}
                      disabled={disabled || newZone !== null}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50"
                      title="Edit zone"
                      data-testid={`edit-zone-${index}`}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteZone(index)}
                      disabled={disabled}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                      title="Delete zone"
                      data-testid={`delete-zone-${index}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Helper Text */}
      <p className="text-sm text-gray-500">
        Configure delivery zones to specify where you deliver and the associated
        fees. Zones can be defined by radius or specific postal codes.
      </p>
    </div>
  );
}
