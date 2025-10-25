---
applyTo: "**/*"
description: "FR-020: Mobile PWA - Responsive design, PWA capabilities (offline/install), service worker, push notifications, touch-optimized, performance (<3s 3G), camera integration"
---

# FR-020: MOBILE PWA (PROGRESSIVE WEB APP)

**Mobile-First Experience**

---

## 📋 FEATURE METADATA

```yaml
Feature ID: FR-020
Priority: P0 - Critical
Effort: 34 story points (≈ 1.5 weeks)
Value: 95/100
Dependencies: FR-019 (Architecture)
Target: 75%+ mobile usage (from AGRICULTURAL_BRD)
```

---

## 🎯 KEY REQUIREMENTS

### Responsive Design

```yaml
Breakpoints:
  - Mobile: 320px - 767px (primary focus)
  - Tablet: 768px - 1023px
  - Desktop: 1024px+

Mobile-First CSS:
  /* Base styles for mobile */
  .card { padding: 12px; }

  /* Enhance for larger screens */
  @media (min-width: 768px) {
    .card { padding: 24px; }
  }
```

### PWA Capabilities

```yaml
Manifest (manifest.json):
  - Name: "Farmers Market"
  - Short name: "FarmMkt"
  - Icon: 192x192, 512x512 (PNG)
  - Theme color: Agricultural green
  - Background color: White
  - Display: "standalone" (app-like, no browser chrome)

Install Prompt:
  - Trigger: After 3 visits or 1 purchase
  - Message: "Add Farmers Market to your home screen"
  - Benefits: "Faster access, works offline"
```

### Service Worker

```yaml
Offline Support:
  - Cache: Farm profiles, product listings
  - Offline page: "You're offline. Showing cached content."
  - Background sync: Queue orders, sync when online

Caching Strategy:
  - Network-first: Fresh data when online
  - Cache-fallback: Offline fallback
  - Stale-while-revalidate: Show cached, update background

Implementation:
  // next.config.js
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
  })
```

### Push Notifications

```yaml
Notification Types:
  - Order updates: "Order confirmed!"
  - Messages: "Farmer replied to your question"
  - Promotions: "Fresh strawberries available"

Permission Request:
  - Timing: After first order placed
  - Message: "Get order updates via push notifications"
  - Opt-in: User must explicitly allow

Implementation:
  - Service: Firebase Cloud Messaging (FCM)
  - Badge count: Show unread on app icon
```

### Touch-Optimized

```yaml
Touch Targets:
  - Minimum size: 44x44px (Apple HIG)
  - Spacing: 8px between targets
  - Buttons: Large, easy to tap with thumb

Gestures:
  - Swipe: Swipe left to delete cart item
  - Pull-to-refresh: Refresh product listings
  - Pinch-to-zoom: Product photos
  - Long-press: Context menu (e.g., "Add to favorites")
```

### Performance

```yaml
3G Network Target:
  - Page load: <3 seconds
  - Time to Interactive: <5 seconds
  - First Contentful Paint: <1.8 seconds

4G Network Target:
  - Page load: <1.5 seconds
  - Time to Interactive: <2.5 seconds

Optimization:
  - Image compression: WebP format, lazy loading
  - Code splitting: Load only needed JavaScript
  - Prefetching: Preload likely next pages
  - Tree shaking: Remove unused code
```

### Camera Integration

```yaml
Use Cases:
  - Product listings: Farmers take photos (FR-003)
  - Quality issues: Customers report problems (FR-018)
  - Profile photos: Farm photos (FR-002)

Implementation:
  <input
    type="file"
    accept="image/*"
    capture="environment"  // Use rear camera
  />

  // Or native camera API
  navigator.mediaDevices.getUserMedia({ video: true })
```

---

## 📊 SUCCESS METRICS

| Metric           | Target                           |
| ---------------- | -------------------------------- |
| Mobile usage     | >75% of traffic                  |
| PWA install rate | >15% mobile users                |
| Offline usage    | >5% sessions have offline events |
| Performance (3G) | <3s page load p95                |

---

**Version**: v1.0.0
**Status**: ✅ Ready for Development
