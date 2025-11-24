# 🔧 Fix Guide: Demos 404 Issue

## Problem Summary

The `/demos` routes return 404 errors despite files existing in `src/app/demos/`.

## Root Causes Identified

### 1. **Turbopack Route Detection Issue**

Next.js 16 Turbopack doesn't always detect new route folders added while the dev server is running.

### 2. **Prisma Engine Missing**

The `libquery_engine-windows.dll.node` file is being looked for but doesn't exist. The actual file is `query_engine-windows.dll.node` (different naming convention).

---

## 🚀 Quick Fix (Recommended)

**Stop the server (Ctrl+C) and run these commands:**

```powershell
# 1. Clear all caches
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache

# 2. Regenerate Prisma client
npx prisma generate

# 3. Use webpack mode instead of Turbopack (more stable for development)
npm run dev:webpack
```

Then visit: `http://localhost:3001/demos`

---

## 🔍 Alternative Solutions

### Option A: Fix Prisma + Use Turbopack

```powershell
# Stop server (Ctrl+C)

# Clear caches
Remove-Item -Recurse -Force .next

# Set Prisma binary target explicitly
$env:PRISMA_QUERY_ENGINE_BINARY = ".\node_modules\@prisma\engines\query_engine-windows.dll.node"

# Regenerate
npx prisma generate

# Start with Turbopack
npm run dev
```

### Option B: Use Webpack Mode (Most Reliable)

```powershell
# Stop server (Ctrl+C)

# Clear caches
Remove-Item -Recurse -Force .next

# Start with webpack (no Turbopack)
npm run dev:webpack
```

This uses stable webpack instead of experimental Turbopack.

### Option C: Force Route Refresh

If server is already running and you don't want to restart:

1. Create a temporary file in `src/app/demos/`:

   ```powershell
   New-Item -Path "src/app/demos/temp.txt" -ItemType File
   ```

2. Delete it:

   ```powershell
   Remove-Item "src/app/demos/temp.txt"
   ```

3. This triggers Turbopack's file watcher to rescan the directory.

---

## 🧪 Verification Steps

After applying the fix:

### 1. Check Server Output

You should see successful compilation, not 404s:

```
✓ Compiled /demos in 1.2s
GET /demos 200 in 1234ms
```

### 2. Test All Routes

Visit these URLs and verify they load:

- `http://localhost:3001/demos` - Main hub
- `http://localhost:3001/demos/analytics` - Analytics demo
- `http://localhost:3001/demos/inventory` - Inventory demo
- `http://localhost:3001/demos/chat` - Chat demo

### 3. Check for Errors

Look for:

- ✅ No 404 errors in terminal
- ✅ No Prisma engine errors
- ✅ Pages render correctly in browser
- ✅ No console errors in browser DevTools

---

## 🐛 If Still Not Working

### Check File Structure

```powershell
# Verify all files exist
Get-ChildItem -Path "src/app/demos" -Recurse -Filter "*.tsx"
```

Should show:

```
src/app/demos/page.tsx
src/app/demos/analytics/page.tsx
src/app/demos/inventory/page.tsx
src/app/demos/chat/page.tsx
```

### Check for TypeScript Errors

```powershell
npm run type-check
```

Should output: `npm info ok` with no errors.

### Check Prisma Client

```powershell
# Verify Prisma client is generated
Test-Path "node_modules/@prisma/client"
```

Should return: `True`

### Rebuild from Scratch

```powershell
# Nuclear option - full clean rebuild
Remove-Item -Recurse -Force .next, node_modules
npm install
npx prisma generate
npm run dev:webpack
```

---

## 📋 Known Issues

### Issue: "Unable to require libquery_engine-windows.dll.node"

**Cause**: Prisma binary naming mismatch  
**Fix**: Run `npx prisma generate` and ensure `query_engine-windows.dll.node` exists in `node_modules/@prisma/engines/`

### Issue: Routes return 404 even after restart

**Cause**: Turbopack cache corruption  
**Fix**: Delete `.next` folder and restart with webpack mode (`npm run dev:webpack`)

### Issue: "/\_not-found/page" compiling

**Cause**: Next.js can't find the route, falling back to 404 page  
**Fix**: Ensure `page.tsx` exists in each route folder, restart dev server

---

## ✅ Success Criteria

You'll know it's working when:

1. ✅ Server starts without Prisma errors
2. ✅ GET requests return 200 (not 404)
3. ✅ `/demos` page loads with demo cards
4. ✅ Individual demo pages load correctly
5. ✅ No console errors in browser
6. ✅ Dynamic components show loading skeletons then content

---

## 🎯 Recommended Long-Term Solution

**Use Webpack for Development** (at least until Turbopack is stable):

Update your workflow:

```powershell
# Instead of:
npm run dev

# Use:
npm run dev:webpack
```

This avoids Turbopack's experimental issues while maintaining all other optimizations.

---

## 📞 If All Else Fails

1. Check that Node.js version is correct:

   ```powershell
   node --version  # Should be v22.21.0 or similar
   ```

2. Check Next.js version:

   ```powershell
   npm list next  # Should be 16.0.3
   ```

3. Try production build to rule out dev-only issues:

   ```powershell
   npm run build
   npm run start
   # Visit http://localhost:3001/demos
   ```

4. Check for port conflicts:
   ```powershell
   netstat -ano | findstr :3001
   ```

---

## 🎓 Understanding the Issue

### Why Turbopack Has Problems

Turbopack in Next.js 16 is still experimental. Known issues:

- File watcher doesn't always detect new route folders
- Cache invalidation can be inconsistent
- Windows file path handling has edge cases

### Why Webpack Works Better

Webpack has been stable for years and handles:

- Route discovery reliably
- Proper cache invalidation
- Windows paths correctly

### The Trade-off

- **Turbopack**: Faster HMR (Hot Module Replacement) but experimental
- **Webpack**: Slightly slower but rock-solid reliability

For this project, **reliability > speed** until Turbopack matures.

---

## 🚀 Quick Command Reference

```powershell
# Fix Prisma
npx prisma generate

# Clear cache
Remove-Item -Recurse -Force .next

# Start with webpack
npm run dev:webpack

# Type check
npm run type-check

# Full rebuild
Remove-Item -Recurse -Force .next, node_modules
npm install
npx prisma generate
```

---

**Status**: Guide Complete  
**Last Updated**: November 2024  
**Tested On**: Windows 11, Node v22.21.0, Next.js 16.0.3
