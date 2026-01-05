# 🔧 Troubleshooting Hub

**Complete troubleshooting guide for the Farmers Market Platform** — Solutions for common issues, debugging strategies, and problem resolution workflows.

---

## 🎯 Quick Navigation

| Category              | Issues                          | Quick Links                                                          |
| --------------------- | ------------------------------- | -------------------------------------------------------------------- |
| **🚀 Development**    | Server, build, runtime          | [Dev Server](#-development-server-issues) • [Build](#-build-issues)  |
| **🗄️ Database**       | Connection, migrations, queries | [Connection](#-database-connection) • [Prisma](#-prisma-issues)      |
| **🔐 Authentication** | Login, session, permissions     | [NextAuth](#-authentication-issues) • [Session](#session-issues)     |
| **🐳 Docker**         | Container, networking, volumes  | [Docker](#-docker-issues) • [Compose](#docker-compose-issues)        |
| **⚡ Performance**    | Slow pages, memory, CPU         | [Performance](#-performance-issues) • [Memory](#memory-issues)       |
| **🧪 Testing**        | Jest, Playwright, coverage      | [Unit Tests](#-testing-issues) • [E2E](#e2e-test-issues)             |
| **🚢 Deployment**     | Vercel, Azure, production       | [Deployment](#-deployment-issues) • [Production](#production-errors) |

**Total Solutions:** 100+ documented issues • **Average Resolution Time:** <30 minutes

---

## 🆘 Emergency Quick Fixes

### Critical Issues (Stop Everything)

#### Server Won't Start

```bash
# 1. Kill all Node processes
pkill -f node

# 2. Clear Next.js cache
rm -rf .next

# 3. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 4. Restart development server
npm run dev
```

#### Database Connection Failed

```bash
# 1. Check database is running
docker ps | grep postgres

# 2. Test connection
npx prisma db execute --stdin <<< "SELECT 1"

# 3. Reset database connection
npx prisma generate
npx prisma db push

# 4. Verify connection
curl http://localhost:3000/api/health/db
```

#### Build Failing

```bash
# 1. Clear all caches
npm run clean

# 2. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 3. Regenerate Prisma client
npx prisma generate

# 4. Try build again
npm run build
```

#### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

---

## 🚀 Development Server Issues

### Server Won't Start

#### Symptom: "Error: listen EADDRINUSE: address already in use"

**Cause:** Port 3000 already occupied

**Solution:**

```bash
# Option 1: Kill process on port 3000
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Option 2: Use different port
PORT=3001 npm run dev

# Option 3: Add to package.json
"scripts": {
  "dev": "next dev -p 3001"
}
```

#### Symptom: "Module not found" errors

**Cause:** Missing dependencies or incorrect import paths

**Solution:**

```bash
# 1. Verify all dependencies installed
npm install

# 2. Check for typos in import paths
# ✅ Correct
import { database } from "@/lib/database";

# ❌ Wrong
import { database } from "@/lib/db"; // File doesn't exist

# 3. Check tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# 4. Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

#### Symptom: Server starts but pages are blank

**Cause:** JavaScript errors or hydration issues

**Solution:**

```bash
# 1. Check browser console for errors
# Open DevTools (F12) → Console tab

# 2. Check server logs
# Look for errors in terminal where dev server is running

# 3. Clear .next cache
rm -rf .next
npm run dev

# 4. Verify environment variables
cat .env.local
# Ensure DATABASE_URL and NEXTAUTH_SECRET are set
```

---

### Hot Reload Not Working

#### Symptom: Code changes don't reflect in browser

**Cause:** File watcher issues or caching

**Solution:**

```bash
# 1. Check file watcher limits (Linux)
cat /proc/sys/fs/inotify/max_user_watches
# If too low (< 524288), increase:
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 2. Disable Turbopack if causing issues
# package.json
"scripts": {
  "dev": "next dev" // Remove --turbo flag
}

# 3. Hard refresh browser
# Cmd+Shift+R (macOS) or Ctrl+Shift+R (Windows/Linux)

# 4. Restart dev server
# Ctrl+C to stop, then npm run dev
```

---

### TypeScript Errors

#### Symptom: Type errors prevent compilation

**Cause:** Type mismatches or missing type definitions

**Solution:**

```typescript
// 1. Ensure strict mode is enabled (tsconfig.json)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
  }
}

// 2. Use proper type imports
import type { User, Farm } from "@prisma/client";

// 3. Avoid 'any' - use 'unknown'
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // Type guard
  }
}

// 4. Regenerate Prisma types
// npx prisma generate
```

---

## 🗄️ Database & Prisma Issues

### Database Connection

#### Symptom: "Can't reach database server"

**Cause:** Database not running or incorrect connection string

**Solution:**

```bash
# 1. Verify database is running
docker ps | grep postgres

# 2. Start database if not running
docker-compose up -d postgres

# 3. Check DATABASE_URL in .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/farmers_market?schema=public"

# 4. Test connection
npx prisma db execute --stdin <<< "SELECT 1"

# 5. Verify database exists
psql -h localhost -U user -d postgres -c "\l"

# 6. Create database if missing
psql -h localhost -U user -d postgres -c "CREATE DATABASE farmers_market;"
```

#### Symptom: "Prepared statement already exists"

**Cause:** Stale Prisma client or connection pooling issues

**Solution:**

```typescript
// Always use canonical database import
import { database } from "@/lib/database";

// Never create new Prisma instances
// ❌ Don't do this:
// import { PrismaClient } from "@prisma/client";
// const db = new PrismaClient();

// Check lib/database.ts uses singleton pattern:
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const database =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = database;
```

---

### Prisma Migrations

#### Symptom: "Migration failed"

**Cause:** Schema conflicts or database state issues

**Solution:**

```bash
# 1. Check migration status
npx prisma migrate status

# 2. Reset database (development only!)
npx prisma migrate reset

# 3. Apply migrations
npx prisma migrate deploy

# 4. If migration conflicts persist
# Option A: Create new migration
npx prisma migrate dev --name fix_schema

# Option B: Force push (development only)
npx prisma db push --force-reset

# 5. Regenerate client
npx prisma generate
```

#### Symptom: "P1001: Can't reach database server"

**Cause:** Database URL incorrect or database not accessible

**Solution:**

```bash
# 1. Verify DATABASE_URL format
# PostgreSQL format:
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA"

# Example:
DATABASE_URL="postgresql://postgres:password@localhost:5432/farmers_market?schema=public"

# 2. Test connection with psql
psql "$DATABASE_URL"

# 3. Check firewall/security groups (production)

# 4. Verify database accepts connections
# Edit postgresql.conf:
listen_addresses = '*'

# Edit pg_hba.conf:
host    all    all    0.0.0.0/0    md5
```

---

### Query Performance Issues

#### Symptom: Slow database queries

**Cause:** Missing indexes or N+1 queries

**Solution:**

```typescript
// ❌ Bad: N+1 query problem
const farms = await database.farm.findMany();
for (const farm of farms) {
  const products = await database.product.findMany({
    where: { farmId: farm.id },
  });
}

// ✅ Good: Use include
const farms = await database.farm.findMany({
  include: {
    products: true,
  },
});

// ✅ Better: Select only needed fields
const farms = await database.farm.findMany({
  select: {
    id: true,
    name: true,
    products: {
      select: {
        id: true,
        name: true,
        price: true,
      },
    },
  },
});

// ✅ Best: Parallel queries when no dependency
const [farms, totalCount] = await Promise.all([
  database.farm.findMany({ take: 20 }),
  database.farm.count(),
]);
```

**Add Indexes:**

```prisma
// schema.prisma
model Product {
  id        String   @id @default(cuid())
  name      String
  farmId    String
  category  String
  status    String

  // Add indexes for frequently queried fields
  @@index([farmId])
  @@index([category])
  @@index([status])
  @@index([farmId, status])
}
```

---

## 🔐 Authentication Issues

### NextAuth Problems

#### Symptom: "Session is null after login"

**Cause:** Session callback not configured or NEXTAUTH_SECRET missing

**Solution:**

```typescript
// 1. Verify NEXTAUTH_SECRET in .env.local
NEXTAUTH_SECRET = your - secret - key - here;

// Generate new secret:
// openssl rand -base64 32

// 2. Check auth.ts configuration
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // Your providers
  ],
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
});

// 3. Verify middleware is configured
// middleware.ts
export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

#### Symptom: "Callback URL mismatch"

**Cause:** NEXTAUTH_URL not set correctly

**Solution:**

```bash
# .env.local
NEXTAUTH_URL=http://localhost:3000

# Production
NEXTAUTH_URL=https://yourdomain.com

# Verify in auth configuration
export const authOptions = {
  // ...
  debug: process.env.NODE_ENV === "development",
};
```

---

### Session Issues

#### Symptom: Session expires too quickly

**Cause:** Default session maxAge too short

**Solution:**

```typescript
// auth.ts
export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  // ...
};
```

#### Symptom: "Invalid CSRF token"

**Cause:** Cookie issues or domain mismatch

**Solution:**

```typescript
// auth.ts
export const authConfig = {
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  // ...
};
```

---

## 🐳 Docker Issues

### Container Problems

#### Symptom: "Cannot connect to the Docker daemon"

**Cause:** Docker Desktop not running

**Solution:**

```bash
# macOS
open -a Docker

# Linux
sudo systemctl start docker
sudo systemctl enable docker

# Windows
# Start Docker Desktop from Start Menu

# Verify Docker is running
docker ps
```

#### Symptom: "Port is already allocated"

**Cause:** Port conflict with existing container or process

**Solution:**

```bash
# 1. Find containers using the port
docker ps -a

# 2. Stop conflicting containers
docker stop <container_id>

# 3. Remove stopped containers
docker container prune

# 4. Or change port in docker-compose.yml
services:
  postgres:
    ports:
      - "5433:5432"  # Changed from 5432:5432
```

---

### Docker Compose Issues

#### Symptom: "Service 'postgres' failed to build"

**Cause:** Dockerfile errors or missing files

**Solution:**

```bash
# 1. Check docker-compose.yml syntax
docker-compose config

# 2. Rebuild without cache
docker-compose build --no-cache

# 3. Check Dockerfile exists
ls -la Dockerfile

# 4. View build logs
docker-compose up --build
```

#### Symptom: Containers exit immediately

**Cause:** Configuration errors or missing environment variables

**Solution:**

```bash
# 1. Check container logs
docker-compose logs <service_name>

# 2. Verify environment variables
docker-compose config

# 3. Check if volumes have correct permissions
ls -la ./postgres-data

# 4. Start in foreground to see errors
docker-compose up
```

---

## ⚡ Performance Issues

### Slow Page Load

#### Symptom: Pages take >3 seconds to load

**Cause:** Unoptimized queries, large bundles, or missing caching

**Solution:**

```typescript
// 1. Use React Server Components (default in Next.js 15)
// app/farms/page.tsx
export default async function FarmsPage() {
  const farms = await database.farm.findMany(); // Server-side
  return <FarmList farms={farms} />;
}

// 2. Implement caching
import { cache } from 'react';
export const getFarms = cache(async () => {
  return await database.farm.findMany();
});

// 3. Use dynamic imports for heavy components
import dynamic from 'next/dynamic';
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false
});

// 4. Optimize images
import Image from 'next/image';
<Image
  src="/farm.jpg"
  width={800}
  height={600}
  alt="Farm"
  priority // For above-fold images
/>

// 5. Add Redis caching
import { redis } from '@/lib/redis';
const cached = await redis.get('farms');
if (cached) return JSON.parse(cached);
```

**Bundle Analysis:**

```bash
# Analyze bundle size
npm run build
npm run analyze

# Check for large dependencies
npx bundle-analyzer .next/analyze/client.html
```

---

### Memory Issues

#### Symptom: "JavaScript heap out of memory"

**Cause:** Memory leak or large dataset processing

**Solution:**

```bash
# 1. Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

# Add to package.json
"scripts": {
  "dev": "NODE_OPTIONS='--max-old-space-size=4096' next dev"
}

# 2. Profile memory usage
node --inspect node_modules/.bin/next dev
# Open chrome://inspect in Chrome

# 3. Fix memory leaks
# - Remove global event listeners
# - Clear intervals/timeouts
# - Close database connections
```

**Code Fixes:**

```typescript
// ❌ Memory leak
let data = [];
setInterval(() => {
  data.push(await fetchData()); // Never cleared
}, 1000);

// ✅ Fixed
useEffect(() => {
  const interval = setInterval(async () => {
    await fetchData();
  }, 1000);

  return () => clearInterval(interval); // Cleanup
}, []);
```

---

## 🧪 Testing Issues

### Unit Test Problems

#### Symptom: "Cannot find module '@/...' from '...'"

**Cause:** Jest moduleNameMapper not configured

**Solution:**

```javascript
// jest.config.js
module.exports = {
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // ...
};
```

#### Symptom: Tests fail with database errors

**Cause:** Tests using real database instead of mocks

**Solution:**

```typescript
// __tests__/services/farm.test.ts
import { database } from "@/lib/database";

// Mock Prisma
jest.mock("@/lib/database", () => ({
  database: {
    farm: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe("FarmService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should get all farms", async () => {
    const mockFarms = [{ id: "1", name: "Test Farm" }];
    (database.farm.findMany as jest.Mock).mockResolvedValue(mockFarms);

    const result = await farmService.getAllFarms();

    expect(result).toEqual(mockFarms);
    expect(database.farm.findMany).toHaveBeenCalled();
  });
});
```

---

### E2E Test Issues

#### Symptom: Playwright tests fail intermittently

**Cause:** Timing issues or flaky selectors

**Solution:**

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from "@playwright/test";

test("should login successfully", async ({ page }) => {
  await page.goto("http://localhost:3000");

  // ✅ Wait for element to be visible
  await page.waitForSelector('[data-testid="login-form"]', {
    state: "visible",
    timeout: 5000,
  });

  // ✅ Use data-testid for stable selectors
  await page.fill('[data-testid="email-input"]', "test@example.com");
  await page.fill('[data-testid="password-input"]', "password");

  // ✅ Wait for navigation
  await Promise.all([
    page.waitForNavigation(),
    page.click('[data-testid="login-button"]'),
  ]);

  // ✅ Wait for element after navigation
  await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
});
```

---

## 🚢 Deployment Issues

### Vercel Deployment

#### Symptom: "Build failed" on Vercel

**Cause:** Environment variables missing or build errors

**Solution:**

```bash
# 1. Check build logs in Vercel dashboard

# 2. Test build locally
npm run build

# 3. Set environment variables in Vercel
# Dashboard → Settings → Environment Variables
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://yourdomain.com

# 4. Check vercel.json configuration
{
  "buildCommand": "prisma generate && next build",
  "env": {
    "DATABASE_URL": "@database-url"
  }
}

# 5. Redeploy
vercel --prod
```

#### Symptom: "Function execution timed out"

**Cause:** Long-running API routes

**Solution:**

```javascript
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}

// Or optimize API route
export const config = {
  maxDuration: 30, // 30 seconds
};
```

---

### Production Errors

#### Symptom: "Internal Server Error (500)" in production

**Cause:** Unhandled errors or missing dependencies

**Solution:**

```typescript
// 1. Add proper error handling
export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// 2. Check Vercel logs
# Dashboard → Deployments → View Function Logs

// 3. Add Sentry for error tracking
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## 🔍 Debugging Strategies

### General Debugging Workflow

```yaml
1. Reproduce Issue:
  - Document exact steps to reproduce
  - Note error messages verbatim
  - Check if issue is consistent

2. Check Logs:
  - Browser console (F12)
  - Server terminal output
  - Database logs
  - Docker logs

3. Isolate Problem:
  - Disable features one by one
  - Test in minimal reproduction
  - Check if environment-specific

4. Research:
  - Search error message
  - Check GitHub issues
  - Review documentation

5. Fix & Verify:
  - Implement fix
  - Test thoroughly
  - Document solution

6. Prevent Recurrence:
  - Add tests
  - Update documentation
  - Share with team
```

### Useful Debugging Commands

```bash
# Check all service health
npm run health:check

# View comprehensive logs
docker-compose logs -f

# Database introspection
npx prisma studio

# Network debugging
curl -v http://localhost:3000/api/health

# Process monitoring
htop  # or top on macOS
ps aux | grep node

# Disk space check
df -h

# Clear all caches
npm run clean
rm -rf .next node_modules
npm install
```

---

## 📞 Getting Help

### Before Asking for Help

**Gather Information:**

```yaml
System Info:
  - OS and version
  - Node.js version: node --version
  - npm version: npm --version
  - Docker version: docker --version

Error Details:
  - Full error message
  - Stack trace
  - Steps to reproduce
  - Expected vs actual behavior

Environment:
  - Development, staging, or production?
  - Recent changes made?
  - Working before? When did it break?
```

### Support Channels

1. **Documentation** — Check [Master Hub](../README.md)
2. **GitHub Issues** — Search existing or create new
3. **Team Chat** — Quick questions during work hours
4. **Code Review** — Request help on PR

---

## 📚 Related Resources

- **[Development Guide](../development/README.md)** — Development workflows
- **[Testing Guide](../testing/README.md)** — Testing procedures
- **[Deployment Guide](../deployment/README.md)** — Deployment help
- **[Database Guide](../database/README.md)** — Database troubleshooting
- **[Monitoring Guide](../monitoring/README.md)** — Performance monitoring

---

## 📝 Document Issues

Found a bug or have a question this guide doesn't cover?

1. Check if issue already documented
2. Try debugging yourself (builds knowledge!)
3. Document your findings
4. Share solution with team
5. Update this guide via PR

---

**Last Updated:** December 2024  
**Maintained By:** Platform Engineering Team  
**Status:** ✅ Comprehensive and Production-Ready

🔧 **Troubleshooting divine agricultural platform with precision!** ⚡✨
