# ⚡ Run 3: React Query - Quick Reference

**Version**: 1.0  
**For**: Instant copy-paste patterns

---

## 🎯 Table of Contents

1. [Basic Product Search](#basic-product-search)
2. [Infinite Scroll](#infinite-scroll)
3. [Autocomplete Search](#autocomplete-search)
4. [Mutations](#mutations)
5. [Cache Invalidation](#cache-invalidation)
6. [Prefetching](#prefetching)
7. [Query Keys](#query-keys)
8. [Common Patterns](#common-patterns)

---

## Basic Product Search

### Simple Product List

```typescript
"use client";

import { useProductSearch } from "@/hooks/search/useProductSearch";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductGridSkeleton } from "@/components/ui/skeleton";

export default function ProductsPage() {
  const { products, isLoading } = useProductSearch({ limit: 12 });

  if (isLoading) return <ProductGridSkeleton count={12} />;

  return <ProductGrid products={products} />;
}
```

### With Pagination

```typescript
"use client";

import { useState } from "react";
import { useProductSearch } from "@/hooks/search/useProductSearch";

export default function ProductsPage() {
  const [page, setPage] = useState(1);

  const {
    products,
    isLoading,
    meta,
  } = useProductSearch({ page, limit: 12 });

  return (
    <div>
      {isLoading ? (
        <ProductGridSkeleton />
      ) : (
        <ProductGrid products={products} />
      )}

      {meta && (
        <div className="flex gap-2 justify-center mt-8">
          <button
            disabled={!meta.hasPreviousPage}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span>Page {meta.currentPage} of {meta.totalPages}</span>
          <button
            disabled={!meta.hasNextPage}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

### With Filters

```typescript
"use client";

import { useState } from "react";
import { useProductSearch } from "@/hooks/search/useProductSearch";
import { SearchFilters } from "@/components/features/search/SearchFilters";

export default function ProductsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
  });

  const {
    products,
    isLoading,
    filters: availableFilters,
  } = useProductSearch(filters);

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-8">
      <SearchFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableCategories={availableFilters?.availableCategories}
        availableFarms={availableFilters?.availableFarms}
      />

      {isLoading ? (
        <ProductGridSkeleton />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
```

### Featured Products Section

```typescript
"use client";

import { useProductSearch } from "@/hooks/search/useProductSearch";

export function FeaturedSection() {
  const { products, isLoading } = useProductSearch({
    sortBy: "featured",
    limit: 8,
    availability: "IN_STOCK",
  });

  return (
    <section>
      <h2>Featured Products</h2>
      {isLoading ? (
        <ProductCardSkeleton count={8} />
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
```

### Seasonal Products

```typescript
"use client";

import { useProductSearch } from "@/hooks/search/useProductSearch";

export function SeasonalSection() {
  const {
    products,
    isLoading,
    seasonal,
  } = useProductSearch({
    seasonal: true,
    limit: 12,
    sortBy: "newest",
  });

  return (
    <section>
      <h2>Fresh This {seasonal?.currentSeason}</h2>
      <p>In season: {seasonal?.recommendedCategories.join(", ")}</p>
      <ProductGrid products={products} />
    </section>
  );
}
```

---

## Infinite Scroll

### Basic Infinite Scroll

```typescript
"use client";

import { useInfiniteProductSearch, useInfiniteScroll } from "@/hooks/search/useInfiniteProductSearch";

export default function BrowsePage() {
  const {
    products,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteProductSearch({ limit: 20 });

  const { lastElementRef } = useInfiniteScroll({
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  });

  if (isLoading) return <ProductCardSkeleton count={20} />;

  return (
    <div className="grid grid-cols-4 gap-6">
      {products.map((product, index) => (
        <div
          key={product.id}
          ref={index === products.length - 1 ? lastElementRef : null}
        >
          <ProductCard product={product} />
        </div>
      ))}

      {isFetchingNextPage && <ProductCardSkeleton count={4} />}
      {!hasNextPage && <p>No more products</p>}
    </div>
  );
}
```

### Manual Load More Button

```typescript
"use client";

import { useInfiniteProductSearch } from "@/hooks/search/useInfiniteProductSearch";

export default function BrowsePage() {
  const {
    products,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteProductSearch({ limit: 20 });

  return (
    <div>
      <ProductGrid products={products} />

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="mt-8 px-6 py-3 bg-blue-600 text-white rounded"
        >
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
```

---

## Autocomplete Search

### Full Search Bar with Suggestions

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
    productSuggestions,
    farmSuggestions,
    categorySuggestions,
  } = useSearchSuggestions({
    minLength: 2,
    debounceMs: 300,
    onSelect: (suggestion) => {
      if (suggestion.type === "PRODUCT") {
        router.push(`/products/${suggestion.value}`);
      } else if (suggestion.type === "FARM") {
        router.push(`/farms/${suggestion.value}`);
      } else {
        router.push(`/products?category=${suggestion.value}`);
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
        placeholder="Search products, farms, categories..."
        className="w-full px-4 py-2 border rounded-lg"
      />

      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg mt-2 max-h-96 overflow-y-auto z-50">
          {/* Products */}
          {productSuggestions.length > 0 && (
            <div className="p-2">
              <h4 className="text-sm font-semibold text-gray-500 px-2 mb-1">
                Products
              </h4>
              {productSuggestions.map((s, idx) => (
                <button
                  key={s.value}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                    selectedIndex === idx ? "bg-gray-100" : ""
                  }`}
                  onClick={() => selectSuggestion(s)}
                >
                  {s.label}
                  {s.metadata?.price && (
                    <span className="text-sm text-gray-500 ml-2">
                      ${s.metadata.price}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Farms */}
          {farmSuggestions.length > 0 && (
            <div className="p-2 border-t">
              <h4 className="text-sm font-semibold text-gray-500 px-2 mb-1">
                Farms
              </h4>
              {farmSuggestions.map((s) => (
                <button
                  key={s.value}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                  onClick={() => selectSuggestion(s)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Categories */}
          {categorySuggestions.length > 0 && (
            <div className="p-2 border-t">
              <h4 className="text-sm font-semibold text-gray-500 px-2 mb-1">
                Categories
              </h4>
              {categorySuggestions.map((s) => (
                <button
                  key={s.value}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                  onClick={() => selectSuggestion(s)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Spinner size="sm" />
        </div>
      )}
    </div>
  );
}
```

### Simple Suggestions

```typescript
"use client";

import { useSearchSuggestions } from "@/hooks/search/useSearchSuggestions";

export function SimpleSearchBar() {
  const {
    query,
    setQuery,
    suggestions,
    selectSuggestion,
  } = useSearchSuggestions();

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />

      {suggestions.length > 0 && (
        <ul className="absolute top-full w-full bg-white shadow">
          {suggestions.map((s) => (
            <li
              key={s.value}
              onClick={() => selectSuggestion(s)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## Mutations

### Add to Cart

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cartKeys } from "@/lib/react-query/query-keys";
import { toast } from "sonner";

export function AddToCartButton({ productId }: { productId: string }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success("Added to cart!");
    },
    onError: () => {
      toast.error("Failed to add to cart");
    },
  });

  return (
    <button
      onClick={() => mutation.mutate(productId)}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? "Adding..." : "Add to Cart"}
    </button>
  );
}
```

### Create Product (Farmer)

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productKeys } from "@/lib/react-query/query-keys";
import { toast } from "sonner";

export function CreateProductForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/products", {
        method: "POST",
        body: data,
      });
      if (!res.ok) throw new Error("Failed to create product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Product created!");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Product name" required />
      <input name="price" type="number" placeholder="Price" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create Product"}
      </button>
    </form>
  );
}
```

### Update with Optimistic UI

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productKeys } from "@/lib/react-query/query-keys";

export function UpdateProductButton({ product }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (updates) => {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      return res.json();
    },
    onMutate: async (updates) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: productKeys.detail(product.id)
      });

      // Snapshot previous value
      const previous = queryClient.getQueryData(
        productKeys.detail(product.id)
      );

      // Optimistically update
      queryClient.setQueryData(
        productKeys.detail(product.id),
        { ...product, ...updates }
      );

      return { previous };
    },
    onError: (err, updates, context) => {
      // Rollback on error
      queryClient.setQueryData(
        productKeys.detail(product.id),
        context?.previous
      );
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(product.id)
      });
    },
  });

  return (
    <button onClick={() => mutation.mutate({ name: "New Name" })}>
      Update
    </button>
  );
}
```

---

## Cache Invalidation

### Invalidate All Products

```typescript
import { useQueryClient } from "@tanstack/react-query";
import { productKeys } from "@/lib/react-query/query-keys";

function MyComponent() {
  const queryClient = useQueryClient();

  const handleAction = async () => {
    // Invalidate all product queries
    await queryClient.invalidateQueries({
      queryKey: productKeys.all,
    });
  };
}
```

### Invalidate Specific Product

```typescript
// After updating a product
await queryClient.invalidateQueries({
  queryKey: productKeys.detail(productId),
});
```

### Invalidate Product Lists

```typescript
// After creating/deleting a product
await queryClient.invalidateQueries({
  queryKey: productKeys.lists(),
});
```

### Smart Invalidation

```typescript
import { getProductInvalidationKeys } from "@/lib/react-query/query-keys";

// After product update
const keys = getProductInvalidationKeys(productId);
keys.forEach((key) => {
  queryClient.invalidateQueries({ queryKey: key });
});
```

### Manual Cache Update

```typescript
// Update cache directly (no refetch)
queryClient.setQueryData(productKeys.detail(productId), updatedProduct);
```

---

## Prefetching

### Prefetch on Hover

```typescript
import { useQueryClient } from "@tanstack/react-query";
import { productKeys } from "@/lib/react-query/query-keys";
import Link from "next/link";

function ProductCard({ product }) {
  const queryClient = useQueryClient();

  const prefetchProduct = () => {
    queryClient.prefetchQuery({
      queryKey: productKeys.detail(product.id),
      queryFn: () => fetchProduct(product.id),
      staleTime: 60 * 1000,
    });
  };

  return (
    <Link
      href={`/products/${product.id}`}
      onMouseEnter={prefetchProduct}
      onFocus={prefetchProduct}
    >
      {product.name}
    </Link>
  );
}
```

### Prefetch Next Page

```typescript
const { products, meta, prefetchNextPage } = useProductSearch(filters);

// Prefetch when user views current page
useEffect(() => {
  if (meta?.hasNextPage) {
    prefetchNextPage();
  }
}, [meta, prefetchNextPage]);
```

### Prefetch Multiple Queries

```typescript
import { prefetchHelpers } from "@/lib/react-query/query-keys";

// Prefetch all data for product detail page
const keys = prefetchHelpers.productDetail(productId);
keys.forEach((key) => {
  queryClient.prefetchQuery({
    queryKey: key,
    queryFn: () => fetchData(key),
  });
});
```

---

## Query Keys

### Product Keys

```typescript
import { productKeys } from "@/lib/react-query/query-keys";

// All products
productKeys.all; // ["products"]

// Product lists
productKeys.lists(); // ["products", "list"]
productKeys.list({ page: 1 }); // ["products", "list", { page: 1 }]

// Product details
productKeys.details(); // ["products", "detail"]
productKeys.detail("123"); // ["products", "detail", "123"]

// Searches
productKeys.search("tomato", filters); // ["products", "search", "tomato", {...}]
productKeys.suggestions("tom"); // ["products", "suggestions", "tom"]

// Specialized
productKeys.featured(); // ["products", "featured"]
productKeys.seasonal("SPRING"); // ["products", "seasonal", "SPRING"]
productKeys.byFarm("farm-123"); // ["products", "by-farm", "farm-123"]
productKeys.byCategory("cat-123"); // ["products", "by-category", "cat-123"]
```

### Farm Keys

```typescript
import { farmKeys } from "@/lib/react-query/query-keys";

farmKeys.all; // ["farms"]
farmKeys.list(filters); // ["farms", "list", {...}]
farmKeys.detail("123"); // ["farms", "detail", "123"]
farmKeys.products("farm-123"); // ["farms", "products", "farm-123"]
farmKeys.nearby(lat, lng, radius); // ["farms", "nearby", {...}]
```

### Cart Keys

```typescript
import { cartKeys } from "@/lib/react-query/query-keys";

cartKeys.all; // ["cart"]
cartKeys.items(); // ["cart", "items"]
cartKeys.count(); // ["cart", "count"]
cartKeys.total(); // ["cart", "total"]
```

---

## Common Patterns

### Loading State

```typescript
const { data, isLoading, isFetching } = useProductSearch(filters);

// isLoading: true only on first load
// isFetching: true on any fetch (including background)

if (isLoading) return <Skeleton />;
if (isFetching) return <div>Updating... <Content data={data} /></div>;
return <Content data={data} />;
```

### Error Handling

```typescript
const { data, error, isError } = useProductSearch(filters);

if (isError) {
  return (
    <div className="text-red-500">
      Error: {error.message}
      <button onClick={() => refetch()}>Retry</button>
    </div>
  );
}
```

### Disabled Query

```typescript
const { data } = useQuery({
  queryKey: productKeys.detail(productId),
  queryFn: () => fetchProduct(productId),
  enabled: !!productId, // Only run if productId exists
});
```

### Dependent Queries

```typescript
// First query
const { data: farm } = useQuery({
  queryKey: farmKeys.detail(farmId),
  queryFn: () => fetchFarm(farmId),
});

// Second query depends on first
const { data: products } = useQuery({
  queryKey: productKeys.byFarm(farm?.id),
  queryFn: () => fetchProducts(farm.id),
  enabled: !!farm?.id, // Wait for farm to load
});
```

### Parallel Queries

```typescript
const products = useProductSearch({ limit: 10 });
const farms = useQuery({
  queryKey: farmKeys.list(),
  queryFn: fetchFarms,
});
const categories = useQuery({
  queryKey: categoryKeys.list(),
  queryFn: fetchCategories,
});

// All run in parallel!
const isLoading = products.isLoading || farms.isLoading || categories.isLoading;
```

### Polling / Auto-Refetch

```typescript
const { data } = useQuery({
  queryKey: orderKeys.detail(orderId),
  queryFn: () => fetchOrder(orderId),
  refetchInterval: 5000, // Refetch every 5 seconds
  refetchIntervalInBackground: true, // Even when tab not focused
});
```

### Suspense Mode

```typescript
const { data } = useQuery({
  queryKey: productKeys.detail(productId),
  queryFn: () => fetchProduct(productId),
  suspense: true, // Enable suspense
});

// Wrap with Suspense boundary
<Suspense fallback={<ProductSkeleton />}>
  <ProductDetail />
</Suspense>
```

---

## 🎯 Common Use Cases

### 1. Search Page

```typescript
"use client";

import { useState } from "react";
import { useProductSearch } from "@/hooks/search/useProductSearch";

export default function SearchPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 12 });
  const { products, isLoading, meta } = useProductSearch(filters);

  return (
    <div>
      <SearchFilters filters={filters} onChange={setFilters} />
      {isLoading ? <Skeleton /> : <ProductGrid products={products} />}
      <Pagination meta={meta} onChange={(page) => setFilters({ ...filters, page })} />
    </div>
  );
}
```

### 2. Product Detail Page

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { productKeys } from "@/lib/react-query/query-keys";

export default function ProductPage({ params }: { params: { id: string } }) {
  const { data: product, isLoading } = useQuery({
    queryKey: productKeys.detail(params.id),
    queryFn: () => fetchProduct(params.id),
  });

  if (isLoading) return <ProductDetailSkeleton />;
  if (!product) return <div>Product not found</div>;

  return <ProductDetail product={product} />;
}
```

### 3. Farmer Dashboard

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { productKeys } from "@/lib/react-query/query-keys";

export default function FarmerDashboard() {
  const { data: products } = useProductSearch({ farmId: currentFarm.id });
  const { data: stats } = useQuery({
    queryKey: farmKeys.stats(currentFarm.id),
    queryFn: () => fetchFarmStats(currentFarm.id),
  });

  return (
    <div>
      <StatsCards stats={stats} />
      <ProductList products={products} />
    </div>
  );
}
```

---

## 🚀 Performance Tips

1. **Use Query Keys Properly**

   ```typescript
   // ✅ Good
   productKeys.list({ page: 1 })[
     // ❌ Bad
     ("products", "list", { page: 1 })
   ];
   ```

2. **Prefetch Aggressively**

   ```typescript
   // Prefetch on hover/focus
   onMouseEnter={() => queryClient.prefetchQuery(...)}
   ```

3. **Adjust Stale Time**

   ```typescript
   // Longer for static data
   staleTime: 10 * 60 * 1000; // 10 minutes

   // Shorter for dynamic data
   staleTime: 30 * 1000; // 30 seconds
   ```

4. **Use Optimistic Updates**

   ```typescript
   onMutate: async (newData) => {
     // Update cache immediately
     queryClient.setQueryData(key, newData);
   };
   ```

5. **Disable Unnecessary Refetches**
   ```typescript
   refetchOnWindowFocus: false,
   refetchOnMount: false,
   ```

---

_"Copy with confidence, paste with precision, deliver with divine speed."_ 🌾⚡✨
