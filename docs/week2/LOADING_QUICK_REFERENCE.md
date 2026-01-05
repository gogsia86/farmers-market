# 🚀 Loading System Quick Reference Guide

**Version**: 1.0.0
**Last Updated**: November 15, 2024

---

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Skeleton Components](#skeleton-components)
3. [Loading Spinners](#loading-spinners)
4. [Progress Indicators](#progress-indicators)
5. [Suspense Boundaries](#suspense-boundaries)
6. [Loading Hooks](#loading-hooks)
7. [Common Patterns](#common-patterns)
8. [Agricultural Themes](#agricultural-themes)

---

## Quick Start

### Installation

```typescript
import {
  Skeleton,
  LoadingSpinner,
  LinearProgress,
  SuspenseBoundary,
} from "@/components/loading";

import { useAsync, useProgress } from "@/hooks/use-loading";
```

### Basic Usage

```typescript
// Show loading spinner
<LoadingSpinner />

// Show skeleton while loading
{isLoading ? <Skeleton variant="card" /> : <Content />}

// Suspense boundary
<SuspenseBoundary fallback={<Skeleton />}>
  <AsyncComponent />
</SuspenseBoundary>
```

---

## Skeleton Components

### Basic Skeleton

```typescript
// Single skeleton
<Skeleton width={200} height={40} />

// Multiple skeletons
<Skeleton variant="text" count={3} />
```

### Skeleton Variants

```typescript
// Text skeleton
<TextSkeleton lines={4} lastLineWidth="80%" />

// Avatar skeleton
<AvatarSkeleton size={48} showLabel labelWidth={120} />

// Card skeleton
<CardSkeleton
  showImage
  showAvatar
  textLines={3}
  imageHeight={200}
/>

// List skeleton
<ListSkeleton items={5} showAvatar textLines={2} />

// Grid skeleton
<GridSkeleton items={6} columns={3} itemHeight={200} />

// Table skeleton
<TableSkeleton rows={5} columns={4} showHeader />
```

### Animation Types

```typescript
<Skeleton animation="pulse" />   // Default
<Skeleton animation="wave" />    // Wave effect
<Skeleton animation="shimmer" /> // Shimmer effect
<Skeleton animation="none" />    // No animation
```

### Custom Styling

```typescript
<Skeleton
  baseColor="#e0e0e0"
  highlightColor="#f5f5f5"
  borderRadius="8px"
  speed={1.5}
/>
```

---

## Loading Spinners

### Spinner Variants

```typescript
// Default spinner
<LoadingSpinner variant="default" />

// Dots spinner
<LoadingSpinner variant="dots" />

// Bars spinner
<LoadingSpinner variant="bars" />

// Circle spinner
<LoadingSpinner variant="circle" />

// Pulse spinner
<LoadingSpinner variant="pulse" />

// Agricultural spinner (seasonal)
<LoadingSpinner variant="agricultural" />
```

### Spinner Sizes

```typescript
<LoadingSpinner size="xs" />  // Extra small
<LoadingSpinner size="sm" />  // Small
<LoadingSpinner size="md" />  // Medium (default)
<LoadingSpinner size="lg" />  // Large
<LoadingSpinner size="xl" />  // Extra large
```

### Specialized Spinners

```typescript
// Centered spinner
<CenteredLoadingSpinner
  message="Loading content..."
  fullScreen={false}
  backdrop
/>

// Inline spinner
<InlineLoadingSpinner
  text="Processing..."
  position="left"
/>

// Button spinner
<button disabled={isLoading}>
  <ButtonLoadingSpinner isLoading={isLoading}>
    Submit
  </ButtonLoadingSpinner>
</button>

// Overlay spinner
<div className="relative">
  <YourContent />
  {isLoading && <OverlayLoadingSpinner message="Saving..." />}
</div>
```

---

## Progress Indicators

### Linear Progress

```typescript
// Basic linear progress
<LinearProgress value={60} showPercentage />

// With label
<LinearProgress
  value={75}
  label="Uploading..."
  showPercentage
/>

// Indeterminate (unknown duration)
<LinearProgress indeterminate label="Processing..." />

// Different sizes
<LinearProgress value={50} size="sm" />
<LinearProgress value={50} size="md" />
<LinearProgress value={50} size="lg" />
```

### Circular Progress

```typescript
// Basic circular
<CircularProgress value={75} showValue />

// Custom size and color
<CircularProgress
  value={80}
  size={120}
  thickness={8}
  color="#10b981"
  showValue
/>

// With label
<CircularProgress
  value={65}
  size={96}
  showValue
  label="Loading"
/>
```

### Step Progress

```typescript
// Horizontal steps
<StepProgress
  steps={[
    { id: '1', label: 'Start', state: 'completed' },
    { id: '2', label: 'Process', state: 'active' },
    { id: '3', label: 'Finish', state: 'pending' },
  ]}
  currentStep={1}
  orientation="horizontal"
  showLabels
/>

// Vertical steps
<StepProgress
  steps={[
    {
      id: '1',
      label: 'Order Placed',
      description: 'Nov 15, 2024',
      state: 'completed'
    },
    {
      id: '2',
      label: 'Processing',
      description: 'In progress',
      state: 'active'
    },
  ]}
  currentStep={1}
  orientation="vertical"
/>
```

### Multi-Segment Progress

```typescript
<MultiProgress
  segments={[
    { id: '1', value: 30, label: 'Vegetables', color: '#10b981' },
    { id: '2', value: 50, label: 'Fruits', color: '#f59e0b' },
    { id: '3', value: 20, label: 'Herbs', color: '#3b82f6' },
  ]}
  showLegend
/>
```

### Progress Ring

```typescript
<ProgressRing value={85} size={48} showValue />
```

---

## Suspense Boundaries

### Basic Suspense

```typescript
<SuspenseBoundary fallback={<LoadingSpinner />}>
  <AsyncComponent />
</SuspenseBoundary>
```

### With Error Boundary

```typescript
<SuspenseWithErrorBoundary
  fallback={<LoadingSpinner />}
  errorFallback={<ErrorMessage />}
  onError={(error) => console.error(error)}
>
  <AsyncComponent />
</SuspenseWithErrorBoundary>
```

### Skeleton Suspense

```typescript
<SkeletonSuspenseBoundary
  skeletonVariant="card"
  skeletonCount={3}
>
  <FarmList />
</SkeletonSuspenseBoundary>
```

### Agricultural Suspense

```typescript
<AgriculturalSuspenseBoundary
  message="Loading farm data..."
>
  <FarmDetails />
</AgriculturalSuspenseBoundary>
```

### Nested Suspense

```typescript
<NestedSuspenseBoundary
  layers={[
    { id: 'shell', fallback: <PageSkeleton /> },
    { id: 'content', fallback: <ContentSkeleton /> },
  ]}
>
  <PageContent />
</NestedSuspenseBoundary>
```

### Conditional Suspense

```typescript
<ConditionalSuspenseBoundary
  condition={shouldLazyLoad}
  fallback={<LoadingSpinner />}
>
  <Content />
</ConditionalSuspenseBoundary>
```

---

## Loading Hooks

### useLoadingState

```typescript
const {
  state,
  isLoading,
  isSuccess,
  isError,
  startLoading,
  stopLoading,
  setError,
  reset
} = useLoadingState();

// Use in async operation
const handleFetch = async () => {
  startLoading();
  try {
    const data = await fetchData();
    stopLoading();
  } catch (error) {
    setError(error);
  }
};
```

### useAsync

```typescript
// Automatic loading state management
const {
  data,
  isLoading,
  isSuccess,
  isError,
  error,
  execute,
  retry,
  reset
} = useAsync(
  async () => await fetchFarms(),
  {
    immediate: true,
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error),
  }
);

// Manual execution
<button onClick={() => execute()}>Fetch</button>

// Retry on error
{error && <button onClick={retry}>Retry</button>}
```

### useLoadingCallback

```typescript
const [handleSubmit, isSubmitting] = useLoadingCallback(
  async (data) => await submitForm(data),
  {
    minLoadingTime: 300,
    onSuccess: () => console.log('Done'),
    onError: (error) => console.error(error),
  }
);

<button onClick={() => handleSubmit(formData)} disabled={isSubmitting}>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</button>
```

### useLoadingDelay

```typescript
// Prevent loading flashing for fast operations
const { isLoading } = useAsync(fetchData);
const showLoading = useLoadingDelay(isLoading, 300);

return showLoading ? <Spinner /> : <Content />;
```

### useLoadingTimeout

```typescript
// Detect timeout
const { isLoading } = useAsync(fetchData);
const isTimeout = useLoadingTimeout(
  isLoading,
  30000,
  () => console.log('Timeout!')
);

if (isTimeout) return <TimeoutMessage />;
```

### useProgress

```typescript
const {
  progress,
  isActive,
  start,
  stop,
  complete,
  reset,
  setProgress
} = useProgress({
  interval: 100,
  increment: 5,
  max: 90,
});

<LinearProgress value={progress} />
<button onClick={start}>Start</button>
<button onClick={complete}>Complete</button>
```

### useSequentialLoading

```typescript
const { progress, isLoading, results, execute } = useSequentialLoading();

const loadAll = async () => {
  await execute([
    () => fetchFarms(),
    () => fetchProducts(),
    () => fetchOrders(),
  ]);
};

<LinearProgress value={progress} />
```

---

## Common Patterns

### Page Loading

```typescript
function FarmPage({ farmId }: { farmId: string }) {
  const { data: farm, isLoading, error } = useAsync(
    () => fetchFarm(farmId),
    { immediate: true }
  );

  if (isLoading) {
    return <CardSkeleton showImage showAvatar textLines={5} />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return <FarmDetails farm={farm} />;
}
```

### List Loading

```typescript
function FarmList() {
  const { data: farms, isLoading } = useAsync(
    () => fetchFarms(),
    { immediate: true }
  );

  if (isLoading) {
    return <ListSkeleton items={5} showAvatar />;
  }

  return farms.map(farm => <FarmCard key={farm.id} farm={farm} />);
}
```

### Form Submission

```typescript
function FarmForm() {
  const [handleSubmit, isSubmitting] = useLoadingCallback(
    async (data) => await createFarm(data),
    { minLoadingTime: 300 }
  );

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(formData);
    }}>
      {/* form fields */}
      <button type="submit" disabled={isSubmitting}>
        <ButtonLoadingSpinner isLoading={isSubmitting}>
          Create Farm
        </ButtonLoadingSpinner>
      </button>
    </form>
  );
}
```

### File Upload with Progress

```typescript
function FileUpload() {
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    await axios.post('/api/upload', formData, {
      onUploadProgress: (e) => {
        const percent = Math.round((e.loaded * 100) / e.total);
        setProgress(percent);
      }
    });
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      <LinearProgress
        value={progress}
        showPercentage
        label="Uploading..."
      />
    </div>
  );
}
```

### Lazy Loading Component

```typescript
const LazyFarmDetails = lazy(() => import('./FarmDetails'));

function FarmPage() {
  return (
    <LazySuspenseBoundary
      component={LazyFarmDetails}
      componentProps={{ farmId: '123' }}
      fallback={<CardSkeleton showImage />}
    />
  );
}
```

### Optimistic Update

```typescript
function LikeFarm({ farmId }: { farmId: string }) {
  const [isLiked, setIsLiked] = useState(false);
  const [handleLike, isLoading] = useLoadingCallback(
    async () => {
      // Optimistically update UI
      setIsLiked(true);

      try {
        await likeFarm(farmId);
      } catch (error) {
        // Rollback on error
        setIsLiked(false);
        throw error;
      }
    }
  );

  return (
    <button onClick={handleLike} disabled={isLoading}>
      <ButtonLoadingSpinner isLoading={isLoading}>
        {isLiked ? 'Liked ❤️' : 'Like 🤍'}
      </ButtonLoadingSpinner>
    </button>
  );
}
```

---

## Agricultural Themes

### Seasonal Loading

```typescript
import { getCurrentSeason, getSeasonalColors } from "@/lib/loading/utils";

// Auto-detect season
<LoadingSpinner variant="agricultural" />

// Current season colors
const season = getCurrentSeason(); // SPRING, SUMMER, FALL, WINTER
const colors = getSeasonalColors(season);
```

### Agricultural Progress

```typescript
// Planting stage
<AgriculturalProgress
  value={25}
  stage="PLANTING"
  showPercentage
/>

// Growing stage
<AgriculturalProgress
  value={50}
  stage="GROWING"
  showPercentage
/>

// Harvesting stage
<AgriculturalProgress
  value={75}
  stage="HARVESTING"
  showPercentage
/>

// Processing stage
<AgriculturalProgress
  value={90}
  stage="PROCESSING"
  showPercentage
/>
```

### Agricultural Messages

```typescript
import { AGRICULTURAL_LOADING_MESSAGES } from "@/lib/loading/types";

<LoadingSpinner
  variant="agricultural"
  label={AGRICULTURAL_LOADING_MESSAGES.PLANTING}
  showLabel
/>
```

### Seasonal Colors

```typescript
import { SEASONAL_LOADING_COLORS } from "@/lib/loading/types";

const colors = SEASONAL_LOADING_COLORS.SPRING;
// colors.primary: "#10b981"
// colors.secondary: "#34d399"
// colors.gradient: "from-green-400 to-emerald-500"
```

---

## Performance Tips

1. **Use minimum loading time** to prevent flashing:
   ```typescript
   useLoadingCallback(asyncFn, { minLoadingTime: 300 })
   ```

2. **Delay loading indicators** for fast operations:
   ```typescript
   const showLoading = useLoadingDelay(isLoading, 300);
   ```

3. **Use appropriate skeleton variants** for content type
4. **Prefer CSS animations** over JavaScript animations
5. **Clean up effects** to prevent memory leaks
6. **Use Suspense boundaries** for better code splitting
7. **Implement progress indicators** for long operations
8. **Cache data** when appropriate for instant loading

---

## Accessibility

All loading components include:

- ✅ ARIA labels (`aria-label`)
- ✅ ARIA roles (`role="status"`, `role="progressbar"`)
- ✅ Screen reader text (`sr-only`)
- ✅ Keyboard navigation support
- ✅ Color contrast compliance (WCAG AA)
- ✅ Focus indicators

```typescript
// Accessible loading spinner
<LoadingSpinner aria-label="Loading farms..." />

// Accessible progress
<LinearProgress
  value={60}
  aria-valuenow={60}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Upload progress"
/>
```

---

## Troubleshooting

### Loading flashing too quickly
```typescript
// Add minimum loading time
const showLoading = useLoadingDelay(isLoading, 300);
```

### Memory leaks on unmount
```typescript
// Hooks automatically clean up, but for custom effects:
useEffect(() => {
  const controller = new AbortController();

  fetchData(controller.signal);

  return () => controller.abort();
}, []);
```

### Progress not updating
```typescript
// Ensure you're setting progress correctly
const { setProgress } = useProgress();
setProgress(50); // Not setState
```

### Skeleton not matching content
```typescript
// Use appropriate skeleton variant
<CardSkeleton showImage={hasImage} textLines={3} />
```

---

## Examples Location

See comprehensive examples in:
- `/src/components/loading/LoadingExamples.tsx`
- Run the examples page to see all components in action

---

## API Documentation

For detailed API reference, see:
- `/docs/week2/WEEK_2_DAY_10_COMPLETION_CERTIFICATE.md`

---

**Last Updated**: November 15, 2024
**Version**: 1.0.0
**Maintained by**: Farmers Market Platform Team
