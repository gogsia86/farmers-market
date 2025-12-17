# 🤖 Workflow Bot - Quick Start Guide

> **Automated monitoring and validation for the Farmers Market Platform**

---

## ⚡ Quick Commands

### Run Bot Once (Manual Check)

```bash
npm run bot:check
```

### Run Continuous Monitoring

```bash
npm run bot:watch
```

### Start Server + Bot Together

```bash
npm run dev:with-bot
```

---

## 📊 What Does the Bot Check?

The bot automatically validates **22 critical functions**:

### ✅ Always Checked

- Homepage loading
- Database connectivity
- Authentication endpoints
- Product marketplace
- Search functionality
- Farm listings
- Cart system
- Order management
- User profiles
- Payment processing
- Platform statistics
- Performance metrics

---

## 🎯 Reading the Results

### Status Indicators

```
✅ PASS  - Everything working perfectly
⚠️ WARN  - Working but needs attention (e.g., no data seeded)
❌ FAIL  - Critical issue detected
```

### Example Output

```
🤖 Running Website Function Checks
══════════════════════════════════════════════

🔧 Core Infrastructure:
✅ Homepage Load (275ms) - Page loaded: "Farmers Market"
✅ Health Endpoints (143ms) - All health endpoints responding
✅ Database Connection (20ms) - Connected - healthy

📊 Health Check Summary
══════════════════════════════════════════════
✅ Overall Status: HEALTHY
⏱️  Total Duration: 1770ms
📈 Success Rate: 95.5%

✅ Passed: 21  ⚠️ Warnings: 1  ❌ Failed: 0
```

---

## 🔧 Configuration

### Change Port (Default: 3001)

```bash
# Set environment variable
export NEXT_PUBLIC_APP_URL=http://localhost:3001

# Or run with custom port
NEXT_PUBLIC_APP_URL=http://localhost:3001 npm run bot:check
```

### Adjust Check Interval (Continuous Mode)

Edit `scripts/website-checker-bot.ts`:

```typescript
const CONFIG = {
  checkInterval: 60000, // milliseconds (default: 1 minute)
  // ...
};
```

---

## 🚨 Troubleshooting

### Bot Won't Start

**Problem**: `Error: Browser not initialized`
**Solution**:

```bash
# Install Playwright browsers
npx playwright install chromium
```

### Connection Refused

**Problem**: `fetch failed... ECONNREFUSED`
**Solution**:

1. Make sure server is running on port 3001
2. Check `npm run dev` is active
3. Verify database is connected

### Timeout Errors

**Problem**: `timeout exceeded`
**Solution**:

1. Increase timeout in CONFIG (default: 30s)
2. Check server performance
3. Verify database queries aren't slow

---

## 📈 Understanding Performance Metrics

### Response Time Ratings

- **< 100ms**: ⚡ Excellent (most endpoints)
- **100-500ms**: ✅ Good (complex queries)
- **500-1000ms**: ⚠️ Acceptable (page renders)
- **> 1000ms**: 🔴 Needs optimization

### Current Benchmarks

```
Database queries:    20ms   ⚡
API endpoints:       5-30ms ⚡
Page loads:          55ms   ⚡
Full page render:    275ms  ✅
```

---

## 🎓 Advanced Usage

### Run Specific Check Only

Edit `scripts/website-checker-bot.ts` and comment out unwanted checks:

```typescript
// checks.push(await this.checkHomePage());  // Skip this
checks.push(await this.checkDatabaseConnection()); // Run this
```

### Add Custom Check

```typescript
async checkMyFeature(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const response = await fetch(`${CONFIG.baseUrl}/api/my-endpoint`);

    if (response.ok) {
      return {
        name: "My Feature",
        status: "pass",
        duration: Date.now() - start,
        message: "Feature working!",
        timestamp: new Date(),
      };
    }
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    return {
      name: "My Feature",
      status: "fail",
      duration: Date.now() - start,
      message: "Feature not working",
      error: error instanceof Error ? error.message : "Unknown",
      timestamp: new Date(),
    };
  }
}
```

Then add to `runAllChecks()`:

```typescript
checks.push(await this.checkMyFeature());
logCheck(checks[checks.length - 1]);
```

---

## 📋 Checklist: What's Covered?

### ✅ Fully Monitored

- [x] Core infrastructure (homepage, health, database)
- [x] Authentication & security
- [x] Product marketplace & search
- [x] Farm listings & features
- [x] Shopping cart & orders
- [x] User profiles & reviews
- [x] Platform statistics
- [x] Notifications
- [x] Payment endpoints
- [x] Resources library
- [x] Support tickets
- [x] Performance metrics

### 🔄 Partially Monitored

- [x] Stripe integration (basic check only)

### ❌ Not Yet Monitored

- [ ] Admin dashboard (requires auth)
- [ ] AI agent orchestration
- [ ] File uploads
- [ ] Farmer-specific dashboards
- [ ] Webhook handlers
- [ ] Education system

---

## 🎯 Common Scenarios

### Before Deployment

```bash
# Run full check
npm run bot:check

# Look for:
# - ✅ All critical checks passing
# - ⏱️ Response times under 1 second
# - 📈 Success rate > 95%
```

### During Development

```bash
# Run continuous monitoring
npm run bot:watch

# Keep terminal open
# Bot runs every 60 seconds
# Immediately see if changes break anything
```

### After Database Changes

```bash
# Check database connectivity first
npm run bot:check | grep "Database"

# Should show:
# ✅ Database Connection (20ms) - Connected - healthy
```

### Testing New Features

1. Add custom check for your feature (see Advanced Usage)
2. Run bot: `npm run bot:check`
3. Verify feature shows ✅ PASS
4. Commit changes

---

## 📊 Success Criteria

### Production Ready ✅

```
Overall Status:  HEALTHY or DEGRADED
Success Rate:    > 95%
Failed Checks:   0
Response Times:  < 100ms average
```

### Needs Investigation ⚠️

```
Overall Status:  DEGRADED
Success Rate:    90-95%
Failed Checks:   1-2
Response Times:  100-500ms average
```

### Critical Issues 🔴

```
Overall Status:  DOWN
Success Rate:    < 90%
Failed Checks:   > 2
Response Times:  > 500ms average
```

---

## 🔗 Related Commands

```bash
# Development server
npm run dev              # Start on port 3001

# Database
npm run db:push          # Push schema changes
npm run db:studio        # Open Prisma Studio

# Testing
npm test                 # Run unit tests
npm run test:e2e         # Run E2E tests

# Production
npm run build            # Build for production
npm run start            # Start production server
```

---

## 📚 Learn More

- **Full Analysis**: See `WORKFLOW_BOT_ANALYSIS.md`
- **Bot Source**: `scripts/website-checker-bot.ts`
- **Testing Guide**: `.github/instructions/13_TESTING_PERFORMANCE_MASTERY.instructions.md`

---

## 💡 Pro Tips

1. **Run before every commit** - Catch issues early
2. **Monitor during development** - Use continuous mode
3. **Check after migrations** - Verify database changes
4. **Baseline your metrics** - Know your normal response times
5. **Add custom checks** - Monitor your specific features

---

## 🆘 Need Help?

### Bot isn't working?

1. Check server is running: `curl http://localhost:3001`
2. Verify database: `npm run db:studio`
3. Reinstall dependencies: `npm install`
4. Clear cache: `rm -rf .next`

### Still having issues?

- Check bot source code: `scripts/website-checker-bot.ts`
- Review error messages carefully
- Verify all endpoints exist in `src/app/api/`

---

**Last Updated**: December 15, 2025  
**Bot Version**: 2.0 - Enhanced Edition  
**Status**: ✅ Production Ready

---

## 🎉 You're Ready!

Run your first check now:

```bash
npm run bot:check
```

Watch the magic happen! 🚀🌾
