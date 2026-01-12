# 🚀 Website Inspection Bot - Quick Start Guide

**Last Updated:** January 12, 2026  
**Time to Read:** 2 minutes

---

## 🎯 What Is This?

An automated bot that checks **ALL pages** of the Farmers Market Platform for:
- ❌ Errors and missing pages
- ⚠️ Warnings and issues
- 🔗 Broken links
- 📊 Performance problems
- ♿ Accessibility issues
- 🔍 SEO problems

**Coverage:** 39+ critical pages across Customer, Farmer, and Admin portals

---

## ⚡ Quick Start (3 Steps)

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Run Inspection (in another terminal)
```bash
npm run inspect:website:quick
```

### 3. View Report
```bash
# Open the HTML report (auto-opens in browser on Windows)
start inspection-reports/inspection-report-*.html

# Or on Mac/Linux
open inspection-reports/inspection-report-*.html
```

---

## 📋 Common Commands

### Full Inspections
```bash
# Inspect everything (takes ~5 minutes)
npm run inspect:website

# Quick scan - critical pages only (~2 minutes)
npm run inspect:website:quick

# All portals explicitly
npm run inspect:all
```

### Portal-Specific
```bash
npm run inspect:public      # Public pages (homepage, marketplace, etc.)
npm run inspect:customer    # Customer portal (dashboard, cart, orders)
npm run inspect:farmer      # Farmer portal (products, analytics)
npm run inspect:admin       # Admin portal (users, farms, reports)
```

### Help
```bash
npm run inspect:website -- --help
```

---

## 📊 What Gets Checked?

### ✅ 39 Critical Pages

**Public (9 pages)**
- Homepage, About, Contact, FAQ, Marketplace, Products, Farms, etc.

**Authentication (5 pages)**
- Login, Register, Farmer Registration, Signup, Password Reset

**Customer Portal (8 pages)**
- Dashboard, Marketplace, Cart, Checkout, Orders, Favorites, Settings

**Farmer Portal (7 pages)**
- Dashboard, Products, Orders, Analytics, Finances, Recommendations

**Admin Portal (7 pages)**
- Dashboard, Users, Farms, Products, Orders, Reports, Settings

**Legal + API (3 pages)**
- Terms, Privacy, API Docs

---

## 🔍 What Gets Reported?

### 1. Page Status
- ✅ **SUCCESS** - Page loaded correctly
- ⚠️ **WARNING** - Issues detected, review recommended
- ❌ **ERROR** - Page failed to load, fix immediately
- 🔍 **MISSING** - Page not found (404), create or fix route

### 2. Detailed Checks
- HTTP status codes
- Load time (performance)
- Missing elements (header, footer, etc.)
- Broken links
- SEO issues (title, meta description, H1)
- Accessibility problems (labels, contrast)
- Console errors
- Page screenshots

### 3. Report Types Generated
- **Console output** - Real-time progress
- **JSON report** - Machine-readable data
- **HTML report** - Beautiful dashboard (recommended!)
- **Screenshots** - Visual documentation

---

## 📁 Report Locations

```
inspection-reports/
├── inspection-report-2026-01-12T10-30-00.json
├── inspection-report-2026-01-12T10-30-00.html  ← Open this!
└── screenshots/
    ├── public--home.png
    ├── customer--dashboard.png
    ├── farmer--products.png
    └── admin--users.png
```

---

## 🔧 Setup (First Time Only)

### 1. Ensure Test Users Exist

Create test users in your database or use existing ones:

```env
# .env.test
TEST_CUSTOMER_EMAIL=customer@test.com
TEST_CUSTOMER_PASSWORD=Test123!@#

TEST_FARMER_EMAIL=farmer@test.com
TEST_FARMER_PASSWORD=Test123!@#

TEST_ADMIN_EMAIL=admin@test.com
TEST_ADMIN_PASSWORD=Test123!@#
```

### 2. Install Dependencies (if needed)
```bash
npm install
npx playwright install
```

---

## 💡 Common Use Cases

### Before Deploying
```bash
npm run quality              # Code quality checks
npm run inspect:website      # Full inspection
npm run test:e2e            # E2E tests
# ✅ All green? Deploy!
```

### After Making Changes
```bash
# Updated customer features?
npm run inspect:customer

# Updated farmer dashboard?
npm run inspect:farmer

# Updated admin panel?
npm run inspect:admin
```

### Daily Development
```bash
# Quick smoke test
npm run inspect:website:quick

# Should take ~2 minutes
```

### Debugging Specific Issues
```bash
# Check just public pages
npm run inspect:public

# Full scan with details
npm run inspect:website
```

---

## 🚨 Troubleshooting

### "Connection refused" error
```bash
# Make sure dev server is running first!
npm run dev
# Then in another terminal:
npm run inspect:website
```

### "Authentication failed"
```bash
# Check test users exist in database
npm run db:studio
# Look for test users in User table
```

### "Page timeout"
```bash
# Increase timeout (edit script config)
# Or check if page has infinite loading
```

### Screenshots not saving
```bash
# Reinstall Playwright
npx playwright install
```

---

## 📈 Understanding Results

### Summary Card
```
Total Pages:     39
✅ Successful:   35  (89.7%)
⚠️  Warnings:     2  (Review recommended)
❌ Errors:       2  (Fix immediately!)
🔍 Missing:      0  (No 404s)
```

### Priority Levels

**🔴 CRITICAL (Fix Now!)**
- Missing pages (404)
- Authentication broken
- Checkout not working
- Database errors

**🟡 HIGH (Fix Soon)**
- Slow page loads (>3s)
- Broken critical links
- Missing page titles
- Major accessibility issues

**🟢 MEDIUM (Improve)**
- SEO issues
- Minor broken links
- Missing alt text
- Form label issues

**⚪ LOW (Nice to Have)**
- Performance optimizations
- Minor accessibility tweaks

---

## 🎓 Pro Tips

### 1. Run Before Every Commit
```bash
# Add to pre-commit hook
npm run inspect:website:quick
```

### 2. Compare Reports
```bash
# Save baseline
cp inspection-reports/inspection-report-*.html baseline.html

# After changes, compare
npm run inspect:website
# Check differences
```

### 3. Focus on Critical Pages
Quick mode only checks pages marked as critical:
- Authentication flows
- Main dashboards
- Checkout process

### 4. Use Portal-Specific Scans
Faster iteration when working on one portal:
```bash
# Working on farmer features? Only check farmer portal
npm run inspect:farmer
```

### 5. Automate in CI/CD
Add to GitHub Actions, GitLab CI, or Jenkins:
```yaml
- run: npm run inspect:website:quick
- run: if grep -q "CRITICAL" *.json; then exit 1; fi
```

---

## 📞 Need Help?

1. **Check full documentation:** `docs/WEBSITE_INSPECTION_BOT.md`
2. **Review examples:** See "Examples" section in main docs
3. **Check troubleshooting:** See "Troubleshooting" section above
4. **Ask the team:** Post in #engineering channel

---

## ✅ Quick Reference Card

| Task | Command |
|------|---------|
| **Full inspection** | `npm run inspect:website` |
| **Quick scan** | `npm run inspect:website:quick` |
| **Public pages** | `npm run inspect:public` |
| **Customer portal** | `npm run inspect:customer` |
| **Farmer portal** | `npm run inspect:farmer` |
| **Admin portal** | `npm run inspect:admin` |
| **Help** | `npm run inspect:website -- --help` |

---

## 🎯 Success Checklist

Before deploying, ensure:
- [ ] All tests passing (`npm run quality`)
- [ ] Full inspection clean (`npm run inspect:website`)
- [ ] No critical issues in report
- [ ] Load times acceptable (<3s)
- [ ] No broken links
- [ ] No missing pages
- [ ] All portals functional

---

## 🚀 Next Steps

1. **Run your first inspection**
   ```bash
   npm run inspect:website:quick
   ```

2. **Open the HTML report**
   ```bash
   start inspection-reports/inspection-report-*.html
   ```

3. **Fix any issues found**

4. **Run again to verify fixes**
   ```bash
   npm run inspect:website:quick
   ```

5. **Celebrate! 🎉**

---

**Remember:** This bot speeds up production by catching issues before they reach users!

**Time Saved:** ~2 hours of manual testing per week  
**Bugs Caught:** Issues before they go live  
**Confidence:** Deploy with assurance

---

*For detailed documentation, see: `docs/WEBSITE_INSPECTION_BOT.md`*  
*For visual sitemap, see: `WEBSITE_SITEMAP_VISUAL.md`*  
*For visual representation, see: `WEBSITE_VISUAL_REPRESENTATION.md`*