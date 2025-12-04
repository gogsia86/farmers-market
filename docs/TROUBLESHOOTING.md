# 🔧 Troubleshooting Guide

**Farmers Market Platform - Common Issues & Solutions**

---

## 🚀 Dev Server Won't Start

### Issue: ERR_CONNECTION_REFUSED on localhost:3001

**Symptoms:**
- Browser shows "Can't reach this page"
- `ERR_CONNECTION_REFUSED` error
- Server appears to start but doesn't accept connections

**Solutions:**

#### 1. Check if Server is Actually Running

```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# On Linux/Mac
lsof -i :3001
```

If nothing is shown, the server isn't running.

#### 2. Kill Any Stuck Node Processes

```bash
# Windows
tasklist | findstr node
taskkill /F /IM node.exe

# Linux/Mac
pkill -9 node
```

#### 3. Clear Next.js Cache

```bash
# Remove build artifacts and cache
rm -rf .next
rm -rf node_modules/.cache

# Restart the server
npm run dev
```

#### 4. Check Database Connection

```bash
# Verify PostgreSQL is running
netstat -ano | findstr :5432

# Test database connection
npx prisma db pull
```

**If PostgreSQL isn't running:**

Windows:
```bash
# Start PostgreSQL service
net start postgresql-x64-14
```

Linux/Mac:
```bash
# Start PostgreSQL
sudo service postgresql start
# or
brew services start postgresql
```

#### 5. Verify Environment Variables

```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# Windows
echo %DATABASE_URL%
```

Make sure `.env` file exists with:
```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/farmersmarket"
```

#### 6. Try Different Port

```bash
# Try port 3000 instead
npm run dev -- -p 3000

# Or specify explicitly
npx next dev -p 3000
```

#### 7. Check for Port Conflicts

```bash
# Windows - Check what's using port 3001
netstat -ano | findstr :3001

# Find the process ID (PID) and kill it
taskkill /F /PID <PID>
```

#### 8. Run in Verbose Mode

```bash
# Start with debugging enabled
NODE_OPTIONS='--inspect' npm run dev
```

#### 9. Manually Start Next.js

```bash
# Direct Next.js start
npx next dev --turbo -p 3001
```

---

## 🗄️ Database Issues

### Issue: Database Connection Failed

**Symptoms:**
- "Database connection failed"
- "Authentication failed for user"
- "password authentication failed"

**Solutions:**

#### 1. Verify Database Exists

```bash
# Connect to PostgreSQL
psql -U postgres -h localhost

# List databases
\l

# If farmersmarket doesn't exist:
CREATE DATABASE farmersmarket;
\q
```

#### 2. Check Database Credentials

In `.env`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

Default:
```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/farmersmarket"
```

#### 3. Reset Database Schema

```bash
# Push schema to database
npx prisma db push --force-reset

# Regenerate Prisma Client
npx prisma generate
```

#### 4. Test Database Connection

Create `test-db.js`:
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`SELECT 1`;
  console.log('✅ Database connected!', result);
}

main()
  .catch(e => console.error('❌ Database error:', e))
  .finally(() => prisma.$disconnect());
```

Run: `node test-db.js`

---

## 🧪 Test Issues

### Issue: Tests Failing with Database Errors

**Solutions:**

#### 1. Setup Test Database

```bash
# Create test database
createdb farmersmarket_test

# Or in psql:
psql -U postgres -h localhost
CREATE DATABASE farmersmarket_test;
\q
```

#### 2. Run Test Database Setup Script

```bash
# Windows
.\scripts\setup-test-db.bat

# Linux/Mac
bash scripts/setup-test-db.sh
```

#### 3. Check `.env.test` File

Ensure `.env.test` exists with:
```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/farmersmarket_test"
NODE_ENV="test"
```

#### 4. Clear Jest Cache

```bash
npm test -- --clearCache
```

---

## 🔐 Authentication Issues

### Issue: NextAuth Session Errors

**Solutions:**

#### 1. Set NEXTAUTH_SECRET

In `.env`:
```env
NEXTAUTH_SECRET="your-super-secret-key-here-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3001"
```

Generate a secret:
```bash
openssl rand -base64 32
```

#### 2. Clear Session Cookies

- Open browser DevTools (F12)
- Go to Application → Cookies
- Delete all cookies for localhost

#### 3. Restart After Env Changes

Always restart the dev server after changing `.env` files.

---

## 📦 Module/Import Issues

### Issue: Cannot Find Module

**Solutions:**

#### 1. Clear Node Modules

```bash
# Remove and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. Check TypeScript Paths

In `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 3. Restart TypeScript Server

In VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

---

## ⚡ Performance Issues

### Issue: Dev Server Very Slow

**Solutions:**

#### 1. Use Turbopack

```bash
npm run dev -- --turbo
```

#### 2. Increase Memory

```bash
# Already in package.json scripts:
NODE_OPTIONS='--max-old-space-size=16384' npm run dev
```

#### 3. Disable Telemetry

```bash
npx next telemetry disable
```

#### 4. Exclude node_modules from Antivirus

Add `node_modules` folder to Windows Defender exclusions.

---

## 🔥 Emergency Reset

### Complete Fresh Start

```bash
# 1. Stop all Node processes
taskkill /F /IM node.exe

# 2. Clear all caches
rm -rf .next
rm -rf node_modules
rm -rf .turbo
rm -rf dist
rm -rf coverage

# 3. Reinstall dependencies
npm install

# 4. Reset database
npx prisma db push --force-reset
npx prisma generate

# 5. Start fresh
npm run dev
```

---

## 📞 Still Having Issues?

### Collect Debug Information

```bash
# Check versions
node --version
npm --version
npx next --version

# Check environment
echo $NODE_ENV
echo $DATABASE_URL

# Check ports
netstat -ano | findstr :3001
netstat -ano | findstr :5432

# Generate diagnostics
npm run build > build.log 2>&1
npm test 2>&1 | head -50 > test.log
```

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run dev:omen         # Start with HP OMEN optimizations
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:push          # Push schema to database
npm run db:seed          # Seed database with data
npm run db:studio        # Open Prisma Studio

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run with coverage report

# Cleanup
npm run clean            # Remove build artifacts
```

---

## 🎯 Quick Fixes Checklist

- [ ] PostgreSQL is running
- [ ] Database `farmersmarket` exists
- [ ] `.env` file exists with valid `DATABASE_URL`
- [ ] `node_modules` installed
- [ ] No other process on port 3001
- [ ] `.next` cache cleared
- [ ] Prisma Client generated
- [ ] No stuck Node processes

---

**Last Updated**: January 2025  
**Status**: Active Development  
**Version**: 1.0.0