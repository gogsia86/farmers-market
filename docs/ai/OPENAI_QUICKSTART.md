# 🚀 OpenAI API Quick Start Guide

**Farmers Market Platform - Get AI Running in 5 Minutes**

## ⚡ Super Quick Setup

### 1️⃣ Get Your API Key (2 minutes)

1. Go to: https://platform.openai.com/api-keys
2. Sign in or create account
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-proj-...` or `sk-...`)

### 2️⃣ Add to Environment (1 minute)

**Option A: Automatic Setup (Recommended)**

```bash
npx tsx scripts/setup-openai.ts
```

Follow the prompts - it will guide you through everything!

**Option B: Manual Setup**

```bash
# Open .env file and add:
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

### 3️⃣ Verify It Works (30 seconds)

```bash
npx tsx scripts/verify-openai.ts
```

You should see: ✅ **ALL TESTS PASSED**

### 4️⃣ Start Developing (30 seconds)

```bash
npm run dev
```

🎉 **Done!** Your AI features are now active!

---

## 🎯 What You Get

With OpenAI configured, you now have:

- ✅ **AI Failure Analysis** - Automatic root cause detection
- ✅ **Multi-Agent Orchestration** - Collaborative AI workflows
- ✅ **Agricultural Intelligence** - Farm-specific insights
- ✅ **Performance Predictions** - Proactive issue detection
- ✅ **Auto-Remediation** - Smart fix suggestions

---

## 💰 Cost Management

### Development (Cheap)

```bash
# In .env, add:
OPENAI_MODEL=gpt-4o-mini
```

Cost: ~$0.15 per 1M tokens (20x cheaper!)

### Production (Best Quality)

```bash
# In .env, add:
OPENAI_MODEL=gpt-4o
```

Cost: ~$5.00 per 1M tokens (best quality)

**Set a budget**: https://platform.openai.com/account/billing/limits

---

## 🔒 Security Checklist

- ✅ API key is in `.env` file
- ✅ `.env` is in `.gitignore`
- ✅ Never commit keys to Git
- ✅ Set usage limits on OpenAI dashboard
- ✅ Monitor usage regularly

---

## 🐛 Quick Troubleshooting

### "OPENAI_API_KEY not found"

```bash
# Check if key is in .env:
cat .env | grep OPENAI_API_KEY

# If not found, add it:
echo "OPENAI_API_KEY=sk-proj-your-key" >> .env
```

### "Authentication failed"

- Double-check your API key (copy-paste again)
- Make sure it starts with `sk-`
- Generate a new key from OpenAI dashboard

### "Rate limit exceeded"

- Check billing: https://platform.openai.com/account/billing
- Add payment method if needed
- Wait a few minutes and retry

### "Module 'openai' not found"

```bash
npm install openai
```

---

## 📚 Full Documentation

For detailed setup, features, and advanced configuration:

- **Full Guide**: `docs/AI_SETUP_GUIDE.md`
- **Divine Instructions**: `.github/instructions/09_AI_WORKFLOW_AUTOMATION.instructions.md`
- **Agent Config**: `src/lib/ai/agent-config.ts`

---

## 🎓 Example Usage

### Test AI in Your Code

```typescript
import { getOpenAIClient } from "@/lib/ai/agent-config";

const client = getOpenAIClient();

const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: "You are a farming assistant." },
    { role: "user", content: "What crops grow well in spring?" },
  ],
});

console.log(response.choices[0].message.content);
```

### Run Failure Analysis

```typescript
import { AIFailureAnalyzer } from "@/lib/monitoring/ai/failure-analyzer";

const analyzer = new AIFailureAnalyzer();
const analysis = await analyzer.analyzeFailure(workflowResult);

console.log("Root Cause:", analysis.rootCause);
console.log("Fix Steps:", analysis.remediationSteps);
```

---

## ✅ Verification Commands

```bash
# Test OpenAI connection
npx tsx scripts/verify-openai.ts

# Check environment variables
npm run env:check

# View current configuration
cat .env | grep OPENAI

# Monitor logs during development
npm run dev | grep "AI"
```

---

## 📊 Monitor Your Usage

**OpenAI Dashboard**: https://platform.openai.com/usage

Track:

- Daily token usage
- Cost breakdown
- Request counts
- Model statistics

**Tip**: Set up email alerts for budget thresholds!

---

## 🌟 Pro Tips

1. **Use Mini for Dev**: `gpt-4o-mini` is 20x cheaper, perfect for testing
2. **Cache Responses**: Store common queries to reduce API calls
3. **Set Max Tokens**: Limit response size to control costs
4. **Monitor Daily**: Check usage dashboard regularly
5. **Rotate Keys**: Change API keys every few months

---

## 🚨 Emergency Contacts

**OpenAI Down?**

- Status: https://status.openai.com
- Support: https://help.openai.com

**Key Compromised?**

1. Delete key: https://platform.openai.com/api-keys
2. Create new key
3. Update `.env` file
4. Restart application

---

## 📞 Need Help?

- 📖 Full Guide: `docs/AI_SETUP_GUIDE.md`
- 🤖 AI Patterns: `.github/instructions/`
- 💬 Community: Check repository discussions
- 🐛 Issues: Report on GitHub

---

## 🎯 Next Steps After Setup

1. ✅ Run verification script
2. 🧪 Test AI features in dev mode
3. 📊 Monitor usage on OpenAI dashboard
4. 🎨 Customize agent prompts
5. 🚀 Deploy to production

---

**Quick Command Reference**:

```bash
# Setup
npx tsx scripts/setup-openai.ts

# Verify
npx tsx scripts/verify-openai.ts

# Develop
npm run dev

# Monitor
# Visit: https://platform.openai.com/usage
```

---

**Status**: 🟢 Ready for Divine Agricultural Intelligence  
**Time to Setup**: ⏱️ ~5 minutes  
**Difficulty**: 🟢 Beginner Friendly

_"From zero to AI in 5 minutes - Divine agricultural consciousness awaits!"_ 🌾🤖⚡

---

## 📝 Checklist

- [ ] Created OpenAI account
- [ ] Generated API key
- [ ] Added key to `.env` file
- [ ] Ran verification script
- [ ] Saw "ALL TESTS PASSED" message
- [ ] Started dev server
- [ ] Tested AI feature
- [ ] Set usage limits
- [ ] Bookmarked usage dashboard

**All checked?** 🎉 You're ready to build with AI!
