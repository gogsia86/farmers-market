#!/usr/bin/env tsx

/**
 * 🔍 QUICK STATUS CHECK
 * Simple platform health and feature validation
 * No external dependencies - just checks the codebase
 */

import * as fs from "fs";
import * as path from "path";

// ============================================================================
// ANSI COLORS
// ============================================================================

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

const icon = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
  check: "🔍",
  rocket: "🚀",
  file: "📄",
  folder: "📁",
  code: "💻",
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function printHeader(title: string) {
  console.log("\n" + "=".repeat(80));
  console.log(
    `${colors.bright}${colors.cyan}${icon.rocket} ${title}${colors.reset}`
  );
  console.log("=".repeat(80) + "\n");
}

function printSection(title: string) {
  console.log(
    `\n${colors.bright}${colors.blue}${icon.check} ${title}${colors.reset}\n`
  );
}

function printSuccess(message: string) {
  console.log(`  ${icon.success} ${colors.green}${message}${colors.reset}`);
}

function printError(message: string) {
  console.log(`  ${icon.error} ${colors.red}${message}${colors.reset}`);
}

function printWarning(message: string) {
  console.log(`  ${icon.warning} ${colors.yellow}${message}${colors.reset}`);
}

function printInfo(message: string) {
  console.log(`  ${icon.info} ${colors.cyan}${message}${colors.reset}`);
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function dirExists(dirPath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), dirPath));
}

function countFiles(dirPath: string, extension: string): number {
  const fullPath = path.join(process.cwd(), dirPath);
  if (!fs.existsSync(fullPath)) return 0;

  let count = 0;
  function walk(dir: string) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walk(filePath);
      } else if (file.endsWith(extension)) {
        count++;
      }
    });
  }
  walk(fullPath);
  return count;
}

function fileContains(filePath: string, searchString: string): boolean {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) return false;
  const content = fs.readFileSync(fullPath, "utf8");
  return content.includes(searchString);
}

function checkRoute(routePath: string): boolean {
  return fileExists(routePath);
}

// ============================================================================
// CHECK FUNCTIONS
// ============================================================================

function checkProjectStructure() {
  printSection("Project Structure");

  const requiredDirs = [
    "src",
    "src/app",
    "src/components",
    "src/lib",
    "prisma",
    "public",
  ];

  let allPresent = true;
  requiredDirs.forEach((dir) => {
    if (dirExists(dir)) {
      printSuccess(`${dir}/ exists`);
    } else {
      printError(`${dir}/ is missing`);
      allPresent = false;
    }
  });

  return allPresent;
}

function checkConfiguration() {
  printSection("Configuration Files");

  const requiredFiles = [
    "package.json",
    "tsconfig.json",
    "next.config.mjs",
    "tailwind.config.ts",
    "prisma/schema.prisma",
    ".env.example",
  ];

  let allPresent = true;
  requiredFiles.forEach((file) => {
    if (fileExists(file)) {
      printSuccess(`${file} exists`);
    } else {
      printError(`${file} is missing`);
      allPresent = false;
    }
  });

  return allPresent;
}

function checkCoreFeatures() {
  printSection("Core Feature Routes");

  const routes = [
    // Authentication
    { path: "src/app/login/page.tsx", name: "Login Page" },
    { path: "src/app/register/page.tsx", name: "Registration Page" },

    // Customer Routes
    { path: "src/app/(customer)/products/page.tsx", name: "Products Page" },
    { path: "src/app/(customer)/orders/page.tsx", name: "Orders Page" },
    {
      path: "src/app/(customer)/marketplace/page.tsx",
      name: "Marketplace Page",
    },

    // Farmer Routes
    {
      path: "src/app/(farmer)/farmer/dashboard/page.tsx",
      name: "Farmer Dashboard",
    },
    {
      path: "src/app/(farmer)/farmer/products/page.tsx",
      name: "Farmer Products",
    },

    // Admin Routes
    {
      path: "src/app/(admin)/admin/dashboard/page.tsx",
      name: "Admin Dashboard",
    },
    { path: "src/app/(admin)/admin/farms/page.tsx", name: "Admin Farms" },
  ];

  let allPresent = true;
  routes.forEach(({ path, name }) => {
    if (checkRoute(path)) {
      printSuccess(`${name}`);
    } else {
      printWarning(`${name} - route not found`);
      allPresent = false;
    }
  });

  return allPresent;
}

function checkAPIRoutes() {
  printSection("API Routes");

  const apiRoutes = [
    { path: "src/app/api/auth/[...nextauth]/route.ts", name: "NextAuth API" },
    { path: "src/app/api/farms/route.ts", name: "Farms API" },
    { path: "src/app/api/products/route.ts", name: "Products API" },
    { path: "src/app/api/orders/route.ts", name: "Orders API" },
  ];

  let allPresent = true;
  apiRoutes.forEach(({ path, name }) => {
    if (checkRoute(path)) {
      printSuccess(`${name}`);
    } else {
      printWarning(`${name} - not found`);
      allPresent = false;
    }
  });

  return allPresent;
}

function checkComponents() {
  printSection("Component Library");

  const uiComponents = countFiles("src/components/ui", ".tsx");
  const featureComponents = countFiles("src/components/features", ".tsx");

  printInfo(`UI Components: ${uiComponents}`);
  printInfo(`Feature Components: ${featureComponents}`);

  if (uiComponents > 0 && featureComponents > 0) {
    printSuccess("Component library is healthy");
    return true;
  } else {
    printWarning("Component library may be incomplete");
    return false;
  }
}

function checkDatabase() {
  printSection("Database Setup");

  const schemaPath = "prisma/schema.prisma";
  if (!fileExists(schemaPath)) {
    printError("Prisma schema not found");
    return false;
  }

  // Check for key models
  const models = [
    "User",
    "Farm",
    "Product",
    "Order",
    "Category",
    "Review",
    "Payment",
  ];

  let allPresent = true;
  models.forEach((model) => {
    if (fileContains(schemaPath, `model ${model}`)) {
      printSuccess(`${model} model defined`);
    } else {
      printError(`${model} model missing`);
      allPresent = false;
    }
  });

  return allPresent;
}

function checkAuthentication() {
  printSection("Authentication System");

  const checks = [
    {
      file: "src/lib/auth/index.ts",
      name: "Auth configuration",
      search: "NextAuth",
    },
    {
      file: "src/app/api/auth/[...nextauth]/route.ts",
      name: "Auth API route",
      search: "NextAuth",
    },
    {
      file: "src/middleware.ts",
      name: "Auth middleware",
      search: "middleware",
    },
  ];

  let allPresent = true;
  checks.forEach(({ file, name, search }) => {
    if (fileExists(file) && fileContains(file, search)) {
      printSuccess(`${name}`);
    } else {
      printWarning(`${name} - not fully configured`);
      allPresent = false;
    }
  });

  return allPresent;
}

function checkServices() {
  printSection("Service Layer");

  const services = [
    "src/lib/services/farm.service.ts",
    "src/lib/services/product.service.ts",
    "src/lib/services/order.service.ts",
    "src/lib/services/user.service.ts",
  ];

  let count = 0;
  services.forEach((service) => {
    if (fileExists(service)) {
      count++;
    }
  });

  printInfo(`Services found: ${count}/${services.length}`);

  if (count >= services.length / 2) {
    printSuccess("Service layer is present");
    return true;
  } else {
    printWarning("Service layer may be incomplete");
    return false;
  }
}

function checkDependencies() {
  printSection("Key Dependencies");

  const packageJsonPath = path.join(process.cwd(), "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    printError("package.json not found");
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const required = [
    { name: "next", purpose: "Next.js Framework" },
    { name: "react", purpose: "React Library" },
    { name: "@prisma/client", purpose: "Database ORM" },
    { name: "next-auth", purpose: "Authentication" },
    { name: "zod", purpose: "Validation" },
    { name: "tailwindcss", purpose: "Styling" },
    { name: "typescript", purpose: "Type Safety" },
  ];

  let allPresent = true;
  required.forEach(({ name, purpose }) => {
    if (deps[name]) {
      printSuccess(`${name} (${purpose}) - v${deps[name]}`);
    } else {
      printError(`${name} (${purpose}) - missing`);
      allPresent = false;
    }
  });

  return allPresent;
}

function checkTypeScript() {
  printSection("TypeScript Configuration");

  const checks = [
    { file: "tsconfig.json", check: "strict", name: "Strict mode enabled" },
    {
      file: "tsconfig.json",
      check: '"@/*"',
      name: "Path aliases configured",
    },
  ];

  let allPresent = true;
  checks.forEach(({ file, check, name }) => {
    if (fileExists(file) && fileContains(file, check)) {
      printSuccess(name);
    } else {
      printWarning(`${name} - not configured`);
      allPresent = false;
    }
  });

  return allPresent;
}

function generateSummary(results: Record<string, boolean>) {
  printSection("Summary");

  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(Boolean).length;
  const percentage = Math.round((passed / total) * 100);

  console.log(`\n  Total Checks: ${total}`);
  console.log(`  ${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${total - passed}${colors.reset}`);
  console.log(`  ${colors.cyan}Score: ${percentage}%${colors.reset}\n`);

  if (percentage >= 90) {
    printSuccess("Platform is in excellent condition! 🎉");
  } else if (percentage >= 70) {
    printWarning("Platform is mostly ready, but some issues need attention");
  } else {
    printError("Platform has significant issues that need to be addressed");
  }

  console.log();
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  printHeader("FARMERS MARKET PLATFORM - STATUS CHECK");

  const results: Record<string, boolean> = {};

  // Run all checks
  results["Project Structure"] = checkProjectStructure();
  results["Configuration"] = checkConfiguration();
  results["Core Features"] = checkCoreFeatures();
  results["API Routes"] = checkAPIRoutes();
  results["Components"] = checkComponents();
  results["Database"] = checkDatabase();
  results["Authentication"] = checkAuthentication();
  results["Services"] = checkServices();
  results["Dependencies"] = checkDependencies();
  results["TypeScript"] = checkTypeScript();

  // Generate summary
  generateSummary(results);

  // Exit with appropriate code
  const allPassed = Object.values(results).every(Boolean);
  process.exit(allPassed ? 0 : 1);
}

// Run the script
main().catch((error) => {
  console.error(`${icon.error} Fatal error:`, error);
  process.exit(1);
});
