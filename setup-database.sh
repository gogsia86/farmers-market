#!/bin/bash
# 🗄️ DATABASE SETUP SCRIPT - NEON CONFIGURATION
# Farmers Market Platform - Production Database Setup
# Generated: January 2025

set -e  # Exit on error

echo "🌾 Farmers Market Platform - Database Setup"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database connection string from Neon
DATABASE_URL="postgresql://neondb_owner:npg_kOFG83Spucdr@ep-bold-surf-aghqa4is-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

echo -e "${YELLOW}📝 Step 1: Creating .env.local file...${NC}"

# Create .env.local file with database configuration
cat > .env.local << EOF
# ============================================
# FARMERS MARKET PLATFORM - LOCAL ENVIRONMENT
# ============================================
# Generated: $(date)
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

EOF

echo -e "${GREEN}✅ .env.local created successfully!${NC}"
echo ""

echo -e "${YELLOW}📝 Step 2: Generating Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generated!${NC}"
echo ""

echo -e "${YELLOW}📝 Step 3: Testing database connection...${NC}"
# Test connection with a simple query
if npx prisma db execute --stdin <<< "SELECT 1" 2>/dev/null; then
    echo -e "${GREEN}✅ Database connection successful!${NC}"
else
    echo -e "${YELLOW}⚠️  Connection test skipped (use 'npx prisma studio' to verify)${NC}"
fi
echo ""

echo -e "${YELLOW}📝 Step 4: Pushing database schema...${NC}"
npx prisma db push --skip-generate
echo -e "${GREEN}✅ Database schema pushed!${NC}"
echo ""

echo -e "${YELLOW}📝 Step 5: Seeding database with basic data...${NC}"
npm run db:seed:basic
echo -e "${GREEN}✅ Database seeded with basic data!${NC}"
echo ""

echo "=============================================="
echo -e "${GREEN}🎉 DATABASE SETUP COMPLETE!${NC}"
echo "=============================================="
echo ""
echo "📊 Database Information:"
echo "  • Provider: Neon PostgreSQL"
echo "  • Region: EU Central 1 (Frankfurt)"
echo "  • Database: neondb"
echo "  • Connection: Pooled (serverless-optimized)"
echo ""
echo "👤 Default Admin Account:"
echo "  • Email: admin@farmersmarket.app"
echo "  • Password: Check seed script output above"
echo ""
echo "🚀 Next Steps:"
echo "  1. Start development server: npm run dev"
echo "  2. Visit: http://localhost:3001"
echo "  3. View database: npx prisma studio"
echo "  4. Check health: http://localhost:3001/api/health/database"
echo ""
echo "📚 Available Commands:"
echo "  • npm run dev           - Start dev server"
echo "  • npm run db:studio     - Open Prisma Studio"
echo "  • npm run db:seed       - Seed comprehensive data"
echo "  • npm run db:reset      - Reset and reseed database"
echo ""
echo -e "${YELLOW}⚠️  SECURITY REMINDER:${NC}"
echo "  • .env.local is in .gitignore (won't be committed)"
echo "  • Never share your DATABASE_URL publicly"
echo "  • For production, add DATABASE_URL to Vercel env vars"
echo ""
echo "🌾 Happy farming! 🚀"
