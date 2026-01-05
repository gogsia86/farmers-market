# 🔧 Server Troubleshooting Guide

**Farmers Market Platform - Development Server Issues**

---

## 🚨 Quick Fix: Connection Refused (ERR_CONNECTION_REFUSED)

This is the most common issue. The server process is not running.

### ✅ Solution

**Option 1: Use the batch script (Windows)**
```cmd
start-dev.bat
```

**Option 2: Use PowerShell script**
```powershell
.\start-dev.ps1
```

**Option 3: Manual start**
```bash
npm run dev
```

**Wait for this message:**
```
✓ Ready in 3.9s
```

**Then access:** http://localhost:3001

---

## 🔍 Common Issues & Solutions

### Issue 1: "Port 3001 is already in use"

**Symptoms:**
- Error: `EADDRINUSE: address already in use :::3001`
- Server fails to start

**Solution A: Find and kill the process (Windows PowerShell as Admin)**
```powershell
# Find process using port 3001
netstat -ano | findstr :3001

# Output example:
# TCP    0.0.0.0:3001    0.0.0.0:0    LISTENING    12345
#                                                    ^^^^^ This is the PID

# Kill the process (replace 12345 with actual PID)
taskkill /PID 12345 /F
```

**Solution B: Use different port**
```bash
npx next dev --turbo -p 3002
```

Then access: http://localhost:3002

---

### Issue 2: "Cannot find module" or "Module not found"

**Symptoms:**
- Error during startup
- Missing dependency errors
- Import errors

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Verify installation
npm list --depth=0

# Start server
npm run dev
```

---

### Issue 3: TypeScript errors on startup

**Symptoms:**
- Red error messages during compilation
- Type checking failures
- Build errors

**Solution:**
```bash
# Check TypeScript errors
npx tsc --noEmit

# If errors found, they need to be fixed first
# Clean Next.js cache
rm -rf .next

# Restart server
npm run dev
```

---

### Issue 4: "Out of Memory" / Heap errors

**Symptoms:**
- `JavaScript heap out of memory`
- Process crashes during build
- Slow performance

**Solution:**

Already configured in `package.json`, but if needed:

**PowerShell:**
```powershell
$env:NODE_OPTIONS="--max-old-space-size=16384"
npm run dev
```

**Or use the OMEN-optimized version:**
```bash
npm run dev:omen
```

---

### Issue 5: Server starts but page doesn't load

**Symptoms:**
- Terminal shows "Ready"
- Browser shows blank page or loading forever
- No error messages

**Solution A: Clear browser cache**
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

**Solution B: Check for JavaScript errors**
1. Open DevTools (F12)
2. Check Console tab
3. Fix any reported errors

**Solution C: Clear Next.js cache**
```bash
rm -rf .next
npm run dev
```

---

### Issue 6: Hot Module Replacement (HMR) not working

**Symptoms:**
- Changes don't reflect in browser
- Need to manually refresh
- Fast Refresh not working

**Solution:**
```bash
# Stop server (Ctrl+C)

# Clear cache
rm -rf .next

# Restart with Turbopack (should be default)
npm run dev:turbo
```

---

### Issue 7: Database connection errors

**Symptoms:**
- `Can't reach database server`
- Prisma connection errors
- API routes failing

**Solution:**

**Check environment variables:**
```bash
# Verify .env.local exists
ls .env.local

# Check DATABASE_URL is set
# Should contain valid PostgreSQL connection string
```

**Verify database is running:**
```bash
# If using local PostgreSQL, ensure it's running
# If using Docker:
docker ps

# Check Prisma connection
npx prisma db pull
```

---

### Issue 8: Slow startup / compilation

**Symptoms:**
- Server takes >10s to start
- Slow page loads
- High CPU usage

**Solution:**

**Already optimized, but you can try:**
```bash
# Use webpack instead of Turbopack (if Turbopack has issues)
npm run dev:webpack

# Or increase memory allocation
npm run dev:omen
```

**Check system resources:**
- Close unnecessary applications
- Ensure adequate disk space
- Check antivirus isn't scanning node_modules

---

### Issue 9: Environment variables not loading

**Symptoms:**
- `process.env.VARIABLE_NAME` is undefined
- API keys not working
- Features not configured

**Solution:**

**Check file presence:**
```bash
ls -la .env*
# Should show: .env, .env.local, .env.example
```

**Verify format:**
```bash
# .env.local format (no quotes needed for most values)
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3001
```

**Restart server after changes:**
```bash
# Ctrl+C to stop
npm run dev
```

---

### Issue 10: Prisma errors

**Symptoms:**
- `Error: PrismaClient is unable to be run in the browser`
- Schema sync errors
- Migration issues

**Solution:**

**Regenerate Prisma client:**
```bash
npx prisma generate
```

**Check schema:**
```bash
npx prisma validate
```

**Apply migrations (if needed):**
```bash
npx prisma migrate dev
```

**Restart server:**
```bash
npm run dev
```

---

## 🛠️ Advanced Troubleshooting

### Complete Clean Rebuild

If all else fails, nuclear option:

```bash
# 1. Stop server
# Press Ctrl+C

# 2. Kill all Node processes (Windows PowerShell as Admin)
taskkill /IM node.exe /F

# 3. Clean everything
rm -rf node_modules
rm -rf .next
rm -rf .turbo
rm package-lock.json

# 4. Reinstall
npm install

# 5. Regenerate Prisma
npx prisma generate

# 6. Start fresh
npm run dev
```

---

### Check System Requirements

Ensure you meet minimum requirements:

- **Node.js**: v20.19.0 or higher
- **NPM**: v10.0.0 or higher
- **RAM**: 8GB minimum, 16GB recommended
- **Disk Space**: 2GB free minimum

**Check versions:**
```bash
node --version
npm --version
```

**Update if needed:**
```bash
# Update npm
npm install -g npm@latest

# Update Node.js - download from nodejs.org
```

---

### Verify Installation Integrity

```bash
# Check for missing dependencies
npm install

# Audit for issues
npm audit

# Fix vulnerabilities (optional)
npm audit fix

# Verify Next.js
npx next --version
```

---

## 📊 Diagnostic Commands

Run these to gather information:

```bash
# 1. Check TypeScript
npx tsc --noEmit

# 2. Check ESLint
npm run lint

# 3. Check ports in use
netstat -ano | findstr :3001

# 4. Check Node processes
tasklist | findstr node

# 5. Check disk space
wmic logicaldisk get size,freespace,caption

# 6. Test Prisma connection
npx prisma db pull

# 7. Validate environment
node -e "console.log(process.env.DATABASE_URL ? 'DB URL set' : 'DB URL missing')"
```

---

## 🔍 Debug Mode

Start server with verbose logging:

```bash
npm run dev:logger
```

This enables debug-level logs to help identify issues.

---

## 🌐 Network Troubleshooting

### Can't access from other devices on network

**Issue:** http://192.168.8.106:3001 not accessible

**Solution:**

**Check firewall:**
```powershell
# Windows Firewall - allow Node.js
# Run as Administrator
New-NetFirewallRule -DisplayName "Node.js" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
```

**Check server binding:**
Server should bind to `0.0.0.0` (all interfaces), which is the default.

**Verify network IP:**
```bash
ipconfig
# Look for IPv4 Address under your active network adapter
```

---

## 📞 Still Having Issues?

### Information to Gather

Before seeking help, collect:

1. **Error messages** (full text from terminal)
2. **Node version:** `node --version`
3. **NPM version:** `npm --version`
4. **Operating System:** Windows version
5. **What you tried:** List of solutions attempted
6. **Screenshots:** Terminal output, browser errors

### Check These Documents

1. `START_SERVER.md` - Server startup guide
2. `SERVER_STATUS.md` - Current system status
3. `STATUS_QUICK_REF.md` - Quick reference
4. `TYPESCRIPT_CLEANUP_STATUS.md` - Recent fixes

### Verify Health Status

```bash
# Run all checks
npx tsc --noEmit && npm run lint && echo "All checks passed!"
```

---

## ✅ Verification Checklist

After fixing issues, verify:

- [ ] `npm run dev` starts without errors
- [ ] Terminal shows "Ready in X.Xs"
- [ ] http://localhost:3001 loads in browser
- [ ] No console errors in browser DevTools
- [ ] HMR works (edit file, see changes)
- [ ] API routes respond (test /api/health)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No ESLint warnings in `src/`

---

## 🎯 Quick Reference

| Problem | Quick Fix |
|---------|-----------|
| Connection refused | `npm run dev` |
| Port in use | Kill process or use different port |
| Module not found | `npm install` |
| TypeScript errors | `npx tsc --noEmit` then fix |
| Slow startup | Clear `.next` folder |
| Database errors | Check `.env.local` and Prisma |
| HMR not working | Clear cache, restart server |
| Out of memory | Use `npm run dev:omen` |

---

## 🚀 Success!

Once you see:
```
✓ Ready in 3.9s
```

Your server is running correctly! 🎉

Access at: http://localhost:3001

---

*Farmers Market Platform v3.0 - Divine Agricultural Excellence*
*Last Updated: January 2025*
