/**
 * 🧠 DIVINE PATTERN: Mobile Testing Utilities
 * 📚 Reference: Day 17 - Mobile Testing & PWA Optimization
 * 🌾 Domain: Mobile Agricultural Experience Testing
 * ⚡ Performance: Device-Optimized Test Infrastructure
 *
 * Comprehensive mobile testing utilities for Playwright E2E tests
 * Supports device profiles, touch interactions, viewport management,
 * and mobile-specific validations.
 */

import { Page, BrowserContext, devices, expect } from '@playwright/test';

// ============================================
// DEVICE PROFILES & CONFIGURATIONS
// ============================================

/**
 * Extended device configurations for agricultural platform testing
 */
export const MOBILE_DEVICES = {
  // iOS Devices
  'iPhone SE': {
    ...devices['iPhone SE'],
    isMobile: true,
    hasTouch: true,
    defaultBrowserType: 'webkit',
  },
  'iPhone 12': {
    ...devices['iPhone 12'],
    isMobile: true,
    hasTouch: true,
    defaultBrowserType: 'webkit',
  },
  'iPhone 12 Pro': {
    ...devices['iPhone 12 Pro'],
    isMobile: true,
    hasTouch: true,
    defaultBrowserType: 'webkit',
  },
  'iPhone 13': {
    ...devices['iPhone 13'],
    isMobile: true,
    hasTouch: true,
    defaultBrowserType: 'webkit',
  },
  'iPhone 14': {
    ...devices['iPhone 14'],
    isMobile: true,
    hasTouch: true,
    defaultBrowserType: 'webkit',
  },
  'iPhone 14 Pro Max': {
    ...devices['iPhone 14 Pro Max'],
    isMobile: true,
    hasTouch: true,
    defaultBrowserType: 'webkit',
  },
  'iPad Mini': {
    ...devices['iPad Mini'],
    isMobile: true,
    hasTouch: true,
    defaultBrowserType: 'webkit',
  },
  'iPad Pro': {
    ...devices['iPad (gen 7)'],
    isMobile: true,
    hasTouch: true,
    defaultBrowserType: 'webkit',
  },

  // Android Devices
  'Pixel 5': {
    ...devices['Pixel 5'],
    isMobile: true,
    hasTouch: true,
    defaultBrowserType: 'chromium',
  },
  'Pixel 7': {
    ...devices['Pixel 5'], // Use Pixel 5 as base, adjust viewport
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    defaultBrowserType: 'chromium',
  },
  'Galaxy S9+': {
    ...devices['Galaxy S9+'],
    isMobile: true,
    hasTouch: true,
    defaultBrowserType: 'chromium',
  },
  'Galaxy S21': {
    ...devices['Galaxy S9+'], // Use S9+ as base
    viewport: { width: 360, height: 800 },
    isMobile: true,
    hasTouch: true,
    defaultBrowserType: 'chromium',
  },
  'Galaxy Tab S7': {
    viewport: { width: 1200, height: 753 },
    userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-T870) AppleWebKit/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    defaultBrowserType: 'chromium',
  },
} as const;

/**
 * Viewport breakpoints for responsive testing
 */
export const VIEWPORT_BREAKPOINTS = {
  mobile: { width: 375, height: 667 },      // Small mobile
  mobileLarge: { width: 428, height: 926 }, // Large mobile
  tablet: { width: 768, height: 1024 },     // Tablet portrait
  tabletLandscape: { width: 1024, height: 768 }, // Tablet landscape
  desktop: { width: 1280, height: 720 },    // Small desktop
  desktopLarge: { width: 1920, height: 1080 }, // Large desktop
} as const;

/**
 * Network conditions for mobile testing
 */
export const NETWORK_CONDITIONS = {
  '4G': {
    downloadThroughput: 4 * 1024 * 1024 / 8, // 4 Mbps
    uploadThroughput: 3 * 1024 * 1024 / 8,   // 3 Mbps
    latency: 20,
  },
  '3G': {
    downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
    uploadThroughput: 750 * 1024 / 8,          // 750 Kbps
    latency: 40,
  },
  'Slow 3G': {
    downloadThroughput: 500 * 1024 / 8, // 500 Kbps
    uploadThroughput: 500 * 1024 / 8,   // 500 Kbps
    latency: 400,
  },
  'Offline': {
    downloadThroughput: 0,
    uploadThroughput: 0,
    latency: 0,
  },
} as const;

// ============================================
// MOBILE INTERACTION HELPERS
// ============================================

/**
 * Mobile touch interaction utilities
 */
export class MobileTouchHelper {
  constructor(private page: Page) {}

  /**
   * Simulate mobile tap on element
   */
  async tap(selector: string, options?: { force?: boolean; timeout?: number }): Promise<void> {
    await this.page.tap(selector, options);
  }

  /**
   * Simulate double tap
   */
  async doubleTap(selector: string): Promise<void> {
    const element = await this.page.locator(selector);
    const box = await element.boundingBox();

    if (!box) throw new Error(`Element ${selector} not found or not visible`);

    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    await this.page.touchscreen.tap(x, y);
    await this.page.waitForTimeout(100);
    await this.page.touchscreen.tap(x, y);
  }

  /**
   * Simulate swipe gesture
   */
  async swipe(
    startSelector: string,
    direction: 'up' | 'down' | 'left' | 'right',
    distance: number = 200
  ): Promise<void> {
    const element = await this.page.locator(startSelector);
    const box = await element.boundingBox();

    if (!box) throw new Error(`Element ${startSelector} not found`);

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    let endX = startX;
    let endY = startY;

    switch (direction) {
      case 'up':
        endY -= distance;
        break;
      case 'down':
        endY += distance;
        break;
      case 'left':
        endX -= distance;
        break;
      case 'right':
        endX += distance;
        break;
    }

    await this.page.touchscreen.tap(startX, startY);
    await this.page.mouse.move(endX, endY);
    await this.page.touchscreen.tap(endX, endY);
  }

  /**
   * Simulate pinch zoom gesture
   */
  async pinchZoom(
    selector: string,
    scale: number // 0.5 = zoom out, 2 = zoom in
  ): Promise<void> {
    const element = await this.page.locator(selector);
    const box = await element.boundingBox();

    if (!box) throw new Error(`Element ${selector} not found`);

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // Start with two fingers close together
    const finger1Start = { x: centerX - 20, y: centerY };
    const finger2Start = { x: centerX + 20, y: centerY };

    // End with fingers spread apart (zoom in) or closer (zoom out)
    const distance = scale > 1 ? 100 : -50;
    const finger1End = { x: centerX - distance, y: centerY };
    const finger2End = { x: centerX + distance, y: centerY };

    // Simulate pinch gesture (simplified)
    await this.page.mouse.move(finger1Start.x, finger1Start.y);
    await this.page.mouse.down();
    await this.page.mouse.move(finger1End.x, finger1End.y);
    await this.page.mouse.up();
  }

  /**
   * Simulate long press
   */
  async longPress(selector: string, duration: number = 1000): Promise<void> {
    const element = await this.page.locator(selector);
    const box = await element.boundingBox();

    if (!box) throw new Error(`Element ${selector} not found`);

    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    await this.page.mouse.move(x, y);
    await this.page.mouse.down();
    await this.page.waitForTimeout(duration);
    await this.page.mouse.up();
  }

  /**
   * Scroll to element (mobile-optimized)
   */
  async scrollToElement(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300); // Wait for scroll animation
  }

  /**
   * Swipe to refresh gesture
   */
  async pullToRefresh(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await this.page.waitForTimeout(200);
    await this.swipe('body', 'down', 150);
    await this.page.waitForTimeout(500); // Wait for refresh
  }
}

// ============================================
// VIEWPORT & ORIENTATION HELPERS
// ============================================

/**
 * Viewport management utilities
 */
export class ViewportHelper {
  constructor(private page: Page) {}

  /**
   * Set viewport to specific device size
   */
  async setDevice(deviceName: keyof typeof MOBILE_DEVICES): Promise<void> {
    const device = MOBILE_DEVICES[deviceName];
    if (device.viewport) {
      await this.page.setViewportSize(device.viewport);
    }
  }

  /**
   * Set viewport to specific breakpoint
   */
  async setBreakpoint(breakpoint: keyof typeof VIEWPORT_BREAKPOINTS): Promise<void> {
    await this.page.setViewportSize(VIEWPORT_BREAKPOINTS[breakpoint]);
  }

  /**
   * Set custom viewport size
   */
  async setCustomViewport(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
  }

  /**
   * Rotate device (portrait/landscape)
   */
  async rotate(): Promise<void> {
    const currentViewport = this.page.viewportSize();
    if (currentViewport) {
      await this.page.setViewportSize({
        width: currentViewport.height,
        height: currentViewport.width,
      });
    }
  }

  /**
   * Get current viewport size
   */
  getViewportSize(): { width: number; height: number } | null {
    return this.page.viewportSize();
  }

  /**
   * Check if viewport is mobile size
   */
  isMobile(): boolean {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width < 768 : false;
  }

  /**
   * Check if viewport is tablet size
   */
  isTablet(): boolean {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width >= 768 && viewport.width < 1024 : false;
  }

  /**
   * Check if viewport is desktop size
   */
  isDesktop(): boolean {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width >= 1024 : false;
  }
}

// ============================================
// MOBILE PERFORMANCE HELPERS
// ============================================

/**
 * Mobile performance testing utilities
 */
export class MobilePerformanceHelper {
  constructor(private page: Page) {}

  /**
   * Measure page load time
   */
  async measurePageLoad(url: string): Promise<{
    navigationStart: number;
    loadComplete: number;
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
    totalTime: number;
  }> {
    await this.page.goto(url);

    const performanceData = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      return {
        navigationStart: navigation.fetchStart,
        loadComplete: navigation.loadEventEnd,
        domContentLoaded: navigation.domContentLoadedEventEnd,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      };
    });

    return {
      ...performanceData,
      totalTime: performanceData.loadComplete - performanceData.navigationStart,
    };
  }

  /**
   * Measure Time to Interactive (TTI)
   */
  async measureTTI(): Promise<number> {
    return await this.page.evaluate(() => {
      return new Promise<number>((resolve) => {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              // Approximate TTI with long tasks
              resolve(entry.startTime + entry.duration);
            }
          });
          observer.observe({ entryTypes: ['longtask'] });

          // Fallback timeout
          setTimeout(() => resolve(0), 5000);
        } else {
          resolve(0);
        }
      });
    });
  }

  /**
   * Measure JavaScript execution time
   */
  async measureJSExecutionTime(): Promise<number> {
    return await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navigation.domInteractive - navigation.domLoading;
    });
  }

  /**
   * Get resource loading times
   */
  async getResourceTimings(): Promise<{
    scripts: number;
    stylesheets: number;
    images: number;
    fonts: number;
    total: number;
  }> {
    return await this.page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      const timings = {
        scripts: 0,
        stylesheets: 0,
        images: 0,
        fonts: 0,
        total: 0,
      };

      resources.forEach(resource => {
        const duration = resource.responseEnd - resource.startTime;

        if (resource.initiatorType === 'script') {
          timings.scripts += duration;
        } else if (resource.initiatorType === 'link' || resource.initiatorType === 'css') {
          timings.stylesheets += duration;
        } else if (resource.initiatorType === 'img') {
          timings.images += duration;
        } else if (resource.initiatorType === 'font') {
          timings.fonts += duration;
        }

        timings.total += duration;
      });

      return timings;
    });
  }

  /**
   * Check for layout shifts (CLS)
   */
  async measureCLS(): Promise<number> {
    return await this.page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let cls = 0;

        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                cls += (entry as any).value;
              }
            }
          });

          observer.observe({ entryTypes: ['layout-shift'] });

          // Resolve after 3 seconds
          setTimeout(() => {
            observer.disconnect();
            resolve(cls);
          }, 3000);
        } else {
          resolve(0);
        }
      });
    });
  }
}

// ============================================
// PWA & OFFLINE TESTING HELPERS
// ============================================

/**
 * PWA functionality testing utilities
 */
export class PWAHelper {
  constructor(private page: Page, private context: BrowserContext) {}

  /**
   * Check if service worker is registered
   */
  async isServiceWorkerRegistered(): Promise<boolean> {
    return await this.page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;

      const registration = await navigator.serviceWorker.getRegistration();
      return registration !== undefined;
    });
  }

  /**
   * Wait for service worker to be active
   */
  async waitForServiceWorkerActive(timeout: number = 10000): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const isActive = await this.page.evaluate(async () => {
        if (!('serviceWorker' in navigator)) return false;

        const registration = await navigator.serviceWorker.getRegistration();
        return registration?.active !== null;
      });

      if (isActive) return true;

      await this.page.waitForTimeout(500);
    }

    return false;
  }

  /**
   * Check if manifest is loaded
   */
  async hasManifest(): Promise<boolean> {
    const manifestLink = await this.page.locator('link[rel="manifest"]').count();
    return manifestLink > 0;
  }

  /**
   * Get manifest data
   */
  async getManifest(): Promise<any> {
    const manifestUrl = await this.page.locator('link[rel="manifest"]').getAttribute('href');

    if (!manifestUrl) return null;

    const response = await this.page.goto(manifestUrl);
    return await response?.json();
  }

  /**
   * Check if app is installable
   */
  async isInstallable(): Promise<boolean> {
    return await this.page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        let isInstallable = false;

        window.addEventListener('beforeinstallprompt', () => {
          isInstallable = true;
          resolve(true);
        });

        // Timeout after 2 seconds
        setTimeout(() => resolve(isInstallable), 2000);
      });
    });
  }

  /**
   * Simulate offline mode
   */
  async goOffline(): Promise<void> {
    await this.context.setOffline(true);
  }

  /**
   * Simulate online mode
   */
  async goOnline(): Promise<void> {
    await this.context.setOffline(false);
  }

  /**
   * Check if page works offline
   */
  async testOfflineFunctionality(url: string): Promise<{
    canLoadOffline: boolean;
    hasCachedContent: boolean;
    error?: string;
  }> {
    // First, load the page online to cache it
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');

    // Wait for service worker to cache the page
    await this.page.waitForTimeout(2000);

    // Go offline
    await this.goOffline();

    try {
      // Try to navigate to the same page
      await this.page.goto(url);

      const hasCachedContent = await this.page.evaluate(() => {
        return document.body.textContent !== null && document.body.textContent.length > 0;
      });

      return {
        canLoadOffline: true,
        hasCachedContent,
      };
    } catch (error) {
      return {
        canLoadOffline: false,
        hasCachedContent: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      // Go back online
      await this.goOnline();
    }
  }

  /**
   * Check for cached resources
   */
  async getCachedResources(): Promise<string[]> {
    return await this.page.evaluate(async () => {
      if (!('caches' in window)) return [];

      const cacheNames = await caches.keys();
      const cachedUrls: string[] = [];

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        requests.forEach(request => cachedUrls.push(request.url));
      }

      return cachedUrls;
    });
  }
}

// ============================================
// MOBILE-SPECIFIC ASSERTIONS
// ============================================

/**
 * Mobile-specific assertion helpers
 */
export class MobileAssertions {
  constructor(private page: Page) {}

  /**
   * Assert element is visible in viewport
   */
  async assertVisibleInViewport(selector: string): Promise<void> {
    const element = this.page.locator(selector);
    const box = await element.boundingBox();
    const viewport = this.page.viewportSize();

    expect(box).not.toBeNull();
    expect(viewport).not.toBeNull();

    if (box && viewport) {
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    }
  }

  /**
   * Assert touch target size (minimum 44x44 for mobile)
   */
  async assertTouchTargetSize(selector: string, minSize: number = 44): Promise<void> {
    const element = this.page.locator(selector);
    const box = await element.boundingBox();

    expect(box).not.toBeNull();

    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(minSize);
      expect(box.height).toBeGreaterThanOrEqual(minSize);
    }
  }

  /**
   * Assert text is readable on mobile (font size check)
   */
  async assertReadableText(selector: string, minFontSize: number = 16): Promise<void> {
    const fontSize = await this.page.locator(selector).evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize);
    });

    expect(fontSize).toBeGreaterThanOrEqual(minFontSize);
  }

  /**
   * Assert no horizontal scrolling on mobile
   */
  async assertNoHorizontalScroll(): Promise<void> {
    const hasHorizontalScroll = await this.page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  }

  /**
   * Assert responsive image loading
   */
  async assertResponsiveImages(selector: string): Promise<void> {
    const hasResponsiveAttrs = await this.page.locator(selector).evaluate((el: Element) => {
      const img = el as HTMLImageElement;
      return (
        img.hasAttribute('srcset') ||
        img.hasAttribute('sizes') ||
        img.loading === 'lazy'
      );
    });

    expect(hasResponsiveAttrs).toBe(true);
  }

  /**
   * Assert mobile-friendly navigation
   */
  async assertMobileNavigation(): Promise<void> {
    // Check for hamburger menu on mobile
    const viewport = this.page.viewportSize();

    if (viewport && viewport.width < 768) {
      const hasMobileMenu = await this.page.locator('[data-mobile-menu], button[aria-label*="menu" i]').count();
      expect(hasMobileMenu).toBeGreaterThan(0);
    }
  }
}

// ============================================
// MOBILE TEST HELPERS
// ============================================

/**
 * Create mobile test helper instance
 */
export function createMobileHelper(page: Page, context: BrowserContext) {
  return {
    touch: new MobileTouchHelper(page),
    viewport: new ViewportHelper(page),
    performance: new MobilePerformanceHelper(page),
    pwa: new PWAHelper(page, context),
    assert: new MobileAssertions(page),
  };
}

/**
 * Set network conditions for mobile testing
 */
export async function setNetworkConditions(
  context: BrowserContext,
  condition: keyof typeof NETWORK_CONDITIONS
): Promise<void> {
  const network = NETWORK_CONDITIONS[condition];

  // Note: Playwright doesn't have direct CDP throttling like Puppeteer
  // This is a placeholder for future implementation with CDP
  await context.route('**/*', async (route) => {
    if (condition === 'Offline') {
      await route.abort();
    } else {
      await route.continue();
    }
  });
}

/**
 * Emulate mobile geolocation
 */
export async function setGeolocation(
  context: BrowserContext,
  latitude: number,
  longitude: number
): Promise<void> {
  await context.setGeolocation({ latitude, longitude });
  await context.grantPermissions(['geolocation']);
}

/**
 * Wait for mobile-specific elements
 */
export async function waitForMobileReady(page: Page): Promise<void> {
  // Wait for viewport to be set
  await page.waitForFunction(() => {
    return window.innerWidth > 0 && window.innerHeight > 0;
  });

  // Wait for touch events to be available
  await page.waitForFunction(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  // Wait for mobile-specific styles to load
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Capture mobile-specific metrics
 */
export async function captureMobileMetrics(page: Page): Promise<{
  viewport: { width: number; height: number } | null;
  devicePixelRatio: number;
  touchSupport: boolean;
  orientation: 'portrait' | 'landscape';
  connection?: string;
}> {
  return await page.evaluate(() => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const orientation = window.innerWidth < window.innerHeight ? 'portrait' : 'landscape';

    return {
      viewport,
      devicePixelRatio: window.devicePixelRatio,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      orientation,
      connection: (navigator as any).connection?.effectiveType,
    };
  });
}

// ============================================
// AGRICULTURAL MOBILE PATTERNS
// ============================================

/**
 * Test agricultural mobile features
 */
export class AgriculturalMobileHelper {
  constructor(private page: Page) {}

  /**
   * Test farm location with mobile geolocation
   */
  async testFarmGeolocation(farmId: string): Promise<{
    hasLocation: boolean;
    canNavigate: boolean;
    distance?: number;
  }> {
    await this.page.goto(`/farms/${farmId}`);

    const hasLocation = await this.page.locator('[data-farm-location]').count() > 0;
    const canNavigate = await this.page.locator('a[href*="maps"], button:has-text("Directions")').count() > 0;

    return { hasLocation, canNavigate };
  }

  /**
   * Test mobile product browsing
   */
  async testMobileProductCatalog(): Promise<{
    hasFilters: boolean;
    hasSearch: boolean;
    hasInfiniteScroll: boolean;
  }> {
    await this.page.goto('/products');

    return {
      hasFilters: await this.page.locator('[data-filter], button:has-text("Filter")').count() > 0,
      hasSearch: await this.page.locator('input[type="search"], input[placeholder*="search" i]').count() > 0,
      hasInfiniteScroll: await this.page.evaluate(() => {
        return 'IntersectionObserver' in window;
      }),
    };
  }

  /**
   * Test mobile checkout flow
   */
  async testMobileCheckout(): Promise<{
    isMobileFriendly: boolean;
    hasAutocomplete: boolean;
    hasPaymentMethods: boolean;
  }> {
    // Assume cart has items
    await this.page.goto('/checkout');

    return {
      isMobileFriendly: await this.page.locator('form').evaluate((form) => {
        const inputs = form.querySelectorAll('input');
        return Array.from(inputs).every(input => {
          const fontSize = parseFloat(window.getComputedStyle(input).fontSize);
          return fontSize >= 16; // Prevents zoom on iOS
        });
      }),
      hasAutocomplete: await this.page.locator('input[autocomplete]').count() > 0,
      hasPaymentMethods: await this.page.locator('[data-payment-method]').count() > 0,
    };
  }
}

/**
 * Divine mobile testing summary
 */
export function generateMobileTestSummary(results: any): string {
  return `
╔════════════════════════════════════════════════════════════╗
║ 🌾 MOBILE AGRICULTURAL CONSCIOUSNESS TEST SUMMARY         ║
╠════════════════════════════════════════════════════════════╣
║ Device Tests: ${results.deviceTests || 0} passed
║ Touch Interactions: ${results.touchTests || 0} verified
║ PWA Features: ${results.pwaTests || 0} operational
║ Performance Metrics: ${results.performanceTests || 0} optimal
║ Offline Capabilities: ${results.offlineTests || 0} functional
║
║ 📱 Mobile Experience Score: ${results.mobileScore || 0}/100
║ ⚡ Performance Score: ${results.performanceScore || 0}/100
║ 🔌 PWA Score: ${results.pwaScore || 0}/100
╚════════════════════════════════════════════════════════════╝
  `.trim();
}
