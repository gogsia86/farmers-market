# 🤖 OLLAMA COMPLETE GUIDE - Farmers Market Platform

**AI-Powered Agricultural Intelligence with DeepSeek-R1**

**Last Updated:** January 2025  
**Version:** 1.0 - Consolidated Edition  
**Status:** ✅ READY TO USE

---

## 📋 TABLE OF CONTENTS

- [Quick Start (5 Minutes)](#-quick-start-5-minutes)
- [What is Ollama?](#-what-is-ollama)
- [Installation](#-installation)
- [Model Selection](#-model-selection)
- [Configuration](#-configuration)
- [Integration with Platform](#-integration-with-platform)
- [API Usage](#-api-usage)
- [Performance Optimization](#-performance-optimization)
- [Troubleshooting](#-troubleshooting)
- [Advanced Usage](#-advanced-usage)

---

## ⚡ QUICK START (5 MINUTES)

### Prerequisites

- **Windows 10/11** (or macOS/Linux)
- **8GB RAM minimum** (16GB recommended)
- **GPU:** NVIDIA GPU optional but recommended (RTX 2070 Max-Q or better)
- **Disk Space:** 10GB free space

### Step 1: Install Ollama (2 minutes)

**Windows:**

```powershell
# Download and install from official site
Start-Process "https://ollama.com/download/windows"

# Or use winget
winget install Ollama.Ollama
```

**macOS:**

```bash
# Download from official site
open https://ollama.com/download/mac

# Or use Homebrew
brew install ollama
```

**Linux:**

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Verify Installation:**

```bash
ollama --version
# Expected: ollama version 0.1.x
```

### Step 2: Pull DeepSeek-R1 Model (2 minutes)

```bash
# Download DeepSeek-R1:7b (~4.7GB)
ollama pull deepseek-r1:7b

# Or pull larger model (better quality, needs more RAM)
ollama pull deepseek-r1:14b
```

**Wait for download to complete...**

### Step 3: Start Ollama Service (10 seconds)

```bash
# Start Ollama server
ollama serve

# Server starts on: http://localhost:11434
```

**Leave terminal open or run as background service.**

### Step 4: Test It Works (30 seconds)

```bash
# Quick test
ollama run deepseek-r1:7b "What is biodynamic farming?"

# You should see a detailed response about biodynamic farming! ✅
```

### Step 5: Integrate with Platform (1 minute)

```bash
# Navigate to project
cd "path/to/farmers-market-platform"

# Add to .env.local
echo "OLLAMA_API_URL=http://localhost:11434" >> .env.local
echo "OLLAMA_MODEL=deepseek-r1:7b" >> .env.local

# Start development server
npm run dev
```

**🎉 SUCCESS! Ollama is now integrated with your platform.**

---

## 🤔 WHAT IS OLLAMA?

**Ollama** is a tool to run large language models (LLMs) locally on your machine.

### Why Ollama?

✅ **Privacy** - Your data never leaves your machine  
✅ **No API costs** - Run unlimited queries for free  
✅ **Offline capable** - Works without internet  
✅ **Fast** - GPU acceleration for instant responses  
✅ **Easy** - Simple installation and usage  
✅ **Multiple models** - Choose the best model for your needs

### Use Cases in Farmers Market Platform

- **Product descriptions** - Generate compelling product copy
- **Farming advice** - Answer agricultural questions
- **Content generation** - Create blog posts, guides
- **Customer support** - AI-powered chat assistance
- **Data analysis** - Analyze farming data and trends
- **Recipe suggestions** - Based on available products

---

## 🔧 INSTALLATION

### Windows Installation

**Option A: Official Installer (Recommended)**

1. Visit https://ollama.com/download/windows
2. Download `OllamaSetup.exe`
3. Run installer (requires admin privileges)
4. Follow installation wizard
5. Ollama installs to: `C:\Users\<username>\AppData\Local\Programs\Ollama`

**Option B: Winget**

```powershell
winget install Ollama.Ollama
```

**Option C: Manual Installation**

```powershell
# Download latest release
$url = "https://ollama.com/download/windows"
Invoke-WebRequest -Uri $url -OutFile "OllamaSetup.exe"

# Run installer
Start-Process "OllamaSetup.exe" -Wait
```

### macOS Installation

**Option A: Official Download**

1. Visit https://ollama.com/download/mac
2. Download `Ollama.dmg`
3. Open DMG file
4. Drag Ollama to Applications folder
5. Open Ollama from Applications

**Option B: Homebrew**

```bash
brew install ollama
```

### Linux Installation

**Ubuntu/Debian:**

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Manual Installation:**

```bash
# Download binary
curl -L https://ollama.com/download/ollama-linux-amd64 -o ollama

# Make executable
chmod +x ollama

# Move to PATH
sudo mv ollama /usr/local/bin/

# Verify
ollama --version
```

### Verify Installation

```bash
# Check version
ollama --version

# Check service status
ollama list

# Test run
ollama run llama2 "Hello"
```

---

## 🎯 MODEL SELECTION

### Recommended Models for Farming Platform

| Model               | Size  | RAM Needed | Best For                         |
| ------------------- | ----- | ---------- | -------------------------------- |
| **deepseek-r1:7b**  | 4.7GB | 8GB        | General use, fast responses      |
| **deepseek-r1:14b** | 8.9GB | 16GB       | Better quality, detailed answers |
| **llama3.2:3b**     | 2.0GB | 4GB        | Quick responses, limited RAM     |
| **mistral:7b**      | 4.1GB | 8GB        | Good balance of speed/quality    |
| **codellama:13b**   | 7.4GB | 16GB       | Code generation (if needed)      |

### Pulling Models

```bash
# Pull specific model
ollama pull deepseek-r1:7b

# Pull multiple models
ollama pull llama3.2:3b
ollama pull mistral:7b

# List installed models
ollama list

# Remove model
ollama rm llama2
```

### Switching Models

```bash
# Test different models
ollama run deepseek-r1:7b "Compare organic vs conventional farming"
ollama run mistral:7b "Compare organic vs conventional farming"

# Choose the one with best responses for your use case
```

---

## ⚙️ CONFIGURATION

### Environment Variables

Add to `.env.local`:

```env
# Ollama Configuration
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:7b
OLLAMA_TIMEOUT=60000

# Optional: GPU acceleration
OLLAMA_NUM_GPU=1
OLLAMA_NUM_THREAD=8

# Optional: Model behavior
OLLAMA_TEMPERATURE=0.7
OLLAMA_MAX_TOKENS=2048
```

### Ollama Server Configuration

**Windows - Run as Service:**

```powershell
# Create service (requires admin)
sc.exe create OllamaService binPath= "C:\Users\<username>\AppData\Local\Programs\Ollama\ollama.exe serve"
sc.exe start OllamaService

# Set to start automatically
sc.exe config OllamaService start= auto
```

**macOS - Run as Background Service:**

```bash
# Create LaunchAgent
cat > ~/Library/LaunchAgents/com.ollama.server.plist <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ollama.server</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/ollama</string>
        <string>serve</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF

# Load service
launchctl load ~/Library/LaunchAgents/com.ollama.server.plist
```

**Linux - Systemd Service:**

```bash
# Create service file
sudo tee /etc/systemd/system/ollama.service <<EOF
[Unit]
Description=Ollama Service
After=network.target

[Service]
Type=simple
User=$USER
ExecStart=/usr/local/bin/ollama serve
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl enable ollama
sudo systemctl start ollama
sudo systemctl status ollama
```

---

## 🔗 INTEGRATION WITH PLATFORM

### Setup Integration

**1. Install Ollama SDK:**

```bash
npm install ollama
```

**2. Create Ollama Service:**

Create `src/lib/ai/ollama.service.ts`:

```typescript
import { Ollama } from "ollama";

const ollama = new Ollama({
  host: process.env.OLLAMA_API_URL || "http://localhost:11434",
});

export class OllamaService {
  private model = process.env.OLLAMA_MODEL || "deepseek-r1:7b";

  async generateText(prompt: string): Promise<string> {
    const response = await ollama.generate({
      model: this.model,
      prompt,
      stream: false,
    });

    return response.response;
  }

  async chat(
    messages: Array<{ role: string; content: string }>,
  ): Promise<string> {
    const response = await ollama.chat({
      model: this.model,
      messages,
      stream: false,
    });

    return response.message.content;
  }

  async generateProductDescription(
    productName: string,
    details: string,
  ): Promise<string> {
    const prompt = `Generate a compelling product description for a farmers market platform:
    
Product: ${productName}
Details: ${details}

Write a 2-3 paragraph description highlighting freshness, quality, and local farming practices.`;

    return await this.generateText(prompt);
  }

  async answerFarmingQuestion(question: string): Promise<string> {
    const prompt = `You are an expert in sustainable and biodynamic farming. Answer this question:

Question: ${question}

Provide a practical, detailed answer suitable for farmers and agricultural enthusiasts.`;

    return await this.generateText(prompt);
  }
}

export const ollamaService = new OllamaService();
```

**3. Create API Route:**

Create `src/app/api/ai/generate/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { ollamaService } from "@/lib/ai/ollama.service";

export async function POST(request: NextRequest) {
  try {
    const { prompt, type } = await request.json();

    let response: string;

    switch (type) {
      case "product-description":
        response = await ollamaService.generateProductDescription(
          prompt.productName,
          prompt.details,
        );
        break;

      case "farming-question":
        response = await ollamaService.answerFarmingQuestion(prompt.question);
        break;

      default:
        response = await ollamaService.generateText(prompt);
    }

    return NextResponse.json({
      success: true,
      response,
      model: process.env.OLLAMA_MODEL,
    });
  } catch (error) {
    console.error("Ollama API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate response" },
      { status: 500 },
    );
  }
}
```

**4. Create UI Component:**

Create `src/components/ai/AIAssistant.tsx`:

```tsx
"use client";

import { useState } from "react";

export function AIAssistant() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          type: "farming-question",
        }),
      });

      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error("Error:", error);
      setResponse("Failed to generate response");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-assistant">
      <h2>AI Farming Assistant</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask a farming question..."
        rows={4}
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Ask AI"}
      </button>
      {response && (
        <div className="response">
          <h3>Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 📡 API USAGE

### Direct API Calls

**Generate Text:**

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "deepseek-r1:7b",
  "prompt": "What are the benefits of crop rotation?",
  "stream": false
}'
```

**Chat:**

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "deepseek-r1:7b",
  "messages": [
    {
      "role": "user",
      "content": "How do I start a small organic farm?"
    }
  ],
  "stream": false
}'
```

**List Models:**

```bash
curl http://localhost:11434/api/tags
```

### Using Ollama SDK

```typescript
import { Ollama } from "ollama";

const ollama = new Ollama({ host: "http://localhost:11434" });

// Generate
const response = await ollama.generate({
  model: "deepseek-r1:7b",
  prompt: "What is permaculture?",
});
console.log(response.response);

// Chat
const chatResponse = await ollama.chat({
  model: "deepseek-r1:7b",
  messages: [
    { role: "system", content: "You are a farming expert." },
    { role: "user", content: "How do I improve soil health?" },
  ],
});
console.log(chatResponse.message.content);

// Streaming
const stream = await ollama.generate({
  model: "deepseek-r1:7b",
  prompt: "Explain composting",
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.response);
}
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### HP OMEN Optimization (RTX 2070 Max-Q)

**Enable GPU Acceleration:**

```bash
# Windows - Set environment variable
$env:OLLAMA_NUM_GPU = "1"
ollama serve

# Verify GPU is being used
nvidia-smi
```

**Optimize Memory:**

```bash
# Allow Ollama to use more RAM
$env:OLLAMA_MAX_LOADED_MODELS = "2"
$env:OLLAMA_MAX_VRAM = "8000000000"  # 8GB VRAM
```

**Concurrent Requests:**

```typescript
// Process multiple requests in parallel
const promises = questions.map((q) => ollamaService.answerFarmingQuestion(q));
const responses = await Promise.all(promises);
```

### Model Optimization

**Use Quantized Models:**

```bash
# 7B model with 4-bit quantization (smaller, faster)
ollama pull deepseek-r1:7b-q4

# List available quantizations
ollama show deepseek-r1:7b
```

**Adjust Context Window:**

```typescript
await ollama.generate({
  model: "deepseek-r1:7b",
  prompt: "Your prompt",
  options: {
    num_ctx: 2048, // Context window size
    temperature: 0.7,
    top_p: 0.9,
    num_predict: 512, // Max tokens to generate
  },
});
```

---

## 🆘 TROUBLESHOOTING

### Issue: Ollama Not Starting

**Solution:**

```bash
# Check if port 11434 is in use
# Windows:
netstat -ano | findstr :11434

# Mac/Linux:
lsof -i :11434

# Kill process using port
# Windows:
taskkill /PID <PID> /F

# Mac/Linux:
kill -9 <PID>

# Restart Ollama
ollama serve
```

### Issue: Model Download Fails

**Solution:**

```bash
# Check disk space
df -h  # Mac/Linux
Get-PSDrive  # Windows

# Clear Ollama cache
rm -rf ~/.ollama/models/temp

# Try download again
ollama pull deepseek-r1:7b
```

### Issue: Slow Response Times

**Solutions:**

1. **Enable GPU:**

```bash
$env:OLLAMA_NUM_GPU = "1"
```

2. **Use smaller model:**

```bash
ollama pull deepseek-r1:7b  # Instead of 14b
```

3. **Reduce context window:**

```typescript
options: {
  num_ctx: 1024;
} // Instead of 4096
```

4. **Close other GPU applications**

### Issue: Out of Memory

**Solution:**

```bash
# Use smaller model
ollama pull llama3.2:3b

# Or reduce concurrent requests
# Limit to 1 request at a time

# Increase system swap/pagefile
```

### Issue: Connection Refused

**Solution:**

```bash
# Check Ollama is running
ollama list

# Start Ollama if not running
ollama serve

# Check firewall settings
# Allow port 11434

# Verify connection
curl http://localhost:11434/api/tags
```

---

## 🚀 ADVANCED USAGE

### Custom Model Files

Create custom model configurations:

```bash
# Create Modelfile
cat > Modelfile <<EOF
FROM deepseek-r1:7b

PARAMETER temperature 0.8
PARAMETER top_p 0.9

SYSTEM You are an expert in sustainable agriculture and organic farming practices. Provide detailed, practical advice for farmers.
EOF

# Create custom model
ollama create farming-expert -f Modelfile

# Use custom model
ollama run farming-expert "How do I start composting?"
```

### Batch Processing

```typescript
async function batchGenerateDescriptions(products: Product[]) {
  const batchSize = 5;
  const results = [];

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const promises = batch.map((product) =>
      ollamaService.generateProductDescription(product.name, product.details),
    );
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);

    // Small delay between batches
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}
```

### Embeddings Generation

```typescript
async function generateEmbeddings(text: string) {
  const response = await ollama.embeddings({
    model: "deepseek-r1:7b",
    prompt: text,
  });

  return response.embedding;
}

// Use for semantic search
const productEmbedding = await generateEmbeddings(product.description);
// Store in vector database for similarity search
```

---

## 📊 MONITORING & METRICS

### Check Model Performance

```bash
# View model details
ollama show deepseek-r1:7b

# Monitor system resources
# Windows: Task Manager
# Mac: Activity Monitor
# Linux: htop

# Check GPU usage
nvidia-smi -l 1  # Update every second
```

### Logging

```typescript
// Add logging to your service
import { logger } from '@/lib/logger'

async generateText(prompt: string): Promise<string> {
  const startTime = Date.now()

  try {
    const response = await ollama.generate({
      model: this.model,
      prompt
    })

    const duration = Date.now() - startTime
    logger.info('Ollama generation completed', {
      model: this.model,
      duration,
      promptLength: prompt.length,
      responseLength: response.response.length
    })

    return response.response
  } catch (error) {
    logger.error('Ollama generation failed', { error, prompt })
    throw error
  }
}
```

---

## 📚 ADDITIONAL RESOURCES

### Official Documentation

- **Ollama Website:** https://ollama.com
- **GitHub Repository:** https://github.com/ollama/ollama
- **Model Library:** https://ollama.com/library

### Community

- **Discord:** https://discord.gg/ollama
- **Reddit:** r/ollama
- **GitHub Discussions:** https://github.com/ollama/ollama/discussions

### Tutorials

- Official Quick Start: https://ollama.com/docs
- API Documentation: https://github.com/ollama/ollama/blob/main/docs/api.md
- Model Guide: https://github.com/ollama/ollama/blob/main/docs/models.md

---

## ✅ SUCCESS CHECKLIST

After completing setup:

- [ ] Ollama installed and running
- [ ] DeepSeek-R1:7b model downloaded
- [ ] Service starts on system boot
- [ ] GPU acceleration enabled (if available)
- [ ] Environment variables configured
- [ ] Platform integration complete
- [ ] API endpoints working
- [ ] Test queries successful

---

**Status:** ✅ PRODUCTION READY  
**Last Updated:** January 2025  
**Maintainer:** AI Integration Team  
**Support:** See troubleshooting section

_"Local AI, divine agricultural intelligence, zero API costs."_ 🤖🌾

---

**Built with 💚 by farmers, for farmers, powered by local AI**
