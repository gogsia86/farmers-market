// 💀 Skeleton Loading Component
// Divine Agricultural Loading Consciousness

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base skeleton component for loading states
 * @example
 * ```tsx
 * <Skeleton className="h-12 w-12 rounded-full" />
 * <Skeleton className="h-4 w-[250px]" />
 * ```
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

/**
 * Product card skeleton
 */
export function ProductCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card">
      {/* Image skeleton */}
      <Skeleton className="aspect-square w-full" />

      <div className="space-y-3 p-4">
        {/* Category badge skeleton */}
        <Skeleton className="h-5 w-20 rounded-full" />

        {/* Product name skeleton */}
        <Skeleton className="h-6 w-full" />

        {/* Farm name skeleton */}
        <Skeleton className="h-4 w-32" />

        {/* Price and button row */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/**
 * Farm card skeleton
 */
export function FarmCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      {/* Cover image skeleton */}
      <Skeleton className="h-48 w-full" />

      <div className="space-y-4 p-6">
        <div className="flex items-start gap-4">
          {/* Logo skeleton */}
          <Skeleton className="h-16 w-16 flex-shrink-0 rounded-full" />

          <div className="flex-1 space-y-2">
            {/* Farm name skeleton */}
            <Skeleton className="h-6 w-48" />

            {/* Location skeleton */}
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Stats skeleton */}
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Button skeleton */}
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

/**
 * Product grid skeleton
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Farm grid skeleton
 */
export function FarmGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <FarmCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Table row skeleton
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 border-b px-6 py-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-5 flex-1" />
      ))}
    </div>
  );
}

/**
 * Table skeleton
 */
export function TableSkeleton({
  rows = 5,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="rounded-lg border bg-card">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 border-b bg-muted/50 px-6 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows skeleton */}
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} />
      ))}
    </div>
  );
}

/**
 * Search bar skeleton
 */
export function SearchBarSkeleton() {
  return (
    <div className="flex gap-2">
      <Skeleton className="h-10 flex-1 rounded-md" />
      <Skeleton className="h-10 w-24 rounded-md" />
    </div>
  );
}

/**
 * Filter panel skeleton
 */
export function FilterPanelSkeleton() {
  return (
    <div className="space-y-6 rounded-lg border bg-card p-6">
      {/* Filter sections */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Profile header skeleton
 */
export function ProfileHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

/**
 * Order item skeleton
 */
export function OrderItemSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
      <Skeleton className="h-20 w-20 rounded-md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-9 w-24 rounded-md" />
    </div>
  );
}

/**
 * Stats card skeleton
 */
export function StatsCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-12 w-12 rounded-md" />
      </div>
      <Skeleton className="mt-4 h-3 w-20" />
    </div>
  );
}

/**
 * Dashboard skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Content area */}
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Product detail skeleton
 */
export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Image gallery skeleton */}
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-md" />
          ))}
        </div>
      </div>

      {/* Product info skeleton */}
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
