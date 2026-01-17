#!/usr/bin/env tsx

/**
 * 🔥 CACHE WARMING SCRIPT
 *
 * Pre-populates caches for high-traffic pages to improve performance
 * Run after deployment or on a schedule to keep caches warm
 *
 * Features:
 * - Warms homepage data
 * - Warms browse farms/products pages
 * - Warms static content pages
 * - Warms popular search queries
 * - Parallel execution with progress tracking
 * - Error handling and retry logic
 *
 * Usage:
 *   npm run warm-cache
 *   tsx scripts/warm-cache.ts
 *   tsx scripts/warm-cache.ts --production
 */

import { PageCacheKeys, PageCacheService, PageCacheTTL } from '@/lib/cache/page-cache-helpers';
import { database } from '@/lib/database';
import { logger } from '@/lib/logger';

// ============================================================================
// CONFIGURATION
// ============================================================================

const IS_PRODUCTION = process.argv.includes('--production');
const BASE_URL = IS_PRODUCTION
  ? 'https://farmers-market-platform.vercel.app'
  : 'http://localhost:3000';

// States to warm (top 10 most active)
const TOP_STATES = ['CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI'];

// Product categories to warm
const TOP_CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Dairy',
  'Meat',
  'Eggs',
  'Baked Goods',
  'Herbs',
  'Honey'
];

// Common search queries
const POPULAR_SEARCHES = [
  'organic',
  'tomatoes',
  'eggs',
  'chicken',
  'honey',
  'lettuce',
  'berries',
  'milk',
  'bread',
  'vegetables'
];

// ============================================================================
// FETCHER FUNCTIONS
// ============================================================================

/**
 * Fetch homepage data
 */
async function fetchHomepageData() {
  try {
    // Featured farms
    const featuredFarms = await database.farm.findMany({
      where: {
        status: 'ACTIVE',
        featured: true
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        location: {
          select: {
            city: true,
            state: true
          }
        }
      }
    });

    // Featured products
    const featuredProducts = await database.product.findMany({
      where: {
        status: 'ACTIVE',
        featured: true
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        unit: true,
        imageUrl: true,
        farm: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    // Stats
    const [totalFarms, totalProducts, totalOrders] = await Promise.all([
      database.farm.count({ where: { status: 'ACTIVE' } }),
      database.product.count({ where: { status: 'ACTIVE' } }),
      database.order.count({ where: { status: { in: ['COMPLETED', 'DELIVERED'] } } })
    ]);

    return {
      featuredFarms,
      featuredProducts,
      stats: {
        totalFarms,
        totalProducts,
        totalOrders
      }
    };
  } catch (error) {
    logger.error('Failed to fetch homepage data', { error });
    throw error;
  }
}

/**
 * Fetch farms by state
 */
async function fetchFarmsByState(state: string, page: number = 1) {
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  return database.farm.findMany({
    where: {
      status: 'ACTIVE',
      location: {
        state
      }
    },
    take: pageSize,
    skip,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      location: {
        select: {
          city: true,
          state: true
        }
      },
      _count: {
        select: {
          products: true
        }
      }
    }
  });
}

/**
 * Fetch products by category
 */
async function fetchProductsByCategory(category: string, page: number = 1) {
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  return database.product.findMany({
    where: {
      status: 'ACTIVE',
      category
    },
    take: pageSize,
    skip,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      unit: true,
      imageUrl: true,
      category: true,
      farm: {
        select: {
          name: true,
          slug: true
        }
      }
    }
  });
}

/**
 * Search farms
 */
async function searchFarms(query: string) {
  return database.farm.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    },
    take: 20,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      location: {
        select: {
          city: true,
          state: true
        }
      }
    }
  });
}

/**
 * Search products
 */
async function searchProducts(query: string) {
  return database.product.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    },
    take: 20,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      unit: true,
      imageUrl: true,
      farm: {
        select: {
          name: true,
          slug: true
        }
      }
    }
  });
}

/**
 * Fetch static content (FAQ, About, How It Works)
 */
async function fetchStaticContent(page: 'faq' | 'about' | 'how-it-works') {
  // In a real app, this would fetch from CMS or database
  // For now, we'll return a placeholder that indicates the page is cached
  return {
    page,
    cached: true,
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// CACHE WARMING LOGIC
// ============================================================================

/**
 * Warm homepage cache
 */
async function warmHomepage() {
  console.log('🏠 Warming homepage cache...');

  await PageCacheService.getOrFetch(
    PageCacheKeys.homepage(),
    fetchHomepageData,
    PageCacheTTL.HOMEPAGE
  );

  console.log('✅ Homepage cache warmed');
}

/**
 * Warm farm browse pages
 */
async function warmFarmPages() {
  console.log('🌾 Warming farm browse pages...');

  const fetchers = [];

  // Warm default browse page
  fetchers.push({
    key: PageCacheKeys.browseFarms(),
    fetcher: () => database.farm.findMany({
      where: { status: 'ACTIVE' },
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        location: {
          select: { city: true, state: true }
        }
      }
    }),
    ttl: PageCacheTTL.BROWSE_FARMS
  });

  // Warm by top states (first 2 pages each)
  for (const state of TOP_STATES.slice(0, 5)) {
    for (let page = 1; page <= 2; page++) {
      fetchers.push({
        key: PageCacheKeys.browseFarms({ state, page }),
        fetcher: () => fetchFarmsByState(state, page),
        ttl: PageCacheTTL.BROWSE_FARMS
      });
    }
  }

  // Warm popular searches
  for (const search of POPULAR_SEARCHES.slice(0, 5)) {
    fetchers.push({
      key: PageCacheKeys.browseFarms({ search }),
      fetcher: () => searchFarms(search),
      ttl: PageCacheTTL.BROWSE_FARMS
    });
  }

  await PageCacheService.warmCache(fetchers);

  console.log(`✅ ${fetchers.length} farm pages warmed`);
}

/**
 * Warm product browse pages
 */
async function warmProductPages() {
  console.log('🥬 Warming product browse pages...');

  const fetchers = [];

  // Warm default browse page
  fetchers.push({
    key: PageCacheKeys.browseProducts(),
    fetcher: () => database.product.findMany({
      where: { status: 'ACTIVE' },
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        unit: true,
        imageUrl: true,
        category: true,
        farm: {
          select: { name: true, slug: true }
        }
      }
    }),
    ttl: PageCacheTTL.BROWSE_PRODUCTS
  });

  // Warm by category (first 2 pages each)
  for (const category of TOP_CATEGORIES) {
    for (let page = 1; page <= 2; page++) {
      fetchers.push({
        key: PageCacheKeys.browseProducts({ category, page }),
        fetcher: () => fetchProductsByCategory(category, page),
        ttl: PageCacheTTL.BROWSE_PRODUCTS
      });
    }
  }

  // Warm popular searches
  for (const search of POPULAR_SEARCHES) {
    fetchers.push({
      key: PageCacheKeys.browseProducts({ search }),
      fetcher: () => searchProducts(search),
      ttl: PageCacheTTL.BROWSE_PRODUCTS
    });
  }

  await PageCacheService.warmCache(fetchers);

  console.log(`✅ ${fetchers.length} product pages warmed`);
}

/**
 * Warm static content pages
 */
async function warmStaticPages() {
  console.log('📄 Warming static content pages...');

  const fetchers = [
    {
      key: PageCacheKeys.faq(),
      fetcher: () => fetchStaticContent('faq'),
      ttl: PageCacheTTL.FAQ
    },
    {
      key: PageCacheKeys.about(),
      fetcher: () => fetchStaticContent('about'),
      ttl: PageCacheTTL.ABOUT
    },
    {
      key: PageCacheKeys.howItWorks(),
      fetcher: () => fetchStaticContent('how-it-works'),
      ttl: PageCacheTTL.HOW_IT_WORKS
    }
  ];

  await PageCacheService.warmCache(fetchers);

  console.log(`✅ ${fetchers.length} static pages warmed`);
}

/**
 * Get cache statistics
 */
function displayCacheStats() {
  console.log('\n📊 Cache Statistics:');
  const stats = PageCacheService.getStats();
  console.log(JSON.stringify(stats, null, 2));
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const startTime = Date.now();

  console.log('🔥 Starting cache warming process...');
  console.log(`Environment: ${IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`Base URL: ${BASE_URL}\n`);

  try {
    // Connect to database
    await database.$connect();
    console.log('✅ Database connected\n');

    // Warm caches in sequence (to avoid overwhelming the database)
    await warmHomepage();
    console.log('');

    await warmStaticPages();
    console.log('');

    await warmFarmPages();
    console.log('');

    await warmProductPages();
    console.log('');

    // Display stats
    displayCacheStats();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Cache warming completed successfully in ${duration}s`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Cache warming failed:', error);
    logger.error('Cache warming failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as warmCache };
