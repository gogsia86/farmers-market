# 🔧 Vercel Deployment Troubleshooting Guide

**Farmers Market Platform - Common Issues & Solutions**

---

## 📋 Table of Contents

1. [Build Failures](#build-failures)
2. [Database Connection Issues](#database-connection-issues)
3. [Authentication Problems](#authentication-problems)
4. [API Route Errors](#api-route-errors)
5. [Environment Variable Issues](#environment-variable-issues)
6. [Image Loading Problems](#image-loading-problems)
7. [Performance Issues](#performance-issues)
8. [Stripe Payment Failures](#stripe-payment-failures)
9. [CORS Errors](#cors-errors)
10. [Deployment Warnings](#deployment-warnings)

---

## 🚨 Build Failures

### Issue: "Module not found" Error

**Symptoms:**

```
Error: Cannot find module '@/lib/database'
```

**Solution:**

```bash
# 1. Verify tsconfig.json path aliases
cat tsconfig.json | grep "paths"

# 2. Ensure all imports use correct paths
# ✅ Correct:
import { database } from "@/lib/database";

# ❌ Wrong:
import { database } from "../../../lib/database";

# 3. Clear cache and rebuild
rm -rf .next
npm run build
```

---

### Issue: "Prisma Client Not Generated"

**Symptoms:**

```
Error: Cannot find module '@prisma/client'
PrismaClientInitializationError
```

**Solution:**

```bash
# Verify vercel-build script in package.json
"vercel-build": "prisma generate && next build"

# If missing, add it:
npm pkg set scripts.vercel-build="prisma generate && next build"

# Test locally:
npm run vercel-build
```

**Alternative:** Add `postinstall` script:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

---

### Issue: Build Timeout (15 minutes exceeded)

**Symptoms:**

```
Error: Build exceeded maximum duration of 900 seconds
```

**Solutions:**

**Option 1: Optimize Build** (Recommended)

```bash
# 1. Check for heavy dependencies
npm ls --depth=0

# 2. Remove unused dependencies
npm uninstall <unused-package>

# 3. Use dynamic imports for heavy features
# Example: AI/ML features
const TensorFlow = dynamic(() => import('@tensorflow/tfjs'));
```

**Option 2: Increase Timeout** (Requires Vercel Pro)

```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "maxDuration": 300
      }
    }
  ]
}
```

**Option 3: Split Large Dependencies**

```javascript
// next.config.mjs
experimental: {
  optimizePackageImports: [
    "@tensorflow/tfjs",
    // Add other large packages
  ];
}
```

---

### Issue: TypeScript Compilation Errors

**Symptoms:**

```
Type error: Property 'user' does not exist on type 'Session'
```

**Solution:**

```typescript
// 1. Check types/next-auth.d.ts exists
// Create if missing:

// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

// 2. Verify tsconfig.json includes it
// tsconfig.json
{
  "include": [
    "types/**/*.ts",
    // ...
  ]
}

// 3. Restart TypeScript server
# VSCode: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

## 🗄️ Database Connection Issues

### Issue: "Too Many Connections"

**Symptoms:**

```
Error: sorry, too many clients already
PrismaClientInitializationError
```

**Solution:**

**Step 1: Verify Connection Pooling**

```env
# DATABASE_URL must include:
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=1"
```

**Step 2: Check Database Singleton**

```typescript
// src/lib/database/index.ts should export singleton
export const database = globalThis.prisma ?? initializeDatabase();

// NOT creating new instances
// ❌ Wrong:
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient(); // Don't do this!
```

**Step 3: Use Connection Pooling Service**

- **Supabase:** Use "connection pooling" mode URL
- **Neon:** Enable pooling in dashboard
- **Vercel Postgres:** Pooling enabled by default

---

### Issue: Database Connection Timeout

**Symptoms:**

```
Error: Can't reach database server
Connection timeout
```

**Solution:**

**Check 1: Database is Running**

```bash
# Test connection locally
npx prisma db push
npx prisma studio

# If fails, database is down or inaccessible
```

**Check 2: IP Whitelist** (for cloud databases)

```
Vercel IPs are dynamic - use one of:
1. Allow all IPs (0.0.0.0/0) - less secure but works
2. Use Vercel Postgres (no whitelist needed)
3. Use Supabase/Neon (have Vercel integrations)
```

**Check 3: SSL Configuration**

```env
# Some providers require SSL mode
DATABASE_URL="postgresql://...?sslmode=require"

# Or in Prisma schema:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add SSL config if needed
}
```

---

### Issue: Migration Fails After Deployment

**Symptoms:**

```
Error: Migration engine failed to start
```

**Solution:**

**Method 1: Local Migration** (Recommended)

```bash
# 1. Pull production environment variables
vercel env pull .env.production

# 2. Run migration with production DATABASE_URL
npx prisma migrate deploy

# 3. Verify migration
npx prisma migrate status
```

**Method 2: Add Direct URL** (for Vercel Postgres)

```env
# .env
DATABASE_URL="postgresql://...?pgbouncer=true"  # For queries
DIRECT_URL="postgresql://..."  # For migrations (no pgbouncer)
```

```prisma
// prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Add this
}
```

---

## 🔐 Authentication Problems

### Issue: NextAuth "Configuration Error"

**Symptoms:**

```
[next-auth][error][CLIENT_FETCH_ERROR]
Configuration error
```

**Solution:**

**Check 1: NEXTAUTH_SECRET**

```bash
# Generate a secure secret (32+ characters)
openssl rand -base64 32

# Add to Vercel environment variables
# Name: NEXTAUTH_SECRET
# Value: <generated-secret>
```

**Check 2: NEXTAUTH_URL**

```env
# Must match deployment URL exactly
NEXTAUTH_URL="https://your-app.vercel.app"

# With custom domain:
NEXTAUTH_URL="https://yourdomain.com"

# ❌ Wrong:
NEXTAUTH_URL="http://your-app.vercel.app"  # http instead of https
NEXTAUTH_URL="https://your-app.vercel.app/" # trailing slash
```

**Check 3: Callback URLs** (for OAuth providers)

```
If using Google/GitHub OAuth:
1. Update callback URLs in provider dashboard
2. Should be: https://your-app.vercel.app/api/auth/callback/google
```

---

### Issue: Session Not Persisting

**Symptoms:**

- User logs in but is logged out on refresh
- Session undefined on protected routes

**Solution:**

**Check 1: Cookie Configuration**

```typescript
// src/lib/auth/config.ts
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true, // Must be true in production
      },
    },
  },
  // ...
};
```

**Check 2: Domain Configuration**

```typescript
// For custom domains
cookies: {
  sessionToken: {
    options: {
      domain: '.yourdomain.com', // Allow subdomains
      // ...
    }
  }
}
```

---

### Issue: "Invalid CSRF Token"

**Symptoms:**

```
[next-auth][error][CSRF_TOKEN_ERROR]
Invalid CSRF token
```

**Solution:**

```typescript
// Usually caused by cookie issues
// Fix: Update NextAuth configuration

// src/lib/auth/config.ts
export const authOptions: NextAuthOptions = {
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};
```

---

## 🔌 API Route Errors

### Issue: "Function Exceeded Timeout"

**Symptoms:**

```
Error: Function execution timed out (10s)
```

**Solution:**

**Option 1: Increase Timeout**

```json
// vercel.json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30 // Up to 60s on Pro plan
    }
  }
}
```

**Option 2: Optimize Slow Operations**

```typescript
// Use Promise.all for parallel operations
const [farms, products, orders] = await Promise.all([
  database.farm.findMany(),
  database.product.findMany(),
  database.order.findMany(),
]);

// Instead of sequential awaits
const farms = await database.farm.findMany();
const products = await database.product.findMany();
const orders = await database.order.findMany();
```

---

### Issue: "Internal Server Error" (500)

**Symptoms:**

```
500 Internal Server Error
No additional error message
```

**Solution:**

**Step 1: Check Vercel Logs**

```
1. Go to Vercel Dashboard
2. Project → Deployments → Latest → Functions
3. Click on failing function
4. Review error logs
```

**Step 2: Add Error Logging**

```typescript
// src/app/api/your-route/route.ts
export async function GET(request: NextRequest) {
  try {
    // Your code
  } catch (error) {
    console.error("API Error:", error);

    // Return detailed error in development
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        {
          error: error.message,
          stack: error.stack,
        },
        { status: 500 },
      );
    }

    // Generic error in production
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
```

**Step 3: Check Sentry** (if configured)

```
Errors are automatically captured and sent to Sentry
Review in Sentry dashboard for detailed stack traces
```

---

## 🌍 Environment Variable Issues

### Issue: Environment Variables Not Available

**Symptoms:**

```
process.env.DATABASE_URL is undefined
API calls fail with missing configuration
```

**Solution:**

**Check 1: Variable Name Prefix**

```javascript
// Client-side variables MUST start with NEXT_PUBLIC_
// ✅ Correct:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_...";

// ❌ Wrong (won't be available in browser):
STRIPE_PUBLISHABLE_KEY = "pk_...";

// Server-side variables don't need prefix
DATABASE_URL = "postgresql://...";
```

**Check 2: Variable is Set in Vercel**

```bash
# Check via CLI
vercel env ls

# Or in dashboard:
# Project → Settings → Environment Variables
```

**Check 3: Environment Scope**

```
Each variable must be set for correct environment:
- Production ✅
- Preview ✅
- Development (optional)
```

**Check 4: Redeploy After Adding**

```bash
# Environment variables only take effect after redeployment
vercel --prod

# Or trigger via Git push
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

---

### Issue: Different Env Vars for Different Environments

**Solution:**

```
Vercel Dashboard → Environment Variables

For each variable:
1. Add value for Production
2. Add different value for Preview (optional)
3. Add different value for Development (optional)

Example:
NEXTAUTH_URL
- Production: https://yourdomain.com
- Preview: https://preview.yourdomain.com
- Development: http://localhost:3000
```

---

## 🖼️ Image Loading Problems

### Issue: Images Not Loading (403 Forbidden)

**Symptoms:**

```
Failed to load image: 403 Forbidden
Images from external sources don't display
```

**Solution:**

**Update next.config.mjs:**

```javascript
// next.config.mjs
export default {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "your-image-cdn.com",
        port: "",
        pathname: "/**",
      },
      // Add all your image sources
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};
```

---

### Issue: Image Optimization Timeout

**Symptoms:**

```
Error: Image optimization timed out
```

**Solution:**

**Option 1: Increase Timeout**

```javascript
// next.config.mjs
export default {
  images: {
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
};
```

**Option 2: Use Loader**

```javascript
// For Cloudinary images
export default {
  images: {
    loader: "cloudinary",
    path: "https://res.cloudinary.com/your-cloud-name/",
  },
};
```

---

## ⚡ Performance Issues

### Issue: Slow Cold Starts

**Symptoms:**

- First request after inactivity takes 5+ seconds
- Function "waking up" delay

**Solution:**

**Option 1: Keep Functions Warm** (Cron)

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "*/5 * * * *" // Every 5 minutes
    }
  ]
}
```

**Option 2: Reduce Bundle Size**

```javascript
// Use dynamic imports
const HeavyComponent = dynamic(() => import("@/components/HeavyComponent"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});
```

**Option 3: Edge Functions** (for simple routes)

```typescript
// src/app/api/health/route.ts
export const runtime = "edge"; // Add this line

export async function GET() {
  return NextResponse.json({ status: "healthy" });
}
```

---

### Issue: Large Bundle Size Warning

**Symptoms:**

```
Warning: Function size is 52 MB (max 50 MB)
```

**Solution:**

**Check Bundle Size:**

```bash
ANALYZE=true npm run build
```

**Reduce Size:**

```javascript
// 1. Code splitting
// next.config.mjs
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      // Separate large dependencies
      ai: {
        test: /[\\/]node_modules[\\/](@tensorflow|ollama)[\\/]/,
        name: 'ai-ml',
        chunks: 'async',
      }
    }
  }
}

// 2. Remove unused dependencies
npm uninstall <package>

// 3. Use lighter alternatives
# Instead of moment.js (heavy), use date-fns (light)
```

---

## 💳 Stripe Payment Failures

### Issue: "No such payment_intent"

**Symptoms:**

```
Error: No such payment_intent: 'pi_xxx'
```

**Solution:**

**Check 1: API Keys Match Environment**

```env
# Test mode:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Live mode:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."

# Don't mix test and live keys!
```

**Check 2: Client-Side Key is Public**

```javascript
// ✅ Correct:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_...";

// ❌ Wrong (won't work):
STRIPE_PUBLISHABLE_KEY = "pk_...";
```

---

### Issue: Webhook Signature Verification Failed

**Symptoms:**

```
Error: Webhook signature verification failed
```

**Solution:**

**Step 1: Configure Webhook in Stripe**

```
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: https://your-app.vercel.app/api/webhooks/stripe
3. Select events:
   - payment_intent.succeeded
   - checkout.session.completed
   - customer.subscription.updated
4. Copy webhook secret
```

**Step 2: Add Webhook Secret to Vercel**

```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

**Step 3: Verify Webhook Handler**

```typescript
// src/app/api/webhooks/stripe/route.ts
import { headers } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature")!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    // Handle event
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }
}
```

---

## 🔄 CORS Errors

### Issue: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Symptoms:**

```
Access to fetch at 'https://api.yourdomain.com' from origin 'https://yourdomain.com'
has been blocked by CORS policy
```

**Solution:**

**For API Routes:**

```typescript
// src/app/api/your-route/route.ts
export async function GET(request: NextRequest) {
  const response = NextResponse.json({ data: "your data" });

  // Add CORS headers
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  return response;
}

// Handle OPTIONS request
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  );
}
```

**Global CORS Configuration:**

```javascript
// next.config.mjs
export default {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE" },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};
```

---

## ⚠️ Deployment Warnings

### Warning: "Edge Runtime not supported"

**Message:**

```
Warning: Edge Runtime is not supported with this feature
```

**Solution:**

```typescript
// Remove edge runtime from routes using features that don't support it:
// - Prisma (use Node.js runtime)
// - File system access
// - Node.js APIs

// Remove this line:
export const runtime = "edge";

// Or use Node.js runtime explicitly:
export const runtime = "nodejs";
```

---

### Warning: "Large Page Data"

**Message:**

```
Warning: Large page data detected (>128 KB)
```

**Solution:**

```typescript
// Reduce data sent to client
export async function generateStaticParams() {
  const farms = await database.farm.findMany({
    select: {
      id: true,
      slug: true,
      // Only select needed fields
    },
  });

  return farms.map((farm) => ({ slug: farm.slug }));
}
```

---

## 🆘 Emergency Rollback

### If Deployment Breaks Production

```bash
# Method 1: Via Dashboard
1. Go to Vercel Dashboard
2. Deployments tab
3. Find last working deployment
4. Click "..." → "Promote to Production"

# Method 2: Via CLI
vercel rollback [deployment-url]

# Method 3: Via Git
git revert HEAD
git push origin main
# Vercel auto-deploys the reverted code
```

---

## 📞 Getting Help

### Check Logs First

```
Vercel Dashboard → Project → Deployments → Latest → Logs
```

### Support Channels

- **Vercel Support:** https://vercel.com/help
- **Vercel Discord:** https://vercel.com/discord
- **Next.js Discord:** https://nextjs.org/discord
- **GitHub Discussions:** Your repository

### Include in Support Request

1. Error message (exact text)
2. Steps to reproduce
3. Deployment URL
4. Function logs (if applicable)
5. Build logs (if build failed)
6. Environment (Node version, etc.)

---

## ✅ Prevention Checklist

Before deploying changes:

- [ ] Test build locally: `npm run build`
- [ ] Run tests: `npm test`
- [ ] Check types: `npm run type-check`
- [ ] Review environment variables
- [ ] Test in preview deployment first
- [ ] Monitor after deployment

---

**Last Updated:** 2025-01-XX  
**Platform:** Farmers Market Platform v1.0.0  
**Framework:** Next.js 16.0.7

🌾 **"Debug with patience, fix with precision."** ⚡
