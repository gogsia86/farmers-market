/**
 * DIVINE PRODUCT TYPES
 * Biodynamic type definitions with seasonal awareness
 */

export interface Product {
  id: string;
  name: string;
  description?: string;
  farmId: string;
  farm?: {
    id: string;
    name: string;
    address: string;
    owner?: {
      id: string;
      name: string;
    };
  };
  category: string;
  price: number;
  unit: string;
  quantity?: number;
  inStock: boolean;
  organic: boolean;
  seasonal: boolean;
  images?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductData {
  name: string;
  description?: string;
  farmId: string;
  category: string;
  price: number;
  unit: string;
  quantity?: number;
  inStock?: boolean;
  organic?: boolean;
  seasonal?: boolean;
  images?: string[];
  tags?: string[];
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  unit?: string;
  quantity?: number;
  inStock?: boolean;
  organic?: boolean;
  seasonal?: boolean;
  images?: string[];
  tags?: string[];
}

export interface ProductFilters {
  farmId?: string;
  category?: string;
  inStock?: boolean;
  organic?: boolean;
  seasonal?: boolean;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductQueryParams extends ProductFilters {
  limit?: number;
  offset?: number;
  sortBy?: "name" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
}
