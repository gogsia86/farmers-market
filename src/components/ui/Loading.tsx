"use client";

import { cn } from "@/lib/utils";

export interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function Loading({ size = "md", className, text }: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className,
      )}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-gray-300 border-t-blue-600",
          sizeClasses[size],
        )}
      />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse bg-gray-200 rounded", className)}
      style={{ minHeight: "1rem" }}
    />
  );
}
