/**
 * PENDING FARMS ALERT COMPONENT
 * Divine notification for pending farm verifications
 */

"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface PendingFarmsAlertProps {
  count: number;
}

export function PendingFarmsAlert({ count }: PendingFarmsAlertProps) {
  if (count === 0) return null;

  return (
    <div className="mt-6 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg shadow-sm">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon
            className="h-5 w-5 text-amber-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <p className="text-sm text-amber-700">
            <span className="font-medium">{count}</span> farm
            {count !== 1 ? "s are" : " is"} pending verification.{" "}
            <span className="font-medium">
              Review these farms to maintain platform quality
            </span>{" "}
            and help farmers get their products to market.
          </p>
        </div>
      </div>
    </div>
  );
}
