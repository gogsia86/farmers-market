/**
 * Categories API Route
 *
 * Provides product categories for the Farmers Market Platform
 *
 * @route GET /api/categories
 */

import { ProductCategory } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// TYPES
// ============================================================================

interface CategoryInfo {
  id: string;
  name: string;
  value: ProductCategory;
  description: string;
  icon?: string;
}

interface CategoriesResponse {
  success: boolean;
  data?: {
    categories: CategoryInfo[];
    total: number;
  };
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    timestamp: string;
  };
}

// ============================================================================
// CATEGORY DEFINITIONS
// ============================================================================

const CATEGORIES: CategoryInfo[] = [
  {
    id: 'vegetables',
    name: 'Vegetables',
    value: 'VEGETABLES',
    description: 'Fresh vegetables from local farms',
    icon: '🥬',
  },
  {
    id: 'fruits',
    name: 'Fruits',
    value: 'FRUITS',
    description: 'Seasonal fruits and berries',
    icon: '🍎',
  },
  {
    id: 'pantry',
    name: 'Pantry',
    value: 'PANTRY',
    description: 'Whole grains, cereals, and pantry staples',
    icon: '🌾',
  },
  {
    id: 'dairy',
    name: 'Dairy',
    value: 'DAIRY',
    description: 'Fresh dairy products',
    icon: '🥛',
  },
  {
    id: 'meat',
    name: 'Meat',
    value: 'MEAT',
    description: 'Grass-fed and pasture-raised meat',
    icon: '🥩',
  },
  {
    id: 'eggs',
    name: 'Eggs',
    value: 'EGGS',
    description: 'Farm-fresh eggs',
    icon: '🥚',
  },
  {
    id: 'prepared-foods',
    name: 'Prepared Foods',
    value: 'PREPARED_FOODS',
    description: 'Honey, jams, pickles, and preserves',
    icon: '🍯',
  },
  {
    id: 'baked-goods',
    name: 'Baked Goods',
    value: 'BAKED_GOODS',
    description: 'Breads, pastries, and baked items',
    icon: '🥖',
  },
  {
    id: 'vegetables-herbs',
    name: 'Herbs & Spices',
    value: 'VEGETABLES',
    description: 'Fresh herbs and spices',
    icon: '🌿',
  },
  {
    id: 'poultry',
    name: 'Poultry',
    value: 'POULTRY',
    description: 'Farm-raised poultry',
    icon: '🐔',
  },
  {
    id: 'seafood',
    name: 'Seafood',
    value: 'SEAFOOD',
    description: 'Fresh seafood',
    icon: '🐟',
  },
  {
    id: 'beverages',
    name: 'Beverages',
    value: 'BEVERAGES',
    description: 'Farm-fresh beverages',
    icon: '🥤',
  },
  {
    id: 'flowers',
    name: 'Flowers',
    value: 'FLOWERS',
    description: 'Fresh flowers and plants',
    icon: '🌸',
  },
  {
    id: 'other',
    name: 'Other',
    value: 'OTHER',
    description: 'Other farm products',
    icon: '🛒',
  },
];

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * GET /api/categories - Get all product categories
 */
export async function GET(request: NextRequest): Promise<NextResponse<CategoriesResponse>> {
  try {
    return NextResponse.json({
      success: true,
      data: {
        categories: CATEGORIES,
        total: CATEGORIES.length,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch categories',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// EXPORT ROUTE CONFIG
// ============================================================================

export const runtime = 'edge';
export const dynamic = 'force-static';
export const revalidate = 3600; // Cache for 1 hour
