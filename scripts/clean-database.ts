import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CleanupReport {
  orphanedProducts: any[];
  orphanedOrderItems: any[];
  orphanedReviews: any[];
  orphanedAddresses: any[];
  invalidStatuses: {
    orders: any[];
    users: any[];
    farms: any[];
    products: any[];
  };
  oldSoftDeletes: {
    users: any[];
    farms: any[];
    products: any[];
  };
  inconsistentData: {
    productsWithoutPrices: any[];
    ordersWithoutItems: any[];
    farmsWithoutLocation: any[];
  };
  dataIntegrity: {
    duplicateEmails: any[];
    duplicateSlugs: any[];
  };
}

async function cleanupDatabase(): Promise<CleanupReport> {
  console.log('🔍 Starting database cleanup check...\n');

  const report: CleanupReport = {
    orphanedProducts: [],
    orphanedOrderItems: [],
    orphanedReviews: [],
    orphanedAddresses: [],
    invalidStatuses: {
      orders: [],
      users: [],
      farms: [],
      products: [],
    },
    oldSoftDeletes: {
      users: [],
      farms: [],
      products: [],
    },
    inconsistentData: {
      productsWithoutPrices: [],
      ordersWithoutItems: [],
      farmsWithoutLocation: [],
    },
    dataIntegrity: {
      duplicateEmails: [],
      duplicateSlugs: [],
    },
  };

  try {
    // 1. Find orphaned products (products without farms)
    console.log('📦 Checking for orphaned products...');
    report.orphanedProducts = await prisma.$queryRaw`
      SELECT p.id, p.name, p."farmId"
      FROM products p
      LEFT JOIN farms f ON p."farmId" = f.id
      WHERE f.id IS NULL
    `;
    console.log(`   Found ${report.orphanedProducts.length} orphaned products\n`);

    // 2. Find orphaned order items
    console.log('🛒 Checking for orphaned order items...');
    report.orphanedOrderItems = await prisma.$queryRaw`
      SELECT oi.id, oi."orderId", oi."productId"
      FROM order_items oi
      LEFT JOIN orders o ON oi."orderId" = o.id
      WHERE o.id IS NULL
    `;
    console.log(`   Found ${report.orphanedOrderItems.length} orphaned order items\n`);

    // 3. Find orphaned reviews
    console.log('⭐ Checking for orphaned reviews...');
    report.orphanedReviews = await prisma.$queryRaw`
      SELECT r.id, r."farmId", r."userId"
      FROM reviews r
      LEFT JOIN farms f ON r."farmId" = f.id
      LEFT JOIN users u ON r."userId" = u.id
      WHERE f.id IS NULL OR u.id IS NULL
    `;
    console.log(`   Found ${report.orphanedReviews.length} orphaned reviews\n`);

    // 4. Find orphaned addresses
    console.log('📍 Checking for orphaned addresses...');
    report.orphanedAddresses = await prisma.$queryRaw`
      SELECT a.id, a."userId"
      FROM addresses a
      LEFT JOIN users u ON a."userId" = u.id
      WHERE u.id IS NULL
    `;
    console.log(`   Found ${report.orphanedAddresses.length} orphaned addresses\n`);

    // 5. Check for invalid order statuses
    console.log('📊 Checking for invalid statuses...');
    const validOrderStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    report.invalidStatuses.orders = await prisma.order.findMany({
      where: {
        status: {
          notIn: validOrderStatuses as any[],
        },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });
    console.log(`   Found ${report.invalidStatuses.orders.length} orders with invalid status\n`);

    // 6. Check for invalid user statuses
    const validUserStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'];
    report.invalidStatuses.users = await prisma.user.findMany({
      where: {
        status: {
          notIn: validUserStatuses as any[],
        },
      },
      select: {
        id: true,
        email: true,
        status: true,
      },
    });
    console.log(`   Found ${report.invalidStatuses.users.length} users with invalid status\n`);

    // 7. Find old soft-deleted records (older than 30 days)
    console.log('🗑️  Checking for old soft-deleted records...');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    try {
      report.oldSoftDeletes.users = await prisma.user.findMany({
        where: {
          deletedAt: {
            lt: thirtyDaysAgo,
          },
        },
        select: {
          id: true,
          email: true,
          deletedAt: true,
        },
      });
    } catch (e) {
      console.log('   (Users table may not have deletedAt field)');
    }

    console.log(`   Found ${report.oldSoftDeletes.users.length} old soft-deleted users\n`);

    // 8. Check for products without prices
    console.log('💰 Checking for products without prices...');
    report.inconsistentData.productsWithoutPrices = await prisma.product.findMany({
      where: {
        OR: [
          { price: { lte: 0 } },
          { price: null },
        ],
      },
      select: {
        id: true,
        name: true,
        price: true,
        farmId: true,
      },
    });
    console.log(`   Found ${report.inconsistentData.productsWithoutPrices.length} products without valid prices\n`);

    // 9. Check for orders without items
    console.log('🛍️  Checking for orders without items...');
    report.inconsistentData.ordersWithoutItems = await prisma.$queryRaw`
      SELECT o.id, o."userId", o.status, o.total
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi."orderId"
      WHERE oi.id IS NULL
    `;
    console.log(`   Found ${report.inconsistentData.ordersWithoutItems.length} orders without items\n`);

    // 10. Check for farms without location
    console.log('🌾 Checking for farms without location data...');
    report.inconsistentData.farmsWithoutLocation = await prisma.farm.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null },
          { city: null },
          { state: null },
        ],
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        city: true,
        state: true,
      },
    });
    console.log(`   Found ${report.inconsistentData.farmsWithoutLocation.length} farms with incomplete location data\n`);

    // 11. Check for duplicate emails
    console.log('📧 Checking for duplicate emails...');
    report.dataIntegrity.duplicateEmails = await prisma.$queryRaw`
      SELECT email, COUNT(*) as count
      FROM users
      WHERE email IS NOT NULL
      GROUP BY email
      HAVING COUNT(*) > 1
    `;
    console.log(`   Found ${report.dataIntegrity.duplicateEmails.length} duplicate emails\n`);

    // 12. Check for duplicate slugs in farms
    console.log('🔗 Checking for duplicate farm slugs...');
    report.dataIntegrity.duplicateSlugs = await prisma.$queryRaw`
      SELECT slug, COUNT(*) as count
      FROM farms
      WHERE slug IS NOT NULL
      GROUP BY slug
      HAVING COUNT(*) > 1
    `;
    console.log(`   Found ${report.dataIntegrity.duplicateSlugs.length} duplicate farm slugs\n`);

  } catch (error) {
    console.error('❌ Error during database cleanup check:', error);
    throw error;
  }

  return report;
}

function printReport(report: CleanupReport) {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 DATABASE CLEANUP REPORT');
  console.log('═══════════════════════════════════════════════════════\n');

  let hasIssues = false;

  // Orphaned records
  if (report.orphanedProducts.length > 0) {
    hasIssues = true;
    console.log('⚠️  ORPHANED PRODUCTS:');
    report.orphanedProducts.slice(0, 5).forEach((p: any) => {
      console.log(`   - Product ID: ${p.id}, Name: ${p.name}, Farm ID: ${p.farmId}`);
    });
    if (report.orphanedProducts.length > 5) {
      console.log(`   ... and ${report.orphanedProducts.length - 5} more\n`);
    } else {
      console.log();
    }
  }

  if (report.orphanedOrderItems.length > 0) {
    hasIssues = true;
    console.log('⚠️  ORPHANED ORDER ITEMS:');
    console.log(`   Found ${report.orphanedOrderItems.length} orphaned order items\n`);
  }

  if (report.orphanedReviews.length > 0) {
    hasIssues = true;
    console.log('⚠️  ORPHANED REVIEWS:');
    console.log(`   Found ${report.orphanedReviews.length} orphaned reviews\n`);
  }

  if (report.orphanedAddresses.length > 0) {
    hasIssues = true;
    console.log('⚠️  ORPHANED ADDRESSES:');
    console.log(`   Found ${report.orphanedAddresses.length} orphaned addresses\n`);
  }

  // Invalid statuses
  if (report.invalidStatuses.orders.length > 0) {
    hasIssues = true;
    console.log('⚠️  INVALID ORDER STATUSES:');
    report.invalidStatuses.orders.forEach((o: any) => {
      console.log(`   - Order ID: ${o.id}, Status: ${o.status}`);
    });
    console.log();
  }

  if (report.invalidStatuses.users.length > 0) {
    hasIssues = true;
    console.log('⚠️  INVALID USER STATUSES:');
    report.invalidStatuses.users.forEach((u: any) => {
      console.log(`   - User: ${u.email}, Status: ${u.status}`);
    });
    console.log();
  }

  // Old soft deletes
  if (report.oldSoftDeletes.users.length > 0) {
    hasIssues = true;
    console.log('🗑️  OLD SOFT-DELETED USERS (>30 days):');
    console.log(`   Found ${report.oldSoftDeletes.users.length} users that can be hard deleted\n`);
  }

  // Inconsistent data
  if (report.inconsistentData.productsWithoutPrices.length > 0) {
    hasIssues = true;
    console.log('⚠️  PRODUCTS WITHOUT VALID PRICES:');
    report.inconsistentData.productsWithoutPrices.slice(0, 5).forEach((p: any) => {
      console.log(`   - Product ID: ${p.id}, Name: ${p.name}, Price: ${p.price}`);
    });
    if (report.inconsistentData.productsWithoutPrices.length > 5) {
      console.log(`   ... and ${report.inconsistentData.productsWithoutPrices.length - 5} more\n`);
    } else {
      console.log();
    }
  }

  if (report.inconsistentData.ordersWithoutItems.length > 0) {
    hasIssues = true;
    console.log('⚠️  ORDERS WITHOUT ITEMS:');
    console.log(`   Found ${report.inconsistentData.ordersWithoutItems.length} empty orders\n`);
  }

  if (report.inconsistentData.farmsWithoutLocation.length > 0) {
    hasIssues = true;
    console.log('⚠️  FARMS WITH INCOMPLETE LOCATION DATA:');
    report.inconsistentData.farmsWithoutLocation.slice(0, 5).forEach((f: any) => {
      console.log(`   - Farm: ${f.name}, Lat: ${f.latitude}, Lng: ${f.longitude}, City: ${f.city}, State: ${f.state}`);
    });
    if (report.inconsistentData.farmsWithoutLocation.length > 5) {
      console.log(`   ... and ${report.inconsistentData.farmsWithoutLocation.length - 5} more\n`);
    } else {
      console.log();
    }
  }

  // Data integrity
  if (report.dataIntegrity.duplicateEmails.length > 0) {
    hasIssues = true;
    console.log('⚠️  DUPLICATE EMAILS:');
    report.dataIntegrity.duplicateEmails.forEach((e: any) => {
      console.log(`   - Email: ${e.email}, Count: ${e.count}`);
    });
    console.log();
  }

  if (report.dataIntegrity.duplicateSlugs.length > 0) {
    hasIssues = true;
    console.log('⚠️  DUPLICATE FARM SLUGS:');
    report.dataIntegrity.duplicateSlugs.forEach((s: any) => {
      console.log(`   - Slug: ${s.slug}, Count: ${s.count}`);
    });
    console.log();
  }

  if (!hasIssues) {
    console.log('✅ No database integrity issues found! Your database looks clean.\n');
  }

  // Summary
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 SUMMARY:');
  console.log(`   Orphaned products: ${report.orphanedProducts.length}`);
  console.log(`   Orphaned order items: ${report.orphanedOrderItems.length}`);
  console.log(`   Orphaned reviews: ${report.orphanedReviews.length}`);
  console.log(`   Orphaned addresses: ${report.orphanedAddresses.length}`);
  console.log(`   Invalid order statuses: ${report.invalidStatuses.orders.length}`);
  console.log(`   Invalid user statuses: ${report.invalidStatuses.users.length}`);
  console.log(`   Old soft-deleted users: ${report.oldSoftDeletes.users.length}`);
  console.log(`   Products without prices: ${report.inconsistentData.productsWithoutPrices.length}`);
  console.log(`   Orders without items: ${report.inconsistentData.ordersWithoutItems.length}`);
  console.log(`   Farms without location: ${report.inconsistentData.farmsWithoutLocation.length}`);
  console.log(`   Duplicate emails: ${report.dataIntegrity.duplicateEmails.length}`);
  console.log(`   Duplicate farm slugs: ${report.dataIntegrity.duplicateSlugs.length}`);
  console.log('═══════════════════════════════════════════════════════\n');
}

async function main() {
  try {
    const report = await cleanupDatabase();
    printReport(report);

    // Save report to file
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(process.cwd(), 'database-cleanup-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📝 Detailed report saved to: database-cleanup-report.json\n`);

    // Exit with appropriate code
    const hasIssues =
      report.orphanedProducts.length > 0 ||
      report.orphanedOrderItems.length > 0 ||
      report.orphanedReviews.length > 0 ||
      report.invalidStatuses.orders.length > 0 ||
      report.invalidStatuses.users.length > 0 ||
      report.dataIntegrity.duplicateEmails.length > 0 ||
      report.dataIntegrity.duplicateSlugs.length > 0;

    process.exit(hasIssues ? 1 : 0);
  } catch (error) {
    console.error('❌ Error running database cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { cleanupDatabase, CleanupReport };
