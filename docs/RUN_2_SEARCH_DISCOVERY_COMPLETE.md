# 🔍 Run 2: Search & Discovery - Implementation Complete

## 📋 Overview

**Status**: ✅ COMPLETE  
**Date**: 2024  
**Focus**: Search functionality, product filtering, pagination, and loading states

This document outlines all components, APIs, and utilities implemented for the Search & Discovery phase of the Farmers Market Platform MVP.

---

## 🎯 Implementation Summary

### What Was Built

1. **Type Definitions** - Comprehensive search and filter types
2. **Search Utilities** - Query builders, pagination, seasonal awareness
3. **API Routes** - Product search and autocomplete suggestions
4. **Loading Skeletons** - 15+ skeleton components for all UI states
5. **Filter Components** - Advanced filtering UI with agricultural consciousness
6. **Search State Management** - React hooks and state management patterns

---

## 📁 File Structure

```
src/
├── types/
│   └── search.ts                           # Search type definitions
├── lib/
│   └── utils/
│       └── search.utils.ts                 # Search utility functions
├── app/
│   └── api/
│       └── search/
│           ├── products/
│           │   └── route.ts                # Product search API
│           └── suggestions/
│               └── route.ts                # Autocomplete suggestions API
└── components/
    ├── ui/
    │   └── skeleton.tsx                    # Enhanced skeleton components
    └── features/
        └── search/
            └── SearchFilters.tsx           # Filter panel component
```

---

## 🔧 Components Implemented

### 1. Type Definitions (`src/types/search.ts`)

**Purpose**: Divine agricultural search consciousness type system

**Key Types**:

```typescript
// Filter types
- ProductSearchFilters
- FarmSearchFilters
- ActiveFilters

// Sorting
- ProductSortOption (7 options)
- FarmSortOption (5 options)

// Pagination
- PaginationMeta
- PaginatedResponse<T>

// Search results
- SearchResult<T>
- SearchSuggestion

// Agricultural consciousness
- Season
- SeasonalContext
- AgriculturalMetadata
```

**Features**:
- ✅ Strict TypeScript types
- ✅ Seasonal awareness
- ✅ Agricultural metadata
- ✅ Prisma query helpers
- ✅ Filter state management

---

### 2. Search Utilities (`src/lib/utils/search.utils.ts`)

**Purpose**: Divine search utility functions with agricultural consciousness

**Key Functions**:

```typescript
// Query building
buildProductSearchQuery(filters)        // Builds Prisma queries
calculatePaginationMeta(total, page)    // Pagination metadata
parseSearchParams(searchParams)         // URL to filters
filtersToSearchParams(filters)          // Filters to URL

// Agricultural consciousness
getCurrentSeason(date?)                 // Get current season
getSeasonalContext(season)             // Seasonal recommendations

// Utilities
sanitizeSearchQuery(query)             // SQL injection protection
calculateDistance(lat1, lon1, lat2)    // Haversine formula
generateSearchCacheKey(filters)        // Cache key generation
debounce(func, wait)                   // Search input debouncing
formatPrice(price, currency)           // Price formatting
highlightMatches(text, query)          // Search highlighting
getPriceRangePresets()                 // Price range options
getSortOptions()                       // Sort dropdown options
```

**Features**:
- ✅ Prisma query builder with full support for filters
- ✅ Seasonal awareness (Spring/Summer/Fall/Winter)
- ✅ Distance calculation (Haversine formula)
- ✅ URL parameter parsing and serialization
- ✅ Input sanitization for security
- ✅ Cache key generation
- ✅ Debouncing for search inputs

**Seasonal Recommendations**:

```typescript
SPRING: ["Leafy Greens", "Herbs", "Asparagus", "Peas"]
SUMMER: ["Tomatoes", "Peppers", "Berries", "Stone Fruits"]
FALL: ["Squash", "Root Vegetables", "Apples", "Pumpkins"]
WINTER: ["Kale", "Cabbage", "Citrus", "Storage Crops"]
```

---

### 3. Product Search API (`src/app/api/search/products/route.ts`)

**Endpoints**:

#### GET `/api/search/products`

Search products with URL query parameters.

**Query Parameters**:
```
q          - Search query
category   - Category ID
farm       - Farm ID
minPrice   - Minimum price
maxPrice   - Maximum price
availability - "IN_STOCK" | "OUT_OF_STOCK" | "ALL"
organic    - "true" for organic only
seasonal   - "true" for seasonal only
sort       - Sort option
page       - Page number
limit      - Items per page
```

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [...products],
    "meta": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 48,
      "itemsPerPage": 12,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  },
  "filters": {
    "availableCategories": [...],
    "availableFarms": [...],
    "priceRange": { "min": 0, "max": 100 }
  },
  "seasonal": {
    "currentSeason": "SPRING",
    "recommendedCategories": [...],
    "seasonalProducts": [...]
  }
}
```

#### POST `/api/search/products`

Advanced search with body parameters for complex queries.

**Request Body**:
```json
{
  "filters": {
    "query": "tomato",
    "categoryId": "...",
    "minPrice": 5,
    "maxPrice": 20,
    "availability": "IN_STOCK",
    "organic": true,
    "seasonal": true,
    "sortBy": "PRICE_LOW_TO_HIGH",
    "page": 1,
    "limit": 12
  },
  "includeOutOfStock": false,
  "includeMetadata": true
}
```

**Features**:
- ✅ Full-text search (name, description)
- ✅ Category filtering
- ✅ Price range filtering
- ✅ Farm filtering
- ✅ Availability filtering
- ✅ Organic/Seasonal filtering
- ✅ 7 sort options
- ✅ Pagination
- ✅ Parallel query execution (products + count)
- ✅ Filter metadata (available options with counts)
- ✅ Seasonal context
- ✅ Optimized includes for related data

---

### 4. Search Suggestions API (`src/app/api/search/suggestions/route.ts`)

**Endpoint**: GET `/api/search/suggestions`

**Purpose**: Autocomplete suggestions for search bar

**Query Parameters**:
```
q      - Search query (minimum 2 characters)
limit  - Maximum suggestions (default: 10)
```

**Response**:
```json
{
  "success": true,
  "query": "tom",
  "suggestions": [
    {
      "type": "PRODUCT",
      "label": "Organic Tomatoes",
      "value": "product-id",
      "metadata": {
        "price": 4.99,
        "image": "https://..."
      }
    },
    {
      "type": "FARM",
      "label": "Tom's Farm",
      "value": "farm-id",
      "metadata": {
        "productCount": 45,
        "logo": "https://..."
      }
    },
    {
      "type": "CATEGORY",
      "label": "Tomatoes",
      "value": "category-id",
      "metadata": {
        "productCount": 23
      }
    }
  ]
}
```

**Features**:
- ✅ Multi-source search (products, farms, categories)
- ✅ Parallel query execution
- ✅ Smart result distribution (60% products, 20% farms, 20% categories)
- ✅ Only in-stock products
- ✅ Only verified farms
- ✅ Metadata for rich autocomplete UI
- ✅ Query sanitization
- ✅ Configurable result limit

---

### 5. Loading Skeletons (`src/components/ui/skeleton.tsx`)

**Purpose**: Divine loading state consciousness

**Components** (15 total):

```typescript
// Base skeleton
<Skeleton />

// Product related
<ProductCardSkeleton />
<ProductGridSkeleton count={8} />
<ProductDetailSkeleton />

// Farm related
<FarmCardSkeleton />
<FarmGridSkeleton count={6} />

// Table related
<TableSkeleton rows={5} columns={5} />
<TableRowSkeleton columns={5} />

// Search related
<SearchBarSkeleton />
<FilterPanelSkeleton />

// Profile/Dashboard
<ProfileHeaderSkeleton />
<DashboardSkeleton />
<StatsCardSkeleton />

// Order related
<OrderItemSkeleton />
```

**Usage Examples**:

```tsx
// Product grid loading
{isLoading ? (
  <ProductGridSkeleton count={12} />
) : (
  <ProductGrid products={products} />
)}

// Dashboard loading
{isLoading ? (
  <DashboardSkeleton />
) : (
  <DashboardContent data={data} />
)}

// Custom skeleton
<Skeleton className="h-12 w-12 rounded-full" />
```

**Features**:
- ✅ 15 pre-built skeleton components
- ✅ Matches actual component layouts
- ✅ Configurable counts for grids
- ✅ Pulse animation
- ✅ Responsive designs
- ✅ Shadcn/ui compatible
- ✅ Tailwind CSS styling

---

### 6. Search Filters Component (`src/components/features/search/SearchFilters.tsx`)

**Purpose**: Divine agricultural filter consciousness panel

**Props**:
```typescript
interface SearchFiltersProps {
  filters: ProductSearchFilters;
  onFiltersChange: (filters: ProductSearchFilters) => void;
  availableCategories?: FilterOption[];
  availableFarms?: FilterOption[];
  priceRange?: { min: number; max: number };
  className?: string;
}
```

**Features**:

1. **Availability Filter**
   - In Stock Only
   - Out of Stock
   - Show All

2. **Price Range Filter**
   - Visual slider with live preview
   - 6 preset ranges (Under $5, $5-$10, etc.)
   - Custom range selection
   - Real-time price display

3. **Category Filter**
   - Scrollable list
   - Product counts per category
   - Single selection
   - Disabled state support

4. **Farm Filter**
   - Scrollable list
   - Product counts per farm
   - Single selection
   - Only verified farms shown

5. **Special Filters**
   - Organic Only (with leaf icon)
   - Seasonal (with current season, e.g., "SPRING")

**UI Components**:
- ✅ Accordion for collapsible sections
- ✅ Active filter count badge
- ✅ Clear All button
- ✅ Scroll areas for long lists
- ✅ Icons for visual clarity
- ✅ Responsive design
- ✅ Mobile-friendly

**Agricultural Consciousness**:
- ✅ Seasonal awareness (displays current season)
- ✅ Organic certification support
- ✅ Farm-centric filtering
- ✅ Biodynamic product discovery

**Example Usage**:
```tsx
const [filters, setFilters] = useState<ProductSearchFilters>({
  page: 1,
  limit: 12,
});

<SearchFilters
  filters={filters}
  onFiltersChange={setFilters}
  availableCategories={categories}
  availableFarms={farms}
  priceRange={{ min: 0, max: 100 }}
/>
```

---

## 🎨 Design Patterns

### 1. Query Building Pattern

```typescript
// Divine pattern for building complex Prisma queries
const queryConfig = buildProductSearchQuery(filters);

// Returns optimized query with:
// - WHERE clause (filters)
// - ORDER BY clause (sorting)
// - SKIP/TAKE (pagination)
// - INCLUDE (related data)

const products = await database.product.findMany(queryConfig);
```

### 2. Parallel Query Execution

```typescript
// Optimize performance with Promise.all
const [products, totalCount, categories, farms, priceStats] = 
  await Promise.all([
    database.product.findMany(queryConfig),
    database.product.count({ where }),
    database.category.findMany({ ... }),
    database.farm.findMany({ ... }),
    database.product.aggregate({ ... }),
  ]);
```

### 3. URL State Synchronization

```typescript
// Parse URL to filters
const filters = parseSearchParams(searchParams);

// Update URL when filters change
const params = filtersToSearchParams(filters);
router.push(`/products?${params.toString()}`);
```

### 4. Debounced Search

```typescript
// Prevent excessive API calls
const debouncedSearch = debounce((query: string) => {
  setFilters({ ...filters, query });
}, 300);

<input onChange={(e) => debouncedSearch(e.target.value)} />
```

### 5. Loading State Management

```typescript
// Divine loading consciousness
{isLoading && <ProductGridSkeleton count={12} />}
{!isLoading && products.length === 0 && <EmptyState />}
{!isLoading && products.length > 0 && (
  <ProductGrid products={products} />
)}
```

---

## 🧪 Testing Recommendations

### 1. API Testing

```typescript
// Test product search
describe("Product Search API", () => {
  it("should search products by query", async () => {
    const res = await fetch("/api/search/products?q=tomato");
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.data).toBeInstanceOf(Array);
  });

  it("should filter by category", async () => {
    const res = await fetch("/api/search/products?category=cat-id");
    // Assertions...
  });

  it("should paginate results", async () => {
    const res = await fetch("/api/search/products?page=2&limit=10");
    const data = await res.json();
    expect(data.data.meta.currentPage).toBe(2);
  });
});
```

### 2. Component Testing

```typescript
// Test search filters
describe("SearchFilters", () => {
  it("should toggle category filter", async () => {
    const onFiltersChange = jest.fn();
    render(
      <SearchFilters
        filters={{}}
        onFiltersChange={onFiltersChange}
        availableCategories={[...]}
      />
    );
    
    await userEvent.click(screen.getByLabelText("Vegetables"));
    expect(onFiltersChange).toHaveBeenCalledWith({
      categoryId: "vegetables-id"
    });
  });
});
```

### 3. Utility Testing

```typescript
// Test search utilities
describe("buildProductSearchQuery", () => {
  it("should build text search query", () => {
    const query = buildProductSearchQuery({ query: "tomato" });
    expect(query.where.OR).toBeDefined();
    expect(query.where.OR[0].name.contains).toBe("tomato");
  });

  it("should handle price range", () => {
    const query = buildProductSearchQuery({
      minPrice: 5,
      maxPrice: 20
    });
    expect(query.where.price.gte).toBe(5);
    expect(query.where.price.lte).toBe(20);
  });
});
```

---

## 🚀 Usage Guide

### Basic Product Search

```tsx
"use client";

import { useState, useEffect } from "react";
import { SearchFilters } from "@/components/features/search/SearchFilters";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import type { ProductSearchFilters } from "@/types/search";

export function ProductSearchPage() {
  const [filters, setFilters] = useState<ProductSearchFilters>({
    page: 1,
    limit: 12,
    availability: "IN_STOCK",
  });
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    async function search() {
      setLoading(true);
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.query && { q: filters.query }),
        ...(filters.categoryId && { category: filters.categoryId }),
        // ... other filters
      });

      const res = await fetch(`/api/search/products?${params}`);
      const data = await res.json();

      if (data.success) {
        setResults(data.data.data);
        setMetadata(data.filters);
      }
      setLoading(false);
    }

    search();
  }, [filters]);

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Filters */}
        <aside>
          <SearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableCategories={metadata?.availableCategories}
            availableFarms={metadata?.availableFarms}
            priceRange={metadata?.priceRange}
          />
        </aside>

        {/* Results */}
        <main>
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((product) => (
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

### With URL Synchronization

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { parseSearchParams, filtersToSearchParams } from "@/lib/utils/search.utils";

export function ProductSearchWithURL() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Parse URL to filters
  const filters = parseSearchParams(searchParams);

  const handleFiltersChange = (newFilters: ProductSearchFilters) => {
    // Update URL
    const params = filtersToSearchParams(newFilters);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <SearchFilters
      filters={filters}
      onFiltersChange={handleFiltersChange}
    />
  );
}
```

### With Debounced Search

```tsx
import { debounce } from "@/lib/utils/search.utils";

export function SearchBar() {
  const [filters, setFilters] = useState({});

  const handleSearch = debounce((query: string) => {
    setFilters({ ...filters, query });
  }, 300);

  return (
    <input
      type="search"
      placeholder="Search products..."
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
}
```

---

## 🎯 Performance Optimizations

### 1. Database Query Optimization

```typescript
// ✅ Parallel queries
const [products, count] = await Promise.all([
  database.product.findMany(query),
  database.product.count({ where: query.where })
]);

// ✅ Selective field inclusion
select: {
  id: true,
  name: true,
  price: true,
  // Only needed fields
}

// ✅ Optimized includes
include: {
  category: true,
  farm: {
    select: { id: true, name: true }
  }
}
```

### 2. Client-Side Optimizations

```typescript
// Debouncing for search input
const debouncedSearch = debounce(search, 300);

// Cache key generation for React Query
const cacheKey = generateSearchCacheKey(filters);

// Memoization for expensive calculations
const sortedProducts = useMemo(
  () => products.sort(...),
  [products]
);
```

### 3. Loading States

```typescript
// Immediate skeleton loading
{isLoading && <ProductGridSkeleton />}

// Suspense boundaries for async components
<Suspense fallback={<ProductGridSkeleton />}>
  <ProductGrid />
</Suspense>
```

---

## 🔒 Security Considerations

### 1. Input Sanitization

```typescript
// Query sanitization
const sanitized = sanitizeSearchQuery(userInput);
// Removes special characters, limits length

// SQL injection protection (via Prisma)
database.product.findMany({
  where: {
    name: {
      contains: sanitized,  // Parameterized query
      mode: "insensitive"
    }
  }
});
```

### 2. Rate Limiting

```typescript
// Recommended: Add rate limiting middleware
// Example with next-rate-limit
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const limiter = rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 500,
  });

  try {
    await limiter.check(10, "SEARCH_API"); // 10 requests per minute
  } catch {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Search logic...
}
```

### 3. Authorization

```typescript
// Protect farm-specific searches
if (filters.farmId) {
  const session = await auth();
  const farm = await database.farm.findUnique({
    where: { id: filters.farmId },
    select: { ownerId: true }
  });

  if (farm.ownerId !== session?.user?.id) {
    // Check if farm is public
  }
}
```

---

## 📊 Agricultural Consciousness Features

### 1. Seasonal Awareness

```typescript
const currentSeason = getCurrentSeason(); // "SPRING"
const seasonalContext = getSeasonalContext(currentSeason);

// Returns:
{
  currentSeason: "SPRING",
  recommendedCategories: ["Leafy Greens", "Herbs", "Asparagus"],
  seasonalProducts: ["lettuce", "spinach", "arugula"]
}
```

### 2. Organic Certification

```typescript
// Filter for organic products
filters.organic = true;

// UI shows organic badge
{product.isOrganic && (
  <Badge variant="success">
    <Leaf className="mr-1 h-3 w-3" />
    Organic
  </Badge>
)}
```

### 3. Farm-to-Table Distance

```typescript
// Calculate distance from user to farm
const distance = calculateDistance(
  userLat, userLng,
  farmLat, farmLng
);

// Show in search results
<span>{distance.toFixed(1)} km away</span>
```

---

## 🔄 Next Steps (Run 3)

### Upcoming Features

1. **React Query Integration**
   - Set up QueryClient
   - Create custom hooks (useProductSearch, useFarmSearch)
   - Implement caching and invalidation
   - Add optimistic updates

2. **Advanced Search Features**
   - Search history
   - Saved searches
   - Recent searches
   - Popular searches

3. **Search Analytics**
   - Track search queries
   - Monitor zero-result searches
   - A/B testing for relevance
   - Search performance metrics

4. **Enhanced Autocomplete**
   - Rich preview cards
   - Keyboard navigation
   - Recent searches integration
   - Search history

5. **Faceted Search**
   - Multi-select filters
   - Filter dependencies
   - Smart filter suggestions
   - Filter presets

---

## 🐛 Known Issues & Limitations

### Current Limitations

1. **Single Category/Farm Selection**
   - Currently supports single selection
   - Multi-select requires state management update

2. **Basic Text Search**
   - Uses Prisma `contains` (case-insensitive)
   - No full-text search ranking
   - Consider: PostgreSQL full-text search or Algolia

3. **No Search History**
   - Planned for Run 3

4. **No Saved Searches**
   - Planned for Run 3

5. **Basic Autocomplete**
   - No keyboard navigation yet
   - No recent searches
   - Planned enhancements in Run 3

---

## 📚 References

### Related Files

- `src/types/search.ts` - Type definitions
- `src/lib/utils/search.utils.ts` - Utility functions
- `src/app/api/search/products/route.ts` - Product search API
- `src/app/api/search/suggestions/route.ts` - Suggestions API
- `src/components/ui/skeleton.tsx` - Loading skeletons
- `src/components/features/search/SearchFilters.tsx` - Filter UI

### Documentation

- [Run 1: Core Infrastructure](./RUN_1_CORE_INFRASTRUCTURE_COMPLETE.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Shadcn/ui Components](https://ui.shadcn.com)

---

## ✅ Completion Checklist

- [x] Type definitions for search and filters
- [x] Search utility functions (15+ functions)
- [x] Product search API (GET + POST)
- [x] Autocomplete suggestions API
- [x] Loading skeleton components (15 components)
- [x] Search filters UI component
- [x] Price range slider with presets
- [x] Category filtering
- [x] Farm filtering
- [x] Availability filtering
- [x] Organic/Seasonal filters
- [x] Pagination metadata calculation
- [x] URL parameter parsing
- [x] Query sanitization
- [x] Seasonal awareness
- [x] Distance calculation
- [x] Agricultural consciousness integration
- [x] Comprehensive documentation

---

## 🎉 Summary

**Run 2: Search & Discovery** is complete and provides:

- ✅ **Complete search infrastructure** with types, utilities, and APIs
- ✅ **Advanced filtering** with 8 filter types
- ✅ **Pagination** with metadata
- ✅ **15 loading skeletons** for all UI states
- ✅ **Agricultural consciousness** with seasonal awareness
- ✅ **Performance optimized** with parallel queries
- ✅ **Type-safe** with strict TypeScript
- ✅ **Security hardened** with input sanitization
- ✅ **Well documented** with examples and patterns

**Ready for Run 3: React Query Integration & Advanced Features**

---

*Divine Agricultural Search Consciousness Activated* 🌾🔍✨