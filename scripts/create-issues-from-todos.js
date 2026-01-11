#!/usr/bin/env node

/**
 * 📝 TODO TO GITHUB ISSUES CONVERTER
 *
 * Scans codebase for TODO/FIXME/HACK comments and generates GitHub issues
 *
 * Features:
 * - Finds all TODO/FIXME/HACK/XXX comments
 * - Groups by context and priority
 * - Generates GitHub issue templates
 * - Creates issues.md file for bulk import
 * - Provides GitHub CLI commands
 *
 * Usage:
 *   node scripts/create-issues-from-todos.js [--output=<path>]
 *
 * Options:
 *   --output       Output file path (default: github-issues-from-todos.md)
 *   --json         Also output JSON format
 *   --labels       Comma-separated labels to add (default: tech-debt,refactor)
 */

const fs = require("fs");
const path = require("path");

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // File extensions to scan
  extensions: [".ts", ".tsx", ".js", ".jsx", ".md"],

  // Directories to exclude
  excludeDirs: [
    "node_modules",
    "dist",
    "build",
    ".next",
    "coverage",
    ".git",
    ".backup",
  ],

  // Comment patterns to find
  patterns: {
    TODO: /\/\/\s*TODO:?\s*(.+?)$/gim,
    FIXME: /\/\/\s*FIXME:?\s*(.+?)$/gim,
    HACK: /\/\/\s*HACK:?\s*(.+?)$/gim,
    XXX: /\/\/\s*XXX:?\s*(.+?)$/gim,
  },

  // Priority mapping
  priorities: {
    FIXME: "high",
    HACK: "high",
    XXX: "medium",
    TODO: "low",
  },

  // Default labels
  defaultLabels: ["tech-debt", "refactor"],
};

// ============================================================================
// STATE
// ============================================================================

const state = {
  todos: [],
  filesScanned: 0,
  outputPath: "github-issues-from-todos.md",
  outputJson: false,
  customLabels: [],
};

// ============================================================================
// UTILITIES
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);

  for (const arg of args) {
    if (arg.startsWith("--output=")) {
      state.outputPath = arg.split("=")[1];
    } else if (arg === "--json") {
      state.outputJson = true;
    } else if (arg.startsWith("--labels=")) {
      state.customLabels = arg
        .split("=")[1]
        .split(",")
        .map((l) => l.trim());
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
📝 TODO to GitHub Issues Converter

Usage:
  node scripts/create-issues-from-todos.js [options]

Options:
  --output=<path>  Output file path (default: github-issues-from-todos.md)
  --json           Also output JSON format
  --labels=<list>  Comma-separated labels (default: tech-debt,refactor)
  --help, -h       Show this help message

Examples:
  node scripts/create-issues-from-todos.js
  node scripts/create-issues-from-todos.js --json
  node scripts/create-issues-from-todos.js --labels=bug,urgent
      `);
      process.exit(0);
    }
  }
}

function shouldExclude(filePath, fileName) {
  for (const dir of CONFIG.excludeDirs) {
    if (
      filePath.includes(path.sep + dir + path.sep) ||
      filePath.startsWith(dir + path.sep)
    ) {
      return true;
    }
  }
  return false;
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const relativePath = path.relative(process.cwd(), fullPath);

    if (shouldExclude(relativePath, file)) {
      return;
    }

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file);
      if (CONFIG.extensions.includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function extractContext(lines, lineIndex, contextLines = 2) {
  const start = Math.max(0, lineIndex - contextLines);
  const end = Math.min(lines.length, lineIndex + contextLines + 1);
  return lines.slice(start, end).join("\n");
}

function detectCategory(filePath, comment) {
  const lowerPath = filePath.toLowerCase();
  const lowerComment = comment.toLowerCase();

  if (lowerPath.includes("api") || lowerComment.includes("api")) {
    return "API";
  }
  if (lowerPath.includes("component") || lowerPath.includes("ui")) {
    return "UI/Components";
  }
  if (lowerPath.includes("service")) {
    return "Services";
  }
  if (lowerPath.includes("database") || lowerPath.includes("repository")) {
    return "Database";
  }
  if (lowerPath.includes("test")) {
    return "Testing";
  }
  if (lowerPath.includes("auth")) {
    return "Authentication";
  }
  if (lowerPath.includes("payment") || lowerPath.includes("stripe")) {
    return "Payments";
  }
  if (lowerComment.includes("email") || lowerComment.includes("notification")) {
    return "Notifications";
  }
  if (
    lowerComment.includes("security") ||
    lowerComment.includes("validation")
  ) {
    return "Security";
  }
  if (
    lowerComment.includes("performance") ||
    lowerComment.includes("optimize")
  ) {
    return "Performance";
  }

  return "General";
}

function scanFile(filePath) {
  state.filesScanned++;

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    const relativePath = path.relative(process.cwd(), filePath);

    for (const [type, pattern] of Object.entries(CONFIG.patterns)) {
      let match;
      // Reset regex
      pattern.lastIndex = 0;

      const matches = [...content.matchAll(pattern)];

      for (const match of matches) {
        const comment = match[1].trim();

        // Find line number
        const beforeMatch = content.substring(0, match.index);
        const lineNumber = beforeMatch.split("\n").length;

        // Get context
        const context = extractContext(lines, lineNumber - 1);

        // Detect category
        const category = detectCategory(relativePath, comment);

        state.todos.push({
          type,
          comment,
          file: relativePath,
          lineNumber,
          priority: CONFIG.priorities[type],
          category,
          context,
        });
      }
    }
  } catch (error) {
    console.error(`❌ Error scanning ${filePath}:`, error.message);
  }
}

function generateIssueTitle(todo) {
  // Truncate long comments
  const maxLength = 80;
  let title = todo.comment;

  if (title.length > maxLength) {
    title = title.substring(0, maxLength) + "...";
  }

  return `[${todo.category}] ${title}`;
}

function generateIssueBody(todo) {
  const fileLink = `./${todo.file}#L${todo.lineNumber}`;

  return `## Description

${todo.comment}

## Location

**File**: \`${todo.file}\`
**Line**: ${todo.lineNumber}
[View in code](${fileLink})

## Context

\`\`\`${path.extname(todo.file).substring(1)}
${todo.context}
\`\`\`

## Type

${todo.type} (Priority: ${todo.priority})

## Category

${todo.category}

---

*This issue was automatically generated from a code comment.*
`;
}

function generateLabels(todo) {
  const labels = [...CONFIG.defaultLabels];

  if (state.customLabels.length > 0) {
    labels.push(...state.customLabels);
  }

  // Add priority label
  labels.push(`priority:${todo.priority}`);

  // Add type label
  labels.push(todo.type.toLowerCase());

  // Add category label
  labels.push(todo.category.toLowerCase().replace(/\//g, "-"));

  return [...new Set(labels)];
}

function groupByCategory(todos) {
  const grouped = {};

  for (const todo of todos) {
    if (!grouped[todo.category]) {
      grouped[todo.category] = [];
    }
    grouped[todo.category].push(todo);
  }

  return grouped;
}

function generateMarkdownReport() {
  const grouped = groupByCategory(state.todos);
  const categories = Object.keys(grouped).sort();

  let markdown = `# GitHub Issues from TODO Comments

**Generated**: ${new Date().toISOString()}
**Total TODOs Found**: ${state.todos.length}
**Files Scanned**: ${state.filesScanned}

---

## Summary by Category

| Category | Count | High Priority | Medium Priority | Low Priority |
|----------|-------|---------------|-----------------|--------------|
`;

  for (const category of categories) {
    const todos = grouped[category];
    const high = todos.filter((t) => t.priority === "high").length;
    const medium = todos.filter((t) => t.priority === "medium").length;
    const low = todos.filter((t) => t.priority === "low").length;
    markdown += `| ${category} | ${todos.length} | ${high} | ${medium} | ${low} |\n`;
  }

  markdown += `\n---\n\n## Issues by Category\n\n`;

  for (const category of categories) {
    markdown += `### ${category}\n\n`;

    const todos = grouped[category].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    for (let i = 0; i < todos.length; i++) {
      const todo = todos[i];
      const labels = generateLabels(todo);

      markdown += `#### Issue ${i + 1}: ${generateIssueTitle(todo)}\n\n`;
      markdown += `**Priority**: ${todo.priority.toUpperCase()}  \n`;
      markdown += `**Type**: ${todo.type}  \n`;
      markdown += `**Labels**: ${labels.map((l) => `\`${l}\``).join(", ")}  \n\n`;
      markdown += generateIssueBody(todo);
      markdown += `\n---\n\n`;
    }
  }

  markdown += `## GitHub CLI Commands\n\n`;
  markdown += `To create these issues using GitHub CLI:\n\n`;
  markdown += `\`\`\`bash\n`;

  let issueNum = 1;
  for (const category of categories) {
    const todos = grouped[category];

    for (const todo of todos) {
      const title = generateIssueTitle(todo).replace(/"/g, '\\"');
      const labels = generateLabels(todo).join(",");
      const bodyFile = `issue-${issueNum}-body.md`;

      markdown += `# Issue ${issueNum}\n`;
      markdown += `gh issue create --title "${title}" --body-file "${bodyFile}" --label "${labels}"\n\n`;
      issueNum++;
    }
  }

  markdown += `\`\`\`\n\n`;

  markdown += `## Bulk Import Instructions\n\n`;
  markdown += `### Option 1: GitHub CLI (Recommended)\n\n`;
  markdown += `1. Install GitHub CLI: https://cli.github.com/\n`;
  markdown += `2. Authenticate: \`gh auth login\`\n`;
  markdown += `3. Create issue body files (see section below)\n`;
  markdown += `4. Run the commands above\n\n`;

  markdown += `### Option 2: GitHub Web UI\n\n`;
  markdown += `1. Navigate to your repository's Issues page\n`;
  markdown += `2. Click "New Issue"\n`;
  markdown += `3. Copy/paste title and body from each issue above\n`;
  markdown += `4. Add labels manually\n\n`;

  markdown += `### Option 3: GitHub API\n\n`;
  markdown += `Use the JSON output (--json flag) with GitHub's REST API:\n\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `curl -X POST -H "Authorization: token YOUR_TOKEN" \\\n`;
  markdown += `  -H "Accept: application/vnd.github.v3+json" \\\n`;
  markdown += `  https://api.github.com/repos/OWNER/REPO/issues \\\n`;
  markdown += `  -d @issue.json\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `---\n\n`;
  markdown += `*Generated by create-issues-from-todos.js*\n`;

  return markdown;
}

function generateJsonOutput() {
  const issues = state.todos.map((todo, index) => ({
    number: index + 1,
    title: generateIssueTitle(todo),
    body: generateIssueBody(todo),
    labels: generateLabels(todo),
    priority: todo.priority,
    category: todo.category,
    type: todo.type,
    file: todo.file,
    lineNumber: todo.lineNumber,
  }));

  return JSON.stringify(
    {
      generated: new Date().toISOString(),
      totalIssues: issues.length,
      filesScanned: state.filesScanned,
      issues,
    },
    null,
    2,
  );
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  console.log("📝 TODO to GitHub Issues Converter");
  console.log("=".repeat(60) + "\n");

  parseArgs();

  console.log(`📊 Output: ${state.outputPath}`);
  console.log(
    `🏷️  Labels: ${[...CONFIG.defaultLabels, ...state.customLabels].join(", ")}\n`,
  );

  // Scan files
  console.log("🔍 Scanning for TODO comments...");
  const files = getAllFiles("src");
  console.log(`📝 Found ${files.length} files to scan\n`);

  const startTime = Date.now();

  for (const file of files) {
    scanFile(file);
  }

  const duration = Date.now() - startTime;

  // Print summary
  console.log("=".repeat(60));
  console.log("📊 Scan Summary");
  console.log("=".repeat(60));
  console.log(`✅ Files Scanned: ${state.filesScanned}`);
  console.log(`📝 TODOs Found: ${state.todos.length}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  console.log("=".repeat(60) + "\n");

  if (state.todos.length === 0) {
    console.log("✨ No TODOs found! Your code is clean! 🎉");
    return;
  }

  // Print breakdown
  console.log("📊 Breakdown by Type:");
  const byType = {};
  state.todos.forEach((t) => {
    byType[t.type] = (byType[t.type] || 0) + 1;
  });
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

  console.log("\n📊 Breakdown by Priority:");
  const byPriority = {};
  state.todos.forEach((t) => {
    byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
  });
  Object.entries(byPriority).forEach(([priority, count]) => {
    console.log(`   ${priority}: ${count}`);
  });

  console.log("\n📊 Breakdown by Category:");
  const byCategory = {};
  state.todos.forEach((t) => {
    byCategory[t.category] = (byCategory[t.category] || 0) + 1;
  });
  Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });

  console.log("");

  // Generate outputs
  console.log("📝 Generating reports...\n");

  // Markdown report
  const markdown = generateMarkdownReport();
  fs.writeFileSync(state.outputPath, markdown, "utf8");
  console.log(`✅ Markdown report: ${state.outputPath}`);

  // JSON output
  if (state.outputJson) {
    const jsonPath = state.outputPath.replace(/\.md$/, ".json");
    const json = generateJsonOutput();
    fs.writeFileSync(jsonPath, json, "utf8");
    console.log(`✅ JSON output: ${jsonPath}`);
  }

  console.log("\n📋 Next Steps:");
  console.log("   1. Review the generated report");
  console.log("   2. Choose bulk import method (see report)");
  console.log("   3. Create GitHub issues");
  console.log("   4. Remove TODO comments as issues are resolved\n");

  console.log("💡 Tip: Use GitHub CLI for fastest bulk import:");
  console.log('   gh issue create --title "..." --body "..." --label "..."\n');
}

// Run the script
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  }
}

module.exports = { main, CONFIG };
