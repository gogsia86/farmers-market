# 📸 Quick Reference: Photo Integration System

**Last Updated:** January 2026
**Status:** Production Ready

---

## 🚀 Quick Start

### Use Pre-Built Components

```tsx
// For Farms
import { FarmImage, FarmImageGallery, FarmLogoAvatar } from "@/components/images/FarmImage";

<FarmImage farm={farm} variant="card" showBadges />
<FarmImageGallery farm={farm} />
<FarmLogoAvatar farm={farm} size="md" />

// For Products
import { ProductImage, ProductImageCarousel, ProductThumbnail } from "@/components/images/ProductImage";

<ProductImage product={product} variant="grid" showBadges />
<ProductImageCarousel product={product} />
<ProductThumbnail product={product} size="lg" />
```

---

## 📁 New Pages Created

| Page | Path | Purpose |
|------|------|---------|
| Farm Detail | `/farms/[slug]` | Individual farm profiles with gallery |
| Contact | `/contact` | Contact form and support info |
| How It Works | `/how-it-works` | Platform explanation |
| FAQ | `/faq` | 26 common questions answered |

---

## 🖼️ Image Priority Order

### Farms
```
bannerUrl → logoUrl → images[0] → photos[0].photoUrl → 🌾 placeholder
```

### Products
```
primaryPhotoUrl → images[0] → photoUrls[0] → 🥬 placeholder
```

---

## 🎨 Component Variants

### FarmImage
```tsx
variant: "hero" | "card" | "thumbnail" | "logo"

<FarmImage farm={farm} variant="hero" priority />     // Hero section
<FarmImage farm={farm} variant="card" />              // Grid cards
<FarmImage farm={farm} variant="thumbnail" />         // Small previews
<FarmImage farm={farm} variant="logo" />              // Logo display
```

### ProductImage
```tsx
variant: "hero" | "card" | "grid" | "thumbnail"

<ProductImage product={product} variant="hero" priority showBadges /> // Detail page
<ProductImage product={product} variant="grid" showBadges />          // Product grid
<ProductImage product={product} variant="card" />                     // Related items
<ProductImage product={product} variant="thumbnail" />                // Cart items
```

---

## 🎯 Always Show Images Pattern

```tsx
// ✅ CORRECT - Always shows something
{imageUrl ? (
  <Image
    src={imageUrl}
    alt={name}
    fill
    className="object-cover"
    sizes="(max-width: 640px) 100vw, 33vw"
  />
) : (
  <div className="flex h-full items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
    <span className="text-6xl">🌾</span>
  </div>
)}

// ❌ WRONG - May show nothing
{imageUrl && <Image src={imageUrl} alt={name} fill />}
```

---

## 📐 Responsive Sizes

```tsx
// Hero Images (full width)
sizes="100vw"

// Grid Images (responsive columns)
sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"

// Thumbnails (fixed size)
sizes="100px"
```

---

## 🎨 Placeholder Gradients

```tsx
// Farm Placeholder
className="bg-gradient-to-br from-green-50 to-emerald-100"

// Product Placeholder
className="bg-gradient-to-br from-green-50 to-emerald-50"
```

---

## 🏷️ Badge System

```tsx
// Product Badges (automatic)
<ProductImage product={product} showBadges />

// Displays:
// 🌱 Organic (if product.organic === true)
// ⭐ Featured (if product.featured === true)
```

---

## 🔍 Database Queries

### Fetch Farm with Photos
```typescript
const farm = await database.farm.findUnique({
  where: { slug },
  include: {
    photos: {
      orderBy: [
        { isPrimary: "desc" },
        { sortOrder: "asc" },
      ],
    },
  },
});
```

### Fetch Products with Images
```typescript
const products = await database.product.findMany({
  where: { farmId, status: "ACTIVE" },
  orderBy: [
    { featured: "desc" },
    { createdAt: "desc" },
  ],
});
```

---

## 🎭 Emoji Reference

| Type | Emoji | Usage |
|------|-------|-------|
| Farm | 🌾 | Default farm placeholder |
| Product | 🥬 | Organic product placeholder |
| Product | 🥕 | Generic product placeholder |
| Organic Badge | 🌱 | Organic certification |
| Featured Badge | ⭐ | Featured item |
| Verified | ✓ | Verified farm |

---

## ⚡ Performance Tips

### Priority Loading
```tsx
// Above the fold images
<Image priority />

// Below the fold images
<Image loading="lazy" /> // default
```

### Quality Settings
```tsx
<Image quality={90} /> // Hero images
<Image quality={85} /> // Standard images (default)
<Image quality={80} /> // Thumbnails
<Image quality={70} /> // Gallery thumbnails
```

### Suspense Boundaries
```tsx
<Suspense fallback={<SkeletonLoader />}>
  <AsyncImageComponent />
</Suspense>
```

---

## 🧪 Testing Checklist

- [ ] All images display (no broken links)
- [ ] Placeholders show when no image
- [ ] Hover effects work smoothly
- [ ] Mobile responsive (test all breakpoints)
- [ ] Alt text present on all images
- [ ] Loading states display correctly
- [ ] Gallery navigation works
- [ ] Badges display properly

---

## 🐛 Common Issues & Solutions

### Issue: Images not loading
```tsx
// Check image URL format
console.log('Image URL:', imageUrl);

// Ensure domain is in next.config.mjs
images: {
  domains: ['your-cdn-domain.com'],
}
```

### Issue: Layout shift
```tsx
// Use fill with aspect ratio container
<div className="relative h-48 w-full">
  <Image src={url} alt={alt} fill />
</div>
```

### Issue: Blurry images
```tsx
// Increase quality for important images
<Image quality={90} />

// Check sizes attribute
sizes="(max-width: 640px) 100vw, 50vw"
```

---

## 📚 Documentation

- **Full Analysis:** `WEBSITE_PAGES_PHOTO_ANALYSIS.md`
- **Implementation Guide:** `IMPLEMENTATION_COMPLETE_2026-01-PHOTOS.md`
- **This Quick Reference:** `QUICK_REFERENCE_PHOTOS.md`

---

## 🆘 Need Help?

**Component Issues:**
- Check `/src/components/images/` for source code
- Review TypeScript interfaces for props
- Look at usage examples in this guide

**Image Issues:**
- Verify database has image URLs
- Check Next.js image domains config
- Review browser console for errors

**Design Issues:**
- Reference `WEBSITE_PAGES_PHOTO_ANALYSIS.md` for design system
- Check Tailwind class names
- Verify gradient colors

---

## ✅ Key Principles

1. **ALWAYS show images** - Use placeholders when needed
2. **Responsive by default** - Use proper `sizes` attribute
3. **Performance first** - Lazy load below fold
4. **Accessible** - Include alt text always
5. **Consistent design** - Use pre-built components

---

**Happy Coding!** 🚀
