# 🚀 Quick Reference Guide - Three Critical Features

**Last Updated**: December 2024  
**Status**: ✅ Production Ready

---

## 📋 Overview

This guide provides quick copy-paste examples for the three newly implemented features:

1. **Product Favorites** - Persist user favorites for products
2. **Farm Favorites** - Save/favorite farms from profile pages
3. **Payout Schedule API** - Manage farmer payout schedules

---

## 1️⃣ Product Favorites API

### API Endpoints

#### Get User Favorites

```http
GET /api/users/favorites
Authorization: Required (session-based)

Response:
{
  "success": true,
  "data": [
    {
      "id": "fav_123",
      "userId": "user_123",
      "productId": "prod_456",
      "farmId": null,
      "createdAt": "2024-12-01T12:00:00Z"
    }
  ]
}
```

#### Add Product to Favorites

```http
POST /api/users/favorites
Authorization: Required (session-based)
Content-Type: application/json

Body:
{
  "productId": "prod_456"
}

Response:
{
  "success": true,
  "data": {
    "id": "fav_123",
    "userId": "user_123",
    "productId": "prod_456",
    "createdAt": "2024-12-01T12:00:00Z"
  }
}
```

#### Remove Product from Favorites

```http
DELETE /api/users/favorites?productId=prod_456
Authorization: Required (session-based)

Response:
{
  "success": true,
  "message": "Favorite removed successfully"
}
```

### Frontend Implementation

#### Load Favorites on Mount

```typescript
import { useState, useEffect } from "react";

export function ProductsPage() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await fetch("/api/users/favorites");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const favoriteIds = new Set<string>(
              data.data
                .filter((fav: any) => fav.productId)
                .map((fav: any) => fav.productId as string),
            );
            setFavorites(favoriteIds);
          }
        }
      } catch (error) {
        console.error("Failed to load favorites:", error);
      }
    };

    loadFavorites();
  }, []);

  // Rest of component...
}
```

#### Toggle Favorite with Optimistic Update

```typescript
const toggleFavorite = async (productId: string) => {
  const isFavorited = favorites.has(productId);

  // Optimistic update
  setFavorites((prev) => {
    const newFavorites = new Set(prev);
    if (isFavorited) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    return newFavorites;
  });

  try {
    if (isFavorited) {
      // Unfavorite
      const response = await fetch(
        `/api/users/favorites?productId=${productId}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Failed to unfavorite");
    } else {
      // Favorite
      const response = await fetch("/api/users/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!response.ok) throw new Error("Failed to favorite");
    }
  } catch (error) {
    console.error("Failed to toggle favorite:", error);

    // Rollback on error
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (isFavorited) {
        newFavorites.add(productId);
      } else {
        newFavorites.delete(productId);
      }
      return newFavorites;
    });

    alert("Failed to update favorite. Please try again.");
  }
};
```

---

## 2️⃣ Farm Favorites

### API Endpoints

#### Add Farm to Favorites

```http
POST /api/users/favorites
Authorization: Required (session-based)
Content-Type: application/json

Body:
{
  "farmId": "farm_789"
}

Response:
{
  "success": true,
  "data": {
    "id": "fav_456",
    "userId": "user_123",
    "farmId": "farm_789",
    "createdAt": "2024-12-01T12:00:00Z"
  }
}
```

#### Remove Farm from Favorites

```http
DELETE /api/users/favorites?farmId=farm_789
Authorization: Required (session-based)

Response:
{
  "success": true,
  "message": "Favorite removed successfully"
}
```

### Frontend Implementation

#### FarmProfileActions Component (Complete)

```typescript
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";

interface FarmProfileActionsProps {
  farmId: string;
  farmName: string;
}

export function FarmProfileActions({
  farmId,
  farmName,
}: FarmProfileActionsProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial favorite status
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      try {
        const response = await fetch("/api/users/favorites");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const isFarmFavorited = data.data.some(
              (fav: any) => fav.farmId === farmId
            );
            setIsFavorited(isFarmFavorited);
          }
        }
      } catch (error) {
        console.error("Failed to load favorite status:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavoriteStatus();
  }, [farmId]);

  const toggleFavorite = async () => {
    const previousState = isFavorited;
    setIsFavorited(!isFavorited);

    try {
      if (isFavorited) {
        const response = await fetch(`/api/users/favorites?farmId=${farmId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to unfavorite farm");
      } else {
        const response = await fetch("/api/users/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ farmId }),
        });
        if (!response.ok) throw new Error("Failed to favorite farm");
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      setIsFavorited(previousState);
      alert("Failed to update favorite. Please try again.");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: farmName,
      text: `Check out ${farmName} on our Farmers Market Platform!`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Failed to share:", error);
    }
  };

  return (
    <div className="flex flex-wrap gap-4">
      <Button
        size="lg"
        variant="outline"
        className="gap-2"
        onClick={toggleFavorite}
        disabled={loading}
      >
        <Heart
          className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
        />
        {isFavorited ? "Saved" : "Save Farm"}
      </Button>
      <Button size="lg" variant="outline" className="gap-2" onClick={handleShare}>
        <Share2 className="h-5 w-5" />
        Share
      </Button>
    </div>
  );
}
```

#### Usage in Farm Profile Page

```typescript
import { FarmProfileActions } from "@/components/marketplace/FarmProfileActions";

export default async function FarmProfilePage({ params }: PageProps) {
  const farm = await getFarmBySlug(params.slug);

  return (
    <main>
      <h1>{farm.name}</h1>
      {/* ... other farm details ... */}

      <FarmProfileActions farmId={farm.id} farmName={farm.name} />
    </main>
  );
}
```

---

## 3️⃣ Payout Schedule API

### Database Schema

The `payoutSchedule` field is stored as JSON on the Farm model:

```prisma
model Farm {
  // ... other fields
  payoutSchedule Json?  // Stores payout schedule configuration
  // ... other fields
}
```

### API Endpoints

#### Get Payout Schedule

```http
GET /api/farmer/payout-schedule?farmId=farm_123
Authorization: Required (farmer must own the farm)

Response:
{
  "success": true,
  "schedule": {
    "frequency": "WEEKLY",
    "dayOfWeek": 1,
    "minimumAmount": 100
  }
}
```

#### Update Payout Schedule

```http
PUT /api/farmer/payout-schedule
Authorization: Required (farmer must own the farm)
Content-Type: application/json

Body:
{
  "farmId": "farm_123",
  "schedule": {
    "frequency": "WEEKLY",
    "dayOfWeek": 1,
    "minimumAmount": 100
  }
}

Response:
{
  "success": true,
  "data": {
    "farmId": "farm_123",
    "schedule": {
      "frequency": "WEEKLY",
      "dayOfWeek": 1,
      "minimumAmount": 100
    }
  },
  "message": "Payout schedule updated successfully"
}
```

### Schedule Configuration

#### Daily Payout

```json
{
  "frequency": "DAILY",
  "minimumAmount": 50
}
```

#### Weekly Payout

```json
{
  "frequency": "WEEKLY",
  "dayOfWeek": 1,
  "minimumAmount": 100
}
```

- `dayOfWeek`: 0 (Sunday) through 6 (Saturday)

#### Monthly Payout

```json
{
  "frequency": "MONTHLY",
  "dayOfMonth": 15,
  "minimumAmount": 500
}
```

- `dayOfMonth`: 1 through 31

### Validation Rules

- **frequency**: Must be one of `DAILY`, `WEEKLY`, or `MONTHLY`
- **minimumAmount**: Must be between $10 and $10,000
- **dayOfWeek**: Required for WEEKLY, must be 0-6
- **dayOfMonth**: Required for MONTHLY, must be 1-31

### Frontend Implementation

#### Fetch Payout Schedule

```typescript
const fetchPayoutSchedule = async (farmId: string) => {
  try {
    const response = await fetch(
      `/api/farmer/payout-schedule?farmId=${farmId}`,
    );
    const data = await response.json();

    if (data.success && data.schedule) {
      setSchedule(data.schedule);
    }
  } catch (error) {
    console.error("Failed to fetch payout schedule:", error);
  }
};
```

#### Update Payout Schedule

```typescript
const updatePayoutSchedule = async (
  farmId: string,
  newSchedule: PayoutSchedule,
) => {
  try {
    const response = await fetch(`/api/farmer/payout-schedule`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ farmId, schedule: newSchedule }),
    });

    if (!response.ok) throw new Error("Failed to update schedule");

    const data = await response.json();
    console.log("Schedule updated:", data);
    alert("Payout schedule updated successfully!");
  } catch (error) {
    console.error("Error updating schedule:", error);
    alert("Failed to update schedule. Please try again.");
  }
};
```

#### Complete Form Example

```typescript
const [scheduleFrequency, setScheduleFrequency] = useState<
  "DAILY" | "WEEKLY" | "MONTHLY"
>("WEEKLY");
const [minimumAmount, setMinimumAmount] = useState<number>(100);
const [dayOfWeek, setDayOfWeek] = useState<number>(1);
const [dayOfMonth, setDayOfMonth] = useState<number>(15);

const handleSaveSchedule = async () => {
  const schedule: PayoutSchedule = {
    frequency: scheduleFrequency,
    minimumAmount: minimumAmount,
  };

  if (scheduleFrequency === "WEEKLY") {
    schedule.dayOfWeek = dayOfWeek;
  } else if (scheduleFrequency === "MONTHLY") {
    schedule.dayOfMonth = dayOfMonth;
  }

  await updatePayoutSchedule(farmId, schedule);
};
```

---

## 🔐 Authentication & Authorization

All three features require authentication:

```typescript
// Check authentication
const session = await auth();
if (!session?.user?.id) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication required",
      },
    },
    { status: 401 },
  );
}

// For payout schedule - verify farm ownership
const farm = await database.farm.findUnique({ where: { id: farmId } });
if (farm.ownerId !== session.user.id) {
  return NextResponse.json(
    {
      success: false,
      error: { code: "AUTHORIZATION_ERROR", message: "Unauthorized" },
    },
    { status: 403 },
  );
}
```

---

## 🧪 Testing Examples

### Test Product Favorites

```typescript
// Test: Add product to favorites
const response = await fetch("/api/users/favorites", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ productId: "test_prod_123" }),
});

expect(response.ok).toBe(true);
const data = await response.json();
expect(data.success).toBe(true);
expect(data.data.productId).toBe("test_prod_123");
```

### Test Farm Favorites

```typescript
// Test: Toggle farm favorite
const response = await fetch("/api/users/favorites", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ farmId: "test_farm_456" }),
});

expect(response.ok).toBe(true);
```

### Test Payout Schedule

```typescript
// Test: Update payout schedule
const schedule = {
  frequency: "WEEKLY",
  dayOfWeek: 5,
  minimumAmount: 200,
};

const response = await fetch("/api/farmer/payout-schedule", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ farmId: "test_farm_789", schedule }),
});

expect(response.ok).toBe(true);
const data = await response.json();
expect(data.data.schedule.frequency).toBe("WEEKLY");
```

---

## 🐛 Common Issues & Solutions

### Issue: Favorites not persisting

**Solution**: Verify user is authenticated and API endpoint is accessible.

```typescript
// Add logging
console.log("Session:", await auth());
console.log("API response:", await response.json());
```

### Issue: TypeScript errors after schema changes

**Solution**: Regenerate Prisma client and restart TypeScript server.

```bash
npx prisma generate
# Restart TypeScript server in your editor
```

### Issue: Payout schedule validation failing

**Solution**: Ensure required fields are present based on frequency.

```typescript
// For WEEKLY, dayOfWeek is required
if (frequency === "WEEKLY" && !dayOfWeek) {
  throw new Error("dayOfWeek is required for WEEKLY frequency");
}
```

---

## 📊 Database Queries

### Get all user favorites

```typescript
const favorites = await database.favorite.findMany({
  where: { userId: session.user.id },
  include: {
    product: true,
    farm: true,
  },
});
```

### Get farm payout schedule

```typescript
const farm = await database.farm.findUnique({
  where: { id: farmId },
  select: { payoutSchedule: true },
});
```

---

## 🚀 Deployment Notes

1. **Run migrations**: `npx prisma db push` (development) or `npx prisma migrate deploy` (production)
2. **Generate client**: `npx prisma generate`
3. **Environment variables**: Ensure `DATABASE_URL` is set correctly
4. **Build**: `npm run build` to verify everything compiles

---

## 📚 Related Files

- **Product Favorites**: `src/app/(customer)/marketplace/products/page.tsx`
- **Farm Favorites**: `src/components/marketplace/FarmProfileActions.tsx`
- **Payout API**: `src/app/api/farmer/payout-schedule/route.ts`
- **Favorites API**: `src/app/api/users/favorites/route.ts`
- **Database Schema**: `prisma/schema.prisma`

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

🌾 Happy coding!
