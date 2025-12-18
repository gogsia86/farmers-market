#!/usr/bin/env node

/**
 * 🌱 Set DATABASE_URL in .env file
 *
 * Simple script to set the DATABASE_URL without interactive prompts.
 * Uses Docker dev database defaults.
 */

const fs = require("fs");
const path = require("path");

// Colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuration
const projectRoot = path.resolve(__dirname, "..");
const envFile = path.join(projectRoot, ".env");

const databaseUrl =
  "postgresql://farmers_user:changeme123@localhost:5432/farmers_market";

try {
  console.log("");
  log("🔧 Setting DATABASE_URL in .env file...", "cyan");
  console.log("");

  let envContent = "";
  let updated = false;

  // Read existing .env or create new
  if (fs.existsSync(envFile)) {
    envContent = fs.readFileSync(envFile, "utf8");

    // Check if DATABASE_URL exists
    if (/^DATABASE_URL=/m.test(envContent)) {
      // Replace existing
      envContent = envContent.replace(
        /^DATABASE_URL=.*/m,
        `DATABASE_URL="${databaseUrl}"`,
      );
      log("✅ Updated existing DATABASE_URL", "yellow");
      updated = true;
    } else {
      // Append to existing
      envContent += `\n# Database Configuration\nDATABASE_URL="${databaseUrl}"\n`;
      log("✅ Added DATABASE_URL to existing .env", "green");
      updated = true;
    }
  } else {
    // Create new .env
    envContent = `# Database Configuration
DATABASE_URL="${databaseUrl}"

# Node Environment
NODE_ENV="development"

# NextAuth Configuration
NEXTAUTH_SECRET="change-this-to-a-random-secret-${Math.random().toString(36).substring(7)}"
NEXTAUTH_URL="http://localhost:3000"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
`;
    log("✅ Created new .env file", "green");
    updated = true;
  }

  // Write to file
  if (updated) {
    fs.writeFileSync(envFile, envContent, "utf8");
    console.log("");
    log("DATABASE_URL set to:", "cyan");
    console.log(`  ${databaseUrl}`);
    console.log("");
    log("✅ Configuration saved successfully!", "green");
    console.log("");
  }
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
