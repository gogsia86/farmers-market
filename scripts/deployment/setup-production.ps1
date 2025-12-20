# ============================================
# 🚀 FARMERS MARKET PLATFORM - PRODUCTION SETUP SCRIPT
# ============================================
# Version: 3.0
# Last Updated: 2025-01-XX
# Description: Automated production environment setup and deployment
# Platform: Windows PowerShell
# ============================================

# Requires PowerShell 5.1 or higher
#Requires -Version 5.1

# Error handling
$ErrorActionPreference = "Stop"

# Configuration
$ENV_FILE = ".env.production"
$LOG_FILE = "setup-production.log"
$BACKUP_DIR = "backups"

# Colors for output
function Write-Header {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║                                                            ║" -ForegroundColor Magenta
    Write-Host "║  🌾 FARMERS MARKET PLATFORM - PRODUCTION SETUP 🚀         ║" -ForegroundColor Magenta
    Write-Host "║                                                            ║" -ForegroundColor Magenta
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    Write-Host ""
}

function Write-Step {
    param([string]$Message)
    Write-Host "▶ $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

# Check prerequisites
function Test-Prerequisites {
    Write-Step "Checking prerequisites..."

    $missing = $false

    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js $nodeVersion installed"
    }
    catch {
        Write-Error-Custom "Node.js is not installed"
        $missing = $true
    }

    # Check npm
    try {
        $npmVersion = npm --version
        Write-Success "npm $npmVersion installed"
    }
    catch {
        Write-Error-Custom "npm is not installed"
        $missing = $true
    }

    # Check if in correct directory
    if (-not (Test-Path "package.json")) {
        Write-Error-Custom "package.json not found. Please run this script from the project root."
        exit 1
    }

    if ($missing) {
        Write-Error-Custom "Missing required dependencies. Please install them first."
        Write-Info "Download Node.js from: https://nodejs.org/"
        exit 1
    }

    Write-Success "All prerequisites met"
}

# Setup environment variables
function Set-EnvironmentVariables {
    Write-Step "Setting up environment variables..."

    if (Test-Path $ENV_FILE) {
        Write-Warning-Custom "Production environment file already exists: $ENV_FILE"
        $response = Read-Host "Do you want to overwrite it? (y/N)"
        if ($response -ne "y" -and $response -ne "Y") {
            Write-Info "Keeping existing environment file"
            return
        }

        # Backup existing file
        if (-not (Test-Path $BACKUP_DIR)) {
            New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
        }
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $backupFile = "$BACKUP_DIR\.env.production.backup.$timestamp"
        Copy-Item $ENV_FILE $backupFile
        Write-Info "Backed up existing file to $backupFile"
    }

    if (-not (Test-Path ".env.example")) {
        Write-Error-Custom ".env.example not found"
        exit 1
    }

    # Copy example file
    Copy-Item .env.example $ENV_FILE
    Write-Success "Created $ENV_FILE from template"

    # Prompt for required variables
    Write-Host ""
    Write-Info "Please configure the following required variables:"
    Write-Host ""

    # Node Environment
    $content = Get-Content $ENV_FILE
    $content = $content -replace "NODE_ENV=.*", "NODE_ENV=production"

    # App URL
    $appUrl = Read-Host "Enter your production URL (e.g., https://yourdomain.com)"
    if ($appUrl) {
        $content = $content -replace "NEXT_PUBLIC_APP_URL=.*", "NEXT_PUBLIC_APP_URL=$appUrl"
        $content = $content -replace "NEXTAUTH_URL=.*", "NEXTAUTH_URL=$appUrl"
    }

    # Database URL
    Write-Host ""
    Write-Info "Database Configuration:"
    Write-Host "1) PostgreSQL (Recommended for production)"
    Write-Host "2) SQLite (For testing only)"
    $dbChoice = Read-Host "Select database type (1 or 2)"

    if ($dbChoice -eq "1") {
        $dbUrl = Read-Host "Enter PostgreSQL connection string"
        if ($dbUrl) {
            $content = $content -replace "DATABASE_URL=.*", "DATABASE_URL=$dbUrl"
            $content = $content -replace "DIRECT_URL=.*", "DIRECT_URL=$dbUrl"
        }
    }
    else {
        Write-Warning-Custom "Using SQLite for production is not recommended"
        $content = $content -replace "DATABASE_URL=.*", "DATABASE_URL=file:./production.db"
        $content = $content -replace "DIRECT_URL=.*", "DIRECT_URL=file:./production.db"
    }

    # NextAuth Secret
    Write-Host ""
    Write-Step "Generating secure NextAuth secret..."
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $nextAuthSecret = [Convert]::ToBase64String($bytes)
    $content = $content -replace "NEXTAUTH_SECRET=.*", "NEXTAUTH_SECRET=$nextAuthSecret"
    Write-Success "Generated secure NextAuth secret"

    # Save file
    $content | Set-Content $ENV_FILE -Encoding UTF8

    Write-Host ""
    Write-Success "Environment variables configured"
    Write-Warning-Custom "Please edit $ENV_FILE to add optional services (Stripe, Resend, etc.)"
}

# Install dependencies
function Install-Dependencies {
    Write-Step "Installing dependencies..."

    if (Test-Path "node_modules") {
        Write-Warning-Custom "node_modules already exists"
        $response = Read-Host "Do you want to reinstall? (y/N)"
        if ($response -eq "y" -or $response -eq "Y") {
            Remove-Item -Recurse -Force node_modules
            Write-Info "Removed existing node_modules"
        }
        else {
            Write-Info "Skipping dependency installation"
            return
        }
    }

    npm ci --production=false
    Write-Success "Dependencies installed"
}

# Setup database
function Initialize-Database {
    Write-Step "Setting up database..."

    # Generate Prisma Client
    Write-Info "Generating Prisma Client..."
    npx prisma generate
    Write-Success "Prisma Client generated"

    # Run migrations
    Write-Info "Running database migrations..."
    try {
        npx prisma migrate deploy
        Write-Success "Database migrations completed"
    }
    catch {
        Write-Warning-Custom "Migration failed. You may need to configure the database manually."
    }

    # Ask about seeding
    Write-Host ""
    $response = Read-Host "Do you want to seed the database with initial data? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        npm run db:seed:basic
        Write-Success "Database seeded with initial data"
    }
}

# Build production code
function Build-Application {
    Write-Step "Building production application..."

    # Clean previous builds
    Write-Info "Cleaning previous builds..."
    if (Test-Path ".next") {
        Remove-Item -Recurse -Force .next
    }
    if (Test-Path "node_modules\.cache") {
        Remove-Item -Recurse -Force node_modules\.cache
    }

    # Run build
    Write-Info "Running production build..."
    try {
        npm run build
        Write-Success "Production build completed successfully"
    }
    catch {
        Write-Error-Custom "Build failed. Please check the logs."
        exit 1
    }

    # Verify build
    if (Test-Path ".next") {
        Write-Success "Build verified: .next directory exists"
    }
    else {
        Write-Error-Custom "Build verification failed: .next directory not found"
        exit 1
    }
}

# Run health checks
function Test-Application {
    Write-Step "Running health checks..."

    # Start server in background
    Write-Info "Starting server for health checks..."
    $env:NODE_ENV = "production"
    $serverJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        npm run start
    }

    # Wait for server to start
    Start-Sleep -Seconds 10

    # Check if server is running
    if ($serverJob.State -eq "Running") {
        Write-Success "Server started (Job ID: $($serverJob.Id))"

        # Test health endpoint
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Success "Health check passed"
            }
        }
        catch {
            Write-Warning-Custom "Health check endpoint not responding"
        }

        # Stop server
        Stop-Job $serverJob
        Remove-Job $serverJob
        Write-Info "Test server stopped"
    }
    else {
        Write-Error-Custom "Server failed to start"
    }
}

# Display next steps
function Show-NextSteps {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║                                                            ║" -ForegroundColor Magenta
    Write-Host "║  ✅ PRODUCTION SETUP COMPLETE!                            ║" -ForegroundColor Magenta
    Write-Host "║                                                            ║" -ForegroundColor Magenta
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    Write-Host ""
    Write-Info "Next Steps:"
    Write-Host ""
    Write-Host "1. Review and configure additional environment variables:"
    Write-Host "   " -NoNewline
    Write-Host "notepad $ENV_FILE" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "2. Start the production server:"
    Write-Host "   " -NoNewline
    Write-Host "npm run start" -ForegroundColor Green
    Write-Host ""
    Write-Host "3. Or start with PM2 for process management:"
    Write-Host "   " -NoNewline
    Write-Host "npm install -g pm2" -ForegroundColor Green
    Write-Host "   " -NoNewline
    Write-Host "pm2 start npm --name 'farmers-market' -- run start" -ForegroundColor Green
    Write-Host ""
    Write-Host "4. Access your application:"
    Write-Host "   " -NoNewline
    Write-Host "http://localhost:3001" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "5. Monitor application health:"
    Write-Host "   " -NoNewline
    Write-Host "Invoke-WebRequest http://localhost:3001/api/health" -ForegroundColor Cyan
    Write-Host ""
    Write-Info "Documentation:"
    Write-Host "   - Production Setup Guide: PRODUCTION_SETUP_GUIDE.md"
    Write-Host "   - Deployment Checklist: DEPLOYMENT_CHECKLIST.md"
    Write-Host "   - Troubleshooting: See PRODUCTION_SETUP_GUIDE.md"
    Write-Host ""
    Write-Success "🌾 Ready to deploy! Happy farming! ✨"
    Write-Host ""
}

# Main execution
function Main {
    # Start logging
    Start-Transcript -Path $LOG_FILE -Append

    Write-Header

    Write-Host "Setup started at: $(Get-Date)"
    Write-Host ""

    try {
        Test-Prerequisites

        Write-Host ""
        $response = Read-Host "Continue with production setup? (Y/n)"
        if ($response -eq "n" -or $response -eq "N") {
            Write-Info "Setup cancelled"
            Stop-Transcript
            exit 0
        }

        Set-EnvironmentVariables
        Write-Host ""

        $response = Read-Host "Install dependencies? (Y/n)"
        if ($response -ne "n" -and $response -ne "N") {
            Install-Dependencies
            Write-Host ""
        }

        $response = Read-Host "Setup database? (Y/n)"
        if ($response -ne "n" -and $response -ne "N") {
            Initialize-Database
            Write-Host ""
        }

        $response = Read-Host "Build production code? (Y/n)"
        if ($response -ne "n" -and $response -ne "N") {
            Build-Application
            Write-Host ""
        }

        $response = Read-Host "Run health checks? (y/N)"
        if ($response -eq "y" -or $response -eq "Y") {
            Test-Application
            Write-Host ""
        }

        Write-Host ""
        Write-Host "Setup completed at: $(Get-Date)"
        Write-Host ""

        Show-NextSteps
    }
    catch {
        Write-Error-Custom "An error occurred: $_"
        Write-Host ""
        Write-Host "Error details:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Write-Host ""
        Write-Warning-Custom "Check $LOG_FILE for detailed logs"
        Stop-Transcript
        exit 1
    }

    Stop-Transcript
}

# Run main function
Main
