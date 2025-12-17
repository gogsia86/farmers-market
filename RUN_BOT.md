# 🤖 Run the Workflow Bot - Simple Instructions

## ⚡ Quick Start

### Run Bot Now (Server on Port 3001)
```bash
npm run bot:check
```

### Run Continuous Monitoring
```bash
npm run bot:watch
```

---

## 📊 What Gets Checked?

✅ **53+ Endpoints Validated**
- Core infrastructure (homepage, health, database)
- Authentication & security
- Marketplace & products
- Farms & agricultural features
- Farmer-specific features
- E-commerce & checkout
- Payments & Stripe integration
- AI & agent orchestration
- Admin & monitoring
- Platform features
- User & community features
- File upload
- **Advanced**: Load testing, DB performance, memory profiling

---

## 🎯 Expected Results

```
🤖 Running Comprehensive Website Function Checks
══════════════════════════════════════════════════════

✅ Homepage Load (261ms) - Page loaded
✅ Database Connection (76ms) - Connected - healthy
✅ Auth Endpoints (25ms) - Auth endpoints responding
... (50+ more checks)

📊 Health Check Summary
══════════════════════════════════════════════════════
✅ Overall Status: HEALTHY
📈 Success Rate: 95.5%+
✅ Passed: 52  ⚠️ Warnings: 1  ❌ Failed: 0
```

---

## 🔧 Configuration

### Change Server Port
```bash
# Current: Port 3001
NEXT_PUBLIC_APP_URL=http://localhost:3001 npm run bot:check

# Different port
NEXT_PUBLIC_APP_URL=http://localhost:3000 npm run bot:check

# Production
NEXT_PUBLIC_APP_URL=https://yourdomain.com npm run bot:check
```

### Adjust Concurrent Users (Load Test)
Edit `scripts/website-checker-bot.ts`:
```typescript
const CONFIG = {
  loadTestUsers: 10,  // Change this number
  // ...
};
```

---

## 📈 Status Indicators

| Status | Meaning |
|--------|---------|
| ✅ PASS | Everything working perfectly |
| ⚠️ WARN | Working but needs attention (e.g., no data seeded) |
| ❌ FAIL | Critical issue detected |

### Overall Status
- **HEALTHY** = All pass, no warnings
- **DEGRADED** = Some warnings (e.g., empty database)
- **DOWN** = Critical failures

---

## 🚨 Common Issues

### Server Not Running
```
Error: fetch failed / Connection refused
```
**Fix**: Start the server first
```bash
npm run dev
# Then in another terminal:
npm run bot:check
```

### Wrong Port
```
Error: ERR_CONNECTION_REFUSED at http://localhost:3000
```
**Fix**: Server is on port 3001
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3001 npm run bot:check
```

### Timeout Errors
```
Error: timeout exceeded
```
**Fix**: Server is slow, increase timeout in `scripts/website-checker-bot.ts`

---

## 📚 Documentation

- **Full Analysis**: `WORKFLOW_BOT_ANALYSIS.md`
- **Quick Start**: `BOT_QUICK_START.md`
- **Implementation**: `COMPREHENSIVE_BOT_IMPLEMENTATION.md`
- **Final Summary**: `WORKFLOW_BOT_FINAL_SUMMARY.md`

---

## 🎯 Daily Workflow

1. **Morning**: Run bot to check system health
   ```bash
   npm run bot:check
   ```

2. **During Development**: Run continuous monitoring
   ```bash
   npm run bot:watch
   ```

3. **Before Commit**: Run final check
   ```bash
   npm run bot:check
   ```

4. **Before Deployment**: Run production check
   ```bash
   NEXT_PUBLIC_APP_URL=https://yourdomain.com npm run bot:check
   ```

---

## ✅ Success Criteria

**Ready for Production** when you see:
- ✅ Success Rate > 95%
- ✅ Failed Checks = 0
- ✅ Average Response < 100ms
- ✅ Overall Status = HEALTHY or DEGRADED (with warnings only)

---

## 🎉 That's It!

Just run:
```bash
npm run bot:check
```

And watch the magic happen! 🚀🌾

---

**Last Updated**: December 15, 2025  
**Bot Version**: 4.0 - Ultimate Coverage Edition  
**Server Port**: 3001 (default)