# 🤖 OpenAI API Setup Guide

**Farmers Market Platform - AI Integration**

## 📋 Overview

This guide will help you configure OpenAI API integration for the Farmers Market Platform's AI-powered features including:

- 🧠 AI-powered failure analysis
- 🤖 Multi-agent orchestration
- 🌾 Agricultural intelligence
- 🔍 Root cause identification
- 📊 Performance predictions
- 🛠️ Automated remediation

## 🔑 Step 1: Get Your OpenAI API Key

### Option A: Create New OpenAI Account

1. Go to [https://platform.openai.com/signup](https://platform.openai.com/signup)
2. Sign up with your email or Google/Microsoft account
3. Verify your email address
4. Complete the account setup

### Option B: Use Existing Account

1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Log in to your account
3. Navigate to API keys section

### Generate API Key

1. Click on your profile icon (top-right)
2. Select **"API Keys"** from the dropdown
3. Click **"Create new secret key"**
4. Give it a name (e.g., "Farmers Market Platform")
5. Copy the key immediately (you won't see it again!)
6. Store it securely

**Important**: Your API key should look like: `sk-proj-...` or `sk-...`

## ⚙️ Step 2: Add API Key to Environment

### Method 1: Edit .env File (Recommended)

1. Open your `.env` file in the project root
2. Add this line:

```bash
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

3. Save the file

### Method 2: Edit .env.local File

1. Create or open `.env.local` in project root
2. Add the same line as above
3. Save the file

### Method 3: Copy from Example

```bash
# Copy example file
cp .env.example .env

# Edit the file and add your key
nano .env
```

## ✅ Step 3: Verify Installation

Run the verification script:

```bash
npx tsx scripts/verify-openai.ts
```

This will:

- ✅ Check if API key is configured
- ✅ Test connection to OpenAI
- ✅ Validate key format
- ✅ Test basic completion
- ✅ Show available models
- ✅ Display configuration recommendations

### Expected Output

```
╔════════════════════════════════════════════════════════════════════════╗
║   ✅ ALL TESTS PASSED - OpenAI Integration Ready! ✅                  ║
╚════════════════════════════════════════════════════════════════════════╝
```

## 🎯 Step 4: Configure AI Features

### Full Configuration (.env)

Add these environment variables for complete AI functionality:

```bash
# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=sk-proj-your-actual-api-key-here

# AI Features (OPTIONAL - defaults to true)
AI_ANALYSIS_ENABLED=true
AGENT_ORCHESTRATION_ENABLED=true
ML_PREDICTION_ENABLED=true
SELF_HEALING_ENABLED=true

# Model Configuration (OPTIONAL)
OPENAI_MODEL=gpt-4o                    # Production: gpt-4o, Dev: gpt-4o-mini
OPENAI_TEMPERATURE=0.7                 # 0.0-1.0, lower = more deterministic
OPENAI_MAX_TOKENS=2000                 # Maximum tokens per response

# Tracing (OPTIONAL)
TRACING_ENABLED=true
```

### Minimal Configuration

For basic functionality, you only need:

```bash
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

## 🚀 Step 5: Start Development Server

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The application will now run with full AI capabilities!

## 📊 Available AI Features

### 1. AI Failure Analyzer

**Location**: `src/lib/monitoring/ai/failure-analyzer.ts`

**Features**:

- Analyzes workflow failures
- Identifies root causes (70-95% confidence)
- Provides remediation steps
- Predicts future issues
- Generates executive summaries

**Usage**:

```typescript
import { AIFailureAnalyzer } from "@/lib/monitoring/ai/failure-analyzer";

const analyzer = new AIFailureAnalyzer({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o",
  temperature: 0.3,
});

const analysis = await analyzer.analyzeFailure(workflowResult);
console.log(analysis.rootCause);
console.log(analysis.remediationSteps);
```

### 2. Multi-Agent Orchestration

**Location**: `src/lib/monitoring/agents/workflow-agent-orchestrator.ts`

**Features**:

- Collaborative agent workflows
- Distributed problem solving
- Specialized agent roles
- Consensus building

**Usage**:

```typescript
import { WorkflowAgentOrchestrator } from "@/lib/monitoring/agents/workflow-agent-orchestrator";

const orchestrator = new WorkflowAgentOrchestrator({
  openaiApiKey: process.env.OPENAI_API_KEY,
});

const result = await orchestrator.analyzeWithAgents(workflowResult);
```

### 3. Agricultural Intelligence

**Location**: `src/lib/ai/agent-config.ts`

**Features**:

- Farm operations analysis
- Product recommendations
- Order processing intelligence
- Seasonal awareness

**Usage**:

```typescript
import { getOpenAIClient, FARM_ANALYST_AGENT } from "@/lib/ai/agent-config";

const client = getOpenAIClient();
const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: FARM_ANALYST_AGENT.systemPrompt },
    { role: "user", content: "Analyze this farm data..." },
  ],
});
```

## 💰 Pricing & Cost Management

### Model Pricing (as of 2024)

| Model       | Input (per 1M tokens) | Output (per 1M tokens) | Best For                    |
| ----------- | --------------------- | ---------------------- | --------------------------- |
| gpt-4o      | $5.00                 | $15.00                 | Production, best quality    |
| gpt-4o-mini | $0.15                 | $0.60                  | Development, cost-effective |
| gpt-4-turbo | $10.00                | $30.00                 | Legacy support              |

### Cost Optimization Tips

1. **Development**: Use `gpt-4o-mini` (20x cheaper)
2. **Production**: Use `gpt-4o` (best quality/cost ratio)
3. **Caching**: Enable response caching
4. **Token Limits**: Set appropriate `max_tokens`
5. **Monitoring**: Track usage in OpenAI dashboard

### Set Usage Limits

1. Go to [https://platform.openai.com/account/billing/limits](https://platform.openai.com/account/billing/limits)
2. Set monthly budget (e.g., $50/month)
3. Enable email notifications
4. Monitor usage regularly

## 🔒 Security Best Practices

### ✅ DO

- ✅ Store API key in `.env` or `.env.local`
- ✅ Add `.env` to `.gitignore`
- ✅ Use environment variables
- ✅ Rotate keys periodically
- ✅ Set usage limits
- ✅ Monitor for unauthorized access

### ❌ DON'T

- ❌ Commit API keys to Git
- ❌ Share keys publicly
- ❌ Hardcode keys in source
- ❌ Use same key across projects
- ❌ Expose keys in client-side code
- ❌ Include keys in logs

### Key Rotation

If you suspect your key is compromised:

1. Go to OpenAI dashboard
2. Delete the compromised key
3. Create a new key
4. Update `.env` file
5. Restart application

## 🧪 Testing AI Integration

### Quick Test

```bash
# Verify OpenAI setup
npx tsx scripts/verify-openai.ts
```

### Manual Test

Create `test.ts`:

```typescript
import { OpenAI } from "openai";

async function test() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: 'Say "Hello Farmers Market!"' }],
  });

  console.log(response.choices[0].message.content);
}

test();
```

Run: `npx tsx test.ts`

## 🐛 Troubleshooting

### Error: "OPENAI_API_KEY not found"

**Solution**: Add key to `.env` file

```bash
echo "OPENAI_API_KEY=sk-proj-..." >> .env
```

### Error: "Authentication failed - Invalid API key"

**Causes**:

- Key is incorrect or expired
- Key format is wrong (should start with `sk-`)
- Key doesn't have permissions

**Solution**: Generate new key from OpenAI dashboard

### Error: "Rate limit exceeded"

**Causes**:

- Too many requests
- Free tier limits reached
- Billing issue

**Solution**:

1. Check OpenAI billing dashboard
2. Add payment method
3. Wait for rate limit reset
4. Implement request throttling

### Error: "Network connection failed"

**Causes**:

- No internet connection
- Firewall blocking
- OpenAI service down

**Solution**:

1. Check internet connection
2. Test with: `curl https://api.openai.com`
3. Check OpenAI status page

### Error: "Module 'openai' not found"

**Solution**: Install OpenAI package

```bash
npm install openai
```

## 📈 Monitoring Usage

### OpenAI Dashboard

1. Go to [https://platform.openai.com/usage](https://platform.openai.com/usage)
2. View:
   - Daily token usage
   - Cost breakdown
   - Request counts
   - Model usage statistics

### Application Monitoring

Check logs for AI usage:

```bash
# View AI analyzer logs
npm run dev | grep "AI Failure Analyzer"

# View agent orchestration logs
npm run dev | grep "Agent Orchestrator"
```

## 🎓 Learning Resources

### Official Documentation

- [OpenAI API Docs](https://platform.openai.com/docs)
- [GPT-4o Guide](https://platform.openai.com/docs/models/gpt-4o)
- [Best Practices](https://platform.openai.com/docs/guides/production-best-practices)

### Platform-Specific Guides

- `.github/instructions/09_AI_WORKFLOW_AUTOMATION.instructions.md`
- `.github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md`
- `src/lib/ai/README.md` (if exists)

## 📞 Support

### OpenAI Support

- Email: support@openai.com
- Help Center: [https://help.openai.com](https://help.openai.com)
- Community: [https://community.openai.com](https://community.openai.com)

### Platform Issues

- Check existing issues in the repository
- Review error logs
- Consult divine instruction files
- Ask in development channels

## ✨ Next Steps

After successful setup:

1. ✅ **Verify Installation**: Run verification script
2. 🚀 **Start Development**: Launch dev server
3. 🧪 **Test Features**: Try AI-powered features
4. 📊 **Monitor Usage**: Check OpenAI dashboard
5. 🎯 **Optimize**: Adjust model/temperature settings
6. 📈 **Scale**: Move to production when ready

---

## 🌟 Quick Reference Card

```bash
# 1. Add API Key
echo "OPENAI_API_KEY=sk-proj-..." >> .env

# 2. Verify Setup
npx tsx scripts/verify-openai.ts

# 3. Start Server
npm run dev

# 4. Monitor Usage
# Visit: https://platform.openai.com/usage
```

---

**Status**: ✅ Ready for Divine Agricultural Intelligence
**Version**: 1.0
**Last Updated**: November 2024

_"Code with agricultural consciousness, architect with divine precision, deliver with AI-powered efficiency."_ 🌾🤖⚡
