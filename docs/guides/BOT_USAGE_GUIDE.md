# 🤖 Website Function Checker Bot - Usage Guide

**Status**: ✅ Ready to Use  
**Version**: 1.0.0  
**Last Updated**: December 5, 2024

---

## 📋 Overview

The Website Function Checker Bot is an automated monitoring tool that validates all critical platform features in real-time. It performs comprehensive health checks on your Farmers Market Platform to ensure everything is working correctly.

---

## 🚀 Quick Start

### Prerequisites

1. **Server Running**: Make sure your development server is running
   ```bash
   npm run dev
   # Server starts on http://localhost:3001
   ```

2. **Install Dependencies** (if not already done)
   ```bash
   npm install
   ```

### Run the Bot

**Single Check** (runs once and exits):
```bash
npm run bot:check:dev
```

**Continuous Monitoring** (checks every minute):
```bash
npm run bot:watch:dev
```

---

## 📖 Available Commands

### Basic Commands

```bash
# Run single health check
npm run bot:check

# Run continuous monitoring (every 60 seconds)
npm run bot:watch

# Run check on dev server (port 3001)
npm run bot:check:dev

# Run continuous monitoring on dev server
npm run bot:watch:dev
```

### Direct Execution

```bash
# Single check
tsx scripts/website-checker-bot.ts

# Continuous mode
tsx scripts/website-checker-bot.ts continuous

# Help
tsx scripts/website-checker-bot.ts help
```

### Custom URL

```bash
# Check staging environment
NEXT_PUBLIC_APP_URL=https://staging.farmersmarket.com npm run bot:check

# Check production
NEXT_PUBLIC_APP_URL=https://farmersmarket.com npm run bot:check
```

---

## 🔍 What Does the Bot Check?

The bot performs **8 critical health checks**:

### 1. ✅ Homepage Load
- Verifies the homepage loads successfully
- Checks page title and body visibility
- Measures load time
- **Pass criteria**: Page loads within 30 seconds

### 2. ✅ Database Connection
- Tests database connectivity via health endpoint
- Validates Prisma connection
- **Pass criteria**: `/api/health/database` returns 200 OK

### 3. ✅ Auth Endpoints
- Checks NextAuth configuration
- Validates auth provider endpoints
- **Pass criteria**: `/api/auth/providers` returns 200 OK

### 4. ✅ Marketplace API
- Tests product listing API
- Validates API response structure
- **Pass criteria**: `/api/products` returns valid product data

### 5. ✅ Product Pages
- Verifies marketplace page renders
- Checks for product cards
- **Pass criteria**: Marketplace page loads with products

### 6. ✅ Search Functionality
- Tests search API endpoint
- Validates search results
- **Pass criteria**: `/api/search?q=tomato` returns results

### 7. ✅ Performance Check
- Measures page load time
- Evaluates performance metrics
- **Pass criteria**: 
  - Excellent: < 3 seconds
  - Acceptable: 3-5 seconds
  - Slow: > 5 seconds

### 8. ✅ Static Assets
- Counts loaded images, scripts, stylesheets
- Validates asset loading
- **Pass criteria**: Assets load successfully

---

## 📊 Understanding the Output

### Status Indicators

```
✅ = Check Passed
⚠️ = Warning (non-critical issue)
❌ = Check Failed
```

### Sample Output

```
╔════════════════════════════════════════════════════════════════╗
║          🤖 Running Website Function Checks                    ║
╚════════════════════════════════════════════════════════════════╝

✅ Homepage Load (1234ms) - Page loaded: "Farmers Market Platform"
✅ Database Connection (456ms) - Connected - OK
✅ Auth Endpoints (234ms) - Auth endpoints responding
✅ Marketplace API (678ms) - API responding - 25 products
✅ Product Pages (890ms) - Product pages rendering correctly
✅ Search Functionality (345ms) - Search working - 5 results
✅ Performance Check (2145ms) - Load time: 2145ms - Excellent!
✅ Static Assets (567ms) - Loaded - 15 images, 8 scripts, 3 stylesheets

╔════════════════════════════════════════════════════════════════╗
║                   📊 Health Check Summary                      ║
╚════════════════════════════════════════════════════════════════╝

✅ Overall Status: HEALTHY
⏱️  Total Duration: 6549ms
📈 Success Rate: 100.0%
🕐 Timestamp: 2024-12-05T19:30:00.000Z

──────────────────────────────────────────────────────────────────
✅ Passed: 8  ⚠️  Warnings: 0  ❌ Failed: 0
──────────────────────────────────────────────────────────────────
```

### Health Status Levels

- **🟢 HEALTHY**: All checks passed, no warnings
- **🟡 DEGRADED**: All checks passed but some warnings present
- **🔴 DOWN**: One or more critical checks failed

---

## 🛠️ Configuration

### Environment Variables

```bash
# Base URL to check (default: http://localhost:3000)
export NEXT_PUBLIC_APP_URL=http://localhost:3001

# Timeout per check in milliseconds (default: 30000)
export CHECK_TIMEOUT=30000

# Retry count for failed checks (default: 3)
export CHECK_RETRIES=3

# Check interval for continuous mode in milliseconds (default: 60000)
export CHECK_INTERVAL=60000
```

### Customization

Edit `scripts/website-checker-bot.ts` to customize:

```typescript
const CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  timeout: 30000,        // 30 seconds
  retries: 3,            // Retry failed checks 3 times
  checkInterval: 60000,  // Check every 60 seconds in continuous mode
  headless: true,        // Run browser in headless mode
};
```

---

## 🎯 Usage Scenarios

### Scenario 1: Development Testing

**Use Case**: Verify your local dev server is working correctly

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run bot checker
npm run bot:check:dev
```

### Scenario 2: Pre-Deployment Validation

**Use Case**: Verify everything works before deploying

```bash
# Build production
npm run build

# Start production server
npm start

# Check production build
npm run bot:check
```

### Scenario 3: Continuous Monitoring

**Use Case**: Monitor website continuously during development

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start continuous monitoring
npm run bot:watch:dev
```

**Output**: Bot checks every 60 seconds and reports status

### Scenario 4: CI/CD Integration

**Use Case**: Run as part of your CI/CD pipeline

```bash
# In your GitHub Actions / Jenkins / etc.
npm run build
npm start &
sleep 10  # Wait for server to start
npm run bot:check || exit 1  # Exit with error if checks fail
```

---

## 🚨 Troubleshooting

### Issue 1: Bot Can't Connect to Server

**Error**: "Failed to load homepage - Connection refused"

**Solutions**:
1. Make sure dev server is running: `npm run dev`
2. Check if server is on port 3001: `lsof -i :3001` (Mac/Linux) or `netstat -ano | findstr :3001` (Windows)
3. Verify URL: `NEXT_PUBLIC_APP_URL=http://localhost:3001 npm run bot:check`

### Issue 2: Database Check Fails

**Error**: "Database connection failed"

**Solutions**:
1. Check database is running: `docker ps` (if using Docker)
2. Verify DATABASE_URL in `.env.local`
3. Run migrations: `npx prisma migrate dev`
4. Test database: `npx prisma studio`

### Issue 3: Performance Check Slow

**Warning**: "Load time: 6000ms - Too slow!"

**Solutions**:
1. Check server resources (CPU, RAM)
2. Clear Next.js cache: `rm -rf .next`
3. Rebuild: `npm run build`
4. Optimize images and assets
5. Check for slow database queries

### Issue 4: Auth Endpoints Not Responding

**Error**: "Auth endpoints not responding"

**Solutions**:
1. Verify NEXTAUTH_SECRET is set in `.env.local`
2. Check NEXTAUTH_URL matches your server URL
3. Restart dev server
4. Check auth configuration in `src/lib/auth.ts`

---

## 🔧 Advanced Usage

### Custom Check Interval

```bash
# Check every 30 seconds instead of 60
CHECK_INTERVAL=30000 npm run bot:watch:dev
```

### Run in Headed Mode (See Browser)

Edit `scripts/website-checker-bot.ts`:
```typescript
const CONFIG = {
  headless: false,  // Set to false to see browser
  // ...
};
```

### Add Custom Checks

Add your own checks to the bot:

```typescript
// In scripts/website-checker-bot.ts

async checkCustomFeature(): Promise<CheckResult> {
  const start = Date.now();
  try {
    // Your custom check logic here
    const response = await fetch(`${CONFIG.baseUrl}/api/your-endpoint`);
    
    if (response.ok) {
      return {
        name: "Custom Feature",
        status: "pass",
        duration: Date.now() - start,
        message: "Custom feature working!",
        timestamp: new Date(),
      };
    }
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    return {
      name: "Custom Feature",
      status: "fail",
      duration: Date.now() - start,
      message: "Custom feature failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    };
  }
}

// Then add to runAllChecks():
async runAllChecks(): Promise<HealthCheckReport> {
  // ...existing checks...
  
  checks.push(await this.checkCustomFeature());
  logCheck(checks[checks.length - 1]);
  
  // ...
}
```

---

## 📝 Integration Examples

### GitHub Actions

```yaml
# .github/workflows/health-check.yml
name: Website Health Check

on:
  push:
    branches: [main, develop]
  schedule:
    - cron: '*/30 * * * *'  # Every 30 minutes

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Start server
        run: npm start &
        
      - name: Wait for server
        run: sleep 10
      
      - name: Run health checks
        run: npm run bot:check
        env:
          NEXT_PUBLIC_APP_URL: http://localhost:3000
```

### Docker Compose

```yaml
# docker-compose.monitor.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    
  health-checker:
    build: .
    depends_on:
      - app
    environment:
      - NEXT_PUBLIC_APP_URL=http://app:3000
      - CHECK_INTERVAL=30000
    command: npm run bot:watch
    restart: unless-stopped
```

### Cron Job (Linux/Mac)

```bash
# Add to crontab (crontab -e)

# Run health check every 5 minutes and log results
*/5 * * * * cd /path/to/project && npm run bot:check >> /var/log/website-checks.log 2>&1
```

---

## 📊 Logging and Reporting

### Log Output to File

```bash
# Single check with logging
npm run bot:check:dev > health-check.log 2>&1

# Continuous monitoring with logging
npm run bot:watch:dev >> health-check-continuous.log 2>&1
```

### Parse Logs with grep

```bash
# Find all failures
cat health-check.log | grep "❌"

# Find all warnings
cat health-check.log | grep "⚠️"

# Show only summary
cat health-check.log | grep "Overall Status"
```

---

## 🎓 Best Practices

1. **Run Before Commits**: Always check functionality before pushing code
2. **Monitor During Development**: Use continuous mode while coding
3. **Include in CI/CD**: Automate checks in your pipeline
4. **Set Up Alerts**: Configure notifications for failures
5. **Regular Checks**: Schedule periodic checks even in production
6. **Document Custom Checks**: Add comments for any custom validations

---

## 🆘 Support

### Getting Help

1. Check logs: Look at detailed error messages in output
2. Verbose mode: Set `LOG_LEVEL=debug` for more info
3. Debug mode: Set `headless: false` to see browser actions
4. Check documentation: Review individual check descriptions

### Reporting Issues

If the bot fails consistently:

1. Capture full output: `npm run bot:check > debug.log 2>&1`
2. Check server logs: Look at Next.js dev server output
3. Verify environment: Check `.env.local` settings
4. Test manually: Try accessing endpoints in browser

---

## 📚 Related Documentation

- **Type Fixes**: See `TYPE_FIXES_COMPLETE.md`
- **Mission Summary**: See `PUSH_TO_100_COMPLETE.md`
- **Quick Reference**: See `QUICK_REFERENCE.md`
- **E2E Tests**: See `tests/e2e/` directory
- **Playwright Config**: See `playwright.config.ts`

---

## 🏆 Success Criteria

Your website is **healthy** when:

✅ All 8 checks pass consistently  
✅ Load times are under 3 seconds  
✅ Success rate is 100%  
✅ No errors in console  
✅ All APIs respond correctly  

---

**Status**: ✅ Bot Ready to Use  
**Maintained By**: Divine Agricultural Team  
**Questions?**: Check logs or documentation first!

_"Monitor with agricultural consciousness, validate with divine precision."_ 🌾🤖