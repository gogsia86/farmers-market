#!/usr/bin/env node

/**
 * Sentry Error Monitoring Helper
 *
 * This script helps you check Sentry configuration and recent errors
 * Usage: node scripts/check-sentry.js
 *
 * Features:
 * - Verifies Sentry configuration
 * - Tests error capture
 * - Provides links to dashboards
 */

const fs = require("fs");
const path = require("path");

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

console.log(
  `\n${colors.bright}${colors.cyan}===========================================${colors.reset}`,
);
console.log(
  `${colors.bright}${colors.cyan}  Sentry Configuration Checker${colors.reset}`,
);
console.log(
  `${colors.bright}${colors.cyan}===========================================${colors.reset}\n`,
);

// Check for Sentry configuration files
const configFiles = [
  "sentry.client.config.ts",
  "sentry.server.config.ts",
  "sentry.edge.config.ts",
  "instrumentation.ts",
];

console.log(
  `${colors.bright}${colors.magenta}📋 Checking Configuration Files${colors.reset}\n`,
);

let allFilesExist = true;

configFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);

  if (exists) {
    console.log(`${colors.green}✓${colors.reset} Found: ${file}`);
  } else {
    console.log(`${colors.red}✗${colors.reset} Missing: ${file}`);
    allFilesExist = false;
  }
});

console.log();

// Check environment variables
console.log(
  `${colors.bright}${colors.magenta}🔐 Checking Environment Variables${colors.reset}\n`,
);

const requiredEnvVars = [
  "NEXT_PUBLIC_SENTRY_DSN",
  "SENTRY_AUTH_TOKEN",
  "SENTRY_ORG",
  "SENTRY_PROJECT",
];

let allEnvVarsSet = true;

requiredEnvVars.forEach((envVar) => {
  const value = process.env[envVar];

  if (value) {
    // Mask sensitive values
    const maskedValue =
      envVar.includes("TOKEN") || envVar.includes("DSN")
        ? `${value.substring(0, 10)}...`
        : value;
    console.log(`${colors.green}✓${colors.reset} ${envVar}: ${maskedValue}`);
  } else {
    console.log(`${colors.yellow}⚠${colors.reset} ${envVar}: Not set`);
    allEnvVarsSet = false;
  }
});

console.log();

// Check next.config file for Sentry plugin
console.log(
  `${colors.bright}${colors.magenta}⚙️  Checking Next.js Configuration${colors.reset}\n`,
);

try {
  const nextConfigPath = path.join(process.cwd(), "next.config.mjs");

  if (fs.existsSync(nextConfigPath)) {
    const nextConfig = fs.readFileSync(nextConfigPath, "utf8");

    if (
      nextConfig.includes("@sentry/nextjs") ||
      nextConfig.includes("withSentryConfig")
    ) {
      console.log(
        `${colors.green}✓${colors.reset} Sentry plugin configured in next.config.mjs`,
      );
    } else {
      console.log(
        `${colors.yellow}⚠${colors.reset} Sentry plugin not found in next.config.mjs`,
      );
    }

    if (nextConfig.includes("hideSourceMaps")) {
      console.log(
        `${colors.green}✓${colors.reset} Source maps are hidden in production`,
      );
    } else {
      console.log(
        `${colors.yellow}⚠${colors.reset} Source maps hiding not configured`,
      );
    }
  } else {
    console.log(`${colors.red}✗${colors.reset} next.config.mjs not found`);
  }
} catch (error) {
  console.log(
    `${colors.red}✗${colors.reset} Error reading next.config.mjs: ${error.message}`,
  );
}

console.log();

// Provide Sentry dashboard links
console.log(
  `${colors.bright}${colors.magenta}🔗 Sentry Dashboard Links${colors.reset}\n`,
);

const sentryOrg = process.env.SENTRY_ORG || "medicis-gang";
const sentryProject = process.env.SENTRY_PROJECT || "farmers-market-prod";

console.log(`Organization: ${colors.cyan}${sentryOrg}${colors.reset}`);
console.log(`Project: ${colors.cyan}${sentryProject}${colors.reset}\n`);

const dashboardLinks = [
  {
    name: "Issues Dashboard",
    url: `https://sentry.io/organizations/${sentryOrg}/issues/?project=${sentryProject}`,
  },
  {
    name: "Performance",
    url: `https://sentry.io/organizations/${sentryOrg}/performance/?project=${sentryProject}`,
  },
  {
    name: "Releases",
    url: `https://sentry.io/organizations/${sentryOrg}/releases/?project=${sentryProject}`,
  },
  {
    name: "Alerts",
    url: `https://sentry.io/organizations/${sentryOrg}/alerts/rules/?project=${sentryProject}`,
  },
  {
    name: "Project Settings",
    url: `https://sentry.io/settings/${sentryOrg}/projects/${sentryProject}/`,
  },
];

dashboardLinks.forEach((link) => {
  console.log(`${colors.blue}→${colors.reset} ${link.name}`);
  console.log(`  ${colors.cyan}${link.url}${colors.reset}\n`);
});

// Configuration tips
console.log(
  `${colors.bright}${colors.magenta}💡 Configuration Tips${colors.reset}\n`,
);

const tips = [
  "Set up alert rules for new error types",
  "Configure email/Slack notifications for critical errors",
  "Enable performance monitoring for API routes",
  "Set up release tracking for better error attribution",
  "Configure user feedback widget for client-side errors",
  "Filter out known/expected errors in beforeSend",
  "Set appropriate sample rates for production",
  "Enable session replay for critical user flows",
];

tips.forEach((tip, index) => {
  console.log(`${index + 1}. ${tip}`);
});

console.log();

// Testing section
console.log(
  `${colors.bright}${colors.magenta}🧪 Testing Sentry Integration${colors.reset}\n`,
);

console.log(`To test Sentry error capture, you can:`);
console.log();
console.log(`${colors.yellow}1. Test in Development:${colors.reset}`);
console.log(`   Add this to any page:`);
console.log(
  `   ${colors.cyan}throw new Error('Test Sentry Error');${colors.reset}\n`,
);

console.log(`${colors.yellow}2. Test API Error:${colors.reset}`);
console.log(`   In any API route:`);
console.log(
  `   ${colors.cyan}import * as Sentry from '@sentry/nextjs';${colors.reset}`,
);
console.log(
  `   ${colors.cyan}Sentry.captureException(new Error('API Test'));${colors.reset}\n`,
);

console.log(`${colors.yellow}3. Test Production:${colors.reset}`);
console.log(
  `   Visit: ${colors.cyan}https://your-app.vercel.app/api/test-sentry${colors.reset}`,
);
console.log(`   (Create this endpoint to throw a test error)\n`);

// Summary
console.log(
  `${colors.bright}${colors.cyan}===========================================${colors.reset}`,
);
console.log(`${colors.bright}${colors.cyan}  Summary${colors.reset}`);
console.log(
  `${colors.bright}${colors.cyan}===========================================${colors.reset}\n`,
);

if (allFilesExist && allEnvVarsSet) {
  console.log(
    `${colors.green}${colors.bright}✓ Sentry is properly configured!${colors.reset}\n`,
  );
} else {
  console.log(
    `${colors.yellow}${colors.bright}⚠ Sentry configuration incomplete${colors.reset}\n`,
  );

  if (!allFilesExist) {
    console.log(
      `${colors.yellow}→ Some configuration files are missing${colors.reset}`,
    );
  }
  if (!allEnvVarsSet) {
    console.log(
      `${colors.yellow}→ Some environment variables are not set${colors.reset}`,
    );
  }
  console.log();
}

// Common commands
console.log(
  `${colors.bright}${colors.magenta}📝 Common Sentry Commands${colors.reset}\n`,
);

const commands = [
  {
    cmd: "sentry-cli releases list",
    desc: "List all releases",
  },
  {
    cmd: "sentry-cli releases new <VERSION>",
    desc: "Create new release",
  },
  {
    cmd: "sentry-cli releases files <VERSION> upload-sourcemaps ./public",
    desc: "Upload source maps",
  },
  {
    cmd: "sentry-cli issues list",
    desc: "List recent issues",
  },
];

commands.forEach(({ cmd, desc }) => {
  console.log(`${colors.cyan}${cmd}${colors.reset}`);
  console.log(`  ${desc}\n`);
});

// Error monitoring checklist
console.log(
  `${colors.bright}${colors.magenta}✅ Error Monitoring Checklist${colors.reset}\n`,
);

const checklist = [
  "Configure appropriate error sampling rates",
  "Set up beforeSend to filter sensitive data",
  "Enable breadcrumbs for better context",
  "Configure release tracking",
  "Set up environment tags (dev/staging/prod)",
  "Configure user context capture",
  "Set up performance transaction tracking",
  "Configure alert rules and notifications",
  "Test error capture in all environments",
  "Document error handling procedures",
];

checklist.forEach((item, index) => {
  console.log(`[ ] ${item}`);
});

console.log();

// Resources
console.log(`${colors.bright}${colors.magenta}📚 Resources${colors.reset}\n`);

const resources = [
  {
    name: "Sentry Next.js Documentation",
    url: "https://docs.sentry.io/platforms/javascript/guides/nextjs/",
  },
  {
    name: "Error Tracking Best Practices",
    url: "https://docs.sentry.io/product/issues/",
  },
  {
    name: "Performance Monitoring",
    url: "https://docs.sentry.io/product/performance/",
  },
  {
    name: "Source Maps Guide",
    url: "https://docs.sentry.io/platforms/javascript/sourcemaps/",
  },
];

resources.forEach(({ name, url }) => {
  console.log(`${colors.blue}•${colors.reset} ${name}`);
  console.log(`  ${colors.cyan}${url}${colors.reset}\n`);
});

console.log(
  `${colors.bright}${colors.cyan}===========================================${colors.reset}\n`,
);
