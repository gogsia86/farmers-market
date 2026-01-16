import { CacheKeys, CachePatterns } from '@/lib/utils/cache-keys';
import { describe, expect, it } from '@jest/globals';

describe('Cache Keys Utilities', () => {
  // ==========================================================================
  // CART CACHE KEYS
  // ==========================================================================
  describe('CacheKeys.cart', () => {
    const userId = 'user_123';
    const productId = 'prod_456';

    it('should generate cart items key', () => {
      expect(CacheKeys.cart.items(userId)).toBe('cart:user_123:items');
    });

    it('should generate cart summary key', () => {
      expect(CacheKeys.cart.summary(userId)).toBe('cart:user_123:summary');
    });

    it('should generate cart count key', () => {
      expect(CacheKeys.cart.count(userId)).toBe('cart:user_123:count');
    });

    it('should generate cart validation key', () => {
      expect(CacheKeys.cart.validation(userId)).toBe('cart:user_123:validation');
    });

    it('should generate cart item key', () => {
      expect(CacheKeys.cart.item(userId, productId)).toBe('cart:user_123:item:prod_456');
    });

    it('should generate different keys for different users', () => {
      const key1 = CacheKeys.cart.items('user_1');
      const key2 = CacheKeys.cart.items('user_2');
      expect(key1).not.toBe(key2);
    });

    it('should generate consistent keys for same user', () => {
      const key1 = CacheKeys.cart.items(userId);
      const key2 = CacheKeys.cart.items(userId);
      expect(key1).toBe(key2);
    });
  });

  // ==========================================================================
  // FARM CACHE KEYS
  // ==========================================================================
  describe('CacheKeys.farm', () => {
    const farmId = 'farm_123';
    const slug = 'organic-valley-farm';
    const ownerId = 'user_456';

    it('should generate farm details key', () => {
      expect(CacheKeys.farm.details(farmId)).toBe('farm:farm_123:details');
    });

    it('should generate farm by slug key', () => {
      expect(CacheKeys.farm.bySlug(slug)).toBe('farm:slug:organic-valley-farm');
    });

    it('should generate farm list key with pagination', () => {
      expect(CacheKeys.farm.list(1, 20)).toBe('farms:list:page:1:limit:20');
    });

    it('should generate different list keys for different pages', () => {
      const page1 = CacheKeys.farm.list(1, 20);
      const page2 = CacheKeys.farm.list(2, 20);
      expect(page1).not.toBe(page2);
    });

    it('should generate different list keys for different limits', () => {
      const limit20 = CacheKeys.farm.list(1, 20);
      const limit50 = CacheKeys.farm.list(1, 50);
      expect(limit20).not.toBe(limit50);
    });

    it('should generate farm by owner key', () => {
      expect(CacheKeys.farm.byOwner(ownerId)).toBe('farms:owner:user_456');
    });

    it('should generate farm stats key', () => {
      expect(CacheKeys.farm.stats(farmId)).toBe('farm:farm_123:stats');
    });

    it('should generate farm products count key', () => {
      expect(CacheKeys.farm.productsCount(farmId)).toBe('farm:farm_123:products:count');
    });

    it('should generate farm verification key', () => {
      expect(CacheKeys.farm.verification(farmId)).toBe('farm:farm_123:verification');
    });

    it('should generate seasonal farm key', () => {
      expect(CacheKeys.farm.seasonal(farmId, 'SPRING')).toBe('farm:farm_123:season:SPRING');
    });

    it('should generate different seasonal keys for different seasons', () => {
      const spring = CacheKeys.farm.seasonal(farmId, 'SPRING');
      const summer = CacheKeys.farm.seasonal(farmId, 'SUMMER');
      expect(spring).not.toBe(summer);
    });
  });

  // ==========================================================================
  // PRODUCT CACHE KEYS
  // ==========================================================================
  describe('CacheKeys.product', () => {
    const productId = 'prod_123';
    const slug = 'fresh-tomatoes';
    const farmSlug = 'organic-valley';
    const farmId = 'farm_456';

    it('should generate product details key', () => {
      expect(CacheKeys.product.details(productId)).toBe('product:prod_123:details');
    });

    it('should generate product by slug key', () => {
      expect(CacheKeys.product.bySlug(slug)).toBe('product:slug:fresh-tomatoes');
    });

    it('should generate product by farm and slug key', () => {
      expect(CacheKeys.product.byFarmAndSlug(farmSlug, slug)).toBe(
        'product:farm:organic-valley:slug:fresh-tomatoes'
      );
    });

    it('should generate products by farm key with pagination', () => {
      expect(CacheKeys.product.byFarm(farmId, 1, 20)).toBe('products:farm:farm_456:page:1:limit:20');
    });

    it('should generate product search key', () => {
      expect(CacheKeys.product.search('tomato', 1)).toBe('products:search:tomato:page:1');
    });

    it('should generate different search keys for different queries', () => {
      const tomato = CacheKeys.product.search('tomato', 1);
      const carrot = CacheKeys.product.search('carrot', 1);
      expect(tomato).not.toBe(carrot);
    });

    it('should generate product inventory key', () => {
      expect(CacheKeys.product.inventory(productId)).toBe('product:prod_123:inventory');
    });

    it('should generate related products key', () => {
      expect(CacheKeys.product.related(productId, 5)).toBe('product:prod_123:related:limit:5');
    });

    it('should generate seasonal products key', () => {
      expect(CacheKeys.product.seasonal('SPRING', 1)).toBe('products:season:SPRING:page:1');
    });

    it('should generate products by category key', () => {
      expect(CacheKeys.product.byCategory('vegetables', 1)).toBe('products:category:vegetables:page:1');
    });

    it('should generate different category keys', () => {
      const vegetables = CacheKeys.product.byCategory('vegetables', 1);
      const fruits = CacheKeys.product.byCategory('fruits', 1);
      expect(vegetables).not.toBe(fruits);
    });
  });

  // ==========================================================================
  // ORDER CACHE KEYS
  // ==========================================================================
  describe('CacheKeys.order', () => {
    const orderId = 'order_123';
    const userId = 'user_456';
    const farmId = 'farm_789';

    it('should generate order details key', () => {
      expect(CacheKeys.order.details(orderId)).toBe('order:order_123:details');
    });

    it('should generate orders by user key', () => {
      expect(CacheKeys.order.byUser(userId, 1, 20)).toBe('orders:user:user_456:page:1:limit:20');
    });

    it('should generate orders by farm key', () => {
      expect(CacheKeys.order.byFarm(farmId, 1, 20)).toBe('orders:farm:farm_789:page:1:limit:20');
    });

    it('should generate user order stats key', () => {
      expect(CacheKeys.order.userStats(userId)).toBe('orders:user:user_456:stats');
    });

    it('should generate farm order stats key', () => {
      expect(CacheKeys.order.farmStats(farmId)).toBe('orders:farm:farm_789:stats');
    });

    it('should generate order status key', () => {
      expect(CacheKeys.order.status(orderId)).toBe('order:order_123:status');
    });

    it('should generate recent orders key', () => {
      expect(CacheKeys.order.recent(10)).toBe('orders:recent:limit:10');
    });

    it('should generate orders by date range key', () => {
      expect(CacheKeys.order.byDateRange(farmId, '2024-01-01', '2024-12-31')).toBe(
        'orders:farm:farm_789:range:2024-01-01:2024-12-31'
      );
    });

    it('should generate different date range keys', () => {
      const q1 = CacheKeys.order.byDateRange(farmId, '2024-01-01', '2024-03-31');
      const q2 = CacheKeys.order.byDateRange(farmId, '2024-04-01', '2024-06-30');
      expect(q1).not.toBe(q2);
    });
  });

  // ==========================================================================
  // USER CACHE KEYS
  // ==========================================================================
  describe('CacheKeys.user', () => {
    const userId = 'user_123';
    const email = 'john@example.com';

    it('should generate user profile key', () => {
      expect(CacheKeys.user.profile(userId)).toBe('user:user_123:profile');
    });

    it('should generate user preferences key', () => {
      expect(CacheKeys.user.preferences(userId)).toBe('user:user_123:preferences');
    });

    it('should generate user addresses key', () => {
      expect(CacheKeys.user.addresses(userId)).toBe('user:user_123:addresses');
    });

    it('should generate user by email key', () => {
      expect(CacheKeys.user.byEmail(email)).toBe('user:email:john@example.com');
    });

    it('should generate user favorites key', () => {
      expect(CacheKeys.user.favorites(userId)).toBe('user:user_123:favorites');
    });

    it('should generate different keys for different users', () => {
      const user1 = CacheKeys.user.profile('user_1');
      const user2 = CacheKeys.user.profile('user_2');
      expect(user1).not.toBe(user2);
    });
  });

  // ==========================================================================
  // CHECKOUT CACHE KEYS
  // ==========================================================================
  describe('CacheKeys.checkout', () => {
    const sessionId = 'sess_123';
    const userId = 'user_456';

    it('should generate checkout session key', () => {
      expect(CacheKeys.checkout.session(sessionId)).toBe('checkout:session:sess_123');
    });

    it('should generate checkout validation key', () => {
      expect(CacheKeys.checkout.validation(userId)).toBe('checkout:user:user_456:validation');
    });

    it('should generate shipping options key', () => {
      expect(CacheKeys.checkout.shippingOptions(userId)).toBe('checkout:shipping:user_456');
    });

    it('should generate payment methods key', () => {
      expect(CacheKeys.checkout.paymentMethods(userId)).toBe('checkout:payment:user_456');
    });
  });

  // ==========================================================================
  // PAYMENT CACHE KEYS
  // ==========================================================================
  describe('CacheKeys.payment', () => {
    const intentId = 'pi_123';
    const userId = 'user_456';

    it('should generate payment intent key', () => {
      expect(CacheKeys.payment.intent(intentId)).toBe('payment:intent:pi_123');
    });

    it('should generate payment methods key', () => {
      expect(CacheKeys.payment.methods(userId)).toBe('payment:user:user_456:methods');
    });

    it('should generate payment history key', () => {
      expect(CacheKeys.payment.history(userId)).toBe('payment:user:user_456:history');
    });
  });

  // ==========================================================================
  // LOCATION CACHE KEYS
  // ==========================================================================
  describe('CacheKeys.location', () => {
    const address = '1234 Main St';
    const lat = 40.7128;
    const lng = -74.0060;

    it('should generate geocode key with URL encoding', () => {
      const key = CacheKeys.location.geocode(address);
      expect(key).toContain('location:geocode:');
      expect(key).toContain('1234');
      expect(key).toContain('Main');
    });

    it('should generate reverse geocode key', () => {
      expect(CacheKeys.location.reverseGeocode(lat, lng)).toBe('location:reverse:40.7128:-74.006');
    });

    it('should generate nearby farms key', () => {
      expect(CacheKeys.location.nearbyFarms(lat, lng, 10)).toBe(
        'location:nearby:40.7128:-74.006:radius:10'
      );
    });

    it('should generate different nearby keys for different radii', () => {
      const radius10 = CacheKeys.location.nearbyFarms(lat, lng, 10);
      const radius20 = CacheKeys.location.nearbyFarms(lat, lng, 20);
      expect(radius10).not.toBe(radius20);
    });

    it('should handle special characters in addresses', () => {
      const specialAddress = '123 Main St, Apt #5';
      const key = CacheKeys.location.geocode(specialAddress);
      expect(key).toBeTruthy();
      expect(key).toContain('location:geocode:');
    });
  });

  // ==========================================================================
  // AGRICULTURAL CACHE KEYS
  // ==========================================================================
  describe('CacheKeys.agricultural', () => {
    const farmId = 'farm_123';

    it('should generate seasonal data key', () => {
      expect(CacheKeys.agricultural.seasonalData('SPRING')).toBe('agricultural:season:SPRING:data');
    });

    it('should generate planting calendar key', () => {
      expect(CacheKeys.agricultural.plantingCalendar(2024)).toBe(
        'agricultural:planting:calendar:2024'
      );
    });

    it('should generate harvest schedule key', () => {
      expect(CacheKeys.agricultural.harvestSchedule(farmId, 'FALL')).toBe(
        'agricultural:harvest:farm_123:season:FALL'
      );
    });

    it('should generate different seasonal data keys', () => {
      const spring = CacheKeys.agricultural.seasonalData('SPRING');
      const summer = CacheKeys.agricultural.seasonalData('SUMMER');
      expect(spring).not.toBe(summer);
    });

    it('should generate different calendar keys for different years', () => {
      const year2024 = CacheKeys.agricultural.plantingCalendar(2024);
      const year2025 = CacheKeys.agricultural.plantingCalendar(2025);
      expect(year2024).not.toBe(year2025);
    });
  });

  // ==========================================================================
  // ANALYTICS CACHE KEYS
  // ==========================================================================
  describe('CacheKeys.analytics', () => {
    const farmId = 'farm_123';
    const productId = 'prod_456';

    it('should generate farm metrics key', () => {
      expect(CacheKeys.analytics.farmMetrics(farmId, '2024-01-01', '2024-12-31')).toBe(
        'analytics:farm:farm_123:range:2024-01-01:2024-12-31'
      );
    });

    it('should generate product performance key', () => {
      expect(CacheKeys.analytics.productPerformance(productId, '30d')).toBe(
        'analytics:product:prod_456:period:30d'
      );
    });

    it('should generate dashboard summary key', () => {
      expect(CacheKeys.analytics.dashboardSummary(farmId)).toBe(
        'analytics:dashboard:farm_123:summary'
      );
    });

    it('should generate different performance keys for different periods', () => {
      const period30 = CacheKeys.analytics.productPerformance(productId, '30d');
      const period90 = CacheKeys.analytics.productPerformance(productId, '90d');
      expect(period30).not.toBe(period90);
    });
  });

  // ==========================================================================
  // CACHE INVALIDATION PATTERNS
  // ==========================================================================
  describe('CachePatterns', () => {
    const userId = 'user_123';
    const farmId = 'farm_456';
    const productId = 'prod_789';

    it('should generate all user cart pattern', () => {
      expect(CachePatterns.allUserCart(userId)).toBe('cart:user_123:*');
    });

    it('should generate all farm data pattern', () => {
      expect(CachePatterns.allFarmData(farmId)).toBe('farm:farm_456:*');
    });

    it('should generate all farm products pattern', () => {
      expect(CachePatterns.allFarmProducts(farmId)).toBe('products:farm:farm_456:*');
    });

    it('should generate all user orders pattern', () => {
      expect(CachePatterns.allUserOrders(userId)).toBe('orders:user:user_123:*');
    });

    it('should generate all farm orders pattern', () => {
      expect(CachePatterns.allFarmOrders(farmId)).toBe('orders:farm:farm_456:*');
    });

    it('should generate all product data pattern', () => {
      expect(CachePatterns.allProductData(productId)).toBe('product:prod_789:*');
    });

    it('should contain wildcard for pattern matching', () => {
      const pattern = CachePatterns.allUserCart(userId);
      expect(pattern).toContain('*');
    });

    it('should generate different patterns for different users', () => {
      const user1 = CachePatterns.allUserCart('user_1');
      const user2 = CachePatterns.allUserCart('user_2');
      expect(user1).not.toBe(user2);
    });
  });

  // ==========================================================================
  // INTEGRATION TESTS
  // ==========================================================================
  describe('Integration: Cache Key Patterns', () => {
    it('should generate consistent keys across multiple calls', () => {
      const userId = 'user_123';
      const calls = Array(10).fill(null).map(() => CacheKeys.cart.items(userId));
      const allSame = calls.every(key => key === calls[0]);
      expect(allSame).toBe(true);
    });

    it('should generate unique keys for different entities', () => {
      const keys = [
        CacheKeys.cart.items('user_1'),
        CacheKeys.farm.details('farm_1'),
        CacheKeys.product.details('prod_1'),
        CacheKeys.order.details('order_1'),
        CacheKeys.user.profile('user_1'),
      ];
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it('should follow consistent naming pattern', () => {
      const keys = [
        CacheKeys.cart.items('user_123'),
        CacheKeys.farm.details('farm_123'),
        CacheKeys.product.details('prod_123'),
        CacheKeys.order.details('order_123'),
      ];

      keys.forEach(key => {
        expect(key).toMatch(/^[a-z]+:[a-z0-9_]+/);
      });
    });

    it('should use colons as separators consistently', () => {
      const keys = [
        CacheKeys.cart.items('user_123'),
        CacheKeys.farm.details('farm_123'),
        CacheKeys.product.details('prod_123'),
      ];

      keys.forEach(key => {
        expect(key.split(':').length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should generate cache pattern that matches specific keys', () => {
      const userId = 'user_123';
      const specificKey = CacheKeys.cart.items(userId);
      const pattern = CachePatterns.allUserCart(userId);

      // Remove the wildcard and check if key starts with pattern prefix
      const patternPrefix = pattern.replace('*', '');
      expect(specificKey).toContain(patternPrefix);
    });

    it('should handle pagination consistently', () => {
      const farmId = 'farm_123';
      const pages = [1, 2, 3, 4, 5];
      const keys = pages.map(page => CacheKeys.product.byFarm(farmId, page, 20));

      // All should contain farm ID
      keys.forEach(key => expect(key).toContain(farmId));

      // All should be unique
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);

      // All should contain page numbers
      keys.forEach((key, index) => {
        expect(key).toContain(`page:${pages[index]}`);
      });
    });

    it('should allow cache invalidation by pattern', () => {
      const farmId = 'farm_123';
      const productKeys = [
        CacheKeys.product.byFarm(farmId, 1, 20),
        CacheKeys.product.byFarm(farmId, 2, 20),
        CacheKeys.product.byFarm(farmId, 3, 20),
      ];

      const pattern = CachePatterns.allFarmProducts(farmId);
      const patternPrefix = pattern.replace('*', '');

      productKeys.forEach(key => {
        expect(key).toContain(patternPrefix);
      });
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================
  describe('Edge Cases', () => {
    it('should handle empty string IDs', () => {
      const key = CacheKeys.cart.items('');
      expect(key).toBe('cart::items');
    });

    it('should handle IDs with special characters', () => {
      const userId = 'user-with-dashes_123';
      const key = CacheKeys.cart.items(userId);
      expect(key).toContain(userId);
    });

    it('should handle very long IDs', () => {
      const longId = 'user_' + 'a'.repeat(100);
      const key = CacheKeys.cart.items(longId);
      expect(key).toContain(longId);
    });

    it('should handle numeric IDs as strings', () => {
      const key = CacheKeys.cart.items('12345');
      expect(key).toBe('cart:12345:items');
    });

    it('should handle zero as page number', () => {
      const key = CacheKeys.farm.list(0, 20);
      expect(key).toBe('farms:list:page:0:limit:20');
    });

    it('should handle very large page numbers', () => {
      const key = CacheKeys.farm.list(9999, 20);
      expect(key).toBe('farms:list:page:9999:limit:20');
    });

    it('should handle negative coordinates', () => {
      const key = CacheKeys.location.reverseGeocode(-40.7128, -74.0060);
      expect(key).toContain('-40.7128');
      expect(key).toContain('-74.006');
    });

    it('should handle spaces in search queries', () => {
      const key = CacheKeys.product.search('fresh tomatoes', 1);
      expect(key).toContain('fresh tomatoes');
    });
  });
});
