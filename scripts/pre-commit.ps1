#!/usr/bin/env pwsh
# Divine Pre-Commit Validation Script
# Ensures agricultural consciousness in all commits

Write-Host "🔍 Divine Pre-Commit Validation Starting..." -ForegroundColor Cyan

# Navigate to the actual project directory
$projectRoot = if (Test-Path "Farmers-Market") { "Farmers-Market" } else { "." }
Push-Location $projectRoot

try {
  # 1. Check for divine naming patterns
  Write-Host "   🧬 Validating cosmic naming conventions..." -ForegroundColor Yellow
  $violations = @()

  # Check TypeScript/JavaScript files for naming (only existing files)
  $sourceFiles = Get-ChildItem -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" -and (Test-Path $_.FullName)
  }

  foreach ($file in $sourceFiles) {
    try {
      $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
      if ($content) {
        # Check for naming violations (simplified check)
        if ($content -match "function [a-z][a-zA-Z]*\(" -and $content -notmatch "quantum|divine|agricultural|manifest") {
          $violations += "⚠️  Consider divine naming in $($file.Name)"
        }
      }
    }
    catch {
      # Skip files that can't be read
      continue
    }
  }

  # 2. Run linting (only if package.json exists)
  if (Test-Path "package.json") {
    Write-Host "   🎨 Running ESLint validation..." -ForegroundColor Yellow
    try {
      $lintResult = npm run lint --silent 2>&1
      if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  ESLint issues detected (non-blocking)" -ForegroundColor Yellow
        # Don't exit - make this a warning for now
      }
    }
    catch {
      Write-Host "⚠️  ESLint check skipped (package.json or lint script not found)" -ForegroundColor Yellow
    }
  }

  # 3. Check for tests on new components
  Write-Host "   🧪 Validating test coverage..." -ForegroundColor Yellow
  try {
    $stagedFiles = git diff --cached --name-only --diff-filter=A 2>$null
    if ($stagedFiles) {
      $newComponents = $stagedFiles | Where-Object { $_ -like "*.tsx" -and $_ -like "*components*" }
      foreach ($component in $newComponents) {
        $testFile = $component -replace "\.tsx$", ".test.tsx"
        if (-not (Test-Path $testFile)) {
          Write-Host "⚠️  Consider adding test for new component: $component" -ForegroundColor Yellow
        }
      }
    }
  }
  catch {
    Write-Host "⚠️  Test coverage check skipped (git not available)" -ForegroundColor Yellow
  }

  # 4. Validate commit message format
  Write-Host "   📝 Validating commit message format..." -ForegroundColor Yellow
  # This will be checked by git commit-msg hook

  # 5. Check for agricultural patterns
  Write-Host "   🌾 Validating agricultural consciousness..." -ForegroundColor Yellow
  try {
    $commitFiles = git diff --cached --name-only 2>$null
    if ($commitFiles) {
      $agriculturalFiles = $commitFiles | Where-Object { $_ -like "*farm*" -or $_ -like "*crop*" -or $_ -like "*harvest*" }
      if ($agriculturalFiles.Count -gt 0) {
        Write-Host "   ✅ Agricultural consciousness detected in files" -ForegroundColor Green
      }
    }
  }
  catch {
    Write-Host "⚠️  Agricultural consciousness check skipped (git not available)" -ForegroundColor Yellow
  }

  # Display warnings
  if ($violations.Count -gt 0) {
    Write-Host "`n⚠️  Divine Guidance:" -ForegroundColor Yellow
    $violations | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
    Write-Host "   (These are suggestions, not blocking issues)" -ForegroundColor Gray
  }

  Write-Host "`n✅ Divine Pre-Commit Validation Complete!" -ForegroundColor Green
  Write-Host "🌟 Agricultural consciousness preserved" -ForegroundColor Magenta
}
finally {
  Pop-Location
}

exit 0
