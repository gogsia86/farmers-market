# 🚀 Ollama Quick Start Guide

## Get DeepSeek-R1:7b Running in 5 Minutes on Your HP OMEN

---

## ⚡ Super Quick Setup (5 Minutes)

### Step 1: Install Ollama (2 minutes)

**Windows (Recommended):**

```powershell
# Download and run the installer
Start-Process "https://ollama.com/download/windows"
```

Or use winget:

```powershell
winget install Ollama.Ollama
```

**Verify installation:**

```powershell
ollama --version
```

---

### Step 2: Pull DeepSeek-R1:7b (2 minutes)

```powershell
# Download the model (~4.7GB)
ollama pull deepseek-r1:7b
```

**Wait for download to complete...**

---

### Step 3: Start Ollama Service (10 seconds)

```powershell
# Start Ollama in background
ollama serve
```

Leave this terminal open, or press `Ctrl+C` and run as background service.

---

### Step 4: Test It Works (30 seconds)

```powershell
# Quick test
ollama run deepseek-r1:7b "What is biodynamic farming in one sentence?"
```

You should see a response! ✅

---

### Step 5: Start Your Platform (30 seconds)

```powershell
# Navigate to project
cd "M:\Repo\Farmers Market Platform web and app"

# Start dev server (HP OMEN optimized)
npm run dev:omen
```

Platform runs on: **http://localhost:3000**

---

## 🧪 Test the Integration

Run the automated test script:

```powershell
.\test-ollama.ps1
```

This will verify:

- ✅ Ollama is installed
- ✅ DeepSeek-R1:7b is available
- ✅ GPU acceleration is working
- ✅ Inference is fast
- ✅ Platform integration is ready

---

## 🌐 API Endpoints

### 1. Chat Endpoint

```
POST http://localhost:3000/api/ai/ollama
```

**Example Request:**

```json
{
  "message": "How do I improve soil health naturally?",
  "model": "deepseek-r1:7b",
  "options": {
    "temperature": 0.7,
    "num_predict": 1024
  }
}
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "message": "To improve soil health naturally, focus on...",
    "model": "deepseek-r1:7b",
    "metadata": {
      "total_duration_ms": 3456,
      "tokens_per_second": "22.5"
    }
  }
}
```

---

### 2. Agricultural Analysis Endpoint

```
POST http://localhost:3000/api/ai/ollama/analyze
```

**Example Request:**

```json
{
  "query": "My tomato leaves are turning yellow. What's wrong?",
  "analysisType": "advisory",
  "context": {
    "season": "summer",
    "soilType": "clay",
    "lastFertilized": "2 weeks ago"
  }
}
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "type": "farming_advisory",
    "advice": "Yellowing tomato leaves indicate...",
    "actionItems": [
      "Check soil nitrogen levels",
      "Adjust watering schedule",
      "Apply organic compost"
    ],
    "riskLevel": "MEDIUM",
    "biodynamicScore": 85,
    "quantumCoherence": 78
  }
}
```

---

### 3. Status Check Endpoint

```
GET http://localhost:3000/api/ai/ollama
```

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "online",
    "healthy": true,
    "models": [
      {
        "name": "deepseek-r1:7b",
        "size": 4737483776,
        "parameter_size": "7B"
      }
    ],
    "hasDeepSeek": true
  }
}
```

---

## 💻 Use in Your Code

### Frontend Component (React)

```typescript
'use client';

import { OllamaChatBot } from '@/components/features/ai/OllamaChatBot';

export default function FarmDashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1>Farm Dashboard</h1>

      {/* AI Chat Assistant */}
      <OllamaChatBot
        className="h-[600px]"
        placeholder="Ask about your crops, soil, or farming practices..."
      />
    </div>
  );
}
```

---

### API Call (TypeScript)

```typescript
async function askAgriculturalQuestion(question: string) {
  const response = await fetch("/api/ai/ollama", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: question }),
  });

  const data = await response.json();

  if (data.success) {
    return data.data.message;
  } else {
    throw new Error(data.error.message);
  }
}

// Usage
const answer = await askAgriculturalQuestion(
  "What's the best time to plant tomatoes?",
);
console.log(answer);
```

---

### Agricultural Analysis

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
  "Cucumber plants wilting despite regular watering",
  {
    season: "summer",
    temperature: "85°F",
    soilType: "sandy loam",
  },
);

console.log(analysis.riskLevel); // "HIGH", "MEDIUM", or "LOW"
console.log(analysis.actionItems); // Array of specific actions
console.log(analysis.biodynamicScore); // 0-100 score
```

---

## 🎮 GPU Optimization for HP OMEN

Your HP OMEN specs are perfect for local AI:

- **RTX 2070 Max-Q**: 8GB VRAM, 2304 CUDA cores
- **64GB RAM**: Excellent for model caching
- **12 CPU Threads**: Parallel processing power

### Set Environment Variables

```powershell
# Use all GPU layers
$env:OLLAMA_GPU_LAYERS = "999"

# Utilize all CPU threads
$env:OLLAMA_NUM_THREAD = "12"

# Keep model loaded (with 64GB RAM, you can!)
$env:OLLAMA_KEEP_ALIVE = "24h"

# Allow multiple concurrent requests
$env:OLLAMA_NUM_PARALLEL = "4"
```

### Expected Performance

| Metric              | Your HP OMEN         |
| ------------------- | -------------------- |
| **Tokens/Second**   | 15-25 tok/s          |
| **First Response**  | 200-500ms            |
| **GPU Utilization** | 60-90%               |
| **VRAM Usage**      | 4-6GB                |
| **Quality**         | Excellent ⭐⭐⭐⭐⭐ |

---

## 🔧 Common Issues & Fixes

### Issue: "Ollama not found"

```powershell
# Install Ollama
winget install Ollama.Ollama

# Restart terminal
```

---

### Issue: "Model not found"

```powershell
# Pull the model
ollama pull deepseek-r1:7b

# Verify
ollama list
```

---

### Issue: "Connection refused"

```powershell
# Start Ollama service
ollama serve

# Or check if it's running
Get-Process ollama
```

---

### Issue: "Slow performance"

```powershell
# Check GPU is being used
nvidia-smi

# Update NVIDIA drivers
# Visit: https://www.nvidia.com/Download/index.aspx

# Use GPU explicitly
$env:OLLAMA_GPU = "1"
```

---

### Issue: "Out of memory"

```powershell
# Use smaller quantization
ollama pull deepseek-r1:7b-q4

# Or reduce context window in API calls
# options: { num_ctx: 2048 }
```

---

## 📊 Monitor Performance

### Watch GPU in Real-Time

```powershell
# Monitor GPU utilization
nvidia-smi -l 1

# Or use this prettier version
while ($true) {
    Clear-Host
    Write-Host "🎮 GPU Monitor" -ForegroundColor Cyan
    nvidia-smi --query-gpu=name,temperature.gpu,utilization.gpu,memory.used,memory.total --format=csv
    Start-Sleep -Seconds 2
}
```

---

### Check Ollama Logs

```powershell
# Enable debug logging
$env:OLLAMA_DEBUG = "1"
ollama serve
```

---

## 🎯 Pro Tips

### 1. Keep Model in Memory

```powershell
# With 64GB RAM, keep model loaded all day
$env:OLLAMA_KEEP_ALIVE = "24h"
```

### 2. Faster Responses

```typescript
// Use shorter context for quick answers
options: {
  temperature: 0.3,  // More focused
  num_predict: 512,  // Shorter responses
}
```

### 3. Better Agricultural Advice

```typescript
// Provide more context
const context = {
  farmLocation: "Oregon",
  climate: "temperate",
  farmingMethod: "organic",
  season: "spring",
  currentCrops: ["tomatoes", "lettuce"],
};
```

### 4. Try Different Models

```powershell
# Pull additional models
ollama pull llama3.1:8b     # General purpose
ollama pull mistral:7b      # Fast and accurate
ollama pull codellama:7b    # For code generation

# Use in API
{ "message": "...", "model": "llama3.1:8b" }
```

---

## 📚 Useful Commands

```powershell
# Ollama Commands
ollama serve                    # Start service
ollama list                     # List models
ollama run deepseek-r1:7b      # Interactive chat
ollama pull <model>            # Download model
ollama rm <model>              # Remove model
ollama show deepseek-r1:7b     # Model info

# Platform Commands
npm run dev:omen               # Start dev server
npm run test                   # Run tests
.\test-ollama.ps1             # Test Ollama integration

# GPU Commands
nvidia-smi                     # GPU status
nvidia-smi -l 1                # Monitor GPU (1 sec refresh)
```

---

## 🌟 What You Can Build

With Ollama integrated, you can now:

1. **AI Chat Assistant** - Answer farming questions in real-time
2. **Crop Health Analyzer** - Diagnose plant issues from descriptions
3. **Seasonal Planner** - Get planting recommendations
4. **Soil Health Advisor** - Analyze soil conditions and suggest improvements
5. **Pest Management** - Natural pest control recommendations
6. **Weather Advisor** - Adjust farming practices based on weather
7. **Biodynamic Guide** - Lunar cycle and biodynamic calendar integration
8. **Farm Documentation** - Auto-generate farm reports and logs

---

## 🎉 You're All Set!

Your HP OMEN laptop is now running a powerful local AI assistant for agriculture!

**Next Steps:**

1. ✅ Ollama installed and running
2. ✅ DeepSeek-R1:7b model downloaded
3. ✅ Platform integration tested
4. 🚀 Start building AI features!

**Resources:**

- Full Setup Guide: `OLLAMA_SETUP_GUIDE.md`
- API Documentation: `/src/lib/ai/ollama.ts`
- Component Example: `/src/components/features/ai/OllamaChatBot.tsx`
- Test Script: `test-ollama.ps1`

**Need Help?**

- Run: `.\test-ollama.ps1 -Verbose`
- Check: `OLLAMA_SETUP_GUIDE.md` troubleshooting section
- Visit: https://github.com/ollama/ollama

---

_"Local AI with agricultural consciousness - privacy-first, GPU-accelerated, divinely optimized."_ 🌾⚡

**Status**: READY TO USE ✅  
**Performance**: OPTIMIZED FOR HP OMEN 💪  
**Cost**: $0 (runs locally!) 💰
