# 🎨 Design System Quick Reference
## Farmers Market Platform - Copy & Paste Guide

**Version:** 3.0.0  
**Last Updated:** January 2025

---

## 🚀 Quick Start

Copy and paste these patterns for instant consistency!

---

## 🎨 Colors

### Primary Actions
```jsx
className="bg-agricultural-600 hover:bg-agricultural-700"
```

### Secondary Actions
```jsx
className="bg-secondary-600 hover:bg-secondary-700"
```

### Outline Buttons
```jsx
className="border-agricultural-300 text-agricultural-700 hover:bg-agricultural-50"
```

### White Buttons (on dark backgrounds)
```jsx
className="bg-white text-agricultural-700 hover:bg-gray-100"
```

---

## 📄 Hero Section

```jsx
<section className="relative bg-gradient-to-br from-agricultural-50 via-white to-green-50 py-20 overflow-hidden">
  {/* Background Pattern */}
  <div className="absolute inset-0 opacity-5">
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] bg-repeat"></div>
  </div>

  <div className="container mx-auto px-4 relative z-10">
    <div className="max-w-4xl mx-auto text-center">
      {/* Badge */}
      <span className="inline-flex items-center gap-2 bg-agricultural-100 text-agricultural-800 px-5 py-2.5 rounded-full text-sm font-semibold mb-6">
        <Leaf className="h-5 w-5" />
        Badge Text Here
      </span>

      {/* Heading */}
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
        Page Title
      </h1>

      {/* Subtitle */}
      <p className="text-xl md:text-2xl text-gray-600 mb-8">
        Your page description goes here
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button size="lg" className="bg-agricultural-600 hover:bg-agricultural-700">
          Primary Action
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <Button size="lg" variant="outline" className="border-agricultural-300 text-agricultural-700 hover:bg-agricultural-50">
          Secondary Action
        </Button>
      </div>
    </div>
  </div>
</section>
```

---

## 🃏 Card Component

```jsx
<Card className="h-full hover:shadow-xl transition-all duration-200 border-2 hover:border-agricultural-200">
  <CardHeader className="p-0">
    {/* Image Container */}
    <div className="relative h-48 bg-gradient-to-br from-agricultural-400 to-agricultural-600 rounded-t-lg overflow-hidden">
      {image ? (
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="h-16 w-16 text-white/60" />
        </div>
      )}
      
      {/* Optional Badge */}
      <div className="absolute top-3 right-3">
        <Badge className="bg-agricultural-600 text-white">
          Featured
        </Badge>
      </div>
    </div>
  </CardHeader>

  <CardContent className="p-6">
    {/* Title */}
    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-agricultural-600 transition-colors">
      Card Title
    </h3>

    {/* Description */}
    <p className="text-gray-600 mb-4 line-clamp-2">
      Card description text goes here
    </p>

    {/* Footer */}
    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
      <span className="text-agricultural-600 font-medium">View Details</span>
      <ArrowRight className="h-4 w-4 text-agricultural-600" />
    </div>
  </CardContent>
</Card>
```

---

## 📢 CTA Section

```jsx
<section className="py-16 bg-gradient-to-br from-agricultural-600 via-agricultural-700 to-secondary-600 text-white">
  <div className="container mx-auto px-4">
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Call to Action Heading
      </h2>
      <p className="text-xl text-white/90 mb-8">
        Supporting text that explains the value proposition
      </p>
      <div className="flex gap-4 justify-center flex-wrap">
        <Button size="lg" className="bg-white text-agricultural-700 hover:bg-gray-100">
          Primary Action
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
          Secondary Action
        </Button>
      </div>
    </div>
  </div>
</section>
```

---

## 📊 Stats Section

```jsx
<section className="py-16 bg-gradient-to-br from-agricultural-50 via-white to-green-50">
  <div className="container mx-auto px-4">
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
        Section Title
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="text-5xl font-bold text-agricultural-600 mb-2">
            500+
          </div>
          <p className="text-lg font-semibold text-gray-900 mb-2">
            Metric Title
          </p>
          <p className="text-gray-600">
            Description text
          </p>
        </div>
        {/* Repeat for other stats */}
      </div>
    </div>
  </div>
</section>
```

---

## 🔘 Buttons

### Primary Button
```jsx
<Button className="bg-agricultural-600 hover:bg-agricultural-700">
  Click Me
</Button>
```

### Secondary Button
```jsx
<Button className="bg-secondary-600 hover:bg-secondary-700">
  Click Me
</Button>
```

### Outline Button
```jsx
<Button variant="outline" className="border-agricultural-300 text-agricultural-700 hover:bg-agricultural-50">
  Click Me
</Button>
```

### White Button (on dark)
```jsx
<Button className="bg-white text-agricultural-700 hover:bg-gray-100">
  Click Me
</Button>
```

### Button with Icon
```jsx
<Button className="bg-agricultural-600 hover:bg-agricultural-700">
  <ShoppingCart className="h-5 w-5 mr-2" />
  Add to Cart
</Button>
```

---

## 📝 Typography

### H1 - Page Title
```jsx
<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
  Main Heading
</h1>
```

### H2 - Section Title
```jsx
<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
  Section Title
</h2>
```

### H3 - Card Title
```jsx
<h3 className="text-xl font-bold text-gray-900 mb-2">
  Card Title
</h3>
```

### Large Body
```jsx
<p className="text-xl md:text-2xl text-gray-600 mb-8">
  Large description text
</p>
```

### Regular Body
```jsx
<p className="text-gray-600 mb-4">
  Regular body text
</p>
```

### Small Text
```jsx
<p className="text-sm text-gray-600">
  Small text for metadata
</p>
```

---

## 🔗 Links

### Inline Link
```jsx
<Link href="/path" className="text-agricultural-600 hover:text-agricultural-700 hover:underline">
  Link Text
</Link>
```

### Link with Icon
```jsx
<Link href="/path" className="text-agricultural-600 hover:text-agricultural-700 font-semibold flex items-center gap-2">
  View All
  <ArrowRight className="h-5 w-5" />
</Link>
```

---

## 🏷️ Badges

### Primary Badge
```jsx
<Badge className="bg-agricultural-600 text-white hover:bg-agricultural-700">
  <Leaf className="h-3 w-3 mr-1" />
  Organic
</Badge>
```

### Light Badge
```jsx
<span className="inline-flex items-center gap-2 bg-agricultural-100 text-agricultural-800 px-4 py-2 rounded-full text-sm font-medium">
  <Icon className="h-4 w-4" />
  Badge Text
</span>
```

---

## 📐 Grid Layouts

### Product/Farm Grid
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Cards */}
</div>
```

### Category Grid
```jsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
  {/* Categories */}
</div>
```

### Stats Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  {/* Stats */}
</div>
```

---

## 📦 Page Template

```jsx
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Leaf, ArrowRight } from "lucide-react";

export default function YourPage() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-agricultural-50 via-white to-green-50 py-20 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] bg-repeat"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 bg-agricultural-100 text-agricultural-800 px-5 py-2.5 rounded-full text-sm font-semibold mb-6">
                <Leaf className="h-5 w-5" />
                Badge Text
              </span>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
                Your Page Title
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8">
                Your page description
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" className="bg-agricultural-600 hover:bg-agricultural-700">
                  Primary Action
                </Button>
                <Button size="lg" variant="outline" className="border-agricultural-300 text-agricultural-700 hover:bg-agricultural-50">
                  Secondary Action
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              {/* Your content here */}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-agricultural-600 via-agricultural-700 to-secondary-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Call to Action
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Supporting text
              </p>
              <Button size="lg" className="bg-white text-agricultural-700 hover:bg-gray-100">
                Get Started
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
```

---

## 🎨 Color Reference

| Color | Class | Hex |
|-------|-------|-----|
| Agricultural 50 | `bg-agricultural-50` | `#fdf8f3` |
| Agricultural 100 | `bg-agricultural-100` | `#f9ede3` |
| Agricultural 200 | `bg-agricultural-200` | `#f1d4bf` |
| Agricultural 300 | `bg-agricultural-300` | `#e8b896` |
| Agricultural 400 | `bg-agricultural-400` | `#d89561` |
| Agricultural 600 | `bg-agricultural-600` | `#a85d32` ⭐ |
| Agricultural 700 | `bg-agricultural-700` | `#8b4a2b` |
| Secondary 600 | `bg-secondary-600` | `#e0511b` |
| Secondary 700 | `bg-secondary-700` | `#b93d18` |
| Gray 600 | `text-gray-600` | `#4b5563` |
| Gray 900 | `text-gray-900` | `#111827` |

---

## 📏 Spacing

```jsx
// Section Padding
py-16                           // Standard
py-20                           // Hero
py-16 sm:py-20 lg:py-24         // Responsive

// Container
container mx-auto px-4          // Standard
max-w-4xl mx-auto               // Narrow
max-w-7xl mx-auto               // Wide

// Gaps
gap-4                           // Buttons
gap-6                           // Cards
gap-8                           // Stats
```

---

## ✅ Quick Checklist

When creating a new page:

- [ ] Import Header and Footer
- [ ] Use agricultural color palette
- [ ] Add background pattern to hero
- [ ] Include badge in hero section
- [ ] Use consistent button styles
- [ ] Apply standard spacing
- [ ] Add responsive classes
- [ ] Include ArrowRight icons on CTAs
- [ ] Test hover states
- [ ] Verify mobile layout

---

**Need more?** See `UNIFIED_DESIGN_SYSTEM.md` for complete documentation.

**Version:** 3.0.0 | **Status:** ✅ Ready to Use