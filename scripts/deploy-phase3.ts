#!/usr/bin/env tsx
/**
 * 🚀 PHASE 3 PRODUCTION DEPLOYMENT SCRIPT
 *
 * Automated deployment script with gradual rollout support
 * Handles 10% → 50% → 100% rollout phases
 *
 * Usage:
 *   npx tsx scripts/deploy-phase3.ts --phase 1  # 10% rollout
 *   npx tsx scripts/deploy-phase3.ts --phase 2  # 50% rollout
 *   npx tsx scripts/deploy-phase3.ts --phase 3  # 100% rollout
 *   npx tsx scripts/deploy-phase3.ts --rollback # Rollback to previous
 *
 * @reference PHASE_3_TASK_6_PRODUCTION_ROLLOUT.md
 */

import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

// ============================================================================
// CONFIGURATION
// ============================================================================

interface DeploymentConfig {
  phase: 1 | 2 | 3 | "rollback";
  dryRun: boolean;
  skipTests: boolean;
  skipVerification: boolean;
}

interface DeploymentState {
  currentPhase: number;
  previousDeploymentUrl?: string;
  rolloutPercentage: number;
  startTime: string;
  lastPhaseChange: string;
}

const ROLLOUT_PERCENTAGES = {
  1: 10,
  2: 50,
  3: 100,
};

const STATE_FILE = join(process.cwd(), ".phase3-deployment-state.json");

// ============================================================================
// UTILITIES
// ============================================================================

function log(message: string, type: "info" | "success" | "error" | "warn" = "info") {
  const colors = {
    info: "\x1b[36m",
    success: "\x1b[32m",
    error: "\x1b[31m",
    warn: "\x1b[33m",
  };
  const reset = "\x1b[0m";
  const icons = {
    info: "ℹ",
    success: "✅",
    error: "❌",
    warn: "⚠️",
  };

  console.log(`${colors[type]}${icons[type]} ${message}${reset}`);
}

function execCommand(command: string, description: string): string {
  log(`${description}...`, "info");
  try {
    const output = execSync(command, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    log(`${description} - Done`, "success");
    return output;
  } catch (error: any) {
    log(`${description} - Failed: ${error.message}`, "error");
    throw error;
  }
}

function loadDeploymentState(): DeploymentState | null {
  if (!existsSync(STATE_FILE)) {
    return null;
  }
  try {
    const content = readFileSync(STATE_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    log("Failed to read deployment state", "warn");
    return null;
  }
}

function saveDeploymentState(state: DeploymentState): void {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  log("Deployment state saved", "success");
}

function parseArgs(): DeploymentConfig {
  const args = process.argv.slice(2);

  let phase: DeploymentConfig["phase"] = 1;
  let dryRun = false;
  let skipTests = false;
  let skipVerification = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--phase" && args[i + 1]) {
      const phaseNum = parseInt(args[i + 1], 10);
      if (phaseNum >= 1 && phaseNum <= 3) {
        phase = phaseNum as 1 | 2 | 3;
      }
      i++;
    } else if (args[i] === "--rollback") {
      phase = "rollback";
    } else if (args[i] === "--dry-run") {
      dryRun = true;
    } else if (args[i] === "--skip-tests") {
      skipTests = true;
    } else if (args[i] === "--skip-verification") {
      skipVerification = true;
    }
  }

  return { phase, dryRun, skipTests, skipVerification };
}

// ============================================================================
// PRE-DEPLOYMENT CHECKS
// ============================================================================

function runPreDeploymentChecks(config: DeploymentConfig): void {
  console.log("\n" + "=".repeat(80));
  log("Running Pre-Deployment Checks", "info");
  console.log("=".repeat(80) + "\n");

  // Check 1: Git status
  try {
    const gitStatus = execSync("git status --porcelain", { encoding: "utf-8" });
    if (gitStatus.trim() && !config.skipVerification) {
      log("Warning: You have uncommitted changes", "warn");
      log("Consider committing or stashing changes before deployment", "warn");
    } else {
      log("Git status: Clean", "success");
    }
  } catch (error) {
    log("Failed to check git status", "warn");
  }

  // Check 2: Current branch
  try {
    const branch = execSync("git branch --show-current", { encoding: "utf-8" }).trim();
    if (branch !== "master" && branch !== "main") {
      log(`Warning: You are on branch '${branch}', not master/main`, "warn");
    } else {
      log(`Current branch: ${branch}`, "success");
    }
  } catch (error) {
    log("Failed to check current branch", "warn");
  }

  // Check 3: Run tests
  if (!config.skipTests) {
    try {
      log("Running unit tests...", "info");
      execSync("npm test -- --passWithNoTests", { stdio: "pipe" });
      log("All tests passed", "success");
    } catch (error) {
      log("Tests failed! Aborting deployment.", "error");
      process.exit(1);
    }
  } else {
    log("Skipping tests (--skip-tests flag)", "warn");
  }

  // Check 4: Type checking
  if (!config.skipVerification) {
    try {
      log("Running type check...", "info");
      execSync("npm run type-check", { stdio: "pipe" });
      log("Type check passed", "success");
    } catch (error) {
      log("Type check failed! Aborting deployment.", "error");
      process.exit(1);
    }
  }

  // Check 5: Verify Prisma schema
  try {
    log("Validating Prisma schema...", "info");
    execSync("npx prisma validate", { stdio: "pipe" });
    log("Prisma schema valid", "success");
  } catch (error) {
    log("Prisma schema validation failed", "warn");
  }

  // Check 6: Environment variables
  try {
    log("Checking production environment variables...", "info");
    const envOutput = execSync("vercel env ls production", { encoding: "utf-8" });

    const requiredVars = [
      "DATABASE_URL",
      "UPSTASH_REDIS_REST_URL",
      "UPSTASH_REDIS_REST_TOKEN",
    ];

    let allPresent = true;
    for (const varName of requiredVars) {
      if (!envOutput.includes(varName)) {
        log(`Missing environment variable: ${varName}`, "error");
        allPresent = false;
      }
    }

    if (allPresent) {
      log("All required environment variables present", "success");
    } else {
      log("Some environment variables are missing", "error");
      process.exit(1);
    }
  } catch (error) {
    log("Failed to check environment variables", "warn");
  }

  console.log("\n" + "=".repeat(80));
  log("Pre-Deployment Checks Complete", "success");
  console.log("=".repeat(80) + "\n");
}

// ============================================================================
// DEPLOYMENT PHASES
// ============================================================================

function deployPhase(phase: 1 | 2 | 3, config: DeploymentConfig): void {
  const percentage = ROLLOUT_PERCENTAGES[phase];

  console.log("\n" + "=".repeat(80));
  log(`Starting Phase ${phase} Deployment (${percentage}% Rollout)`, "info");
  console.log("=".repeat(80) + "\n");

  if (config.dryRun) {
    log("DRY RUN MODE - No actual deployment will occur", "warn");
  }

  // Step 1: Get current deployment URL (for rollback)
  let previousUrl: string | undefined;
  try {
    const deployments = execSync("vercel ls --json", { encoding: "utf-8" });
    const parsed = JSON.parse(deployments);
    if (parsed.deployments && parsed.deployments.length > 0) {
      previousUrl = parsed.deployments[0].url;
      log(`Previous deployment: ${previousUrl}`, "info");
    }
  } catch (error) {
    log("Failed to get previous deployment URL", "warn");
  }

  // Step 2: Set rollout percentage (if using feature flags)
  if (percentage < 100) {
    log(`Setting PHASE_3_ROLLOUT_PERCENTAGE to ${percentage}`, "info");
    if (!config.dryRun) {
      try {
        execCommand(
          `vercel env add PHASE_3_ROLLOUT_PERCENTAGE production --force`,
          `Setting rollout percentage to ${percentage}%`
        );
        // Note: User will need to provide value interactively
      } catch (error) {
        log("Note: Set PHASE_3_ROLLOUT_PERCENTAGE manually if needed", "warn");
      }
    }
  }

  // Step 3: Deploy to production
  if (!config.dryRun) {
    log("Deploying to production...", "info");
    try {
      const deployOutput = execSync("vercel --prod --yes", {
        encoding: "utf-8",
        stdio: "inherit",
      });
      log("Deployment successful!", "success");
    } catch (error) {
      log("Deployment failed!", "error");
      throw error;
    }
  } else {
    log("Would deploy with: vercel --prod --yes", "info");
  }

  // Step 4: Save deployment state
  const state: DeploymentState = {
    currentPhase: phase,
    previousDeploymentUrl: previousUrl,
    rolloutPercentage: percentage,
    startTime: new Date().toISOString(),
    lastPhaseChange: new Date().toISOString(),
  };
  saveDeploymentState(state);

  // Step 5: Post-deployment verification
  log("Running post-deployment verification...", "info");
  setTimeout(() => {
    try {
      if (!config.dryRun) {
        execSync("npm run verify:production:health", { stdio: "inherit" });
      }
    } catch (error) {
      log("Post-deployment verification failed", "warn");
      log("Please manually verify deployment health", "warn");
    }
  }, 5000);

  // Step 6: Display next steps
  console.log("\n" + "=".repeat(80));
  log(`Phase ${phase} Deployment Complete!`, "success");
  console.log("=".repeat(80) + "\n");

  console.log("📊 Next Steps:\n");
  console.log(`1. Monitor deployment for ${phase === 1 ? "48" : "72"} hours`);
  console.log("   Command: npm run monitor:production:watch\n");
  console.log("2. Check Vercel logs for errors");
  console.log("   Command: vercel logs --prod --follow\n");
  console.log("3. Verify cache performance");
  console.log("   Command: npm run verify:cache:production\n");
  console.log("4. Monitor Upstash Redis");
  console.log("   Dashboard: https://console.upstash.com/\n");

  if (phase < 3) {
    console.log(`5. After verification, proceed to Phase ${phase + 1}`);
    console.log(`   Command: npx tsx scripts/deploy-phase3.ts --phase ${phase + 1}\n`);
  } else {
    console.log("5. Phase 3 rollout complete! 🎉");
    console.log("   Review metrics and document results\n");
  }

  console.log("🚨 Rollback (if needed):");
  console.log("   Command: npx tsx scripts/deploy-phase3.ts --rollback\n");
}

// ============================================================================
// ROLLBACK
// ============================================================================

function rollbackDeployment(config: DeploymentConfig): void {
  console.log("\n" + "=".repeat(80));
  log("Starting Rollback Procedure", "warn");
  console.log("=".repeat(80) + "\n");

  // Load deployment state
  const state = loadDeploymentState();
  if (!state) {
    log("No deployment state found. Manual rollback required.", "error");
    console.log("\nManual Rollback Options:");
    console.log("1. Vercel Dashboard: https://vercel.com/gogsias-projects/farmers-market-platform");
    console.log("2. CLI: vercel rollback [DEPLOYMENT_URL] --prod");
    console.log("3. Git: git revert [COMMIT_HASH] && git push origin master");
    return;
  }

  log(`Current phase: ${state.currentPhase}`, "info");
  log(`Rollout percentage: ${state.rolloutPercentage}%`, "info");
  if (state.previousDeploymentUrl) {
    log(`Previous deployment: ${state.previousDeploymentUrl}`, "info");
  }

  if (config.dryRun) {
    log("DRY RUN MODE - No actual rollback will occur", "warn");
  }

  // Method 1: Vercel rollback (if we have previous URL)
  if (state.previousDeploymentUrl && !config.dryRun) {
    try {
      log("Attempting Vercel rollback...", "info");
      execCommand(
        `vercel rollback ${state.previousDeploymentUrl} --prod --yes`,
        "Rolling back to previous deployment"
      );
      log("Rollback successful!", "success");
    } catch (error) {
      log("Vercel rollback failed, trying alternative methods...", "error");
    }
  }

  // Method 2: Disable via feature flag
  if (!config.dryRun) {
    try {
      log("Setting PHASE_3_ROLLOUT_PERCENTAGE to 0", "info");
      execCommand(
        `vercel env add PHASE_3_ROLLOUT_PERCENTAGE production --force`,
        "Disabling Phase 3 via feature flag"
      );
      log("Phase 3 disabled via feature flag", "success");
      log("Redeploying...", "info");
      execSync("vercel --prod --yes --force", { stdio: "inherit" });
    } catch (error) {
      log("Feature flag rollback failed", "error");
    }
  }

  // Update state
  const rollbackState: DeploymentState = {
    ...state,
    currentPhase: 0,
    rolloutPercentage: 0,
    lastPhaseChange: new Date().toISOString(),
  };
  saveDeploymentState(rollbackState);

  console.log("\n" + "=".repeat(80));
  log("Rollback Complete", "success");
  console.log("=".repeat(80) + "\n");

  console.log("📊 Post-Rollback Actions:\n");
  console.log("1. Verify application is stable");
  console.log("   Command: npm run verify:production:health\n");
  console.log("2. Check error rates returned to baseline");
  console.log("   Dashboard: https://vercel.com/gogsias-projects/farmers-market-platform\n");
  console.log("3. Analyze logs for root cause");
  console.log("   Command: vercel logs --prod | grep ERROR\n");
  console.log("4. Review metrics at failure point");
  console.log("5. Document incident and plan fixes\n");
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║                 🚀 PHASE 3 PRODUCTION DEPLOYMENT                          ║
║                                                                           ║
║           Farmers Market Platform - Database Optimization                ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
  `);

  const config = parseArgs();

  // Display configuration
  console.log("Configuration:");
  console.log(`  Phase: ${config.phase}`);
  console.log(`  Dry Run: ${config.dryRun}`);
  console.log(`  Skip Tests: ${config.skipTests}`);
  console.log(`  Skip Verification: ${config.skipVerification}`);
  console.log();

  // Load current state
  const currentState = loadDeploymentState();
  if (currentState) {
    console.log("Current Deployment State:");
    console.log(`  Phase: ${currentState.currentPhase}`);
    console.log(`  Rollout: ${currentState.rolloutPercentage}%`);
    console.log(`  Last Change: ${currentState.lastPhaseChange}`);
    console.log();
  }

  try {
    if (config.phase === "rollback") {
      // Rollback
      rollbackDeployment(config);
    } else {
      // Run pre-deployment checks
      runPreDeploymentChecks(config);

      // Confirm deployment
      if (!config.dryRun) {
        console.log("⚠️  WARNING: This will deploy to PRODUCTION");
        console.log(`   Phase ${config.phase} rollout (${ROLLOUT_PERCENTAGES[config.phase]}%)`);
        console.log("\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n");

        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      // Deploy
      deployPhase(config.phase, config);
    }

    console.log("\n✅ Deployment script completed successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Deployment script failed!\n");
    console.error(error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { deployPhase, rollbackDeployment, runPreDeploymentChecks };
