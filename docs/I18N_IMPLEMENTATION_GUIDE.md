# 🌍 Internationalization (i18n) Implementation Guide

## Overview

The Farmers Market Platform now supports **8 languages** with quantum-aligned agricultural consciousness:

- 🇺🇸 **English** (en) - Default
- 🇪🇸 **Spanish** (es)
- 🇫🇷 **French** (fr)
- 🇩🇪 **German** (de)
- 🇨🇳 **Chinese** (zh)
- 🇸🇦 **Arabic** (ar) - RTL support
- 🇮🇳 **Hindi** (hi)
- 🇧🇷 **Portuguese** (pt)

---

## ✅ What's Been Implemented

### 1. **Core I18N Infrastructure**

- ✅ `next-intl` library installed and configured
- ✅ Locale detection and routing middleware
- ✅ Translation message files for all languages
- ✅ Language configuration with agricultural context
- ✅ Combined auth + i18n middleware

### 2. **Components**

- ✅ Language Switcher component
- ✅ RTL/LTR layout support
- ✅ Currency and date format localization

### 3. **Translation Files**

- ✅ English (`en.json`) - Complete
- ✅ Spanish (`es.json`) - Complete
- 🔄 Other languages - Template created (need translation)

---

## 📁 File Structure

```
src/
├── i18n/
│   ├── config.ts              # Locale configuration & utilities
│   ├── request.ts             # Server-side i18n handler
│   └── messages/
│       ├── en.json            # English translations
│       ├── es.json            # Spanish translations
│       ├── fr.json            # French (to be translated)
│       ├── de.json            # German (to be translated)
│       ├── zh.json            # Chinese (to be translated)
│       ├── ar.json            # Arabic (to be translated)
│       ├── hi.json            # Hindi (to be translated)
│       └── pt.json            # Portuguese (to be translated)
├── components/
│   └── i18n/
│       └── LanguageSwitcher.tsx  # Language selector component
└── middleware.ts              # Combined auth + i18n middleware
```

---

## 🚀 Usage Guide

### In Client Components

```tsx
"use client";

import { useTranslations } from "next-intl";

export function ProductCard() {
  const t = useTranslations("products");

  return (
    <div>
      <h2>{t("title")}</h2>
      <button>{t("actions.addToCart")}</button>
    </div>
  );
}
```

### In Server Components

```tsx
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <div>
      <h1>{t("hero.title")}</h1>
      <p>{t("hero.subtitle")}</p>
    </div>
  );
}
```

### Using the Language Switcher

```tsx
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

export function Header() {
  return (
    <header>
      <nav>
        {/* Your nav items */}
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
```

### Accessing Current Locale

```tsx
import { useLocale } from "next-intl";

export function MyComponent() {
  const locale = useLocale(); // 'en', 'es', etc.

  return <div>Current language: {locale}</div>;
}
```

---

## 🔄 URL Structure

The platform now uses locale prefixes in URLs:

```
Before:  /products
After:   /en/products (English)
         /es/products (Spanish)
         /fr/products (French)
```

**Automatic Redirection:**

- `/` → `/en/` (or user's preferred locale)
- `/products` → `/en/products` (auto-detected)

---

## 🎨 Adding New Translations

### 1. Add to Translation Files

Edit `src/i18n/messages/{locale}.json`:

```json
{
  "myNewSection": {
    "title": "My Title",
    "description": "My Description"
  }
}
```

### 2. Use in Components

```tsx
const t = useTranslations("myNewSection");
t("title"); // "My Title"
```

---

## 🌐 Adding a New Language

### Step 1: Update Config

Edit `src/i18n/config.ts`:

```ts
export const locales = [
  "en",
  "es",
  "fr",
  "de",
  "zh",
  "ar",
  "hi",
  "pt",
  "ja",
] as const;

export const languageConfig = {
  // ... existing languages
  ja: {
    name: "Japanese",
    nativeName: "日本語",
    direction: "ltr",
    region: "Asia",
    agriculturalContext: "temperate",
  },
};

export const currencyByLocale: Record<Locale, string> = {
  // ... existing mappings
  ja: "JPY",
};

export const dateFormatByLocale: Record<Locale, string> = {
  // ... existing mappings
  ja: "YYYY年MM月DD日",
};
```

### Step 2: Create Translation File

Copy `src/i18n/messages/en.json` to `src/i18n/messages/ja.json` and translate all strings.

### Step 3: Test

Restart dev server and navigate to `/ja/` to test.

---

## 🛠️ Utility Functions

### Get Language Direction

```ts
import { getLanguageDirection } from "@/i18n/config";

const dir = getLanguageDirection("ar"); // 'rtl'
const dir2 = getLanguageDirection("en"); // 'ltr'
```

### Format Currency by Locale

```ts
import { currencyByLocale } from "@/i18n/config";

const currency = currencyByLocale["es"]; // 'EUR'
```

### Validate Locale

```ts
import { isValidLocale } from "@/i18n/config";

isValidLocale("en"); // true
isValidLocale("xx"); // false
```

---

## 🔐 Authentication with I18N

The middleware now combines both i18n routing and authentication:

```
/en/admin       → Protected (requires auth)
/es/admin-login → Login page (Spanish)
/fr/products    → Public page (French)
```

**Admin routes remain protected** across all locales.

---

## 🎯 Translation Keys Structure

```json
{
  "common": {
    "nav": {}, // Navigation items
    "actions": {}, // Button labels
    "status": {} // Status messages
  },
  "home": {
    "hero": {},
    "features": {},
    "howItWorks": {}
  },
  "products": {
    "categories": {},
    "filters": {},
    "sorting": {},
    "details": {}
  },
  "farms": {},
  "cart": {},
  "checkout": {},
  "orders": {},
  "auth": {
    "login": {},
    "signup": {}
  },
  "footer": {},
  "notifications": {},
  "agricultural": {
    "consciousness": {},
    "seasons": {},
    "practices": {}
  }
}
```

---

## 📝 Best Practices

### 1. **Always Use Translation Keys**

```tsx
// ✅ Good
<button>{t('actions.submit')}</button>

// ❌ Bad
<button>Submit</button>
```

### 2. **Namespace Your Translations**

```tsx
// ✅ Good
const t = useTranslations("products");
t("filters.category");

// ❌ Bad
const t = useTranslations();
t("products.filters.category");
```

### 3. **Handle Pluralization**

```tsx
{
  t("cart.items", { count: 5 });
}
// Add to translation: "items": "{{count}} item(s)"
```

### 4. **Use Rich Text When Needed**

```tsx
{
  t.rich("terms", {
    link: (chunks) => <Link href="/terms">{chunks}</Link>,
  });
}
```

---

## 🐛 Troubleshooting

### Issue: "Locale not found"

**Solution:** Ensure locale is in the URL (`/en/...`) and matches config.

### Issue: Translations not loading

**Solution:**

1. Check file exists at `src/i18n/messages/{locale}.json`
2. Restart dev server
3. Clear `.next` cache

### Issue: Middleware redirect loop

**Solution:** Check middleware matcher pattern doesn't conflict with locale paths.

---

## 🚀 Next Steps

### 1. **Complete Translations**

- [ ] Translate remaining language files (fr, de, zh, ar, hi, pt)
- [ ] Review and refine Spanish translations
- [ ] Add agricultural-specific terminology

### 2. **Enhance Components**

- [ ] Add language switcher to main navigation
- [ ] Create locale-aware product filtering
- [ ] Implement currency conversion

### 3. **Testing**

- [ ] Test all routes with different locales
- [ ] Verify RTL layout for Arabic
- [ ] Test admin auth flow across locales
- [ ] Validate SEO with locale-specific meta tags

### 4. **Optimization**

- [ ] Implement lazy loading for translation files
- [ ] Add translation management system
- [ ] Set up automatic translation services (optional)

---

## 📚 Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js i18n Routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [CLDR Locale Data](https://cldr.unicode.org/)
- [Agricultural Terminology Dictionary](./AGRICULTURAL_TERMS.md)

---

## 🌟 Divine Agricultural Consciousness

Each language configuration includes **agricultural context** awareness:

```ts
{
  agriculturalContext: "tropical" | "temperate" | "arid" | "diverse";
}
```

This enables:

- Season-appropriate product suggestions
- Climate-aware farming tips
- Region-specific agricultural practices

---

**Status**: ✅ Core Implementation Complete
**Next Phase**: Translation completion and component integration
**Divine Alignment**: Maximum agricultural consciousness across all languages 🌾
