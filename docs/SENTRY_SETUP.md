# 🔍 Sentry Quick Setup Guide

## Farmers Market Platform - Error Tracking Setup

**Status:** ✅ Ready for Testing  
**Environment:** Test/Development  
**Organization:** medicis-gang  
**Project:** farmers-market-prod

---

## ✨ What's Been Configured

Sentry is now fully integrated into the Farmers Market Platform with the following features:

### ✅ Completed Setup

1. **Multi-Runtime Support**
   - ✅ Client-side error tracking (`sentry.client.config.ts`)
   - ✅ Server-side error tracking (`sentry.server.config.ts`)
   - ✅ Edge runtime tracking (`sentry.edge.config.ts`)

2. **Advanced Features**
   - ✅ Session Replay (visual debugging)
   - ✅ Performance Monitoring
   - ✅ Source Maps (readable stack traces)
   - ✅ User Context Tracking
   - ✅ Custom Breadcrumbs
   - ✅ Agricultural-specific contexts

3. **Utility Functions**
   - ✅ Comprehensive error tracking utilities
   - ✅ API error tracking
   - ✅ Database error tracking
   - ✅ Performance metrics
   - ✅ Agricultural operation tracking

4. **Testing Scripts**
   - ✅ Configuration checker
   - ✅ Test error sender
   - ✅ Verbose diagnostic mode

---

## 🚀 Quick Start (3 Steps)

### Step 1: Load Environment Variables

The Sentry test token has been configured in `.env.sentry`:

```bash
# Option A: Load from .env.sentry (recommended for testing)
cat .env.sentry >> .env.local

# Option B: Manually add to .env.local
SENTRY_DSN="https://e6ecf356e37511f0b892c248499c2976@o4508829495328768.ingest.us.sentry.io/4508829501227008"
NEXT_PUBLIC_SENTRY_DSN="https://e6ecf356e37511f0b892c248499c2976@o4508829495328768.ingest.us.sentry.io/4508829501227008"
SENTRY_AUTH_TOKEN="e6ecf356e37511f0b892c248499c2976"
SENTRY_ORG="medicis-gang"
SENTRY_PROJECT="farmers-market-prod"
```

### Step 2: Test the Integration

Run the test script to verify everything works:

```bash
# Check configuration
npm run sentry:test

# Send test errors to Sentry dashboard
npm run sentry:send-test

# Verbose mode with full diagnostics
npm run sentry:test:verbose
```

### Step 3: View in Dashboard

Visit your Sentry dashboard to see the test errors:

🌐 **Dashboard URL:** https://sentry.io/organizations/medicis-gang/projects/farmers-market-prod/

**Expected Test Events:**
- ✅ Basic error capture
- ✅ Error with agricultural context
- ✅ Message capture
- ✅ Error with breadcrumbs
- ✅ Agricultural operation error
- ✅ Performance transaction

---

## 📝 Usage in Your Code

### Import Utilities

```typescript
import {
  trackError,
  trackMessage,
  trackApiError,
  trackDatabaseError,
  setUserContext,
  addBreadcrumb,
} from "@/lib/monitoring/sentry-utils";
```

### Basic Error Tracking

```typescript
try {
  await riskyOperation();
} catch (error) {
  trackError(error as Error, {
    tags: { operation: "create_farm" },
    extra: { farmId: "farm_123" },
  });
}
```

### API Error Tracking

```typescript
export async function POST(request: Request) {
  try {
    const result = await processOrder(data);
    return Response.json(result);
  } catch (error) {
    trackApiError(error as Error, {
      method: request.method,
      url: request.url,
      statusCode: 500,
      userId: session?.user?.id,
    });
    
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
```

### User Context

```typescript
// On login
setUserContext({
  id: user.id,
  name: user.name,
  role: user.role,
});

// On logout
clearUserContext();
```

### Agricultural Operations

```typescript
trackAgriculturalOperation("create_farm", {
  farmType: "organic",
  cropCategory: "vegetables",
  season: "spring",
  region: "midwest",
  certifications: ["USDA_ORGANIC"],
  success: true,
  duration: 1234,
});
```

---

## 🎯 What Gets Tracked Automatically

Sentry automatically captures:

1. **Unhandled Errors**
   - JavaScript errors in browser
   - Uncaught exceptions in Node.js
   - Promise rejections
   - React component errors

2. **Performance Metrics**
   - Page load times
   - API response times
   - Database query duration
   - Slow operations

3. **User Actions** (Breadcrumbs)
   - Navigation events
   - Button clicks
   - Form submissions
   - API calls

4. **Request Context**
   - HTTP method and URL
   - Request headers (sanitized)
   - Query parameters (sanitized)
   - User agent

---

## 🔒 Privacy & Security

### What's Protected

Sentry is configured to **automatically strip** sensitive data:

- ❌ Passwords
- ❌ Auth tokens
- ❌ API keys
- ❌ Email addresses
- ❌ Cookie values
- ❌ Authorization headers
- ❌ Credit card numbers

### What's Sent

Only non-sensitive data is sent to Sentry:

- ✅ User ID (not email)
- ✅ User role
- ✅ Error messages
- ✅ Stack traces
- ✅ Request URLs (sanitized)
- ✅ Performance metrics

---

## 📊 Dashboard Features

### Issues Tab

View and manage errors:
- Group similar errors
- See frequency and impact
- Track resolution status
- Assign to team members

### Performance Tab

Monitor application performance:
- Transaction duration
- Database query times
- API endpoint latency
- Slow operations

### Replays Tab

Visual debugging with session replay:
- Watch user session before error
- See console logs
- View network requests
- Replay user interactions

### Alerts Tab

Set up notifications:
- New error types
- Spike in error frequency
- Performance degradation
- Custom thresholds

---

## 🛠️ Available Scripts

```bash
# Configuration check (no errors sent)
npm run sentry:test

# Send test errors to dashboard
npm run sentry:send-test

# Verbose diagnostics
npm run sentry:test:verbose

# Full configuration check
npm run sentry:check
```

---

## ⚙️ Configuration Files

### Client Configuration
**File:** `sentry.client.config.ts`  
**Runtime:** Browser  
**Features:** Session Replay, Browser Profiling, Route Tracking

### Server Configuration
**File:** `sentry.server.config.ts`  
**Runtime:** Node.js  
**Features:** HTTP Tracing, Prisma Integration, Node Profiling

### Edge Configuration
**File:** `sentry.edge.config.ts`  
**Runtime:** Edge (Middleware)  
**Features:** HTTP Tracing, Lightweight Monitoring

### Utility Functions
**File:** `src/lib/monitoring/sentry-utils.ts`  
**Features:** 20+ helper functions for error tracking

---

## 🔍 Sampling Rates (Production)

To control costs and performance:

```typescript
// Client (Browser)
tracesSampleRate: 0.1        // 10% of transactions
replaysSessionSampleRate: 0.1 // 10% of sessions
replaysOnErrorSampleRate: 1.0 // 100% of error sessions

// Server (Node.js)
tracesSampleRate: 0.2         // 20% of transactions
profilesSampleRate: 0.1       // 10% of profiles

// Edge (Middleware)
tracesSampleRate: 0.15        // 15% of transactions
```

**Note:** Development mode samples 100% for debugging.

---

## 🐛 Troubleshooting

### Issue: "Sentry not configured"

**Solution:**
1. Check `.env.local` contains `SENTRY_DSN`
2. Restart dev server: `npm run dev`
3. Run: `npm run sentry:test`

### Issue: "Events not appearing"

**Solution:**
1. Wait 30-60 seconds for processing
2. Check environment filter in dashboard
3. Verify DSN in dashboard matches `.env.local`
4. Run: `npm run sentry:send-test`

### Issue: "Source maps not working"

**Solution:**
1. Verify `SENTRY_AUTH_TOKEN` is set
2. Check build logs for upload success
3. Rebuild: `npm run build`

---

## 📚 Documentation

### Full Documentation
See `docs/SENTRY_INTEGRATION.md` for comprehensive guide including:
- Advanced features
- Best practices
- API reference
- Dashboard usage
- Security guidelines

### External Resources
- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Dashboard:** https://sentry.io/organizations/medicis-gang/
- **Support:** https://discord.gg/sentry

---

## ✅ Verification Checklist

Before deploying to production, verify:

- [ ] Test errors appear in dashboard
- [ ] Source maps working (readable stack traces)
- [ ] User context tracked correctly
- [ ] Sensitive data stripped (check events)
- [ ] Performance monitoring active
- [ ] Session replay working (if enabled)
- [ ] Alerts configured
- [ ] Team members have access

Run verification:
```bash
npm run sentry:send-test
```

Then check dashboard at:  
https://sentry.io/organizations/medicis-gang/projects/farmers-market-prod/

---

## 🌟 Next Steps

1. **Test in Development**
   ```bash
   npm run sentry:send-test
   ```

2. **Integrate in Code**
   - Add error tracking to critical paths
   - Set user context on login
   - Track agricultural operations
   - Monitor performance

3. **Configure Alerts**
   - Set up Slack/email notifications
   - Create alert rules
   - Define error thresholds

4. **Review Dashboard**
   - Check error patterns
   - Identify performance issues
   - Set up team access

5. **Deploy to Production**
   - Update environment variables
   - Generate production auth token
   - Test in production environment
   - Monitor deployment

---

## 🎉 You're All Set!

Sentry is now fully integrated and ready to track errors in your Farmers Market Platform.

**Test Token (Safe for Development):**
```
Token: e6ecf356e37511f0b892c248499c2976
Status: ✅ Active for testing
```

**Important:** Replace with production token before deploying to production!

---

**Questions?** Check `docs/SENTRY_INTEGRATION.md` or contact the team.

**Made with 🌾 by the Farmers Market Platform Team**