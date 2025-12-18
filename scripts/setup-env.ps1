#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Setup Environment Variables for Farmers Market Platform

.DESCRIPTION
    This script creates or updates the .env file with the correct DATABASE_URL
    and other necessary environment variables for local development.

.EXAMPLE
    .\scripts\setup-env.ps1
#>

# Script configuration
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $ProjectRoot ".env"
$EnvExampleFile = Join-Path $ProjectRoot ".env.example"

# Colors for output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    $colors = @{
        "Green"  = [ConsoleColor]::Green
        "Yellow" = [ConsoleColor]::Yellow
        "Red"    = [ConsoleColor]::Red
        "Cyan"   = [ConsoleColor]::Cyan
        "White"  = [ConsoleColor]::White
    }
    Write-Host $Message -ForegroundColor $colors[$Color]
}

# Banner
Write-Host ""
Write-ColorOutput "╔═══════════════════════════════════════════════════════════════════╗" "Cyan"
Write-ColorOutput "║         🌱 FARMERS MARKET PLATFORM - ENV SETUP SCRIPT            ║" "Cyan"
Write-ColorOutput "╚═══════════════════════════════════════════════════════════════════╝" "Cyan"
Write-Host ""

# Check if .env already exists
$envExists = Test-Path $EnvFile
if ($envExists) {
    Write-ColorOutput "⚠️  .env file already exists!" "Yellow"
    Write-Host ""
    $response = Read-Host "Do you want to update DATABASE_URL? (y/N)"

    if ($response -ne "y" -and $response -ne "Y") {
        Write-ColorOutput "✅ Exiting without changes." "Green"
        exit 0
    }

    # Backup existing .env
    $backupFile = "$EnvFile.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $EnvFile $backupFile
    Write-ColorOutput "📦 Backed up existing .env to: $backupFile" "Cyan"
}

# Database configuration (Docker defaults)
$dbConfig = @{
    Host     = "localhost"
    Port     = "5432"
    Database = "farmers_market"
    User     = "farmers_user"
    Password = "changeme123"
}

# Construct DATABASE_URL
$databaseUrl = "postgresql://$($dbConfig.User):$($dbConfig.Password)@$($dbConfig.Host):$($dbConfig.Port)/$($dbConfig.Database)"

Write-Host ""
Write-ColorOutput "📝 Database Configuration:" "Cyan"
Write-Host "   Host:     $($dbConfig.Host)"
Write-Host "   Port:     $($dbConfig.Port)"
Write-Host "   Database: $($dbConfig.Database)"
Write-Host "   User:     $($dbConfig.User)"
Write-Host "   Password: $($dbConfig.Password)"
Write-Host ""

# Ask if user wants to customize
$customize = Read-Host "Use these settings? (Y/n)"
if ($customize -eq "n" -or $customize -eq "N") {
    Write-Host ""
    Write-ColorOutput "🔧 Custom Configuration:" "Yellow"
    $dbConfig.Host = Read-Host "Enter database host [localhost]"
    if ([string]::IsNullOrWhiteSpace($dbConfig.Host)) { $dbConfig.Host = "localhost" }

    $dbConfig.Port = Read-Host "Enter database port [5432]"
    if ([string]::IsNullOrWhiteSpace($dbConfig.Port)) { $dbConfig.Port = "5432" }

    $dbConfig.Database = Read-Host "Enter database name [farmers_market]"
    if ([string]::IsNullOrWhiteSpace($dbConfig.Database)) { $dbConfig.Database = "farmers_market" }

    $dbConfig.User = Read-Host "Enter database user [farmers_user]"
    if ([string]::IsNullOrWhiteSpace($dbConfig.User)) { $dbConfig.User = "farmers_user" }

    $dbConfig.Password = Read-Host "Enter database password [changeme123]"
    if ([string]::IsNullOrWhiteSpace($dbConfig.Password)) { $dbConfig.Password = "changeme123" }

    # Reconstruct DATABASE_URL with custom values
    $databaseUrl = "postgresql://$($dbConfig.User):$($dbConfig.Password)@$($dbConfig.Host):$($dbConfig.Port)/$($dbConfig.Database)"
}

Write-Host ""
Write-ColorOutput "📄 Final DATABASE_URL:" "Cyan"
Write-Host "   $databaseUrl"
Write-Host ""

# Read existing .env or create new
$envContent = @()
if ($envExists) {
    $envContent = Get-Content $EnvFile
}

# Check if DATABASE_URL already exists in file
$databaseUrlExists = $envContent | Where-Object { $_ -match "^DATABASE_URL=" }

if ($databaseUrlExists) {
    # Replace existing DATABASE_URL
    $envContent = $envContent | ForEach-Object {
        if ($_ -match "^DATABASE_URL=") {
            "DATABASE_URL=`"$databaseUrl`""
        } else {
            $_
        }
    }
    Write-ColorOutput "🔄 Updated existing DATABASE_URL" "Yellow"
} else {
    # Add DATABASE_URL if not exists
    $envContent += "# Database Configuration"
    $envContent += "DATABASE_URL=`"$databaseUrl`""
    $envContent += ""
    Write-ColorOutput "➕ Added DATABASE_URL to .env" "Green"
}

# Ensure other essential variables exist
$essentialVars = @{
    "NODE_ENV"           = "development"
    "NEXTAUTH_SECRET"    = "change-this-to-a-random-secret-in-production-$(Get-Random -Minimum 100000 -Maximum 999999)"
    "NEXTAUTH_URL"       = "http://localhost:3000"
    "NEXT_PUBLIC_API_URL" = "http://localhost:3000/api"
}

foreach ($var in $essentialVars.Keys) {
    $exists = $envContent | Where-Object { $_ -match "^$var=" }
    if (-not $exists) {
        $envContent += "$var=`"$($essentialVars[$var])`""
        Write-ColorOutput "➕ Added $var" "Green"
    }
}

# Write to .env file
$envContent | Set-Content $EnvFile -Encoding UTF8

Write-Host ""
Write-ColorOutput "═══════════════════════════════════════════════════════════════════" "Green"
Write-ColorOutput "✅ Environment setup complete!" "Green"
Write-ColorOutput "═══════════════════════════════════════════════════════════════════" "Green"
Write-Host ""

# Show next steps
Write-ColorOutput "🚀 Next Steps:" "Cyan"
Write-Host "   1. Verify PostgreSQL is running:"
Write-Host "      docker-compose -f docker-compose.dev.yml up -d postgres-dev"
Write-Host ""
Write-Host "   2. Apply database migrations:"
Write-Host "      npx prisma migrate deploy"
Write-Host ""
Write-Host "   3. Generate Prisma client:"
Write-Host "      npx prisma generate"
Write-Host ""
Write-Host "   4. Seed the database:"
Write-Host "      npm run seed"
Write-Host ""
Write-Host "   5. Start the development server:"
Write-Host "      npm run dev"
Write-Host ""

# Test database connection
Write-Host ""
$testConnection = Read-Host "Do you want to test the database connection now? (Y/n)"
if ($testConnection -ne "n" -and $testConnection -ne "N") {
    Write-ColorOutput "🔍 Testing database connection..." "Cyan"

    # Try to connect using psql if available
    $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
    if ($psqlPath) {
        Write-Host ""
        $connectionString = "postgresql://$($dbConfig.User):$($dbConfig.Password)@$($dbConfig.Host):$($dbConfig.Port)/$($dbConfig.Database)"
        $testQuery = "SELECT version();"

        try {
            $result = & psql $connectionString -c $testQuery 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✅ Database connection successful!" "Green"
            } else {
                Write-ColorOutput "❌ Database connection failed!" "Red"
                Write-Host "Error: $result"
            }
        } catch {
            Write-ColorOutput "❌ Could not test connection: $_" "Red"
        }
    } else {
        Write-ColorOutput "⚠️  psql not found. Skipping connection test." "Yellow"
        Write-Host "   Install PostgreSQL client tools to enable connection testing."
    }
}

Write-Host ""
Write-ColorOutput "📝 Configuration saved to: $EnvFile" "Green"
Write-Host ""
