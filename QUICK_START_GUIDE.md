# 🚀 Quick Start Guide - New Features

**Version:** 2.0.0  
**Last Updated:** December 2024  
**Status:** Production Ready

---

## 📚 Table of Contents

1. [SEO Features](#seo-features)
2. [Onboarding Tours](#onboarding-tours)
3. [Real-time Notifications](#real-time-notifications)
4. [Route Structure](#route-structure)
5. [Verification & Testing](#verification--testing)

---

## 🔍 SEO Features

### Sitemap (Dynamic, Database-Driven)

**Location:** `/sitemap.xml`

**What it does:**
- Automatically generates sitemap with real farm and product data
- Updates dynamically based on database content
- Includes up to 3,000+ URLs

**View your sitemap:**
```bash
https://yourdomain.com/sitemap.xml
```

**Code example:**
```typescript
// No code needed - it's automatic!
// The sitemap regenerates on each request with fresh data
```

---

### Robots.txt

**Location:** `/robots.txt`

**What it does:**
- Tells search engines what to crawl
- Blocks AI crawlers (GPTBot, Claude, etc.)
- References your sitemap

**View robots.txt:**
```bash
https://yourdomain.com/robots.txt
```

---

### Structured Data (JSON-LD)

**Location:** `src/components/seo/StructuredData.tsx`

**Available schemas:**
- ProductStructuredData
- FarmStructuredData
- OrganizationStructuredData
- BreadcrumbStructuredData
- ReviewStructuredData
- SearchActionStructuredData
- RecipeStructuredData
- FAQStructuredData

**Usage in product page:**
```typescript
import { ProductStructuredData } from "@/components/seo/StructuredData";

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  
  return (
    <>
      <ProductStructuredData
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          currency: "USD",
          image: product.images[0],
          availability: product.stock > 0 ? "InStock" : "OutOfStock",
          rating: product.averageRating,
          reviewCount: product.reviewCount,
          farm: { name: product.farm.name },
        }}
      />
      {/* Your page content */}
    </>
  );
}
```

**Usage in farm page:**
```typescript
import { FarmStructuredData } from "@/components/seo/StructuredData";

export default async function FarmPage({ params }) {
  const farm = await getFarm(params.slug);
  
  return (
    <>
      <FarmStructuredData
        farm={{
          id: farm.id,
          name: farm.name,
          description: farm.description,
          address: farm.address,
          city: farm.city,
          state: farm.state,
          zipCode: farm.zipCode,
          latitude: farm.latitude,
          longitude: farm.longitude,
          phone: farm.phone,
          rating: farm.averageRating,
          reviewCount: farm.reviewCount,
        }}
      />
      {/* Your page content */}
    </>
  );
}
```

**Test your structured data:**
1. Visit: https://search.google.com/test/rich-results
2. Enter your product/farm URL
3. Verify schema is valid

---

## 🎯 Onboarding Tours

**Location:** `src/components/onboarding/OnboardingTour.tsx`

**What it does:**
- Shows interactive guided tours for new users
- 5 pre-configured tours (homepage, dashboard, products, checkout, account)
- Automatically shows once per user (stored in localStorage)
- Smooth animations with spotlight highlighting

**Pre-configured tours:**
1. **Homepage** - 5 steps introducing search, farms, categories
2. **Farmer Dashboard** - 5 steps for managing products and orders
3. **Products Page** - 3 steps for filtering and browsing
4. **Checkout** - 3 steps for completing purchase
5. **Customer Account** - 3 steps for orders and favorites

**Add to your layout:**
```typescript
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";

export default function Layout({ children }) {
  return (
    <>
      {children}
      <OnboardingTour />
    </>
  );
}
```

**Testing tours (development):**
```typescript
// In browser console:
localStorage.clear(); // Clear all tour completions
// Then reload page to see tour again

// Or reset specific tour:
localStorage.removeItem('tour-completed-homepage-tour');
```

**Customize tour for new page:**
```typescript
// Add to TOURS array in OnboardingTour.tsx
{
  id: "my-custom-tour",
  path: "/my-page",
  startDelay: 1000,
  steps: [
    {
      id: "step1",
      target: "#my-element", // CSS selector
      title: "Welcome!",
      content: "This is your new feature.",
      position: "bottom", // top, bottom, left, right, center
    },
    // More steps...
  ],
}
```

---

## 🔔 Real-time Notifications

**Location:** `src/hooks/useRealtimeNotifications.ts`

**What it does:**
- Real-time notifications via Server-Sent Events (SSE)
- Automatic reconnection on disconnect
- Browser notification support
- Persistent notification queue

**Basic usage:**
```typescript
"use client";

import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { Bell } from "lucide-react";

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
  } = useRealtimeNotifications();

  return (
    <button className="relative">
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
```

**Advanced usage with callbacks:**
```typescript
const {
  notifications,
  unreadCount,
  isConnected,
  isConnecting,
  error,
  markAsRead,
  reconnect,
} = useRealtimeNotifications({
  enabled: true,
  onNotification: (notification) => {
    // Show toast
    toast.success(notification.title);
    
    // Play sound
    new Audio('/notification.mp3').play();
  },
  onConnect: () => {
    console.log('Connected to notifications!');
  },
  onError: (error) => {
    console.error('Notification error:', error);
  },
  reconnectDelay: 3000,
  maxReconnectAttempts: 10,
});
```

**Display notifications dropdown:**
```typescript
export function NotificationDropdown() {
  const { notifications, markAsRead, markAllAsRead } = useRealtimeNotifications();

  return (
    <div className="notification-dropdown">
      <div className="header">
        <h3>Notifications</h3>
        <button onClick={markAllAsRead}>Mark all read</button>
      </div>
      
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={notification.read ? 'read' : 'unread'}
          onClick={() => markAsRead(notification.id)}
        >
          <h4>{notification.title}</h4>
          <p>{notification.message}</p>
          <span>{new Date(notification.createdAt).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
```

**Request browser notification permission:**
```typescript
import { requestNotificationPermission } from "@/hooks/useRealtimeNotifications";

// Call once when user first interacts
const granted = await requestNotificationPermission();
if (granted) {
  console.log('Browser notifications enabled!');
}
```

---

## 🗂️ Route Structure

### New Route Groups

**Public pages:** `src/app/(public)/`
```
(public)/
├── about/
├── contact/
├── faq/
├── help/
└── how-it-works/
```

**Authentication pages:** `src/app/(auth)/`
```
(auth)/
├── login/
├── signup/
└── admin-login/
```

**Customer pages:** `src/app/(customer)/`
```
(customer)/
├── account/
├── marketplace/
├── cart/
├── checkout/
└── orders/
```

### Route Redirects

**Automatic redirects:**
- `/register` → `/signup` (duplicate removed)
- `/admin/login` → `/(auth)/admin-login`

**Create links to new routes:**
```typescript
// Old way (still works with redirects)
<Link href="/login">Login</Link>

// New way (direct to route group)
<Link href="/(auth)/login">Login</Link>

// But you can use old way - middleware handles it!
```

---

## ✅ Verification & Testing

### Run Full Verification

**Command:**
```bash
npx tsx scripts/verify-implementation.ts
```

**What it checks:**
- ✅ All files exist
- ✅ Routes properly organized
- ✅ Database connectivity
- ✅ Sitemap content
- ✅ Robots.txt configuration
- ✅ Structured data components
- ✅ Middleware configuration
- ✅ Onboarding tour setup
- ✅ Real-time notifications
- ✅ Documentation complete

**Expected output:**
```
✅ Passed: 51/52 tests (98.1%)
Status: READY FOR DEPLOYMENT
```

### Manual Testing Checklist

**Test sitemap:**
```bash
# Start dev server
npm run dev

# In another terminal
curl http://localhost:3001/sitemap.xml | head -50
```

**Test robots.txt:**
```bash
curl http://localhost:3001/robots.txt
```

**Test route redirects:**
```bash
# Should redirect to /signup
curl -I http://localhost:3001/register
```

**Test onboarding tour:**
1. Open browser
2. Open DevTools → Application → Local Storage
3. Clear localStorage
4. Visit homepage
5. Wait 1 second - tour should appear

**Test real-time notifications:**
1. Login as user
2. Open DevTools → Network tab
3. Filter for "stream"
4. Verify EventSource connection established
5. Check console for "connected" message

---

## 🐛 Troubleshooting

### Sitemap not generating

**Problem:** Sitemap shows error or empty
**Solution:**
```bash
# Check database connection
npx prisma studio

# Verify environment variables
echo $DATABASE_URL

# Check logs
npm run dev
# Visit /sitemap.xml and check terminal
```

### Tours not showing

**Problem:** Onboarding tour doesn't appear
**Solution:**
```typescript
// Clear tour completion flags
localStorage.removeItem('tour-completed-homepage-tour');

// Or clear all
localStorage.clear();

// Reload page
```

### Notifications not connecting

**Problem:** Real-time notifications not working
**Solution:**
```bash
# Check if SSE endpoint exists
curl http://localhost:3001/api/notifications/stream

# Check authentication
# Make sure you're logged in

# Check browser console for errors
# Look for EventSource errors
```

### Route 404 errors

**Problem:** New route structure causes 404s
**Solution:**
```bash
# Verify route exists
ls -la "src/app/(auth)/login"

# Check middleware configuration
cat src/middleware.ts | grep "register"

# Restart dev server
npm run dev
```

---

## 📖 Additional Resources

### Documentation
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Complete technical details
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Pre/post deployment steps
- [API_CONSOLIDATION_PLAN.md](./docs/API_CONSOLIDATION_PLAN.md) - Future API changes
- [WEBSITE_STRUCTURE_ANALYSIS_AND_RECOMMENDATIONS.md](./WEBSITE_STRUCTURE_ANALYSIS_AND_RECOMMENDATIONS.md) - Full analysis

### External Links
- [Next.js App Router](https://nextjs.org/docs/app)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Schema.org](https://schema.org) - Structured data reference
- [Google Rich Results Test](https://search.google.com/test/rich-results)

---

## 🎓 Common Use Cases

### Add structured data to new page type

1. Open `src/components/seo/StructuredData.tsx`
2. Create new component (follow existing patterns)
3. Import in your page
4. Pass data as props
5. Test with Google Rich Results Test

### Create new onboarding tour

1. Open `src/components/onboarding/OnboardingTour.tsx`
2. Add to `TOURS` array
3. Define steps with targets and content
4. Test by clearing localStorage
5. Adjust timing and positioning

### Display real-time notifications

1. Import `useRealtimeNotifications` hook
2. Destructure needed values/functions
3. Render notification UI
4. Handle mark as read
5. Request browser permission

### Add new route group

1. Create folder: `src/app/(group-name)/`
2. Create layout: `src/app/(group-name)/layout.tsx`
3. Move/create pages inside group
4. Update middleware if needed
5. Test routing

---

## 💡 Pro Tips

### SEO
- ✅ Add structured data to every public page
- ✅ Keep product/farm data up-to-date for sitemap
- ✅ Monitor Google Search Console weekly
- ✅ Test rich snippets before deploying

### User Experience
- ✅ Keep tours under 5 steps
- ✅ Use clear, actionable language
- ✅ Test tours on mobile devices
- ✅ Provide skip option

### Performance
- ✅ Limit sitemap to 50,000 URLs
- ✅ Cache structured data when possible
- ✅ Debounce notification updates
- ✅ Use lazy loading for heavy components

### Development
- ✅ Run verification before commits
- ✅ Clear localStorage when testing tours
- ✅ Check Network tab for SSE issues
- ✅ Use TypeScript strict mode

---

## 🚀 Quick Commands

```bash
# Verify implementation
npx tsx scripts/verify-implementation.ts

# Build for production
npm run build

# Start dev server
npm run dev

# Type checking
npm run type-check

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

---

## ✨ What's Next?

### Phase 2 (Coming Soon)
- 🔄 API consolidation (cleaner endpoints)
- 📁 Component reorganization (better structure)
- 🔍 Elasticsearch integration (advanced search)
- 📚 API documentation portal (Swagger)
- 📖 Component Storybook (design system)

### Stay Updated
- Check `IMPLEMENTATION_ROADMAP.md` for timeline
- Review `docs/API_CONSOLIDATION_PLAN.md` for API changes
- Watch for Phase 2 announcements

---

**Need Help?**
- 📧 Email: dev-team@farmersmarket.app
- 💬 Slack: #engineering-support
- 📚 Full docs: See links above

---

**Version:** 2.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** December 2024

_"Quick start. Big impact."_ 🌾✨