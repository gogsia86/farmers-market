# 🎨 AI UI Components Documentation

**Farmers Market Platform - AI Feature Components**  
**Version:** 1.0  
**Last Updated:** January 2025

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Components](#components)
   - [ProductDescriptionGenerator](#productdescriptiongenerator)
   - [AIAdvisorChat](#aiadvisorchat)
   - [HarvestTrackingDashboard](#harvesttrackingdashboard)
3. [Installation](#installation)
4. [Usage Examples](#usage-examples)
5. [Styling & Theming](#styling--theming)
6. [Integration Guide](#integration-guide)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This document covers the AI-powered UI components built for the Farmers Market Platform. All components are built with React, TypeScript, and Tailwind CSS, following the platform's design system.

### Features

- ✅ **Type-safe**: Full TypeScript support with exported types
- ✅ **Responsive**: Mobile-first design with responsive layouts
- ✅ **Accessible**: WCAG 2.1 AA compliant
- ✅ **Themeable**: Dark mode support via Tailwind
- ✅ **Reusable**: Modular components with clear props
- ✅ **Error Handling**: Built-in error states and loading indicators

### Component Library

- **ProductDescriptionGenerator** - AI-powered product description creation
- **AIAdvisorChat** - Interactive agricultural advisor chatbot
- **HarvestTrackingDashboard** - Comprehensive harvest analytics

---

## 🧩 Components

### ProductDescriptionGenerator

AI-powered tool for generating compelling product descriptions with SEO optimization.

#### Props

```typescript
interface ProductDescriptionGeneratorProps {
  productName?: string;          // Pre-fill product name
  category?: string;              // Pre-fill category
  farmName?: string;              // Pre-fill farm name
  onApply?: (description: ProductDescription) => void; // Callback when applying
  className?: string;             // Additional CSS classes
}

interface ProductDescription {
  description: string;
  shortDescription: string;
  seoTitle: string;
  seoMetaDescription: string;
  suggestedTags: string[];
  wordCount: number;
  confidence: number;
}
```

#### Features

- Multi-field form with product details
- Tone selection (professional, casual, storytelling, technical)
- Length options (short, medium, long)
- Farming practices and certifications toggles
- Real-time generation with loading states
- Editable preview area
- SEO metadata display
- Copy to clipboard and apply functionality
- Confidence score indicator

#### Basic Usage

```tsx
import { ProductDescriptionGenerator } from "@/components/ai";

export default function ProductPage() {
  const handleApply = (description) => {
    console.log("Description applied:", description);
    // Save to database or update form
  };

  return (
    <ProductDescriptionGenerator
      productName="Heirloom Tomatoes"
      category="Vegetables"
      farmName="Green Valley Farm"
      onApply={handleApply}
    />
  );
}
```

#### Advanced Usage

```tsx
"use client";

import { ProductDescriptionGenerator } from "@/components/ai";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductForm() {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
  });

  const handleApplyDescription = (description) => {
    setFormData((prev) => ({
      ...prev,
      description: description.description,
      shortDescription: description.shortDescription,
      seoTitle: description.seoTitle,
      metaDescription: description.seoMetaDescription,
    }));

    toast.success("Description applied to form!");
  };

  return (
    <div className="space-y-6">
      <ProductDescriptionGenerator
        productName={formData.name}
        category={formData.category}
        onApply={handleApplyDescription}
        className="mb-8"
      />

      <form>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        {/* Other form fields */}
      </form>
    </div>
  );
}
```

#### Styling

```tsx
// Custom styling with Tailwind
<ProductDescriptionGenerator
  className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-green-50 to-blue-50"
/>

// Dark mode support (automatic)
<div className="dark">
  <ProductDescriptionGenerator />
</div>
```

---

### AIAdvisorChat

Interactive chat interface for agricultural advice powered by AI.

#### Props

```typescript
interface AIAdvisorChatProps {
  farmId?: string;               // Optional farm context
  initialThreadId?: string;      // Load existing conversation
  className?: string;            // Additional CSS classes
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: {
    confidence?: number;
    sources?: string[];
    tokensUsed?: number;
  };
}
```

#### Features

- Real-time message streaming
- Conversation threading and persistence
- Quick suggestion buttons for common queries
- Message history with timestamps
- Confidence indicators
- Export conversation functionality
- Mobile-optimized responsive design
- Auto-scroll to latest message
- Keyboard shortcuts (Enter to send)

#### Basic Usage

```tsx
import { AIAdvisorChat } from "@/components/ai";

export default function FarmerDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">AI Agricultural Advisor</h1>
      <div className="h-[600px]">
        <AIAdvisorChat farmId="farm_123" />
      </div>
    </div>
  );
}
```

#### With Thread Management

```tsx
"use client";

import { AIAdvisorChat } from "@/components/ai";
import { useState, useEffect } from "react";

export default function AdvisorPage() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    // Load user's conversation threads
    fetch("/api/ai/advisor/threads")
      .then((res) => res.json())
      .then((data) => setThreads(data.data || []));
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar with thread list */}
      <aside className="w-64 border-r p-4">
        <h2 className="font-semibold mb-4">Conversations</h2>
        <button
          onClick={() => setThreadId(null)}
          className="w-full mb-2 p-2 rounded bg-primary text-white"
        >
          + New Chat
        </button>
        <div className="space-y-2">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setThreadId(thread.id)}
              className="w-full p-2 text-left rounded hover:bg-gray-100"
            >
              {thread.title}
            </button>
          ))}
        </div>
      </aside>

      {/* Chat interface */}
      <main className="flex-1">
        <AIAdvisorChat initialThreadId={threadId} farmId="farm_123" />
      </main>
    </div>
  );
}
```

#### Custom Quick Suggestions

```tsx
// The component includes built-in suggestions, but you can extend them
const customSuggestions = [
  {
    icon: "🌱",
    label: "Seasonal Planning",
    prompt: "What crops are best for spring planting in my region?",
  },
  {
    icon: "💰",
    label: "Pricing Strategy",
    prompt: "How should I price my organic vegetables competitively?",
  },
];

// Note: Currently suggestions are hardcoded in the component
// To customize, you can fork the component or pass them as props
```

---

### HarvestTrackingDashboard

Comprehensive dashboard for tracking harvest metrics, crop performance, and AI-powered insights.

#### Props

```typescript
interface HarvestTrackingDashboardProps {
  farmId: string;                // Required farm ID
  className?: string;             // Additional CSS classes
}

interface HarvestMetrics {
  totalYield: number;
  totalValue: number;
  activeCrops: number;
  completedHarvests: number;
  averageQuality: number;
  yieldTrend: number;
  valueTrend: number;
}

interface CropPerformance {
  cropId: string;
  cropName: string;
  category: string;
  plantedArea: number;
  harvestedYield: number;
  expectedYield: number;
  yieldEfficiency: number;
  totalValue: number;
  averageQuality: number;
  harvestCount: number;
  lastHarvestDate: string;
  status: "ACTIVE" | "COMPLETED" | "DELAYED" | "ISSUES";
}
```

#### Features

- Real-time harvest metrics (yield, value, quality)
- Crop performance tracking with efficiency scores
- Seasonal insights and AI recommendations
- Time period filtering (7 days, 30 days, season, year)
- Interactive charts (placeholder for Chart.js/Recharts)
- Export functionality
- Status indicators with color coding
- Responsive grid layouts
- Tabbed interface (Overview, Crops, AI Insights)

#### Basic Usage

```tsx
import { HarvestTrackingDashboard } from "@/components/ai";

export default function HarvestPage({ params }) {
  return (
    <div className="container mx-auto p-6">
      <HarvestTrackingDashboard farmId={params.farmId} />
    </div>
  );
}
```

#### With Custom Data Fetching

```tsx
"use client";

import { HarvestTrackingDashboard } from "@/components/ai";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function FarmerDashboard({ farmId }) {
  const [isLoading, setIsLoading] = useState(true);
  const [farmData, setFarmData] = useState(null);

  useEffect(() => {
    // Pre-fetch farm data if needed
    fetch(`/api/farms/${farmId}`)
      .then((res) => res.json())
      .then((data) => {
        setFarmData(data);
        setIsLoading(false);
      });
  }, [farmId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{farmData.name}</h1>
        <p className="text-muted-foreground">{farmData.location}</p>
      </div>
      <HarvestTrackingDashboard farmId={farmId} />
    </div>
  );
}
```

#### Integration with Chart Libraries

```tsx
// Install chart library
// npm install recharts

import { HarvestTrackingDashboard } from "@/components/ai";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

// Note: The current component has placeholder charts
// To integrate real charts, you can:
// 1. Fork the component and add chart logic
// 2. Fetch data and pass to a separate chart component
// 3. Use the provided hooks to extend functionality

export default function EnhancedDashboard() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetch("/api/harvest/trends")
      .then((res) => res.json())
      .then((data) => setChartData(data));
  }, []);

  return (
    <div className="space-y-6">
      <HarvestTrackingDashboard farmId="farm_123" />
      
      {/* Custom chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Yield Trend</h3>
        <LineChart width={800} height={300} data={chartData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="yield" stroke="#10b981" />
        </LineChart>
      </div>
    </div>
  );
}
```

---

## 📦 Installation

### 1. Install Dependencies

```bash
npm install @/components/ui/button \
            @/components/ui/card \
            @/components/ui/input \
            @/components/ui/textarea \
            @/components/ui/select \
            @/components/ui/label \
            @/components/ui/tabs \
            @/components/ui/scroll-area \
            sonner
```

### 2. Import Components

```tsx
// Individual imports
import { ProductDescriptionGenerator } from "@/components/ai/ProductDescriptionGenerator";
import { AIAdvisorChat } from "@/components/ai/AIAdvisorChat";
import { HarvestTrackingDashboard } from "@/components/ai/HarvestTrackingDashboard";

// Or use the index
import {
  ProductDescriptionGenerator,
  AIAdvisorChat,
  HarvestTrackingDashboard,
} from "@/components/ai";
```

### 3. Add Sonner Toast Provider

In your root layout:

```tsx
// app/layout.tsx
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
```

---

## 💡 Usage Examples

### Example 1: Product Creation Flow

```tsx
"use client";

import { ProductDescriptionGenerator } from "@/components/ai";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function CreateProduct() {
  const [step, setStep] = useState(1);
  const [productData, setProductData] = useState({});

  const handleDescriptionApply = (description) => {
    setProductData((prev) => ({ ...prev, ...description }));
    setStep(2);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {step === 1 && (
        <>
          <h1 className="text-2xl font-bold mb-4">Step 1: Generate Description</h1>
          <ProductDescriptionGenerator
            onApply={handleDescriptionApply}
          />
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="text-2xl font-bold mb-4">Step 2: Review & Publish</h1>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Description:</h3>
              <p>{productData.description}</p>
            </div>
            <Button onClick={() => saveProduct(productData)}>
              Publish Product
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
```

### Example 2: Farmer Dashboard

```tsx
import {
  AIAdvisorChat,
  HarvestTrackingDashboard,
} from "@/components/ai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FarmerDashboard({ farmId }) {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Farmer Dashboard</h1>

      <Tabs defaultValue="harvest">
        <TabsList>
          <TabsTrigger value="harvest">Harvest Tracking</TabsTrigger>
          <TabsTrigger value="advisor">AI Advisor</TabsTrigger>
        </TabsList>

        <TabsContent value="harvest">
          <HarvestTrackingDashboard farmId={farmId} />
        </TabsContent>

        <TabsContent value="advisor">
          <div className="h-[700px]">
            <AIAdvisorChat farmId={farmId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Example 3: Mobile-Optimized Layout

```tsx
"use client";

import { AIAdvisorChat } from "@/components/ai";
import { useState } from "react";

export default function MobileAdvisor() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile FAB button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-primary text-white shadow-lg md:hidden"
      >
        🤖
      </button>

      {/* Mobile modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">AI Advisor</h2>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div className="h-[calc(100vh-60px)]">
            <AIAdvisorChat />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block fixed right-0 top-0 h-screen w-96 border-l">
        <AIAdvisorChat />
      </div>
    </>
  );
}
```

---

## 🎨 Styling & Theming

### Tailwind Configuration

All components use Tailwind CSS classes and respect your theme configuration:

```js
// tailwind.config.js
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#10b981", // Green for agriculture
          foreground: "#ffffff",
        },
        // ... other colors
      },
    },
  },
};
```

### Dark Mode

Components automatically support dark mode:

```tsx
// Enable dark mode at root level
<html className="dark">
  <body>
    <ProductDescriptionGenerator />
  </body>
</html>

// Or use Next.js theme provider
import { ThemeProvider } from "next-themes";

<ThemeProvider attribute="class">
  <ProductDescriptionGenerator />
</ThemeProvider>
```

### Custom Styling

```tsx
// Override with className
<ProductDescriptionGenerator
  className="shadow-2xl border-2 border-green-500"
/>

// Wrap in custom container
<div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-xl">
  <AIAdvisorChat />
</div>
```

---

## 🔗 Integration Guide

### Server-Side Integration

```tsx
// app/products/[id]/edit/page.tsx
import { ProductDescriptionGenerator } from "@/components/ai";
import { database } from "@/lib/database";

export default async function EditProductPage({ params }) {
  const product = await database.product.findUnique({
    where: { id: params.id },
  });

  return (
    <ProductDescriptionGenerator
      productName={product.name}
      category={product.category}
      farmName={product.farm.name}
    />
  );
}
```

### Client-Side State Management

```tsx
"use client";

import { ProductDescriptionGenerator } from "@/components/ai";
import { useProductStore } from "@/store/products";

export default function ProductForm() {
  const { updateProduct } = useProductStore();

  const handleApply = (description) => {
    updateProduct({ description: description.description });
  };

  return <ProductDescriptionGenerator onApply={handleApply} />;
}
```

### API Route Integration

The components automatically call the appropriate API routes. Ensure these endpoints are available:

- `/api/ai/product-description` - Product description generation
- `/api/ai/advisor` - Chat advisor
- `/api/ai/advisor/threads` - Thread management
- `/api/farms/[id]/harvest/*` - Harvest data endpoints

---

## ✅ Best Practices

### Performance

1. **Lazy Loading**: Load AI components only when needed
   ```tsx
   import dynamic from "next/dynamic";
   
   const AIAdvisorChat = dynamic(
     () => import("@/components/ai").then((mod) => mod.AIAdvisorChat),
     { ssr: false }
   );
   ```

2. **Memoization**: Use React.memo for expensive components
   ```tsx
   import { memo } from "react";
   const MemoizedDashboard = memo(HarvestTrackingDashboard);
   ```

### Error Handling

1. **Wrap in Error Boundaries**
   ```tsx
   import { ErrorBoundary } from "react-error-boundary";
   
   <ErrorBoundary fallback={<div>Something went wrong</div>}>
     <AIAdvisorChat />
   </ErrorBoundary>
   ```

2. **Handle Network Errors**
   ```tsx
   const handleApply = async (description) => {
     try {
       await saveDescription(description);
     } catch (error) {
       toast.error("Failed to save description");
     }
   };
   ```

### Accessibility

1. **Keyboard Navigation**: All components support Tab navigation
2. **Screen Readers**: Semantic HTML and ARIA labels included
3. **Focus Management**: Proper focus handling in modals

### UX Guidelines

1. **Loading States**: Always show loading indicators
2. **Error Messages**: Provide clear, actionable error messages
3. **Success Feedback**: Use toast notifications for confirmations
4. **Progressive Disclosure**: Don't overwhelm users with all options at once

---

## 🐛 Troubleshooting

### Component Not Rendering

**Problem**: Component doesn't appear on page

**Solutions**:
```bash
# Check imports
import { ProductDescriptionGenerator } from "@/components/ai";

# Verify path alias in tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# Check for TypeScript errors
npx tsc --noEmit
```

### Styling Issues

**Problem**: Components look unstyled

**Solutions**:
```bash
# Ensure Tailwind is configured
npx tailwindcss -i ./src/app/globals.css -o ./dist/output.css

# Check content paths in tailwind.config.js
content: [
  "./src/**/*.{js,ts,jsx,tsx}",
],

# Verify global CSS is imported
// app/layout.tsx
import "@/app/globals.css";
```

### API Errors

**Problem**: "Failed to fetch" or 401 errors

**Solutions**:
```bash
# Check authentication
# Ensure user is logged in and session is valid

# Verify API routes exist
ls src/app/api/ai/

# Check environment variables
echo $OPENAI_API_KEY
echo $NEXTAUTH_SECRET

# Test API directly
curl -X POST http://localhost:3000/api/ai/product-description \
  -H "Content-Type: application/json" \
  -d '{"productName": "Test", "category": "Test"}'
```

### Toast Notifications Not Showing

**Problem**: Success/error toasts don't appear

**Solution**:
```tsx
// Ensure Toaster is in layout
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster /> {/* Add this */}
      </body>
    </html>
  );
}
```

---

## 📚 Additional Resources

- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Next.js Documentation](https://nextjs.org/docs)

---

## 🚀 What's Next?

### Planned Enhancements

- [ ] Chart integration (Recharts/Chart.js)
- [ ] Real-time updates via WebSocket
- [ ] Batch description generation
- [ ] Voice input for AI Advisor
- [ ] Export options (PDF, CSV)
- [ ] Multi-language support
- [ ] Advanced filtering and search
- [ ] Mobile app integration

---

**Last Updated:** January 2025  
**Maintained by:** Farmers Market Platform Development Team  
**License:** MIT