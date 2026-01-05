# Baseline Database Script
# Marks all migrations as applied without running them

Write-Host "🔧 Baselining Database for Vercel Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Get all migration directories
$migrations = Get-ChildItem -Path "prisma/migrations" -Directory | Where-Object { $_.Name -match '^\d+_' } | Sort-Object Name

Write-Host "Found $($migrations.Count) migrations to baseline:" -ForegroundColor Yellow
Write-Host ""

foreach ($migration in $migrations) {
    Write-Host "  ✓ $($migration.Name)" -ForegroundColor Green
}

Write-Host ""
Write-Host "⚠️  WARNING: This will mark all migrations as applied!" -ForegroundColor Yellow
Write-Host "Only proceed if your database schema already matches these migrations." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "Cancelled." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Marking migrations as applied..." -ForegroundColor Cyan

foreach ($migration in $migrations) {
    Write-Host "  → Resolving: $($migration.Name)" -ForegroundColor Gray
    npx prisma migrate resolve --applied $migration.Name
}

Write-Host ""
Write-Host "✅ Database baselined successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next step: Deploy to Vercel" -ForegroundColor Cyan
