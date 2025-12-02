"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  ProductFilters,
  ProductFilterState,
} from "@/components/marketplace/ProductFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ShoppingCart,
  Star,
  Leaf,
  MapPin,
  TrendingUp,
  Grid3x3,
  List,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * 🛒 ENHANCED PRODUCTS MARKETPLACE - Phase 3
 * Advanced product discovery with filtering, sorting, and search
 * Features:
 * - Sidebar filtering (category, price, location, dietary)
 * - Real-time search and filter updates
 * - Grid/List view toggle
 * - Add to cart functionality
 * - Favorites toggle
 */

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  farmId: string;
  farmName: string;
  farmLocation: string;
  distance: number;
  inStock: boolean;
  quantity: number;
  organic: boolean;
  image: string;
  rating: number;
  reviewCount: number;
  certifications: string[];
  dietary: string[];
}

// Mock data - will be replaced with API calls
const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Organic Heirloom Tomatoes",
    description:
      "Vine-ripened, bursting with flavor. Perfect for salads and sauces.",
    price: 5.99,
    unit: "lb",
    category: "vegetables",
    farmId: "1",
    farmName: "Green Valley Farm",
    farmLocation: "Portland, OR",
    distance: 12,
    inStock: true,
    quantity: 50,
    organic: true,
    image: "/images/products/tomatoes.jpg",
    rating: 4.8,
    reviewCount: 24,
    certifications: ["usda-organic", "non-gmo"],
    dietary: ["organic", "vegan", "gluten-free", "local"],
  },
  {
    id: "2",
    name: "Honeycrisp Apples",
    description: "Crisp, sweet, and juicy. Locally grown heirloom variety.",
    price: 4.99,
    unit: "lb",
    category: "fruits",
    farmId: "2",
    farmName: "Sunny Acres Orchard",
    farmLocation: "Hood River, OR",
    distance: 45,
    inStock: true,
    quantity: 100,
    organic: true,
    image: "/images/products/apples.jpg",
    rating: 4.9,
    reviewCount: 38,
    certifications: ["usda-organic"],
    dietary: ["organic", "vegan", "gluten-free"],
  },
  {
    id: "3",
    name: "Farm Fresh Eggs",
    description: "Free-range eggs from happy chickens. Rich, golden yolks.",
    price: 6.99,
    unit: "dozen",
    category: "eggs",
    farmId: "3",
    farmName: "Happy Hen Farm",
    farmLocation: "Salem, OR",
    distance: 28,
    inStock: true,
    quantity: 30,
    organic: false,
    image: "/images/products/eggs.jpg",
    rating: 4.7,
    reviewCount: 19,
    certifications: ["animal-welfare"],
    dietary: ["gluten-free", "local"],
  },
  {
    id: "4",
    name: "Artisan Sourdough Bread",
    description: "Hand-crafted with organic flour and natural starter.",
    price: 8.99,
    unit: "loaf",
    category: "grains",
    farmId: "4",
    farmName: "Heritage Bakery",
    farmLocation: "Eugene, OR",
    distance: 65,
    inStock: true,
    quantity: 20,
    organic: true,
    image: "/images/products/bread.jpg",
    rating: 5.0,
    reviewCount: 42,
    certifications: ["usda-organic"],
    dietary: ["organic", "vegan"],
  },
  {
    id: "5",
    name: "Raw Honey",
    description:
      "Pure, unfiltered wildflower honey. Never heated or processed.",
    price: 12.99,
    unit: "16oz jar",
    category: "honey",
    farmId: "5",
    farmName: "Bee Happy Apiary",
    farmLocation: "Bend, OR",
    distance: 80,
    inStock: true,
    quantity: 15,
    organic: false,
    image: "/images/products/honey.jpg",
    rating: 4.9,
    reviewCount: 31,
    certifications: [],
    dietary: ["gluten-free", "local"],
  },
  {
    id: "6",
    name: "Grass-Fed Beef (Ground)",
    description: "100% grass-fed and finished. No hormones or antibiotics.",
    price: 9.99,
    unit: "lb",
    category: "meat",
    farmId: "6",
    farmName: "Mountain View Ranch",
    farmLocation: "Pendleton, OR",
    distance: 95,
    inStock: true,
    quantity: 25,
    organic: false,
    image: "/images/products/beef.jpg",
    rating: 4.8,
    reviewCount: 27,
    certifications: ["animal-welfare", "regenerative"],
    dietary: ["gluten-free"],
  },
  {
    id: "7",
    name: "Mixed Salad Greens",
    description: "Fresh-cut blend of lettuce, arugula, and baby spinach.",
    price: 4.49,
    unit: "5oz bag",
    category: "greens",
    farmId: "1",
    farmName: "Green Valley Farm",
    farmLocation: "Portland, OR",
    distance: 12,
    inStock: true,
    quantity: 40,
    organic: true,
    image: "/images/products/greens.jpg",
    rating: 4.6,
    reviewCount: 18,
    certifications: ["usda-organic"],
    dietary: ["organic", "vegan", "gluten-free", "local"],
  },
  {
    id: "8",
    name: "Raw Goat Milk",
    description: "Fresh, unpasteurized goat milk from our small herd.",
    price: 7.99,
    unit: "half gallon",
    category: "dairy",
    farmId: "7",
    farmName: "Clover Creek Dairy",
    farmLocation: "Corvallis, OR",
    distance: 38,
    inStock: true,
    quantity: 12,
    organic: false,
    image: "/images/products/milk.jpg",
    rating: 4.7,
    reviewCount: 15,
    certifications: ["animal-welfare"],
    dietary: ["gluten-free", "local"],
  },
];

export default function ProductsMarketplacePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load initial favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await fetch("/api/users/favorites");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const favoriteIds = new Set<string>(
              data.data
                .filter((fav: any) => fav.productId)
                .map((fav: any) => fav.productId as string),
            );
            setFavorites(favoriteIds);
          }
        }
      } catch (error) {
        console.error("Failed to load favorites:", error);
      }
    };

    loadFavorites();
  }, []);

  // Default filter state
  const [filters, setFilters] = useState<ProductFilterState>({
    categories: [],
    priceRange: [0, 100],
    maxDistance: 100,
    dietary: [],
    inStockOnly: false,
    certifications: [],
    sortBy: "relevance",
    searchQuery: "",
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let results = [...MOCK_PRODUCTS];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.farmName.toLowerCase().includes(query),
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      results = results.filter((p) => filters.categories.includes(p.category));
    }

    // Price range filter
    results = results.filter(
      (p) =>
        p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1],
    );

    // Distance filter
    if (filters.maxDistance < 100) {
      results = results.filter((p) => p.distance <= filters.maxDistance);
    }

    // Dietary filters
    if (filters.dietary.length > 0) {
      results = results.filter((p) =>
        filters.dietary.every((d) => p.dietary.includes(d)),
      );
    }

    // Certification filters
    if (filters.certifications.length > 0) {
      results = results.filter((p) =>
        filters.certifications.some((c) => p.certifications.includes(c)),
      );
    }

    // Stock filter
    if (filters.inStockOnly) {
      results = results.filter((p) => p.inStock);
    }

    // Sorting
    switch (filters.sortBy) {
      case "price-asc":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        results.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        results.sort((a, b) => b.rating - a.rating);
        break;
      case "distance":
        results.sort((a, b) => a.distance - b.distance);
        break;
      case "newest":
        // In real app, would sort by creation date
        break;
      default:
        // relevance - keep current order
        break;
    }

    return results;
  }, [filters]);

  const toggleFavorite = async (productId: string) => {
    const isFavorited = favorites.has(productId);

    // Optimistic update
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (isFavorited) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });

    try {
      if (isFavorited) {
        // Unfavorite - DELETE request
        const response = await fetch(
          `/api/users/favorites?productId=${productId}`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to unfavorite");
        }
      } else {
        // Favorite - POST request
        const response = await fetch("/api/users/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
          throw new Error("Failed to favorite");
        }
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);

      // Rollback on error
      setFavorites((prev) => {
        const newFavorites = new Set(prev);
        if (isFavorited) {
          newFavorites.add(productId);
        } else {
          newFavorites.delete(productId);
        }
        return newFavorites;
      });

      // TODO: Show error toast/notification
      alert("Failed to update favorite. Please try again.");
    }
  };

  const addToCart = (productId: string) => {
    // In real app, would call API to add to cart
    console.log("Added to cart:", productId);
  };

  const resetFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 100],
      maxDistance: 100,
      dietary: [],
      inStockOnly: false,
      certifications: [],
      sortBy: "relevance",
      searchQuery: "",
    });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="hero-gradient py-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,106,37,0.3)_0%,transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(184,56,56,0.3)_0%,transparent_50%)]"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 bg-secondary-600/20 border border-secondary-500/30 text-secondary-200 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-semibold mb-4">
                <Leaf className="h-5 w-5" />
                Local Marketplace
              </span>

              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Discover{" "}
                <span className="text-gradient-warm">Fresh Local Products</span>
              </h1>

              <p className="text-lg text-muted-foreground">
                Browse {MOCK_PRODUCTS.length}+ products from local farms in your
                area
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <div className="w-full lg:w-80 flex-shrink-0">
                <div className="lg:sticky lg:top-4">
                  <ProductFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onReset={resetFilters}
                    productCount={filteredProducts.length}
                  />
                </div>
              </div>

              {/* Products Grid */}
              <div className="flex-1">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Products
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredProducts.length} of{" "}
                      {MOCK_PRODUCTS.length} products
                    </p>
                  </div>

                  {/* View Toggle */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Products Grid/List */}
                {filteredProducts.length > 0 ? (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid md:grid-cols-2 xl:grid-cols-3 gap-6"
                        : "space-y-4"
                    }
                  >
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        viewMode={viewMode}
                        isFavorite={favorites.has(product.id)}
                        onToggleFavorite={() => toggleFavorite(product.id)}
                        onAddToCart={() => addToCart(product.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent mb-6">
                      <TrendingUp className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      No products found
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your filters or search query
                    </p>
                    <Button onClick={resetFilters}>Reset Filters</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// Product Card Component
interface ProductCardProps {
  product: Product;
  viewMode: "grid" | "list";
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
}

function ProductCard({
  product,
  viewMode,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
}: ProductCardProps) {
  if (viewMode === "list") {
    return (
      <div className="glass-card rounded-xl overflow-hidden hover:shadow-glow-lg transition-all group">
        <div className="flex flex-col sm:flex-row">
          {/* Product Image */}
          <div className="relative h-48 sm:h-auto sm:w-48 flex-shrink-0 bg-accent">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="bg-white text-foreground px-4 py-2 rounded-lg font-semibold text-sm">
                  Out of Stock
                </span>
              </div>
            )}
            {product.organic && (
              <Badge className="absolute top-3 left-3 bg-green-600">
                Organic
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Link href={`/products/${product.id}`}>
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary-600 transition-colors mb-1">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{product.farmName}</span>
                  <span>•</span>
                  <span>{product.distance} mi away</span>
                </div>
              </div>
              <button
                onClick={onToggleFavorite}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite
                      ? "fill-red-600 text-red-600"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {product.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-3xl font-bold text-gradient-warm">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    / {product.unit}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-foreground">
                    {product.rating}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount})
                  </span>
                </div>
              </div>

              <Button
                disabled={!product.inStock}
                onClick={onAddToCart}
                className="gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="glass-card rounded-xl overflow-hidden hover:shadow-glow-lg transition-all group">
      {/* Product Image */}
      <div className="relative h-56 bg-accent">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-white text-foreground px-4 py-2 rounded-lg font-semibold text-sm">
              Out of Stock
            </span>
          </div>
        )}
        {product.organic && (
          <Badge className="absolute top-3 left-3 bg-green-600">Organic</Badge>
        )}
        <button
          onClick={onToggleFavorite}
          className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorite ? "fill-red-600 text-red-600" : "text-muted-foreground"
            }`}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-foreground group-hover:text-primary-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-medium">{product.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{product.farmName}</span>
          <span>•</span>
          <span>{product.distance}mi</span>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gradient-warm">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground ml-1">
              / {product.unit}
            </span>
          </div>
          <Button
            size="sm"
            disabled={!product.inStock}
            onClick={onAddToCart}
            className="gap-1.5"
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
