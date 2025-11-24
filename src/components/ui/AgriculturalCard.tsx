"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface AgriculturalCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "agricultural" | "divine";
  interactive?: boolean;
  onClick?: () => void;
}

export function AgriculturalCard({
  children,
  className,
  variant = "default",
  interactive = false,
  onClick,
}: AgriculturalCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg shadow-lg overflow-hidden",
        {
          "hover:shadow-xl transition-shadow cursor-pointer": interactive,
          "bg-white": variant === "default",
          "bg-agricultural-50 border-2 border-agricultural-200":
            variant === "agricultural",
          "bg-gradient-to-br from-purple-50 to-pink-50": variant === "divine",
        },
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AgriculturalCardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("px-6 py-4 border-b", className)}>{children}</div>;
}

export function AgriculturalCardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

export function AgriculturalCardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-6 py-4 bg-gray-50 border-t", className)}>
      {children}
    </div>
  );
}
