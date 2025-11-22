#!/usr/bin/env node

console.log("🔍 Quick Test Diagnostic - Starting...\n");

// Test 1: Check Node.js environment
console.log("✅ Test 1: Node.js Environment");
console.log(`   Node version: ${process.version}`);
console.log(`   Platform: ${process.platform}`);
console.log(
  `   Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB\n`
);

// Test 2: Check environment variables
console.log("✅ Test 2: Environment Variables");
const requiredVars = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];
requiredVars.forEach((varName) => {
  const exists = !!process.env[varName];
  console.log(
    `   ${exists ? "✅" : "❌"} ${varName}: ${exists ? "SET" : "MISSING"}`
  );
});
console.log("");

// Test 3: Check if we can load Prisma
console.log("✅ Test 3: Prisma Client Loading");
try {
  const { PrismaClient } = require("@prisma/client");
  console.log("   ✅ Prisma Client imported successfully");

  const prisma = new PrismaClient();
  console.log("   ✅ Prisma Client instantiated");

  // Try to connect with timeout
  Promise.race([
    prisma.$connect(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 5000)
    ),
  ])
    .then(() => {
      console.log("   ✅ Database connection successful\n");
      return prisma.$disconnect();
    })
    .catch((err) => {
      console.log(`   ❌ Database connection failed: ${err.message}\n`);
      process.exit(0);
    });
} catch (error) {
  console.log(`   ❌ Error loading Prisma: ${error.message}\n`);
  process.exit(1);
}

// Test 4: Check Vitest availability
setTimeout(() => {
  console.log("✅ Test 4: Vitest Configuration");
  try {
    const vitestConfig = require("./vitest.config.ts");
    console.log("   ✅ Vitest config loaded");
  } catch (error) {
    console.log(`   ⚠️  Vitest config issue: ${error.message}`);
  }
  console.log("\n🎯 Diagnostic complete!");
}, 6000);
