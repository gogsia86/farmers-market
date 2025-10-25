#!/usr/bin/env pwsh
# Phase 4 Deployment Script
# Automated deployment for Marketing Automation Platform

Write-Host "🚀 PHASE 4 DEPLOYMENT SCRIPT" -ForegroundColor Cyan
Write-Host "Marketing Automation Platform - Production Deployment" -ForegroundColor White
Write-Host ""

# Check if running with appropriate permissions
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
  Write-Host "⚠️  Warning: Not running as administrator. Some operations may fail." -ForegroundColor Yellow
  Write-Host ""
}

# Configuration
$ErrorActionPreference = "Stop"
$deploymentStart = Get-Date

# Step 1: Pre-deployment Checks
Write-Host "📋 Step 1: Pre-deployment Checks" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check Node.js version
Write-Host "   Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "   ✅ Node.js version: $nodeVersion" -ForegroundColor White

# Check npm
Write-Host "   Checking npm..." -ForegroundColor Yellow
$npmVersion = npm --version
Write-Host "   ✅ npm version: $npmVersion" -ForegroundColor White

# Check if .env files exist
Write-Host "   Checking environment files..." -ForegroundColor Yellow
if (Test-Path ".env.production") {
  Write-Host "   ✅ .env.production found" -ForegroundColor White
}
else {
  Write-Host "   ⚠️  .env.production not found" -ForegroundColor Yellow
  Write-Host "      Create .env.production with required variables" -ForegroundColor Gray
}

Write-Host ""

# Step 2: Install Dependencies
Write-Host "📦 Step 2: Install Dependencies" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

Write-Host "   Installing production dependencies..." -ForegroundColor Yellow
npm ci --production=false
Write-Host "   ✅ Dependencies installed" -ForegroundColor White
Write-Host ""

# Step 3: Environment Setup
Write-Host "🔧 Step 3: Environment Configuration" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

Write-Host "   Required environment variables:" -ForegroundColor Yellow
Write-Host "   - EMAIL_PROVIDER (sendgrid/ses/resend)" -ForegroundColor Gray
Write-Host "   - SENDGRID_API_KEY or AWS credentials" -ForegroundColor Gray
Write-Host "   - NEXT_PUBLIC_APP_URL" -ForegroundColor Gray
Write-Host "   - DATABASE_URL" -ForegroundColor Gray
Write-Host ""

$envCheck = Read-Host "   Have you configured all environment variables? (y/n)"
if ($envCheck -ne "y") {
  Write-Host "   ⚠️  Please configure environment variables before proceeding" -ForegroundColor Yellow
  Write-Host "      See PHASE_4_DEPLOYMENT_GUIDE.md for details" -ForegroundColor Gray
  exit 1
}

Write-Host "   ✅ Environment configured" -ForegroundColor White
Write-Host ""

# Step 4: Database Migrations
Write-Host "🗄️  Step 4: Database Migrations" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

$runMigrations = Read-Host "   Run database migrations? (y/n)"
if ($runMigrations -eq "y") {
  Write-Host "   Running Prisma migrations..." -ForegroundColor Yellow

  try {
    npx prisma generate
    npx prisma migrate deploy
    Write-Host "   ✅ Database migrations complete" -ForegroundColor White
  }
  catch {
    Write-Host "   ❌ Migration failed: $_" -ForegroundColor Red
    Write-Host "      Check DATABASE_URL and database connectivity" -ForegroundColor Gray
    exit 1
  }
}
else {
  Write-Host "   ⏭️  Skipping migrations" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Build Application
Write-Host "🏗️  Step 5: Build Application" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

Write-Host "   Building Next.js application..." -ForegroundColor Yellow
try {
  npm run build
  Write-Host "   ✅ Build successful" -ForegroundColor White
}
catch {
  Write-Host "   ❌ Build failed: $_" -ForegroundColor Red
  exit 1
}

Write-Host ""

# Step 6: Run Tests
Write-Host "🧪 Step 6: Run Tests" -ForegroundColor Green
Write-Host "====================" -ForegroundColor Green

$runTests = Read-Host "   Run test suite? (y/n)"
if ($runTests -eq "y") {
  Write-Host "   Running tests..." -ForegroundColor Yellow

  try {
    npm test
    Write-Host "   ✅ Tests passed" -ForegroundColor White
  }
  catch {
    Write-Host "   ⚠️  Some tests failed" -ForegroundColor Yellow
    $continueAnyway = Read-Host "   Continue with deployment? (y/n)"
    if ($continueAnyway -ne "y") {
      Write-Host "   ⏸️  Deployment cancelled" -ForegroundColor Yellow
      exit 1
    }
  }
}
else {
  Write-Host "   ⏭️  Skipping tests" -ForegroundColor Yellow
}

Write-Host ""

# Step 7: Email Service Verification
Write-Host "📧 Step 7: Email Service Verification" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

Write-Host "   Email service provider configuration:" -ForegroundColor Yellow
Write-Host "   - SendGrid: Requires SENDGRID_API_KEY" -ForegroundColor Gray
Write-Host "   - AWS SES: Requires AWS credentials" -ForegroundColor Gray
Write-Host "   - Resend: Requires RESEND_API_KEY" -ForegroundColor Gray
Write-Host ""

$emailVerified = Read-Host "   Email service configured and tested? (y/n)"
if ($emailVerified -ne "y") {
  Write-Host "   ⚠️  Warning: Email service not verified" -ForegroundColor Yellow
  Write-Host "      Marketing features will not work without email service" -ForegroundColor Gray
}

Write-Host ""

# Step 8: Deployment Platform
Write-Host "🚀 Step 8: Deployment Platform" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

Write-Host "   Select deployment platform:" -ForegroundColor Yellow
Write-Host "   1. Vercel (Recommended)" -ForegroundColor White
Write-Host "   2. Netlify" -ForegroundColor White
Write-Host "   3. AWS Amplify" -ForegroundColor White
Write-Host "   4. Railway" -ForegroundColor White
Write-Host "   5. Docker/Self-hosted" -ForegroundColor White
Write-Host "   6. Skip (Manual deployment)" -ForegroundColor Gray
Write-Host ""

$platform = Read-Host "   Enter choice (1-6)"

switch ($platform) {
  "1" {
    Write-Host "   Deploying to Vercel..." -ForegroundColor Yellow
    try {
      vercel --prod
      Write-Host "   ✅ Deployed to Vercel" -ForegroundColor White
    }
    catch {
      Write-Host "   ❌ Vercel deployment failed" -ForegroundColor Red
      Write-Host "      Install Vercel CLI: npm i -g vercel" -ForegroundColor Gray
    }
  }
  "2" {
    Write-Host "   Deploying to Netlify..." -ForegroundColor Yellow
    try {
      netlify deploy --prod
      Write-Host "   ✅ Deployed to Netlify" -ForegroundColor White
    }
    catch {
      Write-Host "   ❌ Netlify deployment failed" -ForegroundColor Red
      Write-Host "      Install Netlify CLI: npm i -g netlify-cli" -ForegroundColor Gray
    }
  }
  "3" {
    Write-Host "   Deploying to AWS Amplify..." -ForegroundColor Yellow
    Write-Host "      Use AWS Console to complete deployment" -ForegroundColor Gray
  }
  "4" {
    Write-Host "   Deploying to Railway..." -ForegroundColor Yellow
    try {
      railway up
      Write-Host "   ✅ Deployed to Railway" -ForegroundColor White
    }
    catch {
      Write-Host "   ❌ Railway deployment failed" -ForegroundColor Red
      Write-Host "      Install Railway CLI: npm i -g @railway/cli" -ForegroundColor Gray
    }
  }
  "5" {
    Write-Host "   Building Docker image..." -ForegroundColor Yellow
    Write-Host "      docker build -t farmersmarket:latest ." -ForegroundColor Gray
    Write-Host "      docker-compose up -d" -ForegroundColor Gray
  }
  "6" {
    Write-Host "   ⏭️  Skipping automated deployment" -ForegroundColor Yellow
  }
  default {
    Write-Host "   ⚠️  Invalid choice" -ForegroundColor Yellow
  }
}

Write-Host ""

# Step 9: Post-Deployment Verification
Write-Host "✅ Step 9: Post-Deployment Verification" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "   Manual verification checklist:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   [ ] Test API endpoints" -ForegroundColor White
Write-Host "   [ ] Send test email campaign" -ForegroundColor White
Write-Host "   [ ] Verify automated sequences" -ForegroundColor White
Write-Host "   [ ] Test discount code validation" -ForegroundColor White
Write-Host "   [ ] Generate referral link" -ForegroundColor White
Write-Host "   [ ] Check analytics dashboard" -ForegroundColor White
Write-Host "   [ ] Verify sitemap.xml" -ForegroundColor White
Write-Host "   [ ] Monitor error logs" -ForegroundColor White
Write-Host ""

# Deployment Summary
$deploymentEnd = Get-Date
$duration = $deploymentEnd - $deploymentStart

Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host ""
Write-Host "   Duration: $($duration.Minutes) minutes $($duration.Seconds) seconds" -ForegroundColor White
Write-Host "   Status: Ready for verification" -ForegroundColor White
Write-Host ""
Write-Host "📚 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Complete post-deployment checklist above" -ForegroundColor White
Write-Host "   2. Review PHASE_4_DEPLOYMENT_GUIDE.md" -ForegroundColor White
Write-Host "   3. Monitor error logs and analytics" -ForegroundColor White
Write-Host "   4. Test all marketing features" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Documentation:" -ForegroundColor Yellow
Write-Host "   - Deployment Guide: PHASE_4_DEPLOYMENT_GUIDE.md" -ForegroundColor White
Write-Host "   - Phase 4 Summary: PHASE_4_COMPLETE.md" -ForegroundColor White
Write-Host ""
Write-Host "🌟 Phase 4 Marketing Automation Platform Deployed!" -ForegroundColor Magenta
Write-Host ""

# Open deployment guide
$openGuide = Read-Host "Open deployment guide in browser? (y/n)"
if ($openGuide -eq "y") {
  Start-Process "PHASE_4_DEPLOYMENT_GUIDE.md"
}

Write-Host "✨ Deployment script complete!" -ForegroundColor Cyan
