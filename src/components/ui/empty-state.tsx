/**
 * Empty State Component
 * Displays helpful messages when lists or collections are empty
 * @module components/ui/empty-state
 */

import {
    AlertCircle,
    Bell,
    Calendar,
    DollarSign,
    Heart,
    LucideIcon,
    Mail,
    MapPin,
    Package,
    Search,
    ShoppingBag,
    Star,
    Store,
    TrendingUp,
    Users
} from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  /**
   * Icon variant to display
   */
  variant:
    | 'cart'
    | 'products'
    | 'orders'
    | 'farms'
    | 'favorites'
    | 'search'
    | 'reviews'
    | 'notifications'
    | 'users'
    | 'analytics'
    | 'locations'
    | 'events'
    | 'transactions'
    | 'messages'
    | 'generic';

  /**
   * Primary heading text
   */
  title: string;

  /**
   * Descriptive text explaining the empty state
   */
  description: string;

  /**
   * Optional call-to-action
   */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };

  /**
   * Optional secondary action
   */
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Additional className
   */
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  cart: ShoppingBag,
  products: Package,
  orders: ShoppingBag,
  farms: Store,
  favorites: Heart,
  search: Search,
  reviews: Star,
  notifications: Bell,
  users: Users,
  analytics: TrendingUp,
  locations: MapPin,
  events: Calendar,
  transactions: DollarSign,
  messages: Mail,
  generic: AlertCircle,
};

const sizeClasses = {
  sm: {
    container: 'py-8',
    icon: 'h-8 w-8',
    title: 'text-base',
    description: 'text-sm',
  },
  md: {
    container: 'py-12',
    icon: 'h-12 w-12',
    title: 'text-lg',
    description: 'text-base',
  },
  lg: {
    container: 'py-16',
    icon: 'h-16 w-16',
    title: 'text-2xl',
    description: 'text-lg',
  },
};

/**
 * Empty State Component
 *
 * @example
 * ```tsx
 * <EmptyState
 *   variant="cart"
 *   title="Your cart is empty"
 *   description="Add some fresh products from local farms to get started"
 *   action={{
 *     label: "Browse Products",
 *     href: "/products"
 *   }}
 * />
 * ```
 */
export function EmptyState({
  variant,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  const Icon = iconMap[variant] || iconMap.generic;
  const sizes = sizeClasses[size];

  return (
    <div
      className={`text-center ${sizes.container} ${className}`}
      role="status"
      aria-label={title}
    >
      <div className="max-w-md mx-auto space-y-4">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-gray-100 p-4">
            <Icon className={`${sizes.icon} text-gray-400`} aria-hidden="true" />
          </div>
        </div>

        {/* Title */}
        <h3 className={`${sizes.title} font-semibold text-gray-900`}>
          {title}
        </h3>

        {/* Description */}
        <p className={`${sizes.description} text-gray-600 max-w-sm mx-auto`}>
          {description}
        </p>

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
            {action && (
              action.href ? (
                <Link
                  href={action.href}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  {action.label}
                </Link>
              ) : (
                <button
                  onClick={action.onClick}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  {action.label}
                </button>
              )
            )}

            {secondaryAction && (
              secondaryAction.href ? (
                <Link
                  href={secondaryAction.href}
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  {secondaryAction.label}
                </Link>
              ) : (
                <button
                  onClick={secondaryAction.onClick}
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  {secondaryAction.label}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Predefined Empty States for common use cases
 */

export function EmptyCart() {
  return (
    <EmptyState
      variant="cart"
      title="Your cart is empty"
      description="Discover fresh, locally-grown products from farms near you"
      action={{
        label: 'Browse Products',
        href: '/products',
      }}
      secondaryAction={{
        label: 'Explore Farms',
        href: '/farms',
      }}
    />
  );
}

export function EmptyProducts() {
  return (
    <EmptyState
      variant="products"
      title="No products yet"
      description="Start adding products to showcase your farm's fresh offerings"
      action={{
        label: 'Add Your First Product',
        href: '/farmer/products/new',
      }}
    />
  );
}

export function EmptyOrders() {
  return (
    <EmptyState
      variant="orders"
      title="No orders yet"
      description="When customers place orders, they'll appear here"
      action={{
        label: 'View Your Products',
        href: '/farmer/products',
      }}
    />
  );
}

export function EmptyFarms() {
  return (
    <EmptyState
      variant="farms"
      title="No farms found"
      description="We couldn't find any farms matching your criteria"
      action={{
        label: 'Clear Filters',
        href: '/farms',
      }}
      secondaryAction={{
        label: 'Browse All',
        href: '/marketplace',
      }}
    />
  );
}

export function EmptyFavorites() {
  return (
    <EmptyState
      variant="favorites"
      title="No favorites yet"
      description="Save your favorite farms and products for quick access"
      action={{
        label: 'Discover Farms',
        href: '/farms',
      }}
    />
  );
}

export function EmptySearchResults() {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description="Try adjusting your search terms or browse our categories"
      action={{
        label: 'Clear Search',
        href: '/products',
      }}
    />
  );
}

export function EmptyReviews() {
  return (
    <EmptyState
      variant="reviews"
      title="No reviews yet"
      description="Be the first to share your experience with this farm"
      size="sm"
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      variant="notifications"
      title="No notifications"
      description="You're all caught up! We'll notify you of important updates"
      size="sm"
    />
  );
}

export function EmptyUsers() {
  return (
    <EmptyState
      variant="users"
      title="No users found"
      description="Try adjusting your filters or search criteria"
      action={{
        label: 'Clear Filters',
        href: '/admin/users',
      }}
    />
  );
}

export function EmptyAnalytics() {
  return (
    <EmptyState
      variant="analytics"
      title="No data available"
      description="Analytics data will appear here once you have sales activity"
      size="sm"
    />
  );
}

export function EmptyMessages() {
  return (
    <EmptyState
      variant="messages"
      title="No messages"
      description="Your message inbox is empty"
      size="sm"
    />
  );
}

/**
 * Export all components
 */
export default EmptyState;
