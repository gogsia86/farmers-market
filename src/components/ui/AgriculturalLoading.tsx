"use client";

export interface AgriculturalLoadingProps {
  message?: string;
  className?: string;
}

export function AgriculturalLoading({
  message = "Loading agricultural data...",
  className,
}: AgriculturalLoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 ${className || ""}`}
    >
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-agricultural-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-agricultural-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
