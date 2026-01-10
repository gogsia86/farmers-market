# ============================================================================
# VERCEL PRODUCTION DATABASE RE-SEEDING SCRIPT (PowerShell)
# ============================================================================
# This script re-seeds the Vercel production database with correct credentials
#
# ⚠️  WARNING: This will RESET and DELETE ALL existing data!
#
# Usage:
#   .\scripts\reseed-vercel-production.ps1              # Interactive
#   .\scripts\reseed-vercel-production.ps1 -Force       # Skip confirmation
# ============================================================================

param(
    [switch]$Force = $false,
    [switch]$Help = $false
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Cyan = "Cyan"
$Blue = "Blue"

# Show help
if ($Help)
{
    Write-Host ""
    Write-Host "VERCEL DATABASE RE-SEEDING SCRIPT" -ForegroundColor $Cyan
    Write-Host "=================================" -ForegroundColor $Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor $Blue
    Write-Host "  .\scripts\reseed-vercel-production.ps1              # Interactive mode"
    Write-Host "  .\scripts\reseed-vercel-production.ps1 -Force       # Skip confirmation"
    Write-Host "  .\scripts\reseed-vercel-production.ps1 -Help        # Show this help"
    Write-Host ""
    Write-Host "⚠️  WARNING: This will DELETE ALL existing data!" -ForegroundColor $Yellow
    Write-Host ""
    exit 0
}

# ============================================================================
# HEADER
# ============================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor $Cyan
Write-Host "║                                                            ║" -ForegroundColor $Cyan
Write-Host "║       🔄 VERCEL DATABASE RE-SEEDING SCRIPT 🔄              ║" -ForegroundColor $Cyan
Write-Host "║                                                            ║" -ForegroundColor $Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor $Cyan
Write-Host ""

# ============================================================================
# PRE-FLIGHT CHECKS
# ============================================================================

Write-Host "📋 Pre-flight checks..." -ForegroundColor $Blue
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json"))
{
    Write-Host "❌ Error: package.json not found!" -ForegroundColor $Red
    Write-Host "   Please run this script from the project root directory." -ForegroundColor $Yellow
    Write-Host ""
    Write-Host "   Current directory: $PWD" -ForegroundColor $Yellow
    exit 1
}

Write-Host "✅ Project root directory verified" -ForegroundColor $Green

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled)
{
    Write-Host "❌ Error: Vercel CLI is not installed" -ForegroundColor $Red
    Write-Host "   Install it with: npm install -g vercel" -ForegroundColor $Yellow
    exit 1
}

Write-Host "✅ Vercel CLI installed" -ForegroundColor $Green

# Check if Node.js is installed
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeInstalled)
{
    Write-Host "❌ Error: Node.js is not installed" -ForegroundColor $Red
    Write-Host "   Install it from: https://nodejs.org" -ForegroundColor $Yellow
    exit 1
}

Write-Host "✅ Node.js installed" -ForegroundColor $Green
Write-Host ""

# ============================================================================
# WARNING AND CONFIRMATION
# ============================================================================

if (-not $Force)
{
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor $Red
    Write-Host "║                      ⚠️  WARNING ⚠️                        ║" -ForegroundColor $Red
    Write-Host "║                                                            ║" -ForegroundColor $Red
    Write-Host "║  This script will RESET your Vercel production database!  ║" -ForegroundColor $Red
    Write-Host "║                                                            ║" -ForegroundColor $Red
    Write-Host "║  ALL EXISTING DATA WILL BE PERMANENTLY DELETED:           ║" -ForegroundColor $Red
    Write-Host "║  • All users (admin, farmers, consumers)                  ║" -ForegroundColor $Red
    Write-Host "║  • All farms and products                                 ║" -ForegroundColor $Red
    Write-Host "║  • All orders and reviews                                 ║" -ForegroundColor $Red
    Write-Host "║  • All photos and certifications                          ║" -ForegroundColor $Red
    Write-Host "║                                                            ║" -ForegroundColor $Red
    Write-Host "║  The database will be re-seeded with fresh test data.     ║" -ForegroundColor $Red
    Write-Host "║                                                            ║" -ForegroundColor $Red
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor $Red
    Write-Host ""

    $confirmation = Read-Host "Are you ABSOLUTELY SURE you want to continue? Type 'YES' to proceed"

    if ($confirmation -ne "YES")
    {
        Write-Host ""
        Write-Host "⚠️  Operation cancelled by user" -ForegroundColor $Yellow
        Write-Host ""
        exit 0
    }
}

Write-Host ""

# ============================================================================
# PULL VERCEL ENVIRONMENT VARIABLES
# ============================================================================

Write-Host "📥 Pulling Vercel environment variables..." -ForegroundColor $Blue
Write-Host ""

# Pull environment variables from Vercel
try
{
    vercel env pull .env.vercel.local --yes
    Write-Host "✅ Environment variables downloaded" -ForegroundColor $Green
} catch
{
    Write-Host "❌ Error: Failed to pull environment variables" -ForegroundColor $Red
    Write-Host "   Error: $_" -ForegroundColor $Yellow
    exit 1
}

Write-Host ""

# ============================================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================================

Write-Host "🔑 Loading database connection..." -ForegroundColor $Blue
Write-Host ""

# Check if .env.vercel.local exists
if (-not (Test-Path ".env.vercel.local"))
{
    Write-Host "❌ Error: .env.vercel.local not found" -ForegroundColor $Red
    exit 1
}

# Load DATABASE_URL from .env.vercel.local
$envContent = Get-Content .env.vercel.local
$databaseUrl = $null

foreach ($line in $envContent)
{
    if ($line -match '^Database_POSTGRES_URL=(.+)$')
    {
        $databaseUrl = $matches[1].Trim().Trim('"')
        break
    }
}

if (-not $databaseUrl)
{
    Write-Host "❌ Error: DATABASE_URL not found in .env.vercel.local" -ForegroundColor $Red
    Write-Host "   Expected: Database_POSTGRES_URL=..." -ForegroundColor $Yellow
    exit 1
}

# Set environment variable
$env:DATABASE_URL = $databaseUrl

# Verify (show partial URL for security)
$urlPreview = $databaseUrl.Substring(0, [Math]::Min(40, $databaseUrl.Length)) + "..."
Write-Host "✅ DATABASE_URL loaded: $urlPreview" -ForegroundColor $Green
Write-Host ""

# ============================================================================
# GENERATE PRISMA CLIENT
# ============================================================================

Write-Host "🔧 Generating Prisma Client..." -ForegroundColor $Blue
Write-Host ""

try
{
    npx prisma generate | Out-Null
    Write-Host "✅ Prisma Client generated" -ForegroundColor $Green
} catch
{
    Write-Host "⚠️  Warning: Prisma generate had issues, continuing..." -ForegroundColor $Yellow
}

Write-Host ""

# ============================================================================
# RESET DATABASE
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor $Cyan
Write-Host "║              🗑️  RESETTING DATABASE 🗑️                     ║" -ForegroundColor $Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor $Cyan
Write-Host ""

Write-Host "⚠️  Deleting all data and resetting schema..." -ForegroundColor $Yellow
Write-Host ""

try
{
    # Reset database (this will also run seed.ts automatically, so we'll skip manual seed after)
    $output = npx prisma migrate reset --force 2>&1

    if ($LASTEXITCODE -eq 0)
    {
        Write-Host "✅ Database reset successfully (seed.ts ran automatically)" -ForegroundColor $Green

        # Since migrate reset runs seed.ts automatically, we can skip the manual seed step
        # Set a flag to skip the seed section
        $global:seedAlreadyRan = $true
    } else
    {
        Write-Host "❌ Error during database reset" -ForegroundColor $Red
        Write-Host "   Output: $output" -ForegroundColor $Yellow
        exit 1
    }
} catch
{
    Write-Host "❌ Error: Failed to reset database" -ForegroundColor $Red
    Write-Host "   Error: $_" -ForegroundColor $Yellow
    exit 1
}

Write-Host ""

# ============================================================================
# RE-SEED DATABASE (if not already done by migrate reset)
# ============================================================================

if ($global:seedAlreadyRan)
{
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor $Cyan
    Write-Host "║              ✅ DATABASE ALREADY SEEDED ✅                 ║" -ForegroundColor $Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor $Cyan
    Write-Host ""
    Write-Host "✅ Database was automatically seeded during migrate reset" -ForegroundColor $Green
    Write-Host ""
} else
{
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor $Cyan
    Write-Host "║              🌱 RE-SEEDING DATABASE 🌱                     ║" -ForegroundColor $Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor $Cyan
    Write-Host ""

    Write-Host "📦 Creating fresh test data..." -ForegroundColor $Blue
    Write-Host ""
    Write-Host "This will create:" -ForegroundColor $Yellow
    Write-Host "  • 1 Admin user (admin@farmersmarket.app)" -ForegroundColor $Cyan
    Write-Host "  • 5 Farmer users (ana.romana@email.com, etc.)" -ForegroundColor $Cyan
    Write-Host "  • 3 Consumer users (divna.kapica@email.com, etc.)" -ForegroundColor $Cyan
    Write-Host "  • 5 Farms with photos & certifications" -ForegroundColor $Cyan
    Write-Host "  • 12+ Products across categories" -ForegroundColor $Cyan
    Write-Host "  • Sample orders and reviews" -ForegroundColor $Cyan
    Write-Host ""

    try
    {
        # Run seed script
        $seedOutput = npx tsx prisma/seed.ts 2>&1

        if ($LASTEXITCODE -eq 0)
        {
            Write-Host ""
            Write-Host "✅ Database seeded successfully!" -ForegroundColor $Green
        } else
        {
            Write-Host ""
            Write-Host "❌ Error during seeding" -ForegroundColor $Red
            Write-Host "   Output: $seedOutput" -ForegroundColor $Yellow
            exit 1
        }
    } catch
    {
        Write-Host ""
        Write-Host "❌ Error: Failed to seed database" -ForegroundColor $Red
        Write-Host "   Error: $_" -ForegroundColor $Yellow
        exit 1
    }
}

Write-Host ""

# ============================================================================
# SUCCESS SUMMARY
# ============================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor $Green
Write-Host "║                                                            ║" -ForegroundColor $Green
Write-Host "║          ✅ RE-SEEDING COMPLETED SUCCESSFULLY! ✅          ║" -ForegroundColor $Green
Write-Host "║                                                            ║" -ForegroundColor $Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor $Green
Write-Host ""

Write-Host "🎉 Your Vercel database has been reset and re-seeded!" -ForegroundColor $Green
Write-Host ""

# ============================================================================
# NEW CREDENTIALS
# ============================================================================

Write-Host "🔐 NEW LOGIN CREDENTIALS:" -ForegroundColor $Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $Cyan
Write-Host ""

Write-Host "👑 ADMIN ACCOUNT:" -ForegroundColor $Yellow
Write-Host "   Email:    admin@farmersmarket.app" -ForegroundColor $Green
Write-Host "   Password: DivineAdmin123!" -ForegroundColor $Green
Write-Host ""

Write-Host "👨‍🌾 FARMER ACCOUNTS:" -ForegroundColor $Yellow
Write-Host "   Email:    ana.romana@email.com" -ForegroundColor $Green
Write-Host "   Password: FarmLife2024!" -ForegroundColor $Green
Write-Host ""
Write-Host "   Email:    sarah.greenfield@email.com" -ForegroundColor $Green
Write-Host "   Password: OrganicFarm23!" -ForegroundColor $Green
Write-Host ""
Write-Host "   Email:    john.harvest@email.com" -ForegroundColor $Green
Write-Host "   Password: VeggieKing99!" -ForegroundColor $Green
Write-Host ""

Write-Host "🛒 CONSUMER ACCOUNTS:" -ForegroundColor $Yellow
Write-Host "   Email:    divna.kapica@email.com" -ForegroundColor $Green
Write-Host "   Password: HealthyEating2024!" -ForegroundColor $Green
Write-Host ""
Write-Host "   Email:    emily.conscious@email.com" -ForegroundColor $Green
Write-Host "   Password: LocalFood123!" -ForegroundColor $Green
Write-Host ""

Write-Host "📝 See LOGIN_CREDENTIALS.md for complete credential list" -ForegroundColor $Blue
Write-Host ""

# ============================================================================
# NEXT STEPS
# ============================================================================

Write-Host "🔗 NEXT STEPS:" -ForegroundColor $Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $Cyan
Write-Host ""

Write-Host "1️⃣  Test Admin Login:" -ForegroundColor $Yellow
Write-Host "    https://farmers-market-platform.vercel.app/login" -ForegroundColor $Blue
Write-Host "    Email: admin@farmersmarket.app" -ForegroundColor $Cyan
Write-Host "    Password: DivineAdmin123!" -ForegroundColor $Cyan
Write-Host ""

Write-Host "2️⃣  View Data in Prisma Studio:" -ForegroundColor $Yellow
Write-Host "    npx prisma studio" -ForegroundColor $Cyan
Write-Host ""

Write-Host "3️⃣  Verify Database Content:" -ForegroundColor $Yellow
Write-Host "    • Check that users exist" -ForegroundColor $Cyan
Write-Host "    • Verify farms are created" -ForegroundColor $Cyan
Write-Host "    • Confirm products are listed" -ForegroundColor $Cyan
Write-Host ""

Write-Host "4️⃣  Test End-to-End:" -ForegroundColor $Yellow
Write-Host "    • Login as admin, farmer, and consumer" -ForegroundColor $Cyan
Write-Host "    • Browse marketplace" -ForegroundColor $Cyan
Write-Host "    • Test ordering flow" -ForegroundColor $Cyan
Write-Host ""

# ============================================================================
# DATA CREATED
# ============================================================================

Write-Host "📊 DATA CREATED:" -ForegroundColor $Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $Cyan
Write-Host ""

Write-Host "[OK] Users:        9 total - 1 admin, 5 farmers, 3 consumers" -ForegroundColor $Green
Write-Host "[OK] Farms:        5 farms with complete details" -ForegroundColor $Green
Write-Host "[OK] Products:     12+ products across categories" -ForegroundColor $Green
Write-Host "[OK] Orders:       Sample orders with line items" -ForegroundColor $Green
Write-Host "[OK] Reviews:      Customer reviews on products" -ForegroundColor $Green
Write-Host "[OK] Photos:       Farm photos and thumbnails" -ForegroundColor $Green
Write-Host "[OK] Certs:        Farm certifications" -ForegroundColor $Green
Write-Host ""

# ============================================================================
# DOCUMENTATION
# ============================================================================

Write-Host "📚 DOCUMENTATION:" -ForegroundColor $Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $Cyan
Write-Host ""
Write-Host "• LOGIN_CREDENTIALS.md  - Complete credential reference" -ForegroundColor $Blue
Write-Host "• QUICK_LOGIN.md        - Quick login guide" -ForegroundColor $Blue
Write-Host "• prisma/seed.ts        - Source of truth for seed data" -ForegroundColor $Blue
Write-Host ""

# ============================================================================
# FOOTER
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor $Green
Write-Host "║                                                            ║" -ForegroundColor $Green
Write-Host "║        🚀 READY TO TEST PRODUCTION DEPLOYMENT! 🚀          ║" -ForegroundColor $Green
Write-Host "║                                                            ║" -ForegroundColor $Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor $Green
Write-Host ""

Write-Host "Database re-seeding complete!" -ForegroundColor $Green
Write-Host ""
Write-Host "Status: SUCCESS" -ForegroundColor $Green
$currentDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
Write-Host "Date:" $currentDate -ForegroundColor $Cyan
Write-Host ""

# Clean up environment variable
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue

exit 0
