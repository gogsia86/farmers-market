"use client";

import { AgriculturalCard } from "@/components/ui/AgriculturalCard";
import { AgriculturalLoading } from "@/components/ui/AgriculturalLoading";
import type { ShippingRateResult } from "@/types/shipping.types";
import { useEffect, useState } from "react";

interface DeliveryOptionsProps {
  farmId: string;
  zipCode: string;
  orderWeight: number;
  orderValue: number;
  onSelectMethod: (method: ShippingRateResult) => void;
}

export function DeliveryOptions({
  farmId,
  zipCode,
  orderWeight,
  orderValue,
  onSelectMethod,
}: DeliveryOptionsProps) {
  const [methods, setMethods] = useState<ShippingRateResult[]>([]);
  const [selectedMethod, setSelectedMethod] =
    useState<ShippingRateResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShippingMethods();
  }, [farmId, zipCode, orderWeight, orderValue]);

  const fetchShippingMethods = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/shipping/calculate?farmId=${farmId}&zipCode=${zipCode}&weight=${orderWeight}&value=${orderValue}`
      );

      const data = await response.json();

      if (data.success) {
        setMethods(data.methods);
        // Auto-select first method
        if (data.methods.length > 0) {
          setSelectedMethod(data.methods[0]);
        }
      } else {
        setError(data.error || "Failed to load shipping methods");
      }
    } catch (err) {
      setError("Failed to load shipping options");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMethod = (method: ShippingRateResult) => {
    setSelectedMethod(method);
    onSelectMethod(method);
  };

  if (isLoading) {
    return (
      <AgriculturalLoading
        type="germinating"
        message="Calculating shipping options..."
      />
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  if (methods.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
        No shipping options available for your location.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Select Delivery Method
      </h3>

      <div className="grid gap-4">
        {methods.map((method, index) => (
          <AgriculturalCard
            key={`${method.method}-${index}`}
            consciousness={
              selectedMethod?.method === method.method
                ? "harvesting"
                : "growing"
            }
            elevation={
              selectedMethod?.method === method.method ? "elevated" : "flat"
            }
            interactive
            onClick={() => handleSelectMethod(method)}
            className={`cursor-pointer transition-all ${
              selectedMethod?.method === method.method
                ? "ring-2 ring-agricultural-500"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Radio button */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod?.method === method.method
                      ? "border-agricultural-500 bg-agricultural-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedMethod?.method === method.method && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>

                <div>
                  <p className="font-semibold text-gray-900">
                    {getMethodLabel(method.method)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {method.carrier} ·{" "}
                    {method.estimatedDays === 0
                      ? "Same day pickup"
                      : `${method.estimatedDays} business days`}
                  </p>
                  {method.reason && (
                    <p className="text-sm text-agricultural-600 mt-1">
                      {method.reason}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {method.isFree ? (
                    <span className="text-agricultural-600">FREE</span>
                  ) : (
                    `$${method.rate.toFixed(2)}`
                  )}
                </p>
              </div>
            </div>
          </AgriculturalCard>
        ))}
      </div>

      {selectedMethod && (
        <div className="mt-6 p-4 bg-agricultural-50 border border-agricultural-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Selected Method</p>
              <p className="font-semibold text-gray-900">
                {getMethodLabel(selectedMethod.method)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Shipping Cost</p>
              <p className="text-xl font-bold text-agricultural-600">
                {selectedMethod.isFree
                  ? "FREE"
                  : `$${selectedMethod.rate.toFixed(2)}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    STANDARD: "Standard Shipping",
    EXPRESS: "Express Shipping",
    LOCAL_PICKUP: "Local Pickup",
    FARM_PICKUP: "Farm Pickup",
  };

  return labels[method] || method;
}
