# 🎨 Animation System Quick Start Guide

**Version:** 2.0.0 - Framer Motion Integration
**Last Updated:** November 15, 2024
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Quick Overview](#quick-overview)
2. [Installation Check](#installation-check)
3. [Basic Usage](#basic-usage)
4. [Animation Variants](#animation-variants)
5. [Accessibility](#accessibility)
6. [Agricultural Animations](#agricultural-animations)
7. [Advanced Features](#advanced-features)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Overview

The Farmers Market Platform notification system now includes **86 animation variants** powered by Framer Motion, with full accessibility support and agricultural consciousness.

### Key Features
- ✅ **86 Animation Variants** - Toast, Banner, List, Seasonal
- ✅ **Automatic Accessibility** - Respects `prefers-reduced-motion`
- ✅ **Seasonal Themes** - Spring, Summer, Fall, Winter
- ✅ **Performance Optimized** - GPU-accelerated, 60fps target
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Zero Config** - Works out of the box

---

## 📦 Installation Check

The animation system is already installed and configured. Verify by checking:

```bash
# Framer Motion should be installed
npm list framer-motion
# Should show: framer-motion@11.x.x

# Animation files should exist
ls src/components/notifications/animations/
# Should list: toast-animations.ts, banner-animations.ts, list-animations.ts, seasonal-animations.ts, index.ts
```

---

## 🎯 Basic Usage

### 1. Using Animated Toasts

Toasts automatically get animations based on position and severity:

```typescript
import { useNotificationContext } from "@/components/notifications";

function MyComponent() {
  const { toast } = useNotificationContext();

  // ✅ Simple success toast (auto-animated)
  const showSuccess = () => {
    toast.success("Farm created successfully!", {
      duration: 5000,
      position: "top-right" // Animates from right
    });
  };

  // ✅ Error toast (auto-animated with shake effect)
  const showError = () => {
    toast.error("Failed to save farm", {
      duration: 0, // Persistent
      position: "top-center"
    });
  };

  // ✅ Info toast
  const showInfo = () => {
    toast.info("New features available");
  };
}
```

**Available Positions:**
- `top-left`, `top-center`, `top-right`
- `bottom-left`, `bottom-center`, `bottom-right`

**Animation Behavior:**
- Slides in from position edge
- Fades in with scale effect
- Auto-dismisses with exit animation
- Stagger effect with multiple toasts

---

### 2. Using Animated Banners

Banners get position-aware animations:

```typescript
import { Banner } from "@/components/notifications";

function MyComponent() {
  return (
    <Banner
      notification={{
        title: "System Maintenance",
        message: "Scheduled tonight at 11 PM",
        severity: "warning",
        position: "top",    // Slides down from top
        sticky: true,       // Stays at top during scroll
        dismissible: true
      }}
      onDismiss={() => console.log("Dismissed")}
    />
  );
}
```

**Available Positions:**
- `top` - Slides down from top
- `bottom` - Slides up from bottom
- `inline` - Fades and scales in place

---

### 3. Using Notification Center (Animated Lists)

The Notification Center automatically includes list animations:

```typescript
import { NotificationCenter } from "@/components/features/notifications";

function MyPage() {
  return (
    <NotificationCenter
      autoRefresh={true}
      refreshInterval={30000}
      // All animations included automatically:
      // - Stagger entrance (items appear one by one)
      // - Mark as read feedback (fade + scale)
      // - Filter transitions (smooth crossfade)
      // - Empty/loading states (pulse + fade)
    />
  );
}
```

**Automatic Animations:**
- ✅ Stagger entrance (50ms delay per item)
- ✅ Mark as read (fade + scale feedback)
- ✅ Filter changes (smooth crossfade)
- ✅ Remove items (slide out + fade)
- ✅ Empty state (gentle bounce)
- ✅ Loading state (spin + pulse)

---

## 🎨 Animation Variants

### Toast Variants (18 total)

#### By Position
```typescript
// Each position has unique entrance animation
"top-left"       → Slides in from top-left
"top-center"     → Slides down + fades in
"top-right"      → Slides in from top-right
"bottom-left"    → Slides in from bottom-left
"bottom-center"  → Slides up + fades in
"bottom-right"   → Slides in from bottom-right
```

#### By Severity
```typescript
toast.info()    → Smooth slide + fade
toast.success() → Bounce + scale + fade
toast.warning() → Shake + fade
toast.error()   → Intense shake + pulse + fade
```

#### Example: Custom Animation Selection
```typescript
// The system automatically selects variants, but you can influence them:
toast({
  title: "Important Update",
  severity: "warning",     // Triggers shake animation
  position: "top-center",  // Triggers slide-down
  animation: "bounce"      // Optional: override default
});
```

---

### Banner Variants (16 total)

#### By Position
```typescript
position: "top"    → Slides down, sticks to top
position: "bottom" → Slides up, sticks to bottom
position: "inline" → Fades + scales in place
```

#### By Severity
```typescript
severity: "info"         → Smooth entrance
severity: "success"      → Gentle bounce
severity: "warning"      → Attention-grabbing pulse
severity: "error"        → Strong shake
severity: "agricultural" → Seasonal entrance
```

---

### List Variants (24 total)

Automatically applied in NotificationCenter:

```typescript
// Container animations
listContainerVariants      → Stagger children entrance
listFilterChangeVariants   → Crossfade on filter change
listEmptyStateVariants     → Gentle bounce for empty state

// Item animations
listItemVariants           → Fade + slide entrance
listMarkAsReadVariants     → Opacity + scale feedback
listRemoveVariants         → Slide out + fade
listNewItemVariants        → Highlight + bounce

// Special states
listLoadingVariants        → Pulse + fade
listInfiniteScrollVariants → Progressive reveal
```

---

### Seasonal Variants (28 total)

Automatically applied to agricultural notifications:

```typescript
// Spring (March-May) - Bouncy, energetic
spring: {
  type: "spring",
  stiffness: 400,  // More bouncy
  damping: 25
}

// Summer (June-August) - Smooth, flowing
summer: {
  type: "tween",
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1]
}

// Fall (September-November) - Gentle, settling
fall: {
  type: "spring",
  stiffness: 200,  // Less bouncy
  damping: 30
}

// Winter (December-February) - Crisp, sharp
winter: {
  type: "tween",
  duration: 0.6,
  ease: [0.4, 0, 0.2, 1]
}
```

---

## ♿ Accessibility

### Automatic Reduced Motion Support

The system automatically respects user preferences:

```typescript
// Users with prefers-reduced-motion enabled get:
// - Zero duration animations (instant state changes)
// - No scale, rotation, or blur effects
// - Opacity fades only
// - All functionality preserved
```

### Check Reduced Motion in Your Code

```typescript
import { useReducedMotion } from "@/components/notifications/hooks";

function MyComponent() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    // Show static version
    return <StaticNotification />;
  }

  // Show animated version
  return <AnimatedNotification />;
}
```

### Other Accessibility Hooks

```typescript
import {
  useReducedMotion,
  useShouldAnimate,
  useAnimationDuration,
  useAccessibleTransition
} from "@/components/notifications/hooks";

function MyComponent() {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = useShouldAnimate(); // Considers performance too

  // Get adjusted duration based on user preference
  const duration = useAnimationDuration(300, 0);
  // Returns: 300ms normally, 0ms if reduced motion

  // Get accessible transition config
  const transition = useAccessibleTransition();
  // Returns: spring config normally, { duration: 0 } if reduced motion
}
```

---

## 🌾 Agricultural Animations

### Automatic Seasonal Detection

Agricultural notifications automatically use seasonal animations:

```typescript
// Automatically detects current season
toast.agricultural("Harvest season has begun!", {
  metadata: {
    agricultural: {
      season: "fall",           // Uses fall seasonal animations
      eventType: "harvesting",
      farmName: "Green Valley Farm",
      productName: "Tomatoes"
    }
  }
});
```

### Available Agricultural Event Types

```typescript
"planting"         → Seed sprouting animation
"growing"          → Growth progress animation
"harvesting"       → Gathering animation
"processing"       → Transformation animation
"market_opening"   → Door opening animation
"market_closing"   → Door closing animation
"weather_alert"    → Weather icon animation
"seasonal_change"  → Season transition
"crop_ready"       → Checkmark bounce
"harvest_complete" → Celebration animation
"product_available"→ Pop-in animation
"low_stock"        → Attention pulse
"out_of_stock"     → Fade out animation
```

### Growth Cycle Animations

```typescript
import { growthCycleVariants } from "@/components/notifications/animations";

// Available growth stages
growthCycleVariants.seed       // Initial state
growthCycleVariants.sprout     // Emerging
growthCycleVariants.growing    // Expanding
growthCycleVariants.mature     // Fully grown
growthCycleVariants.harvest    // Collection
```

### Weather Animations

```typescript
import { weatherEffectVariants } from "@/components/notifications/animations";

// Available weather effects
weatherEffectVariants.sunny    // Bright, warm
weatherEffectVariants.rainy    // Droplets falling
weatherEffectVariants.cloudy   // Gentle drift
weatherEffectVariants.stormy   // Intense shake
weatherEffectVariants.snowy    // Floating down
weatherEffectVariants.windy    // Side-to-side sway
```

---

## 🎛️ Advanced Features

### Using Animation Context

Control animations globally across your app:

```typescript
import { useAnimationContext } from "@/components/notifications/context";

function SettingsPage() {
  const {
    preset,              // Current preset
    setPreset,           // Change preset
    season,              // Current season
    setSeason,           // Override season
    shouldAnimate,       // Whether animations enabled
    speedMultiplier,     // Current speed (0.1x - 2x)
    setSpeedMultiplier,  // Change speed
    performanceMode      // "high" | "medium" | "low"
  } = useAnimationContext();

  return (
    <div>
      {/* Preset Selector */}
      <select value={preset} onChange={(e) => setPreset(e.target.value)}>
        <option value="minimal">Minimal (0.5x)</option>
        <option value="standard">Standard (1x)</option>
        <option value="enhanced">Enhanced (1.2x)</option>
        <option value="divine">Divine (1.5x)</option>
      </select>

      {/* Speed Control */}
      <input
        type="range"
        min="0.1"
        max="2"
        step="0.1"
        value={speedMultiplier}
        onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
      />

      {/* Season Override */}
      <select value={season} onChange={(e) => setSeason(e.target.value)}>
        <option value="spring">Spring</option>
        <option value="summer">Summer</option>
        <option value="fall">Fall</option>
        <option value="winter">Winter</option>
      </select>
    </div>
  );
}
```

### Animation Presets

```typescript
"minimal"   → 0.5x speed, reduced effects, fast & subtle
"standard"  → 1x speed, normal effects (default)
"enhanced"  → 1.2x speed, full effects, smooth & polished
"divine"    → 1.5x speed, maximum effects, butter smooth
```

### Custom Animation Variants

Create your own variants using our utilities:

```typescript
import { motion } from "framer-motion";
import { toastStaggerTransition } from "@/components/notifications/animations";

function CustomToast() {
  const customVariants = {
    initial: { opacity: 0, y: -50, scale: 0.8 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: toastStaggerTransition
    },
    exit: {
      opacity: 0,
      x: 100,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      variants={customVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Your content */}
    </motion.div>
  );
}
```

### Performance Monitoring

```typescript
import { useAnimationContext, useAnimationQuality } from "@/components/notifications/context";

function PerformanceMonitor() {
  const { performanceMode } = useAnimationContext();
  const quality = useAnimationQuality();

  console.log("Performance Mode:", performanceMode);
  // "high", "medium", or "low"

  console.log("Animation Quality:", quality);
  // {
  //   useBlur: boolean,
  //   useScale: boolean,
  //   useRotate: boolean,
  //   useComplexTransforms: boolean,
  //   useShadows: boolean
  // }
}
```

---

## 🐛 Troubleshooting

### Animations Not Playing

**Problem:** Animations don't appear to work.

**Solutions:**
1. Check if user has reduced motion enabled:
   ```typescript
   const prefersReducedMotion = useReducedMotion();
   console.log("Reduced motion:", prefersReducedMotion);
   ```

2. Verify AnimationProvider is wrapping your app:
   ```typescript
   // Should be in NotificationProvider automatically
   // If custom setup, ensure:
   <AnimationProvider>
     <YourApp />
   </AnimationProvider>
   ```

3. Check browser console for errors

4. Verify Framer Motion is installed:
   ```bash
   npm list framer-motion
   ```

---

### Performance Issues

**Problem:** Animations are choppy or slow.

**Solutions:**
1. Check performance mode:
   ```typescript
   const { performanceMode } = useAnimationContext();
   // Should auto-detect, but may need adjustment
   ```

2. Reduce animation preset:
   ```typescript
   const { setPreset } = useAnimationContext();
   setPreset("minimal"); // Fastest preset
   ```

3. Limit concurrent animations:
   ```typescript
   // In ToastRenderer, reduce maxPerPosition
   <ToastRenderer maxPerPosition={3} />
   ```

4. Check DevTools Performance tab for bottlenecks

---

### TypeScript Errors

**Problem:** Type errors with animation imports.

**Solutions:**
1. Ensure you're importing from correct paths:
   ```typescript
   // ✅ Correct
   import { useReducedMotion } from "@/components/notifications/hooks";
   import { useAnimationContext } from "@/components/notifications/context";

   // ❌ Wrong
   import { useReducedMotion } from "@/components/notifications/animations";
   ```

2. Import types separately:
   ```typescript
   import type { AnimationPreset } from "@/components/notifications/context";
   ```

3. Check tsconfig.json path aliases are correct

---

### Seasonal Animations Not Working

**Problem:** Agricultural notifications don't use seasonal animations.

**Solutions:**
1. Verify seasonal animations are enabled:
   ```typescript
   const { useSeasonalAnimations, toggleSeasonalAnimations } = useAnimationContext();
   console.log("Seasonal enabled:", useSeasonalAnimations);
   ```

2. Ensure agricultural metadata is provided:
   ```typescript
   toast.agricultural("Message", {
     metadata: {
       agricultural: {
         season: "fall",        // Must provide season
         eventType: "harvesting"
       }
     }
   });
   ```

3. Check if reduced motion is overriding (it takes priority)

---

## 📚 Additional Resources

### Documentation
- [Full Animation System Documentation](./DAY_14_ANIMATION_SYSTEM_PROGRESS.md)
- [Phase 4 Integration Details](./DAY_14_PHASE_4_COMPLETE.md)
- [Framer Motion Docs](https://www.framer.com/motion/)

### Code Examples
- Toast animations: `src/components/notifications/animations/toast-animations.ts`
- Banner animations: `src/components/notifications/animations/banner-animations.ts`
- List animations: `src/components/notifications/animations/list-animations.ts`
- Seasonal animations: `src/components/notifications/animations/seasonal-animations.ts`

### Helper Hooks
- Reduced motion: `src/components/notifications/hooks/useReducedMotion.ts`
- Animation context: `src/components/notifications/context/AnimationContext.tsx`

---

## 🎯 Best Practices

### DO ✅
- ✅ Use provided hooks for reduced motion detection
- ✅ Let the system auto-select variants (it's smart!)
- ✅ Provide agricultural metadata for seasonal animations
- ✅ Test with reduced motion enabled
- ✅ Monitor performance in DevTools
- ✅ Use animation presets for global control

### DON'T ❌
- ❌ Override animations unnecessarily
- ❌ Animate layout properties (width, height, margin)
- ❌ Create custom variants without performance testing
- ❌ Ignore reduced motion preferences
- ❌ Animate during critical user actions
- ❌ Use complex transforms on low-end devices

---

## 🚀 Quick Command Reference

```bash
# Start dev server to see animations
npm run dev

# Build production (tree-shaking included)
npm run build

# Type check
npm run type-check

# Test animations
npm run test

# Performance profiling
# Open Chrome DevTools → Performance → Record
```

---

## 🎉 You're Ready!

The animation system is fully integrated and ready to use. Just import the notification context and start creating beautiful, accessible, agriculturally-conscious animations!

```typescript
import { useNotificationContext } from "@/components/notifications";

function MyComponent() {
  const { toast } = useNotificationContext();

  return (
    <button onClick={() => toast.success("You're all set! 🎉")}>
      Show Success Toast
    </button>
  );
}
```

**Happy Animating! 🎨✨**

---

**Questions or Issues?**
- Check the troubleshooting section above
- Review the full documentation in `DAY_14_ANIMATION_SYSTEM_PROGRESS.md`
- See integration details in `DAY_14_PHASE_4_COMPLETE.md`

---

*Built with agricultural consciousness and accessibility at heart* 🌾♿✨
