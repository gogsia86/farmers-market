import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import {
  Apple,
  Carrot,
  Egg,
  Leaf,
  Milk,
  TrendingUp,
  Wheat,
} from "lucide-react";
import Link from "next/link";

/**
 * 🗂️ CATEGORIES PAGE - Fall Harvest Theme
 * Browse products by category
 */

const CATEGORIES = [
  {
    id: "fruits",
    name: "Fruits",
    description: "Fresh seasonal fruits and berries",
    icon: Apple,
    productCount: 45,
    image: "/images/categories/fruits.jpg",
    color: "from-red-600 to-orange-600",
    emoji: "🍎",
  },
  {
    id: "vegetables",
    name: "Vegetables",
    description: "Farm-fresh vegetables and greens",
    icon: Carrot,
    productCount: 78,
    image: "/images/categories/vegetables.jpg",
    color: "from-green-600 to-emerald-600",
    emoji: "🥕",
  },
  {
    id: "dairy",
    name: "Dairy",
    description: "Artisan cheeses, milk, and butter",
    icon: Milk,
    productCount: 32,
    image: "/images/categories/dairy.jpg",
    color: "from-blue-600 to-cyan-600",
    emoji: "🧀",
  },
  {
    id: "grains",
    name: "Grains & Flour",
    description: "Heritage grains and fresh-milled flour",
    icon: Wheat,
    productCount: 18,
    image: "/images/categories/grains.jpg",
    color: "from-amber-600 to-yellow-600",
    emoji: "🌾",
  },
  {
    id: "eggs",
    name: "Eggs & Poultry",
    description: "Farm-fresh eggs from free-range chickens",
    icon: Egg,
    productCount: 12,
    image: "/images/categories/eggs.jpg",
    color: "from-orange-600 to-red-600",
    emoji: "🥚",
  },
  {
    id: "greens",
    name: "Greens & Herbs",
    description: "Fresh salad greens and culinary herbs",
    icon: Leaf,
    productCount: 24,
    image: "/images/categories/greens.jpg",
    color: "from-lime-600 to-green-600",
    emoji: "🌿",
  },
];

export default function CategoriesPage() {
  const totalProducts = CATEGORIES.reduce(
    (sum, cat) => sum + cat.productCount,
    0,
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="hero-gradient py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,106,37,0.3)_0%,transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(184,56,56,0.3)_0%,transparent_50%)]"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 bg-secondary-600/20 border border-secondary-500/30 text-secondary-200 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-semibold mb-6">
                <Leaf className="h-5 w-5" />
                Shop by Category
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Browse{" "}
                <span className="text-gradient-warm">Product Categories</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Discover {totalProducts}+ fresh, local products organized by
                category
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                {[
                  {
                    label: "Categories",
                    value: CATEGORIES.length.toString(),
                    icon: "🗂️",
                  },
                  { label: "Products", value: `${totalProducts}+`, icon: "🍎" },
                  { label: "Local Farms", value: "50+", icon: "🌾" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="glass-card p-4 rounded-xl text-center"
                  >
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-2xl font-bold text-gradient-warm">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Link
                      key={category.id}
                      href={`/products?category=${category.id}`}
                      className="group"
                    >
                      <div className="glass-card rounded-2xl overflow-hidden hover:shadow-glow-lg transition-all duration-300 h-full">
                        {/* Category Image/Icon */}
                        <div
                          className={`relative h-48 bg-gradient-to-br ${category.color} overflow-hidden`}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-8xl opacity-50">
                              {category.emoji}
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                            <div className="w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Icon className="h-6 w-6 text-primary-600" />
                            </div>
                          </div>
                        </div>

                        {/* Category Info */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary-600 transition-colors mb-2">
                            {category.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {category.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground">
                              {category.productCount} products
                            </span>
                            <span className="text-sm font-medium text-primary-600 group-hover:text-primary-500 transition-colors">
                              Browse →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Section */}
        <section className="py-16 bg-accent-900/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Can't Find What You're Looking For?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Browse all products or search for something specific
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-xl font-semibold transition-colors shadow-glow"
                >
                  <TrendingUp className="h-5 w-5" />
                  View All Products
                </Link>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 border-2 border-border hover:border-primary-500 px-8 py-4 rounded-xl font-semibold transition-colors"
                >
                  Search Products
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Products by Category */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
                Popular This Season
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    name: "Organic Pumpkins",
                    category: "Vegetables",
                    price: "$8.99",
                    emoji: "🎃",
                  },
                  {
                    name: "Honeycrisp Apples",
                    category: "Fruits",
                    price: "$4.99/lb",
                    emoji: "🍎",
                  },
                  {
                    name: "Fresh Eggs",
                    category: "Eggs & Poultry",
                    price: "$6.99/dozen",
                    emoji: "🥚",
                  },
                ].map((product) => (
                  <Link
                    key={product.name}
                    href="/products"
                    className="glass-card rounded-xl p-6 hover:shadow-glow-lg transition-all group"
                  >
                    <div className="text-5xl mb-4">{product.emoji}</div>
                    <h3 className="font-bold text-foreground group-hover:text-primary-600 transition-colors mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {product.category}
                    </p>
                    <div className="text-lg font-bold text-gradient-warm">
                      {product.price}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
