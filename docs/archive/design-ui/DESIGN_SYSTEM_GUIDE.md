# 🎨 Farmers Market Platform - Design System Guide

**Complete Usage Guide for Developers & Designers**  
**Version:** 2.0 - Post-Fix Edition  
**Last Updated:** November 2024  
**Status:** All Minor Issues Resolved ✅

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Recent Fixes & Improvements](#recent-fixes--improvements)
3. [Component Library](#component-library)
4. [Color System](#color-system)
5. [Typography](#typography)
6. [Spacing & Layout](#spacing--layout)
7. [Status Indicators](#status-indicators)
8. [Responsive Design](#responsive-design)
9. [Accessibility](#accessibility)
10. [Best Practices](#best-practices)

---

## Overview

The Farmers Market Platform uses a **unified design system** that combines Fall/Agricultural aesthetics with modern web standards. This guide documents all components, patterns, and utilities available to maintain design consistency.

### Design Philosophy

- **Agricultural Consciousness**: Warm earth tones, seasonal awareness
- **Mobile-First**: Responsive across all devices
- **Accessible**: WCAG 2.1 AA compliant
- **Type-Safe**: Full TypeScript support
- **Composable**: Reusable, modular components

### Health Score: 94/100 (Grade A) ✅

---

## Recent Fixes & Improvements

### ✅ Fixed Issues (November 2024)

#### 1. **Unified Card Component** ✅

**Problem:** Duplicate Card and AgriculturalCard components causing confusion.  
**Solution:** Merged into single `Card` component with variants.

```tsx
// ✅ NEW: Unified Card with variants
import { Card } from "@/components/ui/Card";

// Default white card
<Card variant="default">Content</Card>

// Agricultural themed card
<Card variant="agricultural">Farm content</Card>

// Premium gradient card
<Card variant="divine">Special content</Card>

// Border-only card
<Card variant="outline">Minimal content</Card>

// Interactive card
<Card variant="default" interactive onClick={handleClick}>
  Clickable content
</Card>
```

**Backward Compatibility:** Old imports still work!

```tsx
// ✅ Still works for backward compatibility
import { AgriculturalCard } from "@/components/ui/Card";
```

---

#### 2. **Standardized Button Sizing** ✅

**Problem:** Inconsistent button padding (px-4 vs px-6).  
**Solution:** Standardized sizing system in Button component.

```tsx
import { Button } from "@/components/ui/button";

// ✅ Consistent sizing
<Button size="sm">Small (h-8, px-3)</Button>
<Button size="default">Default (h-10, px-6)</Button>
<Button size="lg">Large (h-12, px-8)</Button>
<Button size="icon">Icon Only (h-10, w-10)</Button>

// ✅ New agricultural variant
<Button variant="agricultural">Farm Action</Button>
```

**Size Reference:**

- `sm`: 32px height, 12px padding
- `default`: 40px height, 24px padding (most common)
- `lg`: 48px height, 32px padding
- `icon`: 40x40px square

---

#### 3. **Status Color Utilities** ✅

**Problem:** Inconsistent status badge colors across pages.  
**Solution:** Created standardized utility functions.

```tsx
import {
  getOrderStatusClasses,
  getFarmStatusClasses,
  getPaymentStatusClasses,
  getOrderStatusLabel,
  getOrderStatusIcon,
} from "@/lib/utils/status-colors";

// ✅ Consistent status badges
<span className={cn("badge", getOrderStatusClasses(order.status))}>
  {getOrderStatusIcon(order.status)} {getOrderStatusLabel(order.status)}
</span>;

// Output examples:
// PENDING    → ⏳ Pending (yellow)
// CONFIRMED  → ✅ Confirmed (blue)
// PREPARING  → 👨‍🍳 Preparing (purple)
// READY      → 📦 Ready for Pickup (green)
// COMPLETED  → 🎉 Completed (gray)
// CANCELLED  → ❌ Cancelled (red)
```

**Available Functions:**

- `getOrderStatusClasses(status)` - Order status colors
- `getFarmStatusClasses(status)` - Farm status colors
- `getPaymentStatusClasses(status)` - Payment status colors
- `getPayoutStatusClasses(status)` - Payout status colors
- `getProductStatusClasses(status)` - Product status colors
- `getOrderStatusLabel(status)` - Human-readable labels
- `getOrderStatusIcon(status)` - Emoji icons

---

#### 4. **Responsive Table Wrapper** ✅

**Problem:** Admin tables overflow on mobile devices.  
**Solution:** Created ResponsiveTable component with horizontal scrolling.

```tsx
import { ResponsiveTable } from "@/components/ui/ResponsiveTable";

// ✅ Auto-scrolling table wrapper
<ResponsiveTable showScrollIndicators>
  <table className="min-w-full">{/* Table content */}</table>
</ResponsiveTable>;

// ✅ Or use pre-styled components
import {
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  TableEmptyState,
  TableLoadingSkeleton,
} from "@/components/ui/ResponsiveTable";

<Table>
  <Thead>
    <Tr>
      <Th>Column 1</Th>
      <Th>Column 2</Th>
    </Tr>
  </Thead>
  <Tbody>
    <Tr>
      <Td>Data 1</Td>
      <Td>Data 2</Td>
    </Tr>
  </Tbody>
</Table>;
```

**Features:**

- Automatic horizontal scroll on mobile
- Shadow indicators for scrollable content
- Touch-friendly scrolling
- Keyboard navigation support

---

#### 5. **Standardized Product Images** ✅

**Problem:** Inconsistent image aspect ratios (h-48, h-64, aspect-square).  
**Solution:** Created ProductImage component with aspect-square default.

```tsx
import { ProductImage } from "@/components/ui/ProductImage";

// ✅ Standard product image (aspect-square)
<ProductImage
  src={product.imageUrl}
  alt={product.name}
  hoverable
  badges={[
    { label: "ORGANIC", variant: "organic" },
    { label: "SEASONAL", variant: "seasonal" },
  ]}
/>

// ✅ With different aspect ratios
<ProductImage
  src={image.url}
  alt="Product"
  aspectRatio="4:3"
  priority // For above-the-fold images
/>

// ✅ Farm logo (circular)
import { FarmLogoImage } from "@/components/ui/ProductImage";

<FarmLogoImage
  src={farm.logoUrl}
  alt={farm.name}
  size="lg"
/>
```

**Features:**

- Consistent aspect-square ratio by default
- Automatic fallback to placeholder emoji
- Loading skeletons
- Error handling
- Badge overlays (organic, seasonal, sale, new)
- Hover effects

---

## Component Library

### Core Components

#### Button

**Location:** `src/components/ui/button.tsx`

```tsx
import { Button } from "@/components/ui/button";

// Variants
<Button variant="default">Default</Button>
<Button variant="primary">Primary (Green)</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="agricultural">Farm Action</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>

// States
<Button disabled>Disabled</Button>
<Button onClick={handleClick}>Clickable</Button>
```

---

#### Card

**Location:** `src/components/ui/Card.tsx`

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
} from "@/components/ui/Card";

<Card variant="default" interactive>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardBody>
    Main content goes here
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Variants
<Card variant="agricultural">Farm content</Card>
<Card variant="divine">Premium content</Card>
<Card variant="outline">Minimal card</Card>
```

---

#### Badge

**Location:** `src/components/ui/Badge.tsx`

```tsx
import { Badge } from "@/components/ui/Badge";

<Badge variant="default">Default</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="secondary">Info</Badge>
<Badge variant="outline">Outline</Badge>

// With status utility
import { getOrderStatusClasses } from "@/lib/utils/status-colors";

<Badge className={getOrderStatusClasses("CONFIRMED")}>
  Confirmed
</Badge>
```

---

#### Input

**Location:** `src/components/ui/input.tsx`

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div>
  <Label htmlFor="name">Name</Label>
  <Input id="name" type="text" placeholder="Enter name" required />
</div>;
```

---

#### EmptyState

**Location:** `src/components/ui/EmptyState.tsx`

```tsx
import { EmptyState } from "@/components/ui/EmptyState";
import { ShoppingCart } from "lucide-react";

<EmptyState
  icon={ShoppingCart}
  title="No Products Found"
  description="We couldn't find any products matching your criteria."
  secondaryDescription="Try adjusting your filters or search terms."
  action={{
    label: "Browse All Products",
    href: "/marketplace/products",
  }}
  secondaryAction={{
    label: "Clear Filters",
    onClick: clearFilters,
    variant: "outline",
  }}
  size="md"
  showDecoration
/>

// Pre-configured variants
import { EmptyStateVariants } from "@/components/ui/EmptyState";

<EmptyStateVariants.NoProducts />
<EmptyStateVariants.NoFarms />
<EmptyStateVariants.NoOrders />
<EmptyStateVariants.EmptyCart />
```

---

#### ResponsiveTable

**Location:** `src/components/ui/ResponsiveTable.tsx`

```tsx
import {
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  TableEmptyState,
  TableLoadingSkeleton,
} from "@/components/ui/ResponsiveTable";

<Table>
  <Thead>
    <Tr>
      <Th>Name</Th>
      <Th>Status</Th>
      <Th>Actions</Th>
    </Tr>
  </Thead>
  <Tbody>
    {data.length === 0 ? (
      <TableEmptyState
        icon="📦"
        title="No data found"
        description="Try adjusting your filters"
      />
    ) : (
      data.map((item) => (
        <Tr key={item.id} onClick={() => handleClick(item.id)}>
          <Td>{item.name}</Td>
          <Td>{item.status}</Td>
          <Td>
            <Button size="sm">View</Button>
          </Td>
        </Tr>
      ))
    )}
  </Tbody>
</Table>;
```

---

#### ProductImage

**Location:** `src/components/ui/ProductImage.tsx`

```tsx
import {
  ProductImage,
  ProductImageGrid,
  FarmLogoImage,
} from "@/components/ui/ProductImage";

// Single product image
<ProductImage
  src={product.imageUrl}
  alt={product.name}
  hoverable
  badges={[
    { label: "ORGANIC", variant: "organic" },
    { label: "SEASONAL", variant: "seasonal" },
  ]}
  onClick={openLightbox}
/>

// Image grid
<ProductImageGrid
  images={product.images}
  maxImages={4}
  onClick={(index) => openLightbox(index)}
/>

// Farm logo
<FarmLogoImage
  src={farm.logoUrl}
  alt={farm.name}
  size="lg"
/>
```

---

## Color System

### Primary Colors

```tsx
// Burgundy/Wine (Main Brand)
className = "bg-primary-600 text-white"; // #b83838
className = "hover:bg-primary-700"; // Hover state
className = "bg-primary-50 text-primary-800"; // Light background

// Orange/Rust (CTA)
className = "bg-secondary-600 text-white"; // #e0511b
className = "hover:bg-secondary-700"; // Hover state

// Agricultural Earth Tones
className = "bg-agricultural-600 text-white"; // #a85d32
className = "bg-agricultural-50"; // Light background

// Forest Green (Accent)
className = "bg-accent-600 text-white"; // #426246
```

### Functional Colors

```tsx
// Success (Green)
className = "bg-green-600 text-white"; // Primary actions
className = "bg-green-100 text-green-800"; // Success badges

// Warning (Yellow)
className = "bg-yellow-500 text-white";
className = "bg-yellow-100 text-yellow-800"; // Warning badges

// Error (Red)
className = "bg-red-600 text-white";
className = "bg-red-100 text-red-800"; // Error badges

// Info (Blue)
className = "bg-blue-600 text-white";
className = "bg-blue-100 text-blue-800"; // Info badges
```

### Grayscale

```tsx
// Text
className = "text-gray-900"; // Primary text (16.6:1 contrast)
className = "text-gray-600"; // Secondary text (7.8:1 contrast)
className = "text-gray-500"; // Tertiary text
className = "text-gray-400"; // Disabled text

// Backgrounds
className = "bg-white"; // Cards, content
className = "bg-gray-50"; // Page background
className = "bg-gray-100"; // Alternative backgrounds
className = "bg-gray-200"; // Borders
```

---

## Typography

### Font Families

```tsx
className = "font-sans"; // Inter (default)
className = "font-display"; // Cal Sans (headings)
```

### Type Scale

```tsx
// Headings
className = "text-3xl font-bold"; // Page titles (30px)
className = "text-2xl font-semibold"; // Section headings (24px)
className = "text-xl font-semibold"; // Subsection headings (20px)
className = "text-lg font-semibold"; // Card titles (18px)

// Body
className = "text-base"; // Default body (16px)
className = "text-sm"; // Secondary text (14px)
className = "text-xs"; // Labels, badges (12px)
```

### Usage Examples

```tsx
// Page structure
<h1 className="text-3xl font-bold text-gray-900">Page Title</h1>
<h2 className="text-2xl font-semibold text-gray-800 mt-8">Section</h2>
<p className="text-base text-gray-600 mt-2">Body text</p>
<span className="text-sm text-gray-500">Caption</span>
```

---

## Spacing & Layout

### Container

```tsx
// Standard page container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* Page content */}
</div>

// Narrower containers
<div className="max-w-4xl mx-auto px-4 py-8">
  {/* Form content */}
</div>
```

### Grid Layouts

```tsx
// Product/Farm grid (1→2→3→4 columns)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Cards */}
</div>

// Dashboard metrics (1→2→4 columns)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Stat cards */}
</div>

// Two-column split
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* Content */}
</div>
```

### Spacing Scale

```tsx
gap - 4; // 1rem (16px) - Form fields
gap - 6; // 1.5rem (24px) - Card grids (most common)
gap - 8; // 2rem (32px) - Section spacing

p - 4; // 1rem - Compact padding
p - 6; // 1.5rem - Standard card padding
p - 8; // 2rem - Section padding

mb - 4; // 1rem - Default bottom margin
mb - 6; // 1.5rem - Section margin
mb - 8; // 2rem - Major section margin
```

---

## Status Indicators

### Order Status

```tsx
import {
  getOrderStatusClasses,
  getOrderStatusLabel,
  getOrderStatusIcon,
} from "@/lib/utils/status-colors";

<span
  className={cn(
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
    getOrderStatusClasses(order.status),
  )}
>
  <span className="mr-1">{getOrderStatusIcon(order.status)}</span>
  {getOrderStatusLabel(order.status)}
</span>;
```

### Status Colors Reference

| Status    | Color      | Background | Icon |
| --------- | ---------- | ---------- | ---- |
| PENDING   | Yellow-800 | Yellow-100 | ⏳   |
| CONFIRMED | Blue-800   | Blue-100   | ✅   |
| PREPARING | Purple-800 | Purple-100 | 👨‍🍳   |
| READY     | Green-800  | Green-100  | 📦   |
| COMPLETED | Gray-800   | Gray-100   | 🎉   |
| CANCELLED | Red-800    | Red-100    | ❌   |

---

## Responsive Design

### Breakpoints

```tsx
sm:  640px    // Small tablets
md:  768px    // Tablets
lg:  1024px   // Desktops
xl:  1280px   // Large desktops
2xl: 1536px   // Extra large
```

### Common Patterns

```tsx
// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Responsive padding
<div className="px-4 sm:px-6 lg:px-8">

// Responsive flex direction
<div className="flex flex-col sm:flex-row gap-4">

// Show/hide elements
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>
```

---

## Accessibility

### Focus States

```tsx
// Always include focus rings
className="focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"

// Button focus (built-in)
<Button>Automatically has focus ring</Button>
```

### Semantic HTML

```tsx
// ✅ Correct heading hierarchy
<h1>Main Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>

// ✅ Use semantic elements
<main>{/* Main content */}</main>
<nav>{/* Navigation */}</nav>
<button>{/* Interactive elements */}</button>
<a href="...">{/* Links */}</a>

// ❌ Don't skip heading levels
<h1>Title</h1>
<h3>Skip h2</h3> // Don't do this
```

### ARIA Attributes

```tsx
// Descriptive labels
<button aria-label="Close dialog">×</button>

// Live regions
<div role="status" aria-live="polite">Loading...</div>

// Alt text
<img src="..." alt="Descriptive text" />

// Hidden decorative elements
<span aria-hidden="true">🎨</span>
```

### Color Contrast

All text meets WCAG 2.1 AA standards:

- Primary text (gray-900): 16.6:1 ✅
- Secondary text (gray-600): 7.8:1 ✅
- Minimum required: 4.5:1 for normal text

---

## Best Practices

### 1. Component Selection

```tsx
// ✅ Use the right component for the job
<Card variant="agricultural">  // For farm/product content
<Card variant="default">        // For general content
<Button variant="primary">      // For main actions
<Button variant="outline">      // For secondary actions
```

### 2. Consistent Spacing

```tsx
// ✅ Use standard gaps
<div className="space-y-6">     // Vertical spacing
<div className="grid gap-6">    // Grid spacing

// ❌ Avoid custom spacing
<div className="space-y-5">     // Non-standard
```

### 3. Responsive Images

```tsx
// ✅ Use ProductImage component
<ProductImage
  src={product.image}
  alt={product.name}
  priority={isAboveFold}
/>

// ❌ Don't use raw img tags
<img src={product.image} />     // No optimization
```

### 4. Status Indicators

```tsx
// ✅ Use utility functions
import { getOrderStatusClasses } from "@/lib/utils/status-colors";

<Badge className={getOrderStatusClasses(status)}>
  {status}
</Badge>

// ❌ Don't hardcode colors
<Badge className="bg-green-100">  // Inconsistent
```

### 5. Mobile Tables

```tsx
// ✅ Wrap tables in ResponsiveTable
import { ResponsiveTable } from "@/components/ui/ResponsiveTable";

<ResponsiveTable>
  <table>{/* Table content */}</table>
</ResponsiveTable>

// ❌ Don't use raw tables
<table>{/* Will overflow on mobile */}</table>
```

### 6. Loading States

```tsx
// ✅ Use provided skeletons
<ProductImageSkeleton />
<TableLoadingSkeleton rows={5} cols={4} />

// ✅ Show loading state
{isLoading ? <Skeleton /> : <Content />}
```

### 7. Empty States

```tsx
// ✅ Use EmptyState component
<EmptyState
  icon={ShoppingCart}
  title="No items"
  description="Add items to get started"
  action={{ label: "Add Item", href: "/add" }}
/>;

// ❌ Don't use plain text
{
  items.length === 0 && <p>No items</p>;
}
```

---

## Component Checklist

When creating new components, ensure:

- [ ] Uses `cn()` utility for class merging
- [ ] Has proper TypeScript types
- [ ] Includes hover/focus states where appropriate
- [ ] Is responsive (mobile-first)
- [ ] Has accessible ARIA attributes
- [ ] Uses design system colors (no hardcoded values)
- [ ] Follows naming conventions
- [ ] Includes loading/error states
- [ ] Has proper keyboard navigation
- [ ] Documented with JSDoc comments

---

## Quick Reference

### Import Statements

```tsx
// Core UI
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

// Specialized
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductImage } from "@/components/ui/ProductImage";
import { ResponsiveTable } from "@/components/ui/ResponsiveTable";

// Utilities
import { cn } from "@/lib/utils";
import { getOrderStatusClasses } from "@/lib/utils/status-colors";
```

### Common Patterns

```tsx
// Page layout
<div className="min-h-screen bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Content */}
  </div>
</div>

// Card with action
<Card variant="default" interactive>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardBody>Content</CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Form field
<div className="space-y-2">
  <Label htmlFor="field">Label</Label>
  <Input id="field" type="text" />
</div>

// Status badge
<Badge className={getOrderStatusClasses(status)}>
  {status}
</Badge>
```

---

## Migration Guide

### Updating from Old Patterns

#### Card Component

```tsx
// ❌ Old (still works)
import { AgriculturalCard } from "@/components/ui/AgriculturalCard";
<AgriculturalCard variant="agricultural">

// ✅ New (recommended)
import { Card } from "@/components/ui/Card";
<Card variant="agricultural">
```

#### Status Badges

```tsx
// ❌ Old (inconsistent)
<span className="bg-green-100 text-green-800">Active</span>;

// ✅ New (consistent)
import { getOrderStatusClasses } from "@/lib/utils/status-colors";
<span className={getOrderStatusClasses("CONFIRMED")}>Confirmed</span>;
```

#### Tables

```tsx
// ❌ Old (mobile overflow)
<table className="w-full">{/* Content */}</table>;

// ✅ New (mobile friendly)
import { ResponsiveTable } from "@/components/ui/ResponsiveTable";
<ResponsiveTable>
  <table className="w-full">{/* Content */}</table>
</ResponsiveTable>;
```

---

## Resources

### Documentation Files

- **Complete Analysis**: `DESIGN_SYSTEM_ANALYSIS.md`
- **Quick Reference**: `DESIGN_QUICK_REFERENCE.md`
- **This Guide**: `DESIGN_SYSTEM_GUIDE.md`

### Component Locations

- Core UI: `src/components/ui/`
- Features: `src/components/features/`
- Layouts: `src/components/layouts/`

### Utilities

- Class merger: `src/lib/utils.ts`
- Status colors: `src/lib/utils/status-colors.ts`

### Configuration

- Tailwind: `tailwind.config.ts`
- Global styles: `src/app/globals.css`

---

## Support

### Questions?

1. Check this guide first
2. Review `DESIGN_SYSTEM_ANALYSIS.md` for detailed specs
3. Look at existing components for examples
4. Check component tests in `src/components/ui/__tests__/`

### Contributing

When adding new components:

1. Follow existing patterns
2. Use design system colors and spacing
3. Include TypeScript types
4. Add accessibility features
5. Create tests
6. Update this documentation

---

**Design System Version:** 2.0  
**Platform Version:** 1.0+  
**Last Updated:** November 2024  
**Status:** Production Ready ✅

🌾 **Build with Agricultural Consciousness** ⚡
