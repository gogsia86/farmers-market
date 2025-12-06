"use client";

/**
 * 🎨 EMPTY STATE COMPONENT
 * Reusable component for displaying empty states across the platform
 *
 * Divine Patterns:
 * - Consistent UX across all empty states
 * - Accessible and user-friendly
 * - Flexible and customizable
 * - Agricultural consciousness
 *
 * Features:
 * - Icon display
 * - Title and description
 * - Optional action button
 * - Optional secondary action
 * - Responsive design
 *
 * Reference: 08_UX_DESIGN_CONSCIOUSNESS.instructions.md
 */

import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";

export interface EmptyStateProps {
  /**
   * Icon to display (Lucide icon component)
   */
  icon: LucideIcon;

  /**
   * Main heading text
   */
  title: string;

  /**
   * Descriptive text explaining the empty state
   */
  description: string;

  /**
   * Optional secondary description
   */
  secondaryDescription?: string;

  /**
   * Primary action button configuration
   */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "outline" | "secondary";
  };

  /**
   * Secondary action button configuration
   */
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "outline" | "secondary";
  };

  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg";

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Show decorative elements
   */
  showDecoration?: boolean;
}

const sizeClasses = {
  sm: {
    container: "py-8",
    icon: "h-12 w-12",
    iconWrapper: "w-16 h-16",
    title: "text-lg",
    description: "text-sm",
    spacing: "space-y-3",
  },
  md: {
    container: "py-12",
    icon: "h-16 w-16",
    iconWrapper: "w-20 h-20",
    title: "text-xl",
    description: "text-base",
    spacing: "space-y-4",
  },
  lg: {
    container: "py-16",
    icon: "h-20 w-20",
    iconWrapper: "w-24 h-24",
    title: "text-2xl",
    description: "text-lg",
    spacing: "space-y-6",
  },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  secondaryDescription,
  action,
  secondaryAction,
  size = "md",
  className = "",
  showDecoration = false,
}: EmptyStateProps) {
  const sizes = sizeClasses[size];

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${sizes.container} ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Decorative Background (optional) */}
      {showDecoration && (
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-100 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-100 rounded-full blur-3xl" />
        </div>
      )}

      {/* Icon */}
      <div
        className={`relative inline-flex items-center justify-center ${sizes.iconWrapper} bg-gray-100 rounded-full mb-6`}
      >
        <Icon className={`${sizes.icon} text-gray-400`} aria-hidden="true" />

        {/* Icon decoration */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-200" />
      </div>

      {/* Content */}
      <div className={`max-w-md mx-auto ${sizes.spacing}`}>
        {/* Title */}
        <h3
          className={`${sizes.title} font-bold text-gray-900`}
          id="empty-state-title"
        >
          {title}
        </h3>

        {/* Description */}
        <div className="space-y-2">
          <p className={`${sizes.description} text-gray-600`}>
            {description}
          </p>

          {/* Secondary Description */}
          {secondaryDescription && (
            <p className={`${sizes.description} text-gray-500`}>
              {secondaryDescription}
            </p>
          )}
        </div>

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            {/* Primary Action */}
            {action && (
              <>
                {action.href ? (
                  <Button
                    asChild
                    variant={action.variant || "default"}
                    size={size === "sm" ? "sm" : "default"}
                  >
                    <Link href={action.href}>{action.label}</Link>
                  </Button>
                ) : (
                  <Button
                    onClick={action.onClick}
                    variant={action.variant || "default"}
                    size={size === "sm" ? "sm" : "default"}
                  >
                    {action.label}
                  </Button>
                )}
              </>
            )}

            {/* Secondary Action */}
            {secondaryAction && (
              <>
                {secondaryAction.href ? (
                  <Button
                    asChild
                    variant={secondaryAction.variant || "outline"}
                    size={size === "sm" ? "sm" : "default"}
                  >
                    <Link href={secondaryAction.href}>
                      {secondaryAction.label}
                    </Link>
                  </Button>
                ) : (
                  <Button
                    onClick={secondaryAction.onClick}
                    variant={secondaryAction.variant || "outline"}
                    size={size === "sm" ? "sm" : "default"}
                  >
                    {secondaryAction.label}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Pre-configured empty state variants for common scenarios
 */

export const EmptyStateVariants = {
  /**
   * No products found
   */
  NoProducts: (props: Partial<EmptyStateProps> = {}) => (
    <EmptyState
      icon={props.icon || require("lucide-react").ShoppingCart}
      title={props.title || "No Products Found"}
      description={
        props.description ||
        "We couldn't find any products matching your criteria."
      }
      secondaryDescription="Try adjusting your filters or search terms."
      action={{
        label: "Browse All Products",
        href: "/marketplace/products",
        ...props.action,
      }}
      secondaryAction={{
        label: "Clear Filters",
        variant: "outline",
        ...props.secondaryAction,
      }}
      {...props}
    />
  ),

  /**
   * No farms found
   */
  NoFarms: (props: Partial<EmptyStateProps> = {}) => (
    <EmptyState
      icon={props.icon || require("lucide-react").Store}
      title={props.title || "No Farms Found"}
      description={
        props.description || "We couldn't find any farms in your area."
      }
      secondaryDescription="Check back soon as more farms join our marketplace!"
      action={{
        label: "Browse All Farms",
        href: "/marketplace/farms",
        ...props.action,
      }}
      secondaryAction={{
        label: "Shop Products",
        href: "/marketplace/products",
        variant: "outline",
        ...props.secondaryAction,
      }}
      {...props}
    />
  ),

  /**
   * No orders
   */
  NoOrders: (props: Partial<EmptyStateProps> = {}) => (
    <EmptyState
      icon={props.icon || require("lucide-react").Package}
      title={props.title || "No Orders Yet"}
      description={
        props.description || "You haven't placed any orders yet."
      }
      secondaryDescription="Start shopping to see your orders here!"
      action={{
        label: "Start Shopping",
        href: "/marketplace/products",
        ...props.action,
      }}
      {...props}
    />
  ),

  /**
   * No favorites
   */
  NoFavorites: (props: Partial<EmptyStateProps> = {}) => (
    <EmptyState
      icon={props.icon || require("lucide-react").Heart}
      title={props.title || "No Favorites Yet"}
      description={
        props.description || "You haven't added any favorites yet."
      }
      secondaryDescription="Save farms and products you love to find them easily later!"
      action={{
        label: "Discover Farms",
        href: "/marketplace/farms",
        ...props.action,
      }}
      {...props}
    />
  ),

  /**
   * No search results
   */
  NoSearchResults: (query?: string) => (
    <EmptyState
      icon={require("lucide-react").Search}
      title="No Results Found"
      description={
        query
          ? `We couldn't find anything matching "${query}"`
          : "We couldn't find anything matching your search"
      }
      secondaryDescription="Try different keywords or browse our categories."
      action={{
        label: "Browse Categories",
        href: "/products",
      }}
      secondaryAction={{
        label: "Clear Search",
        variant: "outline",
      }}
    />
  ),

  /**
   * Cart empty
   */
  EmptyCart: (props: Partial<EmptyStateProps> = {}) => (
    <EmptyState
      icon={props.icon || require("lucide-react").ShoppingCart}
      title={props.title || "Your Cart is Empty"}
      description={
        props.description || "Add some fresh products to get started!"
      }
      secondaryDescription="Browse our selection of local, sustainable produce."
      action={{
        label: "Shop Now",
        href: "/marketplace/products",
        ...props.action,
      }}
      size="lg"
      showDecoration
      {...props}
    />
  ),
};
