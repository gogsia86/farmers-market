/**
 * Loading Examples Component
 *
 * Comprehensive showcase of all loading states, skeleton screens,
 * progress indicators, and loading patterns with agricultural themes.
 *
 * @module components/loading/LoadingExamples
 */

"use client";

import * as React from "react";

import { useProgress } from "@/hooks/use-loading";
import {
  ButtonLoadingSpinner,
  CenteredLoadingSpinner,
  InlineLoadingSpinner,
  LoadingSpinner
} from "./LoadingSpinner";
import {
  AgriculturalProgress,
  CircularProgress,
  LinearProgress,
  MultiProgress,
  ProgressRing,
  StepProgress,
} from "./ProgressIndicator";
import {
  AvatarSkeleton,
  CardSkeleton,
  GridSkeleton,
  ListSkeleton,
  Skeleton,
  TableSkeleton,
  TextSkeleton,
} from "./Skeleton";
import {
  AgriculturalSuspenseBoundary,
  SkeletonSuspenseBoundary,
  SuspenseBoundary,
  SuspenseWithErrorBoundary,
} from "./SuspenseBoundary";

// ============================================================================
// LOADING EXAMPLES CONTAINER
// ============================================================================

export function LoadingExamples() {
  return (
    <div className="container mx-auto py-8 space-y-12">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Loading States & Skeleton Screens</h1>
        <p className="text-muted-foreground">
          Comprehensive loading UI components for the Farmers Market Platform
        </p>
      </header>

      <div className="space-y-12">
        <SpinnerExamples />
        <SkeletonExamples />
        <ProgressExamples />
        <AgriculturalExamples />
        <SuspenseExamples />
        <InteractiveExamples />
        <RealWorldExamples />
      </div>
    </div>
  );
}

// ============================================================================
// 1. SPINNER EXAMPLES
// ============================================================================

function SpinnerExamples() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Loading Spinners</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Default Spinner */}
        <ExampleCard title="Default Spinner">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner variant="default" size="xs" />
            <LoadingSpinner variant="default" size="sm" />
            <LoadingSpinner variant="default" size="md" />
            <LoadingSpinner variant="default" size="lg" />
            <LoadingSpinner variant="default" size="xl" />
          </div>
        </ExampleCard>

        {/* Dots Spinner */}
        <ExampleCard title="Dots Spinner">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner variant="dots" size="sm" />
            <LoadingSpinner variant="dots" size="md" />
            <LoadingSpinner variant="dots" size="lg" />
          </div>
        </ExampleCard>

        {/* Bars Spinner */}
        <ExampleCard title="Bars Spinner">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner variant="bars" size="sm" />
            <LoadingSpinner variant="bars" size="md" />
            <LoadingSpinner variant="bars" size="lg" />
          </div>
        </ExampleCard>

        {/* Circle Spinner */}
        <ExampleCard title="Circle Spinner">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner variant="circle" size="sm" />
            <LoadingSpinner variant="circle" size="md" />
            <LoadingSpinner variant="circle" size="lg" />
          </div>
        </ExampleCard>

        {/* Pulse Spinner */}
        <ExampleCard title="Pulse Spinner">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner variant="pulse" size="sm" />
            <LoadingSpinner variant="pulse" size="md" />
            <LoadingSpinner variant="pulse" size="lg" />
          </div>
        </ExampleCard>

        {/* Agricultural Spinner */}
        <ExampleCard title="Agricultural Spinner (Seasonal)">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner variant="agricultural" size="sm" />
            <LoadingSpinner variant="agricultural" size="md" />
            <LoadingSpinner variant="agricultural" size="lg" />
          </div>
        </ExampleCard>

        {/* Spinner with Label */}
        <ExampleCard title="Spinner with Label">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner
              variant="default"
              size="md"
              label="Loading farms..."
              showLabel
            />
            <InlineLoadingSpinner text="Processing order..." />
          </div>
        </ExampleCard>

        {/* Centered Spinner */}
        <ExampleCard title="Centered Spinner">
          <div className="h-48 relative">
            <CenteredLoadingSpinner message="Loading content..." />
          </div>
        </ExampleCard>

        {/* Button Spinner */}
        <ExampleCard title="Button Loading Spinner">
          <div className="flex flex-col gap-4">
            <button className="px-4 py-2 bg-primary text-white rounded-md flex items-center gap-2">
              <ButtonLoadingSpinner isLoading size="sm">
                Submitting
              </ButtonLoadingSpinner>
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center gap-2">
              <ButtonLoadingSpinner isLoading={false} size="sm">
                Submit Form
              </ButtonLoadingSpinner>
            </button>
          </div>
        </ExampleCard>
      </div>
    </section>
  );
}

// ============================================================================
// 2. SKELETON EXAMPLES
// ============================================================================

function SkeletonExamples() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Skeleton Screens</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Text Skeleton */}
        <ExampleCard title="Text Skeleton">
          <TextSkeleton lines={4} />
        </ExampleCard>

        {/* Avatar Skeleton */}
        <ExampleCard title="Avatar Skeleton">
          <div className="space-y-3">
            <AvatarSkeleton size={40} showLabel />
            <AvatarSkeleton size={48} showLabel labelWidth={120} />
            <AvatarSkeleton size={56} showLabel labelWidth={150} />
          </div>
        </ExampleCard>

        {/* Card Skeleton */}
        <ExampleCard title="Card Skeleton" className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardSkeleton showImage showAvatar textLines={3} />
            <CardSkeleton showImage={false} showAvatar textLines={4} />
            <CardSkeleton showImage imageHeight={150} textLines={2} />
          </div>
        </ExampleCard>

        {/* List Skeleton */}
        <ExampleCard title="List Skeleton">
          <ListSkeleton items={4} showAvatar textLines={2} />
        </ExampleCard>

        {/* Grid Skeleton */}
        <ExampleCard title="Grid Skeleton">
          <GridSkeleton items={6} columns={3} itemHeight={120} />
        </ExampleCard>

        {/* Table Skeleton */}
        <ExampleCard title="Table Skeleton" className="md:col-span-2">
          <TableSkeleton rows={5} columns={4} showHeader />
        </ExampleCard>

        {/* Animation Variants */}
        <ExampleCard title="Animation Variants">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Pulse</p>
              <Skeleton animation={"pulse" as const} height={40} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Wave</p>
              <Skeleton animation={"wave" as const} height={40} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Shimmer</p>
              <Skeleton animation={"shimmer" as const} height={40} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">None</p>
              <Skeleton animation={"none" as const} height={40} />
            </div>
          </div>
        </ExampleCard>
      </div>
    </section>
  );
}

// ============================================================================
// 3. PROGRESS EXAMPLES
// ============================================================================

function ProgressExamples() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Progress Indicators</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Linear Progress */}
        <ExampleCard title="Linear Progress">
          <div className="space-y-4">
            <LinearProgress value={25} showPercentage label="Upload Progress" />
            <LinearProgress value={50} showPercentage size="md" />
            <LinearProgress value={75} showPercentage size="lg" />
            <LinearProgress value={100} showPercentage variant="success" />
          </div>
        </ExampleCard>

        {/* Indeterminate Progress */}
        <ExampleCard title="Indeterminate Progress">
          <div className="space-y-4">
            <LinearProgress indeterminate label="Processing..." />
            <LinearProgress indeterminate size="lg" />
          </div>
        </ExampleCard>

        {/* Circular Progress */}
        <ExampleCard title="Circular Progress">
          <div className="flex items-center justify-around">
            <CircularProgress value={25} size={64} showValue />
            <CircularProgress value={50} size={80} showValue />
            <CircularProgress value={75} size={96} showValue />
            <CircularProgress value={100} size={64} showValue color="#10b981" />
          </div>
        </ExampleCard>

        {/* Progress Rings */}
        <ExampleCard title="Progress Rings">
          <div className="flex items-center justify-around">
            <ProgressRing value={33} size={48} />
            <ProgressRing value={66} size={56} />
            <ProgressRing value={100} size={64} color="#10b981" />
          </div>
        </ExampleCard>

        {/* Step Progress */}
        <ExampleCard title="Step Progress" className="md:col-span-2">
          <StepProgress
            steps={[
              { id: "1", label: "Account", state: "completed" },
              { id: "2", label: "Farm Details", state: "completed" },
              { id: "3", label: "Products", state: "active" },
              { id: "4", label: "Review", state: "pending" },
            ]}
            currentStep={2}
            showLabels
          />
        </ExampleCard>

        {/* Vertical Step Progress */}
        <ExampleCard title="Vertical Step Progress">
          <StepProgress
            steps={[
              {
                id: "1",
                label: "Order Placed",
                description: "Nov 15, 2024",
                state: "completed",
              },
              {
                id: "2",
                label: "Processing",
                description: "In progress",
                state: "active",
              },
              {
                id: "3",
                label: "Shipped",
                description: "Pending",
                state: "pending",
              },
              {
                id: "4",
                label: "Delivered",
                description: "Pending",
                state: "pending",
              },
            ]}
            currentStep={1}
            orientation="vertical"
            showLabels
          />
        </ExampleCard>

        {/* Multi-segment Progress */}
        <ExampleCard title="Multi-segment Progress">
          <MultiProgress
            segments={[
              { id: "1", value: 30, label: "Vegetables", color: "#10b981" },
              { id: "2", value: 50, label: "Fruits", color: "#f59e0b" },
              { id: "3", value: 20, label: "Herbs", color: "#3b82f6" },
            ]}
            showLegend
          />
        </ExampleCard>
      </div>
    </section>
  );
}

// ============================================================================
// 4. AGRICULTURAL EXAMPLES
// ============================================================================

function AgriculturalExamples() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Agricultural Loading Themes</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Agricultural Progress - Planting */}
        <ExampleCard title="Planting Stage">
          <AgriculturalProgress
            value={25}
            stage="PLANTING"
            showPercentage
            showLabel
          />
        </ExampleCard>

        {/* Agricultural Progress - Growing */}
        <ExampleCard title="Growing Stage">
          <AgriculturalProgress
            value={50}
            stage="GROWING"
            showPercentage
            showLabel
          />
        </ExampleCard>

        {/* Agricultural Progress - Harvesting */}
        <ExampleCard title="Harvesting Stage">
          <AgriculturalProgress
            value={75}
            stage="HARVESTING"
            showPercentage
            showLabel
          />
        </ExampleCard>

        {/* Agricultural Progress - Processing */}
        <ExampleCard title="Processing Stage">
          <AgriculturalProgress
            value={90}
            stage="PROCESSING"
            showPercentage
            showLabel
          />
        </ExampleCard>

        {/* Agricultural Spinner */}
        <ExampleCard title="Agricultural Spinner (Seasonal)">
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner
              variant="agricultural"
              size="xl"
              label="Loading farm data..."
              showLabel
            />
          </div>
        </ExampleCard>

        {/* Agricultural Loading Message */}
        <ExampleCard title="Agricultural Loading States">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <LoadingSpinner variant="agricultural" size="sm" />
              <span className="text-sm">Planting seeds of data...</span>
            </div>
            <div className="flex items-center gap-3">
              <LoadingSpinner variant="agricultural" size="sm" />
              <span className="text-sm">Growing your information...</span>
            </div>
            <div className="flex items-center gap-3">
              <LoadingSpinner variant="agricultural" size="sm" />
              <span className="text-sm">Harvesting fresh results...</span>
            </div>
            <div className="flex items-center gap-3">
              <LoadingSpinner variant="agricultural" size="sm" />
              <span className="text-sm">Processing farm data...</span>
            </div>
          </div>
        </ExampleCard>
      </div>
    </section>
  );
}

// ============================================================================
// 5. SUSPENSE EXAMPLES
// ============================================================================

function SuspenseExamples() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Suspense Boundaries</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Suspense */}
        <ExampleCard title="Basic Suspense Boundary">
          <SuspenseBoundary fallback={<LoadingSpinner />}>
            <div className="p-4 bg-green-50 rounded-md">
              <p className="text-sm">Content loaded successfully!</p>
            </div>
          </SuspenseBoundary>
        </ExampleCard>

        {/* Skeleton Suspense */}
        <ExampleCard title="Skeleton Suspense Boundary">
          <SkeletonSuspenseBoundary skeletonVariant="card" skeletonCount={1}>
            <div className="p-4 bg-green-50 rounded-md">
              <p className="text-sm">Card content loaded!</p>
            </div>
          </SkeletonSuspenseBoundary>
        </ExampleCard>

        {/* Agricultural Suspense */}
        <ExampleCard title="Agricultural Suspense Boundary">
          <AgriculturalSuspenseBoundary message="Loading farm information...">
            <div className="p-4 bg-green-50 rounded-md">
              <p className="text-sm">Farm data loaded!</p>
            </div>
          </AgriculturalSuspenseBoundary>
        </ExampleCard>

        {/* With Error Boundary */}
        <ExampleCard title="Suspense with Error Boundary">
          <SuspenseWithErrorBoundary
            fallback={<LoadingSpinner />}
            errorFallback={
              <div className="p-4 bg-red-50 rounded-md">
                <p className="text-sm text-red-600">Failed to load</p>
              </div>
            }
          >
            <div className="p-4 bg-green-50 rounded-md">
              <p className="text-sm">Protected content loaded!</p>
            </div>
          </SuspenseWithErrorBoundary>
        </ExampleCard>
      </div>
    </section>
  );
}

// ============================================================================
// 6. INTERACTIVE EXAMPLES
// ============================================================================

function InteractiveExamples() {
  const { progress, isActive, start, stop, complete, reset } = useProgress({
    interval: 100,
    increment: 5,
    max: 90,
  });

  const [isButtonLoading, setIsButtonLoading] = React.useState(false);

  const handleButtonClick = async () => {
    setIsButtonLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsButtonLoading(false);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Interactive Examples</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progress Control */}
        <ExampleCard title="Controllable Progress">
          <div className="space-y-4">
            <LinearProgress value={progress} showPercentage label="Progress" />
            <div className="flex gap-2">
              <button
                onClick={start}
                disabled={isActive}
                className="px-3 py-2 text-sm bg-primary text-white rounded-md disabled:opacity-50"
              >
                Start
              </button>
              <button
                onClick={stop}
                disabled={!isActive}
                className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md disabled:opacity-50"
              >
                Stop
              </button>
              <button
                onClick={complete}
                className="px-3 py-2 text-sm bg-green-600 text-white rounded-md"
              >
                Complete
              </button>
              <button
                onClick={reset}
                className="px-3 py-2 text-sm bg-red-600 text-white rounded-md"
              >
                Reset
              </button>
            </div>
          </div>
        </ExampleCard>

        {/* Loading Button */}
        <ExampleCard title="Loading Button">
          <div className="space-y-4">
            <button
              onClick={handleButtonClick}
              disabled={isButtonLoading}
              className="w-full px-4 py-3 bg-primary text-white rounded-md disabled:opacity-70 flex items-center justify-center gap-2"
            >
              <ButtonLoadingSpinner isLoading={isButtonLoading} size="sm">
                {isButtonLoading ? "Processing..." : "Submit Form"}
              </ButtonLoadingSpinner>
            </button>
            <p className="text-xs text-muted-foreground text-center">
              Click to see loading state
            </p>
          </div>
        </ExampleCard>
      </div>
    </section>
  );
}

// ============================================================================
// 7. REAL-WORLD EXAMPLES
// ============================================================================

function RealWorldExamples() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Real-World Scenarios</h2>

      <div className="space-y-6">
        {/* Farm Card Loading */}
        <ExampleCard title="Farm Card Loading State">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardSkeleton showImage showAvatar textLines={3} />
            <CardSkeleton showImage showAvatar textLines={3} />
            <CardSkeleton showImage showAvatar textLines={3} />
          </div>
        </ExampleCard>

        {/* Product List Loading */}
        <ExampleCard title="Product List Loading State">
          <ListSkeleton items={4} showAvatar textLines={2} />
        </ExampleCard>

        {/* Order Processing */}
        <ExampleCard title="Order Processing">
          <div className="space-y-4">
            <StepProgress
              steps={[
                { id: "1", label: "Cart", state: "completed" },
                { id: "2", label: "Payment", state: "completed" },
                { id: "3", label: "Processing", state: "active" },
                { id: "4", label: "Complete", state: "pending" },
              ]}
              currentStep={2}
              showLabels
            />
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner
                variant="agricultural"
                size="lg"
                label="Processing your order..."
                showLabel
              />
            </div>
          </div>
        </ExampleCard>

        {/* Data Upload */}
        <ExampleCard title="Farm Data Upload">
          <div className="space-y-4">
            <AgriculturalProgress
              value={65}
              stage="PROCESSING"
              showPercentage
              showLabel
              label="Uploading farm images and data..."
            />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>✓ Farm profile uploaded</p>
              <p>✓ Product images uploaded</p>
              <p className="animate-pulse">⏳ Processing certifications...</p>
              <p className="text-gray-400">○ Pending verification</p>
            </div>
          </div>
        </ExampleCard>

        {/* Page Loading */}
        <ExampleCard title="Full Page Loading">
          <div className="h-96 bg-gray-50 rounded-md relative">
            <CenteredLoadingSpinner
              variant="agricultural"
              size="xl"
              message="Loading Farmers Market Platform..."
              backdrop
            />
          </div>
        </ExampleCard>
      </div>
    </section>
  );
}

// ============================================================================
// EXAMPLE CARD WRAPPER
// ============================================================================

interface ExampleCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

function ExampleCard({ title, children, className = "" }: ExampleCardProps) {
  return (
    <div
      className={`p-6 border border-gray-200 rounded-lg bg-white shadow-sm ${className}`}
    >
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default LoadingExamples;
