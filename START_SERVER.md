# 🚀 Server Startup Guide

**Quick Start**: Follow these steps to start the development server.

---

## ✅ Pre-Flight Checklist

Before starting the server, verify:

- [x] TypeScript errors resolved (0 errors)
- [x] Dependencies installed (`node_modules/` exists)
- [x] Environment files present (`.env.local`, `.env`)
- [x] Port 3001 is available

---

## 🎯 Method 1: Simple Start (Recommended)

Open a terminal in the project root and run:

```bash
npm run dev
```

**Expected Output:**
```
✔ Console Ninja extension is connected to Next.js
▲ Next.js 16.1.1 (Turbopack)
- Local:         http://localhost:3001
- Network:       http://192.168.8.106:3001

✓ Starting...
🌾 Instrumentation hook registered (tracing disabled)
✓ Ready in 3.9s
```

**Access the app at:** http://localhost:3001

---

## 🎯 Method 2: With Specific Node Options

If you need more memory or specific options:

```bash
npm run dev
```

This runs:
```bash
cross-env NODE_OPTIONS='--max-old-space-size=16384' NODE_ENV=development next dev --turbo -p 3001
```

---

## 🎯 Method 3: Windows PowerShell/CMD

**PowerShell:**
```powershell
npm run dev
```

**Command Prompt:**
```cmd
npm run dev
```

---

## 🎯 Method 4: Different Port

If port 3001 is in use:

```bash
npx next dev --turbo -p 3002
```

Replace `3002` with any available port.

---

## 🔍 Troubleshooting

### Problem: Port Already in Use

**Windows (PowerShell as Admin):**
```powershell
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Then retry:**
```bash
npm run dev
```

---

### Problem: Module Not Found

**Solution:**
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

### Problem: TypeScript Errors on Start

**Check types first:**
```bash
npx tsc --noEmit
```

**If errors appear:**
```bash
# Clean Next.js cache
rm -rf .next
npm run dev
```

---

### Problem: Out of Memory

**Already configured in package.json**, but if needed:
```bash
$env:NODE_OPTIONS="--max-old-space-size=16384"
npm run dev
```

---

## 🎨 What You Should See

### 1. Terminal Output
```
▲ Next.js 16.1.1 (Turbopack)
- Local:         http://localhost:3001
- Network:       http://192.168.8.106:3001
- Experiments (use with caution):
  · clientTraceMetadata
  ✓ memoryBasedWorkersCount
  ✓ optimizeCss
  · optimizePackageImports
  ✓ scrollRestoration

✓ Starting...
🌾 Instrumentation hook registered
✓ Ready in 3.9s
```

### 2. Browser Access
- Open: http://localhost:3001
- Should see the Farmers Market Platform homepage
- Hot Module Replacement (HMR) active
- Fast Refresh enabled

---

## 🌐 Available URLs

Once running:

- **Local**: http://localhost:3001
- **Network**: http://192.168.8.106:3001 (accessible from other devices on your network)
- **API Routes**: http://localhost:3001/api/*

---

## ⚡ Development Features

When server is running:

✅ **Hot Module Replacement** - Changes reflect instantly
✅ **Fast Refresh** - React components reload without losing state
✅ **Turbopack** - Faster than Webpack bundling
✅ **Console Ninja** - Enhanced browser console
✅ **Error Overlay** - Detailed error messages in browser

---

## 🛑 Stopping the Server

**In the terminal where server is running:**
- Press `Ctrl + C` (Windows/Linux)
- Press `Cmd + C` (Mac)

**Forcefully (if needed):**
```bash
# Windows PowerShell
taskkill /IM node.exe /F

# Or find specific process
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

---

## 🔧 Alternative: VS Code

### Option 1: Integrated Terminal
1. Open VS Code
2. Terminal → New Terminal
3. Run: `npm run dev`

### Option 2: NPM Scripts
1. Open `package.json`
2. Click "▶️ Debug" or "▶️ Run" above `"dev": "..."`

### Option 3: Tasks
1. Terminal → Run Task
2. Select "npm: dev"

---

## 📊 Verify Server is Running

### Method 1: Browser
Navigate to: http://localhost:3001

### Method 2: Command Line
```bash
# Test HTTP response
curl http://localhost:3001

# Or simple check
curl -I http://localhost:3001
```

### Method 3: Check Process
```bash
# Windows
netstat -ano | findstr :3001

# Should show LISTENING status
```

---

## 🎯 Quick Commands Reference

```bash
# Start development server
npm run dev

# Start on different port
npx next dev --turbo -p 3002

# Build for production
npm run build

# Start production server
npm start

# Type check
npx tsc --noEmit

# Lint code
npm run lint

# Run tests
npm test
```

---

## 🌟 Success Indicators

You'll know the server is running correctly when:

1. ✅ Terminal shows "Ready in X.Xs"
2. ✅ You see URLs (Local & Network)
3. ✅ Browser loads http://localhost:3001
4. ✅ No error messages in terminal
5. ✅ HMR works (edit a file, see changes instantly)

---

## 📞 Need Help?

### Check These First:
1. `STATUS_QUICK_REF.md` - Quick status reference
2. `SERVER_STATUS.md` - Detailed server information
3. `TYPESCRIPT_CLEANUP_STATUS.md` - Recent fixes
4. `.github/instructions/` - Divine coding guidelines

### Common Issues:
- **Port in use**: Change port or kill process
- **Module errors**: Run `npm install`
- **Type errors**: Run `npx tsc --noEmit`
- **Cache issues**: Delete `.next` folder

---

## 🎉 You're Ready!

Simply run:
```bash
npm run dev
```

And open: http://localhost:3001

**Happy Coding!** 🌾⚡

---

*Farmers Market Platform v3.0*
*Divine Agricultural Excellence*
