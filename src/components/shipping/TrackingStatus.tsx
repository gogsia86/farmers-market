"use client";

import { AgriculturalCard } from "@/components/ui/AgriculturalCard";
import { AgriculturalLoading } from "@/components/ui/AgriculturalLoading";
import type { TrackingInfo } from "@/types/shipping.types";
import { useEffect, useState } from "react";

interface TrackingStatusProps {
  trackingNumber: string;
  carrier?: string;
}

export function TrackingStatus({
  trackingNumber,
  carrier,
}: TrackingStatusProps) {
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTracking();
  }, [trackingNumber]);

  const fetchTracking = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/shipping/tracking/${trackingNumber}`);
      const data = await response.json();

      if (data.success) {
        setTracking(data.tracking);
      } else {
        setError(data.error || "Failed to load tracking info");
      }
    } catch (err) {
      setError("Failed to load tracking information");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AgriculturalLoading
        type="processing"
        message="Loading tracking information..."
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

  if (!tracking) {
    return null;
  }

  return (
    <AgriculturalCard consciousness="harvesting" elevation="elevated">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Tracking Information
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {tracking.carrier} · {tracking.trackingNumber}
            </p>
          </div>

          <div
            className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(tracking.status)}`}
          >
            {getStatusLabel(tracking.status)}
          </div>
        </div>

        {/* Current Status */}
        {tracking.currentLocation && (
          <div className="p-4 bg-agricultural-50 rounded-lg">
            <p className="text-sm text-gray-600">Current Location</p>
            <p className="font-semibold text-gray-900 mt-1">
              {tracking.currentLocation}
            </p>
          </div>
        )}

        {/* Estimated Delivery */}
        {tracking.estimatedDelivery && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Estimated Delivery</p>
            <p className="font-semibold text-gray-900 mt-1">
              {new Date(tracking.estimatedDelivery).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                }
              )}
            </p>
          </div>
        )}

        {/* Tracking Timeline */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">
            Shipment Timeline
          </h4>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Timeline events */}
            <div className="space-y-6">
              {tracking.events.map((event, index) => (
                <div
                  key={index}
                  className="relative flex items-start space-x-4"
                >
                  {/* Timeline dot */}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 ? "bg-agricultural-500" : "bg-gray-300"
                    }`}
                  >
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>

                  {/* Event details */}
                  <div className="flex-1 pb-6">
                    <p className="font-semibold text-gray-900">
                      {event.description}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {event.location}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(event.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AgriculturalCard>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Pending",
    LABEL_CREATED: "Label Created",
    IN_TRANSIT: "In Transit",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    FAILED: "Delivery Failed",
    RETURNED: "Returned",
  };

  return labels[status] || status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-gray-100 text-gray-800",
    LABEL_CREATED: "bg-blue-100 text-blue-800",
    IN_TRANSIT: "bg-yellow-100 text-yellow-800",
    OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
    DELIVERED: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    RETURNED: "bg-purple-100 text-purple-800",
  };

  return colors[status] || "bg-gray-100 text-gray-800";
}
