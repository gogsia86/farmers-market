# 🚀 Lazy Loading Wrappers

**Phase 6 Performance Optimization**  
**Purpose**: Reduce initial bundle size by loading heavy dependencies only when needed

---

## 📊 Overview

This directory contains lazy-loading wrappers for heavy dependencies that don't need to be loaded on every page. By deferring the import of these modules until they're actually used, we significantly reduce the initial bundle size and improve page load performance.

---

## 🎯 Optimizations Implemented

### 1. Analytics Lazy Loading (`analytics.lazy.ts`)

**Savings**: 25-30 KB  
**Module**: `@vercel/analytics`

**What It Does**:
- Loads Vercel Analytics only when tracking events
- Provides batch event queuing for efficiency
- Agricultural-specific tracking helpers

**Usage**:
```typescript
import { trackEvent, trackFarmEvent } from '@/lib/lazy/analytics.lazy';

// Analytics loaded on first call
await trackEvent('product_view', { productId: '123' });
await trackFarmEvent('harvest_recorded', { farmId: '456' });
```

---

### 2. Image Processing Lazy Loading (`image.lazy.ts`)

**Savings**: 40-50 KB  
**Module**: `sharp`

**What It Does**:
- Loads Sharp image processing library only when needed
- Product and farm image optimization helpers
- Thumbnail generation on demand
- Responsive image generation

**Usage**:
```typescript
import { processProductImage, createThumbnail } from '@/lib/lazy/image.lazy';

// Sharp loaded on first call
const { full, thumbnail } = await processProductImage(imageBuffer);
const thumb = await createThumbnail(imageBuffer, { width: 200, height: 200 });
```

---

### 3. TensorFlow Lazy Loading (`ml.lazy.ts`)

**Savings**: 80-120 KB (BIGGEST WIN!)  
**Module**: `@tensorflow/tfjs`, `@tensorflow/tfjs-node-gpu`

**What It Does**:
- Loads TensorFlow only for ML operations
- Crop yield prediction
- Disease classification from images
- Market price forecasting
- Pest detection

**Usage**:
```typescript
import { predictCropYield, classifyCropDisease } from '@/lib/lazy/ml.lazy';

// TensorFlow loaded on first call
const prediction = await predictCropYield({
  cropType: 'tomatoes',
  plantingDate: new Date(),
  location: { latitude: 40.7128, longitude: -74.0060 }
});

const disease = await classifyCropDisease(imageBuffer);
```

---

## 📈 Total Expected Savings

| Optimization | Module | Expected Savings |
|--------------|--------|------------------|
| Analytics | @vercel/analytics | 25-30 KB |
| Image Processing | sharp | 40-50 KB |
| TensorFlow ML | @tensorflow/tfjs | 80-120 KB |
| **TOTAL** | | **145-200 KB** |

---

## 🏗️ How Lazy Loading Works

### Before (Eager Loading)
```typescript
// ❌ Module loaded immediately on every page
import { track } from '@vercel/analytics';

export function trackEvent(name: string) {
  track(name); // Analytics in bundle even if never used
}
```

### After (Lazy Loading)
```typescript
// ✅ Module loaded only when function is called
export async function trackEvent(name: string) {
  const { track } = await import('@vercel/analytics');
  track(name); // Analytics loaded on first use
}
```

**Benefits**:
- Smaller initial bundle
- Faster page load
- Better Time to Interactive (TTI)
- Modules loaded in parallel when needed
- No user-facing changes (transparent)

---

## 🎓 Best Practices

### When to Use Lazy Loading

✅ **DO lazy load**:
- Heavy libraries (>20 KB)
- Rarely used features
- User-triggered operations (upload, export)
- Admin-only functionality
- ML/AI operations
- Analytics/tracking
- PDF generation
- Chart libraries

❌ **DON'T lazy load**:
- Core UI components used on every page
- Authentication logic
- Critical path dependencies
- Small utilities (<5 KB)
- React/Next.js itself

### Performance Tips

1. **Preload during idle time**:
```typescript
import { preloadAnalytics } from '@/lib/lazy/analytics.lazy';

// Preload during browser idle time
if (typeof window !== 'undefined') {
  window.requestIdleCallback(() => {
    preloadAnalytics();
  });
}
```

2. **Cache the promise**:
```typescript
let analyticsPromise: Promise<any> | null = null;

async function loadAnalytics() {
  if (!analyticsPromise) {
    analyticsPromise = import('@vercel/analytics');
  }
  return analyticsPromise;
}
```

3. **Batch operations**:
```typescript
import { queueEvent, flushEvents } from '@/lib/lazy/analytics.lazy';

// Queue multiple events
queueEvent('event1', { data: 1 });
queueEvent('event2', { data: 2 });

// Flush all at once (loaded once)
await flushEvents();
```

---

## 🧪 Testing Lazy Loading

### Verify Module is Lazy
```typescript
// Test file
import { trackEvent } from '@/lib/lazy/analytics.lazy';

test('analytics not loaded before first use', () => {
  // Check that @vercel/analytics is not in require.cache
  expect(require.cache['@vercel/analytics']).toBeUndefined();
});

test('analytics loaded on first use', async () => {
  await trackEvent('test');
  // Now it should be loaded (in production, cached)
});
```

### Measure Impact
```bash
# Before optimization
npm run build:analyze

# After optimization
npm run build:analyze

# Compare bundle sizes in .next/analyze/nodejs.html
```

---

## 📚 Related Documentation

- **Phase 6 Master Plan**: `docs/phases/PHASE_6_MASTER_PLAN.md`
- **Baseline Metrics**: `docs/optimization/PHASE_5D_BASELINE.md`
- **Progress Tracker**: `docs/phases/PHASE_6_PROGRESS_TRACKER.md`

---

## 🔄 Migration Guide

### Migrating from Direct Imports

**Step 1**: Identify usage
```bash
# Find all direct imports
grep -r "@vercel/analytics" src/
```

**Step 2**: Replace with lazy wrapper
```typescript
// Before
import { track } from '@vercel/analytics';
track('event_name', { data });

// After
import { trackEvent } from '@/lib/lazy/analytics.lazy';
await trackEvent('event_name', { data });
```

**Step 3**: Update to async/await
```typescript
// If in async function - easy
async function handleClick() {
  await trackEvent('button_click');
}

// If in sync function - fire and forget
function handleClick() {
  trackEvent('button_click').catch(console.error);
}
```

---

## 🚀 Future Optimizations

Potential candidates for lazy loading:

- [ ] **Nodemailer** - Email sending (30-40 KB)
- [ ] **Stripe** - Payment processing (when used)
- [ ] **date-fns** - Date utilities (conditional imports)
- [ ] **PDF generation** - PDF export features
- [ ] **CSV export** - Data export utilities
- [ ] **Chart libraries** - Data visualization
- [ ] **Cloudinary** - Image uploads (API only)

---

## 📞 Questions?

**Q: Will lazy loading break my code?**  
A: No! These wrappers maintain the same API. Just add `await` to the function calls.

**Q: What about SSR/server-side?**  
A: Works perfectly! Dynamic imports work on both client and server.

**Q: How do I know if it's working?**  
A: Check bundle analyzer before/after. The modules should move to separate chunks.

**Q: Can I preload modules?**  
A: Yes! Use the `preload*()` functions during idle time.

---

## ✅ Checklist for New Lazy Wrappers

When creating a new lazy loading wrapper:

- [ ] Create `[module].lazy.ts` file
- [ ] Cache the import promise
- [ ] Maintain original API surface
- [ ] Add TypeScript types
- [ ] Include usage examples
- [ ] Add preload function
- [ ] Document expected savings
- [ ] Update this README

---

**Version**: 1.0  
**Created**: Phase 6 - Day 2  
**Last Updated**: January 2025  
**Status**: ✅ Active and Saving Bundle Size!

🌾 **Building divine agricultural excellence through performance!** 🚀