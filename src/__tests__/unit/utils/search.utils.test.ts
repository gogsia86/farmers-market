/**
 * 🔍 Search Utilities Test Suite
 * Comprehensive tests for search, filtering, pagination, and discovery utilities
 */

import {
    buildProductSearchQuery,
    calculateDistance,
    calculatePaginationMeta,
    debounce,
    filtersToSearchParams,
    formatPrice,
    generateSearchCacheKey,
    getCurrentSeason,
    getPriceRangePresets,
    getSeasonalContext,
    getSortOptions,
    highlightMatches,
    parseSearchParams,
    sanitizeSearchQuery,
} from '@/lib/utils/search.utils';
import type { ProductSearchFilters } from '@/types/search';
import { describe, expect, it } from '@jest/globals';

// ============================================================================
// buildProductSearchQuery Tests
// ============================================================================

describe('🔍 Search Utilities', () => {
  describe('buildProductSearchQuery', () => {
    it('should build basic query with defaults', () => {
      const filters: ProductSearchFilters = {};
      const query = buildProductSearchQuery(filters);

      expect(query).toHaveProperty('where');
      expect(query).toHaveProperty('orderBy');
      expect(query).toHaveProperty('skip');
      expect(query).toHaveProperty('take');
      expect(query.skip).toBe(0);
      expect(query.take).toBe(12);
    });

    it('should build query with search text', () => {
      const filters: ProductSearchFilters = {
        query: 'tomato',
      };
      const query = buildProductSearchQuery(filters);

      expect(query.where.OR).toBeDefined();
      expect(query.where.OR).toHaveLength(2);
      expect(query.where.OR![0]).toHaveProperty('name');
      expect(query.where.OR![1]).toHaveProperty('description');
    });

    it('should handle category filter', () => {
      const filters: ProductSearchFilters = {
        categoryId: 'cat_123',
      };
      const query = buildProductSearchQuery(filters);

      expect(query.where.category).toBe('cat_123');
    });

    it('should handle price range filter', () => {
      const filters: ProductSearchFilters = {
        minPrice: 5,
        maxPrice: 20,
      };
      const query = buildProductSearchQuery(filters);

      expect(query.where.price).toBeDefined();
      expect(query.where.price!.gte).toBe(5);
      expect(query.where.price!.lte).toBe(20);
    });

    it('should handle min price only', () => {
      const filters: ProductSearchFilters = {
        minPrice: 10,
      };
      const query = buildProductSearchQuery(filters);

      expect(query.where.price!.gte).toBe(10);
      expect(query.where.price!.lte).toBeUndefined();
    });

    it('should handle max price only', () => {
      const filters: ProductSearchFilters = {
        maxPrice: 50,
      };
      const query = buildProductSearchQuery(filters);

      expect(query.where.price!.lte).toBe(50);
      expect(query.where.price!.gte).toBeUndefined();
    });

    it('should handle farm filter', () => {
      const filters: ProductSearchFilters = {
        farmId: 'farm_123',
      };
      const query = buildProductSearchQuery(filters);

      expect(query.where.farmId).toBe('farm_123');
    });

    it('should handle in stock availability', () => {
      const filters: ProductSearchFilters = {
        availability: 'IN_STOCK',
      };
      const query = buildProductSearchQuery(filters);

      expect(query.where.inStock).toBe(true);
    });

    it('should handle out of stock availability', () => {
      const filters: ProductSearchFilters = {
        availability: 'OUT_OF_STOCK',
      };
      const query = buildProductSearchQuery(filters);

      expect(query.where.inStock).toBe(false);
    });

    it('should handle organic filter', () => {
      const filters: ProductSearchFilters = {
        organic: true,
      };
      const query = buildProductSearchQuery(filters);

      expect(query.where.organic).toBe(true);
    });

    it('should handle seasonal filter', () => {
      const filters: ProductSearchFilters = {
        seasonal: true,
      };
      const query = buildProductSearchQuery(filters);

      expect(query.where.seasonal).toBe(true);
    });

    it('should sort by newest by default', () => {
      const filters: ProductSearchFilters = {};
      const query = buildProductSearchQuery(filters);

      expect(query.orderBy[0]).toEqual({ createdAt: 'desc' });
    });

    it('should sort by price low to high', () => {
      const filters: ProductSearchFilters = {
        sortBy: 'PRICE_LOW_TO_HIGH',
      };
      const query = buildProductSearchQuery(filters);

      expect(query.orderBy[0]).toEqual({ price: 'asc' });
    });

    it('should sort by price high to low', () => {
      const filters: ProductSearchFilters = {
        sortBy: 'PRICE_HIGH_TO_LOW',
      };
      const query = buildProductSearchQuery(filters);

      expect(query.orderBy[0]).toEqual({ price: 'desc' });
    });

    it('should sort by name A-Z', () => {
      const filters: ProductSearchFilters = {
        sortBy: 'NAME_A_Z',
      };
      const query = buildProductSearchQuery(filters);

      expect(query.orderBy[0]).toEqual({ name: 'asc' });
    });

    it('should sort by name Z-A', () => {
      const filters: ProductSearchFilters = {
        sortBy: 'NAME_Z_A',
      };
      const query = buildProductSearchQuery(filters);

      expect(query.orderBy[0]).toEqual({ name: 'desc' });
    });

    it('should handle pagination with page 1', () => {
      const filters: ProductSearchFilters = {
        page: 1,
        limit: 10,
      };
      const query = buildProductSearchQuery(filters);

      expect(query.skip).toBe(0);
      expect(query.take).toBe(10);
    });

    it('should handle pagination with page 2', () => {
      const filters: ProductSearchFilters = {
        page: 2,
        limit: 10,
      };
      const query = buildProductSearchQuery(filters);

      expect(query.skip).toBe(10);
      expect(query.take).toBe(10);
    });

    it('should handle pagination with page 3', () => {
      const filters: ProductSearchFilters = {
        page: 3,
        limit: 20,
      };
      const query = buildProductSearchQuery(filters);

      expect(query.skip).toBe(40);
      expect(query.take).toBe(20);
    });

    it('should include farm and owner data', () => {
      const filters: ProductSearchFilters = {};
      const query = buildProductSearchQuery(filters);

      expect(query.include).toBeDefined();
      expect(query.include!.farm).toBeDefined();
    });

    it('should combine multiple filters', () => {
      const filters: ProductSearchFilters = {
        query: 'organic tomato',
        categoryId: 'cat_vegetables',
        farmId: 'farm_123',
        minPrice: 5,
        maxPrice: 15,
        organic: true,
        seasonal: true,
        availability: 'IN_STOCK',
        sortBy: 'PRICE_LOW_TO_HIGH',
        page: 2,
        limit: 20,
      };
      const query = buildProductSearchQuery(filters);

      expect(query.where.OR).toBeDefined();
      expect(query.where.category).toBe('cat_vegetables');
      expect(query.where.farmId).toBe('farm_123');
      expect(query.where.price!.gte).toBe(5);
      expect(query.where.price!.lte).toBe(15);
      expect(query.where.organic).toBe(true);
      expect(query.where.seasonal).toBe(true);
      expect(query.where.inStock).toBe(true);
      expect(query.orderBy[0]).toEqual({ price: 'asc' });
      expect(query.skip).toBe(20);
      expect(query.take).toBe(20);
    });

    it('should handle empty query string', () => {
      const filters: ProductSearchFilters = {
        query: '   ',
      };
      const query = buildProductSearchQuery(filters);

      expect(query.where.OR).toBeUndefined();
    });
  });

  // ============================================================================
  // calculatePaginationMeta Tests
  // ============================================================================

  describe('calculatePaginationMeta', () => {
    it('should calculate first page meta', () => {
      const meta = calculatePaginationMeta(100, 1, 10);

      expect(meta.currentPage).toBe(1);
      expect(meta.totalPages).toBe(10);
      expect(meta.totalItems).toBe(100);
      expect(meta.itemsPerPage).toBe(10);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPreviousPage).toBe(false);
    });

    it('should calculate middle page meta', () => {
      const meta = calculatePaginationMeta(100, 5, 10);

      expect(meta.currentPage).toBe(5);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPreviousPage).toBe(true);
    });

    it('should calculate last page meta', () => {
      const meta = calculatePaginationMeta(100, 10, 10);

      expect(meta.currentPage).toBe(10);
      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPreviousPage).toBe(true);
    });

    it('should handle single page', () => {
      const meta = calculatePaginationMeta(5, 1, 10);

      expect(meta.totalPages).toBe(1);
      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPreviousPage).toBe(false);
    });

    it('should handle exact page division', () => {
      const meta = calculatePaginationMeta(50, 1, 10);

      expect(meta.totalPages).toBe(5);
    });

    it('should handle partial last page', () => {
      const meta = calculatePaginationMeta(55, 6, 10);

      expect(meta.totalPages).toBe(6);
      expect(meta.hasNextPage).toBe(false);
    });

    it('should handle zero items', () => {
      const meta = calculatePaginationMeta(0, 1, 10);

      expect(meta.totalPages).toBe(0);
      expect(meta.hasNextPage).toBe(false);
    });

    it('should handle large page size', () => {
      const meta = calculatePaginationMeta(10, 1, 100);

      expect(meta.totalPages).toBe(1);
    });
  });

  // ============================================================================
  // getCurrentSeason Tests
  // ============================================================================

  describe('getCurrentSeason', () => {
    it('should return SPRING for March', () => {
      const date = new Date('2024-03-15');
      expect(getCurrentSeason(date)).toBe('SPRING');
    });

    it('should return SPRING for April', () => {
      const date = new Date('2024-04-15');
      expect(getCurrentSeason(date)).toBe('SPRING');
    });

    it('should return SPRING for May', () => {
      const date = new Date('2024-05-15');
      expect(getCurrentSeason(date)).toBe('SPRING');
    });

    it('should return SUMMER for June', () => {
      const date = new Date('2024-06-15');
      expect(getCurrentSeason(date)).toBe('SUMMER');
    });

    it('should return SUMMER for July', () => {
      const date = new Date('2024-07-15');
      expect(getCurrentSeason(date)).toBe('SUMMER');
    });

    it('should return SUMMER for August', () => {
      const date = new Date('2024-08-15');
      expect(getCurrentSeason(date)).toBe('SUMMER');
    });

    it('should return FALL for September', () => {
      const date = new Date('2024-09-15');
      expect(getCurrentSeason(date)).toBe('FALL');
    });

    it('should return FALL for October', () => {
      const date = new Date('2024-10-15');
      expect(getCurrentSeason(date)).toBe('FALL');
    });

    it('should return FALL for November', () => {
      const date = new Date('2024-11-15');
      expect(getCurrentSeason(date)).toBe('FALL');
    });

    it('should return WINTER for December', () => {
      const date = new Date('2024-12-15');
      expect(getCurrentSeason(date)).toBe('WINTER');
    });

    it('should return WINTER for January', () => {
      const date = new Date('2024-01-15');
      expect(getCurrentSeason(date)).toBe('WINTER');
    });

    it('should return WINTER for February', () => {
      const date = new Date('2024-02-15');
      expect(getCurrentSeason(date)).toBe('WINTER');
    });

    it('should use current date by default', () => {
      const season = getCurrentSeason();
      expect(['SPRING', 'SUMMER', 'FALL', 'WINTER']).toContain(season);
    });
  });

  // ============================================================================
  // getSeasonalContext Tests
  // ============================================================================

  describe('getSeasonalContext', () => {
    it('should return SPRING context', () => {
      const context = getSeasonalContext('SPRING');

      expect(context.currentSeason).toBe('SPRING');
      expect(context.recommendedCategories).toContain('Leafy Greens');
      expect(context.seasonalProducts).toContain('lettuce');
      expect(context.seasonalProducts.length).toBeGreaterThan(0);
    });

    it('should return SUMMER context', () => {
      const context = getSeasonalContext('SUMMER');

      expect(context.currentSeason).toBe('SUMMER');
      expect(context.recommendedCategories).toContain('Tomatoes');
      expect(context.seasonalProducts).toContain('tomato');
    });

    it('should return FALL context', () => {
      const context = getSeasonalContext('FALL');

      expect(context.currentSeason).toBe('FALL');
      expect(context.recommendedCategories).toContain('Squash');
      expect(context.seasonalProducts).toContain('pumpkin');
    });

    it('should return WINTER context', () => {
      const context = getSeasonalContext('WINTER');

      expect(context.currentSeason).toBe('WINTER');
      expect(context.recommendedCategories).toContain('Root Vegetables');
      expect(context.seasonalProducts).toContain('kale');
    });

    it('should have valid structure', () => {
      const context = getSeasonalContext('SPRING');

      expect(context).toHaveProperty('currentSeason');
      expect(context).toHaveProperty('recommendedCategories');
      expect(context).toHaveProperty('seasonalProducts');
      expect(Array.isArray(context.recommendedCategories)).toBe(true);
      expect(Array.isArray(context.seasonalProducts)).toBe(true);
    });
  });

  // ============================================================================
  // sanitizeSearchQuery Tests
  // ============================================================================

  describe('sanitizeSearchQuery', () => {
    it('should trim whitespace', () => {
      expect(sanitizeSearchQuery('  hello  ')).toBe('hello');
    });

    it('should remove special characters', () => {
      expect(sanitizeSearchQuery('hello@world!')).toBe('helloworld');
    });

    it('should keep hyphens', () => {
      expect(sanitizeSearchQuery('organic-tomato')).toBe('organic-tomato');
    });

    it('should normalize multiple spaces', () => {
      expect(sanitizeSearchQuery('hello    world')).toBe('hello world');
    });

    it('should limit to 100 characters', () => {
      const longString = 'a'.repeat(150);
      expect(sanitizeSearchQuery(longString).length).toBe(100);
    });

    it('should handle empty string', () => {
      expect(sanitizeSearchQuery('')).toBe('');
    });

    it('should handle only spaces', () => {
      expect(sanitizeSearchQuery('     ')).toBe('');
    });

    it('should handle mixed case', () => {
      expect(sanitizeSearchQuery('HeLLo WoRLd')).toBe('HeLLo WoRLd');
    });

    it('should remove parentheses', () => {
      expect(sanitizeSearchQuery('hello (world)')).toBe('hello world');
    });

    it('should remove brackets', () => {
      expect(sanitizeSearchQuery('hello [world]')).toBe('hello world');
    });

    it('should handle underscores', () => {
      expect(sanitizeSearchQuery('hello_world')).toBe('hello_world');
    });
  });

  // ============================================================================
  // calculateDistance Tests
  // ============================================================================

  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      // New York to Los Angeles (approx 3940 km)
      const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
      expect(distance).toBeGreaterThan(3900);
      expect(distance).toBeLessThan(4000);
    });

    it('should return 0 for same location', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
      expect(distance).toBeCloseTo(0, 2);
    });

    it('should calculate short distances accurately', () => {
      // Two points very close together
      const distance = calculateDistance(40.7128, -74.0060, 40.7130, -74.0062);
      expect(distance).toBeLessThan(0.05);
    });

    it('should handle negative coordinates', () => {
      const distance = calculateDistance(-33.8688, 151.2093, 51.5074, -0.1278);
      expect(distance).toBeGreaterThan(0);
    });

    it('should be symmetric', () => {
      const d1 = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
      const d2 = calculateDistance(34.0522, -118.2437, 40.7128, -74.0060);
      expect(d1).toBeCloseTo(d2, 2);
    });

    it('should handle equator crossing', () => {
      const distance = calculateDistance(10, 0, -10, 0);
      expect(distance).toBeGreaterThan(2200);
      expect(distance).toBeLessThan(2250);
    });

    it('should handle prime meridian crossing', () => {
      const distance = calculateDistance(0, 10, 0, -10);
      expect(distance).toBeGreaterThan(2200);
      expect(distance).toBeLessThan(2250);
    });
  });

  // ============================================================================
  // generateSearchCacheKey Tests
  // ============================================================================

  describe('generateSearchCacheKey', () => {
    it('should generate key from empty filters', () => {
      const key = generateSearchCacheKey({});
      expect(key).toContain('q:');
      expect(key).toContain('page:1');
    });

    it('should include query in key', () => {
      const key = generateSearchCacheKey({ query: 'tomato' });
      expect(key).toContain('q:tomato');
    });

    it('should include category in key', () => {
      const key = generateSearchCacheKey({ categoryId: 'cat_123' });
      expect(key).toContain('cat:cat_123');
    });

    it('should include farm in key', () => {
      const key = generateSearchCacheKey({ farmId: 'farm_123' });
      expect(key).toContain('farm:farm_123');
    });

    it('should include price range in key', () => {
      const key = generateSearchCacheKey({ minPrice: 5, maxPrice: 20 });
      expect(key).toContain('price:5-20');
    });

    it('should include availability in key', () => {
      const key = generateSearchCacheKey({ availability: 'IN_STOCK' });
      expect(key).toContain('avail:IN_STOCK');
    });

    it('should include organic flag in key', () => {
      const key = generateSearchCacheKey({ organic: true });
      expect(key).toContain('org:true');
    });

    it('should include seasonal flag in key', () => {
      const key = generateSearchCacheKey({ seasonal: true });
      expect(key).toContain('seas:true');
    });

    it('should include sort option in key', () => {
      const key = generateSearchCacheKey({ sortBy: 'PRICE_LOW_TO_HIGH' });
      expect(key).toContain('sort:PRICE_LOW_TO_HIGH');
    });

    it('should include page in key', () => {
      const key = generateSearchCacheKey({ page: 3 });
      expect(key).toContain('page:3');
    });

    it('should generate consistent keys for same filters', () => {
      const filters = { query: 'tomato', page: 2, organic: true };
      const key1 = generateSearchCacheKey(filters);
      const key2 = generateSearchCacheKey(filters);
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different filters', () => {
      const key1 = generateSearchCacheKey({ query: 'tomato' });
      const key2 = generateSearchCacheKey({ query: 'potato' });
      expect(key1).not.toBe(key2);
    });
  });

  // ============================================================================
  // debounce Tests
  // ============================================================================

  describe('debounce', () => {
    it('should debounce function calls', (done) => {
      let callCount = 0;
      const fn = () => callCount++;
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      expect(callCount).toBe(0);

      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });

    it('should pass arguments to debounced function', (done) => {
      let receivedArg = '';
      const fn = (arg: string) => { receivedArg = arg; };
      const debounced = debounce(fn, 100);

      debounced('test');

      setTimeout(() => {
        expect(receivedArg).toBe('test');
        done();
      }, 150);
    });

    it('should only call function once after multiple rapid calls', (done) => {
      let callCount = 0;
      const fn = () => callCount++;
      const debounced = debounce(fn, 50);

      debounced();
      setTimeout(() => debounced(), 10);
      setTimeout(() => debounced(), 20);
      setTimeout(() => debounced(), 30);

      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });
  });

  // ============================================================================
  // formatPrice Tests
  // ============================================================================

  describe('formatPrice', () => {
    it('should format integer price', () => {
      const formatted = formatPrice(10);
      expect(formatted).toContain('10');
    });

    it('should format decimal price', () => {
      const formatted = formatPrice(10.99);
      expect(formatted).toContain('10.99');
    });

    it('should format zero', () => {
      const formatted = formatPrice(0);
      expect(formatted).toContain('0');
    });

    it('should handle large numbers', () => {
      const formatted = formatPrice(1234.56);
      expect(formatted).toContain('1,234.56');
    });

    it('should use USD by default', () => {
      const formatted = formatPrice(10);
      expect(formatted).toContain('$');
    });

    it('should handle negative numbers', () => {
      const formatted = formatPrice(-10);
      expect(formatted).toContain('10');
    });
  });

  // ============================================================================
  // parseSearchParams Tests
  // ============================================================================

  describe('parseSearchParams', () => {
    it('should parse query parameter', () => {
      const params = new URLSearchParams('q=tomato');
      const filters = parseSearchParams(params);
      expect(filters.query).toBe('tomato');
    });

    it('should parse category parameter', () => {
      const params = new URLSearchParams('category=cat_123');
      const filters = parseSearchParams(params);
      expect(filters.categoryId).toBe('cat_123');
    });

    it('should parse farm parameter', () => {
      const params = new URLSearchParams('farm=farm_123');
      const filters = parseSearchParams(params);
      expect(filters.farmId).toBe('farm_123');
    });

    it('should parse minPrice parameter', () => {
      const params = new URLSearchParams('minPrice=5');
      const filters = parseSearchParams(params);
      expect(filters.minPrice).toBe(5);
    });

    it('should parse maxPrice parameter', () => {
      const params = new URLSearchParams('maxPrice=20');
      const filters = parseSearchParams(params);
      expect(filters.maxPrice).toBe(20);
    });

    it('should parse availability parameter', () => {
      const params = new URLSearchParams('availability=IN_STOCK');
      const filters = parseSearchParams(params);
      expect(filters.availability).toBe('IN_STOCK');
    });

    it('should parse organic parameter', () => {
      const params = new URLSearchParams('organic=true');
      const filters = parseSearchParams(params);
      expect(filters.organic).toBe(true);
    });

    it('should parse seasonal parameter', () => {
      const params = new URLSearchParams('seasonal=true');
      const filters = parseSearchParams(params);
      expect(filters.seasonal).toBe(true);
    });

    it('should parse sort parameter', () => {
      const params = new URLSearchParams('sort=PRICE_LOW_TO_HIGH');
      const filters = parseSearchParams(params);
      expect(filters.sortBy).toBe('PRICE_LOW_TO_HIGH');
    });

    it('should parse page parameter', () => {
      const params = new URLSearchParams('page=3');
      const filters = parseSearchParams(params);
      expect(filters.page).toBe(3);
    });

    it('should parse limit parameter', () => {
      const params = new URLSearchParams('limit=20');
      const filters = parseSearchParams(params);
      expect(filters.limit).toBe(20);
    });

    it('should parse multiple parameters', () => {
      const params = new URLSearchParams('q=tomato&category=cat_123&page=2&organic=true');
      const filters = parseSearchParams(params);
      expect(filters.query).toBe('tomato');
      expect(filters.categoryId).toBe('cat_123');
      expect(filters.page).toBe(2);
      expect(filters.organic).toBe(true);
    });

    it('should sanitize query parameter', () => {
      const params = new URLSearchParams('q=  tomato@#$  ');
      const filters = parseSearchParams(params);
      expect(filters.query).toBe('tomato');
    });

    it('should return empty object for no parameters', () => {
      const params = new URLSearchParams();
      const filters = parseSearchParams(params);
      expect(Object.keys(filters).length).toBe(0);
    });
  });

  // ============================================================================
  // filtersToSearchParams Tests
  // ============================================================================

  describe('filtersToSearchParams', () => {
    it('should convert query to param', () => {
      const params = filtersToSearchParams({ query: 'tomato' });
      expect(params.get('q')).toBe('tomato');
    });

    it('should convert categoryId to param', () => {
      const params = filtersToSearchParams({ categoryId: 'cat_123' });
      expect(params.get('category')).toBe('cat_123');
    });

    it('should convert farmId to param', () => {
      const params = filtersToSearchParams({ farmId: 'farm_123' });
      expect(params.get('farm')).toBe('farm_123');
    });

    it('should convert minPrice to param', () => {
      const params = filtersToSearchParams({ minPrice: 5 });
      expect(params.get('minPrice')).toBe('5');
    });

    it('should convert maxPrice to param', () => {
      const params = filtersToSearchParams({ maxPrice: 20 });
      expect(params.get('maxPrice')).toBe('20');
    });

    it('should convert availability to param', () => {
      const params = filtersToSearchParams({ availability: 'IN_STOCK' });
      expect(params.get('availability')).toBe('IN_STOCK');
    });

    it('should convert organic to param', () => {
      const params = filtersToSearchParams({ organic: true });
      expect(params.get('organic')).toBe('true');
    });

    it('should convert seasonal to param', () => {
      const params = filtersToSearchParams({ seasonal: true });
      expect(params.get('seasonal')).toBe('true');
    });

    it('should convert sortBy to param', () => {
      const params = filtersToSearchParams({ sortBy: 'PRICE_LOW_TO_HIGH' });
      expect(params.get('sort')).toBe('PRICE_LOW_TO_HIGH');
    });

    it('should convert page to param', () => {
      const params = filtersToSearchParams({ page: 3 });
      expect(params.get('page')).toBe('3');
    });

    it('should convert limit to param', () => {
      const params = filtersToSearchParams({ limit: 20 });
      expect(params.get('limit')).toBe('20');
    });

    it('should convert multiple filters', () => {
      const params = filtersToSearchParams({
        query: 'tomato',
        categoryId: 'cat_123',
        organic: true,
        page: 2,
      });
      expect(params.get('q')).toBe('tomato');
      expect(params.get('category')).toBe('cat_123');
      expect(params.get('organic')).toBe('true');
      expect(params.get('page')).toBe('2');
    });

    it('should skip undefined values', () => {
      const params = filtersToSearchParams({});
      expect(params.toString()).toBe('');
    });

    it('should roundtrip with parseSearchParams', () => {
      const original: ProductSearchFilters = {
        query: 'tomato',
        categoryId: 'cat_123',
        organic: true,
        page: 2,
        limit: 20,
      };
      const params = filtersToSearchParams(original);
      const parsed = parseSearchParams(params);
      expect(parsed.query).toBe(original.query);
      expect(parsed.categoryId).toBe(original.categoryId);
      expect(parsed.organic).toBe(original.organic);
      expect(parsed.page).toBe(original.page);
      expect(parsed.limit).toBe(original.limit);
    });
  });

  // ============================================================================
  // highlightMatches Tests
  // ============================================================================

  describe('highlightMatches', () => {
    it('should wrap matches in mark tags', () => {
      const result = highlightMatches('fresh tomato', 'tomato');
      expect(result).toBe('fresh <mark>tomato</mark>');
    });

    it('should be case insensitive', () => {
      const result = highlightMatches('Fresh Tomato', 'tomato');
      expect(result).toContain('<mark>Tomato</mark>');
    });

    it('should highlight multiple matches', () => {
      const result = highlightMatches('tomato and tomato', 'tomato');
      const matches = result.match(/<mark>/g);
      expect(matches?.length).toBe(2);
    });

    it('should handle no matches', () => {
      const result = highlightMatches('fresh tomato', 'potato');
      expect(result).toBe('fresh tomato');
    });

    it('should handle empty query', () => {
      const result = highlightMatches('fresh tomato', '');
      expect(result).toBe('fresh tomato');
    });

    it('should handle empty text', () => {
      const result = highlightMatches('', 'tomato');
      expect(result).toBe('');
    });

    it('should highlight partial matches', () => {
      const result = highlightMatches('tomatoes', 'tomato');
      expect(result).toContain('<mark>tomato</mark>');
    });
  });

  // ============================================================================
  // getPriceRangePresets Tests
  // ============================================================================

  describe('getPriceRangePresets', () => {
    it('should return array of price ranges', () => {
      const ranges = getPriceRangePresets();
      expect(Array.isArray(ranges)).toBe(true);
      expect(ranges.length).toBeGreaterThan(0);
    });

    it('should include all prices option', () => {
      const ranges = getPriceRangePresets();
      const allPrices = ranges.find(r => r.label === 'All Prices');
      expect(allPrices).toBeDefined();
      expect(allPrices?.min).toBeUndefined();
      expect(allPrices?.max).toBeUndefined();
    });

    it('should include under $5 option', () => {
      const ranges = getPriceRangePresets();
      const under5 = ranges.find(r => r.label === 'Under $5');
      expect(under5?.max).toBe(5);
    });

    it('should include $5-$10 range', () => {
      const ranges = getPriceRangePresets();
      const range = ranges.find(r => r.label === '$5 - $10');
      expect(range?.min).toBe(5);
      expect(range?.max).toBe(10);
    });

    it('should include over $50 option', () => {
      const ranges = getPriceRangePresets();
      const over50 = ranges.find(r => r.label === 'Over $50');
      expect(over50?.min).toBe(50);
      expect(over50?.max).toBeUndefined();
    });

    it('should have label and values for each preset', () => {
      const ranges = getPriceRangePresets();
      ranges.forEach(range => {
        expect(range).toHaveProperty('label');
        expect(typeof range.label).toBe('string');
      });
    });
  });

  // ============================================================================
  // getSortOptions Tests
  // ============================================================================

  describe('getSortOptions', () => {
    it('should return array of sort options', () => {
      const options = getSortOptions();
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
    });

    it('should include newest first option', () => {
      const options = getSortOptions();
      const newest = options.find(o => o.value === 'NEWEST');
      expect(newest).toBeDefined();
      expect(newest?.label).toBeTruthy();
    });

    it('should include price low to high', () => {
      const options = getSortOptions();
      const priceLow = options.find(o => o.value === 'PRICE_LOW_TO_HIGH');
      expect(priceLow).toBeDefined();
    });

    it('should include price high to low', () => {
      const options = getSortOptions();
      const priceHigh = options.find(o => o.value === 'PRICE_HIGH_TO_LOW');
      expect(priceHigh).toBeDefined();
    });

    it('should include name A-Z', () => {
      const options = getSortOptions();
      const nameAZ = options.find(o => o.value === 'NAME_A_Z');
      expect(nameAZ).toBeDefined();
    });

    it('should include name Z-A', () => {
      const options = getSortOptions();
      const nameZA = options.find(o => o.value === 'NAME_Z_A');
      expect(nameZA).toBeDefined();
    });

    it('should include popular option', () => {
      const options = getSortOptions();
      const popular = options.find(o => o.value === 'POPULAR');
      expect(popular).toBeDefined();
    });

    it('should include rating option', () => {
      const options = getSortOptions();
      const rating = options.find(o => o.value === 'RATING');
      expect(rating).toBeDefined();
    });

    it('should have label and value for each option', () => {
      const options = getSortOptions();
      options.forEach(option => {
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('value');
        expect(typeof option.label).toBe('string');
        expect(typeof option.value).toBe('string');
      });
    });
  });
});
