#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Quick Test Database Setup Script

.DESCRIPTION
    Sets up the test database for running Jest and E2E tests.
    This script:
    1. Checks if Docker is running
    2. Starts PostgreSQL with test credentials
    3. Creates the test database
    4. Runs Prisma migrations

.EXAMPLE
    .\setup-test-database.ps1
#>

$ErrorActionPreference = "Stop"

# ============================================================================
# COLORS
# ============================================================================
function Write-Success { param([string]$Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Error-Msg { param([string]$Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Write-Info { param([string]$Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Step { param([string]$Message) Write-Host "[STEP] $Message" -ForegroundColor White }

# ============================================================================
# MAIN
# ============================================================================

Write-Host ""
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "  TEST DATABASE SETUP" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Step 1: Check Docker
    Write-Step "Checking Docker Desktop..."
    try {
        docker ps | Out-Null
        Write-Success "Docker is running"
    } catch {
        Write-Error-Msg "Docker Desktop is not running or paused"
        Write-Info "Please start Docker Desktop and unpause it, then run this script again"
        Write-Host ""
        Write-Host "Quick fix:" -ForegroundColor Yellow
        Write-Host "  1. Click the Docker whale icon in system tray" -ForegroundColor White
        Write-Host "  2. Select Resume or open Dashboard" -ForegroundColor White
        Write-Host "  3. Wait for Docker to start" -ForegroundColor White
        Write-Host "  4. Run this script again" -ForegroundColor White
        exit 1
    }

    # Step 2: Check if test database container exists
    Write-Step "Checking for existing test database..."
    $existingContainer = docker ps -a --filter "name=farmers-market-test-db" --format "{{.Names}}" 2>$null

    if ($existingContainer) {
        Write-Info "Found existing test database container"
        Write-Step "Starting existing container..."
        docker start farmers-market-test-db | Out-Null
        Start-Sleep -Seconds 3
        Write-Success "Test database container started"
    } else {
        Write-Step "Creating new test database container..."

        # Create and start PostgreSQL container for testing
        docker run -d `
            --name farmers-market-test-db `
            -e POSTGRES_USER=test `
            -e POSTGRES_PASSWORD=test `
            -e POSTGRES_DB=farmers_market_test `
            -p 5432:5432 `
            postgres:16-alpine | Out-Null

        if ($LASTEXITCODE -ne 0) {
            Write-Error-Msg "Failed to create test database container"
            exit 1
        }

        Write-Success "Test database container created"
        Write-Step "Waiting for database to be ready..."
        Start-Sleep -Seconds 5
    }

    # Step 3: Wait for database to be ready
    Write-Step "Verifying database connection..."
    $maxAttempts = 15
    $attempt = 0
    $connected = $false

    while ($attempt -lt $maxAttempts) {
        $attempt++
        try {
            $result = docker exec farmers-market-test-db pg_isready -U test -d farmers_market_test 2>&1
            if ($LASTEXITCODE -eq 0) {
                $connected = $true
                break
            }
        } catch {
            # Keep trying
        }
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
    Write-Host ""

    if (-not $connected) {
        Write-Error-Msg "Database failed to become ready"
        Write-Info "Check logs with: docker logs farmers-market-test-db"
        exit 1
    }

    Write-Success "Database is ready"

    # Step 4: Run Prisma migrations
    Write-Step "Running Prisma migrations..."
    $env:DATABASE_URL = "postgresql://test:test@localhost:5432/farmers_market_test"

    npx prisma migrate deploy 2>&1 | Out-Null

    if ($LASTEXITCODE -ne 0) {
        Write-Info "Running migrate dev instead..."
        npx prisma migrate dev --name test_init --skip-seed 2>&1 | Out-Null
    }

    Write-Success "Database migrations completed"

    # Step 5: Summary
    Write-Host ""
    Write-Host "=============================================================" -ForegroundColor Green
    Write-Host "  TEST DATABASE READY!" -ForegroundColor Green
    Write-Host "=============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Info "Database Connection:"
    Write-Host "  URL:      postgresql://test:test@localhost:5432/farmers_market_test" -ForegroundColor White
    Write-Host "  Host:     localhost:5432" -ForegroundColor White
    Write-Host "  Database: farmers_market_test" -ForegroundColor White
    Write-Host "  User:     test" -ForegroundColor White
    Write-Host "  Password: test" -ForegroundColor White
    Write-Host ""
    Write-Info "Next Steps:"
    Write-Host "  Run tests:        npm test" -ForegroundColor White
    Write-Host "  Run all tests:    npm run test:all" -ForegroundColor White
    Write-Host "  Stop database:    docker stop farmers-market-test-db" -ForegroundColor White
    Write-Host "  View logs:        docker logs farmers-market-test-db" -ForegroundColor White
    Write-Host "  Remove database:  docker rm -f farmers-market-test-db" -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host ""
    Write-Error-Msg "Setup failed: $_"
    Write-Host ""
    Write-Info "Troubleshooting:"
    Write-Host "  1. Ensure Docker Desktop is running" -ForegroundColor White
    Write-Host "  2. Check if port 5432 is available" -ForegroundColor White
    Write-Host "  3. Try: docker rm -f farmers-market-test-db" -ForegroundColor White
    Write-Host "  4. Run this script again" -ForegroundColor White
    Write-Host ""
    exit 1
}
