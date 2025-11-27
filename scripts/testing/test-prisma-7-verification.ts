/**
 * PRISMA 7 VERIFICATION TEST
 * Quick verification that Prisma 7 client is working correctly
 */

import { database } from "../../src/lib/database";

async function testPrisma7() {
  console.log("🧪 PRISMA 7 VERIFICATION TEST");
  console.log("=".repeat(60));

  try {
    // Test 1: Database Connection
    console.log("\n✅ Test 1: Database Connection");
    await database.$connect();
    console.log("   ✓ Connected to database successfully");

    // Test 2: Simple Query
    console.log("\n✅ Test 2: Simple Query (count users)");
    const userCount = await database.user.count();
    console.log(`   ✓ Found ${userCount} users in database`);

    // Test 3: Complex Query with Relations
    console.log("\n✅ Test 3: Complex Query (farms with relations)");
    const farms = await database.farm.findMany({
      take: 5,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });
    console.log(`   ✓ Found ${farms.length} farms`);
    if (farms.length > 0) {
      console.log(
        `   ✓ Sample farm: "${farms[0].name}" (Owner: ${farms[0].owner?.name || "N/A"})`,
      );
    }

    // Test 4: Aggregation
    console.log("\n✅ Test 4: Aggregation Query");
    const productStats = await database.product.aggregate({
      _count: true,
      _avg: {
        price: true,
      },
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
    });
    console.log(`   ✓ Products: ${productStats._count}`);
    console.log(
      `   ✓ Avg Price: $${productStats._avg.price?.toFixed(2) || "0.00"}`,
    );
    console.log(
      `   ✓ Price Range: $${productStats._min.price?.toFixed(2) || "0.00"} - $${productStats._max.price?.toFixed(2) || "0.00"}`,
    );

    // Test 5: Raw Query
    console.log("\n✅ Test 5: Raw SQL Query");
    const result =
      await database.$queryRaw`SELECT COUNT(*) as count FROM "User"`;
    console.log("   ✓ Raw query executed successfully");
    console.log("   ✓ User count from raw query:", result);

    // Test 6: Transaction
    console.log("\n✅ Test 6: Transaction Test (read-only)");
    const txResult = await database.$transaction(async (tx) => {
      const users = await tx.user.count();
      const farms = await tx.farm.count();
      const products = await tx.product.count();
      return { users, farms, products };
    });
    console.log("   ✓ Transaction executed successfully");
    console.log(
      `   ✓ Counts: ${txResult.users} users, ${txResult.farms} farms, ${txResult.products} products`,
    );

    // Test 7: TypeScript Type Inference
    console.log("\n✅ Test 7: TypeScript Type Inference");
    const user = await database.user.findFirst({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    if (user) {
      // These should all be type-safe
      const _userId: string = user.id;
      const userName: string | null = user.name;
      const _userEmail: string = user.email;
      const userRole: string = user.role;
      console.log("   ✓ Type inference working correctly");
      console.log(`   ✓ Sample user: ${userName || "N/A"} (${userRole})`);
    } else {
      console.log("   ✓ Type inference working (no users found)");
    }

    // Test 8: Prisma Client Version
    console.log("\n✅ Test 8: Prisma Client Info");
    const clientVersion =
      (database as { _clientVersion?: string })._clientVersion || "Unknown";
    const engineVersion =
      (database as { _engineVersion?: string })._engineVersion || "Unknown";
    console.log(`   ✓ Client Version: ${clientVersion}`);
    console.log(`   ✓ Engine Version: ${engineVersion}`);

    console.log(`\n${"=".repeat(60)}`);
    console.log("🎉 ALL TESTS PASSED - PRISMA 7 IS WORKING CORRECTLY");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ TEST FAILED");
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await database.$disconnect();
    console.log("\n✓ Disconnected from database");
  }
}

// Run the test
testPrisma7().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
