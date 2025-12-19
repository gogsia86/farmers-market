# 🚀 Run 3: React Query Integration - Installation Guide

**Version**: 1.0  
**Last Updated**: 2024  
**Prerequisites**: Run 1 & Run 2 Complete

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Provider Setup](#provider-setup)
4. [Hook Integration](#hook-integration)
5. [Component Examples](#component-examples)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)
8. [Next Steps](#next-steps)

---

## Prerequisites

### Required

- ✅ Node.js 18+ installed
- ✅ Run 1: Core Infrastructure complete
- ✅ Run 2: Search & Discovery complete
- ✅ Next.js 15 with App Router
- ✅ TypeScript configured
- ✅ Prisma database setup

### Verify Prerequisites

```bash
# Check Node version
node --version  # Should be 18+

# Check if React Query is installed
npm list @tanstack/react-query  # Should show ^5.x.x

# Verify search API exists
ls src/app/api/search/products/route.ts
ls src/app/api/search/suggestions/route.ts

# Verify search utilities exist
ls src/lib/utils/search.utils.ts
ls src/types/search.ts
```

---

## Installation Steps

### Step 1: Verify Dependencies

React Query should already be installed from initial setup:

```bash
# Check if installed
npm list @tanstack/react-query

# If not installed, add it
npm install @tanstack/react-query@latest
npm install @tanstack/react-query-devtools@latest
```

Expected output:

```
@tanstack/react-query@5.x.x
@tanstack/react-query-devtools@5.x.x
```

### Step 2: Create Directory Structure

```bash
# Create React Query directory
mkdir -p src/lib/react-query

# Create search hooks directory
mkdir -p src/hooks/search

# Verify structure
ls -R src/lib/react-query
ls -R src/hooks/search
```

Expected structure:

```
src/
├── lib/
│   └── react-query/
│       ├── provider.tsx       (NEW)
│       └── query-keys.ts      (NEW)
└── hooks/
    └── search/
        ├── useProductSearch.ts            (NEW)
        ├── useInfiniteProductSearch.ts    (NEW)
        └── useSearchSuggestions.ts        (NEW)
```

### Step 3: Create React Query Provider

Create `src/lib/react-query/provider.tsx`:

```typescript
"use client";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

const CACHE_CONFIG = {
  cacheTime: 5 * 60 * 1000,
  staleTime: 1 * 60 * 1000,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  retry: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: CACHE_CONFIG.cacheTime,
        staleTime: CACHE_CONFIG.staleTime,
        refetchOnWindowFocus: CACHE_CONFIG.refetchOnWindowFocus,
        refetchOnReconnect: CACHE_CONFIG.refetchOnReconnect,
        refetchOnMount: true,
        retry: CACHE_CONFIG.retry,
        retryDelay: CACHE_CONFIG.retryDelay,
        throwOnError: false,
      },
      mutations: {
        retry: 2,
        retryDelay: 1000,
        throwOnError: false,
      },
    },
  });
}

interface ReactQueryProviderProps {
  children: ReactNode;
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}

export const defaultQueryConfig = CACHE_CONFIG;
```

### Step 4: Create Query Keys Factory

Create `src/lib/react-query/query-keys.ts`:

```typescript
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters?: any) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  search: (query: string, filters?: any) =>
    [...productKeys.all, "search", query, filters] as const,
  suggestions: (query: string) =>
    [...productKeys.all, "suggestions", query] as const,
  featured: () => [...productKeys.all, "featured"] as const,
  seasonal: (season: string) =>
    [...productKeys.all, "seasonal", season] as const,
};

export const farmKeys = {
  all: ["farms"] as const,
  lists: () => [...farmKeys.all, "list"] as const,
  list: (filters?: any) => [...farmKeys.lists(), filters] as const,
  details: () => [...farmKeys.all, "detail"] as const,
  detail: (id: string) => [...farmKeys.details(), id] as const,
};

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: () => [...categoryKeys.lists()] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// Helper to invalidate product queries
export function getProductInvalidationKeys(productId?: string) {
  const keys = [productKeys.all, productKeys.lists(), productKeys.featured()];
  if (productId) {
    keys.push(productKeys.detail(productId));
  }
  return keys;
}
```

### Step 5: Create Product Search Hook

Create `src/hooks/search/useProductSearch.ts`:

```typescript
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { productKeys } from "@/lib/react-query/query-keys";

interface ProductSearchFilters {
  query?: string;
  categoryId?: string;
  farmId?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: "IN_STOCK" | "OUT_OF_STOCK" | "ALL";
  organic?: boolean;
  seasonal?: boolean;
  sortBy?: string;
  page?: number;
  limit?: number;
}

async function fetchProducts(filters: ProductSearchFilters) {
  const params = new URLSearchParams();

  if (filters.query) params.append("q", filters.query);
  if (filters.categoryId) params.append("category", filters.categoryId);
  if (filters.farmId) params.append("farm", filters.farmId);
  if (filters.minPrice !== undefined)
    params.append("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined)
    params.append("maxPrice", String(filters.maxPrice));
  if (filters.availability) params.append("availability", filters.availability);
  if (filters.organic !== undefined)
    params.append("organic", String(filters.organic));
  if (filters.seasonal !== undefined)
    params.append("seasonal", String(filters.seasonal));
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.page) params.append("page", String(filters.page));
  if (filters.limit) params.append("limit", String(filters.limit));

  const response = await fetch(`/api/search/products?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Product search failed: ${response.statusText}`);
  }

  return response.json();
}

export function useProductSearch(filters: ProductSearchFilters = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProducts(filters),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const prefetchNextPage = useCallback(async () => {
    if (!data?.meta || !data.meta.hasNextPage) return;

    const nextPageFilters = {
      ...filters,
      page: data.meta.currentPage + 1,
    };

    await queryClient.prefetchQuery({
      queryKey: productKeys.list(nextPageFilters),
      queryFn: () => fetchProducts(nextPageFilters),
      staleTime: 60 * 1000,
    });
  }, [data?.meta, filters, queryClient]);

  const products = useMemo(() => data?.data ?? [], [data]);
  const isEmpty = useMemo(
    () => products.length === 0 && !isLoading,
    [products, isLoading],
  );
  const hasResults = useMemo(() => products.length > 0, [products]);

  return {
    products,
    isLoading,
    isError,
    error: error as Error | null,
    isFetching,
    meta: data?.meta ?? null,
    filters: data?.filters ?? null,
    seasonal: data?.seasonal ?? null,
    refetch: () => {
      refetch();
    },
    prefetchNextPage,
    isEmpty,
    hasResults,
  };
}
```

---

## Provider Setup

### Update Root Layout

Edit `src/app/layout.tsx`:

```typescript
import { ReactQueryProvider } from "@/lib/react-query/provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
```

**Important**: Make sure `ReactQueryProvider` wraps all client components but is inside the `<body>` tag.

### Verify Provider

1. Start dev server:

```bash
npm run dev
```

2. Open http://localhost:3000

3. Check browser console - should see React Query DevTools button in bottom-right (development only)

4. Click DevTools button - should see query cache (empty initially)

---

## Hook Integration

### Example 1: Basic Product Search

Create `src/app/(public)/products/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useProductSearch } from "@/hooks/search/useProductSearch";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { SearchFilters } from "@/components/features/search/SearchFilters";

export default function ProductsPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 12 });

  const {
    products,
    isLoading,
    meta,
    filters: availableFilters,
  } = useProductSearch(filters);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <SearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableCategories={availableFilters?.availableCategories}
          availableFarms={availableFilters?.availableFarms}
        />

        <div>
          {isLoading ? (
            <ProductGridSkeleton count={12} />
          ) : (
            <>
              <ProductGrid products={products} />

              {meta && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    disabled={!meta.hasPreviousPage}
                    onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span className="px-4 py-2">
                    Page {meta.currentPage} of {meta.totalPages}
                  </span>

                  <button
                    disabled={!meta.hasNextPage}
                    onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Example 2: Featured Products Section

Create `src/components/home/FeaturedSection.tsx`:

```typescript
"use client";

import { useProductSearch } from "@/hooks/search/useProductSearch";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/skeleton";

export function FeaturedSection() {
  const { products, isLoading } = useProductSearch({
    sortBy: "featured",
    limit: 8,
    availability: "IN_STOCK",
  });

  return (
    <section className="py-16">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8">Featured Products</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <ProductCardSkeleton count={8} />
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
```

---

## Component Examples

### Search Bar with Autocomplete

Create `src/components/layout/SearchBar.tsx`:

```typescript
"use client";

import { useRouter } from "next/navigation";
import { useSearchSuggestions } from "@/hooks/search/useSearchSuggestions";

export function SearchBar() {
  const router = useRouter();

  const {
    query,
    setQuery,
    suggestions,
    isLoading,
    selectSuggestion,
    selectedIndex,
    selectNext,
    selectPrevious,
    selectCurrent,
  } = useSearchSuggestions({
    minLength: 2,
    debounceMs: 300,
    onSelect: (suggestion) => {
      if (suggestion.type === "PRODUCT") {
        router.push(`/products/${suggestion.value}`);
      }
    }
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectNext();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectPrevious();
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectCurrent();
    }
  };

  return (
    <div className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search products..."
        className="w-full px-4 py-2 border rounded-lg"
      />

      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg mt-2 max-h-96 overflow-y-auto z-50">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.value}`}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                selectedIndex === index ? "bg-gray-100" : ""
              }`}
              onClick={() => selectSuggestion(suggestion)}
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}

      {isLoading && <span className="absolute right-3 top-3">Loading...</span>}
    </div>
  );
}
```

---

## Verification

### Step 1: Check Provider

```bash
# Start dev server
npm run dev

# Open in browser
open http://localhost:3000
```

**Expected**:

- No console errors
- React Query DevTools button visible (bottom-right)
- DevTools show empty cache initially

### Step 2: Test Product Search

1. Navigate to `/products` or create test page
2. Open React Query DevTools
3. Should see query keys like `["products", "list", {...filters}]`
4. Click on query to see cached data
5. Filter products - new queries should appear

### Step 3: Test Caching

1. Navigate to products page
2. Wait for products to load
3. Navigate away
4. Navigate back to products
5. Products should load instantly from cache
6. DevTools should show "cached" status

### Step 4: Test Background Refetch

1. Load products page
2. Wait 1 minute (staleTime)
3. Switch to another window/tab
4. Switch back
5. Should see background refetch in DevTools
6. UI updates automatically if data changed

### Step 5: Test Prefetching

1. Navigate to products page
2. Go to page 2
3. Check DevTools - page 3 should be prefetched
4. Go to page 3 - should load instantly

---

## Troubleshooting

### Issue: "QueryClient not found"

**Cause**: Provider not wrapping components

**Solution**:

```typescript
// Make sure ReactQueryProvider is in layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ReactQueryProvider>  {/* ← Must wrap children */}
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
```

### Issue: "useQuery must be called in Client Component"

**Cause**: Missing `"use client"` directive

**Solution**:

```typescript
// Add to top of file using useQuery
"use client";

import { useQuery } from "@tanstack/react-query";
// ... rest of file
```

### Issue: Queries not caching

**Cause**: Query keys not stable

**Solution**:

```typescript
// ❌ BAD - new object every render
const { data } = useQuery({
  queryKey: ["products", { page: 1 }], // New object!
  // ...
});

// ✅ GOOD - use query key factory
const { data } = useQuery({
  queryKey: productKeys.list({ page: 1 }), // Stable reference
  // ...
});
```

### Issue: Stale data showing

**Cause**: staleTime too long

**Solution**:

```typescript
// Reduce staleTime for frequently changing data
const { data } = useQuery({
  queryKey: productKeys.list(filters),
  queryFn: () => fetchProducts(filters),
  staleTime: 30 * 1000, // 30 seconds instead of 1 minute
});
```

### Issue: Too many API calls

**Cause**: Missing query key or refetching too often

**Solution**:

```typescript
// Check DevTools for duplicate queries
// Ensure stable query keys
// Adjust refetchOnWindowFocus if needed
const { data } = useQuery({
  // ...
  refetchOnWindowFocus: false, // Disable if too frequent
});
```

---

## Next Steps

### 1. Add Infinite Scroll

See full implementation in `src/hooks/search/useInfiniteProductSearch.ts` (provided in completion files)

### 2. Add Search Suggestions

See full implementation in `src/hooks/search/useSearchSuggestions.ts` (provided in completion files)

### 3. Add Mutations

```typescript
// Example: Add to cart mutation
const mutation = useMutation({
  mutationFn: (productId: string) => addToCart(productId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: cartKeys.all });
    toast.success("Added to cart!");
  },
});
```

### 4. Add Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: updateProduct,
  onMutate: async (newProduct) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({
      queryKey: productKeys.detail(newProduct.id),
    });

    // Snapshot previous value
    const previous = queryClient.getQueryData(
      productKeys.detail(newProduct.id),
    );

    // Optimistically update
    queryClient.setQueryData(productKeys.detail(newProduct.id), newProduct);

    return { previous };
  },
  onError: (err, newProduct, context) => {
    // Rollback on error
    queryClient.setQueryData(
      productKeys.detail(newProduct.id),
      context?.previous,
    );
  },
});
```

### 5. Monitor Performance

- Use React Query DevTools to monitor cache size
- Check Network tab for API calls
- Measure Time to Interactive (TTI)
- Monitor memory usage

---

## 📚 Additional Resources

- **React Query Docs**: https://tanstack.com/query/latest/docs/react/overview
- **Query Keys Guide**: https://tanstack.com/query/latest/docs/react/guides/query-keys
- **Caching Examples**: https://tanstack.com/query/latest/docs/react/guides/caching
- **Run 3 Complete Docs**: `docs/✅_RUN_3_COMPLETE.md`
- **Quick Reference**: `docs/RUN_3_QUICK_REFERENCE.md`

---

## ✅ Installation Complete

You should now have:

- ✅ React Query provider configured
- ✅ Query key factory created
- ✅ Product search hook working
- ✅ DevTools accessible
- ✅ Caching operational
- ✅ Example components created

**Next**: Explore infinite scroll, autocomplete, and advanced features!

---

_"Install with divine precision, configure with agricultural consciousness, deliver with quantum efficiency."_ 🌾⚡✨
