# 🌟 Ollama DeepSeek-R1:7b Setup Guide

## HP OMEN Laptop Integration - Divine Agricultural AI

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Installation Steps](#installation-steps)
4. [Running Ollama](#running-ollama)
5. [Testing the Integration](#testing-the-integration)
6. [API Usage Examples](#api-usage-examples)
7. [Performance Optimization](#performance-optimization)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This guide will help you set up Ollama with DeepSeek-R1:7b on your HP OMEN laptop and integrate it with the Farmers Market Platform for local, GPU-accelerated agricultural AI assistance.

### Why Ollama + DeepSeek-R1:7b?

- ✅ **Local Inference** - No API costs, complete privacy
- ✅ **GPU Accelerated** - Leverages your RTX 2070 Max-Q
- ✅ **Reasoning Optimized** - DeepSeek-R1 excels at complex reasoning
- ✅ **Agricultural Domain** - Fine-tuned for practical farming advice
- ✅ **7B Parameters** - Perfect balance of quality and speed

### HP OMEN Specs

- **GPU**: NVIDIA RTX 2070 Max-Q (2304 CUDA cores, 8GB VRAM)
- **RAM**: 64GB (excellent for model caching)
- **CPU**: 12 threads (parallel processing)

---

## 🖥️ System Requirements

### Minimum Requirements

- Windows 10/11
- 8GB RAM (you have 64GB ✅)
- GPU with 4GB VRAM (you have 8GB ✅)
- 10GB free disk space

### Your HP OMEN (Actual)

- ✅ 64GB RAM - Can handle multiple models simultaneously
- ✅ RTX 2070 Max-Q - GPU acceleration enabled
- ✅ 12 threads - Excellent parallel processing

---

## 📦 Installation Steps

### Step 1: Install Ollama

#### Option A: Windows Installer (Recommended)

1. **Download Ollama**

   ```powershell
   # Visit the official website
   Start-Process "https://ollama.com/download/windows"
   ```

2. **Run the installer**
   - Download `OllamaSetup.exe`
   - Run as Administrator
   - Follow installation wizard
   - Ollama will be installed to `C:\Users\<YourUsername>\AppData\Local\Programs\Ollama`

3. **Verify Installation**
   ```powershell
   ollama --version
   ```

#### Option B: Manual Installation via WSL2 (Alternative)

If you prefer Linux environment:

```bash
# Install WSL2 with Ubuntu
wsl --install -d Ubuntu-22.04

# In WSL2, install Ollama
curl -fsSL https://ollama.com/install.sh | sh
```

### Step 2: Pull DeepSeek-R1:7b Model

Once Ollama is installed:

```powershell
# Pull the DeepSeek-R1:7b model
ollama pull deepseek-r1:7b
```

**Download Info:**

- Model size: ~4.7GB
- Download time: 5-15 minutes (depending on internet speed)
- Disk space required: ~5GB

### Step 3: Verify GPU Support

```powershell
# Check if GPU is detected
nvidia-smi

# Run Ollama with GPU info
ollama run deepseek-r1:7b "test" --verbose
```

You should see GPU utilization in Task Manager → Performance → GPU.

---

## 🚀 Running Ollama

### Start Ollama Server

Ollama runs as a background service, but you can also start it manually:

```powershell
# Start Ollama server (if not running)
ollama serve
```

**Default Configuration:**

- Server URL: `http://localhost:11434`
- API endpoint: `http://localhost:11434/api`
- Web UI: Not included (use API or CLI)

### Test Basic Functionality

```powershell
# Test DeepSeek-R1:7b
ollama run deepseek-r1:7b "What are the best practices for organic tomato farming?"

# List installed models
ollama list

# Show model info
ollama show deepseek-r1:7b
```

### Keep Ollama Running

For the Farmers Market Platform integration to work, Ollama must be running:

```powershell
# Check if Ollama is running
Get-Process ollama -ErrorAction SilentlyContinue

# If not running, start it
ollama serve
```

**Pro Tip**: Set Ollama to start automatically with Windows:

1. Press `Win + R`
2. Type `shell:startup`
3. Create a shortcut to `C:\Users\<YourUsername>\AppData\Local\Programs\Ollama\ollama.exe serve`

---

## 🧪 Testing the Integration

### Step 1: Start Your Development Server

```powershell
# Navigate to project directory
cd "M:\Repo\Farmers Market Platform web and app"

# Start the Next.js development server
npm run dev:omen
```

Server will start on: `http://localhost:3001`

### Step 2: Test Ollama API Endpoint

#### Using cURL (PowerShell)

```powershell
# Check Ollama status
Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method GET

# Test generation
$body = @{
    model = "deepseek-r1:7b"
    prompt = "Explain crop rotation benefits"
    stream = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:11434/api/generate" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

#### Using the Platform API

```powershell
# First, get your auth token (login to the platform)
# Then test the Ollama integration

$headers = @{
    "Content-Type" = "application/json"
    "Cookie" = "your-session-cookie-here"
}

$body = @{
    message = "What are biodynamic farming principles?"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/ai/ollama" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

### Step 3: Test Agricultural Analysis

```powershell
# Test agricultural analysis endpoint
$body = @{
    query = "My tomato plants have yellowing leaves. What should I do?"
    analysisType = "advisory"
    context = @{
        season = "summer"
        soilType = "loamy"
        recentWeather = "hot and dry"
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3001/api/ai/ollama/analyze" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

### Step 4: Create a Quick Test Script

Save this as `test-ollama.ps1`:

```powershell
# Ollama Integration Test Script
# Run: .\test-ollama.ps1

Write-Host "🌟 Testing Ollama Integration" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Test 1: Check if Ollama is running
Write-Host "`n📡 Test 1: Checking Ollama service..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method GET -ErrorAction Stop
    Write-Host "✅ Ollama is running!" -ForegroundColor Green
    Write-Host "   Available models: $($response.models.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Ollama is not running!" -ForegroundColor Red
    Write-Host "   Start it with: ollama serve" -ForegroundColor Yellow
    exit 1
}

# Test 2: Check for DeepSeek-R1:7b
Write-Host "`n🤖 Test 2: Checking for DeepSeek-R1:7b..." -ForegroundColor Yellow
$hasDeepSeek = $response.models | Where-Object { $_.name -like "*deepseek-r1*" }
if ($hasDeepSeek) {
    Write-Host "✅ DeepSeek-R1:7b is installed!" -ForegroundColor Green
} else {
    Write-Host "❌ DeepSeek-R1:7b not found!" -ForegroundColor Red
    Write-Host "   Install it with: ollama pull deepseek-r1:7b" -ForegroundColor Yellow
    exit 1
}

# Test 3: Quick inference test
Write-Host "`n💬 Test 3: Testing inference..." -ForegroundColor Yellow
$body = @{
    model = "deepseek-r1:7b"
    prompt = "What is biodynamic farming? Answer in one sentence."
    stream = $false
} | ConvertTo-Json

try {
    $startTime = Get-Date
    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop
    $duration = (Get-Date) - $startTime

    Write-Host "✅ Inference successful!" -ForegroundColor Green
    Write-Host "   Response: $($response.response.Substring(0, [Math]::Min(100, $response.response.Length)))..." -ForegroundColor Gray
    Write-Host "   Duration: $($duration.TotalSeconds) seconds" -ForegroundColor Gray

    if ($response.eval_count -and $response.eval_duration) {
        $tokensPerSec = [Math]::Round($response.eval_count / ($response.eval_duration / 1000000000), 2)
        Write-Host "   Speed: $tokensPerSec tokens/second" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Inference failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 4: GPU Utilization Check
Write-Host "`n🎮 Test 4: Checking GPU utilization..." -ForegroundColor Yellow
try {
    $gpu = nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv,noheader,nounits 2>$null
    if ($gpu) {
        $gpuStats = $gpu -split ','
        Write-Host "✅ GPU detected!" -ForegroundColor Green
        Write-Host "   GPU Utilization: $($gpuStats[0].Trim())%" -ForegroundColor Gray
        Write-Host "   VRAM Used: $($gpuStats[1].Trim())MB / $($gpuStats[2].Trim())MB" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  nvidia-smi not found or GPU not detected" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not check GPU stats" -ForegroundColor Yellow
}

Write-Host "`n🎉 All tests passed! Ollama is ready to use!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
```

Run the test:

```powershell
.\test-ollama.ps1
```

---

## 🔥 API Usage Examples

### Example 1: Chat with Agricultural Context

```typescript
// Frontend component
async function askAgriculturalQuestion(question: string) {
  const response = await fetch("/api/ai/ollama", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: question,
      model: "deepseek-r1:7b",
      options: {
        temperature: 0.7,
        num_predict: 1024,
      },
    }),
  });

  const data = await response.json();
  return data.data.message;
}

// Usage
const answer = await askAgriculturalQuestion(
  "What's the best time to plant tomatoes in a temperate climate?",
);
```

### Example 2: Agricultural Analysis

```typescript
async function analyzeCropIssue(issue: string, farmContext: any) {
  const response = await fetch("/api/ai/ollama/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: issue,
      context: farmContext,
      analysisType: "advisory",
    }),
  });

  const data = await response.json();
  return data.data;
}

// Usage
const analysis = await analyzeCropIssue(
  "Cucumber leaves turning yellow with brown spots",
  {
    season: "summer",
    soilType: "clay",
    lastFertilized: "2 weeks ago",
    irrigationFrequency: "daily",
  },
);

console.log(analysis.advice);
console.log(analysis.riskLevel); // LOW/MEDIUM/HIGH
console.log(analysis.actionItems);
```

### Example 3: Conversational Thread

```typescript
// Create a persistent conversation
const threadId = crypto.randomUUID();

async function continueConversation(message: string) {
  const response = await fetch("/api/ai/ollama", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      threadId, // Maintain conversation history
    }),
  });

  return await response.json();
}

// Multi-turn conversation
await continueConversation("Tell me about companion planting");
await continueConversation("Which companions are best for tomatoes?");
await continueConversation("How far apart should I plant them?");
```

### Example 4: React Component Integration

```typescript
'use client';

import { useState } from 'react';

export function AgriculturalChatBot() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/ai/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await res.json();

      if (data.success) {
        setResponse(data.data.message);
      } else {
        setResponse(`Error: ${data.error.message}`);
      }
    } catch (error) {
      setResponse('Failed to connect to AI service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agricultural-chat">
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about farming, crops, or agricultural practices..."
          rows={4}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Thinking...' : 'Ask AI'}
        </button>
      </form>

      {response && (
        <div className="response">
          <h3>🌾 Agricultural AI Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
```

---

## ⚡ Performance Optimization

### HP OMEN Specific Optimizations

#### 1. GPU Memory Management

```powershell
# Set Ollama to use GPU (should be automatic)
$env:OLLAMA_GPU_LAYERS = "999"  # Use all layers on GPU

# Limit VRAM usage if needed (8GB available)
$env:OLLAMA_MAX_VRAM = "7GB"  # Leave 1GB for system
```

#### 2. CPU Thread Optimization

```powershell
# Utilize all 12 threads
$env:OLLAMA_NUM_THREAD = "12"

# For parallel requests
$env:OLLAMA_NUM_PARALLEL = "4"  # Run up to 4 concurrent requests
```

#### 3. Model Caching (64GB RAM Advantage)

```powershell
# Keep model in RAM (with 64GB, you can afford this)
$env:OLLAMA_KEEP_ALIVE = "24h"  # Keep model loaded for 24 hours

# Multiple models cached simultaneously
$env:OLLAMA_MAX_LOADED_MODELS = "3"  # Cache up to 3 models
```

#### 4. Performance Tuning in Code

```typescript
// Optimized generation options for HP OMEN
const options = {
  temperature: 0.7,
  top_p: 0.9,
  top_k: 40,
  num_predict: 2048, // Max tokens to generate
  num_ctx: 4096, // Context window (with 64GB RAM)
};
```

### Expected Performance Metrics

With your HP OMEN specs:

| Metric                         | Expected Value   |
| ------------------------------ | ---------------- |
| **Tokens/Second**              | 15-25 tokens/sec |
| **First Token Latency**        | 200-500ms        |
| **Response Time (100 tokens)** | 4-7 seconds      |
| **GPU Utilization**            | 60-90%           |
| **VRAM Usage**                 | 4-6GB            |
| **RAM Usage**                  | 8-12GB           |

---

## 🔧 Troubleshooting

### Issue 1: Ollama Not Running

**Symptoms:**

```
Error: connect ECONNREFUSED 127.0.0.1:11434
```

**Solution:**

```powershell
# Start Ollama
ollama serve

# Or check if it's running
Get-Process ollama

# If not, restart it
Stop-Process -Name ollama -Force -ErrorAction SilentlyContinue
ollama serve
```

### Issue 2: Model Not Found

**Symptoms:**

```
Error: model 'deepseek-r1:7b' not found
```

**Solution:**

```powershell
# Pull the model
ollama pull deepseek-r1:7b

# Verify installation
ollama list

# Show model details
ollama show deepseek-r1:7b
```

### Issue 3: GPU Not Detected

**Symptoms:**

- Slow inference (CPU-only)
- Low GPU utilization

**Solution:**

```powershell
# 1. Update NVIDIA drivers
# Visit: https://www.nvidia.com/Download/index.aspx

# 2. Verify CUDA is available
nvidia-smi

# 3. Reinstall Ollama with GPU support
# Download latest version from ollama.com

# 4. Set environment variable
$env:OLLAMA_GPU = "1"
```

### Issue 4: Out of Memory

**Symptoms:**

```
Error: CUDA out of memory
```

**Solution:**

```powershell
# Use smaller quantization
ollama pull deepseek-r1:7b-q4  # 4-bit quantization

# Or reduce context window
$body = @{
    model = "deepseek-r1:7b"
    prompt = "Your question"
    options = @{
        num_ctx = 2048  # Reduced from 4096
    }
} | ConvertTo-Json
```

### Issue 5: Slow Response Times

**Symptoms:**

- Taking >30 seconds per response
- Low tokens/second

**Solution:**

```powershell
# 1. Ensure GPU is being used
nvidia-smi  # Check GPU utilization while generating

# 2. Reduce generation length
options = {
    num_predict: 1024  # Reduce from 2048
}

# 3. Keep model loaded
$env:OLLAMA_KEEP_ALIVE = "1h"

# 4. Use smaller model if needed
ollama pull deepseek-r1:1.5b  # Faster but less capable
```

### Issue 6: Authentication Errors in Platform

**Symptoms:**

```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_REQUIRED"
  }
}
```

**Solution:**

1. Ensure you're logged into the platform
2. Check your session cookie is valid
3. Use the platform's frontend instead of direct API calls

---

## 📊 Monitoring Performance

### Real-time GPU Monitoring

```powershell
# Monitor GPU utilization during inference
while ($true) {
    Clear-Host
    Write-Host "🎮 GPU Monitoring (Press Ctrl+C to stop)" -ForegroundColor Cyan
    nvidia-smi --query-gpu=timestamp,name,temperature.gpu,utilization.gpu,utilization.memory,memory.used,memory.total --format=csv
    Start-Sleep -Seconds 2
}
```

### Log Ollama Performance

```powershell
# Enable verbose logging
$env:OLLAMA_DEBUG = "1"
ollama serve
```

### Platform Integration Metrics

The platform automatically tracks:

- Total duration
- Load duration
- Eval count
- Tokens per second

Check these in the API response:

```json
{
  "metadata": {
    "total_duration_ms": 5234,
    "eval_count": 128,
    "tokens_per_second": "24.5"
  }
}
```

---

## 🎯 Best Practices

### 1. Model Selection

- **DeepSeek-R1:7b** - Best for reasoning and analysis
- **DeepSeek-R1:1.5b** - Faster, less memory, still good quality
- **Llama 3.1:8b** - Alternative general-purpose model

### 2. Prompt Engineering for Agriculture

```typescript
// ✅ Good prompt
const prompt = `As a biodynamic farming expert, analyze this crop issue:
- Crop: Tomatoes
- Issue: Yellow leaves with brown spots
- Season: Summer
- Soil: Clay
- Recent weather: Hot and dry

Provide specific, actionable recommendations.`;

// ❌ Poor prompt
const prompt = "Why are my tomatoes yellow?";
```

### 3. Context Management

```typescript
// Include relevant context
const context = {
  farmLocation: "Oregon, USA",
  climate: "temperate",
  farmSize: "5 acres",
  farmingMethod: "organic",
  season: getCurrentSeason(),
  recentActivities: ["fertilized", "watered"],
};
```

### 4. Error Handling

```typescript
async function safeOllamaCall(message: string) {
  try {
    const response = await fetch("/api/ai/ollama", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const error = await response.json();

      // Handle specific errors
      if (error.error.code === "OLLAMA_UNAVAILABLE") {
        return {
          success: false,
          message: "AI service is currently offline. Please try again later.",
          fallback: "Check our FAQ for common farming questions.",
        };
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Ollama call failed:", error);
    return {
      success: false,
      message: "Failed to connect to AI service.",
    };
  }
}
```

---

## 🚀 Advanced Usage

### Running Multiple Models

```powershell
# Pull additional models
ollama pull llama3.1:8b
ollama pull mistral:7b

# Switch models in API calls
$body = @{
    message = "Question here"
    model = "llama3.1:8b"  # Use different model
} | ConvertTo-Json
```

### Custom Model Parameters

```typescript
// Fine-tune generation parameters
const response = await fetch("/api/ai/ollama", {
  method: "POST",
  body: JSON.stringify({
    message: query,
    options: {
      temperature: 0.3, // Lower = more focused
      top_p: 0.95, // Nucleus sampling
      top_k: 50, // Top-k sampling
      num_predict: 512, // Shorter responses
      stop: ["\n\n", "###"], // Stop sequences
    },
  }),
});
```

### Streaming Responses

```typescript
// Enable streaming for real-time responses
const response = await fetch("/api/ai/ollama", {
  method: "POST",
  body: JSON.stringify({
    message: query,
    stream: true, // Enable streaming
  }),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader!.read();
  if (done) break;

  const chunk = decoder.decode(value);
  console.log(chunk); // Display token by token
}
```

---

## 📚 Additional Resources

### Official Documentation

- Ollama Docs: https://github.com/ollama/ollama
- DeepSeek-R1: https://huggingface.co/deepseek-ai
- API Reference: https://github.com/ollama/ollama/blob/main/docs/api.md

### Community

- Ollama Discord: https://discord.gg/ollama
- GitHub Issues: https://github.com/ollama/ollama/issues

### Related Files in This Project

- `/src/lib/ai/ollama.ts` - Ollama client implementation
- `/src/app/api/ai/ollama/route.ts` - Chat API endpoint
- `/src/app/api/ai/ollama/analyze/route.ts` - Analysis endpoint

---

## ✅ Quick Start Checklist

- [ ] Ollama installed on Windows
- [ ] DeepSeek-R1:7b model downloaded
- [ ] Ollama service running (`ollama serve`)
- [ ] GPU detected and utilized
- [ ] Test script passed (`.\test-ollama.ps1`)
- [ ] Platform development server running
- [ ] Successfully tested API endpoints
- [ ] Agricultural analysis working

---

## 🎉 You're Ready!

Your HP OMEN laptop is now a powerful agricultural AI assistant!

**Next Steps:**

1. Integrate the chat UI into your platform
2. Add agricultural analysis to farm dashboards
3. Create automated crop health monitoring
4. Build a farming advisory system

**Need Help?**

- Check the troubleshooting section
- Review API examples
- Consult divine instruction files in `.github/instructions/`

---

_"Local AI inference with agricultural consciousness - privacy-first, GPU-accelerated, divinely optimized."_ 🌾⚡

**Version**: 1.0  
**Status**: PRODUCTION READY  
**Optimization Level**: HP OMEN ULTIMATE POWER  
**Last Updated**: November 2025
