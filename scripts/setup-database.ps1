#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Database Setup Script for Farmers Market Platform (Windows)

.DESCRIPTION
    Automates PostgreSQL database setup using Docker Compose.
    Sets up PostgreSQL, Redis, and optionally PgAdmin for local development.

.PARAMETER SkipSeed
    Skip seeding test data after setup

.PARAMETER WithAdmin
    Include PgAdmin database management UI

.EXAMPLE
    .\setup-database.ps1
    # Basic setup with test data

.EXAMPLE
    .\setup-database.ps1 -WithAdmin
    # Setup with PgAdmin UI

.EXAMPLE
    .\setup-database.ps1 -SkipSeed
    # Setup without seeding test data
#>

param(
    [switch]$SkipSeed,
    [switch]$WithAdmin
)

# ============================================================================
# CONFIGURATION
# ============================================================================

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$Colors = @{
    Reset   = "`e[0m"
    Bold    = "`e[1m"
    Green   = "`e[32m"
    Red     = "`e[31m"
    Yellow  = "`e[33m"
    Blue    = "`e[34m"
    Cyan    = "`e[36m"
    Magenta = "`e[35m"
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "$Message" -ForegroundColor Cyan -NoNewline
    Write-Host " " -NoNewline
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error-Message {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning-Message {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Step {
    param([string]$Message)
    Write-Host "→ $Message" -ForegroundColor Cyan
}

# ============================================================================
# CHECK PREREQUISITES
# ============================================================================

function Test-Prerequisites {
    Write-Header "🔍 Checking Prerequisites"

    # Check Docker
    Write-Step "Checking Docker installation..."
    try {
        $dockerVersion = docker --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker installed: $dockerVersion"
        } else {
            throw "Docker not found"
        }
    } catch {
        Write-Error-Message "Docker is not installed or not in PATH"
        Write-Info "Install Docker Desktop from: https://www.docker.com/products/docker-desktop"
        exit 1
    }

    # Check Docker Compose
    Write-Step "Checking Docker Compose..."
    try {
        $composeVersion = docker-compose --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker Compose installed: $composeVersion"
        } else {
            throw "Docker Compose not found"
        }
    } catch {
        Write-Error-Message "Docker Compose is not installed"
        Write-Info "Docker Compose should be included with Docker Desktop"
        exit 1
    }

    # Check Docker is running
    Write-Step "Checking Docker service..."
    try {
        docker ps >$null 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker is running"
        } else {
            throw "Docker not running"
        }
    } catch {
        Write-Error-Message "Docker is not running"
        Write-Info "Start Docker Desktop and try again"
        exit 1
    }

    # Check Node.js
    Write-Step "Checking Node.js installation..."
    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Node.js installed: $nodeVersion"
        } else {
            throw "Node.js not found"
        }
    } catch {
        Write-Warning-Message "Node.js not found (required for seeding)"
    }

    # Check npm
    Write-Step "Checking npm..."
    try {
        $npmVersion = npm --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "npm installed: $npmVersion"
        } else {
            throw "npm not found"
        }
    } catch {
        Write-Warning-Message "npm not found (required for seeding)"
    }

    Write-Success "All prerequisites met!"
}

# ============================================================================
# SETUP ENVIRONMENT FILE
# ============================================================================

function Initialize-EnvFile {
    Write-Header "⚙️  Setting up Environment Configuration"

    $envFile = ".env"
    $envExample = ".env.example"

    if (Test-Path $envFile) {
        Write-Warning-Message ".env file already exists"
        $response = Read-Host "Do you want to backup and recreate it? (y/N)"
        if ($response -eq "y" -or $response -eq "Y") {
            $backup = ".env.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
            Copy-Item $envFile $backup
            Write-Success "Backed up existing .env to $backup"
        } else {
            Write-Info "Keeping existing .env file"
            return
        }
    }

    # Create .env with database configuration
    $envContent = @"
# ============================================================================
# DATABASE CONNECTION (Docker Development)
# ============================================================================
DATABASE_URL="postgresql://farmers_user:changeme123@localhost:5432/farmers_market?schema=public"

# ============================================================================
# REDIS CACHE (Optional)
# ============================================================================
REDIS_URL="redis://:redispass123@localhost:6379/0"

# ============================================================================
# PGADMIN (Database Management UI)
# ============================================================================
PGADMIN_EMAIL="admin@farmersmarket.com"
PGADMIN_PASSWORD="admin123"

# ============================================================================
# NEXTAUTH (Required for authentication)
# ============================================================================
NEXTAUTH_SECRET="$(New-Guid)"
NEXTAUTH_URL="http://localhost:3001"

# ============================================================================
# APPLICATION
# ============================================================================
NEXT_PUBLIC_APP_URL="http://localhost:3001"
NODE_ENV="development"

# ============================================================================
# Add other environment variables as needed
# ============================================================================
"@

    Set-Content -Path $envFile -Value $envContent
    Write-Success "Created .env file with database configuration"
}

# ============================================================================
# START DOCKER SERVICES
# ============================================================================

function Start-DatabaseServices {
    Write-Header "🐳 Starting Docker Services"

    $composeFile = "docker-compose.dev.yml"

    if (-not (Test-Path $composeFile)) {
        Write-Error-Message "docker-compose.dev.yml not found"
        Write-Info "Make sure you're in the project root directory"
        exit 1
    }

    # Stop any existing containers
    Write-Step "Stopping existing containers..."
    docker-compose -f $composeFile down >$null 2>&1

    # Start services
    $services = @("postgres-dev", "redis-dev")
    if ($WithAdmin) {
        $services += "pgadmin-dev"
    }

    Write-Step "Starting services: $($services -join ', ')..."
    docker-compose -f $composeFile up -d $services

    if ($LASTEXITCODE -ne 0) {
        Write-Error-Message "Failed to start Docker services"
        exit 1
    }

    Write-Success "Docker services started successfully"

    # Wait for services to be healthy
    Write-Step "Waiting for services to be healthy..."
    $maxAttempts = 30
    $attempt = 0

    while ($attempt -lt $maxAttempts) {
        $attempt++
        Start-Sleep -Seconds 2

        $postgresHealthy = docker inspect --format='{{.State.Health.Status}}' farmers-market-db-dev 2>$null
        $redisHealthy = docker inspect --format='{{.State.Health.Status}}' farmers-market-redis-dev 2>$null

        if ($postgresHealthy -eq "healthy" -and $redisHealthy -eq "healthy") {
            Write-Success "All services are healthy"
            break
        }

        Write-Host "." -NoNewline
    }

    if ($attempt -eq $maxAttempts) {
        Write-Warning-Message "Services may not be fully ready, but continuing..."
    }

    Write-Host ""
}

# ============================================================================
# SETUP PRISMA
# ============================================================================

function Initialize-Prisma {
    Write-Header "🗄️  Setting up Prisma Database Client"

    # Generate Prisma client
    Write-Step "Generating Prisma client..."
    npm run postinstall

    if ($LASTEXITCODE -ne 0) {
        Write-Error-Message "Failed to generate Prisma client"
        exit 1
    }

    Write-Success "Prisma client generated"

    # Run migrations
    Write-Step "Running database migrations..."
    npx prisma migrate deploy

    if ($LASTEXITCODE -ne 0) {
        Write-Warning-Message "Migration failed, trying migrate dev..."
        npx prisma migrate dev --name init

        if ($LASTEXITCODE -ne 0) {
            Write-Error-Message "Failed to run migrations"
            exit 1
        }
    }

    Write-Success "Database migrations completed"
}

# ============================================================================
# SEED DATABASE
# ============================================================================

function Initialize-DatabaseData {
    if ($SkipSeed) {
        Write-Warning-Message "Skipping database seeding (--SkipSeed flag)"
        return
    }

    Write-Header "🌱 Seeding Test Data"

    Write-Step "Populating database with sample data..."
    npm run seed

    if ($LASTEXITCODE -ne 0) {
        Write-Error-Message "Failed to seed database"
        Write-Warning-Message "You can seed manually later with: npm run seed"
    } else {
        Write-Success "Database seeded successfully"
    }
}

# ============================================================================
# VERIFY SETUP
# ============================================================================

function Test-DatabaseSetup {
    Write-Header "✅ Verifying Setup"

    Write-Step "Testing database connection..."

    # Quick connection test
    $testResult = docker exec farmers-market-db-dev pg_isready -U farmers_user -d farmers_market 2>$null

    if ($LASTEXITCODE -eq 0) {
        Write-Success "Database connection verified"
    } else {
        Write-Warning-Message "Database connection test failed"
    }

    # Run health check bot
    Write-Step "Running comprehensive health check..."
    npm run bot:check

    if ($LASTEXITCODE -eq 0) {
        Write-Success "Health check passed"
    } else {
        Write-Warning-Message "Some health checks failed (this may be normal)"
    }
}

# ============================================================================
# PRINT SUMMARY
# ============================================================================

function Show-Summary {
    Write-Header "📊 Setup Summary"

    Write-Host ""
    Write-Host "🎉 Database setup completed successfully!" -ForegroundColor Green
    Write-Host ""

    Write-Host "📋 Connection Details:" -ForegroundColor Cyan
    Write-Host "  PostgreSQL:  localhost:5432" -ForegroundColor White
    Write-Host "  Database:    farmers_market" -ForegroundColor White
    Write-Host "  Username:    farmers_user" -ForegroundColor White
    Write-Host "  Password:    changeme123" -ForegroundColor White
    Write-Host ""
    Write-Host "  Redis:       localhost:6379" -ForegroundColor White
    Write-Host "  Password:    redispass123" -ForegroundColor White
    Write-Host ""

    if ($WithAdmin) {
        Write-Host "🔧 Management Tools:" -ForegroundColor Cyan
        Write-Host "  PgAdmin:     http://localhost:5050" -ForegroundColor White
        Write-Host "    Email:     admin@farmersmarket.com" -ForegroundColor White
        Write-Host "    Password:  admin123" -ForegroundColor White
        Write-Host ""
    }

    Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Start dev server:  npm run dev" -ForegroundColor White
    Write-Host "  2. Open browser:      http://localhost:3001" -ForegroundColor White
    Write-Host "  3. Run health check:  npm run bot:check" -ForegroundColor White
    Write-Host ""

    if (-not $SkipSeed) {
        Write-Host "🔑 Test Credentials:" -ForegroundColor Cyan
        Write-Host "  Farmer:    farmer1@example.com / password123" -ForegroundColor White
        Write-Host "  Customer:  customer@example.com / password123" -ForegroundColor White
        Write-Host "  Admin:     admin@example.com / password123" -ForegroundColor White
        Write-Host ""
    }

    Write-Host "📚 Useful Commands:" -ForegroundColor Cyan
    Write-Host "  View logs:         docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor White
    Write-Host "  Stop services:     docker-compose -f docker-compose.dev.yml down" -ForegroundColor White
    Write-Host "  Restart services:  docker-compose -f docker-compose.dev.yml restart" -ForegroundColor White
    Write-Host "  Prisma Studio:     npx prisma studio" -ForegroundColor White
    Write-Host "  Seed again:        npm run seed" -ForegroundColor White
    Write-Host ""
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

function Main {
    Clear-Host

    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║       🌾 FARMERS MARKET PLATFORM - DATABASE SETUP              ║" -ForegroundColor Cyan
    Write-Host "║           Automated PostgreSQL Setup for Windows                 ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""

    try {
        Test-Prerequisites
        Initialize-EnvFile
        Start-DatabaseServices
        Initialize-Prisma
        Initialize-DatabaseData
        Test-DatabaseSetup
        Show-Summary

        Write-Host ""
        Write-Host "✨ All done! Happy farming! 🚜" -ForegroundColor Green
        Write-Host ""

    } catch {
        Write-Host ""
        Write-Error-Message "Setup failed: $_"
        Write-Host ""
        Write-Host "💡 Troubleshooting tips:" -ForegroundColor Yellow
        Write-Host "  1. Make sure Docker Desktop is running" -ForegroundColor White
        Write-Host "  2. Check if ports 5432 and 6379 are available" -ForegroundColor White
        Write-Host "  3. Review error messages above" -ForegroundColor White
        Write-Host "  4. See DATABASE_SETUP.md for detailed guide" -ForegroundColor White
        Write-Host ""
        exit 1
    }
}

# Run main function
Main
