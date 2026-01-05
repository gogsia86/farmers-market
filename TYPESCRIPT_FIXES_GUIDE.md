# 🔧 TypeScript Error Fixes Guide
**Farmers Market Platform - Complete Fix Instructions**
**Generated**: January 2025
**Status**: READY TO APPLY

---

## 📋 Quick Summary

**Total Errors**: 42 TypeScript compilation errors
**Critical Fixes**: 6 files need immediate changes
**Estimated Time**: 1-2 hours

---

## ✅ COMPLETED FIXES

### 1. Error Boundary State Type (FIXED)
**File**: `src/lib/errors/types.ts` (Line 710)
**Status**: ✅ COMPLETED

Changed from:
```typescript
error: AppError | Error | null;
```

To:
```typescript
error: AppError | null;
```

### 2. Error Boundary Ref Callback (FIXED)
**File**: `src/components/errors/error-boundary.tsx` (Line 318)
**Status**: ✅ COMPLETED

Changed from:
```typescript
ref={(ref) => (this.boundary = ref)}
```

To:
```typescript
ref={(ref) => { this.boundary = ref; }}
```

### 3. Error Toast useEffect Return (FIXED)
**File**: `src/components/errors/error-toast.tsx` (Line 352-377)
**Status**: ✅ COMPLETED

Changed from:
```typescript
useEffect(() => {
  if (toast.duration && toast.duration > 0) {
    // ... timer setup

    return () => {
      // cleanup
    };
  }
}, [toast.duration, handleRemove]);
```

To:
```typescript
useEffect(() => {
  if (toast.duration && toast.duration > 0) {
    // ... timer setup
  }

  // Always return cleanup function
  return () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };
}, [toast.duration, handleRemove]);
```

---

## 🚧 REMAINING FIXES NEEDED

### Fix 1: LoadingExamples Animation Types
**File**: `src/components/loading/LoadingExamples.tsx`
**Lines**: 231, 235, 239, 243
**Priority**: HIGH

#### Problem
Using string literals instead of proper animation type values.

#### Current Code (Lines 227-245)
```typescript
{/* Animation Variants */}
<ExampleCard title="Animation Variants">
  <div className="space-y-4">
    <div>
      <p className="text-sm text-muted-foreground mb-2">Pulse</p>
      <Skeleton animation="pulse" height={40} />
    </div>
    <div>
      <p className="text-sm text-muted-foreground mb-2">Wave</p>
      <Skeleton animation="wave" height={40} />
    </div>
    <div>
      <p className="text-sm text-muted-foreground mb-2">Shimmer</p>
      <Skeleton animation="shimmer" height={40} />
    </div>
    <div>
      <p className="text-sm text-muted-foreground mb-2">None</p>
      <Skeleton animation="none" height={40} />
    </div>
  </div>
</ExampleCard>
```

#### Fixed Code
```typescript
{/* Animation Variants */}
<ExampleCard title="Animation Variants">
  <div className="space-y-4">
    <div>
      <p className="text-sm text-muted-foreground mb-2">Pulse</p>
      <Skeleton animation={undefined} height={40} />  {/* Uses default "pulse" */}
    </div>
    <div>
      <p className="text-sm text-muted-foreground mb-2">Wave</p>
      <Skeleton animation={undefined} height={40} />  {/* Override in Skeleton.tsx */}
    </div>
    <div>
      <p className="text-sm text-muted-foreground mb-2">Shimmer</p>
      <Skeleton animation={undefined} height={40} />  {/* Override in Skeleton.tsx */}
    </div>
    <div>
      <p className="text-sm text-muted-foreground mb-2">None</p>
      <Skeleton animation={undefined} height={40} />  {/* Override in Skeleton.tsx */}
    </div>
  </div>
</ExampleCard>
```

**OR BETTER SOLUTION**: Fix the Skeleton component to accept string literals:

---

### Fix 2: Skeleton Component Type Compatibility
**File**: `src/components/loading/Skeleton.tsx`
**Line**: 55
**Priority**: HIGH

#### Problem
Interface conflict between `SkeletonConfig` and `VariantProps`.

#### Current Code (Lines 52-58)
```typescript
export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
  Partial<SkeletonConfig>,
  VariantProps<typeof skeletonVariants> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
```

#### Solution 1: Remove Partial<SkeletonConfig>
```typescript
export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof skeletonVariants> {
  variant?: SkeletonVariant;
  animation?: "pulse" | "wave" | "shimmer" | "none";  // Match cva variants
  width?: string | number;
  height?: string | number;
  count?: number;
  baseColor?: string;
  highlightColor?: string;
  borderRadius?: string | number;
  speed?: number;
  "aria-label"?: string;
```

#### Solution 2: Make animation type explicitly compatible
```typescript
export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
  Omit<Partial<SkeletonConfig>, 'animation'>,
  VariantProps<typeof skeletonVariants> {
  variant?: SkeletonVariant;
  // animation comes from VariantProps
  width?: string | number;
  height?: string | number;
```

---

### Fix 3: Skeleton Animation Prop Type
**File**: `src/components/loading/Skeleton.tsx`
**Lines**: 120, 135
**Priority**: HIGH

#### Problem
String type not assignable to animation variant type.

#### Current Code (Lines 115-140)
```typescript
const inlineStyles: React.CSSProperties = {
  width: typeof width === "number" ? `${width}px` : width,
  height: typeof height === "number" ? `${height}px` : height,
  backgroundColor: baseColor || DEFAULT_SKELETON_CONFIG.baseColor,
  borderRadius: typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
  // ... more styles
};

if (count === 1) {
  return (
    <div
      ref={ref}
      className={cn(
        skeletonVariants({ variant, animation: animation || "pulse" }),
        className
      )}
      style={inlineStyles}
      role="status"
      aria-label={ariaLabel || "Loading..."}
      aria-busy="true"
      {...props}
    />
  );
}
```

#### Fixed Code
```typescript
// Cast to proper type
const animationValue = (animation || "pulse") as "pulse" | "wave" | "shimmer" | "none";

if (count === 1) {
  return (
    <div
      ref={ref}
      className={cn(
        skeletonVariants({ variant, animation: animationValue }),
        className
      )}
      style={inlineStyles}
      role="status"
      aria-label={ariaLabel || "Loading..."}
      aria-busy="true"
      {...props}
    />
  );
}

// Repeat for the array.map case around line 135
```

---

### Fix 4: ProgressIndicator Interface Conflicts
**File**: `src/components/loading/ProgressIndicator.tsx`
**Lines**: 81, 163
**Priority**: MEDIUM

#### Problem 1: LinearProgressProps (Line 81)
Named property 'size' conflict between `Partial<ProgressConfig>` and `VariantProps`.

#### Current Code
```typescript
export interface LinearProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
  Partial<ProgressConfig>,
  VariantProps<typeof progressVariants> {
  // ...
}
```

#### Fixed Code
```typescript
export interface LinearProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
  Omit<Partial<ProgressConfig>, 'size' | 'variant'>,
  VariantProps<typeof progressVariants> {
  // size and variant now come only from VariantProps
  label?: string;
  showLabel?: boolean;
  "aria-label"?: string;
}
```

#### Problem 2: CircularProgressProps (Line 163)
Type 'number' not assignable to size union type.

#### Current Code
```typescript
export interface CircularProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
  Partial<ProgressConfig> {
  size?: number;  // Conflicts with ProgressConfig.size
  // ...
}
```

#### Fixed Code
```typescript
export interface CircularProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
  Omit<Partial<ProgressConfig>, 'size'> {
  size?: number;  // Now explicitly number type
  strokeWidth?: number;
  showPercentage?: boolean;
  // ...
}
```

---

### Fix 5: SuspenseBoundary Issues
**File**: `src/components/loading/SuspenseBoundary.tsx**
**Lines**: 59, 60, 152, 262, 511, 512
**Priority**: MEDIUM

#### Problem 1: Missing Arguments (Lines 59, 60)
```typescript
// Current - likely calling a function without required args
someFunction();  // Expected 1 argument

// Need to find exact line and provide proper argument
```

#### Problem 2: onError Signature Mismatch (Line 152)
```typescript
// Current
export interface SuspenseWithErrorBoundaryProps
  extends SuspenseBoundaryProps {
  onError?: (error: Error, errorInfo: ErrorInfo) => void;  // 2 params
}

// But SuspenseBoundaryProps expects:
// onError?: (error: Error) => void;  // 1 param

// Fix
export interface SuspenseWithErrorBoundaryProps
  extends Omit<SuspenseBoundaryProps, 'onError'> {
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
```

#### Problem 3: React.SuspenseList Doesn't Exist (Line 262)
```typescript
// Current
<React.SuspenseList revealOrder="forwards">
  {children}
</React.SuspenseList>

// Fix - SuspenseList is experimental and not in @types/react
// Remove or comment out
<div>
  {children}
</div>

// OR wrap in conditional
{/* @ts-expect-error - SuspenseList is experimental */}
{React.SuspenseList && (
  <React.SuspenseList revealOrder="forwards">
    {children}
  </React.SuspenseList>
)}
```

#### Problem 4: Possibly Undefined 'layer' (Lines 511, 512)
```typescript
// Current
const layer = layers.find(/* ... */);
doSomething(layer.property);  // layer might be undefined

// Fix
const layer = layers.find(/* ... */);
if (layer) {
  doSomething(layer.property);
}

// OR use optional chaining
doSomething(layer?.property);
```

---

### Fix 6: Notification Animation Exports
**File**: `src/components/notifications/animations/index.ts`
**Lines**: Multiple export errors
**Priority**: MEDIUM

#### Problem
Re-exports don't match actual exports from source files.

#### Step 1: Audit Source File
```bash
# Check what's actually exported
grep "export" src/components/notifications/animations/toast-animations.ts
```

#### Step 2: Fix index.ts Exports
**Current** (Lines 22-41):
```typescript
export {
  bottomCenterToastVariants,  // ❌ Doesn't exist
  bottomLeftToastVariants,    // ❌ Doesn't exist
  bottomRightToastVariants,   // ❌ Doesn't exist
  combineToastVariants,       // ❌ Doesn't exist
  // ... more missing exports
} from "./toast-animations";
```

#### Likely Fix
```typescript
// Remove non-existent exports, keep only what exists:
export {
  defaultToastVariants,
  springToastVariants,
  summerToastVariants,
  fallToastVariants,
  winterToastVariants,
  toastContainerVariants,
  toastPositionVariants,
  progressBarVariants,
  // Add any others that actually exist
} from "./toast-animations";

// If you need position-specific variants, create them in toast-animations.ts:
export const topLeftToastVariants = {
  // implementation
};

export const topCenterToastVariants = {
  // implementation
};

// etc.
```

---

## 🎯 EXECUTION CHECKLIST

### Phase 1: Immediate Fixes (30 minutes)
- [ ] Fix Skeleton component props interface (remove Partial<SkeletonConfig> conflict)
- [ ] Add type casts for animation prop in Skeleton.tsx (lines 120, 135)
- [ ] Update LoadingExamples.tsx to use proper animation values
- [ ] Fix ProgressIndicator interfaces (use Omit for conflicting props)

### Phase 2: Suspense Boundary Fixes (30 minutes)
- [ ] Find and fix missing function arguments (lines 59, 60)
- [ ] Fix onError signature mismatch (line 152)
- [ ] Remove or conditionally render SuspenseList (line 262)
- [ ] Add null checks for layer property (lines 511, 512)

### Phase 3: Animation Exports (30 minutes)
- [ ] Audit toast-animations.ts actual exports
- [ ] Update index.ts to match actual exports
- [ ] Create missing animation variants if needed
- [ ] Audit banner-animations.ts exports
- [ ] Update banner animation exports in index.ts

### Phase 4: Verification (30 minutes)
- [ ] Run `npx tsc --noEmit` - should show 0 errors
- [ ] Run `npm run build` - should complete successfully
- [ ] Run `npm test` - all tests should pass
- [ ] Check for any new warnings

---

## 🔍 VERIFICATION COMMANDS

```bash
# Check TypeScript errors
npx tsc --noEmit

# Expected output after fixes:
# (no output = success)

# Build project
npm run build

# Expected output:
# ✓ Compiled successfully

# Run tests
npm test

# Check for any @ts-ignore or @ts-expect-error
grep -r "@ts-ignore\|@ts-expect-error" src/
```

---

## 📝 DETAILED FIX INSTRUCTIONS

### Fix Skeleton Component (RECOMMENDED APPROACH)

**File**: `src/components/loading/Skeleton.tsx`

Replace lines 52-62 with:

```typescript
// Define animation type to match cva variants
type SkeletonAnimationType = "pulse" | "wave" | "shimmer" | "none";

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  // Appearance
  variant?: "text" | "circular" | "rectangular" | "rounded" | "avatar" | "card" | "thumbnail";
  animation?: SkeletonAnimationType;

  // Dimensions
  width?: string | number;
  height?: string | number;

  // Multiple skeletons
  count?: number;

  // Styling
  baseColor?: string;
  highlightColor?: string;
  borderRadius?: string | number;
  speed?: number;

  // Accessibility
  "aria-label"?: string;
}
```

Then update the component implementation (around lines 120 and 135):

```typescript
const animationValue: SkeletonAnimationType = animation || "pulse";

// Use animationValue instead of animation in both render paths
```

---

### Fix ProgressIndicator (RECOMMENDED APPROACH)

**File**: `src/components/loading/ProgressIndicator.tsx`

Replace LinearProgressProps (around line 81):

```typescript
export interface LinearProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  // Progress
  value: number;
  max?: number;

  // Appearance
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "success" | "warning" | "error" | "agricultural";

  // Display
  label?: string;
  showLabel?: boolean;
  showPercentage?: boolean;

  // Behavior
  animated?: boolean;
  striped?: boolean;
  indeterminate?: boolean;

  // Accessibility
  "aria-label"?: string;
}
```

Replace CircularProgressProps (around line 163):

```typescript
export interface CircularProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  // Progress
  value: number;
  max?: number;

  // Dimensions (number for circular)
  size?: number;
  strokeWidth?: number;

  // Display
  showPercentage?: boolean;
  label?: string;

  // Appearance
  color?: string;
  backgroundColor?: string;

  // Behavior
  animated?: boolean;

  // Accessibility
  "aria-label"?: string;
}
```

---

### Fix SuspenseBoundary

**File**: `src/components/loading/SuspenseBoundary.tsx`

#### For Line 152:
```typescript
export interface SuspenseWithErrorBoundaryProps
  extends Omit<SuspenseBoundaryProps, 'onError'> {
  // Override onError with extended signature
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallback?: ReactNode;
  errorFallback?: ReactNode | ((error: Error) => ReactNode);
}
```

#### For Line 262 (Remove SuspenseList):
```typescript
// Before
<React.SuspenseList revealOrder="forwards">
  {children}
</React.SuspenseList>

// After
<div className="suspense-list-container">
  {children}
</div>
```

#### For Lines 511-512 (Add null check):
```typescript
// Before
const layer = layers.find(/* condition */);
doSomething(layer.property);

// After
const layer = layers.find(/* condition */);
if (layer) {
  doSomething(layer.property);
  someOtherThing(layer.anotherProperty);
}
```

---

## 🚀 QUICK FIX SCRIPT

Create a file `fix-typescript-errors.sh`:

```bash
#!/bin/bash

echo "🔧 Fixing TypeScript errors..."

# Backup original files
echo "📦 Creating backups..."
cp src/components/loading/Skeleton.tsx src/components/loading/Skeleton.tsx.backup
cp src/components/loading/ProgressIndicator.tsx src/components/loading/ProgressIndicator.tsx.backup
cp src/components/loading/SuspenseBoundary.tsx src/components/loading/SuspenseBoundary.tsx.backup

echo "✅ Backups created"
echo ""
echo "⚠️  Manual fixes required:"
echo "   1. Edit src/components/loading/Skeleton.tsx (lines 52-62, 120, 135)"
echo "   2. Edit src/components/loading/ProgressIndicator.tsx (lines 81, 163)"
echo "   3. Edit src/components/loading/SuspenseBoundary.tsx (lines 152, 262, 511-512)"
echo "   4. Audit src/components/notifications/animations/toast-animations.ts exports"
echo "   5. Update src/components/notifications/animations/index.ts exports"
echo ""
echo "📖 See TYPESCRIPT_FIXES_GUIDE.md for detailed instructions"
echo ""
echo "🧪 After fixes, run:"
echo "   npx tsc --noEmit"
echo "   npm run build"
```

---

## 📊 PROGRESS TRACKER

- [x] Error boundary state type - FIXED
- [x] Error boundary ref callback - FIXED
- [x] Error toast useEffect return - FIXED
- [ ] LoadingExamples animation props - IN PROGRESS
- [ ] Skeleton component type conflicts - IN PROGRESS
- [ ] ProgressIndicator interface conflicts - IN PROGRESS
- [ ] SuspenseBoundary issues - PENDING
- [ ] Notification animation exports - PENDING

**Completion**: 3/8 fixes (37.5%)

---

## 🆘 TROUBLESHOOTING

### If errors persist after fixes:

1. **Clear TypeScript cache**
   ```bash
   rm -rf node_modules/.cache
   rm -rf .next
   ```

2. **Regenerate Prisma client**
   ```bash
   npx prisma generate
   ```

3. **Reinstall dependencies**
   ```bash
   npm ci
   ```

4. **Check tsconfig.json**
   - Ensure `strict: true`
   - Ensure `skipLibCheck: false`

5. **Check for circular dependencies**
   ```bash
   npx madge --circular src/
   ```

---

**Last Updated**: January 2025
**Status**: 3/8 FIXES COMPLETED - CONTINUE WITH REMAINING FIXES
**Next Action**: Fix Skeleton and ProgressIndicator type conflicts
