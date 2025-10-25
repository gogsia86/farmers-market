# FRONTEND COMPONENTS - INSTALLATION & SETUP GUIDE

**Date**: October 19, 2025
**Status**: Core Components Ready
**Next**: Install dependencies and configure

---

## 📦 Required Package Installations

Run these commands to install all frontend dependencies:

```bash
# Navigate to project
cd v:\Projects\Farmers-Market

# Core Next.js & React (already installed)
# npm install next@14 react@18 react-dom@18

# TypeScript (already installed)
# npm install -D typescript @types/react @types/node

# Form Management
npm install react-hook-form @hookform/resolvers/zod

# UI Component Libraries
npm install @radix-ui/react-slot
npm install class-variance-authority
npm install clsx tailwind-merge

# Icons
npm install lucide-react

# Authentication (already installed)
# npm install next-auth@beta @auth/prisma-adapter

# Utilities
npm install date-fns  # Date formatting utilities
```

---

## 🎨 Tailwind CSS Configuration

Update your `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        // Secondary colors
        secondary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
        },
        // Agricultural green colors
        agricultural: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Poppins", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};

export default config;
```

---

## 🗂️ Component File Structure

Current component organization:

```
src/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx                    ✅ DONE
│   │   ├── register/
│   │   │   ├── farmer/
│   │   │   │   └── page.tsx                ✅ DONE
│   │   │   └── consumer/
│   │   │       └── page.tsx                (Next)
│   │   ├── verify-email/
│   │   │   └── page.tsx                    (Next)
│   │   └── reset-password/
│   │       └── page.tsx                    (Later)
│   └── layout.tsx                          (Needs update)
│
├── components/
│   └── ui/
│       ├── button.tsx                      ✅ DONE
│       ├── input.tsx                       ✅ DONE
│       ├── card.tsx                        ✅ DONE
│       ├── modal.tsx                       (Next)
│       ├── toast.tsx                       (Next)
│       ├── select.tsx                      (Later)
│       ├── checkbox.tsx                    (Later)
│       ├── radio.tsx                       (Later)
│       └── textarea.tsx                    (Later)
│
└── lib/
    └── utils/
        └── cn.ts                            ✅ DONE
```

---

## 🚀 Usage Examples

### **Button Component**

```tsx
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Default button
<Button>Click me</Button>

// Agricultural variant
<Button variant="agricultural">Add Product</Button>

// Divine variant with icon
<Button variant="divine" leftIcon={<Plus />}>
  Create Farm
</Button>

// Loading state
<Button loading loadingText="Saving...">
  Save
</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### **Input Component**

```tsx
import { Input } from '@/components/ui/input';
import { Mail, Search } from 'lucide-react';

// Basic input
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
/>

// With icons
<Input
  label="Search"
  leftIcon={<Search className="h-4 w-4" />}
/>

// With validation
<Input
  label="Email"
  error="Invalid email address"
/>

<Input
  label="Email"
  success="Email verified!"
/>

// Password with toggle
<Input
  label="Password"
  type="password"
/>
```

### **Card Component**

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

<Card variant="agricultural" interactive>
  <CardHeader>
    <CardTitle>Fresh Tomatoes</CardTitle>
    <CardDescription>Organic, locally grown</CardDescription>
  </CardHeader>
  <CardContent>
    <p>$4.99/lb</p>
  </CardContent>
  <CardFooter>
    <Button>Add to Cart</Button>
  </CardFooter>
</Card>;
```

### **React Hook Form Integration**

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input
        label="Email"
        {...form.register("email")}
        error={form.formState.errors.email?.message}
      />
      <Input
        label="Password"
        type="password"
        {...form.register("password")}
        error={form.formState.errors.password?.message}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

---

## 🎯 Component Patterns

### **Server Components (Default)**

```tsx
// app/farms/page.tsx
import { prisma } from "@/lib/prisma";

export default async function FarmsPage() {
  // Direct database access - runs on server
  const farms = await prisma.farm.findMany();

  return (
    <div>
      {farms.map((farm) => (
        <FarmCard key={farm.id} farm={farm} />
      ))}
    </div>
  );
}
```

### **Client Components (Interactive)**

```tsx
"use client"; // Required for hooks, events, state

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Counter() {
  const [count, setCount] = useState(0);

  return <Button onClick={() => setCount(count + 1)}>Count: {count}</Button>;
}
```

### **Compound Components**

```tsx
// Already implemented in Card component
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

---

## 🔧 Environment Setup

Ensure your `.env.local` has these for NextAuth:

```bash
# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # openssl rand -base64 32

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_CLIENT_ID="your-facebook-app-id"
FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"
```

---

## ✅ Testing Components

Create a test page to verify components work:

```tsx
// app/test/page.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function TestPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Component Test Page</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4">Buttons</h2>
        <div className="flex gap-2 flex-wrap">
          <Button>Default</Button>
          <Button variant="agricultural">Agricultural</Button>
          <Button variant="divine">Divine</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Inputs</h2>
        <div className="space-y-4 max-w-md">
          <Input label="Email" type="email" placeholder="you@example.com" />
          <Input label="Password" type="password" />
          <Input label="With Error" error="This field is required" />
          <Input label="With Success" success="Looks good!" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Cards</h2>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
            </CardHeader>
            <CardContent>Standard styling</CardContent>
          </Card>

          <Card variant="agricultural">
            <CardHeader>
              <CardTitle>Agricultural</CardTitle>
            </CardHeader>
            <CardContent>Farm-focused</CardContent>
          </Card>

          <Card variant="divine">
            <CardHeader>
              <CardTitle>Divine</CardTitle>
            </CardHeader>
            <CardContent>Premium features</CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
```

Visit `http://localhost:3000/test` to see all components!

---

## 🚦 Next Steps

### **Immediate**:

1. Run `npm install` commands above
2. Update `tailwind.config.ts`
3. Test components at `/test` page
4. Build remaining auth pages (Consumer Registration, Email Verification)

### **Soon**:

5. Create Navigation component
6. Create Footer component
7. Update root layout.tsx
8. Build Farmer Dashboard
9. Build Consumer Experience

---

**Status**: ✅ **Core UI Components Ready**
**Installation**: Run npm install commands above
**Testing**: Create `/test` page to verify
**Next**: Consumer Registration + Email Verification + Navigation
