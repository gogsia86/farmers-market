#!/usr/bin/env tsx
/**
 * 🔍 FARM SCHEMA DIAGNOSTIC SCRIPT
 *
 * Checks the actual Farm table schema in the database
 * to diagnose the column mismatch issue.
 */

import { config } from "dotenv";
config();

import { database } from "../src/lib/database";

async function checkFarmSchema() {
  console.log("🔍 Checking Farm table schema...\n");

  try {
    // Query to get column information from PostgreSQL
    const columns = await database.$queryRaw<any[]>`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'farms'
      ORDER BY ordinal_position;
    `;

    console.log(`✅ Found ${columns.length} columns in 'farms' table:\n`);

    columns.forEach((col, idx) => {
      console.log(`${idx + 1}. ${col.column_name}`);
      console.log(`   Type: ${col.data_type}`);
      console.log(`   Nullable: ${col.is_nullable}`);
      console.log(`   Default: ${col.column_default || "none"}`);
      console.log("");
    });

    // Check for specific columns we need
    const requiredColumns = [
      "id",
      "name",
      "slug",
      "description",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "zipCode",
      "latitude",
      "longitude",
      "ownerId",
      "status",
      "verificationStatus",
    ];

    console.log("\n📋 Checking required columns:");
    requiredColumns.forEach((colName) => {
      const exists = columns.some((col) => col.column_name === colName);
      console.log(`${exists ? "✅" : "❌"} ${colName}`);
    });

    // Try a simple query to see what error we get
    console.log("\n🧪 Testing simple findUnique query...");
    try {
      const testResult = await database.farm.findUnique({
        where: { slug: "non-existent-farm-test" },
      });
      console.log(
        "✅ Query executed successfully (no farm found, which is expected)",
      );
    } catch (error: any) {
      console.error("❌ Query failed with error:");
      console.error(error.message);
      if (error.meta) {
        console.error("Meta:", JSON.stringify(error.meta, null, 2));
      }
    }
  } catch (error: any) {
    console.error("❌ Failed to check schema:", error.message);
    throw error;
  } finally {
    await database.$disconnect();
  }
}

checkFarmSchema()
  .then(() => {
    console.log("\n✅ Schema check complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Schema check failed:", error);
    process.exit(1);
  });
