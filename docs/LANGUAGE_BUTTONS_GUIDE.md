# 🌍 Language Button Components - Usage Guide

## 🎨 Available Button Styles

I've created **4 different language selector buttons** for you to choose from:

---

## 1. 🌐 LanguageButton (Compact & Clean)

**Best for**: Navigation bars, headers, tight spaces

```tsx
import { LanguageButton } from "@/components/i18n";

export function Header() {
  return (
    <header>
      <nav>
        {/* Your nav items */}
        <LanguageButton />
      </nav>
    </header>
  );
}
```

**Features**:

- Compact design
- Shows current language name
- Dropdown with all languages
- Mobile responsive (shows "EN" on small screens)
- Check mark for active language

---

## 2. 🎌 FlagLanguageButton (Visual with Flags)

**Best for**: Modern UI, visual appeal, international sites

```tsx
import { FlagLanguageButton } from "@/components/i18n";

export function Header() {
  return (
    <header>
      <nav>
        {/* Your nav items */}
        <FlagLanguageButton />
      </nav>
    </header>
  );
}
```

**Features**:

- Country flags for each language
- 2-column grid layout
- Eye-catching and intuitive
- Great for international audiences
- Shows flag + native name

**Flags included**:

- 🇺🇸 English
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇩🇪 German
- 🇨🇳 Chinese
- 🇸🇦 Arabic
- 🇮🇳 Hindi
- 🇧🇷 Portuguese
- 🇭🇷 Croatian
- 🇷🇸 Serbian

---

## 3. 🔄 SimpleLanguageToggle (Quick Switch)

**Best for**: Bilingual sites, quick language switching

```tsx
import { SimpleLanguageToggle } from "@/components/i18n";

export function Header() {
  return (
    <header>
      <nav>
        {/* Toggle between English and Spanish */}
        <SimpleLanguageToggle languages={["en", "es"]} />

        {/* Or Croatian and Serbian */}
        <SimpleLanguageToggle languages={["hr", "sr"]} />
      </nav>
    </header>
  );
}
```

**Features**:

- One-click toggle between 2 languages
- Shows current language
- Animated switch icon
- Perfect for bilingual sites
- Customizable language pair

---

## 4. 📋 LanguageSwitcher (Original Dropdown)

**Best for**: Full-featured dropdown with details

```tsx
import { LanguageSwitcher } from "@/components/i18n";

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

**Features**:

- Shows language name + English name
- Agricultural context info
- Most detailed option
- Perfect for admin panels

---

## 🚀 Quick Start - Add to Your Header

### Option A: Replace in Existing Header

If you have a header component, add one of these:

```tsx
// src/app/_components/Header.tsx (or wherever your header is)
import { FlagLanguageButton } from "@/components/i18n";

export function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <Logo />

      <nav className="flex items-center gap-4">
        <Link href="/products">Products</Link>
        <Link href="/farms">Farms</Link>
        <Link href="/about">About</Link>

        {/* Add language button here 👇 */}
        <FlagLanguageButton />
      </nav>
    </header>
  );
}
```

### Option B: Import All and Choose

```tsx
import {
  LanguageButton,           // Compact
  FlagLanguageButton,       // With flags
  SimpleLanguageToggle,     // Toggle
  LanguageSwitcher         // Full dropdown
} from '@/components/i18n';

// Use whichever you prefer
<LanguageButton />
<FlagLanguageButton />
<SimpleLanguageToggle languages={['en', 'hr']} />
<LanguageSwitcher />
```

---

## 🎨 Styling & Customization

All buttons support:

- ✅ Light/Dark mode
- ✅ Tailwind CSS classes
- ✅ Responsive design
- ✅ Loading states
- ✅ Keyboard navigation
- ✅ Screen reader friendly

### Custom Styling Example

```tsx
<div className="my-custom-wrapper">
  <FlagLanguageButton />
</div>
```

---

## 📱 Responsive Behavior

### LanguageButton

- Desktop: Shows full language name
- Mobile: Shows language code (EN, ES, HR)

### FlagLanguageButton

- Desktop: 2-column grid
- Mobile: 2-column grid (automatically adjusts)

### SimpleLanguageToggle

- Works perfectly on all screen sizes

---

## 🌍 Complete Example with Real Header

```tsx
// src/app/_components/Header.tsx
"use client";

import Link from "next/link";
import { FlagLanguageButton } from "@/components/i18n";
import { useTranslations } from "next-intl";

export function Header() {
  const t = useTranslations("common.nav");

  return (
    <header className="border-b bg-white dark:bg-gray-900">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-green-600">
          🌾 Farmers Market
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link href="/products" className="hover:text-green-600">
            {t("products")}
          </Link>
          <Link href="/farms" className="hover:text-green-600">
            {t("farms")}
          </Link>
          <Link href="/about" className="hover:text-green-600">
            {t("about")}
          </Link>

          {/* Language Selector */}
          <FlagLanguageButton />

          {/* Cart & Login */}
          <Link href="/cart">🛒</Link>
          <Link href="/login">{t("login")}</Link>
        </nav>
      </div>
    </header>
  );
}
```

---

## 🎯 Which Button Should I Use?

| Button                   | Best For               | Visual Style      |
| ------------------------ | ---------------------- | ----------------- |
| **LanguageButton**       | Clean, minimal designs | Text + Globe icon |
| **FlagLanguageButton**   | Modern, visual sites   | Flags + Text      |
| **SimpleLanguageToggle** | Bilingual sites        | Toggle button     |
| **LanguageSwitcher**     | Feature-rich dropdowns | Detailed dropdown |

---

## 💡 Pro Tips

### For Bilingual Croatian/Serbian Site

```tsx
<SimpleLanguageToggle languages={["hr", "sr"]} />
```

### For International E-commerce

```tsx
<FlagLanguageButton />
```

### For Minimal Design

```tsx
<LanguageButton />
```

### For Admin Panel

```tsx
<LanguageSwitcher />
```

---

## 🔥 Next Steps

1. **Choose your favorite button style**
2. **Find your header component** (usually in `src/app/_components/` or `src/components/`)
3. **Import and add the button**
4. **Test by clicking it**
5. **Verify all 10 languages appear**

---

## 🎉 You're All Set!

Your language buttons are ready to use. All buttons:

- ✅ Show all 10 languages (including Croatian & Serbian)
- ✅ Work instantly without page reload
- ✅ Maintain current page context
- ✅ Are fully accessible
- ✅ Support dark mode

**Try them all and pick your favorite!** 🌍
