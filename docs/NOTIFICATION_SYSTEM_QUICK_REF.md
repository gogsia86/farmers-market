# 🔔 Notification System Quick Reference Card

**Last Updated**: November 15, 2024
**Version**: 1.0 (Phase 2 Complete)

---

## 🚀 Quick Start

### Display Notifications in Dashboard
```tsx
import { NotificationCenter } from '@/components/features/notifications/notification-center';

export default function DashboardPage() {
  return (
    <div>
      <NotificationCenter />
    </div>
  );
}
```

### Add Notification Preferences Page
```tsx
import { NotificationPreferences } from '@/components/features/notifications/notification-preferences';

export default function SettingsPage() {
  return (
    <div>
      <NotificationPreferences />
    </div>
  );
}
```

### Send a Notification
```typescript
import { notificationService } from '@/lib/services/notification.service';

await notificationService.createNotification({
  userId: user.id,
  type: 'ORDER_CONFIRMED',
  channels: ['EMAIL', 'IN_APP', 'PUSH'],
  title: 'Order Confirmed!',
  body: 'Your order #12345 has been confirmed',
  data: {
    orderId: order.id,
    orderNumber: order.orderNumber
  }
});
```

---

## 📡 API Endpoints

### GET /api/notifications
**Fetch user notifications (paginated)**

Query Parameters:
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `unreadOnly` (boolean, default: false)
- `type` (NotificationType, optional)

```typescript
const response = await fetch('/api/notifications?page=1&limit=20&unreadOnly=true');
const data = await response.json();
// data.data.notifications: Notification[]
// data.data.unreadCount: number
// data.data.pagination: { page, limit, total, totalPages }
```

### PATCH /api/notifications/[id]
**Mark notification as read**

```typescript
await fetch(`/api/notifications/${notificationId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ isRead: true })
});
```

### DELETE /api/notifications
**Clear all read notifications**

```typescript
const response = await fetch('/api/notifications', { method: 'DELETE' });
const data = await response.json();
// data.data.cleared: number (count of deleted notifications)
```

### GET /api/notifications/preferences
**Get user notification preferences**

```typescript
const response = await fetch('/api/notifications/preferences');
const data = await response.json();
// data.data: NotificationPreferences
```

### PATCH /api/notifications/preferences
**Update notification preferences**

```typescript
await fetch('/api/notifications/preferences', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emailOrders: true,
    emailReviews: false,
    pushOrders: true
  })
});
```

---

## 🎨 Component Props

### NotificationCenter
```typescript
<NotificationCenter
  className="shadow-lg"           // Optional styling
  autoRefresh={true}              // Enable auto-refresh (default: true)
  refreshInterval={30000}         // Refresh interval in ms (default: 30000)
/>
```

### NotificationPreferences
```typescript
<NotificationPreferences
  className="max-w-4xl mx-auto"   // Optional styling
  onSave={() => {                 // Callback after save
    console.log('Saved!');
  }}
/>
```

---

## 📊 Notification Types

```typescript
type NotificationType =
  | "ORDER_PLACED"
  | "ORDER_CONFIRMED"
  | "ORDER_READY"
  | "ORDER_FULFILLED"
  | "ORDER_CANCELLED"
  | "PAYMENT_RECEIVED"
  | "PAYOUT_PROCESSED"
  | "NEW_MESSAGE"
  | "REVIEW_RECEIVED"
  | "QUALITY_ISSUE"
  | "LOW_STOCK"
  | "SYSTEM_ANNOUNCEMENT";
```

---

## 🎯 Common Use Cases

### 1. Send Order Notification
```typescript
import { notificationService } from '@/lib/services/notification.service';

await notificationService.sendOrderNotification(
  order.userId,
  order,
  'CONFIRMED' // or 'PENDING', 'READY', 'FULFILLED', 'CANCELLED'
);
```

### 2. Send Payment Notification
```typescript
await notificationService.sendPaymentNotification(
  payment.userId,
  payment,
  'Payment received for order #' + order.orderNumber
);
```

### 3. Send Low Stock Alert
```typescript
await notificationService.sendLowStockAlert(
  product.farmId,
  product
);
```

### 4. Send Bulk Announcement
```typescript
await notificationService.sendSystemAnnouncement(
  'Platform maintenance scheduled for tonight',
  'We will be performing maintenance from 11 PM to 1 AM PST.'
);
```

---

## 🔐 Authentication

All API endpoints require authentication. Session is handled automatically:

```typescript
// In API routes
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "..." } },
      { status: 401 }
    );
  }

  // Use session.user.id
}
```

Components don't need to pass userId - it's extracted from session in the API.

---

## 💾 Database Schema

### Notification Model
```prisma
model Notification {
  id        String              @id @default(cuid())
  userId    String?
  farmId    String?
  type      NotificationType
  channel   NotificationChannel
  title     String              @db.VarChar(255)
  body      String
  data      Json?
  isRead    Boolean             @default(false)
  readAt    DateTime?
  sentAt    DateTime?
  createdAt DateTime            @default(now())

  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
}
```

### NotificationPreferences Model
```prisma
model NotificationPreferences {
  id              String   @id @default(cuid())
  userId          String   @unique
  emailOrders     Boolean  @default(true)
  emailReviews    Boolean  @default(true)
  emailPromotions Boolean  @default(false)
  emailNewsletter Boolean  @default(false)
  inAppOrders     Boolean  @default(true)
  inAppReviews    Boolean  @default(true)
  inAppMessages   Boolean  @default(true)
  pushOrders      Boolean  @default(true)
  pushReviews     Boolean  @default(true)
  pushPromotions  Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## 🎨 UI Features

### NotificationCenter
- ✅ Auto-refresh every 30 seconds
- ✅ Unread count badge
- ✅ Filter: All / Unread
- ✅ Color-coded by type
- ✅ Click to mark as read
- ✅ Mark all as read
- ✅ Clear read notifications
- ✅ Pagination
- ✅ Manual refresh button

### NotificationPreferences
- ✅ Email preferences (4 types)
- ✅ In-App preferences (3 types)
- ✅ Push preferences (3 types)
- ✅ Quick actions (Enable All, Essential Only)
- ✅ Visual feedback on save
- ✅ Last updated timestamp

---

## 🐛 Troubleshooting

### Notifications not showing?
1. Check user is authenticated: `const session = await auth()`
2. Verify notifications exist in database
3. Check browser console for errors
4. Verify API endpoint returns data: `/api/notifications`

### Can't mark as read?
1. Check network tab for API call
2. Verify notification belongs to current user
3. Check response status code (should be 200)

### Preferences not saving?
1. Verify PATCH request is sent (not POST)
2. Check request body format matches API
3. Verify user is authenticated
4. Check database for updated record

---

## 📈 Performance Tips

### Frontend
- Use `autoRefresh={false}` if real-time updates not needed
- Increase `refreshInterval` to reduce API calls
- Implement pagination for large notification lists

### Backend
- Notifications are indexed on `userId`, `isRead`, `createdAt`
- Use `limit` parameter to control page size
- Consider Redis caching for unread counts

---

## 🔮 Coming Soon (Phase 3)

- ⚡ WebSocket real-time updates
- 🎯 Admin notification dashboard
- 📊 Analytics and insights
- 🔔 Rich notifications with actions
- 🗂️ Notification grouping
- 🔍 Advanced filtering and search

---

## 📚 Full Documentation

For complete documentation, see:
- `docs/PRIORITY_5_PHASE_2_NOTIFICATION_API_INTEGRATION.md` - Complete system guide
- `docs/CONTINUOUS_SESSION_09_NOTIFICATION_INTEGRATION.md` - Implementation details

---

## 🆘 Need Help?

1. Check TypeScript types in components
2. Review API endpoint responses
3. Verify database schema matches expectations
4. Check divine instruction files in `.github/instructions/`
5. Review this quick reference card

---

**Status**: ✅ Production Ready
**Last Tested**: November 15, 2024
**Maintained By**: Farmers Market Platform Team
