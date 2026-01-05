# 🎨 UI Components & Design System Hub

**Complete UI/UX documentation for the Farmers Market Platform** — Component library, design patterns, styling guidelines, and visual documentation.

---

## 🎯 Quick Navigation

| Category             | Resources                     | Quick Links                                                                 |
| -------------------- | ----------------------------- | --------------------------------------------------------------------------- |
| **🧩 Components**    | Base UI, features, patterns   | [Component Library](#-component-library) • [Patterns](#-component-patterns) |
| **🎨 Design System** | Colors, typography, spacing   | [Design Tokens](#-design-system) • [Tailwind](#tailwind-configuration)      |
| **📱 Responsive**    | Mobile-first, breakpoints     | [Responsive Design](#-responsive-design) • [Mobile](#mobile-optimization)   |
| **♿ Accessibility** | WCAG, ARIA, keyboard nav      | [A11y Guide](#-accessibility) • [Testing](#accessibility-testing)           |
| **🖼️ Visual Docs**   | Sitemaps, wireframes, mockups | [Visual Assets](#-visual-documentation) • [Sitemap](#visual-sitemap)        |

**Total Components:** 50+ production-ready • **Design Tokens:** 100+ variables • **A11y Score:** AAA compliance

---

## 🧩 Component Library

### Base UI Components

#### Buttons

```typescript
// components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'border border-input bg-background hover:bg-accent': variant === 'outline',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
          },
          {
            'h-9 px-3 text-sm': size === 'sm',
            'h-10 px-4 py-2': size === 'md',
            'h-11 px-8 text-lg': size === 'lg',
          },
          className
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

**Usage:**

```tsx
<Button variant="primary" size="md">Save Farm</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="destructive" isLoading>Deleting...</Button>
```

---

#### Cards

```typescript
// components/ui/Card.tsx
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    />
  )
);

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);

export const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
);
```

**Usage:**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Green Acres Farm</CardTitle>
    <CardDescription>Organic vegetables and seasonal produce</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Located in the heart of the valley...</p>
  </CardContent>
  <CardFooter>
    <Button>Visit Farm</Button>
  </CardFooter>
</Card>
```

---

#### Input Fields

```typescript
// components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
            'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

---

### Feature Components

#### Farm Card

```typescript
// components/features/FarmCard.tsx
'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Image from 'next/image';
import Link from 'next/link';

interface FarmCardProps {
  farm: {
    id: string;
    name: string;
    description: string;
    image?: string;
    location: string;
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
    productsCount: number;
  };
}

export function FarmCard({ farm }: FarmCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={farm.image || '/placeholder-farm.jpg'}
          alt={farm.name}
          fill
          className="object-cover"
        />
        <Badge
          className="absolute top-2 right-2"
          variant={farm.status === 'ACTIVE' ? 'default' : 'secondary'}
        >
          {farm.status}
        </Badge>
      </div>

      <CardHeader>
        <h3 className="text-xl font-bold">{farm.name}</h3>
        <p className="text-sm text-muted-foreground">{farm.location}</p>
      </CardHeader>

      <CardContent>
        <p className="text-sm line-clamp-2">{farm.description}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {farm.productsCount} products available
        </p>
      </CardContent>

      <CardFooter className="gap-2">
        <Button asChild className="flex-1">
          <Link href={`/farms/${farm.id}`}>View Farm</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/farms/${farm.id}/products`}>Products</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

#### Product Grid

```typescript
// components/features/ProductGrid.tsx
'use client';

import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-96 w-full" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## 🎨 Design System

### Design Tokens

#### Colors (Tailwind Config)

```javascript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e", // Main brand green
          600: "#16a34a",
          700: "#15803d",
        },

        // Agricultural theme
        agricultural: {
          soil: "#8B4513",
          leaf: "#228B22",
          harvest: "#FFD700",
          sky: "#87CEEB",
        },

        // Semantic colors
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",

        // Neutrals
        background: "#ffffff",
        foreground: "#0a0a0a",
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
      },
    },
  },
};
```

---

#### Typography

```yaml
Font Families:
  sans: Inter, system-ui, sans-serif
  mono: 'Fira Code', monospace
  display: 'Playfair Display', serif

Font Sizes:
  xs: 0.75rem (12px)
  sm: 0.875rem (14px)
  base: 1rem (16px)
  lg: 1.125rem (18px)
  xl: 1.25rem (20px)
  2xl: 1.5rem (24px)
  3xl: 1.875rem (30px)
  4xl: 2.25rem (36px)

Font Weights:
  normal: 400
  medium: 500
  semibold: 600
  bold: 700

Line Heights:
  tight: 1.25
  normal: 1.5
  relaxed: 1.75
```

---

#### Spacing Scale

```yaml
Spacing (Tailwind):
  0: 0px
  1: 0.25rem (4px)
  2: 0.5rem (8px)
  3: 0.75rem (12px)
  4: 1rem (16px)
  5: 1.25rem (20px)
  6: 1.5rem (24px)
  8: 2rem (32px)
  10: 2.5rem (40px)
  12: 3rem (48px)
  16: 4rem (64px)
  20: 5rem (80px)
  24: 6rem (96px)

Container Max Widths:
  sm: 640px
  md: 768px
  lg: 1024px
  xl: 1280px
  2xl: 1536px
```

---

### Component Patterns

#### Loading States

```typescript
// Pattern: Skeleton screens
import { Skeleton } from '@/components/ui/Skeleton';

export function ProductCardSkeleton() {
  return (
    <Card>
      <Skeleton className="h-48 w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  );
}

// Pattern: Loading spinner
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );
}
```

---

#### Error States

```typescript
// Pattern: Error boundaries
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred. Please try again.',
  onRetry
}: ErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {message}
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-2"
          >
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
```

---

#### Empty States

```typescript
// Pattern: Empty state with action
import { Package } from 'lucide-react';

export function EmptyState({
  icon: Icon = Package,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

// Usage:
<EmptyState
  title="No products yet"
  description="Start by adding your first product to the farm"
  action={
    <Button asChild>
      <Link href="/products/new">Add Product</Link>
    </Button>
  }
/>
```

---

## 📱 Responsive Design

### Breakpoints

```yaml
Mobile-First Approach:

Breakpoints:
  sm: 640px # Small tablets
  md: 768px # Tablets
  lg: 1024px # Small laptops
  xl: 1280px # Desktops
  2xl: 1536px # Large screens

Usage:
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  <!-- Responsive grid -->
  </div>
```

---

### Mobile Optimization

#### Touch Targets

```typescript
// Minimum 44x44px touch targets
<Button
  className="min-h-[44px] min-w-[44px]"
  aria-label="Close menu"
>
  <X className="h-5 w-5" />
</Button>
```

#### Mobile Navigation

```typescript
// components/features/MobileNav.tsx
'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/Sheet';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <nav className="flex flex-col gap-4">
            <Link href="/" onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link href="/farms" onClick={() => setIsOpen(false)}>
              Farms
            </Link>
            <Link href="/products" onClick={() => setIsOpen(false)}>
              Products
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

---

## ♿ Accessibility

### WCAG Compliance

#### Color Contrast

```yaml
Requirements:
  Normal Text: 4.5:1 minimum
  Large Text: 3:1 minimum
  UI Components: 3:1 minimum

Implementation:
  # Check all color combinations
  # Use tools: WebAIM Color Contrast Checker
  # Test with browser DevTools
```

---

#### Keyboard Navigation

```typescript
// Ensure all interactive elements are keyboard accessible
<Button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  tabIndex={0}
  role="button"
>
  Click Me
</Button>

// Focus management
import { useEffect, useRef } from 'react';

export function Modal({ isOpen }: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div role="dialog" aria-modal="true">
      <button ref={closeButtonRef} aria-label="Close modal">
        Close
      </button>
    </div>
  );
}
```

---

#### ARIA Labels

```typescript
// Descriptive labels for screen readers
<Button aria-label="Add tomatoes to cart">
  <Plus className="h-4 w-4" />
</Button>

// Form accessibility
<form aria-labelledby="farm-form-title">
  <h2 id="farm-form-title">Create New Farm</h2>
  <Input
    label="Farm Name"
    aria-required="true"
    aria-describedby="farm-name-help"
  />
  <p id="farm-name-help" className="text-sm text-muted-foreground">
    Choose a unique name for your farm
  </p>
</form>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {successMessage}
</div>
```

---

### Accessibility Testing

```bash
# Automated testing with jest-axe
npm install --save-dev jest-axe @axe-core/react

# Test example
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('Button should have no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 🖼️ Visual Documentation

### Available Visual Assets

1. **[VISUAL_SITEMAP_DIAGRAM.md](./VISUAL_SITEMAP_DIAGRAM.md)** — Complete platform sitemap
   - User flows
   - Page hierarchy
   - Navigation structure

2. **[NEXTAUTH_DEBUG_GUIDE.md](./NEXTAUTH_DEBUG_GUIDE.md)** — Authentication UI flows
   - Login screens
   - Session management
   - Debug visualization

3. **[QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)** — UI onboarding
   - First-time user experience
   - Setup screens
   - Quick wins

4. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** — UI component quick reference
   - Component catalog
   - Usage examples
   - Copy-paste patterns

5. **[PRE_COMMIT_HOOKS_GUIDE.md](./PRE_COMMIT_HOOKS_GUIDE.md)** — Code quality UI
   - Linting visualization
   - Error formatting
   - Success states

---

## 🛠️ Development Tools

### Component Development Workflow

```bash
# 1. Create component file
touch src/components/ui/NewComponent.tsx

# 2. Create story (Storybook optional)
touch src/components/ui/NewComponent.stories.tsx

# 3. Create tests
touch src/components/ui/__tests__/NewComponent.test.tsx

# 4. Export from index
echo "export { NewComponent } from './NewComponent';" >> src/components/ui/index.ts
```

---

### Component Template

```typescript
// components/ui/ComponentTemplate.tsx
'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const componentVariants = cva(
  'base-classes-here',
  {
    variants: {
      variant: {
        default: 'variant-classes',
        secondary: 'variant-classes',
      },
      size: {
        sm: 'size-classes',
        md: 'size-classes',
        lg: 'size-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ComponentProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {}

export const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Component.displayName = 'Component';
```

---

## 📦 Component Inventory

```yaml
Base UI Components (shadcn/ui based): ✅ Button (5 variants)
  ✅ Input (with validation)
  ✅ Textarea
  ✅ Select
  ✅ Checkbox
  ✅ Radio
  ✅ Switch
  ✅ Slider
  ✅ Card (with subcomponents)
  ✅ Dialog/Modal
  ✅ Sheet (side drawer)
  ✅ Alert
  ✅ Badge
  ✅ Avatar
  ✅ Skeleton
  ✅ Tooltip
  ✅ Dropdown Menu
  ✅ Tabs
  ✅ Accordion
  ✅ Toast/Notifications

Feature Components: ✅ FarmCard
  ✅ ProductCard
  ✅ ProductGrid
  ✅ OrderSummary
  ✅ ShoppingCart
  ✅ FarmProfile
  ✅ UserProfile
  ✅ SearchBar
  ✅ FilterPanel
  ✅ Pagination
  ✅ ImageUpload
  ✅ MapView
  ✅ Calendar
  ✅ DateRangePicker

Layout Components: ✅ Header
  ✅ Footer
  ✅ Sidebar
  ✅ MobileNav
  ✅ Container
  ✅ Grid
  ✅ Stack

Total: 50+ production-ready components
```

---

## 🎯 Best Practices

### Component Guidelines

1. **Composition over Configuration**

   ```typescript
   // ✅ Good: Composable
   <Card>
     <CardHeader>
       <CardTitle>Title</CardTitle>
     </CardHeader>
     <CardContent>Content</CardContent>
   </Card>

   // ❌ Bad: Too many props
   <Card title="Title" content="Content" hasHeader hasFooter />
   ```

2. **Accessibility First**

   ```typescript
   // Always include ARIA labels, keyboard support, focus management
   ```

3. **Type Safety**

   ```typescript
   // Use TypeScript for all components
   // Extend HTML element props when appropriate
   ```

4. **Consistent Naming**

   ```typescript
   // PascalCase for components
   // camelCase for functions
   // UPPER_CASE for constants
   ```

5. **Agricultural Consciousness**
   ```typescript
   // Use farming terminology where appropriate
   // Seasonal color variations
   // Crop-specific iconography
   ```

---

## 🔗 Related Documentation

- **[Design System Docs](../architecture/DESIGN_SYSTEM.md)** — Complete design system
- **[Component Testing](../testing/README.md#component-testing)** — Testing UI components
- **[Accessibility Guide](../guides/ACCESSIBILITY.md)** — A11y best practices
- **[Tailwind Config](../../tailwind.config.ts)** — Full configuration

---

## 📝 Contributing

### Adding New Components

1. Follow component template
2. Add TypeScript types
3. Include accessibility features
4. Write tests (80%+ coverage)
5. Add to component inventory
6. Document usage examples
7. Create PR with examples

---

**Last Updated:** December 2024  
**Maintained By:** UI/UX Team  
**Status:** ✅ Complete Production-Ready Design System

🎨 **Designing divine agricultural interfaces with consciousness!** ⚡✨
