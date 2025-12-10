/**
 * 🌾 SIMPLE WEBSITE PAGE CHECKER
 * Checks all main pages of the Farmers Market Platform
 * Divine agricultural consciousness verification
 */

const http = require("http");

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";

// All main pages to check
const PAGES = [
  // Public pages
  { path: "/", name: "Home Page" },
  { path: "/login", name: "Login Page" },
  { path: "/signup", name: "Signup Page" },
  { path: "/marketplace", name: "Marketplace" },
  { path: "/marketplace/products", name: "Products Listing" },
  { path: "/marketplace/farms", name: "Farms Listing" },
  { path: "/farms", name: "Farms Page" },
  { path: "/products", name: "Products Page" },
  { path: "/about", name: "About Page" },
  { path: "/contact", name: "Contact Page" },
  { path: "/how-it-works", name: "How It Works" },
  { path: "/faq", name: "FAQ Page" },
  { path: "/help", name: "Help Page" },
  { path: "/support", name: "Support Page" },
  { path: "/blog", name: "Blog Page" },
  { path: "/careers", name: "Careers Page" },
  { path: "/resources", name: "Resources Page" },
  { path: "/privacy", name: "Privacy Policy" },
  { path: "/terms", name: "Terms of Service" },
  { path: "/cookies", name: "Cookie Policy" },

  // Customer pages
  { path: "/cart", name: "Shopping Cart" },
  { path: "/checkout", name: "Checkout Page" },
  { path: "/dashboard", name: "Customer Dashboard" },
  { path: "/dashboard/orders", name: "My Orders" },
  { path: "/dashboard/profile", name: "My Profile" },
  { path: "/dashboard/addresses", name: "My Addresses" },
  { path: "/dashboard/favorites", name: "My Favorites" },
  { path: "/dashboard/reviews", name: "My Reviews" },

  // Farmer pages
  { path: "/farmer/dashboard", name: "Farmer Dashboard" },
  { path: "/farmer/products", name: "Farmer Products" },
  { path: "/farmer/orders", name: "Farmer Orders" },
  { path: "/farmer/analytics", name: "Farmer Analytics" },
  { path: "/farmer/finances", name: "Farmer Finances" },
  { path: "/farmer/payouts", name: "Farmer Payouts" },
  { path: "/farmer/settings", name: "Farmer Settings" },
  { path: "/register-farm", name: "Register Farm" },

  // Other pages
  { path: "/search", name: "Search Page" },
  { path: "/markets", name: "Markets Page" },
  { path: "/categories", name: "Categories Page" },
  { path: "/orders", name: "Orders Page" },

  // API health checks
  { path: "/api/health", name: "API Health Check" },
  { path: "/api/ready", name: "API Ready Check" },
];

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  gray: "\x1b[90m",
};

// Results tracking
const results = {
  total: 0,
  success: 0,
  failed: 0,
  errors: [],
};

/**
 * Check a single page
 */
function checkPage(page) {
  return new Promise((resolve) => {
    const url = new URL(page.path, BASE_URL);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: "GET",
      timeout: 10000,
    };

    const startTime = Date.now();

    const req = http.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Consume response data to free up memory
      res.on("data", () => {});
      res.on("end", () => {
        results.total++;

        if (statusCode >= 200 && statusCode < 400) {
          results.success++;
          console.log(
            `${colors.green}✓${colors.reset} ${page.name.padEnd(35)} ${colors.gray}[${statusCode}]${colors.reset} ${colors.blue}${responseTime}ms${colors.reset}`,
          );
          resolve({ success: true, statusCode, responseTime });
        } else if (statusCode === 401 || statusCode === 403) {
          // Auth required pages are OK
          results.success++;
          console.log(
            `${colors.yellow}⚠${colors.reset} ${page.name.padEnd(35)} ${colors.gray}[${statusCode} - Auth Required]${colors.reset} ${colors.blue}${responseTime}ms${colors.reset}`,
          );
          resolve({ success: true, statusCode, responseTime });
        } else {
          results.failed++;
          results.errors.push({ page: page.name, statusCode, responseTime });
          console.log(
            `${colors.red}✗${colors.reset} ${page.name.padEnd(35)} ${colors.red}[${statusCode}]${colors.reset} ${colors.blue}${responseTime}ms${colors.reset}`,
          );
          resolve({ success: false, statusCode, responseTime });
        }
      });
    });

    req.on("error", (error) => {
      results.total++;
      results.failed++;
      results.errors.push({ page: page.name, error: error.message });
      console.log(
        `${colors.red}✗${colors.reset} ${page.name.padEnd(35)} ${colors.red}ERROR: ${error.message}${colors.reset}`,
      );
      resolve({ success: false, error: error.message });
    });

    req.on("timeout", () => {
      req.destroy();
      results.total++;
      results.failed++;
      results.errors.push({ page: page.name, error: "Timeout" });
      console.log(
        `${colors.red}✗${colors.reset} ${page.name.padEnd(35)} ${colors.red}TIMEOUT${colors.reset}`,
      );
      resolve({ success: false, error: "Timeout" });
    });

    req.end();
  });
}

/**
 * Run all checks
 */
async function runChecks() {
  console.log(`\n${"=".repeat(80)}`);
  console.log(
    `🌾 ${colors.blue}Farmers Market Platform - Page Checker${colors.reset}`,
  );
  console.log(
    `⚡ Checking all pages at: ${colors.green}${BASE_URL}${colors.reset}`,
  );
  console.log(`${"=".repeat(80)}\n`);

  // Check pages in batches of 5 to avoid overwhelming the server
  const batchSize = 5;
  for (let i = 0; i < PAGES.length; i += batchSize) {
    const batch = PAGES.slice(i, i + batchSize);
    await Promise.all(batch.map(checkPage));

    // Small delay between batches
    if (i + batchSize < PAGES.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Print summary
  console.log(`\n${"=".repeat(80)}`);
  console.log(`${colors.blue}📊 SUMMARY${colors.reset}`);
  console.log("=".repeat(80));
  console.log(`Total Pages Checked: ${results.total}`);
  console.log(`${colors.green}✓ Success:${colors.reset} ${results.success}`);
  console.log(`${colors.red}✗ Failed:${colors.reset} ${results.failed}`);

  const successRate = ((results.success / results.total) * 100).toFixed(1);
  console.log(`\n${colors.blue}Success Rate:${colors.reset} ${successRate}%`);

  if (results.errors.length > 0) {
    console.log(`\n${colors.red}Failed Pages:${colors.reset}`);
    results.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.page}`);
      if (error.statusCode) {
        console.log(`     Status: ${error.statusCode}`);
      }
      if (error.error) {
        console.log(`     Error: ${error.error}`);
      }
    });
  }

  console.log(`\n${"=".repeat(80)}`);

  if (results.failed === 0) {
    console.log(
      `\n${colors.green}🎉 ALL PAGES ARE WORKING! Divine agricultural consciousness maintained!${colors.reset}\n`,
    );
  } else {
    console.log(
      `\n${colors.yellow}⚠️  Some pages need attention${colors.reset}\n`,
    );
  }

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the checks
runChecks().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
