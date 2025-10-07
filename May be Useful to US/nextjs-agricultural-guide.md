# 🚀 NEXT.JS FARMERS MARKET PLATFORM - COMPLETE DEVELOPMENT GUIDE
*VS Code + GitHub Copilot Integration*

## PHASE 1: NEXT.JS ENVIRONMENT SETUP
--------------------------

### 1. INSTALL PREREQUISITES
```bash
# Install Node.js (LTS version)
# Download from: https://nodejs.org/

# Verify installation
node --version
npm --version
```

### 2. INSTALL VS CODE EXTENSIONS FOR NEXT.JS
```bash
# Essential Next.js Extensions:
- Next.js snippets
- Auto Rename Tag
- ES7+ React/Redux/React-Native snippets
- Thunder Client (API testing)
- Tailwind CSS IntelliSense
- Prisma
- GitHub Copilot
```

### 3. CREATE NEXT.JS PROJECT WITH AGRICULTURAL TEMPLATE
```bash
# Create new Next.js project
npx create-next-app@latest farmers-market-platform --typescript --tailwind --eslint --app

# Navigate to project
cd farmers-market-platform

# Install agricultural-specific dependencies
npm install @prisma/client prisma
npm install lucide-react @radix-ui/react-dialog
npm install @hookform/resolvers zod
npm install date-fns
```

## PHASE 2: PROJECT STRUCTURE WITH AGRICULTURAL CONTEXT
----------------------------

### STEP 1: CREATE AGRICULTURAL PROJECT STRUCTURE
```bash
# Core Next.js structure with agricultural modules
src/
├── app/                    # App Router (Next.js 13+)
│   ├── (auth)/            # Route groups
│   ├── (dashboard)/
│   ├── api/               # API routes
│   ├── globals.css
│   └── layout.tsx
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── agricultural/     # Farm-specific components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
│   ├── auth.ts
│   ├── db.ts
│   └── utils.ts
├── types/                # TypeScript definitions
└── hooks/               # Custom React hooks
```

### STEP 2: GENERATE AGRICULTURAL LAYOUT WITH COPILOT
```typescript
// app/layout.tsx - Main layout with agricultural theming
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="agricultural-theme">
      <body className={`${inter.className} bg-agricultural-50`}>
        <AgriculturalProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </AgriculturalProvider>
      </body>
    </html>
  )
}
```

### STEP 3: CREATE AGRICULTURAL PAGE STRUCTURE WITH COPILOT
```typescript
// Use Copilot to generate agricultural pages
// Type: "Create farmers market homepage with seasonal products"
// in app/page.tsx

export default function HomePage() {
  return (
    <div className="container mx-auto px-4">
      <SeasonalHero />
      <FeaturedProducts season="current" />
      <FarmerSpotlight />
      <MarketSchedule />
    </div>
  )
}
```

## PHASE 3: AGRICULTURAL FEATURE DEVELOPMENT
----------------------------

### STEP 1: CREATE AGRICULTURAL COMPONENTS WITH COPILOT
```typescript
// components/agricultural/ProductCard.tsx
// Type: "Create agricultural product card with seasonal indicators"

interface AgriculturalProduct {
  id: string
  name: string
  price: number
  season: 'spring' | 'summer' | 'fall' | 'winter'
  organic: boolean
  farmer: {
    name: string
    region: string
  }
  harvestDate: Date
}

export function ProductCard({ product }: { product: AgriculturalProduct }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-green-200 overflow-hidden">
      <SeasonalBadge season={product.season} />
      {product.organic && <OrganicCertificationBadge />}
      <ProductImage />
      <ProductDetails />
      <FreshnessIndicator harvestDate={product.harvestDate} />
    </div>
  )
}
```

### STEP 2: IMPLEMENT AGRICULTURAL API ROUTES
```typescript
// app/api/products/route.ts
// Type: "Create seasonal products API endpoint with filtering"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const season = searchParams.get('season')
  const region = searchParams.get('region')
  
  // Agricultural business logic
  const products = await getSeasonalProducts(season, region)
  
  return Response.json({ products })
}
```

### STEP 3: CREATE AGRICULTURAL HOOKS
```typescript
// hooks/useSeasonalData.ts
// Type: "Create hook for seasonal agricultural data"

export function useSeasonalData() {
  const [season, setSeason] = useState(getCurrentSeason())
  const [regionalProducts, setRegionalProducts] = useState([])
  
  // Agricultural logic for season detection
  const getCurrentSeason = () => {
    // Implementation based on date and geographic data
  }
  
  return { season, regionalProducts, setSeason }
}
```

## PHASE 4: DATA MANAGEMENT & BACKEND
----------------------------

### STEP 1: SET UP AGRICULTURAL DATABASE SCHEMA
```typescript
// lib/db.ts with Prisma
// Type: "Create agricultural database schema for farmers market"

model Farmer {
  id          String   @id @default(cuid())
  name        String
  farmName    String
  region      String
  certifications Certification[]
  products    Product[]
  createdAt   DateTime @default(now())
}

model Product {
  id          String   @id @default(cuid())
  name        String
  price       Float
  category    ProductCategory
  season      Season
  organic     Boolean  @default(false)
  harvestDate DateTime
  farmer      Farmer   @relation(fields: [farmerId], references: [id])
  farmerId    String
}
```

### STEP 2: IMPLEMENT AGRICULTURAL API ENDPOINTS
```typescript
// app/api/farmers/route.ts
// Type: "Create farmer management API with agricultural features"

export async function POST(request: Request) {
  const data = await request.json()
  
  // Agricultural validation
  if (!isValidFarmRegion(data.region)) {
    return Response.json({ error: 'Invalid farming region' }, { status: 400 })
  }
  
  const farmer = await createFarmer(data)
  return Response.json(farmer)
}
```

## PHASE 5: STYLING & UI/UX
----------------------------

### STEP 1: AGRICULTURAL DESIGN SYSTEM WITH TAILWIND
```css
/* globals.css - Agricultural theme */
@layer base {
  :root {
    --agricultural-green: #4CAF50;
    --organic-brown: #8B4513;
    --harvest-gold: #FFD700;
    --seasonal-spring: #90EE90;
    --seasonal-summer: #FFA500;
    --seasonal-fall: #D2691E;
    --seasonal-winter: #87CEEB;
  }
  
  .agricultural-theme {
    color-scheme: light;
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 142.1 70.6% 45.3%;
    --primary-foreground: 355.7 100% 97.3%;
  }
}
```

### STEP 2: RESPONSIVE AGRICULTURAL COMPONENTS
```typescript
// components/agricultural/SeasonalMarketplace.tsx
// Type: "Create responsive seasonal marketplace grid"

export function SeasonalMarketplace() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <SeasonalFilters />
      <ProductGrid />
      <RegionalMap />
    </div>
  )
}
```

## PHASE 6: AUTHENTICATION & AUTHORIZATION
----------------------------

### STEP 1: AGRICULTURAL AUTHENTICATION SYSTEM
```typescript
// lib/auth.ts
// Type: "Create agricultural authentication with farmer roles"

export const authConfig = {
  pages: {
    signIn: '/auth/signin',
    farmerOnboarding: '/auth/farmer-setup',
  },
  callbacks: {
    async session({ session, token }) {
      // Add agricultural context to session
      session.user.role = token.role // 'farmer', 'customer', 'admin'
      session.user.region = token.region
      return session
    }
  }
}
```

### STEP 2: ROLE-BASED AGRICULTURAL ACCESS
```typescript
// middleware.ts
// Type: "Create agricultural route protection middleware"

export function middleware(request: NextRequest) {
  // Agricultural route protection
  if (request.nextUrl.pathname.startsWith('/farmer')) {
    return validateFarmerAccess(request)
  }
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return validateAdminAccess(request)
  }
}
```

## PHASE 7: PERFORMANCE OPTIMIZATION
----------------------------

### STEP 1: AGRICULTURAL DATA FETCHING STRATEGIES
```typescript
// Using Next.js data fetching with agricultural context
async function SeasonalProductsPage() {
  // Static Generation for seasonal data
  const seasonalProducts = await getStaticProps({ 
    season: getCurrentSeason(),
    revalidate: 3600 // Revalidate every hour for fresh produce
  })
  
  // Client-side for real-time inventory
  const [inventory, setInventory] = useState([])
  
  return (
    <div>
      <StaticSeasonalProducts products={seasonalProducts} />
      <RealTimeInventory inventory={inventory} />
    </div>
  )
}
```

### STEP 2: IMAGE OPTIMIZATION FOR PRODUCT PHOTOS
```typescript
// components/agricultural/ProductImage.tsx
import Image from 'next/image'

export function ProductImage({ src, alt, harvestDate }: ProductImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={300}
      height={200}
      className="rounded-lg object-cover"
      placeholder="blur"
      blurDataURL="/agricultural-placeholder.png"
      priority={isFreshProduce(harvestDate)} // Priority for fresh items
    />
  )
}
```

## PHASE 8: TESTING & QUALITY ASSURANCE
----------------------------

### STEP 1: AGRICULTURAL TESTING UTILITIES
```typescript
// __tests__/agricultural/utils.test.ts
// Type: "Create tests for seasonal product validation"

describe('Seasonal Product Validation', () => {
  it('should validate harvest dates are within season', () => {
    const product = {
      name: 'Tomatoes',
      season: 'summer' as const,
      harvestDate: new Date('2024-01-15') // Winter date
    }
    
    expect(validateProductSeason(product)).toBe(false)
  })
  
  it('should allow organic certification for eligible products', () => {
    const product = createAgriculturalProduct({ organic: true })
    expect(product.certifications).toContain('ORGANIC')
  })
})
```

### STEP 2: E2E TESTING FOR FARMER WORKFLOWS
```typescript
// e2e/farmer-onboarding.spec.ts
// Type: "Create end-to-end test for farmer registration"

test('farmer complete onboarding flow', async ({ page }) => {
  await page.goto('/farmer/onboarding')
  await page.fill('[data-testid="farm-name"]', 'Green Valley Organic Farm')
  await page.selectOption('[data-testid="region"]', 'pacific-northwest')
  await page.click('[data-testid="organic-certification"]')
  await page.click('[data-testid="submit-onboarding"]')
  
  await expect(page).toHaveURL('/farmer/dashboard')
  await expect(page.locator('[data-testid="welcome-message"]'))
    .toContainText('Welcome to Green Valley Organic Farm')
})
```

## PHASE 9: DEPLOYMENT & PRODUCTION
----------------------------

### STEP 1: AGRICULTURAL DEPLOYMENT CONFIGURATION
```javascript
// next.config.js - Agricultural optimizations
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@agricultural/utils'],
  },
  images: {
    domains: ['farm-images.agricultural-platform.com'],
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    SEASONAL_API_KEY: process.env.SEASONAL_API_KEY,
    FARMER_PORTAL_URL: process.env.FARMER_PORTAL_URL,
  },
}

module.exports = nextConfig
```

### STEP 2: PRODUCTION DEPLOYMENT OPTIONS

**OPTION 1: VERCEL (Recommended for Next.js)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables for agricultural context
vercel env add SEASONAL_DATA_API_URL
vercel env add FARMER_AUTH_SECRET
```

**OPTION 2: NETLIFY**
```bash
# Build command
npm run build

# Publish directory
out/
```

**OPTION 3: SELF-HOSTED WITH DOCKER**
```dockerfile
# Dockerfile for agricultural platform
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## PHASE 10: COPILOT INTEGRATION FOR NEXT.JS
----------------------------

### STEP 1: NEXT.JS SPECIFIC COPILOT PROMPTS
```prompt
# Generate Next.js App Router page with agricultural context
"Create a seasonal products page using Next.js 13+ App Router with:
- Server component for product data fetching
- Client component for interactive filters
- Agricultural TypeScript interfaces
- Seasonal availability logic
- Responsive grid layout"

# Generate API route with agricultural validation
"Create Next.js API route for farmer product submissions with:
- Agricultural data validation (harvest dates, organic certification)
- Image upload handling for product photos
- Seasonal availability calculations
- Error handling for farming-specific scenarios"
```

### STEP 2: AGRICULTURAL COPILOT SHORTCUTS
```bash
# Quick component generation
/create-agricultural-page products seasonal --type=server --features=filtering,pagination
/generate-agricultural-api farmers --methods=create,read,update --validation=agricultural
/create-seasonal-hook --data=products --context=regional --caching=swr

# Agricultural pattern templates
/pattern agricultural-dashboard --layout=grid --components=metrics,charts,actions
/pattern farmer-onboarding --steps=registration,certification,inventory-setup
/pattern seasonal-marketplace --filters=region,category,freshness --sorting=price,harvest-date
```

## PHASE 11: PRODUCTION MONITORING & ANALYTICS
----------------------------

### STEP 1: AGRICULTURAL PERFORMANCE MONITORING
```typescript
// lib/analytics.ts - Agricultural-specific tracking
export function trackAgriculturalEvent(event: AgriculturalEvent) {
  // Track farming-specific metrics
  analytics.track({
    event: event.type,
    properties: {
      season: getCurrentSeason(),
      region: getUserRegion(),
      productCategory: event.category,
      farmerType: event.farmerType,
    }
  })
}
```

### STEP 2: ERROR MONITORING FOR FARMING OPERATIONS
```typescript
// app/global-error.tsx - Agricultural error handling
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Log agricultural context with errors
  useEffect(() => {
    agriculturalErrorLogger.error(error, {
      season: getCurrentSeason(),
      userType: getCurrentUserType(),
      agriculturalFeature: getCurrentFeature(),
    })
  }, [error])

  return (
    <AgriculturalErrorPage error={error} reset={reset} />
  )
}
```

## TROUBLESHOOTING COMMON NEXT.JS ISSUES
------------------------------

### 1. AGRICULTURAL DATA FETCHING PROBLEMS
```typescript
// Common issue: Seasonal data not updating
// Solution: Implement proper revalidation
export const revalidate = 3600 // Revalidate hourly for fresh data

// Use: Seasonal data should use time-based revalidation
export async function getSeasonalProducts() {
  const res = await fetch('https://api.seasonal-data.com/products', {
    next: { revalidate: 3600 } // Cache for 1 hour
  })
  return res.json()
}
```

### 2. IMAGE OPTIMIZATION FOR PRODUCT PHOTOS
```typescript
// Issue: Product images not loading from external domains
// Solution: Configure next.config.js
// next.config.js
module.exports = {
  images: {
    domains: [
      'farm-images.cdn.agricultural.com',
      'product-photos.farmers-market.org',
    ],
  },
}
```

### 3. AUTHENTICATION IN APP ROUTER
```typescript
// Issue: Protecting agricultural routes
// Solution: Use middleware for route protection
// middleware.ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/farmer')) {
    // Agricultural route protection logic
    return agriculturalAuthMiddleware(request)
  }
}
```

## NEXT STEPS AFTER BASIC PLATFORM
-------------------------------

### 1. ADVANCED AGRICULTURAL FEATURES
```bash
# Add real-time inventory management
npm install socket.io

# Implement agricultural analytics
npm install @agricultural/analytics

# Add mobile PWA capabilities
npm install next-pwa
```

### 2. SCALING FOR MULTIPLE REGIONS
```typescript
// Implement regional agricultural adaptations
export function getRegionalConfig(region: AgriculturalRegion) {
  return {
    growingSeasons: getRegionalSeasons(region),
    popularProducts: getRegionalProducts(region),
    deliveryOptions: getRegionalDelivery(region),
  }
}
```

### 3. AI-POWERED AGRICULTURAL FEATURES
```typescript
// Add AI recommendations for seasonal products
export async function getAISeasonalRecommendations(userId: string) {
  const preferences = await getUserPreferences(userId)
  const seasonalData = await getCurrentSeasonalData()
  
  return generateAIRecommendations(preferences, seasonalData)
}
```

## COPILOT BEST PRACTICES FOR NEXT.JS AGRICULTURAL DEVELOPMENT
------------------------------

### 1. CONTEXT-AWARE PROMPTING
```prompt
# Good: Specific agricultural context
"Create a Next.js server component for displaying seasonal organic vegetables with:
- Harvest date freshness indicators
- Farmer certification badges
- Regional availability filtering
- Mobile-responsive grid layout"

# Bad: Too generic
"Make a product page"
```

### 2. TYPE-SAFE AGRICULTURAL DEVELOPMENT
```typescript
// Use Copilot to generate agricultural TypeScript types
// Type: "Create TypeScript interfaces for agricultural product data"

interface AgriculturalProduct {
  id: string
  name: string
  category: ProductCategory
  season: Season
  organic: boolean
  harvestDate: Date
  farmer: Farmer
  certifications: Certification[]
  regionalAvailability: RegionalAvailability[]
}
```

### 3. PERFORMANCE-FOCUSED GENERATION
```prompt
"Create an optimized seasonal product grid with:
- Next.js Image component with blur placeholders
- Dynamic imports for heavy agricultural components
- SWR for real-time inventory updates
- Accessibility features for farmers in the field"
```

---

**SAVE AS:** `nextjs-agricultural-guide.md`
**USAGE:** Keep open in VS Code during Next.js agricultural platform development
**DEV COMMAND:** `npm run dev`
**BUILD COMMAND:** `npm run build`
**DEPLOY COMMAND:** `npm run deploy`

*This comprehensive guide provides everything needed to build a production-ready Farmers Market Platform using Next.js with agricultural domain specificity and Copilot integration.*