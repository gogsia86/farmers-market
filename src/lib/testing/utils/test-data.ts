/**
 * 🧪 Test Data Generator
 * Unified Bot Framework - Dynamic Test Data Generation
 *
 * Generates realistic test data for all testing scenarios
 */

import type { TestData } from '../types';

// ============================================================================
// TEST DATA GENERATOR
// ============================================================================

export class TestDataGenerator {
  private timestamp: number;

  constructor() {
    this.timestamp = Date.now();
  }

  /**
   * Generate complete test data set
   */
  generate(options?: {
    includeAdmin?: boolean;
    includeFarmer?: boolean;
    includeCustomer?: boolean;
    includeProduct?: boolean;
    includePayment?: boolean;
  }): TestData {
    const data: TestData = {
      timestamp: this.timestamp,
    };

    if (options?.includeAdmin !== false) {
      data.admin = this.generateAdmin();
    }

    if (options?.includeFarmer !== false) {
      data.farmer = this.generateFarmer();
    }

    if (options?.includeCustomer !== false) {
      data.customer = this.generateCustomer();
    }

    if (options?.includeProduct !== false) {
      data.product = this.generateProduct();
    }

    if (options?.includePayment !== false) {
      data.payment = this.generatePayment();
    }

    return data;
  }

  /**
   * Generate admin user data
   */
  generateAdmin(): TestData['admin'] {
    return {
      email: process.env.ADMIN_EMAIL || 'admin@farmersmarket.app',
      password: process.env.ADMIN_PASSWORD || process.env.TEST_USER_PASSWORD || 'DivineAdmin123!',
    };
  }

  /**
   * Generate farmer user data
   */
  generateFarmer(): TestData['farmer'] {
    const timestamp = this.timestamp;
    const firstName = this.getRandomFirstName();
    const lastName = this.getRandomLastName();

    return {
      email: `farmer.${timestamp}@farmersmarket.test`,
      password: process.env.TEST_USER_PASSWORD || 'FarmerTest123!@#',
      firstName,
      lastName,
      phone: this.generatePhoneNumber(),
      farm: {
        name: `${firstName}'s ${this.getRandomFarmType()} Farm`,
        description: this.generateFarmDescription(),
        address: `${this.getRandomNumber(100, 9999)} ${this.getRandomStreetName()}`,
        city: this.getRandomCity(),
        state: this.getRandomState(),
        zipCode: this.generateZipCode(),
      },
    };
  }

  /**
   * Generate customer user data
   */
  generateCustomer(): TestData['customer'] {
    const timestamp = this.timestamp;
    const firstName = this.getRandomFirstName();
    const lastName = this.getRandomLastName();

    return {
      email: `customer.${timestamp}@farmersmarket.test`,
      password: process.env.TEST_USER_PASSWORD || 'CustomerTest123!@#',
      firstName,
      lastName,
      phone: this.generatePhoneNumber(),
      address: `${this.getRandomNumber(100, 9999)} ${this.getRandomStreetName()}, ${this.getRandomCity()}, ${this.getRandomState()} ${this.generateZipCode()}`,
    };
  }

  /**
   * Generate product data
   */
  generateProduct(): TestData['product'] {
    const productType = this.getRandomProductType();

    return {
      name: productType.name,
      description: productType.description,
      category: productType.category,
      price: this.generatePrice(productType.priceRange),
      stock: this.generateStock(),
      unit: productType.unit,
      organic: Math.random() > 0.5,
    };
  }

  /**
   * Generate payment data (Stripe test card)
   */
  generatePayment(): TestData['payment'] {
    return {
      cardNumber: '4242424242424242', // Stripe test card
      expiry: '12/34',
      cvc: '123',
      zipCode: this.generateZipCode(),
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private getRandomFirstName(): string {
    const names = [
      'James',
      'Mary',
      'John',
      'Patricia',
      'Robert',
      'Jennifer',
      'Michael',
      'Linda',
      'William',
      'Elizabeth',
      'David',
      'Barbara',
      'Richard',
      'Susan',
      'Joseph',
      'Jessica',
      'Thomas',
      'Sarah',
      'Charles',
      'Karen',
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  private getRandomLastName(): string {
    const names = [
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Jones',
      'Garcia',
      'Miller',
      'Davis',
      'Rodriguez',
      'Martinez',
      'Hernandez',
      'Lopez',
      'Gonzalez',
      'Wilson',
      'Anderson',
      'Thomas',
      'Taylor',
      'Moore',
      'Jackson',
      'Martin',
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  private getRandomFarmType(): string {
    const types = [
      'Organic',
      'Heritage',
      'Valley',
      'Sunrise',
      'Green',
      'Harvest',
      'Golden',
      'Fresh',
      'Mountain',
      'River',
      'Meadow',
      'Hillside',
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getRandomStreetName(): string {
    const streets = [
      'Farm Road',
      'Valley Lane',
      'Harvest Way',
      'Country Drive',
      'Green Street',
      'Maple Avenue',
      'Oak Boulevard',
      'Pine Street',
      'River Road',
      'Meadow Lane',
    ];
    return streets[Math.floor(Math.random() * streets.length)];
  }

  private getRandomCity(): string {
    const cities = [
      'Portland',
      'Eugene',
      'Salem',
      'Bend',
      'Medford',
      'Corvallis',
      'Springfield',
      'Albany',
      'Hillsboro',
      'Beaverton',
    ];
    return cities[Math.floor(Math.random() * cities.length)];
  }

  private getRandomState(): string {
    return 'OR'; // Oregon - can expand to other states if needed
  }

  private generateZipCode(): string {
    return `97${this.getRandomNumber(100, 999)}`;
  }

  private generatePhoneNumber(): string {
    const area = this.getRandomNumber(200, 999);
    const prefix = this.getRandomNumber(200, 999);
    const line = this.getRandomNumber(1000, 9999);
    return `+1${area}${prefix}${line}`;
  }

  private generateFarmDescription(): string {
    const descriptions = [
      'A family-owned organic farm practicing sustainable agriculture and biodynamic farming methods.',
      'Specializing in fresh, locally-grown produce using traditional farming techniques.',
      'Certified organic farm committed to environmental stewardship and community health.',
      'Heritage farm growing heirloom varieties and practicing regenerative agriculture.',
      'Small-scale sustainable farm dedicated to providing the freshest seasonal produce.',
      'Biodynamic farm focusing on soil health and biodiversity for superior produce quality.',
      'Organic farm with a passion for growing nutritious food in harmony with nature.',
      'Family farm committed to sustainable practices and connecting community with fresh food.',
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private getRandomProductType(): {
    name: string;
    description: string;
    category: string;
    unit: string;
    priceRange: { min: number; max: number };
  } {
    const products = [
      {
        name: 'Fresh Organic Tomatoes',
        description:
          'Vine-ripened organic tomatoes bursting with flavor. Perfect for salads, sauces, and fresh eating.',
        category: 'VEGETABLES',
        unit: 'LB',
        priceRange: { min: 3.99, max: 7.99 },
      },
      {
        name: 'Crisp Lettuce Mix',
        description:
          'Mixed greens including romaine, butterhead, and red leaf lettuce. Harvested fresh daily.',
        category: 'VEGETABLES',
        unit: 'BAG',
        priceRange: { min: 3.99, max: 6.99 },
      },
      {
        name: 'Sweet Strawberries',
        description:
          'Juicy, sweet strawberries picked at peak ripeness. Grown without pesticides.',
        category: 'FRUITS',
        unit: 'PINT',
        priceRange: { min: 5.99, max: 9.99 },
      },
      {
        name: 'Farm Fresh Eggs',
        description:
          'Free-range chicken eggs from our happy hens. Rich, golden yolks and superior taste.',
        category: 'EGGS',
        unit: 'DOZEN',
        priceRange: { min: 6.99, max: 9.99 },
      },
      {
        name: 'Crispy Carrots',
        description:
          'Sweet, crunchy carrots perfect for snacking, roasting, or juicing. Grown in rich, organic soil.',
        category: 'VEGETABLES',
        unit: 'LB',
        priceRange: { min: 2.99, max: 5.99 },
      },
      {
        name: 'Sweet Bell Peppers',
        description:
          'Colorful mix of red, yellow, and orange bell peppers. Sweet and crunchy.',
        category: 'VEGETABLES',
        unit: 'LB',
        priceRange: { min: 4.99, max: 7.99 },
      },
      {
        name: 'Fresh Spinach',
        description:
          'Tender baby spinach leaves packed with nutrients. Perfect for salads and cooking.',
        category: 'VEGETABLES',
        unit: 'BAG',
        priceRange: { min: 3.99, max: 5.99 },
      },
      {
        name: 'Ripe Avocados',
        description:
          'Creamy, buttery avocados perfect for guacamole, toast, or salads.',
        category: 'FRUITS',
        unit: 'EACH',
        priceRange: { min: 1.99, max: 3.99 },
      },
      {
        name: 'Sweet Corn',
        description:
          'Fresh-picked sweet corn with tender kernels. Excellent grilled or boiled.',
        category: 'VEGETABLES',
        unit: 'EACH',
        priceRange: { min: 0.99, max: 2.99 },
      },
      {
        name: 'Organic Blueberries',
        description:
          'Plump, sweet blueberries bursting with antioxidants. Perfect for snacking or baking.',
        category: 'FRUITS',
        unit: 'PINT',
        priceRange: { min: 6.99, max: 12.99 },
      },
      {
        name: 'Fresh Herbs Bundle',
        description:
          'Mixed fresh herbs including basil, parsley, cilantro, and thyme.',
        category: 'HERBS',
        unit: 'BUNCH',
        priceRange: { min: 2.99, max: 4.99 },
      },
      {
        name: 'Heirloom Potatoes',
        description:
          'Colorful mix of heritage potato varieties with unique flavors and textures.',
        category: 'VEGETABLES',
        unit: 'LB',
        priceRange: { min: 3.99, max: 6.99 },
      },
    ];

    return products[Math.floor(Math.random() * products.length)];
  }

  private generatePrice(range: { min: number; max: number }): string {
    const price = Math.random() * (range.max - range.min) + range.min;
    return price.toFixed(2);
  }

  private generateStock(): string {
    const stock = this.getRandomNumber(50, 500);
    return stock.toString();
  }

  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

// ============================================================================
// SEEDED DATA ACCESS
// ============================================================================

/**
 * Get seeded admin credentials
 */
export function getSeededAdmin(): { email: string; password: string } {
  return {
    email: process.env.ADMIN_EMAIL || 'admin@farmersmarket.app',
    password: process.env.ADMIN_PASSWORD || process.env.TEST_USER_PASSWORD || 'DivineAdmin123!',
  };
}

/**
 * Get seeded farmer credentials
 */
export function getSeededFarmer(): { email: string; password: string } {
  return {
    email: 'farmer.existing@farmersmarket.test',
    password: process.env.TEST_USER_PASSWORD || 'FarmerTest123!@#',
  };
}

/**
 * Get seeded pending farmer credentials
 */
export function getSeededPendingFarmer(): { email: string; password: string } {
  return {
    email: 'farmer.pending@farmersmarket.test',
    password: process.env.TEST_USER_PASSWORD || 'PendingFarmer123!@#',
  };
}

/**
 * Get Stripe test card data
 */
export function getStripeTestCard(): {
  number: string;
  expiry: string;
  cvc: string;
  zip: string;
} {
  return {
    number: '4242424242424242',
    expiry: '12/34',
    cvc: '123',
    zip: '97201',
  };
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new test data generator
 */
export function createTestDataGenerator(): TestDataGenerator {
  return new TestDataGenerator();
}

/**
 * Generate a complete test data set
 */
export function generateTestData(options?: {
  includeAdmin?: boolean;
  includeFarmer?: boolean;
  includeCustomer?: boolean;
  includeProduct?: boolean;
  includePayment?: boolean;
}): TestData {
  const generator = new TestDataGenerator();
  return generator.generate(options);
}

/**
 * Generate multiple product datasets
 */
export function generateMultipleProducts(count: number): TestData['product'][] {
  const generator = new TestDataGenerator();
  const products: TestData['product'][] = [];

  for (let i = 0; i < count; i++) {
    products.push(generator.generateProduct());
  }

  return products;
}
