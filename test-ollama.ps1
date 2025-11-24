# 🌟 Ollama Integration Test Script
# HP OMEN Divine Agricultural AI - DeepSeek-R1:7b
# Test Ollama setup and integration with Farmers Market Platform

param(
    [switch]$Verbose,
    [switch]$SkipGPU,
    [string]$Model = "deepseek-r1:7b"
)

$ErrorActionPreference = "Continue"

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

function Write-TestHeader {
    param([string]$Message)
    Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║ $Message" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
}

function Write-TestStep {
    param([string]$Message)
    Write-Host "`n🔍 $Message" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "   $Message" -ForegroundColor Gray
}

# ============================================================================
# MAIN TEST SCRIPT
# ============================================================================

Write-TestHeader "🌾 OLLAMA INTEGRATION TEST SUITE - HP OMEN EDITION"
Write-Host ""
Write-Host "Testing Ollama DeepSeek-R1:7b integration..." -ForegroundColor White
Write-Host "Hardware: RTX 2070 Max-Q | 64GB RAM | 12 Threads" -ForegroundColor Gray
Write-Host ""

$testsPassed = 0
$testsFailed = 0
$testsWarning = 0

# ============================================================================
# TEST 1: Check if Ollama is installed
# ============================================================================

Write-TestStep "Test 1: Checking Ollama installation..."

try {
    $ollamaVersion = ollama --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Ollama is installed!"
        Write-Info "Version: $ollamaVersion"
        $testsPassed++
    } else {
        throw "Ollama command failed"
    }
} catch {
    Write-Error "Ollama is not installed!"
    Write-Info "Install from: https://ollama.com/download/windows"
    Write-Info "Or run: winget install Ollama.Ollama"
    $testsFailed++
}

# ============================================================================
# TEST 2: Check if Ollama service is running
# ============================================================================

Write-TestStep "Test 2: Checking Ollama service status..."

try {
    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Success "Ollama service is running!"
    Write-Info "Server URL: http://localhost:11434"
    $testsPassed++
} catch {
    Write-Error "Ollama service is not running!"
    Write-Info "Start it with: ollama serve"
    Write-Info "Or in a new terminal window: Start-Process ollama -ArgumentList 'serve' -NoNewWindow"
    $testsFailed++

    # Try to start Ollama automatically
    Write-Warning "Attempting to start Ollama service..."
    try {
        Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
        Start-Sleep -Seconds 3

        $response = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Success "Successfully started Ollama service!"
        $testsFailed--
        $testsPassed++
    } catch {
        Write-Error "Could not auto-start Ollama. Please start it manually."
    }
}

# ============================================================================
# TEST 3: Check for DeepSeek-R1:7b model
# ============================================================================

Write-TestStep "Test 3: Checking for $Model model..."

try {
    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method GET -ErrorAction Stop
    $models = $response.models

    if ($models) {
        Write-Info "Available models: $($models.Count)"

        $hasModel = $models | Where-Object { $_.name -like "*$Model*" }

        if ($hasModel) {
            Write-Success "$Model is installed!"
            Write-Info "Model: $($hasModel.name)"
            Write-Info "Size: $([Math]::Round($hasModel.size / 1GB, 2)) GB"
            Write-Info "Modified: $($hasModel.modified_at)"
            $testsPassed++
        } else {
            Write-Error "$Model not found!"
            Write-Info "Available models:"
            foreach ($model in $models) {
                Write-Info "  - $($model.name)"
            }
            Write-Warning "Install $Model with: ollama pull $Model"
            $testsFailed++
        }
    } else {
        Write-Error "No models installed!"
        Write-Warning "Install $Model with: ollama pull $Model"
        $testsFailed++
    }
} catch {
    Write-Error "Could not list models: $($_.Exception.Message)"
    $testsFailed++
}

# ============================================================================
# TEST 4: Test basic inference
# ============================================================================

Write-TestStep "Test 4: Testing basic inference..."

try {
    $body = @{
        model = $Model
        prompt = "What is biodynamic farming? Answer in one sentence."
        stream = $false
        options = @{
            num_predict = 100
        }
    } | ConvertTo-Json

    Write-Info "Sending test prompt to Ollama..."
    $startTime = Get-Date

    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -TimeoutSec 60 `
        -ErrorAction Stop

    $duration = (Get-Date) - $startTime

    if ($response.response) {
        Write-Success "Inference successful!"

        $responseText = $response.response
        $displayLength = [Math]::Min(150, $responseText.Length)
        Write-Info "Response: $($responseText.Substring(0, $displayLength))..."
        Write-Info "Duration: $([Math]::Round($duration.TotalSeconds, 2)) seconds"

        if ($response.eval_count -and $response.eval_duration) {
            $tokensPerSec = [Math]::Round($response.eval_count / ($response.eval_duration / 1000000000), 2)
            Write-Info "Speed: $tokensPerSec tokens/second"
            Write-Info "Tokens generated: $($response.eval_count)"

            # Performance assessment
            if ($tokensPerSec -gt 20) {
                Write-Success "Excellent performance! GPU acceleration detected."
            } elseif ($tokensPerSec -gt 10) {
                Write-Warning "Good performance, but could be better. Check GPU utilization."
            } else {
                Write-Warning "Slow performance. May be using CPU instead of GPU."
            }
        }

        $testsPassed++
    } else {
        Write-Error "No response received from model!"
        $testsFailed++
    }
} catch {
    Write-Error "Inference failed: $($_.Exception.Message)"
    Write-Info "Make sure $Model is installed: ollama pull $Model"
    $testsFailed++
}

# ============================================================================
# TEST 5: Test chat endpoint
# ============================================================================

Write-TestStep "Test 5: Testing chat endpoint..."

try {
    $messages = @(
        @{
            role = "system"
            content = "You are an agricultural expert. Answer concisely."
        },
        @{
            role = "user"
            content = "What are the top 3 benefits of crop rotation?"
        }
    )

    $body = @{
        model = $Model
        messages = $messages
        stream = $false
    } | ConvertTo-Json -Depth 3

    Write-Info "Testing chat API..."
    $startTime = Get-Date

    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/chat" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -TimeoutSec 60 `
        -ErrorAction Stop

    $duration = (Get-Date) - $startTime

    if ($response.message.content) {
        Write-Success "Chat endpoint working!"

        $chatResponse = $response.message.content
        $displayLength = [Math]::Min(150, $chatResponse.Length)
        Write-Info "Response: $($chatResponse.Substring(0, $displayLength))..."
        Write-Info "Duration: $([Math]::Round($duration.TotalSeconds, 2)) seconds"

        $testsPassed++
    } else {
        Write-Error "No response from chat endpoint!"
        $testsFailed++
    }
} catch {
    Write-Error "Chat test failed: $($_.Exception.Message)"
    $testsFailed++
}

# ============================================================================
# TEST 6: GPU utilization check
# ============================================================================

if (-not $SkipGPU) {
    Write-TestStep "Test 6: Checking GPU utilization..."

    try {
        $gpuInfo = nvidia-smi --query-gpu=name,temperature.gpu,utilization.gpu,utilization.memory,memory.used,memory.total --format=csv,noheader,nounits 2>$null

        if ($gpuInfo) {
            $gpuStats = $gpuInfo -split ','
            Write-Success "GPU detected!"
            Write-Info "GPU: $($gpuStats[0].Trim())"
            Write-Info "Temperature: $($gpuStats[1].Trim())°C"
            Write-Info "GPU Utilization: $($gpuStats[2].Trim())%"
            Write-Info "Memory Utilization: $($gpuStats[3].Trim())%"
            Write-Info "VRAM Used: $($gpuStats[4].Trim())MB / $($gpuStats[5].Trim())MB"

            $gpuUtil = [int]$gpuStats[2].Trim()
            $memUsed = [int]$gpuStats[4].Trim()

            if ($gpuUtil -gt 50 -or $memUsed -gt 1000) {
                Write-Success "GPU is being actively used!"
                $testsPassed++
            } elseif ($gpuUtil -gt 10 -or $memUsed -gt 500) {
                Write-Warning "GPU has some activity, but usage is low."
                Write-Info "This is normal when model is idle."
                $testsWarning++
            } else {
                Write-Warning "Low GPU utilization detected."
                Write-Info "Run inference test again to see GPU in action."
                $testsWarning++
            }
        } else {
            Write-Warning "nvidia-smi not found or GPU not detected"
            Write-Info "This is expected if you don't have NVIDIA GPU or drivers installed"
            $testsWarning++
        }
    } catch {
        Write-Warning "Could not check GPU stats: $($_.Exception.Message)"
        Write-Info "Ensure NVIDIA drivers are installed"
        $testsWarning++
    }
} else {
    Write-Info "Skipping GPU check (-SkipGPU flag set)"
}

# ============================================================================
# TEST 7: Platform integration check
# ============================================================================

Write-TestStep "Test 7: Checking platform integration..."

try {
    # Check if platform files exist
    $ollamaLibPath = "src\lib\ai\ollama.ts"
    $ollamaApiPath = "src\app\api\ai\ollama\route.ts"
    $analyzeApiPath = "src\app\api\ai\ollama\analyze\route.ts"

    $filesExist = @()
    $filesMissing = @()

    @($ollamaLibPath, $ollamaApiPath, $analyzeApiPath) | ForEach-Object {
        if (Test-Path $_) {
            $filesExist += $_
        } else {
            $filesMissing += $_
        }
    }

    if ($filesExist.Count -eq 3) {
        Write-Success "All platform integration files exist!"
        foreach ($file in $filesExist) {
            Write-Info "✓ $file"
        }
        $testsPassed++
    } else {
        Write-Warning "Some platform files are missing:"
        foreach ($file in $filesMissing) {
            Write-Info "✗ $file"
        }
        Write-Info "Files may not be in expected location."
        $testsWarning++
    }
} catch {
    Write-Warning "Could not verify platform integration files"
    $testsWarning++
}

# ============================================================================
# TEST 8: Agricultural domain test
# ============================================================================

Write-TestStep "Test 8: Testing agricultural domain knowledge..."

try {
    $agriculturalPrompt = @"
You are an expert in biodynamic farming. A farmer asks:
"My tomato plants have yellowing leaves. What could be wrong?"
Provide 3 possible causes and 1 recommendation for each. Be concise.
"@

    $body = @{
        model = $Model
        prompt = $agriculturalPrompt
        stream = $false
        options = @{
            temperature = 0.7
            num_predict = 300
        }
    } | ConvertTo-Json

    Write-Info "Testing agricultural knowledge..."

    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -TimeoutSec 60 `
        -ErrorAction Stop

    if ($response.response) {
        $agriculturalResponse = $response.response

        # Check for agricultural keywords
        $keywords = @("nitrogen", "nutrient", "water", "soil", "deficiency", "fertilizer", "compost")
        $foundKeywords = $keywords | Where-Object { $agriculturalResponse -match $_ }

        if ($foundKeywords.Count -ge 2) {
            Write-Success "Model demonstrates agricultural knowledge!"
            Write-Info "Found agricultural terms: $($foundKeywords -join ', ')"

            if ($Verbose) {
                Write-Host "`nFull Response:" -ForegroundColor Cyan
                Write-Host $agriculturalResponse -ForegroundColor White
            }

            $testsPassed++
        } else {
            Write-Warning "Model response lacks agricultural specificity."
            Write-Info "Consider using a more specialized prompt or model."
            $testsWarning++
        }
    } else {
        Write-Error "No response from agricultural test!"
        $testsFailed++
    }
} catch {
    Write-Error "Agricultural domain test failed: $($_.Exception.Message)"
    $testsFailed++
}

# ============================================================================
# SUMMARY
# ============================================================================

Write-TestHeader "📊 TEST SUMMARY"

$totalTests = $testsPassed + $testsFailed + $testsWarning

Write-Host ""
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Success "Passed: $testsPassed"
Write-Error "Failed: $testsFailed"
Write-Warning "Warnings: $testsWarning"
Write-Host ""

# Calculate success rate
$successRate = if ($totalTests -gt 0) { [Math]::Round(($testsPassed / $totalTests) * 100, 2) } else { 0 }

if ($testsFailed -eq 0 -and $testsWarning -eq 0) {
    Write-Host "🎉 PERFECT! All tests passed!" -ForegroundColor Green
    Write-Host "Your Ollama integration is fully operational." -ForegroundColor Green
} elseif ($testsFailed -eq 0) {
    Write-Host "✅ SUCCESS! All critical tests passed (with $testsWarning warnings)." -ForegroundColor Yellow
    Write-Host "Your Ollama integration is operational." -ForegroundColor Yellow
} elseif ($successRate -ge 50) {
    Write-Host "⚠️  PARTIAL SUCCESS: $successRate% tests passed." -ForegroundColor Yellow
    Write-Host "Some features may not work correctly." -ForegroundColor Yellow
} else {
    Write-Host "❌ FAILURE: Only $successRate% tests passed." -ForegroundColor Red
    Write-Host "Please address the failed tests above." -ForegroundColor Red
}

Write-Host ""

# ============================================================================
# RECOMMENDATIONS
# ============================================================================

if ($testsFailed -gt 0 -or $testsWarning -gt 0) {
    Write-TestHeader "💡 RECOMMENDATIONS"
    Write-Host ""

    if ($testsFailed -gt 0) {
        Write-Host "Critical Issues to Fix:" -ForegroundColor Red
        Write-Info "1. Ensure Ollama is installed and running: ollama serve"
        Write-Info "2. Pull the model: ollama pull $Model"
        Write-Info "3. Check firewall settings for port 11434"
        Write-Host ""
    }

    if ($testsWarning -gt 0) {
        Write-Host "Optional Improvements:" -ForegroundColor Yellow
        Write-Info "1. Update NVIDIA drivers for better GPU performance"
        Write-Info '2. Increase context window with: $env:OLLAMA_NUM_CTX=''4096'''
        Write-Info '3. Keep model loaded: $env:OLLAMA_KEEP_ALIVE=''24h'''
        Write-Host ""
    }
}

# ============================================================================
# NEXT STEPS
# ============================================================================

if ($testsPassed -ge 6) {
    Write-TestHeader "🚀 NEXT STEPS"
    Write-Host ""
    Write-Info "1. Start the platform: npm run dev:omen"
    Write-Info "2. Test API endpoints at http://localhost:3001/api/ai/ollama"
    Write-Info "3. Review the setup guide: OLLAMA_SETUP_GUIDE.md"
    Write-Info "4. Integrate AI features into your application"
    Write-Host ""
}

# ============================================================================
# QUICK REFERENCE
# ============================================================================

Write-TestHeader "📚 QUICK REFERENCE"
Write-Host ""
Write-Host "Ollama Commands:" -ForegroundColor Cyan
Write-Info "  ollama serve              - Start Ollama service"
Write-Info "  ollama list               - List installed models"
Write-Info "  ollama pull $Model - Install model"
Write-Info "  ollama run $Model  - Interactive chat"
Write-Info "  ollama rm $Model   - Remove model"
Write-Host ""
Write-Host "Platform Commands:" -ForegroundColor Cyan
Write-Info "  npm run dev:omen          - Start dev server (HP OMEN optimized)"
Write-Info "  npm run test              - Run tests"
Write-Host ""
Write-Host "Useful URLs:" -ForegroundColor Cyan
Write-Info "  http://localhost:11434            - Ollama API"
Write-Info "  http://localhost:3001             - Platform"
Write-Info "  http://localhost:3001/api/ai/ollama - Chat endpoint"
Write-Host ""

# ============================================================================
# EXIT CODE
# ============================================================================

if ($testsFailed -eq 0) {
    exit 0
} else {
    exit 1
}
