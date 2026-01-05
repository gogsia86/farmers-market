// 🧠 DIVINE PATTERN: Analytics Hook
// 📚 Reference: 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
// 🌾 Domain: Analytics Integration
// ⚡ Performance: Optimized event tracking with React hooks

'use client';

import { analytics, AnalyticsAction, AnalyticsCategory } from '@/lib/analytics/google-analytics';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';

/**
 * Custom hook for analytics integration
 * Provides easy-to-use methods for tracking events and page views
 */
export function useAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views automatically
  useEffect(() => {
    if (pathname) {
      const url = searchParams?.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      analytics.pageview(url);
    }
  }, [pathname, searchParams]);

  // Track custom event
  const trackEvent = useCallback((
    action: string,
    category: string,
    label?: string,
    value?: number,
    additionalParams?: Record<string, any>
  ) => {
    analytics.event({
      action,
      category,
      label,
      value,
      additionalParams,
    });
  }, []);

  // Track e-commerce events
  const trackAddToCart = useCallback((product: {
    id: string;
    name: string;
    price: number;
    category?: string;
    quantity?: number;
  }) => {
    analytics.ecommerce.addToCart(product);
  }, []);

  const trackRemoveFromCart = useCallback((product: {
    id: string;
    name: string;
    price: number;
    quantity?: number;
  }) => {
    analytics.ecommerce.removeFromCart(product);
  }, []);

  const trackBeginCheckout = useCallback((cart: {
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
    totalValue: number;
  }) => {
    analytics.ecommerce.beginCheckout(cart);
  }, []);

  const trackPurchase = useCallback((order: {
    id: string;
    totalValue: number;
    tax?: number;
    shipping?: number;
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
  }) => {
    analytics.ecommerce.purchase(order);
  }, []);

  // Track agricultural events
  const trackViewFarm = useCallback((farm: {
    id: string;
    name: string;
    type?: string;
  }) => {
    analytics.agricultural.viewFarm(farm);
  }, []);

  const trackViewProduct = useCallback((product: {
    id: string;
    name: string;
    category?: string;
    seasonal?: boolean;
    farmName?: string;
  }) => {
    analytics.agricultural.viewProduct(product);
  }, []);

  const trackSeasonalFilter = useCallback((season: string, resultCount: number) => {
    analytics.agricultural.seasonalFilter(season, resultCount);
  }, []);

  const trackFollowFarm = useCallback((farm: { id: string; name: string }) => {
    analytics.agricultural.followFarm(farm);
  }, []);

  // Track user events
  const trackSignup = useCallback((method: string = 'email') => {
    analytics.user.signup(method);
  }, []);

  const trackLogin = useCallback((method: string = 'email') => {
    analytics.user.login(method);
  }, []);

  const trackLogout = useCallback(() => {
    analytics.user.logout();
  }, []);

  // Track order events
  const trackDownloadInvoice = useCallback((orderId: string) => {
    analytics.order.downloadInvoice(orderId);
  }, []);

  const trackOrderStatusCheck = useCallback((orderId: string, status: string) => {
    analytics.order.checkStatus(orderId, status);
  }, []);

  // Track errors
  const trackError = useCallback((error: {
    message: string;
    page?: string;
    fatal?: boolean;
  }) => {
    analytics.errorTracking.trackError(error);
  }, []);

  // Consent management
  const updateConsent = useCallback((granted: boolean) => {
    analytics.consent.update(granted);
  }, []);

  return {
    // Core methods
    trackEvent,

    // E-commerce
    trackAddToCart,
    trackRemoveFromCart,
    trackBeginCheckout,
    trackPurchase,

    // Agricultural
    trackViewFarm,
    trackViewProduct,
    trackSeasonalFilter,
    trackFollowFarm,

    // User
    trackSignup,
    trackLogin,
    trackLogout,

    // Order
    trackDownloadInvoice,
    trackOrderStatusCheck,

    // Error tracking
    trackError,

    // Consent
    updateConsent,

    // Utility
    isEnabled: analytics.isEnabled(),
  };
}

/**
 * Hook for tracking component mount/unmount
 */
export function useComponentTracking(componentName: string, metadata?: Record<string, any>) {
  useEffect(() => {
    analytics.event({
      action: 'component_mount',
      category: AnalyticsCategory.ENGAGEMENT,
      label: componentName,
      additionalParams: {
        component: componentName,
        ...metadata,
      },
    });

    return () => {
      analytics.event({
        action: 'component_unmount',
        category: AnalyticsCategory.ENGAGEMENT,
        label: componentName,
        additionalParams: {
          component: componentName,
          ...metadata,
        },
      });
    };
  }, [componentName, metadata]);
}

/**
 * Hook for tracking click events
 */
export function useClickTracking() {
  const trackClick = useCallback((elementName: string, metadata?: Record<string, any>) => {
    analytics.event({
      action: AnalyticsAction.CLICK,
      category: AnalyticsCategory.ENGAGEMENT,
      label: elementName,
      additionalParams: {
        element: elementName,
        ...metadata,
      },
    });
  }, []);

  return { trackClick };
}

/**
 * Hook for tracking search events
 */
export function useSearchTracking() {
  const trackSearch = useCallback((query: string, resultCount: number) => {
    analytics.event({
      action: AnalyticsAction.SEARCH,
      category: AnalyticsCategory.ENGAGEMENT,
      label: query,
      value: resultCount,
      additionalParams: {
        search_term: query,
        result_count: resultCount,
      },
    });
  }, []);

  return { trackSearch };
}

/**
 * Hook for tracking filter events
 */
export function useFilterTracking() {
  const trackFilter = useCallback((filterType: string, filterValue: string, resultCount: number) => {
    analytics.event({
      action: AnalyticsAction.FILTER,
      category: AnalyticsCategory.ENGAGEMENT,
      label: `${filterType}: ${filterValue}`,
      value: resultCount,
      additionalParams: {
        filter_type: filterType,
        filter_value: filterValue,
        result_count: resultCount,
      },
    });
  }, []);

  return { trackFilter };
}
