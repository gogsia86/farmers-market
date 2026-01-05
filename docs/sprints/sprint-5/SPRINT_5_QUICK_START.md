# ⚡ Sprint 5: Settings & Configuration - Quick Start Guide

**For Developers**: Get up and running with Sprint 5 settings components in 5 minutes.

---

## 🚀 Quick Setup

### 1. Import the Components

```typescript
import {
  NotificationSettings,
  DisplaySettings,
  PrivacySettings,
} from "@/components/settings";
```

### 2. Import Types

```typescript
import type {
  NotificationPreferences,
  DisplayPreferences,
  PrivacySettings as PrivacyPreferences,
  UserSettingsData,
} from "@/types/settings";
```

### 3. Fetch User Settings

```typescript
const response = await fetch("/api/settings/user");
const { data } = await response.json();
// data is UserSettingsData type
```

### 4. Use Components

```tsx
<NotificationSettings
  preferences={data.notifications}
  onChange={(updates) => handleChange("notifications", updates)}
  userRole="CUSTOMER"
/>
```

---

## 📋 Component Quick Reference

### NotificationSettings

**Purpose**: Manage multi-channel notification preferences

**Props**:

```typescript
{
  preferences: NotificationPreferences;
  onChange: (updates: Partial<NotificationPreferences>) => void;
  disabled?: boolean;
  userRole?: "CUSTOMER" | "FARMER" | "ADMIN";
}
```

**Features**:

- ✅ Email, SMS, Push, In-App channels
- ✅ Frequency settings (immediate, daily, weekly, never)
- ✅ Push-specific settings (sound, badge)
- ✅ Collapsible sections

**Example**:

```tsx
const [notifications, setNotifications] = useState<NotificationPreferences>({
  email: { enabled: true, frequency: "immediate" },
  sms: { enabled: false, frequency: "never" },
  push: { enabled: true, frequency: "immediate", sound: true, badge: true },
  inApp: { enabled: true, frequency: "immediate" },
});

<NotificationSettings
  preferences={notifications}
  onChange={(updates) => setNotifications({ ...notifications, ...updates })}
/>;
```

---

### DisplaySettings

**Purpose**: Theme, language, timezone, and regional preferences

**Props**:

```typescript
{
  preferences: DisplayPreferences;
  onChange: (updates: Partial<DisplayPreferences>) => void;
  disabled?: boolean;
}
```

**Features**:

- ✅ Theme selection (light, dark, system)
- ✅ Language selection (8 languages)
- ✅ Timezone selection (10 major zones)
- ✅ Distance units (miles/km)
- ✅ Currency selection

**Example**:

```tsx
const [display, setDisplay] = useState<DisplayPreferences>({
  theme: "system",
  language: "en",
  timezone: "America/New_York",
  distanceUnit: "miles",
  currency: "USD",
});

<DisplaySettings
  preferences={display}
  onChange={(updates) => setDisplay({ ...display, ...updates })}
/>;
```

---

### PrivacySettings

**Purpose**: Profile visibility and data sharing controls

**Props**:

```typescript
{
  preferences: PrivacySettings;
  onChange: (updates: Partial<PrivacySettings>) => void;
  disabled?: boolean;
  userRole?: "CUSTOMER" | "FARMER" | "ADMIN";
}
```

**Features**:

- ✅ Profile visibility (public, friends, private)
- ✅ Contact info visibility (email, phone)
- ✅ Messaging preferences
- ✅ Data sharing controls
- ✅ Account management (download data, delete account)

**Example**:

```tsx
const [privacy, setPrivacy] = useState<PrivacySettings>({
  profileVisibility: "public",
  showEmail: false,
  showPhone: false,
  allowMessaging: true,
  dataSharing: true,
});

<PrivacySettings
  preferences={privacy}
  onChange={(updates) => setPrivacy({ ...privacy, ...updates })}
/>;
```

---

## 🔌 API Integration

### Fetch Settings

```typescript
async function fetchSettings() {
  const response = await fetch("/api/settings/user");
  const data = await response.json();

  if (data.success) {
    return data.data; // UserSettingsData
  } else {
    throw new Error(data.error.message);
  }
}
```

### Update Settings

```typescript
async function updateSettings(updates: UpdateUserSettingsRequest) {
  const response = await fetch("/api/settings/user", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  const data = await response.json();

  if (data.success) {
    return data.data; // Updated UserSettingsData
  } else {
    throw new Error(data.error.message);
  }
}
```

### Update Request Structure

```typescript
const updates: UpdateUserSettingsRequest = {
  notifications?: Partial<NotificationPreferences>;
  display?: Partial<DisplayPreferences>;
  privacy?: Partial<PrivacySettings>;
};
```

---

## 🎨 Complete Example: Settings Page

```tsx
"use client";

import { useState, useEffect } from "react";
import {
  NotificationSettings,
  DisplaySettings,
  PrivacySettings,
} from "@/components/settings";
import type { UserSettingsData } from "@/types/settings";

export function SettingsPage() {
  const [settings, setSettings] = useState<UserSettingsData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings
  useEffect(() => {
    fetch("/api/settings/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSettings(data.data);
      });
  }, []);

  // Handle changes
  const handleChange = (section: keyof UserSettingsData, updates: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [section]: { ...settings[section], ...updates },
    });
    setHasChanges(true);
  };

  // Save settings
  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);

    try {
      const response = await fetch("/api/settings/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notifications: settings.notifications,
          display: settings.display,
          privacy: settings.privacy,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
        setHasChanges(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <NotificationSettings
        preferences={settings.notifications}
        onChange={(updates) => handleChange("notifications", updates)}
        disabled={isSaving}
      />

      <DisplaySettings
        preferences={settings.display}
        onChange={(updates) => handleChange("display", updates)}
        disabled={isSaving}
      />

      <PrivacySettings
        preferences={settings.privacy}
        onChange={(updates) => handleChange("privacy", updates)}
        disabled={isSaving}
      />

      {hasChanges && (
        <button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      )}
    </div>
  );
}
```

---

## 🎯 Common Patterns

### 1. Optimistic Updates

```typescript
const handleChange = (updates: Partial<NotificationPreferences>) => {
  // Update local state immediately
  setSettings((prev) => ({
    ...prev,
    notifications: { ...prev.notifications, ...updates },
  }));

  // Save to API in background
  debouncedSave({ notifications: updates });
};
```

### 2. Tab-Based Navigation

```typescript
const [activeTab, setActiveTab] = useState<"notifications" | "display" | "privacy">("notifications");

return (
  <div>
    <nav>
      <button onClick={() => setActiveTab("notifications")}>Notifications</button>
      <button onClick={() => setActiveTab("display")}>Display</button>
      <button onClick={() => setActiveTab("privacy")}>Privacy</button>
    </nav>

    {activeTab === "notifications" && <NotificationSettings {...props} />}
    {activeTab === "display" && <DisplaySettings {...props} />}
    {activeTab === "privacy" && <PrivacySettings {...props} />}
  </div>
);
```

### 3. Change Detection

```typescript
const [originalSettings, setOriginalSettings] =
  useState<UserSettingsData>(null);
const [currentSettings, setCurrentSettings] = useState<UserSettingsData>(null);

const hasChanges = useMemo(() => {
  return JSON.stringify(originalSettings) !== JSON.stringify(currentSettings);
}, [originalSettings, currentSettings]);
```

---

## 🔐 Authentication

All API endpoints require authentication:

```typescript
// Server-side
import { auth } from "@/lib/auth";

const session = await auth();
if (!session?.user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

## 🎨 Styling

Components use Tailwind CSS classes. Customize by:

1. **Override Classes**: Pass custom className to components
2. **Tailwind Config**: Modify colors in tailwind.config.ts
3. **CSS Variables**: Use CSS custom properties

```typescript
// Example: Custom theme colors
<NotificationSettings
  preferences={prefs}
  onChange={handleChange}
  className="custom-notifications"
/>
```

---

## 📱 Mobile Considerations

Components are mobile-responsive by default:

- ✅ Touch-friendly toggles (44x44px minimum)
- ✅ Collapsible sections
- ✅ Full-width on mobile
- ✅ Stacked layouts

---

## ♿ Accessibility

All components include:

- ✅ ARIA labels and roles
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus indicators

---

## 🐛 Troubleshooting

### Component Not Rendering

**Issue**: Component doesn't appear
**Solution**: Check that preferences prop is not null/undefined

```typescript
{settings && (
  <NotificationSettings preferences={settings.notifications} />
)}
```

### onChange Not Firing

**Issue**: Updates don't work
**Solution**: Ensure onChange is properly bound

```typescript
// ❌ Wrong
onChange={handleChange}

// ✅ Correct
onChange={(updates) => handleChange(updates)}
```

### TypeScript Errors

**Issue**: Type mismatch errors
**Solution**: Use correct type imports

```typescript
import type { NotificationPreferences } from "@/types/settings";
```

---

## 📚 Additional Resources

- **Full Documentation**: `/docs/sprints/sprint-5/SPRINT_5_PHASE_2_COMPLETION.md`
- **API Documentation**: `/docs/sprints/sprint-5/SPRINT_5_API_COMPLETION.md`
- **Type Definitions**: `/src/types/settings.ts`
- **Components**: `/src/components/settings/`

---

## ✅ Checklist for Integration

- [ ] Import components from `@/components/settings`
- [ ] Import types from `@/types/settings`
- [ ] Fetch settings from `/api/settings/user`
- [ ] Pass correct props to components
- [ ] Handle onChange events
- [ ] Implement save functionality
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test on mobile devices
- [ ] Test keyboard navigation

---

## 🎉 You're Ready!

You now have everything you need to integrate Sprint 5 settings components into your application. Start with the complete example above and customize as needed.

**Need Help?** Check the full documentation in `/docs/sprints/sprint-5/`

---

_"Code with agricultural consciousness, architect with divine precision, deliver with quantum efficiency."_ 🌾⚡

**Version**: 1.0  
**Status**: ✅ Production Ready  
**Last Updated**: December 29, 2024
