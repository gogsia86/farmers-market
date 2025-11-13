#!/usr/bin/env pwsh
# Custom VS Code Layout Launcher
# Opens VS Code with a custom layout: Big editor top, Explorer left, Terminal right, Two chat boxes middle-bottom

Write-Host "🎨 Launching VS Code with Custom Layout..." -ForegroundColor Cyan
Write-Host ""

# Get the workspace root
$WorkspaceRoot = Split-Path -Parent $PSScriptRoot

# Path to custom workspace file
$CustomWorkspace = Join-Path $PSScriptRoot "custom-layout.code-workspace"

# Launch VS Code with the custom workspace
Write-Host "📂 Opening workspace: $CustomWorkspace" -ForegroundColor Green
code "$CustomWorkspace"

Write-Host ""
Write-Host "✨ Custom Layout Configuration:" -ForegroundColor Yellow
Write-Host "   📝 Large Editor Window: Top (70% height)" -ForegroundColor White
Write-Host "   📁 Explorer: Left Sidebar (20% width)" -ForegroundColor White
Write-Host "   💻 Terminal: Right Panel (30% width)" -ForegroundColor White
Write-Host "   💬 Chat Boxes: Middle-Bottom Area" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Manual Layout Adjustments:" -ForegroundColor Cyan
Write-Host "   1. Open Copilot Chat (Ctrl+Alt+I)" -ForegroundColor Gray
Write-Host "   2. Drag chat to bottom panel" -ForegroundColor Gray
Write-Host "   3. Split panel horizontally for two chat boxes" -ForegroundColor Gray
Write-Host "   4. Adjust sizes with drag handles" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Workspace launched successfully!" -ForegroundColor Green
