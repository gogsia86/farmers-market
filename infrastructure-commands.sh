#!/bin/bash
# 🚀 Farmers Market Platform - Infrastructure Setup Commands
# Quick copy-paste commands for infrastructure completion
# Last Updated: December 20, 2024

# ============================================================================
# CURRENT STATUS: 70% Complete
# REMAINING: Redis + Sentry + UptimeRobot + Validation
# TIME: ~45 minutes
# ============================================================================

echo "🌾 Farmers Market Platform - Infrastructure Setup"
echo "=================================================="
echo ""

# ============================================================================
# STEP 1: REDIS CACHE SETUP (10 minutes)
# ============================================================================

echo "🔴 STEP 1: Redis Cache Setup"
echo ""
echo "1. Open Upstash Console:"
echo "   https://console.upstash.com"
echo ""
echo "2. Create Database with these settings:"
echo "   Name: farmers-market-prod"
echo "   Type: Regional"
echo "   Region: us-east-1"
echo "   Eviction: allkeys-lru"
echo "   TLS: Enabled"
echo ""
echo "3. Copy the REDIS_URL from dashboard"
echo ""
echo "4. Add to Vercel (run these commands):"
echo ""
echo "cd \"M:\Repo\Farmers Market Platform web and app\""
echo "npx vercel env add REDIS_URL production"
echo "# Paste your Redis URL when prompted"
echo ""
echo "# Verify Redis variable added:"
echo "npx vercel env ls production | grep REDIS"
echo ""
echo "✅ Redis setup complete!"
echo ""
read -p "Press Enter after completing Redis setup..."

# ============================================================================
# STEP 2: SENTRY ERROR TRACKING (15 minutes)
# ============================================================================

echo ""
echo "📊 STEP 2: Sentry Error Tracking"
echo ""
echo "1. Create Sentry account:"
echo "   https://sentry.io/signup/"
echo ""
echo "2. Create project:"
echo "   Platform: Next.js"
echo "   Name: farmers-market-prod"
echo "   Alert: On every new issue"
echo ""
echo "3. Copy your DSN (looks like):"
echo "   https://abc123@o123456.ingest.sentry.io/789012"
echo ""
echo "4. Create Auth Token:"
echo "   Settings > Account > API > Auth Tokens"
echo "   Name: vercel-deployment-farmers-market"
echo "   Scopes: project:releases, org:read, event:read"
echo ""
echo "5. Add to Vercel (run these commands):"
echo ""
echo "cd \"M:\Repo\Farmers Market Platform web and app\""
echo ""
echo "# Add Sentry DSN"
echo "npx vercel env add SENTRY_DSN production"
echo "# Paste DSN when prompted"
echo ""
echo "# Add public Sentry DSN (same value)"
echo "npx vercel env add NEXT_PUBLIC_SENTRY_DSN production"
echo "# Paste DSN again"
echo ""
echo "# Add Sentry auth token"
echo "npx vercel env add SENTRY_AUTH_TOKEN production"
echo "# Paste token when prompted"
echo ""
echo "# Verify all Sentry variables added:"
echo "npx vercel env ls production | grep SENTRY"
echo ""
echo "✅ Sentry setup complete!"
echo ""
read -p "Press Enter after completing Sentry setup..."

# ============================================================================
# STEP 3: UPTIMEROBOT MONITORING (10 minutes)
# ============================================================================

echo ""
echo "⏰ STEP 3: UptimeRobot Monitoring"
echo ""
echo "1. Create UptimeRobot account:"
echo "   https://uptimerobot.com/signUp"
echo ""
echo "2. Create 4 monitors with these settings:"
echo ""
echo "Monitor 1 - Homepage:"
echo "   Type: HTTP(s)"
echo "   Name: Farmers Market - Homepage"
echo "   URL: https://farmers-market-ethpmtbpq-gogsias-projects.vercel.app"
echo "   Interval: 5 minutes"
echo ""
echo "Monitor 2 - API Health:"
echo "   Type: HTTP(s)"
echo "   Name: Farmers Market - API Health"
echo "   URL: https://farmers-market-ethpmtbpq-gogsias-projects.vercel.app/api/health"
echo "   Interval: 5 minutes"
echo "   Keyword: ok"
echo ""
echo "Monitor 3 - Farms API:"
echo "   Type: HTTP(s)"
echo "   Name: Farmers Market - Farms API"
echo "   URL: https://farmers-market-ethpmtbpq-gogsias-projects.vercel.app/api/farms"
echo "   Interval: 5 minutes"
echo ""
echo "Monitor 4 - Database Health:"
echo "   Type: HTTP(s)"
echo "   Name: Farmers Market - Database Health"
echo "   URL: https://farmers-market-ethpmtbpq-gogsias-projects.vercel.app/api/health/db"
echo "   Interval: 5 minutes"
echo ""
echo "3. Configure alert emails in settings"
echo ""
echo "✅ UptimeRobot setup complete!"
echo ""
read -p "Press Enter after completing UptimeRobot setup..."

# ============================================================================
# STEP 4: FINAL VALIDATION (10 minutes)
# ============================================================================

echo ""
echo "✅ STEP 4: Final Validation & Testing"
echo ""
echo "1. Verify all environment variables (should be 14):"
echo ""

cd "M:\Repo\Farmers Market Platform web and app"

echo "npx vercel env ls production"
npx vercel env ls production

echo ""
echo "Expected variables:"
echo "  1. DATABASE_URL"
echo "  2. NEXTAUTH_SECRET"
echo "  3. NEXTAUTH_URL"
echo "  4. STRIPE_SECRET_KEY"
echo "  5. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
echo "  6. STRIPE_WEBHOOK_SECRET"
echo "  7. AGRICULTURAL_CONSCIOUSNESS"
echo "  8. DIVINE_PATTERNS"
echo "  9. NODE_ENV"
echo "  10. NEXT_PUBLIC_APP_URL"
echo "  11. REDIS_URL"
echo "  12. SENTRY_DSN"
echo "  13. NEXT_PUBLIC_SENTRY_DSN"
echo "  14. SENTRY_AUTH_TOKEN"
echo ""

read -p "Are all 14 variables present? (Press Enter to continue or Ctrl+C to fix)"

echo ""
echo "2. Deploy with new variables:"
echo ""

npx vercel --prod

echo ""
echo "Deployment started! This will take 3-5 minutes..."
echo ""

read -p "Wait for deployment to complete, then press Enter..."

echo ""
echo "3. Test production endpoints:"
echo ""

echo "Testing homepage..."
curl -I https://farmers-market-ethpmtbpq-gogsias-projects.vercel.app

echo ""
echo "Testing health endpoint..."
curl https://farmers-market-ethpmtbpq-gogsias-projects.vercel.app/api/health

echo ""
echo "Testing farms API..."
curl https://farmers-market-ethpmtbpq-gogsias-projects.vercel.app/api/farms

echo ""
echo "4. Check monitoring dashboards:"
echo ""
echo "Sentry: https://sentry.io"
echo "UptimeRobot: https://uptimerobot.com/dashboard"
echo "Upstash: https://console.upstash.com"
echo ""

read -p "Verify all dashboards show green status, then press Enter..."

# ============================================================================
# COMPLETION
# ============================================================================

echo ""
echo "🎉 ============================================="
echo "🎉 INFRASTRUCTURE SETUP COMPLETE!"
echo "🎉 ============================================="
echo ""
echo "✅ Status: Day 1-2 Infrastructure - 100% Complete"
echo ""
echo "What's been configured:"
echo "  ✅ Production Vercel deployment"
echo "  ✅ 14 environment variables"
echo "  ✅ Redis cache (Upstash)"
echo "  ✅ Error tracking (Sentry)"
echo "  ✅ Uptime monitoring (UptimeRobot)"
echo "  ✅ Agricultural consciousness activated"
echo ""
echo "Next steps:"
echo "  1. Update PHASE_7_PROGRESS_TRACKER.md"
echo "  2. Mark Day 1-2 tasks as complete [x]"
echo "  3. Begin Day 3-4: Final QA & Testing"
echo ""
echo "🌾 Agricultural consciousness: FULLY OPERATIONAL"
echo "⚡ Divine patterns: ACTIVE"
echo "🚀 Platform status: PRODUCTION READY"
echo ""
echo "Great work! 🎉"
echo ""

# ============================================================================
# QUICK VERIFICATION COMMANDS
# ============================================================================

cat << 'EOF'

QUICK VERIFICATION COMMANDS:
============================

# Check all environment variables:
npx vercel env ls production

# Check deployment status:
npx vercel ls

# Check logs for errors:
npx vercel logs --follow

# Test endpoints:
curl https://farmers-market-ethpmtbpq-gogsias-projects.vercel.app
curl https://farmers-market-ethpmtbpq-gogsias-projects.vercel.app/api/health
curl https://farmers-market-ethpmtbpq-gogsias-projects.vercel.app/api/farms

# Monitor services:
# Sentry:      https://sentry.io
# UptimeRobot: https://uptimerobot.com/dashboard
# Upstash:     https://console.upstash.com
# Vercel:      https://vercel.com/dashboard

EOF

echo ""
echo "Done! 🌾⚡"
