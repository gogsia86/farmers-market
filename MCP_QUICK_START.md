# 🚀 MCP QUICK START GUIDE

**Get Started with Microsoft Docs MCP in 5 Minutes**

---

## ⚡ INSTANT SETUP

### Step 1: Install MCP Servers (2 minutes)

```powershell
# Install primary MCP servers
npm install -g @modelcontextprotocol/server-microsoft-docs
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-postgres
npm install -g @modelcontextprotocol/server-filesystem

# Verify installation
npx @modelcontextprotocol/server-microsoft-docs --version
```

### Step 2: Configure GitHub Token (1 minute)

```powershell
# Create .env.local if it doesn't exist
if (!(Test-Path ".env.local")) {
  Copy-Item ".env.example" ".env.local"
}

# Add your GitHub token
# Get token from: https://github.com/settings/tokens
# Required scopes: repo, read:org, read:user
```

Add to `.env.local`:

```bash
GITHUB_TOKEN=ghp_your_personal_access_token_here
```

### Step 3: Restart VS Code (1 minute)

```powershell
# Restart VS Code to load MCP servers
code --reuse-window .
```

### Step 4: Test Integration (1 minute)

Open Copilot Chat (Ctrl+I) and try:

```
@workspace Using Microsoft Docs, show me the latest TypeScript 5.4 features
```

---

## 💡 QUICK EXAMPLES

### Example 1: Get Official Documentation

```
@workspace Using Microsoft Docs, what's the recommended pattern for Next.js 14
API routes with TypeScript?
```

### Example 2: Query Database

```
@workspace Using PostgreSQL, show me all farms with active products
```

### Example 3: Create GitHub PR

```
@workspace Create a PR for the farm profile feature with divine patterns
```

### Example 4: Search Code

```
@workspace Using filesystem, find all files with agricultural consciousness patterns
```

---

## 🎯 DIVINE COMMANDS

Use these power commands in Copilot Chat:

### Documentation Commands

- `@workspace /docs-search [topic]` - Search Microsoft Docs
- `@workspace /api-reference [api]` - Get API documentation
- `@workspace /best-practices [topic]` - Get Microsoft best practices

### Database Commands

- `@workspace /db-query [sql]` - Execute safe database query
- `@workspace /db-schema [table]` - Show table schema
- `@workspace /db-optimize [query]` - Optimize SQL query

### GitHub Commands

- `@workspace /gh-pr [branch]` - Create pull request
- `@workspace /gh-issues [label]` - List issues by label
- `@workspace /gh-search [query]` - Search code across repos

---

## 🔥 POWER TIPS

### Tip 1: Context-Aware Queries

Instead of:

```
How do I use Azure Functions?
```

Use:

```
@workspace Using Microsoft Docs, show me Azure Functions with TypeScript
for farm data processing with agricultural consciousness
```

### Tip 2: Multi-Source Queries

```
@workspace Using Microsoft Docs for TypeScript patterns and PostgreSQL
for schema, create a farm product catalog API
```

### Tip 3: Automated Workflows

```
@workspace Using GitHub, create a PR that:
1. Implements farm profile feature
2. Follows divine patterns from .github/instructions/
3. Includes comprehensive tests
4. Adds agricultural consciousness
```

---

## 🐛 TROUBLESHOOTING

### Issue: MCP Server Not Found

```powershell
# Reinstall globally
npm install -g @modelcontextprotocol/server-microsoft-docs --force

# Verify PATH includes npm global
npm config get prefix
```

### Issue: Authentication Failed

```powershell
# Check environment variables
$env:GITHUB_TOKEN
$env:DATABASE_URL

# Reload environment
dotenv -e .env.local
```

### Issue: Copilot Not Using MCP

```powershell
# Verify VS Code settings
code .vscode/settings.json

# Check MCP settings file exists
Test-Path .vscode/mcp-settings.json

# Restart VS Code
code --reuse-window .
```

---

## 📚 NEXT STEPS

1. ✅ Read full guide: `MCP_MICROSOFT_DOCS_IMPLEMENTATION.md`
2. ✅ Explore divine instructions: `.github/instructions/`
3. ✅ Try advanced examples in Copilot Chat
4. ✅ Configure additional MCP servers (AWS, Sentry)

---

**Status**: 🚀 Ready to use!
**Time to Setup**: ~5 minutes
**Power Level**: GOD-TIER

_Transform Copilot into an omniscient agricultural development partner!_
