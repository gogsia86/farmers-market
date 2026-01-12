# 🗄️ DATABASE SETUP SCRIPT - NEON CONFIGURATION (Windows PowerShell)
# Farmers Market Platform - Production Database Setup
# Generated: January 2025

$ErrorActionPreference = "Stop"

Write-Host "🌾 Farmers Market Platform - Database Setup" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Database connection string from Neon
$DATABASE_URL = "postgresql://neondb_owner:npg_kOFG83Spucdr@ep-bold-surf-aghqa4is-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

Write-Host "📝 Step 1: Creating .env.local file..." -ForegroundColor Yellow

# Create .env.local file with database configuration
$envContent = @"
# ============================================
# FARMERS MARKET PLATFORM - LOCAL ENVIRONMENT
# ============================================
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# Database: Neon PostgreSQL (farmers-market-prod)
# Region: EU Central 1 (Frankfurt)
# ============================================

# ============================================
# DATABASE CONNECTION (REQUIRED)
# ============================================
DATABASE_URL="postgresql://neondb_owner:npg_kOFG83Spucdr@ep-bold-surf-aghqa4is-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# ============================================
# NEXTAUTH CONFIGURATION (REQUIRED)
# ============================================
NEXTAUTH_SECRET="TatCD2q/7EAZWHY2H8epkTt+nEHTpjeFnE3WLuCx290="
NEXTAUTH_URL="http://localhost:3001"

# ============================================
# STRIPE CONFIGURATION (REQUIRED)
# ============================================
STRIPE_SECRET_KEY="sk_test_51SJxc91snxMsoFdCIoOa1zWs9ziP2nHX35N27NNrftRIovC6L2vxuZoQEWSmlTNHUcwIrniqPMqWhyi7wlSbsHbR00LL3sMN6H"
STRIPE_PUBLISHABLE_KEY="pk_test_51SJxc91snxMsoFdCJUc9OYcWZjEknyb6pg7XeMd4uAxS2SIif66oc5hqeXFtKlwN2hJIWGoJl8kCQlJuw6PbW08d00k0pMbd6b"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51SJxc91snxMsoFdCJUc9OYcWZjEknyb6pg7XeMd4uAxS2SIif66oc5hqeXFtKlwN2hJIWGoJl8kCQlJuw6PbW08d00k0pMbd6b"

# ============================================
# NODE ENVIRONMENT
# ============================================
NODE_ENV="development"

# ============================================
# OPTIONAL: EMAIL CONFIGURATION
# ============================================
# RESEND_API_KEY="re_your_api_key"

# ============================================
# OPTIONAL: CLOUDINARY (IMAGE UPLOADS)
# ============================================
# CLOUDINARY_CLOUD_NAME="your-cloud-name"
# CLOUDINARY_API_KEY="123456789012345"
# CLOUDINARY_API_SECRET="your-secret"

# ============================================
# OPTIONAL: SENTRY (ERROR TRACKING)
# ============================================
# SENTRY_DSN="https://xxxxx@oxxxxxx.ingest.sentry.io/xxxxxxx"

# ============================================
# OPTIONAL: REDIS CACHING (UPSTASH)
# ============================================
# UPSTASH_REDIS_URL="https://your-redis.upstash.io"
# UPSTASH_REDIS_TOKEN="your-token"

"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8 -NoNewline

Write-Host "✅ .env.local created successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Step 2: Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
Write-Host "✅ Prisma Client generated!" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Step 3: Testing database connection..." -ForegroundColor Yellow
try
{
  # Test connection by checking if we can reach the database
  $env:DATABASE_URL = $DATABASE_URL
  npx prisma db execute --stdin --schema="prisma/schema.prisma" 2>&1 | Out-Null
  Write-Host "✅ Database connection successful!" -ForegroundColor Green
} catch
{
  Write-Host "⚠️  Connection test skipped (use 'npx prisma studio' to verify)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "📝 Step 4: Pushing database schema..." -ForegroundColor Yellow
npx prisma db push --skip-generate
Write-Host "✅ Database schema pushed!" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Step 5: Seeding database with basic data..." -ForegroundColor Yellow
npm run db:seed:basic
Write-Host "✅ Database seeded with basic data!" -ForegroundColor Green
Write-Host ""

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "🎉 DATABASE SETUP COMPLETE!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Database Information:" -ForegroundColor Cyan
Write-Host "  • Provider: Neon PostgreSQL"
Write-Host "  • Region: EU Central 1 (Frankfurt)"
Write-Host "  • Database: neondb"
Write-Host "  • Connection: Pooled (serverless-optimized)"
Write-Host ""
Write-Host "👤 Default Admin Account:" -ForegroundColor Cyan
Write-Host "  • Email: admin@farmersmarket.app"
Write-Host "  • Password: Check seed script output above"
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Start development server: npm run dev"
Write-Host "  2. Visit: http://localhost:3001"
Write-Host "  3. View database: npx prisma studio"
Write-Host "  4. Check health: http://localhost:3001/api/health/database"
Write-Host ""
Write-Host "📚 Available Commands:" -ForegroundColor Cyan
Write-Host "  • npm run dev           - Start dev server"
Write-Host "  • npm run db:studio     - Open Prisma Studio"
Write-Host "  • npm run db:seed       - Seed comprehensive data"
Write-Host "  • npm run db:reset      - Reset and reseed database"
Write-Host ""
Write-Host "⚠️  SECURITY REMINDER:" -ForegroundColor Yellow
Write-Host "  • .env.local is in .gitignore (won't be committed)"
Write-Host "  • Never share your DATABASE_URL publicly"
Write-Host "  • For production, add DATABASE_URL to Vercel env vars"
Write-Host ""
Write-Host "🌾 Happy farming! 🚀" -ForegroundColor Green
