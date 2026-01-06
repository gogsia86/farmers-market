# 🚀 Performance Monitoring Guide

This guide helps you monitor and optimize the performance of your Farmers Market Platform deployment.

---

## Quick Performance Check

### 1. Manual Testing with Browser DevTools

#### Chrome DevTools - Performance Tab
```
1. Open your production site
2. Press F12 to open DevTools
3. Go to "Performance" tab
4. Click "Record" and interact with the page
5. Stop recording and analyze:
   - Loading time
   - JavaScript execution time
   - Rendering time
   - Network requests
```

#### Chrome DevTools - Lighthouse
```
1. Open your production site
2. Press F12 to open DevTools
3. Go to "Lighthouse" tab
4. Select categories:
   ☑ Performance
   ☑ Accessibility
   ☑ Best Practices
   ☑ SEO
5. Click "Analyze page load"
6. Review the report
```

**Target Scores:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

---

## 2. Automated Performance Testing

### Using Lighthouse CI

#### Install Lighthouse CLI:
```bash
npm install -g @lhci/cli lighthouse
```

#### Run Lighthouse from Command Line:
```bash
# Basic test
lighthouse https://your-app.vercel.app --view

# Save report
lighthouse https://your-app.vercel.app --output=html --output-path=./reports/lighthouse-report.html

# Test specific page
lighthouse https://your-app.vercel.app/products --view

# Mobile test
lighthouse https://your-app.vercel.app --preset=mobile --view

# Desktop test
lighthouse https://your-app.vercel.app --preset=desktop --view
```

#### Run Multiple Tests:
```bash
# Create a test script
cat > scripts/run-lighthouse.sh << 'EOF'
#!/bin/bash

BASE_URL="https://your-app.vercel.app"
OUTPUT_DIR="./performance-reports"

mkdir -p $OUTPUT_DIR

echo "Running Lighthouse tests..."

# Test homepage
lighthouse $BASE_URL \
  --output=html \
  --output-path=$OUTPUT_DIR/homepage.html \
  --chrome-flags="--headless"

# Test products page
lighthouse $BASE_URL/products \
  --output=html \
  --output-path=$OUTPUT_DIR/products.html \
  --chrome-flags="--headless"

# Test farms page
lighthouse $BASE_URL/farms \
  --output=html \
  --output-path=$OUTPUT_DIR/farms.html \
  --chrome-flags="--headless"

echo "Reports saved to $OUTPUT_DIR/"
EOF

chmod +x scripts/run-lighthouse.sh
./scripts/run-lighthouse.sh
```

---

## 3. Core Web Vitals Monitoring

### What to Monitor:

#### LCP (Largest Contentful Paint)
- **Target**: < 2.5s
- **What it measures**: Time until largest content element is rendered
- **How to improve**:
  - Optimize images (use Next.js Image component)
  - Reduce server response time
  - Eliminate render-blocking resources
  - Use CDN for static assets

#### FID (First Input Delay)
- **Target**: < 100ms
- **What it measures**: Time from first user interaction to browser response
- **How to improve**:
  - Minimize JavaScript execution time
  - Break up long tasks
  - Use code splitting
  - Remove unused JavaScript

#### CLS (Cumulative Layout Shift)
- **Target**: < 0.1
- **What it measures**: Visual stability (unexpected layout shifts)
- **How to improve**:
  - Set size attributes on images/videos
  - Reserve space for dynamic content
  - Avoid inserting content above existing content
  - Use CSS transform instead of properties that trigger layout

---

## 4. Real User Monitoring (RUM)

### Enable Vercel Speed Insights:

1. Go to Vercel Dashboard
2. Select your project
3. Go to "Analytics" tab
4. Enable "Speed Insights"
5. Add to your app:

```bash
npm install @vercel/speed-insights
```

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Enable Vercel Web Analytics:

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 5. Performance Testing Tools

### WebPageTest
```
URL: https://www.webpagetest.org/
Usage:
1. Enter your production URL
2. Select test location (choose nearest to your users)
3. Select browser (Chrome recommended)
4. Run test
5. Analyze waterfall chart and metrics
```

### GTmetrix
```
URL: https://gtmetrix.com/
Usage:
1. Enter your production URL
2. Click "Analyze"
3. Review Performance Score
4. Check PageSpeed and YSlow scores
5. Review recommendations
```

### Pingdom
```
URL: https://tools.pingdom.com/
Usage:
1. Enter your production URL
2. Select test location
3. Start test
4. Analyze load time and requests
```

---

## 6. Performance Benchmarks

### Critical Pages to Test:

#### Homepage (/)
- **Target Load Time**: < 2s
- **Target FCP**: < 1.5s
- **Target LCP**: < 2.5s

#### Products Page (/products)
- **Target Load Time**: < 3s
- **API Response Time**: < 500ms
- **Image Load Time**: < 2s

#### Product Detail Page (/products/[slug])
- **Target Load Time**: < 2.5s
- **Time to Interactive**: < 4s

#### Checkout (/checkout)
- **Target Load Time**: < 2s (critical for conversion)
- **Form Response Time**: < 200ms

#### Admin Dashboard (/admin/dashboard)
- **Target Load Time**: < 3s
- **Data Fetch Time**: < 1s

---

## 7. API Performance Testing

### Test API Endpoints:

```bash
# Install Apache Bench (comes with Apache)
# Or use curl with time

# Test health endpoint
curl -w "@curl-format.txt" -o /dev/null -s https://your-app.vercel.app/api/health

# Create curl-format.txt:
cat > curl-format.txt << 'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
   time_pretransfer:  %{time_pretransfer}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF
```

### Load Testing:

```bash
# Install autocannon
npm install -g autocannon

# Test API endpoint
autocannon -c 10 -d 30 https://your-app.vercel.app/api/products

# Explanation:
# -c 10: 10 concurrent connections
# -d 30: Duration 30 seconds
```

---

## 8. Database Performance

### Check Query Performance:

```typescript
// Add logging to Prisma queries
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});
```

### Slow Query Targets:
- Simple queries: < 100ms
- Complex joins: < 500ms
- Aggregations: < 1000ms

### Optimization Tips:
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_user_id ON orders(userId);
CREATE INDEX idx_products_farm_id ON products(farmId);

-- Check query execution plan
EXPLAIN ANALYZE SELECT * FROM products WHERE category = 'vegetables';
```

---

## 9. Image Optimization

### Check Image Performance:

```bash
# List all images and their sizes
find ./public -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.webp" \) -exec ls -lh {} \;

# Check if images are optimized
# Target: < 100KB per image for thumbnails
# Target: < 500KB per image for full-size
```

### Next.js Image Optimization Checklist:
- [ ] Using Next.js `<Image>` component
- [ ] Specified width and height
- [ ] Using `priority` for above-the-fold images
- [ ] Using `loading="lazy"` for below-the-fold images
- [ ] Using modern formats (WebP/AVIF)
- [ ] Responsive images with `sizes` prop

---

## 10. Bundle Size Analysis

### Analyze Bundle Size:

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.mjs:
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // your config
});

# Run analysis
ANALYZE=true npm run build
```

### Bundle Size Targets:
- **First Load JS**: < 250KB
- **Total Bundle**: < 1MB
- **Each Route**: < 100KB additional

### Optimization Techniques:
- [ ] Code splitting by route
- [ ] Dynamic imports for heavy components
- [ ] Tree shaking unused code
- [ ] Remove unused dependencies
- [ ] Use lighter alternatives (e.g., date-fns instead of moment)

---

## 11. Caching Strategy

### Review Cache Headers:

```javascript
// Check cache headers for API routes
// In your API routes:
export async function GET(request) {
  const data = await fetchData();

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
    },
  });
}
```

### Caching Checklist:
- [ ] Static pages cached with ISR
- [ ] API routes have appropriate cache headers
- [ ] CDN caching enabled for static assets
- [ ] Browser caching configured
- [ ] Database query results cached where appropriate

---

## 12. Performance Monitoring Dashboard

### Create a Performance Dashboard:

Track these metrics daily:

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Homepage Load Time | < 2s | ___ | ⏸️ |
| Lighthouse Performance | > 90 | ___ | ⏸️ |
| API Response Time | < 500ms | ___ | ⏸️ |
| LCP | < 2.5s | ___ | ⏸️ |
| FID | < 100ms | ___ | ⏸️ |
| CLS | < 0.1 | ___ | ⏸️ |
| Bundle Size | < 250KB | ___ | ⏸️ |
| Database Query Time | < 100ms | ___ | ⏸️ |

---

## 13. Performance Testing Schedule

### Daily:
- Check Vercel Analytics dashboard
- Review Sentry performance issues
- Monitor error rates

### Weekly:
- Run Lighthouse audit on key pages
- Review Core Web Vitals
- Check bundle size changes
- Review API response times

### Monthly:
- Full performance audit with WebPageTest
- Review and optimize slow queries
- Update performance benchmarks
- Analyze user flow performance

---

## 14. Performance Optimization Checklist

### Frontend Optimizations:
- [ ] Images optimized and using Next.js Image
- [ ] Code splitting implemented
- [ ] Lazy loading for below-fold content
- [ ] Fonts optimized (using next/font)
- [ ] CSS minimized and critical CSS inlined
- [ ] JavaScript minified and compressed
- [ ] Remove unused CSS/JS
- [ ] Use production builds

### Backend Optimizations:
- [ ] Database queries optimized with indexes
- [ ] API responses cached appropriately
- [ ] Database connection pooling configured
- [ ] Compression enabled (gzip/brotli)
- [ ] CDN used for static assets
- [ ] Edge functions for geo-routing

### Network Optimizations:
- [ ] HTTP/2 enabled
- [ ] Resource hints (preload, prefetch)
- [ ] Minimize redirects
- [ ] Reduce DNS lookups
- [ ] Enable keep-alive

---

## 15. Automated Performance Monitoring

### GitHub Actions for Lighthouse CI:

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://your-app.vercel.app
            https://your-app.vercel.app/products
            https://your-app.vercel.app/farms
          uploadArtifacts: true
          temporaryPublicStorage: true
```

---

## 16. Performance Budget

### Set Performance Budgets:

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": [
        "https://your-app.vercel.app",
        "https://your-app.vercel.app/products"
      ]
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "first-contentful-paint": ["error", {"maxNumericValue": 2000}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}],
        "total-blocking-time": ["error", {"maxNumericValue": 300}]
      }
    }
  }
}
```

---

## 17. Quick Commands Reference

```bash
# Run production test suite
node scripts/test-production.js https://your-app.vercel.app

# Check Sentry configuration
node scripts/check-sentry.js

# Run Lighthouse
lighthouse https://your-app.vercel.app --view

# Test API performance
curl -w "@curl-format.txt" -o /dev/null -s https://your-app.vercel.app/api/health

# Analyze bundle
ANALYZE=true npm run build

# Check for security issues
npm audit

# Update dependencies
npm outdated
npm update
```

---

## 18. Resources

### Tools:
- **Lighthouse**: https://developers.google.com/web/tools/lighthouse
- **WebPageTest**: https://www.webpagetest.org/
- **GTmetrix**: https://gtmetrix.com/
- **Vercel Analytics**: https://vercel.com/analytics
- **Chrome DevTools**: https://developer.chrome.com/docs/devtools/

### Documentation:
- **Core Web Vitals**: https://web.dev/vitals/
- **Next.js Performance**: https://nextjs.org/docs/advanced-features/measuring-performance
- **Image Optimization**: https://nextjs.org/docs/basic-features/image-optimization
- **Bundle Analysis**: https://nextjs.org/docs/advanced-features/measuring-performance#bundle-analysis

---

## 19. Common Performance Issues & Fixes

### Issue: Slow Initial Page Load
**Causes:**
- Large JavaScript bundles
- Unoptimized images
- Blocking scripts
- Slow server response

**Solutions:**
```javascript
// 1. Code splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
});

// 2. Optimize images
<Image
  src="/product.jpg"
  width={500}
  height={500}
  quality={85}
  priority={isAboveFold}
  alt="Product"
/>

// 3. Defer non-critical scripts
<Script src="/analytics.js" strategy="lazyOnload" />
```

### Issue: High CLS (Layout Shift)
**Causes:**
- Images without dimensions
- Dynamic content injection
- Web fonts loading

**Solutions:**
```javascript
// 1. Always specify image dimensions
<Image src="/img.jpg" width={400} height={300} alt="Product" />

// 2. Reserve space for dynamic content
<div style={{ minHeight: '200px' }}>
  {loading ? <Skeleton /> : <Content />}
</div>

// 3. Optimize font loading
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], display: 'swap' });
```

### Issue: Slow API Responses
**Causes:**
- Missing database indexes
- N+1 queries
- No caching

**Solutions:**
```typescript
// 1. Add database indexes
// In schema.prisma
@@index([userId, createdAt])

// 2. Use include to avoid N+1
const products = await prisma.product.findMany({
  include: { farm: true, reviews: true }
});

// 3. Implement caching
const cachedData = await redis.get(key);
if (cachedData) return cachedData;
```

---

## 20. Performance Monitoring Workflow

### Daily Routine (5 minutes):
1. Check Vercel deployment status
2. Review Sentry performance issues
3. Check Core Web Vitals in Analytics

### Weekly Review (30 minutes):
1. Run Lighthouse on key pages
2. Review API performance metrics
3. Check bundle size changes
4. Review user session recordings (if available)

### Monthly Audit (2 hours):
1. Full performance audit with multiple tools
2. Review and optimize database queries
3. Update performance benchmarks
4. Implement optimization recommendations
5. Update this document with findings

---

**Last Updated**: [Current Date]
**Next Review**: [Date + 1 month]
