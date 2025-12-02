"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface BadgeProps {
  children: ReactNode;
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "success"
    | "warning"
    | "error";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-gray-100 text-gray-800": variant === "default",
          "bg-blue-100 text-blue-800": variant === "secondary",
          "border border-gray-300 text-gray-700 bg-transparent":
            variant === "outline",
          "bg-green-100 text-green-800": variant === "success",
          "bg-yellow-100 text-yellow-800": variant === "warning",
          "bg-red-100 text-red-800": variant === "error",
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
