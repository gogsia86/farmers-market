# 🚀 QUICK START - PORT 3001 CONFIGURATION

**Farmers Market Platform - Development Server**  
**Port:** 3001  
**Status:** ✅ Fully Configured  
**Last Updated:** December 2024

---

## 📋 QUICK VERIFICATION

### 1. Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
✓ Ready on http://localhost:3001
✓ Compiled in XXXms
```

### 2. Verify Endpoints
Open these URLs in your browser:

- **Homepage:** http://localhost:3001
- **Admin Login:** http://localhost:3001/admin-login
- **User Login:** http://localhost:3001/login
- **Health Check:** http://localhost:3001/api/health

---

## ✅ CONFIGURATION CHECKLIST

### Environment Variables (.env.local)
```bash
# Auth Configuration
NEXTAUTH_URL="http://localhost:3001"

# Base URL
BASE_URL="http://localhost:3001"

# Database (example)
DATABASE_URL="postgresql://username:password@localhost:5432/farmers_market"

# NextAuth Secret
NEXTAUTH_SECRET="your-secret-key-minimum-32-characters"
```

### Package.json Scripts (Already Configured)
```json
{
  "scripts": {
    "dev": "... next dev --turbo -p 3001",
    "start": "... next start -p 3001"
  }
}
```

---

## 🔧 UPDATED FILES

All these files now use port **3001**:

### Core Configuration
- ✅ `ecosystem.config.js` - PM2 configuration
- ✅ `create-admin.ts` - Admin user creation
- ✅ `jest.setup.js` - Test environment

### Development Scripts
- ✅ `scripts/dev/diagnostic-check.ts`
- ✅ `scripts/dev/monitor-daemon.ts`
- ✅ `scripts/monitoring/workflow-monitor.ts`

### Testing Scripts
- ✅ `scripts/setup-test-db.ts`
- ✅ `scripts/testing/test-dashboard-apis.ts`
- ✅ `scripts/testing/test-login.ts`
- ✅ `scripts/testing/test-monitoring-bot.ts`
- ✅ `scripts/testing/test-monitoring-integration.ts`
- ✅ `scripts/testing/test-perplexity-farming.ts`

### Database Seeds
- ✅ `prisma/seed-comprehensive.js`
- ✅ `prisma/seed-quick.js`

---

## 🎯 COMMON TASKS

### Create Admin User
```bash
npx tsx create-admin.ts
```

**Output will show:**
```
🌐 You can now login at: http://localhost:3001/login
```

### Run Health Check
```bash
npx tsx scripts/monitoring/workflow-monitor.ts health
```

**Connects to:** http://localhost:3001/api/health

### Run Tests
```bash
# All tests automatically use port 3001
npm test
npm run test:e2e
```

### Seed Database
```bash
# Quick seed
npm run prisma:seed

# Comprehensive seed
npx tsx prisma/seed-comprehensive.js
```

**Output includes:**
- Admin Panel: http://localhost:3001/admin
- Browse Farms: http://localhost:3001/farms
- Browse Products: http://localhost:3001/products

---

## 🐛 TROUBLESHOOTING

### Port Already in Use
```bash
# Check what's using port 3001
lsof -ti:3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Kill the process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### Server Not Starting
1. **Check .env.local exists** and has correct URLs
2. **Clear cache:** `npm run clean:all`
3. **Reinstall:** `rm -rf node_modules && npm install`
4. **Generate Prisma:** `npm run prisma:generate`

### Tests Failing
1. **Start dev server first:** `npm run dev`
2. **Verify server responds:** curl http://localhost:3001/api/health
3. **Check DATABASE_URL** in .env.local

### Authentication Issues
1. **Verify NEXTAUTH_URL:** Should be `http://localhost:3001`
2. **Check NEXTAUTH_SECRET:** At least 32 characters
3. **Clear cookies** in browser
4. **Restart server:** Stop and run `npm run dev` again

---

## 🎓 WORKFLOWS

### First Time Setup
```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local

# 3. Edit .env.local
# Set NEXTAUTH_URL=http://localhost:3001
# Set DATABASE_URL to your database

# 4. Setup database
npm run prisma:push
npm run prisma:seed

# 5. Create admin
npx tsx create-admin.ts

# 6. Start server
npm run dev

# 7. Open browser
open http://localhost:3001
```

### Daily Development
```bash
# Start server
npm run dev

# Access at http://localhost:3001
# Login with your credentials
# Start coding!
```

### Running Monitoring
```bash
# Start monitoring daemon
npm run workflow:monitor

# Or run specific checks
npx tsx scripts/monitoring/workflow-monitor.ts health
npx tsx scripts/monitoring/workflow-monitor.ts critical
```

---

## 📊 VERIFICATION COMMANDS

### Test All Endpoints
```bash
# Health check
curl http://localhost:3001/api/health

# Session check (should work when logged in)
curl http://localhost:3001/api/auth/session

# Dashboard API (requires auth)
curl http://localhost:3001/api/monitoring/dashboard/overview
```

### Run Diagnostic Check
```bash
npx tsx scripts/dev/diagnostic-check.ts
```

**Expected:** All checks pass with port 3001

### Test Login Workflow
```bash
npx tsx scripts/testing/test-login.ts
```

**Expected:** Login test connects to localhost:3001

---

## 🎉 SUCCESS INDICATORS

Your setup is correct when:

- ✅ `npm run dev` shows: `Ready on http://localhost:3001`
- ✅ Browser opens http://localhost:3001 successfully
- ✅ Login page loads at http://localhost:3001/login
- ✅ Health check returns: `{"status":"ok"}`
- ✅ Admin creation script shows port 3001
- ✅ All tests pass without connection errors

---

## 📚 RELATED FILES

- **Setup Guide:** [DEV_SERVER_SETUP.md](./DEV_SERVER_SETUP.md)
- **Update Summary:** [DEV_SERVER_UPDATE_SUMMARY.md](./DEV_SERVER_UPDATE_SUMMARY.md)
- **Package Config:** [package.json](./package.json)
- **Environment Example:** `.env.example`

---

## 🔑 KEY URLS

### Development Server
- **Homepage:** http://localhost:3001
- **Login:** http://localhost:3001/login
- **Register:** http://localhost:3001/register
- **Admin Login:** http://localhost:3001/admin-login
- **Admin Panel:** http://localhost:3001/admin

### API Endpoints
- **Health:** http://localhost:3001/api/health
- **Auth Session:** http://localhost:3001/api/auth/session
- **Cart:** http://localhost:3001/api/cart
- **Farms:** http://localhost:3001/api/farms
- **Products:** http://localhost:3001/api/products

### Utilities
- **Prisma Studio:** `npm run prisma:studio` (separate port)

---

## 💡 TIPS

### Performance
- Use `npm run dev:omen` for HP OMEN systems (32GB memory)
- Enable debug logging: `npm run dev:logger`
- Use safe mode if needed: `npm run dev:safe`

### Development
- All URLs in console output use port 3001
- Copy-paste URLs work without modification
- No need to manually change ports

### Testing
- Tests automatically connect to port 3001
- No environment variable override needed
- Monitoring scripts use correct port by default

---

## ⚠️ IMPORTANT NOTES

### Port Configuration
- **DO NOT** change port in package.json without updating all related files
- **DO NOT** use port 3000 - it's not the configured port
- **DO** use http://localhost:3001 for all development work

### Environment Variables
- **ALWAYS** set `NEXTAUTH_URL=http://localhost:3001` in .env.local
- **NEVER** use localhost:3000 in environment files
- **CHECK** BASE_URL matches NEXTAUTH_URL

### Production Deployment
- Production uses standard ports (80/443)
- Staging may use different ports
- Only development uses port 3001

---

## 🚀 READY TO GO!

If all verifications pass, you're ready to develop:

```bash
# Start coding!
npm run dev

# Access your app
open http://localhost:3001

# Happy coding! 🌾⚡
```

---

**Status:** ✅ All files configured for port 3001  
**Breaking Changes:** None  
**Documentation:** Complete  
**Support:** See [DEV_SERVER_SETUP.md](./DEV_SERVER_SETUP.md) for detailed help

---

**Last Updated:** December 2024  
**Maintained By:** Development Team  
**Questions:** Review troubleshooting section above