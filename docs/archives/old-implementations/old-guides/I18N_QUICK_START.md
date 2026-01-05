# 🌍 Quick Start Guide - Adding Multi-Language Support

## ✅ What's Already Done

The i18n infrastructure is **100% ready**. Here's what you can do right now:

---

## 1️⃣ Add Language Switcher to Your Navigation

```tsx
// In your Header or Navigation component
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

export function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <Logo />
      <nav>{/* Your navigation items */}</nav>
      <LanguageSwitcher /> {/* 👈 Add this */}
    </header>
  );
}
```

---

## 2️⃣ Use Translations in Your Components

### Client Component Example

```tsx
"use client";

import { useTranslations } from "next-intl";

export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations("products");

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <button>{t("details.addToCart")}</button>
      <p>
        {t("details.availability")}: {product.stock}
      </p>
    </div>
  );
}
```

### Server Component Example

```tsx
import { useTranslations } from "next-intl";

export default function ProductsPage() {
  const t = useTranslations("products");

  return (
    <div>
      <h1>{t("title")}</h1>
      {/* Your content */}
    </div>
  );
}
```

---

## 3️⃣ Test Different Languages

Just change the URL:

- **English**: `http://localhost:3000/en/products`
- **Spanish**: `http://localhost:3000/es/products`
- **French**: `http://localhost:3000/fr/products`

The middleware will auto-redirect `/products` → `/en/products`

---

## 4️⃣ Available Translation Keys

All keys are in `src/i18n/messages/en.json`. Here are the main sections:

```tsx
// Navigation
const t = useTranslations("common.nav");
t("home"); // "Home"
t("products"); // "Products"
t("cart"); // "Cart"

// Actions
const t = useTranslations("common.actions");
t("search"); // "Search"
t("addToCart"); // "Add to Cart"
t("submit"); // "Submit"

// Product-related
const t = useTranslations("products");
t("title"); // "Our Products"
t("categories.vegetables"); // "Vegetables"
t("filters.organic"); // "Organic Only"
t("sorting.priceLowToHigh"); // "Price: Low to High"

// Cart & Checkout
const t = useTranslations("cart");
t("title"); // "Shopping Cart"
t("proceedToCheckout"); // "Proceed to Checkout"

const t = useTranslations("checkout");
t("shippingInfo"); // "Shipping Information"
t("placeOrder"); // "Place Order"

// Auth
const t = useTranslations("auth.login");
t("title"); // "Login"
t("email"); // "Email"
t("password"); // "Password"
```

---

## 5️⃣ Adding a New Translation

Let's say you want to add a "Wishlist" feature:

### Step 1: Add to English file (`src/i18n/messages/en.json`)

```json
{
  "wishlist": {
    "title": "My Wishlist",
    "empty": "Your wishlist is empty",
    "addToWishlist": "Add to Wishlist",
    "removeFromWishlist": "Remove from Wishlist"
  }
}
```

### Step 2: Add to Spanish file (`src/i18n/messages/es.json`)

```json
{
  "wishlist": {
    "title": "Mi Lista de Deseos",
    "empty": "Tu lista de deseos está vacía",
    "addToWishlist": "Añadir a la Lista",
    "removeFromWishlist": "Eliminar de la Lista"
  }
}
```

### Step 3: Use it in your component

```tsx
const t = useTranslations("wishlist");

return (
  <div>
    <h2>{t("title")}</h2>
    <button>{t("addToWishlist")}</button>
  </div>
);
```

---

## 6️⃣ Current Language Support

| Language      | Code | Status      | File                          |
| ------------- | ---- | ----------- | ----------------------------- |
| 🇺🇸 English    | `en` | ✅ Complete | `en.json`                     |
| 🇪🇸 Spanish    | `es` | ✅ Complete | `es.json`                     |
| 🇫🇷 French     | `fr` | 🔄 Template | `fr.json` (needs translation) |
| 🇩🇪 German     | `de` | 🔄 Template | `de.json` (needs translation) |
| 🇨🇳 Chinese    | `zh` | 🔄 Template | `zh.json` (needs translation) |
| 🇸🇦 Arabic     | `ar` | 🔄 Template | `ar.json` (needs translation) |
| 🇮🇳 Hindi      | `hi` | 🔄 Template | `hi.json` (needs translation) |
| 🇧🇷 Portuguese | `pt` | 🔄 Template | `pt.json` (needs translation) |

---

## 7️⃣ How to Complete Other Languages

### Option 1: Manual Translation

1. Copy `src/i18n/messages/en.json` to `fr.json`, `de.json`, etc.
2. Translate each value
3. Test by navigating to `/{locale}/` URL

### Option 2: Use Translation Service

1. Export `en.json`
2. Use Google Translate API or similar
3. Import and review translations
4. Native speaker review recommended

### Option 3: Professional Translation

- Hire professional translators
- Maintain agricultural domain accuracy
- Ensure cultural appropriateness

---

## 8️⃣ Testing Checklist

- [ ] Language switcher appears in navigation
- [ ] Clicking switcher changes language
- [ ] URL updates with locale prefix (`/en/`, `/es/`)
- [ ] All text on page changes to selected language
- [ ] Admin routes still protected across locales
- [ ] Date formats change by locale
- [ ] Currency symbols match locale
- [ ] RTL works for Arabic (when implemented)

---

## 9️⃣ Common Patterns

### Get Current Locale

```tsx
import { useLocale } from "next-intl";

export function MyComponent() {
  const locale = useLocale();
  return <div>Current: {locale}</div>;
}
```

### Locale-Aware Links

```tsx
import { Link } from "next/link";
import { useLocale } from "next-intl";

export function Navigation() {
  const locale = useLocale();

  return (
    <nav>
      <Link href={`/${locale}/products`}>Products</Link>
      <Link href={`/${locale}/farms`}>Farms</Link>
    </nav>
  );
}
```

### Format Numbers/Currency

```tsx
import { useLocale } from "next-intl";
import { currencyByLocale } from "@/i18n/config";

export function Price({ amount }: { amount: number }) {
  const locale = useLocale();
  const currency = currencyByLocale[locale];

  return (
    <span>
      {new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).format(amount)}
    </span>
  );
}
```

---

## 🆘 Need Help?

### Problem: Can't see language switcher

**Solution**: Make sure you imported and rendered `<LanguageSwitcher />` in your header/nav.

### Problem: Translations not showing

**Solution**:

1. Check you're using `useTranslations('section')`
2. Verify key exists in JSON file
3. Restart dev server

### Problem: URL doesn't have locale

**Solution**: Middleware auto-redirects. Make sure middleware is running.

---

## 🎯 Next Immediate Steps

1. **Add `<LanguageSwitcher />` to your main navigation**
2. **Replace hardcoded text with `t()` calls**
3. **Test English and Spanish (both complete)**
4. **Plan translation strategy for remaining languages**

---

**Ready to go!** Start by adding the language switcher to your header component. 🚀
