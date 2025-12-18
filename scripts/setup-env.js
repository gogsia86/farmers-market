#!/usr/bin/env node

/**
 * 🌱 FARMERS MARKET PLATFORM - ENV SETUP SCRIPT
 *
 * This script creates or updates the .env file with the correct DATABASE_URL
 * and other necessary environment variables for local development.
 *
 * Usage:
 *   node scripts/setup-env.js
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

function colorLog(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Get project root
const projectRoot = path.resolve(__dirname, "..");
const envFile = path.join(projectRoot, ".env");
const envExampleFile = path.join(projectRoot, ".env.example");

// Database configuration (Docker defaults)
const defaultConfig = {
  host: "localhost",
  port: "5432",
  database: "farmers_market",
  user: "farmers_user",
  password: "changeme123",
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function constructDatabaseUrl(config) {
  return `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
}

async function main() {
  console.log("");
  colorLog(
    "╔═══════════════════════════════════════════════════════════════════╗",
    "cyan",
  );
  colorLog(
    "║         🌱 FARMERS MARKET PLATFORM - ENV SETUP SCRIPT            ║",
    "cyan",
  );
  colorLog(
    "╚═══════════════════════════════════════════════════════════════════╝",
    "cyan",
  );
  console.log("");

  // Check if .env already exists
  const envExists = fs.existsSync(envFile);
  if (envExists) {
    colorLog("⚠️  .env file already exists!", "yellow");
    console.log("");
    const response = await question(
      "Do you want to update DATABASE_URL? (y/N): ",
    );

    if (response.toLowerCase() !== "y") {
      colorLog("✅ Exiting without changes.", "green");
      rl.close();
      return;
    }

    // Backup existing .env
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);
    const backupFile = `${envFile}.backup.${timestamp}`;
    fs.copyFileSync(envFile, backupFile);
    colorLog(`📦 Backed up existing .env to: ${backupFile}`, "cyan");
  }

  // Show default configuration
  const config = { ...defaultConfig };
  console.log("");
  colorLog("📝 Database Configuration:", "cyan");
  console.log(`   Host:     ${config.host}`);
  console.log(`   Port:     ${config.port}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   User:     ${config.user}`);
  console.log(`   Password: ${config.password}`);
  console.log("");

  // Ask if user wants to customize
  const customize = await question("Use these settings? (Y/n): ");
  if (customize.toLowerCase() === "n") {
    console.log("");
    colorLog("🔧 Custom Configuration:", "yellow");

    const customHost = await question(`Enter database host [${config.host}]: `);
    if (customHost.trim()) config.host = customHost.trim();

    const customPort = await question(`Enter database port [${config.port}]: `);
    if (customPort.trim()) config.port = customPort.trim();

    const customDb = await question(
      `Enter database name [${config.database}]: `,
    );
    if (customDb.trim()) config.database = customDb.trim();

    const customUser = await question(`Enter database user [${config.user}]: `);
    if (customUser.trim()) config.user = customUser.trim();

    const customPassword = await question(
      `Enter database password [${config.password}]: `,
    );
    if (customPassword.trim()) config.password = customPassword.trim();
  }

  // Construct final DATABASE_URL
  const databaseUrl = constructDatabaseUrl(config);

  console.log("");
  colorLog("📄 Final DATABASE_URL:", "cyan");
  console.log(`   ${databaseUrl}`);
  console.log("");

  // Read or create .env content
  let envContent = "";
  let databaseUrlExists = false;

  if (envExists) {
    envContent = fs.readFileSync(envFile, "utf8");
    databaseUrlExists = /^DATABASE_URL=/m.test(envContent);
  }

  if (databaseUrlExists) {
    // Replace existing DATABASE_URL
    envContent = envContent.replace(
      /^DATABASE_URL=.*/m,
      `DATABASE_URL="${databaseUrl}"`,
    );
    colorLog("🔄 Updated existing DATABASE_URL", "yellow");
  } else if (envExists) {
    // Add DATABASE_URL to existing file
    envContent += "\n# Database Configuration\n";
    envContent += `DATABASE_URL="${databaseUrl}"\n`;
    colorLog("➕ Added DATABASE_URL to .env", "green");
  } else {
    // Create new .env file
    envContent = `# ============================================================================
# FARMERS MARKET PLATFORM - ENVIRONMENT VARIABLES
# ============================================================================

# Database Configuration
DATABASE_URL="${databaseUrl}"

# Node Environment
NODE_ENV="development"

# NextAuth Configuration
NEXTAUTH_SECRET="change-this-to-a-random-secret-in-production-${Math.random().toString(36).substring(7)}"
NEXTAUTH_URL="http://localhost:3000"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# ============================================================================
# Add additional environment variables below
# ============================================================================

`;
    colorLog("✅ Created new .env file", "green");
  }

  // Ensure essential variables exist
  const essentialVars = {
    NODE_ENV: "development",
    NEXTAUTH_SECRET: `change-this-to-a-random-secret-in-production-${Math.random().toString(36).substring(7)}`,
    NEXTAUTH_URL: "http://localhost:3000",
    NEXT_PUBLIC_API_URL: "http://localhost:3000/api",
  };

  for (const [key, value] of Object.entries(essentialVars)) {
    const regex = new RegExp(`^${key}=`, "m");
    if (!regex.test(envContent)) {
      envContent += `${key}="${value}"\n`;
      colorLog(`➕ Added ${key}`, "green");
    }
  }

  // Write to .env file
  fs.writeFileSync(envFile, envContent, "utf8");

  console.log("");
  colorLog(
    "═══════════════════════════════════════════════════════════════════",
    "green",
  );
  colorLog("✅ Environment setup complete!", "green");
  colorLog(
    "═══════════════════════════════════════════════════════════════════",
    "green",
  );
  console.log("");

  // Show next steps
  colorLog("🚀 Next Steps:", "cyan");
  console.log("   1. Verify PostgreSQL is running:");
  console.log(
    "      docker-compose -f docker-compose.dev.yml up -d postgres-dev",
  );
  console.log("");
  console.log("   2. Apply database migrations:");
  console.log("      npx prisma migrate deploy");
  console.log("");
  console.log("   3. Generate Prisma client:");
  console.log("      npx prisma generate");
  console.log("");
  console.log("   4. Seed the database:");
  console.log("      npm run seed");
  console.log("");
  console.log("   5. Start the development server:");
  console.log("      npm run dev");
  console.log("");

  colorLog(`📝 Configuration saved to: ${envFile}`, "green");
  console.log("");

  rl.close();
}

// Run the script
main().catch((error) => {
  colorLog(`❌ Error: ${error.message}`, "red");
  console.error(error);
  process.exit(1);
});
