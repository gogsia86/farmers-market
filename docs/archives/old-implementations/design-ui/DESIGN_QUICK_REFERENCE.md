# 🎨 Design System Quick Reference Guide

**Farmers Market Platform - Visual Design Cheat Sheet**  
**Last Updated:** November 2024  
**For:** Designers & Developers

---

## 🎯 At a Glance

**Design Philosophy:** Fall Agricultural Theme with Modern Web Standards  
**Primary Framework:** Tailwind CSS v3  
**Component Library:** 32+ Reusable Components  
**Design Grade:** A (94/100)

---

## 🎨 Color Palette - Copy & Paste

### Primary Colors (Burgundy/Wine)

```css
/* Main Brand Color */
bg-primary-600     #b83838    rgb(184, 56, 56)
text-primary-600

/* Hover State */
bg-primary-700     #9a2c2c    rgb(154, 44, 44)

/* Light Background */
bg-primary-50      #fdf4f4    rgb(253, 244, 244)
text-primary-800
```

### Secondary Colors (Orange/Rust)

```css
/* CTA Color */
bg-secondary-600   #e0511b    rgb(224, 81, 27)
text-secondary-600

/* Hover State */
bg-secondary-700   #b93d18    rgb(185, 61, 24)

/* Light Background */
bg-secondary-50    #fef6ee    rgb(254, 246, 238)
```

### Agricultural Colors (Earth Tones)

```css
/* Agricultural Theme */
bg-agricultural-600   #a85d32    rgb(168, 93, 50)
bg-agricultural-700   #8b4a2b    rgb(139, 74, 43)
bg-agricultural-50    #fdf8f3    rgb(253, 248, 243)
```

### Functional Colors

```css
/* Success */
bg-green-600       #059669    rgb(5, 150, 105)
text-green-800

/* Warning */
bg-yellow-500      #eab308    rgb(234, 179, 8)
text-yellow-800

/* Error */
bg-red-600         #dc2626    rgb(220, 38, 38)
text-red-800

/* Info */
bg-blue-600        #2563eb    rgb(37, 99, 235)
text-blue-800
```

### Grayscale

```css
/* Text Colors */
text-gray-900      #111827    Primary text
text-gray-600      #4b5563    Secondary text
text-gray-500      #6b7280    Tertiary text
text-gray-400      #9ca3af    Disabled text

/* Backgrounds */
bg-white           #ffffff
bg-gray-50         #f9fafb    Page background
bg-gray-100        #f3f4f6    Card background (alt)
bg-gray-200        #e5e7eb    Borders
```

---

## 📐 Typography - Font Sizes

```css
/* Headings */
text-3xl           1.875rem (30px)    Page titles
text-2xl           1.5rem   (24px)    Section headings
text-xl            1.25rem  (20px)    Subsection headings
text-lg            1.125rem (18px)    Card titles

/* Body */
text-base          1rem     (16px)    Default body text
text-sm            0.875rem (14px)    Secondary text, captions
text-xs            0.75rem  (12px)    Labels, badges
```

### Font Weights

```css
font-bold          700    Main headings
font-semibold      600    Subheadings, emphasis
font-medium        500    Button text, labels
font-normal        400    Body text
```

### Usage Examples

```jsx
<h1 className="text-3xl font-bold text-gray-900">Page Title</h1>
<h2 className="text-2xl font-semibold text-gray-800">Section</h2>
<p className="text-base text-gray-600">Body text</p>
<span className="text-sm text-gray-500">Caption</span>
```

---

## 📦 Spacing Scale

```css
/* Padding & Margin */
p-2, m-2          0.5rem   (8px)
p-4, m-4          1rem     (16px)    Standard spacing
p-6, m-6          1.5rem   (24px)    Card padding
p-8, m-8          2rem     (32px)    Section spacing
p-12, m-12        3rem     (48px)    Large sections

/* Gaps */
gap-2             0.5rem   (8px)
gap-4             1rem     (16px)    Form fields
gap-6             1.5rem   (24px)    Card grids (most common)
gap-8             2rem     (32px)    Section spacing
```

---

## 🎴 Component Classes - Quick Copy

### Buttons

#### Primary Button (Green CTA)

```jsx
<button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium">
  Click Me
</button>
```

#### Secondary Button (Outline)

```jsx
<button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium">
  Cancel
</button>
```

#### Agricultural Button (Themed)

```jsx
<button className="px-6 py-3 bg-agricultural-600 text-white rounded-lg hover:bg-agricultural-700 transition-colors duration-200 font-medium">
  Farm Action
</button>
```

### Cards

#### Standard Card

```jsx
<div className="bg-white rounded-lg shadow-md p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-2">Card Title</h3>
  <p className="text-sm text-gray-600">Card content goes here.</p>
</div>
```

#### Hover Card (Interactive)

```jsx
<div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer p-6">
  <!-- Content -->
</div>
```

#### Agricultural Card

```jsx
<div className="bg-white border-2 border-agricultural-200 rounded-lg shadow-md hover:border-agricultural-400 transition-colors duration-300 p-6">
  <!-- Farm/product content -->
</div>
```

### Badges

#### Status Badges

```jsx
<!-- Success -->
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
  Active
</span>

<!-- Warning -->
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
  Pending
</span>

<!-- Error -->
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
  Cancelled
</span>

<!-- Info -->
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
  Info
</span>
```

### Form Inputs

#### Text Input

```jsx
<input
  type="text"
  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
  placeholder="Enter text"
/>
```

#### Select Dropdown

```jsx
<select className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
sm:   640px    Small tablets
md:   768px    Tablets
lg:   1024px   Desktops
xl:   1280px   Large desktops
2xl:  1536px   Extra large screens

/* Common Patterns */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
px-4 sm:px-6 lg:px-8
text-base lg:text-lg
```

---

## 🎭 Border Radius

```css
rounded-lg        0.5rem  (8px)     Cards, buttons (most common)
rounded-xl        0.75rem (12px)    Premium components
rounded-2xl       1rem    (16px)    Hero sections
rounded-full      9999px            Badges, avatars, pills
```

---

## ✨ Shadows

```css
/* Standard Shadows */
shadow-sm         Subtle shadow
shadow-md         Default cards
shadow-lg         Hover state, elevated
shadow-xl         Modals, dropdowns

/* Custom Agricultural Shadows */
shadow-glow-earth    Agricultural theme shadow
shadow-glow          Primary glow effect
shadow-glow-warm     Secondary glow effect
```

### Usage

```jsx
<div className="shadow-md hover:shadow-lg transition-shadow duration-300">
  <!-- Hover effect card -->
</div>
```

---

## 🎬 Animations & Transitions

```css
/* Durations */
duration-200      Quick interactions (color changes)
duration-300      Standard (most common)
duration-500      Slower, dramatic

/* Easing */
ease-in-out       Smooth start and end
ease-out          Natural deceleration
ease-in           Acceleration

/* Common Patterns */
transition-colors duration-200      Button hover
transition-shadow duration-300      Card hover
transition-all duration-300         Complex animations
transition-transform duration-300   Scale/translate
```

### Hover Effects

```jsx
<!-- Card Hover -->
<div className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300">

<!-- Button Hover -->
<button className="hover:bg-green-700 transition-colors duration-200">

<!-- Image Hover -->
<img className="group-hover:scale-105 transition-transform duration-300">
```

---

## 📐 Layout Patterns

### Page Container

```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <!-- Page content -->
</div>
```

### Product Grid

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <!-- Product cards -->
</div>
```

### Dashboard Metrics Grid

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <!-- Stat cards -->
</div>
```

### Two-Column Layout

```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  <div><!-- Left column --></div>
  <div><!-- Right column --></div>
</div>
```

---

## 🎯 Common Page Patterns

### Dashboard Header

```jsx
<div className="bg-white border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">Welcome back!</p>
      </div>
      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
        Action
      </button>
    </div>
  </div>
</div>
```

### Stat Card

```jsx
<div className="bg-white rounded-lg shadow-md p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-600">Total Orders</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">127</p>
      <p className="text-sm text-gray-500 mt-1">+12% from last month</p>
    </div>
    <div className="p-3 bg-green-100 rounded-full">
      <!-- Icon here -->
    </div>
  </div>
</div>
```

### Product Card

```jsx
<div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-green-600 transition-colors duration-300">
  <div className="relative h-48 bg-gray-200">
    <img src="..." alt="..." className="w-full h-full object-cover" />
  </div>
  <div className="p-4">
    <h3 className="text-lg font-bold text-gray-900 mb-2">Product Name</h3>
    <p className="text-sm text-gray-600 mb-3">Description here...</p>
    <div className="flex items-center justify-between">
      <span className="text-2xl font-bold text-green-700">$12.99</span>
      <span className="text-sm text-gray-500">per lb</span>
    </div>
  </div>
</div>
```

### Empty State

```jsx
<div className="text-center py-12 px-6">
  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
    <!-- Icon -->
  </div>
  <h3 className="text-xl font-bold text-gray-900 mb-2">No Items Found</h3>
  <p className="text-base text-gray-600 mb-6">
    Start adding items to see them here.
  </p>
  <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
    Add First Item
  </button>
</div>
```

---

## ♿ Accessibility Quick Checks

### Focus States

```css
/* Always include focus rings */
focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
```

### Color Contrast

- Primary text (gray-900): ✅ 16.6:1 ratio
- Secondary text (gray-600): ✅ 7.8:1 ratio
- Minimum required: 4.5:1 for normal text

### Semantic HTML

```jsx
<!-- Use proper heading hierarchy -->
<h1> → <h2> → <h3>

<!-- Use semantic elements -->
<main>  <!-- Main content -->
<nav>   <!-- Navigation -->
<button> <!-- Interactive elements -->
<a>     <!-- Links -->
```

### ARIA Attributes

```jsx
<button aria-label="Close dialog">×</button>
<div role="status" aria-live="polite">Loading...</div>
<img src="..." alt="Descriptive text" />
```

---

## 🔍 When to Use What

### Card vs AgriculturalCard

- **Card**: General purpose (dashboard, lists, generic content)
- **AgriculturalCard**: Farm/product specific cards with theme

### Button Colors

- **Green**: Primary actions (submit, buy, create)
- **Outline**: Secondary actions (cancel, back)
- **Agricultural**: Farm-specific actions (harvest, update farm)
- **Red**: Destructive actions (delete, remove)

### Text Colors

- **gray-900**: Primary headings and important text
- **gray-600**: Body text, descriptions
- **gray-500**: Secondary info, captions
- **gray-400**: Disabled text, placeholders

### Spacing

- **gap-4**: Form fields, compact lists
- **gap-6**: Card grids (most common)
- **gap-8**: Large section spacing
- **p-6**: Standard card padding
- **py-8**: Section vertical padding

---

## 📋 Component Import Guide

```typescript
// Core UI Components
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loading } from "@/components/ui/Loading";

// Form Components
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Agricultural Components
import { AgriculturalCard } from "@/components/ui/AgriculturalCard";
import { BiodynamicProductGrid } from "@/components/BiodynamicProductGrid";

// Utility
import { cn } from "@/lib/utils"; // Class name merger
```

---

## 🎨 Status Badge Reference

```jsx
// Order Status
<span className="badge-pending">Pending</span>      // Yellow
<span className="badge-confirmed">Confirmed</span>  // Blue
<span className="badge-preparing">Preparing</span>  // Purple
<span className="badge-ready">Ready</span>          // Green
<span className="badge-completed">Completed</span>  // Gray
<span className="badge-cancelled">Cancelled</span>  // Red

// Generic Status
<Badge variant="success">Active</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
```

---

## 💡 Pro Tips

1. **Always use `cn()` utility for class merging**

   ```typescript
   import { cn } from "@/lib/utils";
   className={cn("base-classes", conditionalClasses, props.className)}
   ```

2. **Use semantic color names**

   ```jsx
   ✅ bg-green-600 (semantic)
   ❌ bg-[#059669] (hardcoded)
   ```

3. **Follow responsive patterns**

   ```jsx
   ✅ text-base lg:text-lg
   ❌ text-lg (not responsive)
   ```

4. **Include hover states on interactive elements**

   ```jsx
   ✅ hover:bg-green-700 transition-colors
   ❌ No hover state
   ```

5. **Maintain consistent spacing**
   ```jsx
   ✅ gap-6 (consistent with other grids)
   ❌ gap-5 (inconsistent)
   ```

---

## 🚀 Quick Start Template

```jsx
// New page template
export default function MyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Page Title</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stat cards */}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content cards */}
        </div>
      </div>
    </div>
  );
}
```

---

## 📚 Additional Resources

- **Full Design Analysis**: See `DESIGN_SYSTEM_ANALYSIS.md`
- **Component Tests**: `src/components/ui/__tests__/`
- **Tailwind Config**: `tailwind.config.ts`
- **Global Styles**: `src/app/globals.css`
- **Divine Instructions**: `.github/instructions/08_UX_DESIGN_CONSCIOUSNESS.instructions.md`

---

**Quick Reference Version:** 2.0  
**Compatible With:** Farmers Market Platform v1.0+  
**Last Updated:** November 2024

🌾 **Build with Agricultural Consciousness** ⚡
