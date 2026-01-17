# Dependency Update Fixes Applied

**Date**: January 17, 2026
**Status**: Partial Fix - Additional Work Required
**Engineer**: Claude Sonnet 4.5

---

## ✅ Fixes Successfully Applied

### 1. ES Module Conversion - `server.js`

**Issue**: Module system mismatch causing dev server to fail
- Error: `ReferenceError: require is not defined in ES module scope`
- Root Cause: `package.json` has `"type": "module"` but `server.js` used CommonJS syntax

**Fix Applied**:
```javascript
// BEFORE (CommonJS)
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

// AFTER (ES Modules)
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { parse } from "url";
```

**Result**: ✅ Server can now start with ES module syntax

---

### 2. Node.js Engine Requirement Update

**Issue**: Package.json restricted to Node.js <21.0.0 but system has Node 22.21.0
- Warning: `EBADENGINE Unsupported engine`

**Fix Applied**:
```json
// BEFORE
"engines": {
  "node": ">=20.18.0 <21.0.0",
  "npm": ">=10.0.0"
}

// AFTER
"engines": {
  "node": ">=20.18.0 <23.0.0",
  "npm": ">=10.0.0"
}
```

**Result**: ✅ Node 22.x now supported

---

## 🚧 Remaining Issues (Blocking Deployment)

### Issue 1: Corrupted Native Binaries

**Affected Packages**:
1. `@esbuild/win32-x64/esbuild.exe` - EFTYPE error (corrupt binary)
2. `@next/swc-win32-x64-msvc/next-swc.win32-x64-msvc.node` - Invalid Win32 binary

**Error Messages**:
```
⚠ Attempted to load @next/swc-win32-x64-msvc, but an error occurred: 
\\?\M:\Repo\Farmers Market Platform web and app\node_modules\@next\swc-win32-x64-msvc\next-swc.win32-x64-msvc.node 
is not a valid Win32 application.

Error: spawnSync M:\Repo\Farmers Market Platform web and app\node_modules\@esbuild\win32-x64\esbuild.exe EFTYPE
```

**Impact**:
- `npm run build` - FAILS (SWC binary issue)
- `npm run dev` - DEGRADED (falls back to WASM, Turbo mode disabled)
- `npm install` - FAILS (esbuild postinstall script fails)
- `npm rebuild` - FAILS (esbuild binary validation fails)

**Root Cause**: Windows binary corruption, possibly due to:
- Interrupted npm install
- Antivirus interference
- Git LFS issues
- Network download corruption
- File system issues on M:\ drive

---

## 🎯 Required Actions (Critical)

### Solution 1: Complete node_modules Reinstall (RECOMMENDED)

```bash
cd "M:\Repo\Farmers Market Platform web and app"

# Complete cleanup
rm -rf node_modules
rm -rf package-lock.json
rm -rf .next
rm -rf .jest-cache

# Fresh install
npm cache clean --force
npm install

# If above fails, try legacy mode
npm install --legacy-peer-deps

# Verify installation
npm run build
npm run dev
```

**Expected Time**: 10-15 minutes

---

### Solution 2: Use WSL/Linux Environment (BEST PRACTICE)

Windows native binaries are prone to corruption. Using WSL provides:
- Better native binary compatibility
- Faster file I/O for node_modules
- Fewer permission/antivirus issues
- Better development experience

```bash
# In WSL terminal
cd /mnt/m/Repo/Farmers\ Market\ Platform\ web\ and\ app/

# Clean install
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

**Expected Time**: 5-10 minutes

---

### Solution 3: Manual Binary Reinstall (TEMPORARY)

If you need a quick fix without full reinstall:

```bash
# Delete corrupt binaries
rm -rf node_modules/@esbuild
rm -rf node_modules/esbuild
rm -rf node_modules/@next/swc-win32-x64-msvc
rm -rf node_modules/@next/swc-wasm-nodejs

# Force reinstall
npm install esbuild@^0.24.2 --force
npm install @next/swc-win32-x64-msvc@16.1.1 --force --save-optional

# Rebuild package links
npm rebuild
```

**Expected Time**: 3-5 minutes
**Risk**: May not fully resolve all issues

---

## 📊 Validation Checklist

After fixing binary issues, run these validations:

- [ ] `npm run type-check` - TypeScript validation
- [ ] `npm run lint` - ESLint validation  
- [ ] `npm run build` - Production build test
- [ ] `npm run dev` - Dev server test (with hot reload)
- [ ] `npm run test:unit` - Unit tests
- [ ] `npm run test:integration` - Integration tests
- [ ] `npm run test:e2e` - End-to-end tests (optional)

**Current Status**:
- ✅ type-check: PASSED
- ✅ lint: PASSED
- ❌ build: BLOCKED (SWC binary issue)
- ⚠️  dev: DEGRADED (using WASM fallback, Turbo disabled)
- ⏸️  tests: PENDING (blocked by npm install issues)

---

## 🔍 Diagnostic Information

### System Environment
```
OS: Windows (M:\ drive)
Node: v22.21.0
npm: 10.9.4
Working Dir: M:\Repo\Farmers Market Platform web and app
```

### npm Configuration Issues
```
npm warn config optional Use `--omit=optional` to exclude optional dependencies
```

**Cause**: `.npmrc` has conflicting optional dependency settings:
```
include = ["optional"]
optional = true
omit = []
```

**Recommendation**: Simplify `.npmrc` to avoid conflicts

---

## 📦 Files Modified

1. `server.js` - Converted to ES modules ✅
2. `package.json` - Updated Node engine requirement ✅
3. `DEPENDENCY_FIXES_APPLIED.md` - This document (new) ✅

---

## 🚀 Next Steps

### Immediate (Before Deployment)
1. ✅ Fix server.js ES module issue (DONE)
2. ✅ Update Node.js engine requirement (DONE)
3. ❌ Reinstall node_modules to fix binaries (PENDING - YOUR ACTION)
4. ⏸️  Verify all builds and tests pass (BLOCKED)
5. ⏸️  Commit fixes to Git (BLOCKED)

### After Binary Fix
6. Run full validation suite
7. Commit all changes:
   ```bash
   git add server.js package.json DEPENDENCY_FIXES_APPLIED.md
   git commit -m "fix: resolve ES module and binary issues after dependency updates"
   git push origin master
   ```

### Optional (Recommended)
8. Run repository restructuring script (non-blocking)
9. Plan major dependency migrations (Prisma 7, Tailwind 4, Zod 4)

---

## 💡 Additional Recommendations

### 1. Development Environment
- Consider using WSL2 for primary development
- Add `.npmrc` to `.gitignore` if it contains machine-specific config
- Use `nvm` to manage Node.js versions

### 2. Binary Issue Prevention
- Add pre-commit hooks to verify binary integrity
- Use `npm ci` in CI/CD instead of `npm install`
- Consider hosting binaries in artifact registry for enterprise

### 3. Monitoring
- Set up binary integrity checks in CI/CD
- Monitor for EFTYPE, ENOENT, ECONNRESET errors
- Track npm install success/failure rates

---

## 📞 Support

If issues persist after following Solution 1 or 2:

1. **Check npm logs**:
   ```bash
   cat "C:\Users\Gogsi\AppData\Local\npm-cache\_logs\*-debug-0.log"
   ```

2. **Try npm doctor**:
   ```bash
   npm doctor
   ```

3. **Alternative package manager**:
   ```bash
   # Try with pnpm or yarn
   pnpm install
   # or
   yarn install
   ```

4. **Escalate** with:
   - Full error logs
   - `npm doctor` output
   - Drive health check results (M:\ drive)
   - Antivirus logs

---

**Document Version**: 1.0
**Last Updated**: January 17, 2026, 11:30 PM
**Status**: AWAITING USER ACTION - node_modules reinstall required