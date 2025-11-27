# 🚀 Workflow Monitoring Bot - Quick Start Guide

**Get up and running in 5 minutes!**

---

## ⚡ Prerequisites

```bash
# 1. Make sure your dev server is NOT running
# Stop it if it's running (Ctrl+C)

# 2. Install dependencies (if not already done)
npm install

# 3. Install Playwright browsers
npx playwright install chromium
```

---

## 🎯 Quick Start (3 Steps)

### Step 1: Start Your Application

Open a terminal and start the dev server:

```bash
npm run dev
```

Wait until you see:
```
✓ Ready in 3.2s
○ Local:        http://localhost:3000
```

---

### Step 2: Run Health Check

Open a **NEW terminal** (keep dev server running) and run:

```bash
npm run monitor:health
```

**Expected Output:**
```
🏥 Running Health Check...

╔════════════════════════════════════════════════════════════╗
║ ⚡ DIVINE WORKFLOW EXECUTION INITIATED                     ║
╠════════════════════════════════════════════════════════════╣
║ 🔮 WORKFLOW: System Health Check                          ║
╚════════════════════════════════════════════════════════════╝

   🔄 Executing step: Check API Health...
   ✅ Step passed: Check API Health
   🔄 Executing step: Check Database Health...
   ✅ Step passed: Check Database Health
   🔄 Executing step: Check Homepage Load...
   ✅ Step passed: Check Homepage Load

╔════════════════════════════════════════════════════════════╗
║ ✅ WORKFLOW EXECUTION COMPLETE                             ║
╠════════════════════════════════════════════════════════════╣
║ 📊 STATUS: PASSED                                          ║
║ ⏱️  DURATION: 2.45s                                        ║
║ ✅ PASSED: 3/3                                             ║
╚════════════════════════════════════════════════════════════╝

✅ Health Check PASSED
   Duration: 2.45s
   Steps: 3/3
```

✅ **Success!** Your monitoring bot is working!

---

### Step 3: List Available Workflows

See what workflows you can run:

```bash
npm run monitor:list
```

**Output:**
```
📋 Available Workflows

✅ User Registration Workflow
   ID: user-registration
   Type: USER_REGISTRATION
   Priority: CRITICAL
   Timeout: 120s
   Retries: 3
   Schedule: Every 60 minutes
   Tags: authentication, critical, user-journey

✅ User Login Workflow
   ID: user-login
   Type: USER_LOGIN
   Priority: CRITICAL
   Timeout: 60s
   Retries: 3
   Schedule: Every 30 minutes
   Tags: authentication, critical, user-journey

✅ Farm Creation Workflow
   ID: farm-creation
   Type: FARM_CREATION
   Priority: HIGH
   Timeout: 180s
   Retries: 2
   Schedule: Every 120 minutes
   Tags: farm, core-feature, user-journey

... (more workflows)

Total: 6 workflow(s)
```

---

## 🎓 Next Steps

### Run All Critical Workflows

```bash
npm run monitor:critical
```

This will test:
- ✅ User Registration
- ✅ User Login
- ✅ Order Placement
- ✅ System Health

---

### Run ALL Workflows

```bash
npm run monitor:all
```

This runs ALL enabled workflows and generates a comprehensive report.

---

### Run a Specific Workflow

```bash
# Test user registration
npm run monitor:workflow -- user-registration

# Test farm creation
npm run monitor:workflow -- farm-creation

# Test product listing
npm run monitor:workflow -- product-listing
```

---

### View Reports

```bash
npm run monitor:reports
```

Reports are saved in `./monitoring-reports/`:
- 📄 `report-{id}.json` - Machine-readable JSON
- 🌐 `report-{id}.html` - Beautiful HTML report (open in browser!)
- 📝 `report-{id}.md` - Markdown report

---

### Start Continuous Monitoring

```bash
npm run monitor:start
```

This will:
- ⏰ Run workflows on schedule
- 🏥 Health check every 5 minutes
- 🔐 Login test every 30 minutes
- 🌾 Farm tests every 2 hours
- 📊 Generate reports automatically

**Press Ctrl+C to stop**

---

## 📊 Understanding the Output

### Status Icons

| Icon | Meaning |
|------|---------|
| ✅ | Test passed successfully |
| ❌ | Test failed |
| ⚠️ | Test passed with warnings |
| ⏭️ | Test was skipped |
| 🔄 | Test is running |

### Workflow Status

```
╔════════════════════════════════════════════════════════════╗
║ ✅ WORKFLOW EXECUTION COMPLETE                             ║
╠════════════════════════════════════════════════════════════╣
║ 📊 STATUS: PASSED          <-- Overall status             ║
║ ⏱️  DURATION: 2.45s        <-- How long it took           ║
║ ✅ PASSED: 3/3             <-- Steps passed/total         ║
║ ❌ FAILED: 0/3             <-- Steps failed               ║
║ 🚀 PERFORMANCE: 95/100     <-- Performance score          ║
║ 🌾 SEASONAL: 92%           <-- Agricultural alignment     ║
╚════════════════════════════════════════════════════════════╝
```

---

## 🔧 Troubleshooting

### ❌ "Browser not found"

```bash
# Install Playwright browsers
npx playwright install chromium
```

### ❌ "Connection refused"

```bash
# Make sure dev server is running
npm run dev

# In another terminal, run monitor
npm run monitor:health
```

### ❌ "Workflow not found"

```bash
# List all available workflows
npm run monitor:list

# Use exact workflow ID
npm run monitor:workflow -- user-login
```

### ❌ Tests are slow

```bash
# Run workflows in parallel
npm run monitor:all -- --parallel --concurrency 5
```

---

## 🎯 Common Use Cases

### Before Deploying

```bash
# Run critical checks
npm run monitor:critical

# If all pass, deploy!
git push origin main
```

### After Deploying

```bash
# Test production
npm run monitor:health -- --url https://farmersmarket.com

# Run all tests on production
npm run monitor:all -- --url https://farmersmarket.com
```

### Daily Health Check

```bash
# Quick health check
npm run monitor:health

# If healthy, continue work
# If failed, investigate
```

### Continuous Monitoring

```bash
# Start bot with scheduler
npm run monitor:start

# Let it run in background
# Check reports periodically
npm run monitor:reports
```

---

## 📱 Notifications (Optional)

### Setup Slack Notifications

```bash
# 1. Create Slack webhook: https://api.slack.com/messaging/webhooks

# 2. Set environment variable
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# 3. Run with notifications
npm run monitor:all -- --notify
```

### Setup Discord Notifications

```bash
# 1. Create Discord webhook in your server settings

# 2. Set environment variable
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR/WEBHOOK"

# 3. Run with notifications
npm run monitor:critical -- --notify
```

---

## 📈 Progressive Usage

### Week 1: Learn the Basics
```bash
# Day 1: Health checks
npm run monitor:health

# Day 2: List workflows
npm run monitor:list

# Day 3: Run specific workflow
npm run monitor:workflow -- user-login

# Day 4: Run critical workflows
npm run monitor:critical

# Day 5: View reports
npm run monitor:reports
```

### Week 2: Advanced Usage
```bash
# Day 1: Run all workflows
npm run monitor:all

# Day 2: Setup notifications
export SLACK_WEBHOOK_URL="..."
npm run monitor:critical -- --notify

# Day 3: Start scheduled monitoring
npm run monitor:start

# Day 4: Review trends in reports
npm run monitor:reports -- --limit 20

# Day 5: Customize workflows (see main docs)
```

---

## 🎓 Commands Cheat Sheet

```bash
# Health & Status
npm run monitor:health           # Quick health check
npm run monitor:list            # List all workflows
npm run monitor:reports         # View recent reports

# Run Workflows
npm run monitor:critical        # Run critical workflows only
npm run monitor:all            # Run all workflows
npm run monitor:workflow -- <id> # Run specific workflow

# Continuous Monitoring
npm run monitor:start           # Start bot with scheduler

# With Options
npm run monitor:all -- --parallel --concurrency 5
npm run monitor:critical -- --url http://staging.example.com
npm run monitor:start -- --notify
npm run monitor:reports -- --limit 10
```

---

## 📚 Learn More

- 📖 [Full Documentation](./WORKFLOW_MONITORING_BOT.md)
- 🎨 [Custom Workflows Guide](./WORKFLOW_MONITORING_BOT.md#custom-workflows)
- 🔔 [Notifications Setup](./WORKFLOW_MONITORING_BOT.md#notifications)
- 🤖 [CI/CD Integration](./WORKFLOW_MONITORING_BOT.md#cicd-integration)

---

## ✅ Success Checklist

- [x] Installed Playwright browsers
- [x] Dev server is running
- [x] Health check passed
- [x] Listed available workflows
- [x] Ran critical workflows
- [x] Viewed a report
- [ ] Setup notifications (optional)
- [ ] Started continuous monitoring (optional)
- [ ] Created custom workflow (optional)

---

## 🎉 You're Ready!

You now have a powerful monitoring bot watching over your application!

**Next Steps:**
1. ✅ Keep dev server running
2. 🔄 Run `npm run monitor:critical` before commits
3. 📊 Review reports after changes
4. ⏰ Setup `npm run monitor:start` for continuous monitoring

**Need Help?**
- 📖 Read [Full Documentation](./WORKFLOW_MONITORING_BOT.md)
- 💬 Ask in #monitoring-bot Slack channel
- 🐛 Report issues on GitHub

---

_"Monitor with divine awareness, respond with agricultural wisdom!"_ 🌾⚡

**Version:** 1.0.0  
**Last Updated:** January 2025