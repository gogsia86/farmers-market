"use client";

import { AlertTriangle } from "lucide-react";
import { ReactNode } from "react";

export interface AgriculturalErrorProps {
  title?: string;
  message?: string | ReactNode;
  onRetry?: () => void;
  className?: string;
}

export function AgriculturalError({
  title = "Agricultural Error",
  message = "Something went wrong",
  onRetry,
  className,
}: AgriculturalErrorProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className || ""}`}
    >
      <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-agricultural-600 text-white rounded-md hover:bg-agricultural-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
