# ⚡ DIVINE CONTEXT MANAGER - Intelligent File Context Automation
# Automatically manages VS Code file context based on current tasks and agricultural consciousness

param(
  [string]$Action = "refresh",
  [string]$TaskContext = "",
  [int]$MaxFiles = 8,
  [double]$RelevancyThreshold = 0.75
)

Write-Host "🌟 DIVINE CONTEXT MANAGER - Agricultural Consciousness Active" -ForegroundColor Cyan
Write-Host "   Action: $Action | Task: $TaskContext | Max Files: $MaxFiles" -ForegroundColor Gray

# Define agricultural consciousness patterns
$AgriculturalPatterns = @{
  "farm"      = @("farm", "agriculture", "crop", "harvest", "soil", "season")
  "product"   = @("product", "catalog", "inventory", "pricing", "category")
  "order"     = @("order", "cart", "checkout", "payment", "shipping")
  "user"      = @("user", "auth", "profile", "customer", "farmer")
  "admin"     = @("admin", "dashboard", "analytics", "management")
  "api"       = @("api", "endpoint", "route", "handler", "middleware")
  "component" = @("component", "ui", "jsx", "tsx", "styles")
  "database"  = @("prisma", "schema", "migration", "model", "query")
  "test"      = @("test", "spec", "jest", "playwright", "coverage")
  "config"    = @("config", "env", "settings", "constants")
}

# Get current VS Code workspace
$WorkspaceRoot = "V:\Projects\Farmers-Market"
$VsCodeSettings = "$WorkspaceRoot\.vscode\settings.json"

function Get-FileRelevancy {
  param([string]$FilePath, [string]$Context)

  $relevancy = 0.0
  $fileName = [System.IO.Path]::GetFileName($FilePath).ToLower()
  $fileContent = ""

  if (Test-Path $FilePath -PathType Leaf) {
    try {
      $fileContent = (Get-Content $FilePath -Raw -ErrorAction SilentlyContinue).ToLower()
    }
    catch {
      $fileContent = ""
    }
  }

  # Context-based relevancy scoring
  if ($Context) {
    $contextPatterns = $AgriculturalPatterns[$Context.ToLower()]
    if ($contextPatterns) {
      foreach ($pattern in $contextPatterns) {
        if ($fileName -like "*$pattern*") { $relevancy += 0.3 }
        if ($fileContent -like "*$pattern*") { $relevancy += 0.2 }
      }
    }
  }

  # File type bonuses
  switch -Regex ($fileName) {
    "\.tsx?$" { $relevancy += 0.2 }
    "\.jsx?$" { $relevancy += 0.15 }
    "\.prisma$" { $relevancy += 0.25 }
    "\.test\." { $relevancy += 0.1 }
    "\.md$" { $relevancy += 0.05 }
    "api.*route" { $relevancy += 0.3 }
    "component" { $relevancy += 0.2 }
  }

  # Agricultural consciousness bonus
  $agriculturalKeywords = @("farm", "agriculture", "crop", "harvest", "biodynamic", "quantum")
  foreach ($keyword in $agriculturalKeywords) {
    if ($fileName -like "*$keyword*" -or $fileContent -like "*$keyword*") {
      $relevancy += 0.15
    }
  }

  # Recent modification bonus
  if (Test-Path $FilePath -PathType Leaf) {
    $lastWrite = (Get-Item $FilePath).LastWriteTime
    $daysSinceModified = (Get-Date) - $lastWrite
    if ($daysSinceModified.TotalDays -lt 1) { $relevancy += 0.2 }
    elseif ($daysSinceModified.TotalDays -lt 7) { $relevancy += 0.1 }
  }

  return [Math]::Min($relevancy, 1.0)
}

function Get-RelevantFiles {
  param([string]$Context, [int]$MaxCount)

  Write-Host "   🔍 Scanning for relevant files..." -ForegroundColor Yellow

  # Define search directories based on context
  $searchDirs = @()
  switch ($Context.ToLower()) {
    "farm" { $searchDirs = @("src/components/farm", "src/pages/farms", "src/lib/farm", "src/types", "prisma") }
    "product" { $searchDirs = @("src/components/product", "src/pages/products", "src/lib/product", "src/types") }
    "api" { $searchDirs = @("src/pages/api", "src/lib/api", "src/middleware") }
    "component" { $searchDirs = @("src/components", "src/ui", "src/hooks") }
    "database" { $searchDirs = @("prisma", "src/lib/db", "src/types") }
    default { $searchDirs = @("src", "prisma", ".github/instructions") }
  }

  $relevantFiles = @()

  foreach ($dir in $searchDirs) {
    $fullPath = Join-Path $WorkspaceRoot $dir
    if (Test-Path $fullPath) {
      $files = Get-ChildItem -Path $fullPath -Recurse -File | Where-Object {
        $_.Extension -match "\.(ts|tsx|js|jsx|prisma|md|json)$" -and
        $_.Name -notlike "*.test.*" -and
        $_.Name -notlike "*.spec.*" -and
        $_.FullName -notlike "*node_modules*" -and
        $_.FullName -notlike "*.next*"
      }

      foreach ($file in $files) {
        $relevancy = Get-FileRelevancy -FilePath $file.FullName -Context $Context
        if ($relevancy -ge $RelevancyThreshold) {
          $relevantFiles += [PSCustomObject]@{
            Path         = $file.FullName
            RelativePath = $file.FullName.Replace("$WorkspaceRoot\", "")
            Relevancy    = $relevancy
            Name         = $file.Name
            LastModified = $file.LastWriteTime
          }
        }
      }
    }
  }

  # Sort by relevancy and return top files
  $topFiles = $relevantFiles | Sort-Object Relevancy -Descending | Select-Object -First $MaxCount

  Write-Host "   ✅ Found $($topFiles.Count) relevant files" -ForegroundColor Green
  return $topFiles
}

function Update-VSCodeContext {
  param([array]$Files)

  Write-Host "   📝 Updating VS Code context..." -ForegroundColor Yellow

  # Create context update commands
  $contextFiles = @()
  foreach ($file in $Files) {
    $contextFiles += $file.RelativePath
    Write-Host "      + $($file.Name) (relevancy: $($file.Relevancy.ToString('F2')))" -ForegroundColor Gray
  }

  # You can extend this to actually update VS Code context
  # For now, we'll create a context file that extensions can read
  $contextData = @{
    timestamp          = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    context            = $TaskContext
    files              = $contextFiles
    maxFiles           = $MaxFiles
    relevancyThreshold = $RelevancyThreshold
  } | ConvertTo-Json -Depth 3

  $contextFile = Join-Path $WorkspaceRoot ".vscode\context-manager.json"
  $contextData | Out-File -FilePath $contextFile -Encoding UTF8

  Write-Host "   ✅ Context updated: $($Files.Count) files in scope" -ForegroundColor Green
}

function Show-ContextSummary {
  param([array]$Files)

  Write-Host "`n🌾 AGRICULTURAL CONTEXT SUMMARY" -ForegroundColor Cyan
  Write-Host "   Task Context: $TaskContext" -ForegroundColor White
  Write-Host "   Active Files: $($Files.Count)/$MaxFiles" -ForegroundColor White
  Write-Host "   Agricultural Consciousness: ACTIVE" -ForegroundColor Yellow

  if ($Files.Count -gt 0) {
    Write-Host "`n   📁 Files in Context:" -ForegroundColor White
    foreach ($file in $Files | Sort-Object Relevancy -Descending) {
      $indicator = if ($file.Relevancy -ge 0.8) { "🌟" } elseif ($file.Relevancy -ge 0.6) { "⭐" } else { "📄" }
      Write-Host "      $indicator $($file.Name) ($($file.Relevancy.ToString('F2')))" -ForegroundColor Gray
    }
  }

  Write-Host "`n🎯 To manually add files to context:" -ForegroundColor Yellow
  Write-Host "   - Use '@workspace #file:filename' in Copilot Chat" -ForegroundColor Gray
  Write-Host "   - Or drag files into chat from Explorer" -ForegroundColor Gray
}

# Main execution logic
try {
  switch ($Action.ToLower()) {
    "refresh" {
      if (-not $TaskContext) {
        Write-Host "⚠️  No task context specified. Using 'general' context." -ForegroundColor Yellow
        $TaskContext = "general"
      }

      $relevantFiles = Get-RelevantFiles -Context $TaskContext -MaxCount $MaxFiles
      Update-VSCodeContext -Files $relevantFiles
      Show-ContextSummary -Files $relevantFiles
    }

    "clear" {
      Write-Host "   🧹 Clearing context..." -ForegroundColor Yellow
      $contextFile = Join-Path $WorkspaceRoot ".vscode\context-manager.json"
      if (Test-Path $contextFile) {
        Remove-Item $contextFile -Force
      }
      Write-Host "   ✅ Context cleared" -ForegroundColor Green
    }

    "status" {
      $contextFile = Join-Path $WorkspaceRoot ".vscode\context-manager.json"
      if (Test-Path $contextFile) {
        $context = Get-Content $contextFile | ConvertFrom-Json
        Write-Host "   📊 Current Context Status:" -ForegroundColor Cyan
        Write-Host "      Context: $($context.context)" -ForegroundColor White
        Write-Host "      Files: $($context.files.Count)" -ForegroundColor White
        Write-Host "      Updated: $($context.timestamp)" -ForegroundColor White
      }
      else {
        Write-Host "   ⚠️ No active context found" -ForegroundColor Yellow
      }
    }

    default {
      Write-Host "   ❌ Unknown action: $Action" -ForegroundColor Red
      Write-Host "   Available actions: refresh, clear, status" -ForegroundColor Gray
    }
  }

}
catch {
  Write-Host "❌ Error in context management: $_" -ForegroundColor Red
  Write-Host "   Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Gray
}

Write-Host "`n🌟 Divine context management complete!" -ForegroundColor Green
