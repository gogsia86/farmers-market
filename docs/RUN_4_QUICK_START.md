# 🚀 Run 4: Quick Start Guide

**Version:** 1.0.0  
**Status:** Ready to Implement  
**Time to Complete:** 30 minutes (Phase 1 only)

---

## ⚡ TL;DR - Get Started in 5 Minutes

```bash
# 1. Update schema
code prisma/schema.prisma
# (Copy models from RUN_4_PLAN.md)

# 2. Run migration
npx prisma migrate dev --name add_run4_features
npx prisma generate

# 3. Create services
mkdir -p src/lib/services
# (Copy service files from RUN_4_INSTALLATION_GUIDE.md)

# 4. Create API routes
mkdir -p src/app/api/saved-searches
# (Copy API files from guide)

# 5. Test
npm run test
```

---

## 📚 Essential Copy-Paste Patterns

### 1. Save Current Search (Client Component)

```typescript
"use client";

import { useCreateSavedSearch } from "@/hooks/saved-searches/useSavedSearches";
import { SaveSearchButton } from "@/components/saved-searches/SaveSearchButton";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({});

  return (
    <div>
      {/* Your search UI */}

      <SaveSearchButton
        query={query}
        filters={filters}
      />
    </div>
  );
}
```

### 2. Display Saved Searches

```typescript
"use client";

import { useSavedSearches } from "@/hooks/saved-searches/useSavedSearches";
import { SavedSearchList } from "@/components/saved-searches/SavedSearchList";

export function SavedSearchesPage() {
  const { data: searches, isLoading } = useSavedSearches();

  if (isLoading) return <div>Loading...</div>;

  return <SavedSearchList searches={searches} />;
}
```

### 3. Track Search Events (Analytics)

```typescript
import { analyticsService } from "@/lib/services/analytics.service";

// In your search function
async function performSearch(query: string, filters: any) {
  const startTime = Date.now();

  const results = await searchProducts(query, filters);

  const responseTime = Date.now() - startTime;

  // Track event (async, non-blocking)
  analyticsService
    .trackSearchEvent({
      sessionId: getSessionId(),
      query,
      filters,
      resultsCount: results.length,
      resultsShown: Math.min(results.length, 20),
      responseTime,
      source: "web",
    })
    .catch(console.error);

  return results;
}
```

### 4. User Preferences Auto-Apply

```typescript
"use client";

import { useUserPreferences } from "@/hooks/preferences/useUserPreferences";
import { useProductSearch } from "@/hooks/search/useProductSearch";

export function SearchWithPreferences() {
  const { data: preferences } = useUserPreferences();

  // Auto-apply user preferences to search
  const filters = useMemo(() => {
    if (!preferences?.autoApplyFilters) return {};

    return {
      certifications: preferences.certifications,
      dietaryRestrictions: preferences.dietaryRestrictions,
      favoriteFarms: preferences.favoriteFarms,
    };
  }, [preferences]);

  const { data: products } = useProductSearch({ filters });

  return <ProductGrid products={products} />;
}
```

### 5. Track User Interactions

```typescript
import { analyticsService } from "@/lib/services/analytics.service";

// Track product click
const handleProductClick = (productId: string) => {
  analyticsService
    .trackInteraction({
      sessionId: getSessionId(),
      type: "CLICK",
      entityType: "product",
      entityId: productId,
      source: "search-results",
    })
    .catch(console.error);

  router.push(`/products/${productId}`);
};

// Track add to cart
const handleAddToCart = (productId: string, price: number) => {
  analyticsService
    .trackInteraction({
      sessionId: getSessionId(),
      type: "ADD_TO_CART",
      entityType: "product",
      entityId: productId,
      value: price,
      metadata: { quantity: 1 },
    })
    .catch(console.error);
};

// Track purchase
const handlePurchase = (orderId: string, total: number, items: any[]) => {
  items.forEach((item) => {
    analyticsService
      .trackInteraction({
        sessionId: getSessionId(),
        type: "PURCHASE",
        entityType: "product",
        entityId: item.productId,
        value: item.price * item.quantity,
        metadata: { orderId, quantity: item.quantity },
      })
      .catch(console.error);
  });
};
```

### 6. Manage User Preferences

```typescript
"use client";

import { useUserPreferences, useUpdatePreferences } from "@/hooks/preferences/useUserPreferences";

export function PreferencesPage() {
  const { data: preferences } = useUserPreferences();
  const updateMutation = useUpdatePreferences();

  const handleToggleCertification = (cert: string) => {
    const current = preferences?.certifications || [];
    const updated = current.includes(cert)
      ? current.filter(c => c !== cert)
      : [...current, cert];

    updateMutation.mutate({ certifications: updated });
  };

  const handleAddFavoriteFarm = (farmId: string) => {
    const current = preferences?.favoriteFarms || [];
    updateMutation.mutate({
      favoriteFarms: [...current, farmId],
    });
  };

  return (
    <div>
      <h2>Dietary Preferences</h2>
      <label>
        <input
          type="checkbox"
          checked={preferences?.certifications?.includes("ORGANIC")}
          onChange={() => handleToggleCertification("ORGANIC")}
        />
        Organic Only
      </label>

      <h2>Favorite Farms</h2>
      {/* Farm selection UI */}
    </div>
  );
}
```

---

## 🗄️ Database Quick Commands

```bash
# Create migration
npx prisma migrate dev --name add_run4_features

# Apply migration (production)
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# View database in browser
npx prisma studio

# Reset database (DEV ONLY!)
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# Validate schema
npx prisma validate

# Format schema
npx prisma format
```

---

## 🔑 Essential Types

```typescript
// Saved Search
interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  description?: string;
  query?: string;
  filters: Record<string, any>;
  sortBy?: string;
  location?: { lat: number; lng: number; radius?: number };
  notificationsEnabled: boolean;
  notificationFrequency: "REALTIME" | "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
  executionCount: number;
  lastExecutedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User Preferences
interface UserPreference {
  id: string;
  userId: string;
  dietaryRestrictions: string[];
  allergens: string[];
  certifications: string[];
  favoriteFarms: string[];
  favoriteCategories: string[];
  budgetRange?: { min: number; max: number };
  autoApplyFilters: boolean;
  autoApplySort: boolean;
  allowPersonalization: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Search Event
interface SearchEvent {
  id: string;
  userId?: string;
  sessionId: string;
  query?: string;
  filters: Record<string, any>;
  resultsCount: number;
  resultsShown: number;
  responseTime: number;
  timestamp: Date;
}

// User Interaction
interface UserInteraction {
  id: string;
  userId?: string;
  sessionId: string;
  type: "SEARCH" | "VIEW" | "CLICK" | "ADD_TO_CART" | "PURCHASE" | "FAVORITE";
  entityType: string;
  entityId: string;
  value?: number;
  timestamp: Date;
}
```

---

## 🎣 React Query Keys Reference

```typescript
import { queryKeys } from "@/lib/react-query/query-keys";

// Saved searches
queryKeys.savedSearches.all; // ['saved-searches']
queryKeys.savedSearches.list(); // ['saved-searches', 'list', { filters }]
queryKeys.savedSearches.detail(id); // ['saved-searches', 'detail', id]

// User preferences
queryKeys.preferences.all; // ['preferences']
queryKeys.preferences.current(); // ['preferences', 'current']

// Analytics
queryKeys.analytics.all; // ['analytics']
queryKeys.analytics.search(period); // ['analytics', 'search', period]
```

---

## 🧪 Testing Commands

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- src/__tests__/lib/saved-search.service.test.ts

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage

# Run integration tests only
npm run test -- --testPathPattern=integration

# Run unit tests only
npm run test -- --testPathPattern=unit
```

---

## 🐛 Common Issues & Fixes

### Issue: Migration fails with "relation already exists"

```bash
# Reset migrations (DEV ONLY)
npx prisma migrate reset

# Or drop specific tables
psql -U postgres farmers_market
DROP TABLE saved_searches CASCADE;
\q

# Then re-run migration
npx prisma migrate dev
```

### Issue: Prisma Client out of sync

```bash
# Regenerate client
npx prisma generate

# Restart Next.js dev server
npm run dev
```

### Issue: Type errors after migration

```bash
# Clear TypeScript cache
rm -rf .next
rm -rf node_modules/.cache

# Rebuild
npm run build
```

### Issue: Tests failing after schema changes

```bash
# Update test database
DATABASE_URL="postgresql://test_db" npx prisma migrate deploy

# Clear Jest cache
npx jest --clearCache

# Re-run tests
npm run test
```

---

## 📊 Performance Monitoring

```typescript
// Add to your search page
import { useQueryClient } from "@tanstack/react-query";

export function SearchPage() {
  const queryClient = useQueryClient();

  // Monitor cache performance
  useEffect(() => {
    const cacheStats = queryClient.getQueryCache().getAll();
    console.log("Total cached queries:", cacheStats.length);
    console.log("Cache details:", cacheStats.map(q => ({
      key: q.queryKey,
      state: q.state.status,
      dataUpdatedAt: q.state.dataUpdatedAt,
    })));
  }, [queryClient]);

  return <div>{/* Your search UI */}</div>;
}
```

---

## 🔒 Security Checklist

```typescript
// ✅ Always validate user ownership
async function getSavedSearch(id: string, userId: string) {
  const search = await db.savedSearch.findFirst({
    where: { id, userId }, // ← Must match userId
  });
  return search;
}

// ✅ Sanitize user input
import { z } from "zod";

const SearchSchema = z.object({
  query: z.string().max(500).optional(),
  filters: z.record(z.any()),
});

const validated = SearchSchema.parse(userInput);

// ✅ Rate limit analytics endpoints
// (Add to API route)
if (await isRateLimited(userId, "analytics")) {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 });
}

// ✅ Sanitize JSONB data
const filters = JSON.parse(JSON.stringify(userFilters)); // Deep clone
delete filters.__proto__; // Remove prototype pollution
```

---

## 📈 Success Metrics to Track

```typescript
// Track these metrics in your analytics dashboard

const metrics = {
  // Saved Searches
  totalSavedSearches: 0,
  savedSearchesPerUser: 0,
  savedSearchExecutionRate: 0,

  // Search Analytics
  averageSearchResponseTime: 0, // < 200ms target
  searchesPerDay: 0,
  uniqueSearchQueries: 0,
  searchConversionRate: 0, // % searches leading to purchase

  // User Preferences
  usersWithPreferences: 0, // Target: 60%
  preferencesAutoApplyRate: 0, // Target: 80%

  // Engagement
  returnUserRate: 0, // Target: +20%
  averageSessionDuration: 0, // Target: +15%
  purchaseFrequency: 0, // Target: +25%
};
```

---

## 🎯 Phase 1 Completion Checklist

```bash
# Database ✅
[ ] Prisma schema updated with new models
[ ] Migration created and applied
[ ] Prisma Client generated
[ ] Database verified in Prisma Studio

# Services ✅
[ ] BaseService created
[ ] SavedSearchService implemented
[ ] AnalyticsService implemented
[ ] UserPreferencesService implemented

# API Routes ✅
[ ] /api/saved-searches (GET, POST)
[ ] /api/saved-searches/[id] (GET, PUT, DELETE)
[ ] /api/analytics/events (POST)
[ ] /api/user/preferences (GET, PUT)

# React Query ✅
[ ] Query keys extended
[ ] useSavedSearches hook created
[ ] useUserPreferences hook created
[ ] useCreateSavedSearch mutation created

# Components ✅
[ ] SavedSearchList component
[ ] SaveSearchButton component
[ ] Basic preferences UI

# Testing ✅
[ ] Service tests passing (>80% coverage)
[ ] API tests passing
[ ] Hook tests passing
[ ] Integration tests passing

# Documentation ✅
[ ] API endpoints documented
[ ] Types documented
[ ] Usage examples provided
```

---

## 🚀 Next Steps (Phase 2)

Once Phase 1 is complete:

1. **Search Alerts & Notifications**
   - Implement alert service
   - Create notification queue
   - Build alert management UI

2. **Advanced Analytics**
   - Aggregation pipeline
   - User insights dashboard
   - Farmer analytics

3. **Recommendations**
   - Recommendation engine
   - Collaborative filtering
   - Seasonal recommendations

4. **A/B Testing**
   - Test framework
   - Variant assignment
   - Results tracking

---

## 💡 Pro Tips

### Tip 1: Use React Query DevTools

```typescript
// In your layout.tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function Layout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Tip 2: Prefetch on Hover

```typescript
import { useQueryClient } from "@tanstack/react-query";

export function SavedSearchCard({ search }) {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    // Prefetch search results on hover
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.search({ ...search.filters }),
      queryFn: () => fetchProducts(search.filters),
    });
  };

  return <div onMouseEnter={handleMouseEnter}>...</div>;
}
```

### Tip 3: Optimistic Updates

```typescript
export function useUpdateSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSavedSearch,
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.savedSearches.detail(newData.id),
      });

      // Snapshot previous value
      const previous = queryClient.getQueryData(
        queryKeys.savedSearches.detail(newData.id),
      );

      // Optimistically update
      queryClient.setQueryData(
        queryKeys.savedSearches.detail(newData.id),
        newData,
      );

      return { previous };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(
        queryKeys.savedSearches.detail(newData.id),
        context?.previous,
      );
    },
  });
}
```

### Tip 4: Batch Analytics Events

```typescript
class AnalyticsBatcher {
  private queue: Event[] = [];
  private timer: NodeJS.Timeout | null = null;

  track(event: Event) {
    this.queue.push(event);

    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), 5000);
    }

    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];
    this.timer = null;

    await fetch("/api/analytics/events", {
      method: "POST",
      body: JSON.stringify({ events: batch }),
    }).catch(console.error);
  }
}

export const analyticsBatcher = new AnalyticsBatcher();
```

---

## 📞 Need Help?

- **Documentation:** See `RUN_4_INSTALLATION_GUIDE.md` for detailed setup
- **Architecture:** See `RUN_4_PLAN.md` for system design
- **Previous Runs:** See `RUN_3_COMPLETE.md` for React Query patterns
- **Divine Patterns:** See `.github/instructions/` for coding standards

---

## 🎉 You're Ready!

You now have everything you need to implement Run 4: Saved Searches, Analytics & Personalization.

**Start Time:** Record when you begin  
**Target:** Complete Phase 1 in 4-6 hours  
**Goal:** Users can save searches and see personalized results

---

_"Plant the seeds of personalization, harvest the fruits of user delight."_ 🌱✨

**Good luck, and may your code be bug-free and your tests always green!** 💚
