# 🚀 Run 2: Search & Discovery - Installation & Integration Guide

## 📋 Overview

This guide walks you through integrating the Search & Discovery features into your Farmers Market Platform.

**Estimated Time**: 15-20 minutes  
**Difficulty**: Intermediate

---

## 📦 Prerequisites

Before starting, ensure you have:

- ✅ **Run 1 completed** (Core Infrastructure)
- ✅ **Database** with Product, Farm, Category models
- ✅ **Prisma** configured and migrations run
- ✅ **Shadcn/ui** components installed

---

## 🔧 Step 1: Install Required Dependencies

No new dependencies needed! All components use existing packages from Run 1:

```bash
# Already installed from Run 1:
# - @radix-ui/react-slider (for price range)
# - @radix-ui/react-accordion (for filters)
# - @radix-ui/react-checkbox (for filter options)
# - @radix-ui/react-scroll-area (for long lists)
```

If you haven't installed shadcn/ui components yet:

```bash
# Install required shadcn/ui components
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add separator
```

---

## 📁 Step 2: Verify File Structure

Ensure all files from Run 2 are in place:

```
src/
├── types/
│   └── search.ts                           ✅ NEW
├── lib/
│   └── utils/
│       └── search.utils.ts                 ✅ NEW
├── app/
│   └── api/
│       └── search/
│           ├── products/
│           │   └── route.ts                ✅ NEW
│           └── suggestions/
│               └── route.ts                ✅ NEW
└── components/
    ├── ui/
    │   └── skeleton.tsx                    ✅ UPDATED
    └── features/
        └── search/
            └── SearchFilters.tsx           ✅ NEW
```

---

## 🗄️ Step 3: Update Database Schema (if needed)

Ensure your Prisma schema has these fields for search functionality:

```prisma
// schema.prisma

model Product {
  id             String   @id @default(cuid())
  name           String
  description    String?  @db.Text
  price          Float
  stockQuantity  Int      @default(0)
  isOrganic      Boolean  @default(false)
  isSeasonal     Boolean  @default(false)
  
  // Relations
  categoryId     String?
  category       Category? @relation(fields: [categoryId], references: [id])
  farmId         String
  farm           Farm      @relation(fields: [farmId], references: [id])
  images         ProductImage[]
  
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  @@index([name])
  @@index([categoryId])
  @@index([farmId])
  @@index([price])
  @@index([stockQuantity])
}

model Farm {
  id          String   @id @default(cuid())
  name        String
  description String?  @db.Text
  logo        String?
  isVerified  Boolean  @default(false)
  
  products    Product[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([name])
  @@index([isVerified])
}

model Category {
  id       String    @id @default(cuid())
  name     String    @unique
  products Product[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([name])
}
```

If you need to add indexes, run:

```bash
npx prisma db push
# or
npx prisma migrate dev --name add_search_indexes
```

---

## 🎨 Step 4: Create a Search Page

Create a new search page that uses the components:

### Option A: Server Component with Client Filters

```tsx
// src/app/products/search/page.tsx
import { Suspense } from "react";
import { SearchFilters } from "@/components/features/search/SearchFilters";
import { ProductGridSkeleton } from "@/components/ui/skeleton";

export default async function ProductSearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Search Products</h1>
        <p className="text-muted-foreground">
          Find fresh, local products from verified farms
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Filters Sidebar */}
        <aside className="lg:sticky lg:top-4 lg:h-fit">
          <Suspense fallback={<div>Loading filters...</div>}>
            <SearchFiltersWrapper />
          </Suspense>
        </aside>

        {/* Search Results */}
        <main>
          <Suspense fallback={<ProductGridSkeleton count={12} />}>
            <SearchResults searchParams={searchParams} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
```

### Option B: Full Client Component

```tsx
// src/app/products/search/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchFilters } from "@/components/features/search/SearchFilters";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { parseSearchParams, filtersToSearchParams } from "@/lib/utils/search.utils";
import type { ProductSearchFilters } from "@/types/search";

export default function ProductSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Parse URL to filters
  const [filters, setFilters] = useState<ProductSearchFilters>(() => 
    parseSearchParams(searchParams)
  );
  
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>({
    data: [],
    meta: null,
    filters: null,
  });

  // Fetch search results
  useEffect(() => {
    async function search() {
      setLoading(true);
      try {
        const params = filtersToSearchParams(filters);
        const res = await fetch(`/api/search/products?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setResults({
            data: data.data.data,
            meta: data.data.meta,
            filters: data.filters,
          });
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }

    search();
  }, [filters]);

  // Update URL when filters change
  const handleFiltersChange = (newFilters: ProductSearchFilters) => {
    setFilters(newFilters);
    const params = filtersToSearchParams(newFilters);
    router.push(`/products/search?${params.toString()}`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Search Products</h1>
        <p className="text-muted-foreground">
          Find fresh, local products from verified farms
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Filters */}
        <aside className="lg:sticky lg:top-4 lg:h-fit">
          <SearchFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            availableCategories={results.filters?.availableCategories}
            availableFarms={results.filters?.availableFarms}
            priceRange={results.filters?.priceRange}
          />
        </aside>

        {/* Results */}
        <main>
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : (
            <>
              {/* Results Header */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-muted-foreground">
                  {results.meta?.totalItems || 0} products found
                </p>
                {/* Add sort dropdown here */}
              </div>

              {/* Product Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.data.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {results.meta && results.meta.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={results.meta.currentPage}
                    totalPages={results.meta.totalPages}
                    onPageChange={(page) =>
                      handleFiltersChange({ ...filters, page })
                    }
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
```

---

## 🔍 Step 5: Add Search Bar with Autocomplete

Create a search bar component:

```tsx
// src/components/features/search/SearchBar.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { debounce } from "@/lib/utils/search.utils";
import type { SearchSuggestion } from "@/types/search";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch suggestions
  const fetchSuggestions = debounce(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (data.success) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Suggestions error:", error);
    }
  }, 300);

  useEffect(() => {
    fetchSuggestions(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products/search?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products, farms, categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-9 pr-20"
        />
        <Button
          type="submit"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2"
        >
          Search
        </Button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border bg-popover p-2 shadow-lg">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.value}
              onClick={() => {
                if (suggestion.type === "PRODUCT") {
                  router.push(`/products/${suggestion.value}`);
                } else if (suggestion.type === "FARM") {
                  router.push(`/farms/${suggestion.value}`);
                } else {
                  router.push(`/products/search?category=${suggestion.value}`);
                }
                setShowSuggestions(false);
              }}
              className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-accent"
            >
              <span className="text-xs text-muted-foreground">
                {suggestion.type}
              </span>
              <span>{suggestion.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

Add to your navbar or header:

```tsx
// In your layout or header component
import { SearchBar } from "@/components/features/search/SearchBar";

<header className="border-b">
  <div className="container flex h-16 items-center gap-4">
    <Logo />
    <SearchBar />
    <Navigation />
  </div>
</header>
```

---

## 🧪 Step 6: Test the Implementation

### 1. Test the Search API

```bash
# Terminal test
curl "http://localhost:3000/api/search/products?q=tomato"
curl "http://localhost:3000/api/search/suggestions?q=tom"
```

### 2. Create a Test Page

```tsx
// src/app/test-search/page.tsx
import { SearchFilters } from "@/components/features/search/SearchFilters";
import { SearchBar } from "@/components/features/search/SearchBar";
import {
  ProductGridSkeleton,
  FilterPanelSkeleton,
  SearchBarSkeleton,
} from "@/components/ui/skeleton";

export default function TestSearchPage() {
  return (
    <div className="container space-y-8 py-8">
      <h1 className="text-3xl font-bold">Search Components Test</h1>

      {/* Test Search Bar */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Search Bar</h2>
        <SearchBar />
      </section>

      {/* Test Skeletons */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Loading States</h2>
        <div className="space-y-8">
          <div>
            <h3 className="mb-2 text-sm font-medium">Product Grid Skeleton</h3>
            <ProductGridSkeleton count={4} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Filter Panel Skeleton</h3>
            <FilterPanelSkeleton />
          </div>
        </div>
      </section>

      {/* Test Filters */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Search Filters</h2>
        <SearchFilters
          filters={{}}
          onFiltersChange={(filters) => console.log(filters)}
          availableCategories={[
            { label: "Vegetables", value: "veg", count: 42 },
            { label: "Fruits", value: "fruit", count: 28 },
          ]}
          availableFarms={[
            { label: "Green Valley Farm", value: "farm1", count: 15 },
            { label: "Sunny Acres", value: "farm2", count: 23 },
          ]}
          priceRange={{ min: 0, max: 100 }}
        />
      </section>
    </div>
  );
}
```

Visit: `http://localhost:3000/test-search`

---

## 🎨 Step 7: Customize Styling (Optional)

### Update Tailwind Config for Animations

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite",
      },
    },
  },
};
```

---

## 🔌 Step 8: Integration with Existing Components

### Add Search Link to Navigation

```tsx
// In your navigation component
<nav>
  <Link href="/products/search">
    <Search className="mr-2 h-4 w-4" />
    Search Products
  </Link>
</nav>
```

### Add Quick Search to Homepage

```tsx
// In your homepage
import { SearchBar } from "@/components/features/search/SearchBar";

<section className="hero">
  <h1>Find Fresh Local Products</h1>
  <SearchBar />
</section>
```

---

## 📊 Step 9: Add Seasonal Badges (Optional)

Create a seasonal badge component:

```tsx
// src/components/ui/seasonal-badge.tsx
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { getCurrentSeason } from "@/lib/utils/search.utils";

export function SeasonalBadge() {
  const season = getCurrentSeason();
  
  const seasonColors = {
    SPRING: "bg-green-500",
    SUMMER: "bg-yellow-500",
    FALL: "bg-orange-500",
    WINTER: "bg-blue-500",
  };

  return (
    <Badge variant="outline" className={seasonColors[season]}>
      <Calendar className="mr-1 h-3 w-3" />
      {season}
    </Badge>
  );
}
```

---

## ✅ Verification Checklist

- [ ] All files from Run 2 are in place
- [ ] Database schema includes required fields and indexes
- [ ] Search API returns results (`/api/search/products`)
- [ ] Suggestions API returns data (`/api/search/suggestions`)
- [ ] Search page renders without errors
- [ ] Filters work and update URL
- [ ] Price range slider functions correctly
- [ ] Skeletons show during loading
- [ ] Pagination works
- [ ] Search bar with autocomplete functions
- [ ] Mobile responsive design works

---

## 🐛 Troubleshooting

### Issue: "database is not defined"

**Solution**: Ensure you're importing from the canonical location:

```tsx
import { database } from "@/lib/database";
```

### Issue: Filters not updating

**Solution**: Make sure you're using the callback correctly:

```tsx
<SearchFilters
  filters={filters}
  onFiltersChange={(newFilters) => setFilters(newFilters)}
  // NOT: onFiltersChange={setFilters}
/>
```

### Issue: Suggestions not showing

**Solution**: Check:
1. API is returning data
2. `showSuggestions` state is true
3. CSS z-index is high enough
4. Dropdown is not hidden by overflow

### Issue: Skeleton animation not working

**Solution**: Add Tailwind animation to config (see Step 7)

### Issue: TypeScript errors

**Solution**: Ensure types are imported:

```tsx
import type { ProductSearchFilters } from "@/types/search";
```

---

## 🚀 Performance Tips

1. **Enable Response Caching**:
```tsx
export const revalidate = 60; // Cache for 60 seconds
```

2. **Use React Query** (Coming in Run 3):
```tsx
const { data, isLoading } = useQuery(
  ['products', filters],
  () => fetchProducts(filters)
);
```

3. **Add Indexes to Database** (if not already):
```sql
CREATE INDEX idx_products_name ON Product(name);
CREATE INDEX idx_products_price ON Product(price);
CREATE INDEX idx_products_stock ON Product(stockQuantity);
```

---

## 🎯 Next Steps

Once Run 2 is installed:

1. ✅ Test all search functionality
2. ✅ Customize styling to match your brand
3. ✅ Add product cards if not already built
4. ✅ Implement pagination component
5. ➡️ **Proceed to Run 3**: React Query Integration

---

## 📚 Additional Resources

- [Search Types Reference](../src/types/search.ts)
- [Search Utils Reference](../src/lib/utils/search.utils.ts)
- [API Documentation](./RUN_2_SEARCH_DISCOVERY_COMPLETE.md)
- [Prisma Query Optimization](https://www.prisma.io/docs/guides/performance-and-optimization)

---

## ✨ You're Done!

Your Farmers Market Platform now has:
- ✅ Full-text product search
- ✅ Advanced filtering (8 filter types)
- ✅ Autocomplete suggestions
- ✅ Pagination
- ✅ Loading states
- ✅ Seasonal awareness
- ✅ Mobile responsive design

**Next**: Proceed to **Run 3: React Query Integration** for enhanced data fetching and caching!

---

*Divine Agricultural Search Consciousness Activated* 🌾🔍✨