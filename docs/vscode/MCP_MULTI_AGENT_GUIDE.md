# Multi-Agent AI Workflow for VS Code: Paid & Free Agents

## Executive Summary
This guide provides a comprehensive, conflict-free workflow for integrating **one paid agent** (GitHub Copilot Pro) as a team leader, alongside **two different free agents** (Codeium and Tabnine/Continue.dev) to maximize productivity and maintain clear task ownership in a Visual Studio Code environment.

---

## Team Roles & Responsibilities

| Role               | Agent                       | Cost       | Primary Functions                                            |
|--------------------|-----------------------------|------------|-------------------------------------------------------------|
| Team Leader        | GitHub Copilot Pro (Paid)   | $10/month  | Task management, large feature implementation, code review   |
| Support (Auto)     | Codeium (Free)              | Free       | Autocomplete, minor refactors, boilerplate, documentation    |
| Support (Research) | Tabnine Free or Continue    | Free       | Testing, background research, documentation, alt solutions   |

### Leader (Paid Agent: Copilot Pro) - Main Task Owner
- Has full use of agent mode, unlimited premium requests, and advanced refactoring.
- Delegates background or non-critical tasks only via MCP agent tools (background agent mode).
- **Never shares core implementation files with support agents during task execution.**
- Can assign tickets/issues to own agent for background, test, or review operations.

### Support Agent 1 (Codeium Free) - Autocomplete & Boilerplate
- Provides completion, suggestions, and non-critical stray file edits.
- Never edits or commits code simultaneously with the leader agent's primary task.
- Best for rapid prototyping, frontend widgets, or docstrings.

### Support Agent 2 (Tabnine Free / Continue.dev) - Research & Testing
- Handles research, unit/integration test generation, and code or algorithm exploration.
- Should be restricted to different folders or files than those currently edited by the leader agent.
- Continue.dev enables local model experiments for privacy-focused or side projects.

---

## Workflow Design and Best Practices

### Allocation Rules
| Priority    | Handler               | Example Tasks                                      |
|-------------|-----------------------|----------------------------------------------------|
| Critical    | Copilot Pro           | Bug fixes, architecture, main features             |
| High        | Copilot Pro (agent/mcp) | Docs, tests, cross-repo changes (delegated)    |
| Medium      | Codeium Free          | Completion, boilerplate, routine patterns          |
| Low         | Tabnine Free/Continue | Research, non-blocking, alt implementations        |

### Isolation Strategies
- **Branch separation:** Assign each agent to separate git branches if background changes are required.
- **Workspace folders:** Use VS Code multi-root workspaces to assign each support agent a unique workspace or folder.
- **Change boundaries:** Set explicit chat and editing scopes via extension settings or file/folder exclusions.
- **MCP Tools (for Copilot Pro):** Leverage MCP for background task delegation; this keeps leader agent's main context unmodified.
- **Review before merge:** Require reviewing all support agent contributions via code review before merging to the main branch.

### Example [settings.json] for VS Code Separation
```json
{
  // For Copilot Pro (Paid leader agent)
  "github.copilot.enable": true,
  "github.copilot.agentMode": "enabled",
  "githubPullRequests.codingAgent.uiIntegration": true,

  // For Codeium (Autocomplete, auto)
  "codeium.enable": true,
  "codeium.languages": ["javascript", "typescript", "python"],
  // Example: restrict to frontend/

  // For Tabnine (Research, testing)
  "tabnine.experimentalAutoImports": false,
  "tabnine.onlyInFolders": ["/test", "/research"],
  // For Continue.dev
  "continue.model": "ollama/llama3",
  "continue.allowedFolders": ["/playground", "/tests"]
}
```

---

## Implementation Checklist
1. **Setup all three agents in VS Code**
   - Install GitHub Copilot, Codeium, Tabnine or Continue extensions.
   - Log in and configure as needed.
2. **Branch and workspace isolation**
   - Main feature tasks assigned to Copilot Pro only.
   - Complementary or exploratory tasks assigned to free agents on non-overlapping files/folders.
3. **Delegate background tasks using Copilot Pro's agent/MCP tools**
   - Use `Delegate to coding agent` feature for long-running or reviewable background work.
4. **Explicitly define support agent scope by folders (settings.json)**
   - Only allow free agents to auto-complete/edit in assigned zones, e.g., docs/ or tests/.
5. **Monitor, review, and merge support agent contributions**
   - Use Pull Requests for all merges.

---

## Notes & Considerations
- Free tiers for Codeium and Tabnine have rate/request caps and reduced feature sets; scale tasks accordingly.
- Continue.dev offers unique privacy-oriented completions; ideal for experiments or non-production support roles.
- Never allow support agents to overwrite or merge into leader agent's main working branch without code review.
- Use agent mode and MCP to maximize the Copilot Pro agent's autonomy while maintaining control.

---

## References
- GitHub Copilot Pro, agent mode & MCP [24][32][107]
- Codeium free tier [69][110][98]
- Tabnine free tier [86][89][97]
- Continue.dev for open models [99][105][115]
- VS Code extension config [103][106][116]
