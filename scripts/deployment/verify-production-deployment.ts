#!/usr/bin/env tsx

/**
 * 🔍 PRODUCTION DEPLOYMENT VERIFICATION SCRIPT
 *
 * Verifies that the Vercel production deployment is serving Croatian farm data
 * after database seeding.
 *
 * Usage:
 *   npx tsx scripts/verify-production-deployment.ts
 *   or
 *   npm run verify:production
 */

import https from "https";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, "green");
}

function logError(message: string) {
  log(`❌ ${message}`, "red");
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, "yellow");
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, "blue");
}

function logHeader(message: string) {
  log(`\n${colors.bold}${colors.cyan}${message}${colors.reset}\n`);
}

async function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error(`Failed to parse JSON: ${error}`));
          }
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

async function verifyProductionDeployment() {
  log("\n" + "=".repeat(80), "cyan");
  log("  🔍 PRODUCTION DEPLOYMENT VERIFICATION", "bold");
  log("  📍 Checking: https://farmers-market-platform.vercel.app", "cyan");
  log("=".repeat(80) + "\n", "cyan");

  let allChecksPass = true;
  const results: Record<string, boolean> = {};

  // Check 1: Health endpoint
  logHeader("Check 1: Health Endpoint");
  try {
    const health = await fetchJson(
      "https://farmers-market-platform.vercel.app/api/health",
    );
    const dbHealthy =
      health.checks?.database?.status === "healthy" ||
      health.status === "healthy";

    if (dbHealthy) {
      logSuccess("Health endpoint responding");
      logSuccess("Database status: healthy");
      results.health = true;
    } else {
      logError("Database not healthy");
      logInfo(`Status: ${JSON.stringify(health.checks?.database)}`);
      results.health = false;
      allChecksPass = false;
    }
  } catch (error) {
    logError("Failed to fetch health endpoint");
    logInfo(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    results.health = false;
    allChecksPass = false;
  }

  // Check 2: Farms API endpoint
  logHeader("Check 2: Farms API Endpoint");
  try {
    const farmsResponse = await fetchJson(
      "https://farmers-market-platform.vercel.app/api/farms",
    );

    if (!farmsResponse.success || !Array.isArray(farmsResponse.data)) {
      logError("Invalid API response structure");
      results.farmsApi = false;
      allChecksPass = false;
    } else {
      logSuccess(`API responding with ${farmsResponse.data.length} farms`);
      results.farmsApi = true;

      // Check 3: Croatian farms verification
      logHeader("Check 3: Croatian Farms Data");

      const croatianFarms = farmsResponse.data.filter(
        (farm: any) => farm.country === "HR",
      );
      const expectedFarmNames = [
        "OPG Duvnjak",
        "OPG Sladić",
        "OPG Vicko",
        "Kornatski Med",
        "OPG Babić",
        "Lavanda Dalmatia",
      ];

      if (croatianFarms.length === 0) {
        logError("No Croatian farms found!");
        logWarning(
          "Database may not be seeded or deployment not yet complete",
        );
        logInfo("Sample farm countries found:");
        farmsResponse.data.slice(0, 3).forEach((farm: any) => {
          logInfo(
            `  - ${farm.name} (${farm.country || "no country"}) - ${farm.city || "no city"}`,
          );
        });
        results.croatianData = false;
        allChecksPass = false;
      } else {
        logSuccess(`Found ${croatianFarms.length} Croatian farms`);

        // Check for expected farm names
        let foundExpectedFarms = 0;
        croatianFarms.forEach((farm: any) => {
          const isExpected = expectedFarmNames.some((expected) =>
            farm.name.includes(expected),
          );
          if (isExpected) {
            foundExpectedFarms++;
            logSuccess(`  ✓ ${farm.name} (${farm.city})`);
          }
        });

        if (foundExpectedFarms >= 3) {
          logSuccess(
            `Verified ${foundExpectedFarms} expected Croatian farms`,
          );
          results.croatianData = true;
        } else {
          logWarning("Found Croatian farms but not the expected ones");
          results.croatianData = false;
          allChecksPass = false;
        }
      }

      // Check 4: Croatian products
      logHeader("Check 4: Croatian Products");

      const sampleFarm = croatianFarms[0];
      if (sampleFarm?.products && Array.isArray(sampleFarm.products)) {
        const productCount = sampleFarm.products.length;
        logSuccess(`Sample farm has ${productCount} products`);

        const productSample = sampleFarm.products.slice(0, 3);
        logInfo("Sample products:");
        productSample.forEach((product: any) => {
          logInfo(`  - ${product.name} (${product.price} EUR/${product.unit})`);
        });
        results.products = true;
      } else if (sampleFarm) {
        logWarning("Croatian farms found but no products listed");
        results.products = false;
      } else {
        logInfo("Cannot verify products without Croatian farms");
        results.products = false;
      }

      // Check 5: Location data
      logHeader("Check 5: Geographic Data");

      if (croatianFarms.length > 0) {
        const citiesFound = new Set(
          croatianFarms.map((f: any) => f.city).filter(Boolean),
        );
        const expectedCities = [
          "Donje Polje",
          "Plastovo",
          "Tribunj",
          "Primošten",
          "Vodice",
          "Skradin",
        ];

        const matchingCities = Array.from(citiesFound).filter((city) =>
          expectedCities.some((expected) =>
            city.toLowerCase().includes(expected.toLowerCase()),
          ),
        );

        if (matchingCities.length > 0) {
          logSuccess(`Found Šibenik area cities: ${matchingCities.join(", ")}`);
          results.location = true;
        } else {
          logWarning("Croatian farms found but unexpected locations");
          logInfo(`Cities: ${Array.from(citiesFound).join(", ")}`);
          results.location = false;
        }
      } else {
        results.location = false;
      }
    }
  } catch (error) {
    logError("Failed to fetch farms API");
    logInfo(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    results.farmsApi = false;
    results.croatianData = false;
    results.products = false;
    results.location = false;
    allChecksPass = false;
  }

  // Summary
  log("\n" + "=".repeat(80), "cyan");
  log("  📊 VERIFICATION SUMMARY", "bold");
  log("=".repeat(80), "cyan");

  const checksCompleted = Object.keys(results).length;
  const checksPassed = Object.values(results).filter(Boolean).length;

  log(`\n✓ Checks Passed: ${checksPassed}/${checksCompleted}\n`);

  Object.entries(results).forEach(([check, passed]) => {
    const status = passed ? "✅ PASS" : "❌ FAIL";
    const checkName = check
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
    log(`  ${status} - ${checkName}`);
  });

  log("");

  if (allChecksPass && checksPassed === checksCompleted) {
    log("=".repeat(80), "green");
    log("  🎉 ALL CHECKS PASSED!", "bold");
    log("  Production deployment verified successfully!", "green");
    log("=".repeat(80) + "\n", "green");

    logSuccess("Croatian farm data is live on production!");
    logInfo("\n🇭🇷 Dobrodošli u Šibenik!");
    logInfo("Welcome to the authentic Croatian farmers market platform!\n");

    logInfo("Next steps:");
    log("  1. Visit: https://farmers-market-platform.vercel.app");
    log("  2. Test login with credentials from CROATIAN_DATABASE_SETUP.md");
    log("  3. Change default passwords (see PRODUCTION_SEEDING_COMPLETE.md)");
    log("  4. Remove test accounts before public launch\n");

    return 0;
  } else {
    log("=".repeat(80), "yellow");
    log("  ⚠️  VERIFICATION INCOMPLETE", "bold");
    log("=".repeat(80) + "\n", "yellow");

    if (!results.croatianData) {
      logWarning("Croatian farm data not yet visible on production");
      logInfo("\nPossible reasons:");
      log("  1. Vercel deployment still in progress (wait 2-3 minutes)");
      log("  2. Cache not yet cleared (try again in a moment)");
      log("  3. DATABASE_URL mismatch in Vercel env vars");
      log("  4. Deployment failed (check Vercel dashboard)");

      logInfo("\nRecommended actions:");
      log("  1. Check Vercel dashboard: https://vercel.com/dashboard");
      log("  2. Wait 2-3 minutes and run this script again");
      log("  3. Verify DATABASE_URL in Vercel settings");
      log(
        "  4. Manual redeploy if needed: Vercel Dashboard → Deployments → Redeploy\n",
      );
    }

    return 1;
  }
}

// Execute verification
verifyProductionDeployment()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    logError("\n❌ Verification script failed with error:");
    console.error(error);
    process.exit(1);
  });
