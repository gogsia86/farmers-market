# 🚀 Run 2: Quick Reference Guide

**Divine Agricultural Search Consciousness - Copy-Paste Patterns**

---

## 📋 Quick Start (5 Minutes)

### 1. Basic Search API Call

```typescript
// Fetch products with filters
const response = await fetch(
  "/api/search/products?q=tomato&category=vegetables&minPrice=5&maxPrice=20&availability=IN_STOCK",
);
const { success, data, filters, seasonal } = await response.json();
```

### 2. Use Search Filters Component

```tsx
import { SearchFilters } from "@/components/features/search/SearchFilters";

<SearchFilters
  filters={filters}
  onFiltersChange={setFilters}
  availableCategories={categories}
  availableFarms={farms}
  priceRange={{ min: 0, max: 100 }}
/>;
```

### 3. Show Loading Skeleton

```tsx
import { ProductGridSkeleton } from "@/components/ui/skeleton";

{
  isLoading ? (
    <ProductGridSkeleton count={12} />
  ) : (
    <ProductGrid products={products} />
  );
}
```

---

## 🔍 Common Patterns

### Complete Search Page (Client Component)

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchFilters } from "@/components/features/search/SearchFilters";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import {
  parseSearchParams,
  filtersToSearchParams,
} from "@/lib/utils/search.utils";
import type { ProductSearchFilters } from "@/types/search";

export default function ProductSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<ProductSearchFilters>(() =>
    parseSearchParams(searchParams),
  );
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    async function search() {
      setLoading(true);
      const params = filtersToSearchParams(filters);
      const res = await fetch(`/api/search/products?${params}`);
      const data = await res.json();
      setResults(data);
      setLoading(false);
    }
    search();
  }, [filters]);

  const handleFiltersChange = (newFilters: ProductSearchFilters) => {
    setFilters(newFilters);
    const params = filtersToSearchParams(newFilters);
    router.push(`/products/search?${params}`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Filters */}
        <aside>
          <SearchFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            availableCategories={results?.filters?.availableCategories}
            availableFarms={results?.filters?.availableFarms}
            priceRange={results?.filters?.priceRange}
          />
        </aside>

        {/* Results */}
        <main>
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results?.data?.data?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
```

---

## 🎯 Search Bar with Autocomplete

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { debounce } from "@/lib/utils/search.utils";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSuggestions = debounce(async (q: string) => {
    if (q.length < 2) return;
    const res = await fetch(
      `/api/search/suggestions?q=${encodeURIComponent(q)}`,
    );
    const data = await res.json();
    if (data.success) {
      setSuggestions(data.suggestions);
      setShowSuggestions(true);
    }
  }, 300);

  useEffect(() => {
    fetchSuggestions(query);
  }, [query]);

  return (
    <div className="relative w-full max-w-lg">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/products/search?q=${encodeURIComponent(query)}`);
        }}
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-9"
        />
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border bg-popover p-2 shadow-lg">
          {suggestions.map((s: any) => (
            <button
              key={s.value}
              onClick={() => router.push(`/products/${s.value}`)}
              className="w-full rounded p-2 text-left hover:bg-accent"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 📊 Utility Function Examples

### Build Search Query

```typescript
import { buildProductSearchQuery } from "@/lib/utils/search.utils";

const queryConfig = buildProductSearchQuery({
  query: "tomato",
  categoryId: "vegetables",
  minPrice: 5,
  maxPrice: 20,
  availability: "IN_STOCK",
  organic: true,
  sortBy: "PRICE_LOW_TO_HIGH",
  page: 1,
  limit: 12,
});

const products = await database.product.findMany(queryConfig);
```

### Parse URL Parameters

```typescript
import { parseSearchParams } from "@/lib/utils/search.utils";

// From URL: /products?q=tomato&category=veg&minPrice=5
const filters = parseSearchParams(searchParams);
// Returns: { query: "tomato", categoryId: "veg", minPrice: 5 }
```

### Convert Filters to URL

```typescript
import { filtersToSearchParams } from "@/lib/utils/search.utils";

const params = filtersToSearchParams(filters);
router.push(`/products?${params.toString()}`);
```

### Get Current Season

```typescript
import { getCurrentSeason, getSeasonalContext } from "@/lib/utils/search.utils";

const season = getCurrentSeason(); // "SPRING"
const context = getSeasonalContext(season);
// Returns: { currentSeason, recommendedCategories, seasonalProducts }
```

---

## 🎨 Loading Skeleton Patterns

### Product Grid Loading

```tsx
import { ProductGridSkeleton } from "@/components/ui/skeleton";

{
  isLoading ? <ProductGridSkeleton count={12} /> : <ProductGrid />;
}
```

### Dashboard Loading

```tsx
import { DashboardSkeleton } from "@/components/ui/skeleton";

{
  isLoading ? <DashboardSkeleton /> : <Dashboard />;
}
```

### Table Loading

```tsx
import { TableSkeleton } from "@/components/ui/skeleton";

{
  isLoading ? <TableSkeleton rows={10} columns={5} /> : <DataTable />;
}
```

### Custom Skeleton

```tsx
import { Skeleton } from "@/components/ui/skeleton";

<Skeleton className="h-12 w-12 rounded-full" />
<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-32 w-full" />
```

---

## 🔧 API Integration Patterns

### Simple GET Request

```typescript
const res = await fetch("/api/search/products?q=tomato");
const { success, data, filters, seasonal } = await res.json();
```

### Advanced POST Request

```typescript
const res = await fetch("/api/search/products", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    filters: {
      query: "tomato",
      categoryId: "vegetables",
      minPrice: 5,
      maxPrice: 20,
      availability: "IN_STOCK",
      organic: true,
      sortBy: "PRICE_LOW_TO_HIGH",
      page: 1,
      limit: 12,
    },
    includeOutOfStock: false,
    includeMetadata: true,
  }),
});
const data = await res.json();
```

### Autocomplete Suggestions

```typescript
const res = await fetch(
  `/api/search/suggestions?q=${encodeURIComponent(query)}&limit=10`,
);
const { success, suggestions, query: sanitizedQuery } = await res.json();
```

---

## 🧪 Testing Snippets

### Test Search API

```bash
# Basic search
curl "http://localhost:3000/api/search/products?q=tomato"

# With filters
curl "http://localhost:3000/api/search/products?q=tomato&category=veg&minPrice=5&maxPrice=20&organic=true"

# Suggestions
curl "http://localhost:3000/api/search/suggestions?q=tom"
```

### Component Test

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchFilters } from "@/components/features/search/SearchFilters";

describe("SearchFilters", () => {
  it("should update filters on category selection", async () => {
    const onFiltersChange = jest.fn();
    render(
      <SearchFilters
        filters={{}}
        onFiltersChange={onFiltersChange}
        availableCategories={[{ label: "Vegetables", value: "veg", count: 42 }]}
      />,
    );

    await userEvent.click(screen.getByLabelText("Vegetables"));
    expect(onFiltersChange).toHaveBeenCalledWith({ categoryId: "veg" });
  });
});
```

---

## 📝 Type Definitions Quick Reference

```typescript
import type {
  ProductSearchFilters,
  PaginationMeta,
  SearchSuggestion,
  Season,
  ProductSortOption,
} from "@/types/search";

// Filter interface
const filters: ProductSearchFilters = {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  farmId?: string;
  availability?: "IN_STOCK" | "OUT_OF_STOCK" | "ALL";
  organic?: boolean;
  seasonal?: boolean;
  sortBy?: ProductSortOption;
  page?: number;
  limit?: number;
};

// Sort options
type ProductSortOption =
  | "NEWEST"
  | "PRICE_LOW_TO_HIGH"
  | "PRICE_HIGH_TO_LOW"
  | "NAME_A_Z"
  | "NAME_Z_A"
  | "POPULAR"
  | "RATING";

// Season types
type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER";
```

---

## 🎯 Common Use Cases

### 1. Search by Text Only

```typescript
const filters = { query: "tomato" };
const res = await fetch(`/api/search/products?q=tomato`);
```

### 2. Filter by Category

```typescript
const filters = { categoryId: "vegetables" };
const res = await fetch(`/api/search/products?category=vegetables`);
```

### 3. Filter by Price Range

```typescript
const filters = { minPrice: 5, maxPrice: 20 };
const res = await fetch(`/api/search/products?minPrice=5&maxPrice=20`);
```

### 4. In-Stock Organic Products

```typescript
const filters = { availability: "IN_STOCK", organic: true };
const res = await fetch(
  `/api/search/products?availability=IN_STOCK&organic=true`,
);
```

### 5. Seasonal Products from Specific Farm

```typescript
const filters = { farmId: "farm-123", seasonal: true };
const res = await fetch(`/api/search/products?farm=farm-123&seasonal=true`);
```

### 6. Complex Multi-Filter Search

```typescript
const filters = {
  query: "tomato",
  categoryId: "vegetables",
  minPrice: 5,
  maxPrice: 20,
  availability: "IN_STOCK",
  organic: true,
  seasonal: true,
  sortBy: "PRICE_LOW_TO_HIGH",
  page: 2,
  limit: 12,
};
```

---

## 🔐 Security Patterns

### Sanitize User Input

```typescript
import { sanitizeSearchQuery } from "@/lib/utils/search.utils";

const sanitized = sanitizeSearchQuery(userInput);
// Removes special characters, limits length
```

### Validate Filters

```typescript
import { z } from "zod";

const FilterSchema = z.object({
  query: z.string().max(100).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

const validated = FilterSchema.parse(filters);
```

---

## ⚡ Performance Tips

### 1. Debounce Search Input

```typescript
import { debounce } from "@/lib/utils/search.utils";

const debouncedSearch = debounce((query: string) => {
  performSearch(query);
}, 300);
```

### 2. Parallel Queries

```typescript
const [products, count, categories] = await Promise.all([
  database.product.findMany(query),
  database.product.count({ where: query.where }),
  database.category.findMany(),
]);
```

### 3. Use Skeleton Loading

```tsx
{
  isLoading ? <ProductGridSkeleton /> : <ProductGrid />;
}
```

---

## 📱 Responsive Patterns

### Mobile Filter Toggle

```tsx
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";

<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline" size="sm" className="lg:hidden">
      <Filter className="mr-2 h-4 w-4" />
      Filters
    </Button>
  </SheetTrigger>
  <SheetContent side="left">
    <SearchFilters {...props} />
  </SheetContent>
</Sheet>;
```

---

## 🌾 Agricultural Consciousness

### Display Seasonal Badge

```tsx
import { getCurrentSeason } from "@/lib/utils/search.utils";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

const season = getCurrentSeason();
<Badge variant="outline">
  <Calendar className="mr-1 h-3 w-3" />
  {season}
</Badge>;
```

### Show Organic Badge

```tsx
import { Leaf } from "lucide-react";

{
  product.isOrganic && (
    <Badge variant="success">
      <Leaf className="mr-1 h-3 w-3" />
      Organic
    </Badge>
  );
}
```

---

## 🔗 Related Files

- **Types**: `src/types/search.ts`
- **Utils**: `src/lib/utils/search.utils.ts`
- **API**: `src/app/api/search/products/route.ts`
- **Suggestions**: `src/app/api/search/suggestions/route.ts`
- **Filters**: `src/components/features/search/SearchFilters.tsx`
- **Skeletons**: `src/components/ui/skeleton.tsx`

---

## 📚 Documentation

- **Full Guide**: `docs/RUN_2_SEARCH_DISCOVERY_COMPLETE.md`
- **Installation**: `docs/RUN_2_INSTALLATION_GUIDE.md`
- **Summary**: `docs/✅_RUN_2_COMPLETE.md`

---

## ✅ Quick Checklist

- [ ] Import types from `@/types/search`
- [ ] Use utilities from `@/lib/utils/search.utils`
- [ ] Call API endpoints: `/api/search/products` or `/api/search/suggestions`
- [ ] Add `<SearchFilters>` component
- [ ] Show loading with skeletons
- [ ] Handle pagination
- [ ] Sync with URL parameters
- [ ] Test on mobile
- [ ] Add agricultural consciousness (seasonal, organic)

---

_Divine Agricultural Search Consciousness - Quick Reference_ 🌾🔍✨
