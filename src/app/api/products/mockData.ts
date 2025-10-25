/**
 * MOCK PRODUCT DATA
 * Temporary mock data for development until database is fully integrated
 */

export interface MockProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image: string;
  category: string;
  farmId: string;
  farmName: string;
  inStock: boolean;
  organic: boolean;
  rating: number;
  reviewCount: number;
}

export function generateMockProducts(count: number = 20): MockProduct[] {
  const categories = [
    "Vegetables",
    "Fruits",
    "Dairy",
    "Meat",
    "Honey",
    "Bakery",
  ];
  const farms = [
    { id: "farm-1", name: "Sunny Valley Farm" },
    { id: "farm-2", name: "Happy Hen Farm" },
    { id: "farm-3", name: "Green Earth Farm" },
    { id: "farm-4", name: "Bee Happy Apiary" },
  ];

  const products: MockProduct[] = [
    {
      id: "1",
      name: "Organic Tomatoes",
      description: "Fresh organic tomatoes grown without pesticides",
      price: 5.99,
      unit: "lb",
      image: "🍅",
      category: "Vegetables",
      farmId: "farm-1",
      farmName: "Sunny Valley Farm",
      inStock: true,
      organic: true,
      rating: 4.8,
      reviewCount: 124,
    },
    {
      id: "2",
      name: "Farm Fresh Eggs",
      description: "Free-range eggs from happy hens",
      price: 6.99,
      unit: "dozen",
      image: "🥚",
      category: "Dairy",
      farmId: "farm-2",
      farmName: "Happy Hen Farm",
      inStock: true,
      organic: true,
      rating: 4.9,
      reviewCount: 89,
    },
    {
      id: "3",
      name: "Local Honey",
      description: "Pure raw honey from local bees",
      price: 12.99,
      unit: "jar",
      image: "🍯",
      category: "Honey",
      farmId: "farm-4",
      farmName: "Bee Happy Apiary",
      inStock: true,
      organic: true,
      rating: 5.0,
      reviewCount: 156,
    },
    {
      id: "4",
      name: "Organic Carrots",
      description: "Crunchy organic carrots perfect for snacking",
      price: 3.99,
      unit: "lb",
      image: "🥕",
      category: "Vegetables",
      farmId: "farm-3",
      farmName: "Green Earth Farm",
      inStock: true,
      organic: true,
      rating: 4.7,
      reviewCount: 67,
    },
  ];

  // Generate more products if needed
  while (products.length < count) {
    const category = categories[products.length % categories.length];
    const farm = farms[products.length % farms.length];

    products.push({
      id: String(products.length + 1),
      name: `${category} Product ${products.length + 1}`,
      description: `Fresh ${category.toLowerCase()} from ${farm.name}`,
      price: Math.random() * 20 + 2,
      unit: category === "Dairy" ? "unit" : "lb",
      image: "🌾",
      category,
      farmId: farm.id,
      farmName: farm.name,
      inStock: Math.random() > 0.2,
      organic: Math.random() > 0.3,
      rating: 4 + Math.random(),
      reviewCount: Math.floor(Math.random() * 200),
    });
  }

  return products;
}

export function getMockProductById(id: string): MockProduct | undefined {
  return generateMockProducts().find((p) => p.id === id);
}

export function getMockProductsByCategory(category: string): MockProduct[] {
  return generateMockProducts().filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );
}

export function getMockProductsByFarm(farmId: string): MockProduct[] {
  return generateMockProducts().filter((p) => p.farmId === farmId);
}
