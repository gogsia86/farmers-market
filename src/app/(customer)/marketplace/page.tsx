/**
 * Marketplace Page
 *
 * Main marketplace hub showing featured products and farms
 *
 * @route /marketplace
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { database } from '@/lib/database';
import Link from 'next/link';
import { Suspense } from 'react';

// ============================================================================
// SERVER COMPONENTS
// ============================================================================

async function getFeaturedProducts() {
  try {
    const products = await database.product.findMany({
      where: {
        status: 'ACTIVE',
        stock: { gt: 0 },
      },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          take: 1,
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 8,
    });

    return products;
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    return [];
  }
}

async function getFeaturedFarms() {
  try {
    const farms = await database.farm.findMany({
      where: {
        status: 'ACTIVE',
        verified: true,
      },
      include: {
        _count: {
          select: {
            products: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 6,
    });

    return farms;
  } catch (error) {
    console.error('Failed to fetch featured farms:', error);
    return [];
  }
}

async function getMarketplaceStats() {
  try {
    const [productCount, farmCount] = await Promise.all([
      database.product.count({
        where: { status: 'ACTIVE', stock: { gt: 0 } },
      }),
      database.farm.count({
        where: { status: 'ACTIVE', verified: true },
      }),
    ]);

    return { productCount, farmCount };
  } catch (error) {
    console.error('Failed to fetch marketplace stats:', error);
    return { productCount: 0, farmCount: 0 };
  }
}

// ============================================================================
// LOADING COMPONENTS
// ============================================================================

function ProductCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-48 w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
}

function FarmCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-32 w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// DISPLAY COMPONENTS
// ============================================================================

async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products available at the moment.</p>
        <p className="text-sm text-muted-foreground mt-2">Check back soon for fresh produce!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.slug}`}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              {product.images[0] ? (
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-48 bg-muted flex items-center justify-center rounded-t-lg">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-4">
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                {product.farm?.name}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  ${product.price.toFixed(2)}
                  {product.unit && <span className="text-sm font-normal">/{product.unit}</span>}
                </span>
                {product.stock > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {product.stock} in stock
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

async function FeaturedFarms() {
  const farms = await getFeaturedFarms();

  if (farms.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No farms available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {farms.map((farm) => (
        <Link key={farm.id} href={`/farms/${farm.slug}`}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              {farm.logo ? (
                <img
                  src={farm.logo}
                  alt={farm.name}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-32 bg-muted flex items-center justify-center rounded-t-lg">
                  <span className="text-4xl">🌾</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-4">
              <h3 className="font-semibold text-lg mb-1">{farm.name}</h3>
              {farm.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {farm.description}
                </p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {farm._count.products} product{farm._count.products !== 1 ? 's' : ''}
                </span>
                {farm.verified && (
                  <span className="text-green-600 font-medium">✓ Verified</span>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

async function MarketplaceStats() {
  const stats = await getMarketplaceStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center">
            {stats.productCount}
          </CardTitle>
          <CardDescription className="text-center">
            Fresh Products Available
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center">
            {stats.farmCount}
          </CardTitle>
          <CardDescription className="text-center">
            Local Farms Connected
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default async function MarketplacePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          🌾 Farmers Market Platform
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
          Discover fresh, locally-grown produce directly from farmers in your area
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/marketplace/products">Browse All Products</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/marketplace/farms">Explore Farms</Link>
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <Suspense fallback={<div className="h-32" />}>
        <MarketplaceStats />
      </Suspense>

      {/* Featured Products Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
            <p className="text-muted-foreground">
              Handpicked fresh produce from our verified farmers
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/marketplace/products">View All →</Link>
          </Button>
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <FeaturedProducts />
        </Suspense>
      </section>

      {/* Featured Farms Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Farms</h2>
            <p className="text-muted-foreground">
              Meet the local farmers bringing fresh food to your table
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/marketplace/farms">View All →</Link>
          </Button>
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <FarmCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <FeaturedFarms />
        </Suspense>
      </section>

      {/* CTA Section */}
      <section className="mt-16 text-center py-12 bg-muted rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Are You a Farmer?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Join our community of local farmers and start selling your fresh produce directly to customers
        </p>
        <Button asChild size="lg">
          <Link href="/register?role=farmer">Register Your Farm</Link>
        </Button>
      </section>
    </div>
  );
}

// ============================================================================
// METADATA
// ============================================================================

export const metadata = {
  title: 'Marketplace | Farmers Market Platform',
  description: 'Discover fresh, locally-grown produce directly from farmers in your area',
};

export const revalidate = 300; // Revalidate every 5 minutes
