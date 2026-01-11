/**
 * Suspense Boundary Components
 *
 * React Suspense boundary wrappers with loading fallbacks,
 * error boundaries, and agricultural-themed loading states.
 *
 * @module components/loading/SuspenseBoundary
 */

"use client";

import * as React from "react";

import { ErrorBoundary } from "@/components/errors/error-boundary";
import type { SuspenseBoundaryConfig } from "@/lib/loading/types";

import { CenteredLoadingSpinner, LoadingSpinner } from "./LoadingSpinner";
import { CardSkeleton, Skeleton } from "./Skeleton";

import { logger } from "@/lib/monitoring/logger";

// ============================================================================
// BASE SUSPENSE BOUNDARY
// ============================================================================

export interface SuspenseBoundaryProps extends Partial<SuspenseBoundaryConfig> {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Base Suspense Boundary
 *
 * @example
 * ```tsx
 * <SuspenseBoundary fallback={<LoadingSpinner />}>
 *   <AsyncComponent />
 * </SuspenseBoundary>
 * ```
 */
export const SuspenseBoundary = React.forwardRef<
  HTMLDivElement,
  SuspenseBoundaryProps
>(
  (
    {
      children,
      fallback = <CenteredLoadingSpinner />,
      minLoadingTime = 0,
      maxLoadingTime,
      onLoadingStart,
      onLoadingEnd,
      className,
    },
    ref,
  ) => {
    const [showFallback, setShowFallback] = React.useState(false);
    const startTimeRef = React.useRef<number>(0);
    const minTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
    const maxTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

    const handleLoadingStart = React.useCallback(() => {
      startTimeRef.current = Date.now();
      setShowFallback(true);
      if (onLoadingStart) {
        onLoadingStart();
      }

      if (maxLoadingTime) {
        maxTimeoutRef.current = setTimeout(() => {
          logger.warn(
            `Suspense boundary exceeded max loading time of ${maxLoadingTime}ms`,
          );
        }, maxLoadingTime);
      }
    }, [maxLoadingTime, onLoadingStart]);

    const handleLoadingEnd = React.useCallback(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remainingTime = Math.max(0, minLoadingTime - elapsed);

      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }

      if (remainingTime > 0) {
        minTimeoutRef.current = setTimeout(() => {
          setShowFallback(false);
          if (onLoadingEnd) {
            onLoadingEnd();
          }
        }, remainingTime);
      } else {
        setShowFallback(false);
        if (onLoadingEnd) {
          onLoadingEnd();
        }
      }
    }, [minLoadingTime, onLoadingEnd]);

    React.useEffect(() => {
      return () => {
        if (minTimeoutRef.current) clearTimeout(minTimeoutRef.current);
        if (maxTimeoutRef.current) clearTimeout(maxTimeoutRef.current);
      };
    }, []);

    return (
      <div ref={ref} className={className}>
        <React.Suspense
          fallback={
            <SuspenseTracker
              onStart={handleLoadingStart}
              onEnd={handleLoadingEnd}
            >
              {fallback}
            </SuspenseTracker>
          }
        >
          {children}
        </React.Suspense>
      </div>
    );
  },
);

SuspenseBoundary.displayName = "SuspenseBoundary";

// ============================================================================
// SUSPENSE TRACKER (Internal)
// ============================================================================

interface SuspenseTrackerProps {
  children: React.ReactNode;
  onStart?: () => void;
  onEnd?: () => void;
}

function SuspenseTracker({ children, onStart, onEnd }: SuspenseTrackerProps) {
  React.useEffect(() => {
    onStart?.();
    return () => {
      onEnd?.();
    };
  }, [onStart, onEnd]);

  return <>{children}</>;
}

// ============================================================================
// SUSPENSE WITH ERROR BOUNDARY
// ============================================================================

export interface SuspenseWithErrorBoundaryProps extends Omit<
  SuspenseBoundaryProps,
  "onError"
> {
  errorFallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Suspense Boundary with Error Boundary
 *
 * @example
 * ```tsx
 * <SuspenseWithErrorBoundary
 *   fallback={<LoadingSpinner />}
 *   errorFallback={<ErrorMessage />}
 * >
 *   <AsyncComponent />
 * </SuspenseWithErrorBoundary>
 * ```
 */
export const SuspenseWithErrorBoundary = React.forwardRef<
  HTMLDivElement,
  SuspenseWithErrorBoundaryProps
>(
  (
    { children, fallback, errorFallback, onError, className, ...suspenseProps },
    ref,
  ) => {
    return (
      <ErrorBoundary
        fallback={
          errorFallback || (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-center">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Failed to load content
                </p>
              </div>
            </div>
          )
        }
        onError={onError}
      >
        <SuspenseBoundary
          ref={ref}
          fallback={fallback}
          className={className}
          {...suspenseProps}
        >
          {children}
        </SuspenseBoundary>
      </ErrorBoundary>
    );
  },
);

SuspenseWithErrorBoundary.displayName = "SuspenseWithErrorBoundary";

// ============================================================================
// SUSPENSE LIST BOUNDARY
// ============================================================================

export interface SuspenseListBoundaryProps {
  children: React.ReactNode;
  revealOrder?: "forwards" | "backwards" | "together";
  tail?: "collapsed" | "hidden";
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Suspense List Boundary for coordinated loading
 *
 * @example
 * ```tsx
 * <SuspenseListBoundary revealOrder="forwards">
 *   <AsyncItem1 />
 *   <AsyncItem2 />
 *   <AsyncItem3 />
 * </SuspenseListBoundary>
 * ```
 */
export const SuspenseListBoundary = React.forwardRef<
  HTMLDivElement,
  SuspenseListBoundaryProps
>(
  (
    {
      children,
      revealOrder = "forwards",
      tail = "collapsed",
      fallback = <LoadingSpinner />,
      className,
    },
    ref,
  ) => {
    return (
      <div ref={ref} className={className}>
        {/* Note: SuspenseList is not yet stable in React 18 */}
        {/* Using sequential Suspense boundaries as fallback */}
        {React.Children.map(children, (child, index) => (
          <React.Suspense key={index} fallback={fallback}>
            {child}
          </React.Suspense>
        ))}
      </div>
    );
  },
);

SuspenseListBoundary.displayName = "SuspenseListBoundary";

// ============================================================================
// LAZY SUSPENSE BOUNDARY
// ============================================================================

export interface LazySuspenseBoundaryProps extends SuspenseBoundaryProps {
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  componentProps?: Record<string, any>;
}

/**
 * Lazy Suspense Boundary for lazy-loaded components
 *
 * @example
 * ```tsx
 * const LazyComponent = lazy(() => import('./MyComponent'));
 *
 * <LazySuspenseBoundary
 *   component={LazyComponent}
 *   componentProps={{ id: '123' }}
 *   fallback={<LoadingSpinner />}
 * />
 * ```
 */
export const LazySuspenseBoundary = React.forwardRef<
  HTMLDivElement,
  LazySuspenseBoundaryProps
>(
  (
    {
      component: Component,
      componentProps = {},
      fallback = <CenteredLoadingSpinner />,
      className,
      ...suspenseProps
    },
    ref,
  ) => {
    return (
      <SuspenseBoundary
        ref={ref}
        fallback={fallback}
        className={className}
        {...suspenseProps}
      >
        <Component {...componentProps} />
      </SuspenseBoundary>
    );
  },
);

LazySuspenseBoundary.displayName = "LazySuspenseBoundary";

// ============================================================================
// SKELETON SUSPENSE BOUNDARY
// ============================================================================

export interface SkeletonSuspenseBoundaryProps extends SuspenseBoundaryProps {
  skeletonVariant?: "text" | "card" | "list" | "table" | "grid";
  skeletonCount?: number;
}

/**
 * Suspense Boundary with Skeleton fallback
 *
 * @example
 * ```tsx
 * <SkeletonSuspenseBoundary skeletonVariant="card" skeletonCount={3}>
 *   <FarmList />
 * </SkeletonSuspenseBoundary>
 * ```
 */
export const SkeletonSuspenseBoundary = React.forwardRef<
  HTMLDivElement,
  SkeletonSuspenseBoundaryProps
>(
  (
    {
      children,
      skeletonVariant = "card",
      skeletonCount = 3,
      className,
      ...suspenseProps
    },
    ref,
  ) => {
    const renderSkeleton = () => {
      switch (skeletonVariant) {
        case "text":
          return <Skeleton variant="text" count={skeletonCount} />;
        case "card":
          return (
            <div className="space-y-4">
              {Array.from({ length: skeletonCount }, (_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          );
        case "list":
          return (
            <div className="space-y-3">
              {Array.from({ length: skeletonCount }, (_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton variant="circular" width={40} height={40} />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </div>
                </div>
              ))}
            </div>
          );
        case "table":
          return (
            <div className="space-y-2">
              {Array.from({ length: skeletonCount }, (_, i) => (
                <Skeleton key={i} variant="rectangular" height={48} />
              ))}
            </div>
          );
        case "grid":
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: skeletonCount }, (_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          );
        default:
          return <Skeleton count={skeletonCount} />;
      }
    };

    return (
      <SuspenseBoundary
        ref={ref}
        fallback={renderSkeleton()}
        className={className}
        {...suspenseProps}
      >
        {children}
      </SuspenseBoundary>
    );
  },
);

SkeletonSuspenseBoundary.displayName = "SkeletonSuspenseBoundary";

// ============================================================================
// AGRICULTURAL SUSPENSE BOUNDARY
// ============================================================================

export interface AgriculturalSuspenseBoundaryProps extends SuspenseBoundaryProps {
  message?: string;
}

/**
 * Agricultural-themed Suspense Boundary
 *
 * @example
 * ```tsx
 * <AgriculturalSuspenseBoundary message="Loading farm data...">
 *   <FarmDetails />
 * </AgriculturalSuspenseBoundary>
 * ```
 */
export const AgriculturalSuspenseBoundary = React.forwardRef<
  HTMLDivElement,
  AgriculturalSuspenseBoundaryProps
>(
  (
    {
      children,
      message = "Loading agricultural data...",
      className,
      ...suspenseProps
    },
    ref,
  ) => {
    return (
      <SuspenseBoundary
        ref={ref}
        fallback={
          <CenteredLoadingSpinner
            variant="agricultural"
            size="lg"
            message={message}
          />
        }
        className={className}
        {...suspenseProps}
      >
        {children}
      </SuspenseBoundary>
    );
  },
);

AgriculturalSuspenseBoundary.displayName = "AgriculturalSuspenseBoundary";

// ============================================================================
// NESTED SUSPENSE BOUNDARY
// ============================================================================

export interface NestedSuspenseBoundaryProps {
  children: React.ReactNode;
  layers: Array<{
    id: string;
    fallback: React.ReactNode;
    minLoadingTime?: number;
  }>;
  className?: string;
}

/**
 * Nested Suspense Boundaries for progressive loading
 *
 * @example
 * ```tsx
 * <NestedSuspenseBoundary
 *   layers={[
 *     { id: 'shell', fallback: <PageSkeleton /> },
 *     { id: 'content', fallback: <ContentSkeleton /> },
 *   ]}
 * >
 *   <PageContent />
 * </NestedSuspenseBoundary>
 * ```
 */
export const NestedSuspenseBoundary = React.forwardRef<
  HTMLDivElement,
  NestedSuspenseBoundaryProps
>(({ children, layers, className }, ref) => {
  const renderNested = (index: number): React.ReactNode => {
    if (index >= layers.length) {
      return children;
    }

    const layer = layers[index];
    if (!layer) {
      return children;
    }

    return (
      <SuspenseBoundary
        fallback={layer.fallback}
        minLoadingTime={layer.minLoadingTime}
      >
        {renderNested(index + 1)}
      </SuspenseBoundary>
    );
  };

  return (
    <div ref={ref} className={className}>
      {renderNested(0)}
    </div>
  );
});

NestedSuspenseBoundary.displayName = "NestedSuspenseBoundary";

// ============================================================================
// CONDITIONAL SUSPENSE BOUNDARY
// ============================================================================

export interface ConditionalSuspenseBoundaryProps extends SuspenseBoundaryProps {
  condition: boolean;
}

/**
 * Conditional Suspense Boundary
 *
 * Only uses Suspense when condition is true
 *
 * @example
 * ```tsx
 * <ConditionalSuspenseBoundary
 *   condition={shouldLazyLoad}
 *   fallback={<LoadingSpinner />}
 * >
 *   <Content />
 * </ConditionalSuspenseBoundary>
 * ```
 */
export const ConditionalSuspenseBoundary = React.forwardRef<
  HTMLDivElement,
  ConditionalSuspenseBoundaryProps
>(({ children, condition, fallback, className, ...suspenseProps }, ref) => {
  if (!condition) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <SuspenseBoundary
      ref={ref}
      fallback={fallback}
      className={className}
      {...suspenseProps}
    >
      {children}
    </SuspenseBoundary>
  );
});

ConditionalSuspenseBoundary.displayName = "ConditionalSuspenseBoundary";

// ============================================================================
// PRELOADED SUSPENSE BOUNDARY
// ============================================================================

export interface PreloadedSuspenseBoundaryProps extends SuspenseBoundaryProps {
  preload?: () => void;
}

/**
 * Suspense Boundary with preload support
 *
 * @example
 * ```tsx
 * <PreloadedSuspenseBoundary
 *   preload={() => prefetchData()}
 *   fallback={<LoadingSpinner />}
 * >
 *   <Content />
 * </PreloadedSuspenseBoundary>
 * ```
 */
export const PreloadedSuspenseBoundary = React.forwardRef<
  HTMLDivElement,
  PreloadedSuspenseBoundaryProps
>(({ children, preload, ...props }, ref) => {
  React.useEffect(() => {
    preload?.();
  }, [preload]);

  return (
    <SuspenseBoundary ref={ref} {...props}>
      {children}
    </SuspenseBoundary>
  );
});

PreloadedSuspenseBoundary.displayName = "PreloadedSuspenseBoundary";

// ============================================================================
// EXPORTS
// ============================================================================

export default SuspenseBoundary;
