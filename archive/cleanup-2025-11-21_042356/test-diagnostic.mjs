#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🔍 Farmers Market Test Suite Diagnostic Report\n");
console.log("=".repeat(60));

// 1. Environment Check
console.log("\n📦 Environment:");
try {
  const nodeVersion = execSync("node --version", { encoding: "utf8" }).trim();
  console.log(`  ✓ Node.js: ${nodeVersion}`);
} catch (error) {
  console.log(`  ✗ Node.js: Error checking version`);
}

try {
  const npmVersion = execSync("npm --version", { encoding: "utf8" }).trim();
  console.log(`  ✓ npm: ${npmVersion}`);
} catch (error) {
  console.log(`  ✗ npm: Error checking version`);
}

// 2. Package.json Check
console.log("\n📋 Package Configuration:");
const packagePath = join(__dirname, "package.json");
if (existsSync(packagePath)) {
  const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
  console.log(`  ✓ Name: ${pkg.name}`);
  console.log(`  ✓ Test scripts:`);
  Object.entries(pkg.scripts || {})
    .filter(([key]) => key.startsWith("test"))
    .forEach(([key, value]) => {
      console.log(`    - ${key}: ${value}`);
    });

  console.log(`\n  📦 Test Dependencies:`);
  const testDeps = [
    "vitest",
    "@vitest/ui",
    "@vitest/coverage-v8",
    "@testing-library/react",
    "jsdom",
  ];
  testDeps.forEach((dep) => {
    const version = pkg.devDependencies?.[dep] || pkg.dependencies?.[dep];
    if (version) {
      console.log(`    ✓ ${dep}: ${version}`);
    } else {
      console.log(`    ✗ ${dep}: NOT INSTALLED`);
    }
  });
} else {
  console.log("  ✗ package.json not found");
}

// 3. Configuration Files
console.log("\n⚙️  Configuration Files:");
const configFiles = [
  "vitest.config.ts",
  "vitest.setup.ts",
  "playwright.config.ts",
  "tsconfig.json",
];

configFiles.forEach((file) => {
  const filePath = join(__dirname, file);
  if (existsSync(filePath)) {
    console.log(`  ✓ ${file} exists`);
  } else {
    console.log(`  ✗ ${file} MISSING`);
  }
});

// 4. Test Files Discovery
console.log("\n🧪 Test Files:");
try {
  const findCommand =
    process.platform === "win32"
      ? "dir /s /b *.test.ts *.test.tsx *.spec.ts *.spec.tsx 2>nul"
      : 'find . -type f \\( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" \\) | grep -v node_modules';

  const testFiles = execSync(findCommand, {
    encoding: "utf8",
    cwd: join(__dirname, "src"),
  })
    .split("\n")
    .filter(Boolean);

  console.log(`  Found ${testFiles.length} test files`);

  const categories = {
    unit: testFiles.filter(
      (f) => f.includes("__tests__") && !f.includes("integration"),
    ),
    integration: testFiles.filter((f) => f.includes("integration")),
    component: testFiles.filter((f) => f.includes("components")),
    e2e: testFiles.filter((f) => f.includes(".spec.")),
  };

  console.log(`    - Unit tests: ${categories.unit.length}`);
  console.log(`    - Integration tests: ${categories.integration.length}`);
  console.log(`    - Component tests: ${categories.component.length}`);
  console.log(`    - E2E tests: ${categories.e2e.length}`);
} catch (error) {
  console.log("  ✗ Error scanning for test files");
}

// 5. Try to run vitest
console.log("\n🚀 Attempting to Run Tests:");
try {
  console.log("  Running: npx vitest --version");
  const vitestVersion = execSync("npx vitest --version", {
    encoding: "utf8",
  }).trim();
  console.log(`  ✓ Vitest: ${vitestVersion}`);

  console.log("\n  Running: npx vitest list");
  const vitestList = execSync("npx vitest list", {
    encoding: "utf8",
    timeout: 10000,
  });
  console.log("  Test suites found:");
  vitestList
    .split("\n")
    .slice(0, 10)
    .forEach((line) => {
      if (line.trim()) console.log(`    ${line}`);
    });
} catch (error) {
  console.log(`  ✗ Error: ${error.message}`);
  console.log(`\n  Error details:`);
  if (error.stderr) {
    console.log(error.stderr.toString());
  }
}

// 6. Database Check
console.log("\n🗄️  Database Configuration:");
const prismaSchemaPath = join(__dirname, "prisma", "schema.prisma");
if (existsSync(prismaSchemaPath)) {
  console.log("  ✓ Prisma schema exists");
  try {
    const schema = readFileSync(prismaSchemaPath, "utf8");
    const dbUrl = schema.match(/url\s*=\s*env\("([^"]+)"\)/);
    if (dbUrl) {
      console.log(`  ✓ Database URL env: ${dbUrl[1]}`);
      console.log(`  ✓ Is set: ${process.env[dbUrl[1]] ? "Yes" : "No"}`);
    }
  } catch (error) {
    console.log("  ✗ Error reading schema");
  }
} else {
  console.log("  ✗ Prisma schema not found");
}

console.log("\n" + "=".repeat(60));
console.log("\n💡 Recommendations:");

// Generate recommendations based on findings
const recommendations = [];

if (!existsSync(join(__dirname, "vitest.setup.ts"))) {
  recommendations.push("Create vitest.setup.ts file for test setup");
}

if (!process.env.DATABASE_URL) {
  recommendations.push(
    "Set DATABASE_URL environment variable for database tests",
  );
}

recommendations.push('Run "npm test" to execute the test suite');
recommendations.push('Run "npm run test:coverage" to see test coverage');
recommendations.push('Run "npm run test:ui" for interactive test UI');

recommendations.forEach((rec, i) => {
  console.log(`  ${i + 1}. ${rec}`);
});

console.log("\n✨ Diagnostic complete!\n");
