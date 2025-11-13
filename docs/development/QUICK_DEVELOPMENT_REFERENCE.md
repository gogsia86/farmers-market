# FARMERS MARKET - QUICK DEVELOPMENT REFERENCE

_Divine Agricultural Platform - Developer Quick Start Guide_

## 🚀 CURRENT STATUS

- **Phase 1**: ✅ Complete (Foundation Setup)
- **Phase 2**: ✅ Complete (Marketing Pages)
- **Phase 3**: 🔄 Ready to Begin (Enhanced Shop Interface)
- **Live Server**: <http://localhost:3000>

## ⚡ QUICK START COMMANDS

```powershell
# Navigate to project
cd v:\Projects\Farmers-Market\farmers-market

# Install dependencies (if needed)
npm install --legacy-peer-deps

# Start development server
npm run dev

# Database operations
npx prisma generate
npx prisma db push
npx prisma studio

# Build and test
npm run build
npm run lint
```

## 🗂️ KEY FILE LOCATIONS

### Core Application Structure

```
farmers-market/src/
├── app/
│   ├── (marketing)/          # ✅ Marketing pages complete
│   │   ├── about/page.tsx    # Company story and values
│   │   ├── contact/page.tsx  # Contact form with API
│   │   ├── events/page.tsx   # Events calendar
│   │   └── vendors/page.tsx  # Vendor directory
│   ├── api/
│   │   ├── contact/route.ts  # Contact form endpoint
│   │   └── farms/route.ts    # Vendor data endpoint
│   ├── layout.tsx            # Root layout with navigation
│   └── page.tsx              # Enhanced homepage
├── components/
│   ├── ui/                   # Base UI components
│   ├── HeroBanner.tsx        # Reusable hero component
│   └── LoadingSpinner.tsx    # Loading states
├── hooks/
│   └── useCart.tsx           # Shopping cart state management
└── lib/                      # Utilities and configurations
```

### Database Schema (Prisma)

```prisma
# prisma/schema.prisma
model User { id, email, name, role, orders }
model Farm { id, name, location, products }
model Product { id, name, price, category, farm }
model Order { id, user, items, total, status }
```

## 🎯 NEXT DEVELOPMENT PRIORITIES

### Phase 3: Enhanced Shop Interface (Ready to Begin)

#### 1. Product Catalog Enhancement

### Files to Create/Modify

- `src/app/(shop)/products/page.tsx` - Advanced product listing
- `src/components/shop/ProductFilter.tsx` - Filtering system
- `src/components/shop/ProductCard.tsx` - Enhanced product display
- `src/hooks/useProductFilter.tsx` - Filter state management

#### 2. Vendor Profile Pages

### Files to Create

- `src/app/(shop)/vendors/[farmId]/page.tsx` - Individual vendor page
- `src/components/shop/VendorProfile.tsx` - Vendor information display
- `src/components/shop/VendorProducts.tsx` - Vendor's product grid

#### 3. Enhanced Shopping Cart

### Files to Modify

- `src/hooks/useCart.tsx` - Add multi-vendor support
- `src/components/cart/CartSidebar.tsx` - Vendor organization
- `src/app/(shop)/checkout/page.tsx` - Improved checkout flow

## 🛠️ TECHNICAL STACK REFERENCE

### Frontend Technologies

```typescript
// Core Stack
"next": "^14.0.0"           // React framework
"react": "^18.0.0"          // UI library
"typescript": "^5.0.0"      // Type safety
"tailwindcss": "^3.0.0"     // Styling
"framer-motion": "^10.0.0"  // Animations

// Form & State Management
"react-hook-form": "^7.0.0" // Forms
"zod": "^3.0.0"             // Validation
"zustand": "^4.0.0"         // State (if needed)

// UI Components
"@headlessui/react": "^1.0.0"     // Accessible components
"@heroicons/react": "^2.0.0"     // Icons
"@radix-ui/react-*": "^1.0.0"    // Component primitives
```

### Backend Technologies

```typescript
// Database & ORM
"prisma": "^5.0.0"          // Database ORM
"@prisma/client": "^5.0.0"  // Database client

// Authentication
"next-auth": "^4.0.0"       // Authentication
"@auth/prisma-adapter": "^1.0.0" // Database adapter

// Payment Processing
"stripe": "^13.0.0"         // Payment processing
"@stripe/stripe-js": "^2.0.0" // Client-side Stripe

// Communication
"resend": "^1.0.0"          // Email service
```

## 🎨 DESIGN SYSTEM REFERENCE

### Color Palette

```css
/* Primary Colors */
--emerald-50: #ecfdf5;
--emerald-500: #10b981;
--emerald-600: #059669;
--emerald-700: #047857;

/* Accent Colors */
--amber-400: #fbbf24;
--amber-500: #f59e0b;

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-900: #111827;
```

### Typography Scale

```css
/* Headings */
.text-4xl {
  font-size: 2.25rem;
} /* 36px */
.text-3xl {
  font-size: 1.875rem;
} /* 30px */
.text-2xl {
  font-size: 1.5rem;
} /* 24px */
.text-xl {
  font-size: 1.25rem;
} /* 20px */

/* Body Text */
.text-lg {
  font-size: 1.125rem;
} /* 18px */
.text-base {
  font-size: 1rem;
} /* 16px */
.text-sm {
  font-size: 0.875rem;
} /* 14px */
```

### Component Patterns

```typescript
// Consistent component structure
interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

// Animation patterns
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};
```

## 📡 API ENDPOINTS REFERENCE

### Active Endpoints

```typescript
// Authentication
GET    /api/auth/*           // NextAuth endpoints

// Vendor Data
GET    /api/farms            // List all farms/vendors
        ?search=string       // Search by name
        &location=string     // Filter by location
        &specialty=string    // Filter by specialty

// Contact
POST   /api/contact          // Submit contact form
        { name, email, message, subject }

// Future Endpoints (to implement)
GET    /api/products         // Product catalog
POST   /api/orders           // Create order
GET    /api/users/profile    // User profile
```

### Response Patterns

```typescript
// Success Response
{
  success: true,
  data: T,
  message?: string
}

// Error Response
{
  success: false,
  error: string,
  details?: ValidationError[]
}
```

## 🔧 DEVELOPMENT WORKFLOWS

### Feature Development Process

1. **Create Feature Branch**: `git checkout -b feature/product-catalog`
2. **Implement Components**: Build UI components first
3. **Add State Management**: Implement hooks and context
4. **Connect APIs**: Integrate with backend endpoints
5. **Add Tests**: Write unit and integration tests
6. **Review & Merge**: Code review and deployment

### Component Development Pattern

```typescript
// 1. Define types
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

// 2. Create component
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Component implementation */}
    </div>
  );
}

// 3. Add to export
export { ProductCard } from './ProductCard';
```

### Database Updates

```powershell
# After schema changes
npx prisma db push        # Push changes to database
npx prisma generate       # Regenerate client
npm run dev              # Restart development server
```

## 🚦 CURRENT DEVELOPMENT STATUS

### ✅ Completed Features

- [x] Homepage with animations and dynamic content
- [x] Vendor directory with filtering and search
- [x] About page with company story and team
- [x] Contact page with working form submission
- [x] Events calendar with category filtering
- [x] Shopping cart state management
- [x] User authentication system
- [x] Database schema and API endpoints

### 🔄 Ready to Implement (Phase 3)

- [ ] Advanced product catalog with filtering
- [ ] Individual vendor profile pages
- [ ] Enhanced shopping cart with multi-vendor support
- [ ] Product detail pages with galleries
- [ ] User dashboard and order history
- [ ] Review and rating system

### 🔮 Future Enhancements

- [ ] Mobile application (React Native/PWA)
- [ ] Vendor management portal
- [ ] Advanced analytics dashboard
- [ ] AI-powered recommendations
- [ ] Multi-market expansion features

## 📞 QUICK TROUBLESHOOTING

### Common Issues & Solutions

```powershell
# Development server won't start
npm install --legacy-peer-deps
npx prisma generate
npm run dev

# Database connection issues
npx prisma db push
npx prisma studio

# Build errors
npm run build
npm run lint --fix

# Clear cache
rm -rf .next
npm run dev
```

### Environment Variables Required

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Payments
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Email
RESEND_API_KEY="re_..."
```

---

**Ready for Phase 3 Development** 🚀  
**Next Focus**: Enhanced Shop Interface Implementation  
**Current Server**: <http://localhost:3000>  
**Documentation**: `/COMPREHENSIVE_WEBSITE_DEVELOPMENT_RECORD.md`
