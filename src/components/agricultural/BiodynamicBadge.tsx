"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Award,
  Leaf,
  Heart,
  Sprout,
  ShieldCheck,
  Star,
  CheckCircle,
  Sparkles,
  Sun,
  Moon
} from "lucide-react";

// ============================================================================
// TYPES & INTERFACES - Divine Agricultural Type System
// ============================================================================

export type CertificationType =
  | "ORGANIC"
  | "BIODYNAMIC"
  | "REGENERATIVE"
  | "NON_GMO"
  | "FAIR_TRADE"
  | "LOCAL"
  | "SUSTAINABLE"
  | "PERMACULTURE"
  | "PESTICIDE_FREE"
  | "HEIRLOOM";

export type BadgeSize = "sm" | "md" | "lg" | "xl";
export type BadgeVariant = "default" | "outlined" | "filled" | "minimal";

export interface BiodynamicBadgeProps {
  /** Type of certification or practice */
  type: CertificationType;
  /** Display size */
  size?: BadgeSize;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Show label text */
  showLabel?: boolean;
  /** Show verification checkmark */
  showVerified?: boolean;
  /** Verification date */
  verifiedDate?: Date;
  /** Custom tooltip text */
  tooltip?: string;
  /** Custom className */
  className?: string;
  /** Animated hover effects */
  animated?: boolean;
  /** On badge click handler */
  onClick?: () => void;
}

interface CertificationConfig {
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  gradient: string;
  description: string;
  emoji: string;
}

// ============================================================================
// CERTIFICATION CONFIGURATIONS - Biodynamic Consciousness
// ============================================================================

const CERTIFICATION_CONFIG: Record<CertificationType, CertificationConfig> = {
  ORGANIC: {
    label: "Certified Organic",
    shortLabel: "Organic",
    icon: Leaf,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-500",
    gradient: "from-green-500 to-emerald-600",
    description: "Grown without synthetic pesticides or fertilizers",
    emoji: "🌿"
  },
  BIODYNAMIC: {
    label: "Biodynamic Certified",
    shortLabel: "Biodynamic",
    icon: Moon,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-500",
    gradient: "from-purple-500 to-indigo-600",
    description: "Holistic farming aligned with natural cycles",
    emoji: "🌙"
  },
  REGENERATIVE: {
    label: "Regenerative Agriculture",
    shortLabel: "Regenerative",
    icon: Sprout,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-500",
    gradient: "from-teal-500 to-cyan-600",
    description: "Practices that restore and improve soil health",
    emoji: "🌱"
  },
  NON_GMO: {
    label: "Non-GMO Verified",
    shortLabel: "Non-GMO",
    icon: ShieldCheck,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-500",
    gradient: "from-blue-500 to-cyan-600",
    description: "No genetically modified organisms",
    emoji: "🛡️"
  },
  FAIR_TRADE: {
    label: "Fair Trade Certified",
    shortLabel: "Fair Trade",
    icon: Heart,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-500",
    gradient: "from-rose-500 to-pink-600",
    description: "Ethical labor practices and fair compensation",
    emoji: "❤️"
  },
  LOCAL: {
    label: "Locally Grown",
    shortLabel: "Local",
    icon: Sun,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-500",
    gradient: "from-amber-500 to-orange-600",
    description: "Grown within your local community",
    emoji: "☀️"
  },
  SUSTAINABLE: {
    label: "Sustainable Practices",
    shortLabel: "Sustainable",
    icon: Award,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-500",
    gradient: "from-emerald-500 to-green-600",
    description: "Environmentally responsible farming methods",
    emoji: "♻️"
  },
  PERMACULTURE: {
    label: "Permaculture Design",
    shortLabel: "Permaculture",
    icon: Sparkles,
    color: "text-lime-600",
    bgColor: "bg-lime-50",
    borderColor: "border-lime-500",
    gradient: "from-lime-500 to-green-600",
    description: "Ecological design principles for sustainable systems",
    emoji: "✨"
  },
  PESTICIDE_FREE: {
    label: "Pesticide Free",
    shortLabel: "No Pesticides",
    icon: CheckCircle,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-500",
    gradient: "from-cyan-500 to-teal-600",
    description: "Grown without any pesticide use",
    emoji: "✓"
  },
  HEIRLOOM: {
    label: "Heirloom Varieties",
    shortLabel: "Heirloom",
    icon: Star,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-500",
    gradient: "from-orange-500 to-red-600",
    description: "Traditional, non-hybrid plant varieties",
    emoji: "⭐"
  }
};

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

const SIZE_CONFIG = {
  sm: {
    container: "px-2 py-1 gap-1",
    icon: "h-3 w-3",
    text: "text-xs",
    badge: "h-3 w-3"
  },
  md: {
    container: "px-3 py-1.5 gap-1.5",
    icon: "h-4 w-4",
    text: "text-sm",
    badge: "h-4 w-4"
  },
  lg: {
    container: "px-4 py-2 gap-2",
    icon: "h-5 w-5",
    text: "text-base",
    badge: "h-5 w-5"
  },
  xl: {
    container: "px-5 py-3 gap-2.5",
    icon: "h-6 w-6",
    text: "text-lg",
    badge: "h-6 w-6"
  }
};

// ============================================================================
// BIODYNAMIC BADGE COMPONENT - Divine Implementation
// ============================================================================

export function BiodynamicBadge({
  type,
  size = "md",
  variant = "default",
  showLabel = true,
  showVerified = true,
  verifiedDate,
  tooltip,
  className,
  animated = true,
  onClick
}: BiodynamicBadgeProps) {
  const config = CERTIFICATION_CONFIG[type];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  const tooltipText = tooltip || config.description;
  const isInteractive = onClick !== undefined;

  // Minimal variant - icon only
  if (variant === "minimal") {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          sizeConfig.badge,
          config.color,
          isInteractive && "cursor-pointer hover:opacity-80",
          animated && "transition-opacity",
          className
        )}
        onClick={onClick}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        title={tooltipText}
        aria-label={config.label}
      >
        <Icon className="h-full w-full" aria-hidden="true" />
      </div>
    );
  }

  // Outlined variant
  if (variant === "outlined") {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-full border-2",
          sizeConfig.container,
          config.borderColor,
          "bg-white",
          config.color,
          isInteractive && "cursor-pointer hover:bg-gray-50",
          animated && "transition-colors",
          className
        )}
        onClick={onClick}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onKeyDown={(e) => {
          if (isInteractive && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClick?.();
          }
        }}
        title={tooltipText}
        aria-label={config.label}
      >
        <Icon className={sizeConfig.icon} aria-hidden="true" />
        {showLabel && (
          <span className={cn("font-semibold", sizeConfig.text)}>
            {config.shortLabel}
          </span>
        )}
        {showVerified && (
          <CheckCircle className={cn(sizeConfig.icon, "ml-0.5")} aria-hidden="true" />
        )}
      </div>
    );
  }

  // Filled variant
  if (variant === "filled") {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-full",
          sizeConfig.container,
          "bg-gradient-to-r text-white shadow-md",
          config.gradient,
          isInteractive && "cursor-pointer hover:shadow-lg",
          animated && "transition-shadow",
          className
        )}
        onClick={onClick}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onKeyDown={(e) => {
          if (isInteractive && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClick?.();
          }
        }}
        title={tooltipText}
        aria-label={config.label}
      >
        <Icon className={sizeConfig.icon} aria-hidden="true" />
        {showLabel && (
          <span className={cn("font-semibold", sizeConfig.text)}>
            {config.shortLabel}
          </span>
        )}
        {showVerified && (
          <CheckCircle className={cn(sizeConfig.icon, "ml-0.5")} aria-hidden="true" />
        )}
      </div>
    );
  }

  // Default variant - soft background
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border",
        sizeConfig.container,
        config.bgColor,
        config.borderColor,
        config.color,
        isInteractive && "cursor-pointer hover:shadow-md",
        animated && "transition-shadow",
        className
      )}
      onClick={onClick}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={(e) => {
        if (isInteractive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.();
        }
      }}
      title={tooltipText}
      aria-label={config.label}
    >
      <Icon className={sizeConfig.icon} aria-hidden="true" />
      {showLabel && (
        <span className={cn("font-semibold", sizeConfig.text)}>
          {config.shortLabel}
        </span>
      )}
      {showVerified && (
        <CheckCircle className={cn(sizeConfig.icon, "ml-0.5")} aria-hidden="true" />
      )}
      {verifiedDate && (
        <span className={cn("text-xs opacity-75 ml-1")}>
          {verifiedDate.getFullYear()}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// BADGE GROUP COMPONENT - Multiple Badges Display
// ============================================================================

export interface BiodynamicBadgeGroupProps {
  /** Array of certification types */
  certifications: CertificationType[];
  /** Display size */
  size?: BadgeSize;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Show labels */
  showLabels?: boolean;
  /** Maximum badges to show before "+X more" */
  maxVisible?: number;
  /** Layout direction */
  direction?: "horizontal" | "vertical";
  /** Custom className */
  className?: string;
  /** On badge click handler */
  onBadgeClick?: (type: CertificationType) => void;
}

export function BiodynamicBadgeGroup({
  certifications,
  size = "md",
  variant = "default",
  showLabels = true,
  maxVisible = 3,
  direction = "horizontal",
  className,
  onBadgeClick
}: BiodynamicBadgeGroupProps) {
  const visibleCerts = certifications.slice(0, maxVisible);
  const remainingCount = certifications.length - maxVisible;

  return (
    <div
      className={cn(
        "flex items-center",
        direction === "horizontal" ? "flex-row flex-wrap gap-2" : "flex-col gap-2",
        className
      )}
      role="list"
      aria-label="Certifications and practices"
    >
      {visibleCerts.map((cert) => (
        <div key={cert} role="listitem">
          <BiodynamicBadge
            type={cert}
            size={size}
            variant={variant}
            showLabel={showLabels}
            onClick={onBadgeClick ? () => onBadgeClick(cert) : undefined}
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <span
          className={cn(
            "inline-flex items-center px-2 py-1 rounded-full",
            "bg-gray-100 border border-gray-300 text-gray-600",
            "text-xs font-medium"
          )}
        >
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get certification configuration
 */
export function getCertificationConfig(type: CertificationType): CertificationConfig {
  return CERTIFICATION_CONFIG[type];
}

/**
 * Check if certification type is valid
 */
export function isValidCertification(type: string): type is CertificationType {
  return type in CERTIFICATION_CONFIG;
}

/**
 * Get all available certification types
 */
export function getAllCertificationTypes(): CertificationType[] {
  return Object.keys(CERTIFICATION_CONFIG) as CertificationType[];
}

/**
 * Filter certifications by category
 */
export function getCertificationsByCategory(category: "environmental" | "social" | "quality"): CertificationType[] {
  const categories: Record<string, CertificationType[]> = {
    environmental: ["ORGANIC", "BIODYNAMIC", "REGENERATIVE", "SUSTAINABLE", "PERMACULTURE", "PESTICIDE_FREE"],
    social: ["FAIR_TRADE", "LOCAL"],
    quality: ["NON_GMO", "HEIRLOOM"]
  };
  return categories[category] || [];
}

// ============================================================================
// DISPLAY NAMES - For React DevTools
// ============================================================================

BiodynamicBadge.displayName = "BiodynamicBadge";
BiodynamicBadgeGroup.displayName = "BiodynamicBadgeGroup";

// ============================================================================
// EXPORTS
// ============================================================================

export { CERTIFICATION_CONFIG };
export default BiodynamicBadge;
