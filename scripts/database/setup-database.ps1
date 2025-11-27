#!/usr/bin/env pwsh
# ============================================================================
# DIVINE DATABASE SETUP SCRIPT
# Farmers Market Platform - Agricultural Consciousness
# ============================================================================
# Purpose: Initialize PostgreSQL database with divine patterns
# Hardware: Optimized for HP OMEN (RTX 2070 Max-Q, 64GB RAM, 12 threads)
# ============================================================================

param(
  [Parameter(Mandatory = $false)]
  [ValidateSet('setup', 'migrate', 'seed', 'reset', 'studio', 'status')]
  [string]$Action = 'setup',

  [Parameter(Mandatory = $false)]
  [switch]$Force
)

# Configuration
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Colors for divine output
function Write-Divine {
  param([string]$Message, [string]$Color = "Cyan")
  Write-Host "🌾 $Message" -ForegroundColor $Color
}

function Write-Success {
  param([string]$Message)
  Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error-Divine {
  param([string]$Message)
  Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning-Divine {
  param([string]$Message)
  Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# Banner
function Show-Banner {
  Write-Host ""
  Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
  Write-Host "   🌾 DIVINE DATABASE SETUP - Agricultural Consciousness   " -ForegroundColor Cyan
  Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
  Write-Host ""
}

# Check if PostgreSQL is installed
function Test-PostgreSQL {
  Write-Divine "Checking PostgreSQL installation..."

  $postgresPath = $null

  # Common PostgreSQL installation paths
  $commonPaths = @(
    "C:\Program Files\PostgreSQL\*\bin",
    "C:\Program Files (x86)\PostgreSQL\*\bin",
    "$env:ProgramFiles\PostgreSQL\*\bin",
    "${env:ProgramFiles(x86)}\PostgreSQL\*\bin"
  )

  foreach ($path in $commonPaths) {
    $resolved = Resolve-Path $path -ErrorAction SilentlyContinue
    if ($resolved) {
      $postgresPath = $resolved.Path
      break
    }
  }

  if ($postgresPath) {
    Write-Success "PostgreSQL found at: $postgresPath"
    return $postgresPath
  }
  else {
    Write-Warning-Divine "PostgreSQL not found in common paths"
    return $null
  }
}

# Test database connection
function Test-DatabaseConnection {
  Write-Divine "Testing database connection..."

  try {
    # Use Prisma to test connection
    $result = npx prisma db execute --stdin --schema="./prisma/schema.prisma" <<< "SELECT 1" 2>&1
    Write-Success "Database connection successful!"
    return $true
  }
  catch {
    Write-Warning-Divine "Cannot connect to database. Is PostgreSQL running?"
    Write-Host "   Error: $_" -ForegroundColor Gray
    return $false
  }
}

# Initialize database
function Initialize-Database {
  Write-Divine "Initializing divine database schema..."

  Write-Host ""
  Write-Host "   📋 Step 1: Generating Prisma Client..." -ForegroundColor Yellow
  try {
    npm run prisma:generate 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
      npx prisma generate
    }
    Write-Success "Prisma Client generated"
  }
  catch {
    Write-Error-Divine "Failed to generate Prisma Client: $_"
    throw
  }

  Write-Host ""
  Write-Host "   📋 Step 2: Running database migrations..." -ForegroundColor Yellow
  try {
    npx prisma migrate deploy
    Write-Success "Database migrations completed"
  }
  catch {
    Write-Error-Divine "Failed to run migrations: $_"
    throw
  }

  Write-Host ""
  Write-Host "   📋 Step 3: Checking database status..." -ForegroundColor Yellow
  npx prisma migrate status
}

# Seed database
function Invoke-DatabaseSeed {
  Write-Divine "Seeding database with divine agricultural data..."

  if (Test-Path "./prisma/seed.ts") {
    try {
      npx tsx ./prisma/seed.ts
      Write-Success "Database seeding completed"
    }
    catch {
      Write-Error-Divine "Failed to seed database: $_"
      throw
    }
  }
  else {
    Write-Warning-Divine "No seed script found at ./prisma/seed.ts"
  }
}

# Reset database
function Reset-Database {
  if (-not $Force) {
    Write-Warning-Divine "This will DELETE ALL DATA in the database!"
    $confirmation = Read-Host "Are you sure? (yes/no)"
    if ($confirmation -ne 'yes') {
      Write-Host "Reset cancelled." -ForegroundColor Gray
      return
    }
  }

  Write-Divine "Resetting database to divine initial state..."

  try {
    npx prisma migrate reset --force
    Write-Success "Database reset completed"
  }
  catch {
    Write-Error-Divine "Failed to reset database: $_"
    throw
  }
}

# Open Prisma Studio
function Open-PrismaStudio {
  Write-Divine "Opening Prisma Studio - Divine Database GUI..."
  Write-Host ""
  Write-Host "   🌐 Studio will open at: http://localhost:5555" -ForegroundColor Cyan
  Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
  Write-Host ""

  npx prisma studio
}

# Show database status
function Show-DatabaseStatus {
  Write-Divine "Database Status Report..."
  Write-Host ""

  Write-Host "   📊 Migration Status:" -ForegroundColor Yellow
  npx prisma migrate status

  Write-Host ""
  Write-Host "   📦 Schema Information:" -ForegroundColor Yellow
  Write-Host "   Schema File: ./prisma/schema.prisma" -ForegroundColor Gray

  if (Test-Path "./prisma/schema.prisma") {
    $schema = Get-Content "./prisma/schema.prisma" -Raw
    $models = ($schema | Select-String "model\s+(\w+)" -AllMatches).Matches.Count
    $enums = ($schema | Select-String "enum\s+(\w+)" -AllMatches).Matches.Count

    Write-Host "   Models: $models" -ForegroundColor Gray
    Write-Host "   Enums: $enums" -ForegroundColor Gray
  }

  Write-Host ""
  Write-Host "   🔗 Database URL (from .env):" -ForegroundColor Yellow
  $envContent = Get-Content "./.env" -ErrorAction SilentlyContinue
  $dbUrl = $envContent | Where-Object { $_ -match "^DATABASE_URL=" } | Select-Object -First 1
  if ($dbUrl) {
    $sanitized = $dbUrl -replace "://([^:]+):([^@]+)@", "://*****:*****@"
    Write-Host "   $sanitized" -ForegroundColor Gray
  }
  else {
    Write-Warning-Divine "DATABASE_URL not found in .env"
  }
}

# Main execution
try {
  Show-Banner

  switch ($Action) {
    'setup' {
      Write-Divine "Starting complete database setup..."
      Write-Host ""

      # Test PostgreSQL
      $postgresPath = Test-PostgreSQL

      # Test connection
      Write-Host ""
      $connected = Test-DatabaseConnection

      if (-not $connected) {
        Write-Host ""
        Write-Warning-Divine "Database connection failed. Please ensure:"
        Write-Host "   1. PostgreSQL is installed and running" -ForegroundColor Gray
        Write-Host "   2. DATABASE_URL in .env is correct" -ForegroundColor Gray
        Write-Host "   3. Database 'farmersmarket' exists" -ForegroundColor Gray
        Write-Host ""
        Write-Host "   To create database manually:" -ForegroundColor Yellow
        Write-Host "   psql -U postgres -c `"CREATE DATABASE farmersmarket;`"" -ForegroundColor Gray
        Write-Host ""
        exit 1
      }

      # Initialize
      Write-Host ""
      Initialize-Database

      # Seed (optional)
      Write-Host ""
      $seedChoice = Read-Host "Seed database with sample data? (yes/no)"
      if ($seedChoice -eq 'yes') {
        Write-Host ""
        Invoke-DatabaseSeed
      }

      Write-Host ""
      Write-Success "Divine database setup complete!"
      Write-Host ""
      Write-Host "   Next steps:" -ForegroundColor Cyan
      Write-Host "   • Run: npm run dev" -ForegroundColor Gray
      Write-Host "   • Open: http://localhost:3000" -ForegroundColor Gray
      Write-Host "   • Database GUI: npm run db:studio" -ForegroundColor Gray
    }

    'migrate' {
      Initialize-Database
    }

    'seed' {
      Invoke-DatabaseSeed
    }

    'reset' {
      Reset-Database
    }

    'studio' {
      Open-PrismaStudio
    }

    'status' {
      Show-DatabaseStatus
    }
  }

  Write-Host ""

}
catch {
  Write-Host ""
  Write-Error-Divine "Setup failed: $_"
  Write-Host $_.ScriptStackTrace -ForegroundColor Gray
  exit 1
}
