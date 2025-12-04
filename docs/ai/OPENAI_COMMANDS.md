# 🚀 OpenAI Quick Commands Reference

**Farmers Market Platform - Copy & Paste Commands**

## 🎯 Initial Setup (First Time)

### Interactive Setup Wizard (Recommended)

```bash
npx tsx scripts/setup-openai.ts
```

### Manual Setup (Alternative)

```bash
# 1. Open .env file
code .env
# or
nano .env

# 2. Add this line (replace with your actual key):
OPENAI_API_KEY=sk-proj-your-actual-key-here

# 3. Save and close
```

---

## ✅ Verify Setup

### Test OpenAI Connection

```bash
npx tsx scripts/verify-openai.ts
```

### Check Environment Variables

```bash
cat .env | grep OPENAI
```

### Check if OpenAI Package is Installed

```bash
npm list openai
```

---

## 🚀 Development Commands

### Start Dev Server with AI Features

```bash
npm run dev
```

### Watch for AI Logs

```bash
npm run dev | grep "AI"
```

### Test AI Features

```bash
npm run test -- src/lib/ai
```

---

## 🔧 Configuration Commands

### Add Development Model (Cheap!)

```bash
echo "OPENAI_MODEL=gpt-4o-mini" >> .env
```

### Add Production Model (Best Quality)

```bash
echo "OPENAI_MODEL=gpt-4o" >> .env
```

### Enable All AI Features

```bash
cat >> .env << 'EOF'
AI_ANALYSIS_ENABLED=true
AGENT_ORCHESTRATION_ENABLED=true
ML_PREDICTION_ENABLED=true
SELF_HEALING_ENABLED=true
TRACING_ENABLED=true
EOF
```

### Full Configuration Template

```bash
cat >> .env << 'EOF'
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000

# AI Features
AI_ANALYSIS_ENABLED=true
AGENT_ORCHESTRATION_ENABLED=true
ML_PREDICTION_ENABLED=true
SELF_HEALING_ENABLED=true

# Tracing
TRACING_ENABLED=true
EOF
```

---

## 🐛 Troubleshooting Commands

### Check if .env File Exists

```bash
ls -la .env
```

### View .env File Contents (Safe - Hides Sensitive Data)

```bash
cat .env | sed 's/\(OPENAI_API_KEY=sk-[^[:space:]]*\)/OPENAI_API_KEY=sk-***HIDDEN***/g'
```

### Backup .env File

```bash
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
```

### Create .env from Example

```bash
cp .env.example .env
```

### Test OpenAI Connection Manually

```bash
npx tsx -e "
import { OpenAI } from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello!' }]
}).then(r => console.log('✅ Connection successful!', r.choices[0].message.content))
  .catch(e => console.error('❌ Connection failed:', e.message));
"
```

---

## 📊 Monitoring Commands

### View OpenAI Usage (Opens Browser)

```bash
# Windows
start https://platform.openai.com/usage

# Mac
open https://platform.openai.com/usage

# Linux
xdg-open https://platform.openai.com/usage
```

### Check API Key Status

```bash
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models | jq '.data[0].id'
```

### Monitor Development Logs for AI Activity

```bash
npm run dev 2>&1 | grep -E "(AI|OpenAI|GPT|Agent|Analyzer)"
```

---

## 🔒 Security Commands

### Check if .env is in .gitignore

```bash
grep "^\.env$" .gitignore && echo "✅ .env is ignored" || echo "❌ WARNING: .env not in .gitignore!"
```

### Add .env to .gitignore (If Missing)

```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
```

### Remove API Key from Git History (Emergency!)

```bash
# WARNING: This rewrites history! Coordinate with team first!
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

### Generate New API Key (After Compromise)

```bash
# 1. Delete old key at: https://platform.openai.com/api-keys
# 2. Create new key
# 3. Update .env:
nano .env
# 4. Restart app:
npm run dev
```

---

## 📦 Installation Commands

### Install OpenAI Package

```bash
npm install openai
```

### Install with Version Lock

```bash
npm install openai@4.104.0
```

### Update OpenAI Package

```bash
npm update openai
```

### Reinstall All Dependencies

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🧪 Testing Commands

### Test AI Failure Analyzer

```bash
npx tsx -e "
import { AIFailureAnalyzer } from './src/lib/monitoring/ai/failure-analyzer';
const analyzer = new AIFailureAnalyzer();
console.log('✅ AI Failure Analyzer loaded successfully!');
"
```

### Test Agent Configuration

```bash
npx tsx -e "
import { getOpenAIClient } from './src/lib/ai/agent-config';
const client = getOpenAIClient();
console.log('✅ OpenAI client initialized successfully!');
"
```

### Run Full AI Test Suite

```bash
npm run test -- --testPathPattern="ai"
```

---

## 📚 Documentation Commands

### Open Documentation Files

```bash
# Quick Start Guide
code OPENAI_QUICKSTART.md

# Full Setup Guide
code docs/AI_SETUP_GUIDE.md

# Next Steps
code NEXT_STEPS_OPENAI.md

# This Reference
code OPENAI_COMMANDS.md
```

### View Documentation in Terminal

```bash
cat OPENAI_QUICKSTART.md | less
```

---

## 🚑 Emergency Fix Commands

### Problem: API Key Not Working

```bash
# Verify key format
echo $OPENAI_API_KEY | cut -c1-10
# Should show: sk-proj-XX or sk-XXXXXX

# Test key directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq '.data[0].id'
```

### Problem: Module Not Found

```bash
# Clean install
rm -rf node_modules
npm install

# Verify installation
npm list openai
```

### Problem: Environment Variables Not Loading

```bash
# Check Node environment
node -e "console.log(process.env.OPENAI_API_KEY ? '✅ Key loaded' : '❌ Key not found')"

# Force reload
source .env
export $(cat .env | grep -v '^#' | xargs)
```

---

## 💰 Cost Management Commands

### Set Development Mode (Cheap)

```bash
export OPENAI_MODEL=gpt-4o-mini
echo "OPENAI_MODEL=gpt-4o-mini" >> .env
```

### Set Production Mode (Best Quality)

```bash
export OPENAI_MODEL=gpt-4o
echo "OPENAI_MODEL=gpt-4o" >> .env
```

### Limit Max Tokens (Control Costs)

```bash
echo "OPENAI_MAX_TOKENS=500" >> .env
```

---

## 🎯 One-Liner Setup (Complete)

```bash
# Get API key from: https://platform.openai.com/api-keys
# Then run this (replace YOUR_KEY):
echo "OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE" >> .env && \
echo "OPENAI_MODEL=gpt-4o-mini" >> .env && \
echo "AI_ANALYSIS_ENABLED=true" >> .env && \
npx tsx scripts/verify-openai.ts
```

---

## 📱 Platform-Specific Commands

### Windows (PowerShell)

```powershell
# Add API key
Add-Content -Path .env -Value "OPENAI_API_KEY=sk-proj-your-key"

# View .env
Get-Content .env | Select-String "OPENAI"

# Open usage dashboard
Start-Process "https://platform.openai.com/usage"
```

### Mac/Linux (Bash)

```bash
# Add API key
echo "OPENAI_API_KEY=sk-proj-your-key" >> .env

# View .env
cat .env | grep OPENAI

# Open usage dashboard
open https://platform.openai.com/usage  # Mac
xdg-open https://platform.openai.com/usage  # Linux
```

---

## 🔗 Useful URLs

```bash
# Get API Key
https://platform.openai.com/api-keys

# View Usage & Billing
https://platform.openai.com/usage
https://platform.openai.com/account/billing

# Set Usage Limits
https://platform.openai.com/account/billing/limits

# API Documentation
https://platform.openai.com/docs

# Service Status
https://status.openai.com

# Help Center
https://help.openai.com
```

---

## ⚡ Quick Test Script

### Create & Run Test File

```bash
cat > test-openai.ts << 'EOF'
import { OpenAI } from 'openai';

async function test() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  console.log('🧪 Testing OpenAI connection...');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a farming assistant.' },
      { role: 'user', content: 'Say "Hello Farmers Market!"' }
    ]
  });

  console.log('✅ Success!');
  console.log('📝 Response:', response.choices[0].message.content);
  console.log('🎯 Model:', response.model);
  console.log('💰 Tokens:', response.usage?.total_tokens);
}

test().catch(console.error);
EOF

# Run test
npx tsx test-openai.ts

# Clean up
rm test-openai.ts
```

---

**Quick Reference Card Version 1.0**  
**Farmers Market Platform - Divine Agricultural Intelligence**

_Keep this file bookmarked for instant access to all OpenAI commands!_ 🌾🤖⚡
