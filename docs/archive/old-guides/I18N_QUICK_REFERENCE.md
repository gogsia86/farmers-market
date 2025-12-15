# 🌍 I18N Quick Reference Card

## 🎯 Essential Commands

```bash
# Start dev server
npm run dev

# Access different languages
http://localhost:3000/en/
http://localhost:3000/es/
http://localhost:3000/fr/
```

---

## 📝 Basic Usage Patterns

### In Any Component

```tsx
import { useTranslations } from "next-intl";

function MyComponent() {
  const t = useTranslations("products");

  return (
    <div>
      <h1>{t("title")}</h1>
      <button>{t("details.addToCart")}</button>
    </div>
  );
}
```

### Get Current Locale

```tsx
import { useLocale } from "next-intl";

const locale = useLocale(); // 'en', 'es', etc.
```

### Format Currency

```tsx
import { formatCurrency } from "@/i18n/utils";
import { useLocale } from "next-intl";

const locale = useLocale();
const price = formatCurrency(29.99, locale); // "$29.99" or "€29,99"
```

### Format Date

```tsx
import { formatDate } from "@/i18n/utils";

const dateStr = formatDate(new Date(), locale);
// "January 15, 2024" or "15 enero 2024"
```

---

## 🔑 Most Common Translation Keys

```tsx
// Navigation
t("common.nav.home");
t("common.nav.products");
t("common.nav.cart");

// Actions
t("common.actions.search");
t("common.actions.addToCart");
t("common.actions.submit");

// Products
t("products.title");
t("products.categories.vegetables");
t("products.filters.organic");

// Cart
t("cart.title");
t("cart.proceedToCheckout");

// Auth
t("auth.login.title");
t("auth.signup.submit");
```

---

## 🎨 Language Switcher

```tsx
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

// Add to header
<LanguageSwitcher />;
```

---

## 📁 File Locations

| File                                       | Purpose              |
| ------------------------------------------ | -------------------- |
| `src/i18n/messages/en.json`                | English translations |
| `src/i18n/messages/es.json`                | Spanish translations |
| `src/i18n/utils.ts`                        | Helper functions     |
| `src/i18n/config.ts`                       | Language config      |
| `src/components/i18n/LanguageSwitcher.tsx` | Language selector    |

---

## 🌐 Supported Languages

🇺🇸 en | 🇪🇸 es | 🇫🇷 fr | 🇩🇪 de | 🇨🇳 zh | 🇸🇦 ar | 🇮🇳 hi | 🇧🇷 pt

✅ = Complete | 🔄 = Template ready

---

## 🚀 To Add New Translation

1. Open `src/i18n/messages/en.json`
2. Add your key:
   ```json
   {
     "mySection": {
       "myKey": "My English text"
     }
   }
   ```
3. Add to `es.json` too
4. Use in component:
   ```tsx
   t("mySection.myKey");
   ```

---

## 🐛 Quick Troubleshooting

| Problem                   | Solution                                 |
| ------------------------- | ---------------------------------------- |
| Translation not showing   | Check key exists in JSON file            |
| Language switcher missing | Import and render `<LanguageSwitcher />` |
| URL has no locale         | Middleware redirects automatically       |
| TypeScript error          | Restart dev server                       |

---

## 📚 Full Documentation

- Quick Start: `docs/I18N_QUICK_START.md`
- Complete Guide: `docs/I18N_IMPLEMENTATION_GUIDE.md`
- Summary: `docs/I18N_SUMMARY.md`

---

**Status**: ✅ Ready to Use (English & Spanish complete)
