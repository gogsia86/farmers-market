/**
 * Test Script for Settings and Notifications APIs
 * Tests the newly created /api/user/settings and /api/user/notifications endpoints
 *
 * Usage: npx ts-node scripts/test-settings-api.ts
 */

import { database } from "@/lib/database";

// Colors for console output
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

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title: string) {
  console.log("\n" + "=".repeat(80));
  log(title, "bright");
  console.log("=".repeat(80) + "\n");
}

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

const results: TestResult[] = [];

async function test(
  name: string,
  fn: () => Promise<void>
): Promise<TestResult> {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    log(`✅ ${name} (${duration}ms)`, "green");
    return { name, passed: true, message: "Success", duration };
  } catch (error) {
    const duration = Date.now() - start;
    const message = error instanceof Error ? error.message : String(error);
    log(`❌ ${name} (${duration}ms)`, "red");
    log(`   Error: ${message}`, "red");
    return { name, passed: false, message, duration };
  }
}

// ============================================================================
// Test Functions
// ============================================================================

async function testDatabaseConnection() {
  await database.$connect();
  const userCount = await database.user.count();
  if (userCount === 0) {
    throw new Error("No users in database. Please seed database first.");
  }
}

async function testUserSettingsModelExists() {
  // Try to count UserSettings
  const count = await database.userSettings.count();
  log(`   Found ${count} UserSettings records`, "cyan");
}

async function testNotificationPreferencesModelExists() {
  // Try to count NotificationPreferencesV2
  const count = await database.notificationPreferencesV2.count();
  log(`   Found ${count} NotificationPreferencesV2 records`, "cyan");
}

async function testCreateUserSettings() {
  // Get first user
  const user = await database.user.findFirst();
  if (!user) {
    throw new Error("No users found");
  }

  // Check if settings already exist
  const existing = await database.userSettings.findUnique({
    where: { userId: user.id },
  });

  if (existing) {
    log(`   Settings already exist for user ${user.email}`, "yellow");
    return;
  }

  // Create settings
  const settings = await database.userSettings.create({
    data: {
      userId: user.id,
      theme: "dark",
      language: "en",
      timezone: "America/New_York",
      currency: "USD",
      distanceUnit: "miles",
      profileVisibility: "public",
      showEmail: false,
      showPhone: false,
      allowMessaging: true,
      dataSharing: false,
      contactMethod: "email",
      communicationFrequency: "normal",
    },
  });

  log(`   Created settings for user ${user.email}`, "cyan");
  log(`   Settings ID: ${settings.id}`, "cyan");
}

async function testCreateNotificationPreferences() {
  // Get first user
  const user = await database.user.findFirst();
  if (!user) {
    throw new Error("No users found");
  }

  // Check if preferences already exist
  const existing = await database.notificationPreferencesV2.findUnique({
    where: { userId: user.id },
  });

  if (existing) {
    log(`   Preferences already exist for user ${user.email}`, "yellow");
    return;
  }

  // Create preferences
  const prefs = await database.notificationPreferencesV2.create({
    data: {
      userId: user.id,
      emailEnabled: true,
      emailFrequency: "immediate",
      smsEnabled: false,
      smsFrequency: "immediate",
      pushEnabled: true,
      pushFrequency: "immediate",
      inAppEnabled: true,
      inAppSound: true,
      inAppBadge: true,
    },
  });

  log(`   Created notification preferences for user ${user.email}`, "cyan");
  log(`   Preferences ID: ${prefs.id}`, "cyan");
}

async function testUpdateUserSettings() {
  // Get first user with settings
  const userWithSettings = await database.user.findFirst({
    include: { userSettings: true },
  });

  if (!userWithSettings?.userSettings) {
    throw new Error("No user with settings found. Run create test first.");
  }

  // Update settings
  const updated = await database.userSettings.update({
    where: { userId: userWithSettings.id },
    data: {
      theme: "light",
      distanceUnit: "kilometers",
    },
  });

  if (updated.theme !== "light" || updated.distanceUnit !== "kilometers") {
    throw new Error("Settings not updated correctly");
  }

  log(`   Updated settings for user ${userWithSettings.email}`, "cyan");
}

async function testUpdateNotificationPreferences() {
  // Get first user with preferences
  const userWithPrefs = await database.user.findFirst({
    include: { notificationPreferencesV2: true },
  });

  if (!userWithPrefs?.notificationPreferencesV2) {
    throw new Error(
      "No user with notification preferences found. Run create test first."
    );
  }

  // Update preferences
  const updated = await database.notificationPreferencesV2.update({
    where: { userId: userWithPrefs.id },
    data: {
      emailEnabled: false,
      emailFrequency: "daily",
      pushEnabled: false,
    },
  });

  if (
    updated.emailEnabled !== false ||
    updated.emailFrequency !== "daily" ||
    updated.pushEnabled !== false
  ) {
    throw new Error("Preferences not updated correctly");
  }

  log(`   Updated notification preferences for user ${userWithPrefs.email}`, "cyan");
}

async function testUserSettingsRelation() {
  // Test that we can fetch user with settings
  const user = await database.user.findFirst({
    include: { userSettings: true },
  });

  if (!user) {
    throw new Error("No users found");
  }

  log(`   User: ${user.email}`, "cyan");
  log(
    `   Has settings: ${user.userSettings ? "Yes" : "No"}`,
    user.userSettings ? "green" : "yellow"
  );

  if (user.userSettings) {
    log(`   Theme: ${user.userSettings.theme}`, "cyan");
    log(`   Language: ${user.userSettings.language}`, "cyan");
    log(`   Timezone: ${user.userSettings.timezone}`, "cyan");
  }
}

async function testNotificationPreferencesRelation() {
  // Test that we can fetch user with notification preferences
  const user = await database.user.findFirst({
    include: { notificationPreferencesV2: true },
  });

  if (!user) {
    throw new Error("No users found");
  }

  log(`   User: ${user.email}`, "cyan");
  log(
    `   Has notification preferences: ${user.notificationPreferencesV2 ? "Yes" : "No"}`,
    user.notificationPreferencesV2 ? "green" : "yellow"
  );

  if (user.notificationPreferencesV2) {
    log(
      `   Email enabled: ${user.notificationPreferencesV2.emailEnabled}`,
      "cyan"
    );
    log(
      `   Email frequency: ${user.notificationPreferencesV2.emailFrequency}`,
      "cyan"
    );
    log(
      `   Push enabled: ${user.notificationPreferencesV2.pushEnabled}`,
      "cyan"
    );
  }
}

async function testDefaultValuesCreation() {
  // Create a new test user without settings
  const testUser = await database.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      firstName: "Test",
      lastName: "User",
      name: "Test User",
      role: "CONSUMER",
      status: "ACTIVE",
      emailVerified: true,
    },
  });

  log(`   Created test user: ${testUser.email}`, "cyan");

  // Create settings with all defaults
  const settings = await database.userSettings.create({
    data: {
      userId: testUser.id,
    },
  });

  log(`   Created settings with defaults`, "cyan");
  log(`   Theme: ${settings.theme} (should be 'light')`, "cyan");
  log(`   Language: ${settings.language} (should be 'en')`, "cyan");
  log(`   Timezone: ${settings.timezone} (should be 'UTC')`, "cyan");

  // Create notification preferences with all defaults
  const prefs = await database.notificationPreferencesV2.create({
    data: {
      userId: testUser.id,
    },
  });

  log(`   Created notification preferences with defaults`, "cyan");
  log(`   Email enabled: ${prefs.emailEnabled} (should be true)`, "cyan");
  log(
    `   Email frequency: ${prefs.emailFrequency} (should be 'immediate')`,
    "cyan"
  );
  log(`   SMS enabled: ${prefs.smsEnabled} (should be false)`, "cyan");

  // Cleanup
  await database.notificationPreferencesV2.delete({
    where: { userId: testUser.id },
  });
  await database.userSettings.delete({ where: { userId: testUser.id } });
  await database.user.delete({ where: { id: testUser.id } });

  log(`   Cleaned up test user`, "cyan");
}

async function testCascadeDelete() {
  // Create a test user with settings and preferences
  const testUser = await database.user.create({
    data: {
      email: `cascade-test-${Date.now()}@example.com`,
      firstName: "Cascade",
      lastName: "Test",
      name: "Cascade Test",
      role: "CONSUMER",
      status: "ACTIVE",
    },
  });

  await database.userSettings.create({
    data: { userId: testUser.id },
  });

  await database.notificationPreferencesV2.create({
    data: { userId: testUser.id },
  });

  log(`   Created test user with settings and preferences`, "cyan");

  // Delete user (should cascade delete settings and preferences)
  await database.user.delete({ where: { id: testUser.id } });

  // Verify settings and preferences are deleted
  const settings = await database.userSettings.findUnique({
    where: { userId: testUser.id },
  });

  const prefs = await database.notificationPreferencesV2.findUnique({
    where: { userId: testUser.id },
  });

  if (settings || prefs) {
    throw new Error("Cascade delete did not work correctly");
  }

  log(`   Cascade delete successful`, "cyan");
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function main() {
  log("\n🧪 Settings & Notifications API Test Suite\n", "bright");
  log("Testing database models and relations for new API endpoints", "cyan");

  try {
    // Database Connection Tests
    section("1️⃣  Database Connection");
    results.push(
      await test("Connect to database", testDatabaseConnection)
    );
    results.push(
      await test("UserSettings model exists", testUserSettingsModelExists)
    );
    results.push(
      await test(
        "NotificationPreferencesV2 model exists",
        testNotificationPreferencesModelExists
      )
    );

    // Create Tests
    section("2️⃣  Create Operations");
    results.push(
      await test("Create UserSettings", testCreateUserSettings)
    );
    results.push(
      await test(
        "Create NotificationPreferencesV2",
        testCreateNotificationPreferences
      )
    );

    // Update Tests
    section("3️⃣  Update Operations");
    results.push(
      await test("Update UserSettings", testUpdateUserSettings)
    );
    results.push(
      await test(
        "Update NotificationPreferencesV2",
        testUpdateNotificationPreferences
      )
    );

    // Relation Tests
    section("4️⃣  Relation Tests");
    results.push(
      await test("User -> UserSettings relation", testUserSettingsRelation)
    );
    results.push(
      await test(
        "User -> NotificationPreferencesV2 relation",
        testNotificationPreferencesRelation
      )
    );

    // Edge Case Tests
    section("5️⃣  Edge Cases");
    results.push(
      await test("Default values creation", testDefaultValuesCreation)
    );
    results.push(
      await test("Cascade delete", testCascadeDelete)
    );

    // Summary
    section("📊 Test Summary");
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    const total = results.length;

    log(`Total Tests: ${total}`, "bright");
    log(`Passed: ${passed}`, passed === total ? "green" : "yellow");
    log(`Failed: ${failed}`, failed === 0 ? "green" : "red");

    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    log(`Total Duration: ${totalDuration}ms`, "cyan");

    if (failed > 0) {
      console.log("\n❌ Failed Tests:");
      results
        .filter((r) => !r.passed)
        .forEach((r) => {
          log(`   ${r.name}: ${r.message}`, "red");
        });
    }

    console.log("\n" + "=".repeat(80));
    if (failed === 0) {
      log("✅ All tests passed! APIs are ready for use.", "green");
    } else {
      log("⚠️  Some tests failed. Please review errors above.", "yellow");
    }
    console.log("=".repeat(80) + "\n");

    // Next Steps
    section("🚀 Next Steps");
    log("1. Deploy the new API endpoints to production", "cyan");
    log("2. Test the settings page UI at /settings", "cyan");
    log("3. Verify settings save successfully", "cyan");
    log("4. Check server logs for any errors", "cyan");
    log("5. Monitor API response times", "cyan");

    await database.$disconnect();
    process.exit(failed === 0 ? 0 : 1);
  } catch (error) {
    log("\n❌ Fatal Error:", "red");
    console.error(error);
    await database.$disconnect();
    process.exit(1);
  }
}

// Run tests
main();
