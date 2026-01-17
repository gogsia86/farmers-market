#!/usr/bin/env tsx
/**
 * Automated Repository Restructuring Script
 * Implements the repository cleanup and reorganization plan
 *
 * @see REPOSITORY_RESTRUCTURING_PLAN.md
 * @author Claude Sonnet 4.5
 * @date 2026-01-17
 */

import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs-extra";
import { glob } from "glob";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../..");
const DRY_RUN = process.argv.includes("--dry-run");
const VERBOSE = process.argv.includes("--verbose");

interface MoveOperation {
  from: string | string[];
  to: string;
  description: string;
}

interface DeleteOperation {
  patterns: string[];
  description: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const MOVES: MoveOperation[] = [
  // Debug screenshots to assets
  {
    from: [
      "debug-auth-admin-*.png",
      "debug-auth-customer-*.png",
      "debug-auth-farmer-*.png",
    ],
    to: "docs/assets/screenshots/",
    description: "Move debug screenshots to assets",
  },

  // Session notes to archive
  {
    from: [
      "SESSION_1_*.md",
      "SESSION_2_*.md",
      "SESSION_3_*.md",
      "SESSION_4_*.md",
      "SESSION_CONTINUATION_JAN17.md",
      "SESSION_SUMMARY_PHASE2_CONTINUATION.md",
    ],
    to: "docs/99-archive/sessions/",
    description: "Archive session notes",
  },

  // Task reports to archive
  {
    from: [
      "TASK_2.2_SUMMARY.md",
      "TASK_2.3_SUMMARY.md",
      "CLEANUP_COMPLETE.md",
      "COMPREHENSIVE_PROJECT_ANALYSIS.md",
    ],
    to: "docs/99-archive/reports/",
    description: "Archive task reports",
  },

  // Phase reports to archive
  {
    from: [
      "PHASE_2_HANDOFF.md",
      "PHASE_2_STATUS_BOARD.md",
      "DEPLOYMENT_SUCCESS_TEST_TRIAGE.md",
    ],
    to: "docs/99-archive/reports/",
    description: "Archive phase reports",
  },

  // Completed integration reports to archive
  {
    from: [
      "SENTRY_INTEGRATION_COMPLETE.md",
      "VERCEL_DEPLOYMENT_FIX.md",
      "EXECUTIVE_SUMMARY.md",
    ],
    to: "docs/99-archive/reports/",
    description: "Archive integration reports",
  },

  // Old action items to archive
  {
    from: [
      "NEXT_IMMEDIATE_STEPS.md",
      "WHAT_TO_DO_NEXT.md",
      "START_HERE_NEXT_SESSION.md",
    ],
    to: "docs/99-archive/deprecated/",
    description: "Archive deprecated action items",
  },
];

const DELETES: DeleteOperation[] = [
  {
    patterns: [
      "START_HERE.ps1",
      "START_HERE.sh",
      "START_NOW.ps1",
      "START_NOW.sh",
      "TEST_AI_FEATURES.sh",
    ],
    description: "Remove obsolete startup scripts",
  },
  {
    patterns: [
      "cleanup-docs.ps1",
      "cleanup-docs.sh",
      "cleanup-repository.ps1",
      "cleanup-repository.sh",
      "optimize.ps1",
      "optimize.sh",
      "setup-database.ps1",
      "setup-database.sh",
      "deploy-production.ps1",
      "deploy-production.sh",
    ],
    description: "Remove duplicate root scripts (exist in scripts/)",
  },
  {
    patterns: [
      "create-pr-instructions.txt",
      "type-errors-audit.txt",
      "PROJECT_STATUS_BANNER.txt",
      "install.log",
    ],
    description: "Remove temporary files",
  },
  {
    patterns: [
      "SESSION_1_CLEANUP_REPORT.md",
      "SESSION_1_COMMIT_INSTRUCTIONS.md",
      "SESSION_1_FINAL_SUMMARY.md",
      "SESSION_1_NEXT_TASKS.md",
      "SESSION_1_TASK_4_TESTING_UTILITIES.md",
      "SESSION_1_TASK_5_REMOVE_DEAD_CODE.md",
      "SESSION_1_TASK_6_ESLINT_CLEANUP.md",
      "TEST_TRIAGE_PLAN.md",
    ],
    description: "Remove remaining session files",
  },
];

const SCRIPT_MOVES: MoveOperation[] = [
  // Database scripts
  {
    from: [
      "scripts/setup-database.ts",
      "scripts/check-database-data.ts",
      "scripts/check-farm-schema.ts",
      "scripts/clean-database.ts",
      "scripts/diagnose-database.ts",
      "scripts/fix-database-connection.ts",
      "scripts/apply-db-optimizations.ts",
      "scripts/backup-database.sh",
      "scripts/sync-test-db.ts",
    ],
    to: "scripts/database/",
    description: "Organize database scripts",
  },

  // Testing scripts
  {
    from: [
      "scripts/create-test-users.ts",
      "scripts/create-production-test-users.ts",
      "scripts/create-test-orders.ts",
      "scripts/seed-test-data.ts",
      "scripts/analyze-test-failures.ts",
    ],
    to: "scripts/testing/",
    description: "Organize testing scripts",
  },

  // Deployment scripts
  {
    from: [
      "scripts/deploy-phase3.ts",
      "scripts/verify-production-deployment.ts",
      "scripts/deploy-db-to-vercel.sh",
      "scripts/deploy-docker.sh",
      "scripts/check-vercel-database.sh",
      "scripts/check-vercel-env.sh",
      "scripts/check-vercel-users.ts",
    ],
    to: "scripts/deployment/",
    description: "Organize deployment scripts",
  },

  // Monitoring scripts
  {
    from: [
      "scripts/production-health-check.ts",
      "scripts/monitor-production.ts",
      "scripts/verify-production-health.ts",
      "scripts/deployment-health-monitor.ts",
      "scripts/check-sentry.js",
      "scripts/test-sentry.ts",
      "scripts/test-redis-connection.ts",
    ],
    to: "scripts/monitoring/",
    description: "Organize monitoring scripts",
  },

  // Inspection/Bot scripts
  {
    from: [
      "scripts/comprehensive-website-inspector-v4.ts",
      "scripts/bot-cli.ts",
      "scripts/website-checker-bot.ts",
      "scripts/mvp-automation-bot.ts",
    ],
    to: "scripts/inspection/",
    description: "Organize inspection scripts",
  },

  // Migration scripts
  {
    from: [
      "scripts/add-testid-migration.ts",
      "scripts/add-croatian-photos.ts",
      "scripts/add-photos.ts",
    ],
    to: "scripts/migration/",
    description: "Organize migration scripts",
  },

  // Maintenance scripts
  {
    from: [
      "scripts/warm-cache.ts",
      "scripts/verify-cache.ts",
      "scripts/kill-dev-server.js",
    ],
    to: "scripts/maintenance/",
    description: "Organize maintenance scripts",
  },
];

const SCRIPT_DELETES: DeleteOperation[] = [
  {
    patterns: [
      "scripts/check-db.js",
      "scripts/check-db-counts.ts",
      "scripts/check-db-readiness.ts",
    ],
    description:
      "Remove duplicate database checkers (use diagnose-database.ts)",
  },
  {
    patterns: [
      "scripts/cleanup-and-restart.sh",
      "scripts/cleanup-check.js",
      "scripts/cleanup-docs.sh",
      "scripts/cleanup-duplicates.sh",
      "scripts/cleanup-repo.sh",
      "scripts/cleanup-repository.sh",
    ],
    description: "Remove duplicate cleanup scripts",
  },
  {
    patterns: [
      "scripts/add-jsdom.sh",
      "scripts/archive-old-implementation.sh",
      "scripts/add-visual-test-scripts.js",
    ],
    description: "Remove obsolete scripts",
  },
];

const NEW_DIRECTORIES = [
  // Documentation structure
  "docs/01-getting-started",
  "docs/02-architecture",
  "docs/03-development",
  "docs/04-features",
  "docs/05-deployment",
  "docs/06-operations",
  "docs/07-api",
  "docs/08-maintenance",
  "docs/99-archive/sessions",
  "docs/99-archive/migrations",
  "docs/99-archive/reports",
  "docs/99-archive/deprecated",
  "docs/assets/screenshots",
  "docs/assets/diagrams",

  // Scripts structure
  "scripts/database",
  "scripts/testing",
  "scripts/deployment",
  "scripts/monitoring",
  "scripts/maintenance",
  "scripts/inspection",
  "scripts/migration",
  "scripts/development",
  "scripts/utils",
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(
  message: string,
  color: "info" | "success" | "warning" | "error" = "info",
) {
  const colors = {
    info: chalk.blue,
    success: chalk.green,
    warning: chalk.yellow,
    error: chalk.red,
  };
  console.log(colors[color](message));
}

function expandGlob(pattern: string, baseDir: string = ROOT_DIR): string[] {
  return glob.sync(pattern, { cwd: baseDir, absolute: true });
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

async function moveFile(from: string, to: string): Promise<void> {
  if (!fileExists(from)) {
    if (VERBOSE) log(`  ⊘ Skip (not found): ${path.basename(from)}`, "warning");
    return;
  }

  const toPath = path.join(ROOT_DIR, to, path.basename(from));

  if (DRY_RUN) {
    log(`  [DRY] Would move: ${path.basename(from)} → ${to}`, "info");
    return;
  }

  await fs.ensureDir(path.dirname(toPath));
  await fs.move(from, toPath, { overwrite: true });
  log(`  ✓ Moved: ${path.basename(from)}`, "success");
}

async function deleteFile(filePath: string): Promise<void> {
  if (!fileExists(filePath)) {
    if (VERBOSE)
      log(`  ⊘ Skip (not found): ${path.basename(filePath)}`, "warning");
    return;
  }

  if (DRY_RUN) {
    log(`  [DRY] Would delete: ${path.basename(filePath)}`, "info");
    return;
  }

  await fs.remove(filePath);
  log(`  ✓ Deleted: ${path.basename(filePath)}`, "success");
}

// ============================================================================
// BACKUP
// ============================================================================

async function createBackup() {
  log("\n📦 Phase 1: Creating Backup", "info");
  log("─".repeat(60), "info");

  try {
    const timestamp = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const backupBranch = `backup/pre-restructure-${timestamp}`;

    if (DRY_RUN) {
      log("[DRY] Would create backup branch: " + backupBranch, "info");
      return;
    }

    // Check if we're in a git repo
    try {
      execSync("git status", { cwd: ROOT_DIR, stdio: "ignore" });
    } catch {
      log("⚠ Not in a git repository, skipping git backup", "warning");
      return;
    }

    // Create backup branch
    log(`Creating backup branch: ${backupBranch}`, "info");
    execSync(`git checkout -b ${backupBranch}`, {
      cwd: ROOT_DIR,
      stdio: "ignore",
    });
    execSync("git add -A", { cwd: ROOT_DIR, stdio: "ignore" });
    execSync('git commit -m "backup: pre-restructure snapshot" --allow-empty', {
      cwd: ROOT_DIR,
      stdio: "ignore",
    });

    // Return to main branch
    execSync("git checkout -", { cwd: ROOT_DIR, stdio: "ignore" });

    log("✓ Backup branch created successfully", "success");
    log(`  To restore: git checkout ${backupBranch}`, "info");
  } catch (error) {
    log(`✗ Backup failed: ${error}`, "error");
    log("⚠ Continuing without backup...", "warning");
  }
}

// ============================================================================
// CREATE DIRECTORY STRUCTURE
// ============================================================================

async function createDirectories() {
  log("\n📁 Phase 2: Creating Directory Structure", "info");
  log("─".repeat(60), "info");

  for (const dir of NEW_DIRECTORIES) {
    const dirPath = path.join(ROOT_DIR, dir);

    if (fileExists(dirPath)) {
      if (VERBOSE) log(`  ⊘ Already exists: ${dir}`, "warning");
      continue;
    }

    if (DRY_RUN) {
      log(`  [DRY] Would create: ${dir}`, "info");
      continue;
    }

    await fs.ensureDir(dirPath);
    log(`  ✓ Created: ${dir}`, "success");
  }
}

// ============================================================================
// MOVE FILES
// ============================================================================

async function moveFiles() {
  log("\n🚚 Phase 3: Moving Files", "info");
  log("─".repeat(60), "info");

  // Root file moves
  for (const move of MOVES) {
    log(`\n${move.description}:`, "info");
    const patterns = Array.isArray(move.from) ? move.from : [move.from];

    for (const pattern of patterns) {
      const files = expandGlob(pattern);
      if (files.length === 0 && VERBOSE) {
        log(`  ⊘ No files match: ${pattern}`, "warning");
      }
      for (const file of files) {
        await moveFile(file, move.to);
      }
    }
  }

  // Script moves
  log("\n\n📜 Reorganizing Scripts:", "info");
  for (const move of SCRIPT_MOVES) {
    log(`\n${move.description}:`, "info");
    const patterns = Array.isArray(move.from) ? move.from : [move.from];

    for (const pattern of patterns) {
      const files = expandGlob(pattern);
      for (const file of files) {
        await moveFile(file, move.to);
      }
    }
  }
}

// ============================================================================
// DELETE FILES
// ============================================================================

async function deleteFiles() {
  log("\n🗑️  Phase 4: Deleting Obsolete Files", "info");
  log("─".repeat(60), "info");

  // Root file deletes
  for (const deleteOp of DELETES) {
    log(`\n${deleteOp.description}:`, "info");

    for (const pattern of deleteOp.patterns) {
      const files = expandGlob(pattern);
      if (files.length === 0 && VERBOSE) {
        log(`  ⊘ No files match: ${pattern}`, "warning");
      }
      for (const file of files) {
        await deleteFile(file);
      }
    }
  }

  // Script deletes
  log("\n\n📜 Cleaning Up Scripts:", "info");
  for (const deleteOp of SCRIPT_DELETES) {
    log(`\n${deleteOp.description}:`, "info");

    for (const pattern of deleteOp.patterns) {
      const files = expandGlob(pattern);
      for (const file of files) {
        await deleteFile(file);
      }
    }
  }
}

// ============================================================================
// CREATE INDEX FILES
// ============================================================================

async function createIndexFiles() {
  log("\n📝 Phase 5: Creating Index Files", "info");
  log("─".repeat(60), "info");

  const indexes = [
    {
      path: "docs/README.md",
      content: `# Farmers Market Platform Documentation

Welcome to the comprehensive documentation for the Farmers Market Platform.

## 📚 Documentation Structure

### [01. Getting Started](./01-getting-started/)
New to the project? Start here for setup and onboarding.

### [02. Architecture](./02-architecture/)
System design, database schema, and architectural decisions.

### [03. Development](./03-development/)
Developer guides, coding standards, and best practices.

### [04. Features](./04-features/)
Detailed documentation of platform features.

### [05. Deployment](./05-deployment/)
Deployment guides for various environments.

### [06. Operations](./06-operations/)
Operational guides, monitoring, and troubleshooting.

### [07. API](./07-api/)
API documentation and integration guides.

### [08. Maintenance](./08-maintenance/)
Maintenance tasks and update procedures.

### [99. Archive](./99-archive/)
Historical documents and deprecated content.

## 🚀 Quick Links

- [Quick Start Guide](./01-getting-started/quick-start.md)
- [Local Setup](./01-getting-started/local-setup.md)
- [API Reference](./07-api/rest-api.md)
- [Scripts Reference](./06-operations/scripts-reference.md)

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.
`,
    },
    {
      path: "scripts/README.md",
      content: `# Scripts Reference

Organized collection of automation scripts for the Farmers Market Platform.

## 📁 Directory Structure

### \`database/\`
Database management scripts - setup, migrations, backups, diagnostics.

### \`testing/\`
Testing utilities - test data creation, test user management.

### \`deployment/\`
Deployment automation - Vercel, Docker, verification.

### \`monitoring/\`
Monitoring and health checks - production monitoring, Sentry, Redis.

### \`maintenance/\`
Maintenance tasks - cache management, cleanup, optimization.

### \`inspection/\`
Quality assurance - website inspection, bot checks, accessibility.

### \`migration/\`
Data migrations - schema changes, data transformations.

### \`development/\`
Development helpers - dev server management, cache warming.

### \`utils/\`
Shared utilities - reusable functions and helpers.

## 🚀 Common Commands

See package.json for all available npm scripts.

### Database
\`\`\`bash
npm run db:setup      # Initial database setup
npm run db:seed       # Seed test data
npm run db:migrate    # Run migrations
\`\`\`

### Testing
\`\`\`bash
npm run test:users:create    # Create test users
npm run seed:test            # Seed test data
\`\`\`

### Monitoring
\`\`\`bash
npm run bot:production       # Run production health check
npm run sentry:check         # Check Sentry integration
\`\`\`

## 📝 Adding New Scripts

1. Place script in appropriate category folder
2. Update this README
3. Add npm script to package.json if needed
4. Document usage and parameters
`,
    },
  ];

  for (const index of indexes) {
    const indexPath = path.join(ROOT_DIR, index.path);

    if (DRY_RUN) {
      log(`[DRY] Would create: ${index.path}`, "info");
      continue;
    }

    await fs.ensureDir(path.dirname(indexPath));
    await fs.writeFile(indexPath, index.content);
    log(`✓ Created: ${index.path}`, "success");
  }
}

// ============================================================================
// SUMMARY
// ============================================================================

async function printSummary() {
  log("\n" + "═".repeat(60), "success");
  log("✅ RESTRUCTURING COMPLETE", "success");
  log("═".repeat(60), "success");

  if (DRY_RUN) {
    log("\n⚠️  This was a DRY RUN - no files were actually changed", "warning");
    log("Run without --dry-run to apply changes", "info");
  } else {
    log("\n📊 Summary:", "info");
    log("  • Root directory cleaned", "success");
    log("  • Documentation organized into categories", "success");
    log("  • Scripts reorganized by function", "success");
    log("  • Archive created for historical content", "success");
    log("  • Index files created", "success");

    log("\n📋 Next Steps:", "info");
    log("  1. Review changes: git status", "info");
    log("  2. Update package.json script paths if needed", "info");
    log("  3. Test that all scripts still work", "info");
    log("  4. Update documentation links", "info");
    log("  5. Commit changes: git add -A && git commit", "info");
  }

  log("\n📖 See REPOSITORY_RESTRUCTURING_PLAN.md for details\n", "info");
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.clear();
  log("🏗️  REPOSITORY RESTRUCTURING SCRIPT", "info");
  log("═".repeat(60), "info");
  log("Root directory: " + ROOT_DIR, "info");
  log(
    "Mode: " + (DRY_RUN ? "DRY RUN" : "LIVE"),
    DRY_RUN ? "warning" : "success",
  );
  log("Verbose: " + (VERBOSE ? "Yes" : "No"), "info");

  if (!DRY_RUN) {
    log("\n⚠️  WARNING: This will modify your repository!", "warning");
    log("Press Ctrl+C to cancel, or wait 5 seconds to continue...", "warning");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  try {
    await createBackup();
    await createDirectories();
    await moveFiles();
    await deleteFiles();
    await createIndexFiles();
    await printSummary();

    process.exit(0);
  } catch (error) {
    log("\n✗ ERROR: Restructuring failed", "error");
    log(String(error), "error");
    log("\n💡 Restore from backup if needed:", "warning");
    log("   git checkout backup/pre-restructure-YYYYMMDD", "info");
    process.exit(1);
  }
}

// Run if called directly
main();

export { main };
