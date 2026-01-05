// 🧠 DIVINE PATTERN: Google Analytics Integration
// 📚 Reference: Divine Agricultural Consciousness
// 🌾 Domain: Analytics & User Behavior Tracking
// ⚡ Performance: Optimized event tracking with agricultural awareness

/**
 * Google Analytics GA4 Integration
 * Provides type-safe analytics tracking with agricultural consciousness
 */

// Type declarations for gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

/**
 * Check if Google Analytics is enabled and available
 */
export const isAnalyticsEnabled = (): boolean => {
  return Boolean(
    GA_TRACKING_ID &&
    typeof window !== 'undefined' &&
    window.gtag
  );
};

/**
 * Track page views
 * @param url - The page URL to track
 */
export const pageview = (url: string): void => {
  if (!isAnalyticsEnabled()) return;

  try {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
      agricultural_consciousness: 'active',
      platform: 'farmers-market',
    });
  } catch (error) {
    console.error('Analytics pageview error:', error);
  }
};

/**
 * Event categories for agricultural platform
 */
export enum AnalyticsCategory {
  ENGAGEMENT = 'engagement',
  ECOMMERCE = 'ecommerce',
  AGRICULTURAL = 'agricultural',
  USER = 'user',
  FARM = 'farm',
  PRODUCT = 'product',
  ORDER = 'order',
  NAVIGATION = 'navigation',
  ERROR = 'error',
}

/**
 * Event actions for tracking
 */
export enum AnalyticsAction {
  // Engagement
  CLICK = 'click',
  VIEW = 'view',
  SEARCH = 'search',
  FILTER = 'filter',

  // E-commerce
  ADD_TO_CART = 'add_to_cart',
  REMOVE_FROM_CART = 'remove_from_cart',
  BEGIN_CHECKOUT = 'begin_checkout',
  COMPLETE_PURCHASE = 'purchase',

  // Agricultural
  VIEW_FARM = 'view_farm',
  FOLLOW_FARM = 'follow_farm',
  VIEW_PRODUCT = 'view_product',
  SEASONAL_FILTER = 'seasonal_filter',

  // User
  SIGNUP = 'sign_up',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PROFILE_UPDATE = 'profile_update',

  // Order
  ORDER_PLACED = 'order_placed',
  ORDER_STATUS_CHECK = 'order_status_check',
  DOWNLOAD_INVOICE = 'download_invoice',
}

/**
 * Analytics event interface
 */
interface AnalyticsEvent {
  action: AnalyticsAction | string;
  category: AnalyticsCategory | string;
  label?: string;
  value?: number;
  additionalParams?: Record<string, any>;
}

/**
 * Track custom events
 * @param event - The event configuration
 */
export const event = ({
  action,
  category,
  label,
  value,
  additionalParams = {},
}: AnalyticsEvent): void => {
  if (!isAnalyticsEnabled()) return;

  try {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      agricultural_consciousness: 'active',
      ...additionalParams,
    });
  } catch (error) {
    console.error('Analytics event error:', error);
  }
};

/**
 * E-commerce event helpers
 */
export const ecommerce = {
  /**
   * Track add to cart event
   */
  addToCart: (product: {
    id: string;
    name: string;
    price: number;
    category?: string;
    quantity?: number;
  }) => {
    event({
      action: AnalyticsAction.ADD_TO_CART,
      category: AnalyticsCategory.ECOMMERCE,
      label: product.name,
      value: product.price * (product.quantity || 1),
      additionalParams: {
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          item_category: product.category || 'uncategorized',
          quantity: product.quantity || 1,
        }],
      },
    });
  },

  /**
   * Track remove from cart event
   */
  removeFromCart: (product: {
    id: string;
    name: string;
    price: number;
    quantity?: number;
  }) => {
    event({
      action: AnalyticsAction.REMOVE_FROM_CART,
      category: AnalyticsCategory.ECOMMERCE,
      label: product.name,
      value: product.price * (product.quantity || 1),
      additionalParams: {
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: product.quantity || 1,
        }],
      },
    });
  },

  /**
   * Track begin checkout event
   */
  beginCheckout: (cart: {
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
    totalValue: number;
  }) => {
    event({
      action: AnalyticsAction.BEGIN_CHECKOUT,
      category: AnalyticsCategory.ECOMMERCE,
      label: 'Checkout Started',
      value: cart.totalValue,
      additionalParams: {
        items: cart.items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        value: cart.totalValue,
        currency: 'USD',
      },
    });
  },

  /**
   * Track purchase completion
   */
  purchase: (order: {
    id: string;
    totalValue: number;
    tax?: number;
    shipping?: number;
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
  }) => {
    event({
      action: AnalyticsAction.COMPLETE_PURCHASE,
      category: AnalyticsCategory.ECOMMERCE,
      label: `Order ${order.id}`,
      value: order.totalValue,
      additionalParams: {
        transaction_id: order.id,
        value: order.totalValue,
        tax: order.tax || 0,
        shipping: order.shipping || 0,
        currency: 'USD',
        items: order.items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    });
  },
};

/**
 * Agricultural-specific event helpers
 */
export const agricultural = {
  /**
   * Track farm view
   */
  viewFarm: (farm: { id: string; name: string; type?: string }) => {
    event({
      action: AnalyticsAction.VIEW_FARM,
      category: AnalyticsCategory.AGRICULTURAL,
      label: farm.name,
      additionalParams: {
        farm_id: farm.id,
        farm_type: farm.type || 'general',
        consciousness: 'biodynamic',
      },
    });
  },

  /**
   * Track product view with seasonal context
   */
  viewProduct: (product: {
    id: string;
    name: string;
    category?: string;
    seasonal?: boolean;
    farmName?: string;
  }) => {
    event({
      action: AnalyticsAction.VIEW_PRODUCT,
      category: AnalyticsCategory.AGRICULTURAL,
      label: product.name,
      additionalParams: {
        product_id: product.id,
        product_category: product.category || 'uncategorized',
        seasonal: product.seasonal || false,
        farm_name: product.farmName,
        agricultural_awareness: 'active',
      },
    });
  },

  /**
   * Track seasonal filtering
   */
  seasonalFilter: (season: string, resultCount: number) => {
    event({
      action: AnalyticsAction.SEASONAL_FILTER,
      category: AnalyticsCategory.AGRICULTURAL,
      label: season,
      value: resultCount,
      additionalParams: {
        season,
        result_count: resultCount,
        biodynamic_consciousness: 'active',
      },
    });
  },

  /**
   * Track farm follow/favorite
   */
  followFarm: (farm: { id: string; name: string }) => {
    event({
      action: AnalyticsAction.FOLLOW_FARM,
      category: AnalyticsCategory.AGRICULTURAL,
      label: farm.name,
      additionalParams: {
        farm_id: farm.id,
        engagement_type: 'follow',
      },
    });
  },
};

/**
 * User action event helpers
 */
export const user = {
  /**
   * Track user signup
   */
  signup: (method: string = 'email') => {
    event({
      action: AnalyticsAction.SIGNUP,
      category: AnalyticsCategory.USER,
      label: method,
      additionalParams: {
        method,
      },
    });
  },

  /**
   * Track user login
   */
  login: (method: string = 'email') => {
    event({
      action: AnalyticsAction.LOGIN,
      category: AnalyticsCategory.USER,
      label: method,
      additionalParams: {
        method,
      },
    });
  },

  /**
   * Track user logout
   */
  logout: () => {
    event({
      action: AnalyticsAction.LOGOUT,
      category: AnalyticsCategory.USER,
      label: 'User Logout',
    });
  },
};

/**
 * Order event helpers
 */
export const order = {
  /**
   * Track invoice download
   */
  downloadInvoice: (orderId: string) => {
    event({
      action: AnalyticsAction.DOWNLOAD_INVOICE,
      category: AnalyticsCategory.ORDER,
      label: `Order ${orderId}`,
      additionalParams: {
        order_id: orderId,
      },
    });
  },

  /**
   * Track order status check
   */
  checkStatus: (orderId: string, status: string) => {
    event({
      action: AnalyticsAction.ORDER_STATUS_CHECK,
      category: AnalyticsCategory.ORDER,
      label: status,
      additionalParams: {
        order_id: orderId,
        order_status: status,
      },
    });
  },
};

/**
 * Error tracking
 */
export const errorTracking = {
  /**
   * Track error occurrence
   */
  trackError: (error: {
    message: string;
    page?: string;
    fatal?: boolean;
  }) => {
    event({
      action: 'error',
      category: AnalyticsCategory.ERROR,
      label: error.message,
      additionalParams: {
        page: error.page || window.location.pathname,
        fatal: error.fatal || false,
        error_message: error.message,
      },
    });
  },
};

/**
 * Consent management
 */
export const consent = {
  /**
   * Update analytics consent
   */
  update: (granted: boolean) => {
    if (typeof window !== 'undefined' && window.gtag) {
      (window.gtag as any)('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied',
      });
    }
  },
};

/**
 * Export all analytics utilities
 */
export const analytics = {
  pageview,
  event,
  ecommerce,
  agricultural,
  user,
  order,
  errorTracking,
  consent,
  isEnabled: isAnalyticsEnabled,
};

export default analytics;
