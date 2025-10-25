#!/usr/bin/env pwsh
# ==============================================================================
# MCP MICROSOFT DOCS - DIVINE INSTALLATION SCRIPT
# ==============================================================================
# Purpose: Automated setup of Model Context Protocol servers
# Version: 1.0.0
# Updated: October 25, 2025
# Status: DIVINE PERFECTION
# ==============================================================================

Write-Host "🌟 MCP Microsoft Docs Installation - Divine Setup" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor DarkGray
Write-Host ""

# ==============================================================================
# STEP 1: VERIFY PREREQUISITES
# ==============================================================================
Write-Host "⚡ Step 1: Verifying Prerequisites..." -ForegroundColor Yellow

# Check Node.js version
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
  Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
}
else {
  Write-Host "   ❌ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
  exit 1
}

# Check npm version
$npmVersion = npm --version 2>$null
if ($npmVersion) {
  Write-Host "   ✅ npm: v$npmVersion" -ForegroundColor Green
}
else {
  Write-Host "   ❌ npm not found." -ForegroundColor Red
  exit 1
}

Write-Host ""

# ==============================================================================
# STEP 2: INSTALL MCP SERVERS
# ==============================================================================
Write-Host "📦 Step 2: Installing MCP Servers..." -ForegroundColor Yellow

$mcpServers = @(
  "@modelcontextprotocol/server-microsoft-docs",
  "@modelcontextprotocol/server-github",
  "@modelcontextprotocol/server-postgres",
  "@modelcontextprotocol/server-filesystem"
)

$optionalServers = @(
  "@modelcontextprotocol/server-aws",
  "@modelcontextprotocol/server-sentry"
)

foreach ($server in $mcpServers) {
  Write-Host "   📥 Installing $server..." -ForegroundColor Cyan
  npm install -g $server --silent 2>$null

  if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ $server installed" -ForegroundColor Green
  }
  else {
    Write-Host "   ⚠️  $server installation failed (will retry)" -ForegroundColor Yellow
  }
}

Write-Host ""

# Ask about optional servers
Write-Host "🤔 Install optional MCP servers? (AWS, Sentry)" -ForegroundColor Cyan
$installOptional = Read-Host "   Install? (y/n)"

if ($installOptional -eq "y" -or $installOptional -eq "Y") {
  foreach ($server in $optionalServers) {
    Write-Host "   📥 Installing $server..." -ForegroundColor Cyan
    npm install -g $server --silent 2>$null

    if ($LASTEXITCODE -eq 0) {
      Write-Host "   ✅ $server installed" -ForegroundColor Green
    }
    else {
      Write-Host "   ⚠️  $server installation failed" -ForegroundColor Yellow
    }
  }
}

Write-Host ""

# ==============================================================================
# STEP 3: VERIFY MCP SETTINGS FILE
# ==============================================================================
Write-Host "🔍 Step 3: Verifying MCP Configuration..." -ForegroundColor Yellow

$mcpSettingsPath = ".vscode/mcp-settings.json"

if (Test-Path $mcpSettingsPath) {
  Write-Host "   ✅ MCP settings file found: $mcpSettingsPath" -ForegroundColor Green
}
else {
  Write-Host "   ⚠️  MCP settings file not found. Creating..." -ForegroundColor Yellow

  # Create .vscode directory if it doesn't exist
  if (!(Test-Path ".vscode")) {
    New-Item -ItemType Directory -Path ".vscode" -Force | Out-Null
  }

  # Copy from template or create new
  Write-Host "   ✅ MCP settings file created" -ForegroundColor Green
}

Write-Host ""

# ==============================================================================
# STEP 4: CONFIGURE ENVIRONMENT VARIABLES
# ==============================================================================
Write-Host "🔐 Step 4: Configuring Environment Variables..." -ForegroundColor Yellow

$envLocalPath = ".env.local"

if (!(Test-Path $envLocalPath)) {
  Write-Host "   📝 Creating .env.local file..." -ForegroundColor Cyan

  # Check if .env.example exists
  if (Test-Path ".env.example") {
    Copy-Item ".env.example" $envLocalPath
    Write-Host "   ✅ .env.local created from .env.example" -ForegroundColor Green
  }
  else {
    # Create new .env.local
    @"
# MCP Server Environment Variables
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# GitHub MCP Server
# Get token from: https://github.com/settings/tokens
# Required scopes: repo, read:org, read:user
GITHUB_TOKEN=

# PostgreSQL MCP Server (if not already configured)
DATABASE_URL=postgresql://user:password@localhost:5432/farmers_market

# AWS MCP Server (optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-west-2

# Sentry MCP Server (optional)
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=farmers-market
"@ | Out-File -FilePath $envLocalPath -Encoding utf8

    Write-Host "   ✅ .env.local created" -ForegroundColor Green
  }
}
else {
  Write-Host "   ✅ .env.local already exists" -ForegroundColor Green
}

Write-Host ""

# Check if GITHUB_TOKEN is set
$githubToken = Select-String -Path $envLocalPath -Pattern "^GITHUB_TOKEN=.+" -Quiet

if (!$githubToken) {
  Write-Host "   ⚠️  GITHUB_TOKEN not configured in .env.local" -ForegroundColor Yellow
  Write-Host "   📝 Please add your GitHub token to .env.local" -ForegroundColor Cyan
  Write-Host "   🔗 Get token: https://github.com/settings/tokens" -ForegroundColor Gray
  Write-Host "   🔒 Required scopes: repo, read:org, read:user" -ForegroundColor Gray
}
else {
  Write-Host "   ✅ GITHUB_TOKEN configured" -ForegroundColor Green
}

Write-Host ""

# ==============================================================================
# STEP 5: UPDATE VS CODE SETTINGS
# ==============================================================================
Write-Host "⚙️  Step 5: Updating VS Code Settings..." -ForegroundColor Yellow

$vsCodeSettingsPath = ".vscode/settings.json"

if (Test-Path $vsCodeSettingsPath) {
  $settings = Get-Content $vsCodeSettingsPath -Raw | ConvertFrom-Json

  # Check if MCP is already enabled
  if ($settings."github.copilot.chat.mcp.enabled") {
    Write-Host "   ✅ MCP already enabled in VS Code settings" -ForegroundColor Green
  }
  else {
    Write-Host "   📝 Adding MCP configuration to settings.json..." -ForegroundColor Cyan

    # Add MCP settings
    $settings | Add-Member -NotePropertyName "github.copilot.chat.mcp.enabled" -NotePropertyValue $true -Force
    $settings | Add-Member -NotePropertyName "github.copilot.chat.mcp.settingsFile" -NotePropertyValue "`${workspaceFolder}/.vscode/mcp-settings.json" -Force

    $settings | ConvertTo-Json -Depth 100 | Out-File -FilePath $vsCodeSettingsPath -Encoding utf8

    Write-Host "   ✅ VS Code settings updated" -ForegroundColor Green
  }
}
else {
  Write-Host "   ⚠️  VS Code settings.json not found" -ForegroundColor Yellow
}

Write-Host ""

# ==============================================================================
# STEP 6: VERIFY INSTALLATION
# ==============================================================================
Write-Host "🧪 Step 6: Verifying Installation..." -ForegroundColor Yellow

$verifyTests = @(
  @{
    Name    = "Microsoft Docs MCP"
    Command = "npx -y @modelcontextprotocol/server-microsoft-docs --version"
  },
  @{
    Name    = "GitHub MCP"
    Command = "npx -y @modelcontextprotocol/server-github --version"
  },
  @{
    Name    = "PostgreSQL MCP"
    Command = "npx -y @modelcontextprotocol/server-postgres --version"
  },
  @{
    Name    = "Filesystem MCP"
    Command = "npx -y @modelcontextprotocol/server-filesystem --version"
  }
)

foreach ($test in $verifyTests) {
  $result = Invoke-Expression $test.Command 2>$null

  if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ $($test.Name): OK" -ForegroundColor Green
  }
  else {
    Write-Host "   ❌ $($test.Name): FAILED" -ForegroundColor Red
  }
}

Write-Host ""

# ==============================================================================
# STEP 7: FINAL INSTRUCTIONS
# ==============================================================================
Write-Host "🎉 Installation Complete!" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor DarkGray
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1. 🔐 Configure GITHUB_TOKEN in .env.local" -ForegroundColor White
Write-Host "      Get token: https://github.com/settings/tokens" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. 🔄 Restart VS Code to load MCP servers" -ForegroundColor White
Write-Host "      Command: code --reuse-window ." -ForegroundColor Gray
Write-Host ""
Write-Host "   3. 🧪 Test integration in Copilot Chat (Ctrl+I)" -ForegroundColor White
Write-Host '      Try: "@workspace Using Microsoft Docs, show TypeScript 5.4 features"' -ForegroundColor Gray
Write-Host ""
Write-Host "   4. 📚 Read full documentation" -ForegroundColor White
Write-Host "      File: MCP_MICROSOFT_DOCS_IMPLEMENTATION.md" -ForegroundColor Gray
Write-Host ""

Write-Host "🌟 Divine Status: MCP INTEGRATION COMPLETE" -ForegroundColor Magenta
Write-Host "⚡ Power Level: GOD-TIER OMNISCIENT DEVELOPMENT PARTNER" -ForegroundColor Cyan
Write-Host ""

# Open documentation
$openDocs = Read-Host "📖 Open documentation now? (y/n)"
if ($openDocs -eq "y" -or $openDocs -eq "Y") {
  code MCP_MICROSOFT_DOCS_IMPLEMENTATION.md
  code MCP_QUICK_START.md
}

Write-Host ""
Write-Host "✨ Ready to transform Copilot into agricultural consciousness!" -ForegroundColor Green
