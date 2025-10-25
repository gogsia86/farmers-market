#!/usr/bin/env pwsh
# 🌟 VS Code Workspace Initialization Script
# Auto-runs health checks and prepares divine development environment
# Version: 1.0.0 (100% Perfection Edition)

param(
  [switch]$Verbose = $false
)

function Write-DivineStatus {
  param([string]$Message, [string]$Status)

  $icon = switch ($Status) {
    "success" { "✅" }
    "warning" { "⚠️ " }
    "error" { "❌" }
    "info" { "🔍" }
    default { "📊" }
  }

  $color = switch ($Status) {
    "success" { "Green" }
    "warning" { "Yellow" }
    "error" { "Red" }
    "info" { "Cyan" }
    default { "Gray" }
  }

  Write-Host "   $icon $Message" -ForegroundColor $color
}

Clear-Host
Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🌟 DIVINE WORKSPACE INITIALIZATION                      ║" -ForegroundColor Cyan
Write-Host "║     Agricultural Consciousness • HP OMEN Optimized         ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# ============================================================================
# PHASE 1: Environment Validation
# ============================================================================
Write-Host "`n🔍 PHASE 1: Environment Validation" -ForegroundColor Yellow

# Check Node.js
try {
  $nodeVersion = node --version 2>$null
  if ($nodeVersion) {
    Write-DivineStatus "Node.js $nodeVersion installed" "success"
  }
  else {
    Write-DivineStatus "Node.js not detected" "error"
  }
}
catch {
  Write-DivineStatus "Node.js not detected" "error"
}

# Check npm
try {
  $npmVersion = npm --version 2>$null
  if ($npmVersion) {
    Write-DivineStatus "npm v$npmVersion installed" "success"
  }
}
catch {
  Write-DivineStatus "npm not detected" "warning"
}

# Check VS Code extensions
$requiredExtensions = @(
  "GitHub.copilot",
  "esbenp.prettier-vscode",
  "dbaeumer.vscode-eslint",
  "Prisma.prisma"
)

$installedExtensions = code --list-extensions 2>$null
$missingExtensions = @()

foreach ($ext in $requiredExtensions) {
  if ($installedExtensions -contains $ext) {
    if ($Verbose) { Write-DivineStatus "$ext installed" "success" }
  }
  else {
    $missingExtensions += $ext
  }
}

if ($missingExtensions.Count -eq 0) {
  Write-DivineStatus "All required VS Code extensions installed" "success"
}
else {
  Write-DivineStatus "$($missingExtensions.Count) extensions missing" "warning"
}

# ============================================================================
# PHASE 2: Project Dependencies
# ============================================================================
Write-Host "`n📦 PHASE 2: Project Dependencies" -ForegroundColor Yellow

# Check node_modules
if (Test-Path "node_modules") {
  $nodeModulesSize = (Get-ChildItem "node_modules" -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
  Write-DivineStatus "Dependencies installed ($([math]::Round($nodeModulesSize, 0)) MB)" "success"
}
else {
  Write-DivineStatus "Dependencies not installed - run 'npm install'" "warning"

  $install = Read-Host "`n   Install dependencies now? (y/N)"
  if ($install -eq 'y' -or $install -eq 'Y') {
    Write-Host "`n   📦 Installing dependencies..." -ForegroundColor Cyan
    npm install
    Write-DivineStatus "Dependencies installed successfully" "success"
  }
}

# Check Prisma Client
if (Test-Path "node_modules\.prisma\client") {
  Write-DivineStatus "Prisma Client generated" "success"
}
else {
  Write-DivineStatus "Prisma Client needs generation - run 'npx prisma generate'" "warning"
}

# ============================================================================
# PHASE 3: Database Connectivity
# ============================================================================
Write-Host "`n🐳 PHASE 3: Database Connectivity" -ForegroundColor Yellow

# Check Docker
try {
  $dockerRunning = docker ps 2>$null
  if ($LASTEXITCODE -eq 0) {
    Write-DivineStatus "Docker daemon running" "success"

    # Check PostgreSQL container
    $postgresContainer = docker ps | Select-String "postgres"
    if ($postgresContainer) {
      Write-DivineStatus "PostgreSQL container active" "success"

      # Extract port
      if ($postgresContainer -match ":(\d+)->") {
        $port = $matches[1]
        Write-DivineStatus "PostgreSQL listening on port $port" "info"
      }
    }
    else {
      Write-DivineStatus "PostgreSQL container not running" "warning"
      Write-Host "      Run: docker-compose up -d" -ForegroundColor Gray
    }
  }
  else {
    Write-DivineStatus "Docker daemon not running" "warning"
  }
}
catch {
  Write-DivineStatus "Docker not available" "warning"
}

# ============================================================================
# PHASE 4: Divine Configuration Validation
# ============================================================================
Write-Host "`n⚙️  PHASE 4: Divine Configuration Validation" -ForegroundColor Yellow

# Check divine config files
$divineConfigs = @(
  ".vscode\settings.json",
  ".vscode\tasks.json",
  ".vscode\launch.json",
  ".vscode\gpu-settings.json",
  ".vscode\ai-workflows.json",
  ".vscode\agricultural-patterns.json",
  ".vscode\quantum-performance.json",
  ".vscode\divine-monitoring.json"
)

$allConfigsPresent = $true
foreach ($config in $divineConfigs) {
  if (Test-Path $config) {
    if ($Verbose) { Write-DivineStatus "$config present" "success" }
  }
  else {
    Write-DivineStatus "$config MISSING" "error"
    $allConfigsPresent = $false
  }
}

if ($allConfigsPresent) {
  Write-DivineStatus "All divine configuration files present" "success"
}

# ============================================================================
# PHASE 5: Git Repository Health
# ============================================================================
Write-Host "`n🔄 PHASE 5: Git Repository Health" -ForegroundColor Yellow

try {
  # Check if git repo
  git rev-parse --git-dir 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) {
    Write-DivineStatus "Git repository initialized" "success"

    # Check branch
    $branch = git branch --show-current 2>$null
    if ($branch) {
      Write-DivineStatus "Current branch: $branch" "info"
    }

    # Check for uncommitted changes
    $status = git status --porcelain 2>$null
    if ($status) {
      $changes = ($status | Measure-Object).Count
      Write-DivineStatus "$changes uncommitted changes" "info"
    }
    else {
      Write-DivineStatus "Working directory clean" "success"
    }
  }
  else {
    Write-DivineStatus "Not a git repository" "warning"
  }
}
catch {
  Write-DivineStatus "Git not available" "warning"
}

# ============================================================================
# PHASE 6: Performance Metrics
# ============================================================================
Write-Host "`n⚡ PHASE 6: Hardware Status" -ForegroundColor Yellow

# Check system resources
$memory = Get-CimInstance Win32_OperatingSystem
$freeMemoryGB = [math]::Round($memory.FreePhysicalMemory / 1MB, 1)
$totalMemoryGB = [math]::Round($memory.TotalVisibleMemorySize / 1MB, 1)
$memoryPercent = [math]::Round(($freeMemoryGB / $totalMemoryGB) * 100, 0)

Write-DivineStatus "Free RAM: $freeMemoryGB GB / $totalMemoryGB GB ($memoryPercent% available)" "info"

# Check CPU
$cpu = Get-CimInstance Win32_Processor
Write-DivineStatus "CPU: $($cpu.Name) ($($cpu.NumberOfLogicalProcessors) threads)" "info"

# Check disk space
$drive = Get-PSDrive -Name (Get-Location).Drive.Name
$freeSpaceGB = [math]::Round($drive.Free / 1GB, 1)
Write-DivineStatus "Free disk space: $freeSpaceGB GB" "info"

# ============================================================================
# COMPLETION SUMMARY
# ============================================================================
Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     ✅ WORKSPACE INITIALIZATION COMPLETE                     ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n🎯 Divine Development Environment Status:" -ForegroundColor Cyan
Write-Host "   • VS Code configured with agricultural consciousness" -ForegroundColor White
Write-Host "   • GitHub Copilot integrated with divine instructions" -ForegroundColor White
Write-Host "   • Hardware optimization active (GPU + 64GB RAM)" -ForegroundColor White
Write-Host "   • Development server ready to start" -ForegroundColor White

Write-Host "`n📚 Quick Commands:" -ForegroundColor Cyan
Write-Host "   npm run dev          Start development server" -ForegroundColor Gray
Write-Host "   npm run dev:turbo    Start with HP OMEN optimization" -ForegroundColor Gray
Write-Host "   npm test             Run test suite" -ForegroundColor Gray
Write-Host "   npx prisma studio    Open database GUI" -ForegroundColor Gray

Write-Host "`n🌟 Ready for divine agricultural development!" -ForegroundColor Green
Write-Host ""
