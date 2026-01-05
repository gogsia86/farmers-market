# 🔔 Notification System - Quick Reference Guide

**Version**: 1.0.0
**Last Updated**: November 15, 2024
**Status**: Production Ready

---

## 🚀 Quick Start (30 seconds)

```tsx
import { useToast } from "@/hooks/use-notifications";

function MyComponent() {
  const { toast } = useToast();

  return (
    <button onClick={() => toast.success("Done!")}>
      Click Me
    </button>
  );
}
```

---

## 📋 Table of Contents

1. [Toast Notifications](#toast-notifications)
2. [Banner Alerts](#banner-alerts)
3. [Agricultural Notifications](#agricultural-notifications)
4. [Notification Center](#notification-center)
5. [User Preferences](#user-preferences)
6. [Type Reference](#type-reference)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting](#troubleshooting)

---

## 🍞 Toast Notifications

### Basic Usage

```tsx
import { useToast } from "@/hooks/use-notifications";

const { toast } = useToast();

// Simple toast
toast.info("Hello, World!");

// With all options
toast.success("Farm created!", {
  duration: 5000,
  position: "top-right",
  actions: [
    {
      id: "view",
      label: "View Farm",
      type: "primary",
      onClick: () => router.push("/farms/123")
    }
  ]
});
```

### Severity Variants

```tsx
// Info (blue) - General information
toast.info("New feature available");

// Success (green) - Successful operations
toast.success("Changes saved successfully");

// Warning (yellow) - Warnings or cautions
toast.warning("Low stock alert");

// Error (red) - Errors (persistent by default)
toast.error("Failed to save changes");

// Agricultural (emerald) - Farm-related events
toast.agricultural("Harvest season has begun!");
```

### Position Options

```tsx
// 6 positions available
toast.info("Top Left", { position: "top-left" });
toast.info("Top Center", { position: "top-center" });
toast.info("Top Right", { position: "top-right" });
toast.info("Bottom Left", { position: "bottom-left" });
toast.info("Bottom Center", { position: "bottom-center" });
toast.info("Bottom Right", { position: "bottom-right" });
```

### Duration Control

```tsx
// Auto-dismiss after 3 seconds
toast.info("Quick message", { duration: 3000 });

// Auto-dismiss after 10 seconds
toast.info("Longer message", { duration: 10000 });

// Persistent (never auto-dismiss)
toast.error("Critical error", { duration: 0 });
```

### With Action Buttons

```tsx
toast.info("Order received!", {
  actions: [
    {
      id: "track",
      label: "Track Order",
      type: "primary",
      onClick: () => router.push("/orders/123")
    },
    {
      id: "dismiss",
      label: "Dismiss",
      type: "secondary",
      onClick: () => toast.dismiss(toastId)
    }
  ]
});
```

### Dismiss Toasts

```tsx
// Dismiss specific toast
const toastId = toast.info("Loading...");
// ... later
toast.dismiss(toastId);

// Dismiss all toasts
toast.dismissAll();
```

---

## 🎯 Banner Alerts

### Basic Usage

```tsx
import { useBanner } from "@/hooks/use-notifications";

const { banner } = useBanner();

// Simple banner
banner.info("System Update", "New features available");

// With all options
banner.warning(
  "Maintenance",
  "Scheduled downtime tonight at 11 PM",
  {
    position: "top",
    sticky: true,
    variant: "filled",
    actions: [
      {
        id: "details",
        label: "View Details",
        type: "primary",
        onClick: () => router.push("/maintenance")
      }
    ]
  }
);
```

### Severity Variants

```tsx
banner.info("Info", "General information");
banner.success("Success", "Operation completed");
banner.warning("Warning", "Important notice");
banner.error("Error", "Critical issue detected");
banner.agricultural("Harvest", "Fresh produce available!");
```

### Position Types

```tsx
// Top of page (full width)
banner.info("Title", "Message", { position: "top" });

// Bottom of page (full width)
banner.info("Title", "Message", { position: "bottom" });

// Inline (embedded in content)
banner.info("Title", "Message", { position: "inline" });
```

### Visual Variants

```tsx
// Default - Filled background
banner.info("Title", "Message", { variant: "default" });

// Outline - Border only
banner.info("Title", "Message", { variant: "outline" });

// Filled - Solid color background
banner.info("Title", "Message", { variant: "filled" });
```

### Sticky Positioning

```tsx
// Sticky at top (stays on scroll)
banner.warning("Alert", "Important message", {
  position: "top",
  sticky: true
});

// Sticky at bottom
banner.info("Notice", "Announcement", {
  position: "bottom",
  sticky: true
});
```

---

## 🌾 Agricultural Notifications

### Harvest Events

```tsx
import { useAgriculturalNotifications } from "@/hooks/use-notifications";

const {
  notifyHarvest,
  notifyPlanting,
  notifyProductAvailable
} = useAgriculturalNotifications();

// Harvest notification
notifyHarvest({
  farmName: "Green Valley Farm",
  productName: "Organic Tomatoes",
  cropType: "Tomatoes"
});

// Planting notification
notifyPlanting({
  farmName: "Sunny Acres",
  cropType: "Carrots"
});

// Product available
notifyProductAvailable({
  farmName: "Fresh Fields",
  productName: "Sweet Corn"
});
```

### Season Changes

```tsx
const { notifySeasonChange } = useAgriculturalNotifications();

// Announce season change
notifySeasonChange("spring"); // 🌱 Spring has arrived!
notifySeasonChange("summer"); // ☀️ Summer season begins!
notifySeasonChange("fall");   // 🍂 Fall harvest season!
notifySeasonChange("winter"); // ❄️ Winter season!
```

### Stock Alerts

```tsx
const { notifyLowStock } = useAgriculturalNotifications();

// Low stock warning
notifyLowStock({
  farmName: "Green Valley Farm",
  productName: "Strawberries"
});
```

### Market Status

```tsx
const { notifyMarketOpening } = useAgriculturalNotifications();

// Market opening announcement
notifyMarketOpening({
  farmName: "Community Farmers Market"
});
```

### Weather Alerts

```tsx
const { notifyWeatherAlert } = useAgriculturalNotifications();

// Weather alert
notifyWeatherAlert(
  "⚠️ Frost warning tonight - protect your crops!",
  {
    farmName: "All Farms",
    weatherCondition: "frost",
    temperature: -2
  }
);
```

---

## 📬 Notification Center

### Basic Usage

```tsx
import { useNotificationCenter } from "@/hooks/use-notifications";

function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearRead
  } = useNotificationCenter();

  return (
    <div>
      <h2>Notifications ({unreadCount} unread)</h2>
      <button onClick={markAllAsRead}>Mark All Read</button>
      <button onClick={clearRead}>Clear Read</button>

      {notifications.map((notification) => (
        <div key={notification.id}>
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
          {!notification.readAt && (
            <button onClick={() => markAsRead(notification.id)}>
              Mark as Read
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Filtering Notifications

```tsx
const { filter, setFilter } = useNotificationCenter();

// Filter by type
setFilter({ type: "in-app" });

// Filter by severity
setFilter({ severity: "error" });

// Filter by read status
setFilter({ read: false }); // Unread only

// Filter by date range
setFilter({
  dateRange: {
    start: new Date("2024-11-01"),
    end: new Date("2024-11-30")
  }
});

// Filter by category
setFilter({ category: "orders" });

// Combine filters
setFilter({
  severity: ["warning", "error"],
  read: false,
  category: "farms"
});
```

### Archive & Pin

```tsx
const {
  archiveNotification,
  unarchiveNotification,
  pinNotification,
  unpinNotification
} = useNotificationCenter();

// Archive notification
archiveNotification("notif_123");

// Unarchive notification
unarchiveNotification("notif_123");

// Pin notification (keeps at top)
pinNotification("notif_456");

// Unpin notification
unpinNotification("notif_456");
```

### Statistics

```tsx
const { stats } = useNotificationCenter();

console.log(stats.total);        // Total notifications
console.log(stats.unread);       // Unread count
console.log(stats.bySeverity);   // Count by severity
console.log(stats.byPriority);   // Count by priority
console.log(stats.byType);       // Count by type
console.log(stats.avgAge);       // Average age in ms
```

---

## ⚙️ User Preferences

### Basic Usage

```tsx
import { useNotificationPreferences } from "@/hooks/use-notifications";

function PreferencesPage() {
  const {
    preferences,
    updatePreferences,
    toggleChannel,
    toggleQuietHours
  } = useNotificationPreferences("user_123");

  return (
    <div>
      {/* Toggle channels */}
      <button onClick={() => toggleChannel("push")}>
        Push: {preferences.channels.push.enabled ? "ON" : "OFF"}
      </button>

      {/* Toggle quiet hours */}
      <button onClick={toggleQuietHours}>
        Quiet Hours: {preferences.quietHours?.enabled ? "ON" : "OFF"}
      </button>
    </div>
  );
}
```

### Channel Management

```tsx
const { preferences, updatePreferences } = useNotificationPreferences("user_123");

// Enable/disable channels
updatePreferences({
  channels: {
    inApp: { enabled: true },
    push: { enabled: true, minPriority: "medium" },
    email: { enabled: true, minPriority: "high" },
    sms: { enabled: false }
  }
});
```

### Quiet Hours

```tsx
updatePreferences({
  quietHours: {
    enabled: true,
    startTime: "22:00",  // 10 PM
    endTime: "08:00",    // 8 AM
    timezone: "America/New_York",
    allowUrgent: true    // Allow urgent notifications
  }
});
```

### Frequency Limits

```tsx
updatePreferences({
  frequencyLimits: {
    perHour: 10,    // Max 10 per hour
    perDay: 50      // Max 50 per day
  }
});
```

---

## 📘 Type Reference

### NotificationSeverity

```typescript
type NotificationSeverity =
  | "info"           // Blue - General information
  | "success"        // Green - Successful operations
  | "warning"        // Yellow - Warnings/cautions
  | "error"          // Red - Errors
  | "agricultural";  // Emerald - Farm events
```

### NotificationPriority

```typescript
type NotificationPriority =
  | "low"      // Can wait
  | "medium"   // Normal priority
  | "high"     // Important
  | "urgent";  // Immediate attention
```

### ToastPosition

```typescript
type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";
```

### BannerPosition

```typescript
type BannerPosition =
  | "top"      // Full-width top
  | "bottom"   // Full-width bottom
  | "inline";  // Embedded in content
```

### Season

```typescript
type Season =
  | "spring"  // Mar-May, Green theme 🌱
  | "summer"  // Jun-Aug, Yellow theme ☀️
  | "fall"    // Sep-Nov, Orange theme 🍂
  | "winter"; // Dec-Feb, Blue theme ❄️
```

---

## 🎨 Common Patterns

### Form Submission

```tsx
const { toast } = useToast();

async function handleSubmit(data) {
  try {
    await createFarm(data);
    toast.success("Farm created successfully!");
    router.push("/farms");
  } catch (error) {
    toast.error(`Failed to create farm: ${error.message}`);
  }
}
```

### Async Operations with Loading

```tsx
const { toast } = useToast();

async function handleAction() {
  const toastId = toast.info("Processing...", { duration: 0 });

  try {
    await performAction();
    toast.dismiss(toastId);
    toast.success("Action completed!");
  } catch (error) {
    toast.dismiss(toastId);
    toast.error("Action failed!");
  }
}
```

### Confirmation with Actions

```tsx
const { toast } = useToast();

function showDeleteConfirmation(itemId) {
  toast.warning("Are you sure you want to delete this?", {
    duration: 0,
    actions: [
      {
        id: "confirm",
        label: "Delete",
        type: "primary",
        onClick: async () => {
          await deleteItem(itemId);
          toast.success("Deleted successfully");
        }
      },
      {
        id: "cancel",
        label: "Cancel",
        type: "secondary",
        onClick: () => toast.dismiss(toastId)
      }
    ]
  });
}
```

### System Announcements

```tsx
const { banner } = useBanner();

// Show maintenance banner
banner.warning(
  "Scheduled Maintenance",
  "System will be down tonight at 11 PM for 2 hours",
  {
    position: "top",
    sticky: true,
    variant: "filled",
    actions: [
      {
        id: "details",
        label: "View Details",
        type: "primary",
        href: "/maintenance"
      }
    ]
  }
);
```

### Real-time Updates

```tsx
const { toast } = useToast();

// WebSocket message handler
socket.on("order_update", (order) => {
  toast.success(`Order #${order.id} has been updated!`, {
    actions: [
      {
        id: "view",
        label: "View Order",
        type: "primary",
        onClick: () => router.push(`/orders/${order.id}`)
      }
    ]
  });
});
```

### Seasonal Greetings

```tsx
const { notifySeasonChange } = useAgriculturalNotifications();

useEffect(() => {
  const season = getCurrentSeason();
  notifySeasonChange(season);
}, []);
```

---

## 🔧 Troubleshooting

### Toast Not Showing

**Problem**: Toast notification doesn't appear

**Solutions**:
1. Check if ToastContainer is rendered
2. Verify hook is called inside component
3. Check z-index conflicts
4. Verify duration > 0 for auto-dismiss

```tsx
// Ensure ToastContainer is in layout
<ToastContainer position="top-right">
  {toasts.map((toast) => (
    <Toast key={toast.id} notification={toast} />
  ))}
</ToastContainer>
```

### Auto-dismiss Not Working

**Problem**: Toast stays visible forever

**Solutions**:
1. Check duration prop (0 = persistent)
2. Verify timer cleanup
3. Check if component unmounted prematurely

```tsx
// Explicit duration
toast.info("Message", { duration: 5000 });

// Persistent (duration: 0)
toast.error("Error", { duration: 0 });
```

### Notifications Not Filtered

**Problem**: Filter not working in notification center

**Solutions**:
1. Verify filter object structure
2. Check notification metadata
3. Use correct field names

```tsx
// Correct filter structure
setFilter({
  severity: "error",    // Single value
  type: ["in-app"],     // Array of values
  read: false           // Boolean
});
```

### Agricultural Events Not Showing Season

**Problem**: Agricultural notifications missing season

**Solutions**:
1. Check getCurrentSeason() is working
2. Verify agricultural metadata
3. Pass season explicitly if needed

```tsx
// Explicit season
notifyHarvest({
  farmName: "Farm",
  season: "fall"  // Explicit season
});
```

### Styling Issues

**Problem**: Notifications look broken

**Solutions**:
1. Verify Tailwind CSS configured
2. Check CVA installed
3. Import component CSS if needed

```bash
npm install class-variance-authority clsx tailwind-merge
```

---

## 🎯 Best Practices

### 1. Use Appropriate Severity

```tsx
// ✅ Good
toast.success("Farm created successfully");
toast.error("Failed to save changes");
toast.warning("Low stock alert");

// ❌ Bad
toast.info("Critical error occurred");  // Use error severity
toast.error("Settings saved");          // Use success severity
```

### 2. Provide Context

```tsx
// ✅ Good
toast.error("Failed to create farm: Name already exists");

// ❌ Bad
toast.error("Error");
```

### 3. Use Actions for Next Steps

```tsx
// ✅ Good
toast.success("Order placed!", {
  actions: [
    { id: "view", label: "View Order", type: "primary" }
  ]
});

// ❌ Bad
toast.success("Order placed! Click here to view");
```

### 4. Set Appropriate Durations

```tsx
// ✅ Good
toast.info("Quick info", { duration: 3000 });
toast.error("Critical error", { duration: 0 });

// ❌ Bad
toast.info("Long message with many details...", { duration: 1000 });
```

### 5. Limit Notification Frequency

```tsx
// ✅ Good - Debounce frequent events
const debouncedNotify = debounce(() => {
  toast.info("Updates available");
}, 5000);

// ❌ Bad - Spam notifications
realtime.on("update", () => toast.info("Update"));
```

---

## 📦 Component Props Reference

### Toast Props

```typescript
interface ToastProps {
  notification: ToastNotification;
  onDismiss?: () => void;
  onActionClick?: (actionId: string) => void;
  severity?: NotificationSeverity;
  animation?: "slide" | "fade" | "bounce" | "grow";
}
```

### Banner Props

```typescript
interface BannerProps {
  notification: BannerNotification;
  onDismiss?: () => void;
  onActionClick?: (actionId: string) => void;
  severity?: NotificationSeverity;
  variant?: "default" | "outline" | "filled";
  position?: "top" | "bottom" | "inline";
}
```

### ToastOptions

```typescript
interface ToastOptions {
  severity?: NotificationSeverity;
  priority?: NotificationPriority;
  position?: ToastPosition;
  duration?: number;
  dismissible?: boolean;
  actions?: NotificationAction[];
  metadata?: NotificationMetadata;
  icon?: string;
}
```

---

## 🔗 Related Documentation

- **[Complete Implementation Guide](./WEEK_2_DAY_11_COMPLETION_CERTIFICATE.md)** - Full documentation
- **[Day 11 Summary](./DAY_11_SUMMARY.md)** - Implementation summary
- **[Week 2 Progress](./WEEK_2_PROGRESS.md)** - Overall progress tracker

---

## 💡 Pro Tips

1. **Batch Similar Notifications**: Group related notifications to avoid spam
2. **Use Agricultural Events**: Leverage domain-specific notifications for better UX
3. **Test Accessibility**: Always test with screen readers
4. **Monitor Notification Volume**: Track how many notifications users receive
5. **Respect User Preferences**: Honor quiet hours and channel preferences
6. **Provide Dismissal**: Always allow users to dismiss non-critical notifications
7. **Use Priorities Wisely**: Reserve "urgent" for true emergencies
8. **Add Actions**: Make notifications actionable when possible
9. **Seasonal Awareness**: Use agricultural consciousness for farm-related features
10. **Performance**: Debounce frequent notification triggers

---

## 🌟 Quick Copy-Paste Examples

### Basic Toast
```tsx
const { toast } = useToast();
toast.success("Done!");
```

### Toast with Action
```tsx
toast.info("Order placed!", {
  actions: [
    { id: "view", label: "View", type: "primary", onClick: () => router.push("/orders") }
  ]
});
```

### Sticky Banner
```tsx
const { banner } = useBanner();
banner.warning("Alert", "Important message", { position: "top", sticky: true });
```

### Harvest Notification
```tsx
const { notifyHarvest } = useAgriculturalNotifications();
notifyHarvest({ farmName: "Green Valley", productName: "Tomatoes" });
```

### Error with Recovery
```tsx
try {
  await action();
  toast.success("Success!");
} catch (error) {
  toast.error(`Failed: ${error.message}`, {
    actions: [{ id: "retry", label: "Retry", type: "primary", onClick: action }]
  });
}
```

---

**Version**: 1.0.0 | **Status**: Production Ready | **Support**: See full documentation
