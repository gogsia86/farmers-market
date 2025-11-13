#!/usr/bin/env node
/**
 * 🧪 FARMER PORTAL API TEST SUITE
 * Quick test script for all farmer APIs
 */

const BASE_URL = "http://localhost:3000";

async function testAPI(name: string, method: string, url: string, body?: any) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   ${method} ${url}`);

  try {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${url}`, options);
    const data = await response.json();

    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${data.success ? "✅" : "❌"}`);

    if (data.error) {
      console.log(`   Error: ${data.error}`);
    }

    if (data.data) {
      console.log(`   Data keys: ${Object.keys(data.data).join(", ")}`);
    }

    return { success: response.ok, data };
  } catch (error) {
    console.log(
      `   ❌ Failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return { success: false, error };
  }
}

async function runTests() {
  console.log("🚀 FARMER PORTAL API TEST SUITE");
  console.log("================================\n");

  const results = {
    passed: 0,
    failed: 0,
  };

  // Test 1: Resources API
  const test1 = await testAPI("Get All Resources", "GET", "/api/resources");
  test1.success ? results.passed++ : results.failed++;

  // Test 2: Resources by Category
  const test2 = await testAPI(
    "Get Growing Resources",
    "GET",
    "/api/resources?category=GROWING"
  );
  test2.success ? results.passed++ : results.failed++;

  // Test 3: Support Ticket Creation
  const test3 = await testAPI(
    "Create Support Ticket",
    "POST",
    "/api/support/tickets",
    {
      name: "Test Farmer",
      farmName: "Test Farm",
      email: "test@example.com",
      subject: "TECHNICAL",
      message:
        "This is a test support ticket with enough characters to pass validation.",
      priority: "MEDIUM",
    }
  );
  test3.success ? results.passed++ : results.failed++;

  // Test 4: Farmer Registration (will fail without valid data)
  const test4 = await testAPI(
    "Farmer Registration",
    "POST",
    "/api/farmers/register",
    {
      farmName: "Test Valley Farm",
      farmDescription:
        "A comprehensive test farm for API validation testing purposes",
      farmType: "VEGETABLE",
      address: "123 Test Road",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      ownerName: "John Test",
      email: `test${Date.now()}@example.com`,
      phone: "(503) 555-0123",
      website: "",
      socialMedia: "",
      organic: true,
      biodynamic: false,
      gapCertified: false,
      businessLicense: "BL-12345",
      taxId: "12-3456789",
      insurance: true,
      pickupAvailable: true,
      deliveryAvailable: false,
    }
  );
  test4.success ? results.passed++ : results.failed++;

  // Test 5: Auth Check (will fail without session)
  await testAPI("Farmer Auth Check", "GET", "/api/farmers/auth");
  // Auth is expected to fail without session
  console.log("   (Auth failure expected without session)");

  // Test 6: Dashboard (will fail without auth)
  await testAPI("Farmer Dashboard", "GET", "/api/farmers/dashboard");
  // Dashboard is expected to fail without auth
  console.log("   (Dashboard failure expected without auth)");

  // Summary
  console.log("\n================================");
  console.log("📊 TEST SUMMARY");
  console.log("================================");
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(
    `📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`
  );
  console.log(
    "\n💡 Note: Auth-protected endpoints expected to fail without session"
  );
}

// Run tests
runTests().catch(console.error);
