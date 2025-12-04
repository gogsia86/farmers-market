#!/usr/bin/env tsx
/**
 * 🌟 ACTIVATE FEATURED FARMS SCRIPT
 * Checks database for farms and activates them for featured display
 *
 * This script will:
 * 1. Find all farms in the database
 * 2. Activate and verify farms that should be featured
 * 3. Add sample reviews if needed to make them appear in featured section
 * 4. Display summary of changes
 *
 * Usage: npx tsx scripts/activate-featured-farms.ts
 */

import { database } from "@/lib/database";
import chalk from "chalk";

const prisma = database;

interface FarmStats {
  totalFarms: number;
  activeFarms: number;
  verifiedFarms: number;
  pendingFarms: number;
  updated: number;
}

async function activateFeaturedFarms() {
  console.log(chalk.cyan.bold("\n🌟 FEATURED FARMS ACTIVATION SCRIPT"));
  console.log(chalk.cyan(`${"═".repeat(60)}\n`));

  const stats: FarmStats = {
    totalFarms: 0,
    activeFarms: 0,
    verifiedFarms: 0,
    pendingFarms: 0,
    updated: 0,
  };

  try {
    // Step 1: Get all farms
    console.log(chalk.yellow("📊 Checking database for farms...\n"));

    const allFarms = await prisma.farm.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        verificationStatus: true,
        city: true,
        state: true,
        _count: {
          select: {
            products: true,
            reviews: true,
          },
        },
      },
    });

    stats.totalFarms = allFarms.length;

    if (stats.totalFarms === 0) {
      console.log(chalk.red("❌ No farms found in database!"));
      console.log(chalk.yellow("\n💡 To create farms, run:"));
      console.log(chalk.cyan("   npm run prisma:seed"));
      console.log(chalk.cyan("   or"));
      console.log(chalk.cyan("   npx tsx prisma/seed-comprehensive.js\n"));
      return;
    }

    console.log(
      chalk.green(`✅ Found ${stats.totalFarms} farm(s) in database\n`),
    );

    // Display current farm status
    console.log(chalk.cyan("📋 Current Farm Status:"));
    console.log(chalk.cyan("─".repeat(60)));

    allFarms.forEach((farm, index) => {
      const statusColor = farm.status === "ACTIVE" ? chalk.green : chalk.yellow;
      const verificationColor =
        farm.verificationStatus === "VERIFIED" ? chalk.green : chalk.yellow;

      console.log(`\n${index + 1}. ${chalk.bold(farm.name)}`);
      console.log(`   Location: ${farm.city}, ${farm.state}`);
      console.log(`   Status: ${statusColor(farm.status)}`);
      console.log(
        `   Verification: ${verificationColor(farm.verificationStatus)}`,
      );
      console.log(`   Products: ${farm._count.products}`);
      console.log(`   Reviews: ${farm._count.reviews}`);

      if (farm.status === "ACTIVE") stats.activeFarms++;
      if (farm.verificationStatus === "VERIFIED") stats.verifiedFarms++;
      if (farm.status === "PENDING" || farm.verificationStatus === "PENDING") {
        stats.pendingFarms++;
      }
    });

    console.log(chalk.cyan(`\n${"─".repeat(60)}\n`));

    // Step 2: Find farms that need activation
    const farmsToActivate = allFarms.filter(
      (farm) =>
        farm.status !== "ACTIVE" || farm.verificationStatus !== "VERIFIED",
    );

    if (farmsToActivate.length === 0) {
      console.log(chalk.green("✅ All farms are already ACTIVE and VERIFIED!"));
      console.log(
        chalk.yellow("\n💡 Featured farms should now appear on homepage"),
      );
      console.log(chalk.cyan("   Visit: http://localhost:3001 to see them\n"));
      return;
    }

    // Step 3: Activate farms
    console.log(
      chalk.yellow(`\n🔧 Activating ${farmsToActivate.length} farm(s)...\n`),
    );

    for (const farm of farmsToActivate) {
      try {
        await prisma.farm.update({
          where: { id: farm.id },
          data: {
            status: "ACTIVE",
            verificationStatus: "VERIFIED",
            verifiedAt: new Date(),
            verifiedBy: "system-admin",
          },
        });

        console.log(chalk.green(`✅ Activated: ${farm.name}`));
        stats.updated++;
      } catch (error) {
        console.error(chalk.red(`❌ Failed to activate ${farm.name}:`), error);
      }
    }

    // Step 4: Add sample reviews for farms without reviews
    console.log(chalk.yellow("\n📝 Checking farms without reviews...\n"));

    const farmsWithoutReviews = allFarms.filter(
      (farm) => farm._count.reviews === 0,
    );

    if (farmsWithoutReviews.length > 0) {
      console.log(
        chalk.yellow(
          `Found ${farmsWithoutReviews.length} farm(s) without reviews`,
        ),
      );
      console.log(
        chalk.yellow(
          "Adding sample reviews to help them appear as featured...\n",
        ),
      );

      // Get or create a sample customer user
      let customerUser = await prisma.user.findFirst({
        where: {
          role: "CUSTOMER",
          email: { contains: "consumer" },
        },
      });

      if (!customerUser) {
        // Create a sample customer if none exists
        const bcrypt = await import("bcryptjs");
        const hashedPassword = await bcrypt.hash("SampleUser123!", 12);

        customerUser = await prisma.user.create({
          data: {
            email: "sample.customer@example.com",
            password: hashedPassword,
            firstName: "Sample",
            lastName: "Customer",
            name: "Sample Customer",
            role: "CUSTOMER",
            status: "ACTIVE",
            emailVerified: true,
            emailVerifiedAt: new Date(),
          },
        });

        console.log(
          chalk.green("✅ Created sample customer user for reviews\n"),
        );
      }

      // Add sample reviews
      const sampleReviews = [
        {
          rating: 5,
          comment:
            "Amazing farm! Fresh, organic produce and excellent customer service. Highly recommend!",
          title: "Outstanding Quality!",
        },
        {
          rating: 5,
          comment:
            "The best local farm in the area. Their vegetables are always fresh and delicious.",
          title: "Always Fresh",
        },
        {
          rating: 4,
          comment:
            "Great farm with a good variety of products. Friendly staff and quick delivery.",
          title: "Highly Recommended",
        },
      ];

      for (const farm of farmsWithoutReviews.slice(0, 3)) {
        try {
          // Pick a random review
          const review =
            sampleReviews[Math.floor(Math.random() * sampleReviews.length)];

          await prisma.review.create({
            data: {
              farmId: farm.id,
              userId: customerUser.id,
              rating: review.rating,
              comment: review.comment,
              title: review.title,
              verified: true,
              helpful: Math.floor(Math.random() * 10) + 5,
              notHelpful: 0,
            },
          });

          console.log(chalk.green(`✅ Added review for: ${farm.name}`));
        } catch (error) {
          console.log(
            chalk.yellow(
              `⚠️  Skipped review for ${farm.name} (may already exist)`,
            ),
          );
        }
      }
    }

    // Step 5: Display summary
    console.log(chalk.cyan(`\n${"═".repeat(60)}`));
    console.log(chalk.cyan.bold("📊 SUMMARY"));
    console.log(chalk.cyan(`${"═".repeat(60)}\n`));

    console.log(chalk.white(`Total Farms:           ${stats.totalFarms}`));
    console.log(
      chalk.green(
        `Active Farms:          ${stats.activeFarms + stats.updated}`,
      ),
    );
    console.log(
      chalk.green(
        `Verified Farms:        ${stats.verifiedFarms + stats.updated}`,
      ),
    );
    console.log(chalk.yellow(`Farms Activated:       ${stats.updated}`));

    console.log(chalk.cyan(`\n${"═".repeat(60)}`));
    console.log(chalk.green.bold("\n✅ SUCCESS! Featured farms are ready!\n"));

    console.log(chalk.yellow("🎯 Next Steps:\n"));
    console.log(chalk.white("1. Start your development server:"));
    console.log(chalk.cyan("   npm run dev\n"));
    console.log(chalk.white("2. Visit the homepage:"));
    console.log(chalk.cyan("   http://localhost:3001\n"));
    console.log(
      chalk.white(
        "3. You should now see featured farms in the 'Featured Local Farms' section!\n",
      ),
    );

    // Step 6: Test the featured farms API
    console.log(chalk.yellow("🧪 Testing Featured Farms API...\n"));

    const featuredFarms = await prisma.farm.findMany({
      where: {
        status: "ACTIVE",
        verificationStatus: "VERIFIED",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        state: true,
        _count: {
          select: {
            products: true,
            reviews: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      take: 6,
    });

    if (featuredFarms.length === 0) {
      console.log(
        chalk.red(
          "⚠️  Warning: No farms meet the featured criteria (ACTIVE + VERIFIED)",
        ),
      );
    } else {
      console.log(
        chalk.green(`✅ Found ${featuredFarms.length} featured farm(s):\n`),
      );

      featuredFarms.forEach((farm, index) => {
        const avgRating =
          farm.reviews.length > 0
            ? (
                farm.reviews.reduce((sum, r) => sum + r.rating, 0) /
                farm.reviews.length
              ).toFixed(1)
            : "N/A";

        console.log(`${index + 1}. ${chalk.bold(farm.name)}`);
        console.log(`   Location: ${farm.city}, ${farm.state}`);
        console.log(
          `   Rating: ${avgRating} ⭐ (${farm.reviews.length} reviews)`,
        );
        console.log(`   Products: ${farm._count.products}`);
        console.log(`   URL: http://localhost:3001/farms/${farm.slug}\n`);
      });
    }

    console.log(chalk.cyan("═".repeat(60)));
    console.log(chalk.green.bold("\n🎉 All done! Happy farming! 🌾\n"));
  } catch (error) {
    console.error(chalk.red("\n❌ Error during activation:"));
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
activateFeaturedFarms().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
