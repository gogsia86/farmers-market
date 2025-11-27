#!/usr/bin/env pwsh
# ============================================
# DOCKER READINESS CHECK & IMPLEMENTATION
# Divine Agricultural Platform - Complete Feature Audit
# ============================================

param(
  [switch]$Fix,
  [switch]$Verbose
)

Write-Host "🔍 DOCKER READINESS CHECK - AGRICULTURAL PLATFORM" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray

# ============================================
# 1. DOCKER CONFIGURATION CHECK
# ============================================
Write-Host "`n📦 DOCKER CONFIGURATION" -ForegroundColor Yellow

$dockerFiles = @(
  "Dockerfile",
  "docker-compose.yml",
  ".dockerignore"
)

$missingDockerFiles = @()
foreach ($file in $dockerFiles) {
  if (Test-Path $file) {
    Write-Host "  ✅ $file exists" -ForegroundColor Green
  }
  else {
    Write-Host "  ❌ $file missing" -ForegroundColor Red
    $missingDockerFiles += $file
  }
}

# ============================================
# 2. ENVIRONMENT VARIABLES CHECK
# ============================================
Write-Host "`n🔐 ENVIRONMENT CONFIGURATION" -ForegroundColor Yellow

$requiredEnvVars = @(
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL"
)

$optionalEnvVars = @(
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "SENDGRID_API_KEY",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "REDIS_URL",
  "SENTRY_DSN",
  "PERPLEXITY_API_KEY"
)

if (Test-Path ".env.example") {
  Write-Host "  ✅ .env.example exists" -ForegroundColor Green
  $envContent = Get-Content ".env.example" -Raw

  foreach ($var in $requiredEnvVars) {
    if ($envContent -match $var) {
      Write-Host "  ✅ Required: $var" -ForegroundColor Green
    }
    else {
      Write-Host "  ❌ Missing: $var" -ForegroundColor Red
    }
  }

  if ($Verbose) {
    Write-Host "`n  Optional variables:" -ForegroundColor Gray
    foreach ($var in $optionalEnvVars) {
      if ($envContent -match $var) {
        Write-Host "  ✅ Optional: $var" -ForegroundColor Green
      }
      else {
        Write-Host "  ⚠️  Optional: $var (not configured)" -ForegroundColor Yellow
      }
    }
  }
}
else {
  Write-Host "  ❌ .env.example missing" -ForegroundColor Red
}

# ============================================
# 3. DATABASE SCHEMA CHECK
# ============================================
Write-Host "`n🗄️  DATABASE SCHEMA" -ForegroundColor Yellow

if (Test-Path "prisma/schema.prisma") {
  Write-Host "  ✅ Prisma schema exists" -ForegroundColor Green

  $schemaContent = Get-Content "prisma/schema.prisma" -Raw

  # Check for key models
  $keyModels = @(
    "User",
    "Farm",
    "Product",
    "Order",
    "BiodynamicEvent",
    "SeasonalCalendar",
    "MoonPhase",
    "CropRotationPlan"
  )

  Write-Host "  Core Models:" -ForegroundColor Gray
  foreach ($model in $keyModels) {
    if ($schemaContent -match "model $model") {
      Write-Host "    ✅ $model" -ForegroundColor Green
    }
    else {
      Write-Host "    ❌ $model missing" -ForegroundColor Red
    }
  }
}
else {
  Write-Host "  ❌ Prisma schema missing" -ForegroundColor Red
}

# ============================================
# 4. IMPLEMENTED FEATURES CHECK
# ============================================
Write-Host "`n🌾 AGRICULTURAL FEATURES" -ForegroundColor Yellow

$featureChecks = @{
  "Biodynamic Calendar" = "src/components/agricultural/BiodynamicCalendarWidget.tsx"
  "Seasonal Products"   = "src/components/SeasonalProductCatalog.tsx"
  "Farm Management"     = "src/app/api/farms"
  "Product Catalog"     = "src/app/api/products"
  "Order Management"    = "src/app/api/orders"
  "User Authentication" = "src/lib/auth"
  "Payment Processing"  = "src/lib/stripe"
  "Email Notifications" = "src/lib/email"
}

foreach ($feature in $featureChecks.GetEnumerator()) {
  if (Test-Path $feature.Value) {
    Write-Host "  ✅ $($feature.Key)" -ForegroundColor Green
  }
  else {
    Write-Host "  ❌ $($feature.Key) - Missing: $($feature.Value)" -ForegroundColor Red
  }
}

# ============================================
# 5. API ENDPOINTS CHECK
# ============================================
Write-Host "`n🌐 API ENDPOINTS" -ForegroundColor Yellow

$apiEndpoints = @(
  "src/app/api/auth",
  "src/app/api/farms",
  "src/app/api/products",
  "src/app/api/orders",
  "src/app/api/agricultural/biodynamic-calendar",
  "src/app/api/agricultural/moon-phases",
  "src/app/api/agricultural/seasonal-calendar"
)

$implementedEndpoints = 0
$totalEndpoints = $apiEndpoints.Count

foreach ($endpoint in $apiEndpoints) {
  if (Test-Path $endpoint) {
    Write-Host "  ✅ $endpoint" -ForegroundColor Green
    $implementedEndpoints++
  }
  else {
    Write-Host "  ❌ $endpoint" -ForegroundColor Red
  }
}

Write-Host "`n  Progress: $implementedEndpoints/$totalEndpoints endpoints implemented" -ForegroundColor Cyan

# ============================================
# 6. DEPENDENCIES CHECK
# ============================================
Write-Host "`n📚 DEPENDENCIES" -ForegroundColor Yellow

if (Test-Path "package.json") {
  $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json

  $criticalDeps = @(
    "next",
    "react",
    "prisma",
    "@prisma/client",
    "next-auth",
    "stripe",
    "zod"
  )

  $missingDeps = @()
  foreach ($dep in $criticalDeps) {
    $found = $false
    if ($packageJson.dependencies.PSObject.Properties.Name -contains $dep) {
      Write-Host "  ✅ $dep" -ForegroundColor Green
      $found = $true
    }
    elseif ($packageJson.devDependencies.PSObject.Properties.Name -contains $dep) {
      Write-Host "  ✅ $dep (dev)" -ForegroundColor Green
      $found = $true
    }

    if (-not $found) {
      Write-Host "  ❌ $dep missing" -ForegroundColor Red
      $missingDeps += $dep
    }
  }
}
else {
  Write-Host "  ❌ package.json missing" -ForegroundColor Red
}

# ============================================
# 7. BUILD CONFIGURATION CHECK
# ============================================
Write-Host "`n🏗️  BUILD CONFIGURATION" -ForegroundColor Yellow

$buildConfigs = @(
  "next.config.js",
  "tsconfig.json",
  "tailwind.config.ts"
)

foreach ($config in $buildConfigs) {
  if (Test-Path $config) {
    Write-Host "  ✅ $config" -ForegroundColor Green
  }
  else {
    Write-Host "  ❌ $config missing" -ForegroundColor Red
  }
}

# ============================================
# 8. DOCKER BUILD TEST
# ============================================
Write-Host "`n🐳 DOCKER BUILD CAPABILITY" -ForegroundColor Yellow

try {
  $dockerVersion = docker --version 2>$null
  if ($dockerVersion) {
    Write-Host "  ✅ Docker installed: $dockerVersion" -ForegroundColor Green

    $dockerCompose = docker-compose --version 2>$null
    if ($dockerCompose) {
      Write-Host "  ✅ Docker Compose installed: $dockerCompose" -ForegroundColor Green
    }
    else {
      Write-Host "  ⚠️  Docker Compose not found (optional)" -ForegroundColor Yellow
    }
  }
  else {
    Write-Host "  ❌ Docker not installed" -ForegroundColor Red
  }
}
catch {
  Write-Host "  ❌ Docker not available" -ForegroundColor Red
}

# ============================================
# 9. GENERATE SUMMARY REPORT
# ============================================
Write-Host "`n" -NoNewline
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "📊 SUMMARY REPORT" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray

$readinessScore = 0
$totalChecks = 10

# Calculate readiness score
if ($missingDockerFiles.Count -eq 0) { $readinessScore++ }
if (Test-Path ".env.example") { $readinessScore++ }
if (Test-Path "prisma/schema.prisma") { $readinessScore++ }
if ($implementedEndpoints -ge ($totalEndpoints * 0.7)) { $readinessScore++ }
if (Test-Path "package.json") { $readinessScore++ }
if (Test-Path "Dockerfile") { $readinessScore++ }
if (Test-Path "docker-compose.yml") { $readinessScore++ }
if (Test-Path "next.config.js") { $readinessScore++ }
if (Test-Path "src/lib/auth") { $readinessScore++ }
if (Test-Path "src/components/agricultural") { $readinessScore++ }

$readinessPercentage = [math]::Round(($readinessScore / $totalChecks) * 100)

Write-Host "`nDocker Readiness: $readinessPercentage% ($readinessScore/$totalChecks checks passed)" -ForegroundColor $(if ($readinessPercentage -ge 80) { "Green" } elseif ($readinessPercentage -ge 60) { "Yellow" } else { "Red" })

if ($readinessPercentage -ge 80) {
  Write-Host "✅ Platform is READY for Docker deployment!" -ForegroundColor Green
}
elseif ($readinessPercentage -ge 60) {
  Write-Host "⚠️  Platform is PARTIALLY READY - some features missing" -ForegroundColor Yellow
}
else {
  Write-Host "❌ Platform is NOT READY - critical components missing" -ForegroundColor Red
}

# ============================================
# 10. RECOMMENDATIONS
# ============================================
Write-Host "`n💡 RECOMMENDATIONS" -ForegroundColor Yellow

if ($missingDockerFiles.Count -gt 0) {
  Write-Host "  • Create missing Docker files: $($missingDockerFiles -join ', ')" -ForegroundColor Gray
}

if ($implementedEndpoints -lt $totalEndpoints) {
  Write-Host "  • Implement remaining API endpoints ($($totalEndpoints - $implementedEndpoints) missing)" -ForegroundColor Gray
}

Write-Host "  • Run 'npm run build' to test production build" -ForegroundColor Gray
Write-Host "  • Run 'docker-compose up --build' to test Docker deployment" -ForegroundColor Gray
Write-Host "  • Verify all environment variables are set correctly" -ForegroundColor Gray
Write-Host "  • Run database migrations: npx prisma migrate deploy" -ForegroundColor Gray

# ============================================
# 11. QUICK FIX OPTION
# ============================================
if ($Fix) {
  Write-Host "`n🔧 APPLYING QUICK FIXES..." -ForegroundColor Cyan

  # Create .env.example if missing
  if (-not (Test-Path ".env.example")) {
    Write-Host "  Creating .env.example..." -ForegroundColor Yellow
    @"
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/farmersmarket"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (Optional)
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Email (Optional)
SENDGRID_API_KEY=""

# Redis (Optional)
REDIS_URL="redis://localhost:6379"

# Monitoring (Optional)
SENTRY_DSN=""

# AI Services (Optional)
PERPLEXITY_API_KEY=""
"@ | Out-File -FilePath ".env.example" -Encoding UTF8
    Write-Host "  ✅ Created .env.example" -ForegroundColor Green
  }

  Write-Host "`n✅ Quick fixes applied!" -ForegroundColor Green
}

Write-Host "`n" -NoNewline
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "🌾 Agricultural Platform Docker Check Complete!" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
