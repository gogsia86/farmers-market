#!/usr/bin/env tsx
/**
 * 🌟 Divine Workflow Monitoring Bot CLI
 * Farmers Market Platform - Command Line Interface for Workflow Testing
 * Version: 1.0.0
 *
 * Usage:
 *   npm run monitor              - Run all workflows
 *   npm run monitor:critical     - Run critical workflows only
 *   npm run monitor:health       - Quick health check
 *   npm run monitor:start        - Start bot with scheduler
 *   npm run monitor:workflow <id> - Run specific workflow
 */

import { program } from "commander";
import chalk from "chalk";
import {
  createMonitoringBot,
  quickHealthCheck,
  runCriticalChecks,
  runComprehensiveMonitoring,
} from "../src/lib/monitoring/bot";
import type {
  DivineBotConfig,
  NotificationConfig,
} from "../src/lib/monitoring/types";

// ============================================================================
// CLI CONFIGURATION
// ============================================================================

program
  .name("workflow-monitor")
  .description(
    "Divine Workflow Monitoring Bot - Automated Testing & Monitoring",
  )
  .version("1.0.0");

// ============================================================================
// COMMAND: RUN ALL WORKFLOWS
// ============================================================================

program
  .command("all")
  .description("Run all enabled workflows")
  .option("-u, --url <url>", "Base URL to test", "http://localhost:3001")
  .option("-p, --parallel", "Run workflows in parallel", false)
  .option("-c, --concurrency <number>", "Max parallel workflows", "5")
  .option("-n, --notify", "Send notifications", false)
  .action(async (options) => {
    console.log(chalk.cyan.bold("\n🚀 Running All Workflows...\n"));

    try {
      const config: Partial<DivineBotConfig> = {
        baseUrl: options.url,
        performance: {
          parallel: options.parallel,
          maxConcurrency: parseInt(options.concurrency),
          timeout: 300000,
          screenshotOnFailure: true,
          traceOnFailure: true,
        },
      };

      if (options.notify) {
        config.notifications = getNotificationConfig();
      }

      const report = await runComprehensiveMonitoring(options.url);

      displayReport(report);

      // Exit with appropriate code
      process.exit(report.summary.failedWorkflows > 0 ? 1 : 0);
    } catch (error) {
      console.error(chalk.red.bold("\n❌ Error running workflows:"), error);
      process.exit(1);
    }
  });

// ============================================================================
// COMMAND: RUN CRITICAL WORKFLOWS
// ============================================================================

program
  .command("critical")
  .description("Run critical workflows only")
  .option("-u, --url <url>", "Base URL to test", "http://localhost:3001")
  .option("-n, --notify", "Send notifications", false)
  .action(async (options) => {
    console.log(chalk.cyan.bold("\n🚨 Running Critical Workflows...\n"));

    try {
      const report = await runCriticalChecks(options.url);

      displayReport(report);

      // Exit with appropriate code
      process.exit(report.summary.failedWorkflows > 0 ? 1 : 0);
    } catch (error) {
      console.error(
        chalk.red.bold("\n❌ Error running critical workflows:"),
        error,
      );
      process.exit(1);
    }
  });

// ============================================================================
// COMMAND: HEALTH CHECK
// ============================================================================

program
  .command("health")
  .description("Run quick health check")
  .option("-u, --url <url>", "Base URL to test", "http://localhost:3001")
  .action(async (options) => {
    console.log(chalk.cyan.bold("\n🏥 Running Health Check...\n"));

    try {
      const result = await quickHealthCheck(options.url);

      if (result.status === "PASSED") {
        console.log(chalk.green.bold("\n✅ Health Check PASSED"));
        console.log(
          chalk.gray(`   Duration: ${(result.duration / 1000).toFixed(2)}s`),
        );
        console.log(
          chalk.gray(`   Steps: ${result.passedSteps}/${result.totalSteps}\n`),
        );
        process.exit(0);
      } else {
        console.log(chalk.red.bold("\n❌ Health Check FAILED"));
        console.log(
          chalk.gray(`   Duration: ${(result.duration / 1000).toFixed(2)}s`),
        );
        console.log(chalk.gray(`   Error: ${result.error}\n`));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red.bold("\n❌ Health check error:"), error);
      process.exit(1);
    }
  });

// ============================================================================
// COMMAND: RUN SPECIFIC WORKFLOW
// ============================================================================

program
  .command("workflow <id>")
  .description("Run a specific workflow by ID")
  .option("-u, --url <url>", "Base URL to test", "http://localhost:3001")
  .action(async (id, options) => {
    console.log(chalk.cyan.bold(`\n🔄 Running Workflow: ${id}...\n`));

    try {
      const bot = createMonitoringBot({ baseUrl: options.url });
      const result = await bot.runWorkflow(id);

      displayWorkflowResult(result);

      process.exit(result.status === "PASSED" ? 0 : 1);
    } catch (error) {
      console.error(chalk.red.bold("\n❌ Error running workflow:"), error);
      process.exit(1);
    }
  });

// ============================================================================
// COMMAND: START BOT WITH SCHEDULER
// ============================================================================

program
  .command("start")
  .description("Start monitoring bot with scheduler")
  .option("-u, --url <url>", "Base URL to test", "http://localhost:3001")
  .option("-c, --config <path>", "Configuration file path")
  .option("-n, --notify", "Enable notifications", false)
  .action(async (options) => {
    console.log(chalk.cyan.bold("\n🤖 Starting Workflow Monitoring Bot...\n"));

    try {
      let config: Partial<DivineBotConfig> = {
        baseUrl: options.url,
        scheduler: {
          enabled: true,
          workflows: [],
          concurrency: 5,
          retryOnFailure: true,
          maxRetries: 3,
          retryDelay: 5000,
        },
      };

      // Load config file if provided
      if (options.config) {
        const fs = await import("fs/promises");
        const configContent = await fs.readFile(options.config, "utf-8");
        config = { ...config, ...JSON.parse(configContent) };
      }

      if (options.notify) {
        config.notifications = getNotificationConfig();
      }

      const bot = createMonitoringBot(config);

      // Start the bot
      await bot.start();

      // Keep the process running
      console.log(
        chalk.green.bold("✅ Bot is running. Press Ctrl+C to stop.\n"),
      );

      // Handle graceful shutdown
      process.on("SIGINT", async () => {
        console.log(chalk.yellow.bold("\n\n⏹️  Shutting down bot..."));
        await bot.stop();
        process.exit(0);
      });

      process.on("SIGTERM", async () => {
        console.log(chalk.yellow.bold("\n\n⏹️  Shutting down bot..."));
        await bot.stop();
        process.exit(0);
      });
    } catch (error) {
      console.error(chalk.red.bold("\n❌ Error starting bot:"), error);
      process.exit(1);
    }
  });

// ============================================================================
// COMMAND: LIST WORKFLOWS
// ============================================================================

program
  .command("list")
  .description("List all available workflows")
  .option("-e, --enabled-only", "Show only enabled workflows", false)
  .option("-c, --critical-only", "Show only critical workflows", false)
  .action(async (options) => {
    console.log(chalk.cyan.bold("\n📋 Available Workflows\n"));

    const { PREDEFINED_WORKFLOWS } = await import(
      "../src/lib/monitoring/workflows/predefined-workflows"
    );

    let workflows = PREDEFINED_WORKFLOWS;

    if (options.enabledOnly) {
      workflows = workflows.filter((w) => w.enabled);
    }

    if (options.criticalOnly) {
      workflows = workflows.filter((w) => w.priority === "CRITICAL");
    }

    workflows.forEach((workflow) => {
      const statusIcon = workflow.enabled
        ? chalk.green("✅")
        : chalk.gray("⏸️ ");
      const priorityColor =
        workflow.priority === "CRITICAL"
          ? chalk.red
          : workflow.priority === "HIGH"
            ? chalk.yellow
            : chalk.gray;

      console.log(`${statusIcon} ${chalk.bold(workflow.name)}`);
      console.log(`   ID: ${chalk.cyan(workflow.id)}`);
      console.log(`   Type: ${workflow.type}`);
      console.log(`   Priority: ${priorityColor(workflow.priority)}`);
      console.log(`   Timeout: ${workflow.timeout / 1000}s`);
      console.log(`   Retries: ${workflow.retries}`);
      if (workflow.schedule) {
        console.log(`   Schedule: Every ${workflow.schedule.interval} minutes`);
      }
      console.log(`   Tags: ${workflow.tags.join(", ")}`);
      console.log();
    });

    console.log(chalk.gray(`Total: ${workflows.length} workflow(s)\n`));
  });

// ============================================================================
// COMMAND: SHOW REPORTS
// ============================================================================

program
  .command("reports")
  .description("Show recent monitoring reports")
  .option("-l, --limit <number>", "Number of reports to show", "5")
  .option("-p, --path <path>", "Reports directory path", "./monitoring-reports")
  .action(async (options) => {
    console.log(chalk.cyan.bold("\n📊 Recent Monitoring Reports\n"));

    try {
      const { createReporter } = await import("../src/lib/monitoring/reporter");
      const reporter = createReporter(options.path);
      const reports = await reporter.getReportHistory(parseInt(options.limit));

      if (reports.length === 0) {
        console.log(chalk.gray("No reports found.\n"));
        return;
      }

      reports.forEach((report, index) => {
        const successColor =
          report.summary.successRate >= 90
            ? chalk.green
            : report.summary.successRate >= 70
              ? chalk.yellow
              : chalk.red;

        console.log(`${chalk.bold(`${index + 1}.`)} ${report.reportId}`);
        console.log(`   Timestamp: ${report.timestamp.toISOString()}`);
        console.log(`   Workflows: ${report.summary.totalWorkflows}`);
        console.log(
          `   Success Rate: ${successColor(`${report.summary.successRate.toFixed(1)  }%`)}`,
        );
        console.log(
          `   Passed: ${chalk.green(report.summary.passedWorkflows)}`,
        );
        console.log(`   Failed: ${chalk.red(report.summary.failedWorkflows)}`);
        console.log(
          `   Warnings: ${chalk.yellow(report.summary.warningWorkflows)}`,
        );
        console.log();
      });
    } catch (error) {
      console.error(chalk.red.bold("❌ Error loading reports:"), error);
    }
  });

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function displayReport(report: any): void {
  console.log(
    chalk.cyan.bold(
      "\n╔════════════════════════════════════════════════════════════╗",
    ),
  );
  console.log(
    chalk.cyan.bold(
      "║                    📊 MONITORING REPORT                    ║",
    ),
  );
  console.log(
    chalk.cyan.bold(
      "╠════════════════════════════════════════════════════════════╣",
    ),
  );
  console.log(chalk.white(`║ Report ID: ${report.reportId.padEnd(46)} ║`));
  console.log(
    chalk.white(`║ Timestamp: ${report.timestamp.toISOString().padEnd(46)} ║`),
  );
  console.log(
    chalk.cyan.bold(
      "╠════════════════════════════════════════════════════════════╣",
    ),
  );

  const successColor =
    report.summary.successRate >= 90
      ? chalk.green
      : report.summary.successRate >= 70
        ? chalk.yellow
        : chalk.red;

  console.log(
    chalk.white(
      `║ Total Workflows: ${String(report.summary.totalWorkflows).padEnd(42)} ║`,
    ),
  );
  console.log(
    `║ ${chalk.green("Passed:")} ${String(report.summary.passedWorkflows).padEnd(50)} ║`,
  );
  console.log(
    `║ ${chalk.red("Failed:")} ${String(report.summary.failedWorkflows).padEnd(50)} ║`,
  );
  console.log(
    `║ ${chalk.yellow("Warnings:")} ${String(report.summary.warningWorkflows).padEnd(48)} ║`,
  );
  console.log(
    `║ Success Rate: ${successColor(`${report.summary.successRate.toFixed(1)  }%`).padEnd(43)} ║`,
  );
  console.log(
    `║ Avg Duration: ${(report.summary.averageDuration / 1000).toFixed(2)}s${" ".repeat(43 - (report.summary.averageDuration / 1000).toFixed(2).length)} ║`,
  );

  if (report.summary.criticalIssues > 0) {
    console.log(
      chalk.cyan.bold(
        "╠════════════════════════════════════════════════════════════╣",
      ),
    );
    console.log(
      `║ ${chalk.red.bold("🚨 CRITICAL ISSUES:")} ${String(report.summary.criticalIssues).padEnd(37)} ║`,
    );
  }

  console.log(
    chalk.cyan.bold(
      "╚════════════════════════════════════════════════════════════╝\n",
    ),
  );

  // Display recommendations
  if (report.recommendations && report.recommendations.length > 0) {
    console.log(chalk.yellow.bold("📋 Recommendations:\n"));
    report.recommendations.forEach((rec: string) => {
      console.log(`   ${rec}`);
    });
    console.log();
  }

  // Display agricultural insights
  if (report.agricultureInsights) {
    console.log(chalk.green.bold("🌾 Agricultural Insights:\n"));

    if (report.agricultureInsights.seasonalOptimization?.length > 0) {
      console.log(chalk.green("  Seasonal Optimization:"));
      report.agricultureInsights.seasonalOptimization.forEach((opt: string) => {
        console.log(`    ${opt}`);
      });
      console.log();
    }

    if (report.agricultureInsights.biodynamicSuggestions?.length > 0) {
      console.log(chalk.green("  Biodynamic Suggestions:"));
      report.agricultureInsights.biodynamicSuggestions.forEach(
        (sug: string) => {
          console.log(`    ${sug}`);
        },
      );
      console.log();
    }
  }

  // Display failed workflows
  const failedWorkflows = report.workflows.filter(
    (w: any) => w.status === "FAILED",
  );
  if (failedWorkflows.length > 0) {
    console.log(chalk.red.bold("❌ Failed Workflows:\n"));
    failedWorkflows.forEach((workflow: any) => {
      console.log(
        `   ${chalk.red("●")} ${chalk.bold(workflow.name)} (${workflow.type})`,
      );
      console.log(`     Priority: ${workflow.priority}`);
      console.log(`     Error: ${workflow.error}`);
      console.log(`     Duration: ${(workflow.duration / 1000).toFixed(2)}s`);
      console.log();
    });
  }
}

function displayWorkflowResult(result: any): void {
  const statusIcon =
    result.status === "PASSED"
      ? chalk.green("✅")
      : result.status === "FAILED"
        ? chalk.red("❌")
        : chalk.yellow("⚠️");

  console.log(
    chalk.cyan.bold(
      "\n╔════════════════════════════════════════════════════════════╗",
    ),
  );
  console.log(
    chalk.cyan.bold(
      "║                   🔄 WORKFLOW RESULT                       ║",
    ),
  );
  console.log(
    chalk.cyan.bold(
      "╠════════════════════════════════════════════════════════════╣",
    ),
  );
  console.log(`║ ${statusIcon} Status: ${result.status.padEnd(48)} ║`);
  console.log(chalk.white(`║ Name: ${result.name.padEnd(51)} ║`));
  console.log(chalk.white(`║ Type: ${result.type.padEnd(51)} ║`));
  console.log(chalk.white(`║ Priority: ${result.priority.padEnd(47)} ║`));
  console.log(
    chalk.white(
      `║ Duration: ${(result.duration / 1000).toFixed(2)}s${" ".repeat(47 - (result.duration / 1000).toFixed(2).length)} ║`,
    ),
  );
  console.log(
    chalk.white(
      `║ Steps: ${result.passedSteps}/${result.totalSteps} passed${" ".repeat(44 - String(result.passedSteps).length - String(result.totalSteps).length)} ║`,
    ),
  );

  if (result.error) {
    console.log(
      chalk.cyan.bold(
        "╠════════════════════════════════════════════════════════════╣",
      ),
    );
    console.log(
      `║ ${chalk.red("Error:")} ${result.error.substring(0, 50).padEnd(50)} ║`,
    );
  }

  if (result.metrics?.performanceScore) {
    console.log(
      chalk.cyan.bold(
        "╠════════════════════════════════════════════════════════════╣",
      ),
    );
    console.log(
      `║ Performance Score: ${result.metrics.performanceScore}/100${" ".repeat(35 - String(result.metrics.performanceScore).length)} ║`,
    );
  }

  console.log(
    chalk.cyan.bold(
      "╚════════════════════════════════════════════════════════════╝\n",
    ),
  );
}

function getNotificationConfig(): NotificationConfig {
  // Check environment variables for notification configuration
  const channels: any[] = [];

  if (process.env.SLACK_WEBHOOK_URL) {
    channels.push("SLACK");
  }

  if (process.env.DISCORD_WEBHOOK_URL) {
    channels.push("DISCORD");
  }

  if (process.env.NOTIFICATION_EMAIL) {
    channels.push("EMAIL");
  }

  return {
    channels,
    slack: process.env.SLACK_WEBHOOK_URL
      ? {
          webhookUrl: process.env.SLACK_WEBHOOK_URL,
          channel: process.env.SLACK_CHANNEL,
          username: "Workflow Monitor Bot",
        }
      : undefined,
    discord: process.env.DISCORD_WEBHOOK_URL
      ? {
          webhookUrl: process.env.DISCORD_WEBHOOK_URL,
          username: "Workflow Monitor Bot",
          avatarUrl: process.env.DISCORD_AVATAR_URL,
        }
      : undefined,
    email: process.env.NOTIFICATION_EMAIL
      ? {
          to: [process.env.NOTIFICATION_EMAIL],
          from: process.env.EMAIL_FROM || "monitoring@farmersmarket.test",
          subject: "Workflow Monitoring Report",
        }
      : undefined,
  };
}

// ============================================================================
// PARSE & EXECUTE
// ============================================================================

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
