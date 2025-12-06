# ============================================================================
# FARMERS MARKET PLATFORM - TEST DATABASE SETUP SCRIPT
# Sets up test database and runs Prisma migrations
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🌾 Farmers Market Platform - Test Database Setup         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Set environment variable for this session
$env:DATABASE_URL = "postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test"
$env:DIRECT_URL = "postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test"

Write-Host "📊 Database Configuration:" -ForegroundColor Yellow
Write-Host "  Host: localhost:5433" -ForegroundColor White
Write-Host "  Database: farmersmarket_test" -ForegroundColor White
Write-Host "  User: postgres" -ForegroundColor White
Write-Host ""

# Check if Docker container is running
Write-Host "🐳 Checking Docker container..." -ForegroundColor Yellow
$containerStatus = docker ps --filter "name=farmers-market-test-db" --format "{{.Status}}"

if ($containerStatus -match "Up") {
    Write-Host "  ✅ Test database container is running" -ForegroundColor Green
} else {
    Write-Host "  ❌ Test database container not found" -ForegroundColor Red
    Write-Host "  Starting test database..." -ForegroundColor Yellow
    docker-compose -f docker-compose.test.yml up -d
    Write-Host "  Waiting for database to be healthy..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

Write-Host ""

# Test database connection
Write-Host "🔌 Testing database connection..." -ForegroundColor Yellow
$testConnection = docker exec farmers-market-test-db pg_isready -U postgres 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Database connection successful" -ForegroundColor Green
} else {
    Write-Host "  ❌ Database connection failed" -ForegroundColor Red
    Write-Host "  Error: $testConnection" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Generate Prisma Client
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Prisma client generation failed" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Prisma client generated" -ForegroundColor Green
Write-Host ""

# Push schema to database
Write-Host "📤 Pushing Prisma schema to database..." -ForegroundColor Yellow
Write-Host "  (This may take a moment...)" -ForegroundColor Gray
npx prisma db push --accept-data-loss
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Database schema push failed" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Database schema pushed successfully" -ForegroundColor Green
Write-Host ""

# Verify tables were created
Write-Host "🔍 Verifying database tables..." -ForegroundColor Yellow
$tableCheck = docker exec farmers-market-test-db psql -U postgres -d farmersmarket_test -c "\dt" 2>&1
if ($LASTEXITCODE -eq 0) {
    $tableCount = ($tableCheck | Select-String -Pattern "public \|" | Measure-Object).Count
    Write-Host "  ✅ Database has $tableCount tables" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Could not verify tables" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ✅ TEST DATABASE SETUP COMPLETE                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Run E2E tests:  npx playwright test --config=playwright.config.temp.ts" -ForegroundColor White
Write-Host "  2. View database:  npx prisma studio" -ForegroundColor White
Write-Host "  3. Stop database:  docker-compose -f docker-compose.test.yml down" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Database URL: $env:DATABASE_URL" -ForegroundColor Cyan
Write-Host ""
