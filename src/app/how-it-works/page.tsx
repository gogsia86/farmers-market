import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Leaf,
  Package,
  Search,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

/**
 * 📖 HOW IT WORKS PAGE - Fall Harvest Theme
 * Explain the platform for customers and farmers
 */

const CUSTOMER_STEPS = [
  {
    number: "1",
    title: "Browse Local Farms & Products",
    description:
      "Discover farms and fresh products in your area. Filter by organic, seasonal, or product type.",
    icon: Search,
    color: "primary",
  },
  {
    number: "2",
    title: "Add to Cart & Checkout",
    description:
      "Select products from multiple farms, add to cart, and complete your order securely online.",
    icon: ShoppingCart,
    color: "secondary",
  },
  {
    number: "3",
    title: "Schedule Pickup",
    description:
      "Choose convenient pickup times directly with each farm. Get directions and instructions via email.",
    icon: Calendar,
    color: "accent",
  },
  {
    number: "4",
    title: "Enjoy Fresh Local Food",
    description:
      "Pick up your order and enjoy farm-fresh quality. Leave reviews to support your favorite farmers.",
    icon: CheckCircle,
    color: "primary",
  },
];

const FARMER_STEPS = [
  {
    number: "1",
    title: "Register Your Farm",
    description:
      "Complete a simple registration form with your farm details, location, and certifications.",
    icon: Leaf,
    color: "accent",
  },
  {
    number: "2",
    title: "List Your Products",
    description:
      "Add products with photos, descriptions, and pricing. Update inventory in real-time from your dashboard.",
    icon: Package,
    color: "secondary",
  },
  {
    number: "3",
    title: "Receive Orders",
    description:
      "Get instant notifications when customers order. Manage orders and coordinate pickup times easily.",
    icon: Users,
    color: "primary",
  },
  {
    number: "4",
    title: "Grow Your Business",
    description:
      "Receive weekly payments, track analytics, and build relationships with loyal local customers.",
    icon: TrendingUp,
    color: "accent",
  },
];

const BENEFITS_CUSTOMERS = [
  {
    title: "Fresh & Seasonal",
    description: "Products harvested at peak freshness",
    emoji: "🌱",
  },
  {
    title: "Support Local",
    description: "Money goes directly to local farmers",
    emoji: "🤝",
  },
  {
    title: "Know Your Food",
    description: "See exactly where your food comes from",
    emoji: "📍",
  },
  {
    title: "No Middlemen",
    description: "Fair prices without retail markups",
    emoji: "💰",
  },
];

const BENEFITS_FARMERS = [
  {
    title: "Direct Sales",
    description: "Sell directly to customers without distributors",
    emoji: "🎯",
  },
  {
    title: "Fair Pricing",
    description: "You set prices and keep more profit",
    emoji: "💵",
  },
  {
    title: "Marketing Support",
    description: "We handle customer discovery and promotion",
    emoji: "📢",
  },
  {
    title: "Weekly Payouts",
    description: "Reliable payments every Monday",
    emoji: "📅",
  },
];

export default function HowItWorksPage() {
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
                Simple, Fresh, Local
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                How <span className="text-gradient-warm">It Works</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground">
                Connecting local farmers with conscious consumers for fresh,
                seasonal produce and artisan goods.
              </p>
            </div>
          </div>
        </section>

        {/* For Customers Section */}
        <section className="py-16 bg-accent-900/5">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  For Customers
                </h2>
                <p className="text-lg text-muted-foreground">
                  Four simple steps to fresh, local food
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {CUSTOMER_STEPS.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.number}
                      className="glass-card rounded-2xl p-6 text-center hover:shadow-glow-lg transition-all relative"
                    >
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-glow">
                        {step.number}
                      </div>
                      <div className="mt-6 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl flex items-center justify-center mx-auto">
                          <Icon className="h-8 w-8 text-primary-600" />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-3">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Customer Benefits */}
              <div className="glass-card rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                  Why Shop With Us?
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {BENEFITS_CUSTOMERS.map((benefit) => (
                    <div key={benefit.title} className="text-center">
                      <div className="text-4xl mb-3">{benefit.emoji}</div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-xl font-semibold transition-colors shadow-glow"
                  >
                    Start Shopping
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Farmers Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  For Farmers
                </h2>
                <p className="text-lg text-muted-foreground">
                  Grow your farm business online in four easy steps
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {FARMER_STEPS.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.number}
                      className="glass-card rounded-2xl p-6 text-center hover:shadow-glow-lg transition-all relative"
                    >
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-accent-600 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-glow">
                        {step.number}
                      </div>
                      <div className="mt-6 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent-100 to-primary-100 dark:from-accent-900/20 dark:to-primary-900/20 rounded-2xl flex items-center justify-center mx-auto">
                          <Icon className="h-8 w-8 text-accent-600" />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-3">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Farmer Benefits */}
              <div className="glass-card rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                  Why Join Our Platform?
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {BENEFITS_FARMERS.map((benefit) => (
                    <div key={benefit.title} className="text-center">
                      <div className="text-4xl mb-3">{benefit.emoji}</div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Link
                    href="/register-farm"
                    className="inline-flex items-center gap-2 bg-accent-600 hover:bg-accent-500 text-white px-8 py-4 rounded-xl font-semibold transition-colors shadow-glow"
                  >
                    Register Your Farm
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 bg-accent-900/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Simple, Transparent Pricing
                </h2>
                <p className="text-lg text-muted-foreground">
                  No hidden fees, just honest pricing
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Customer Pricing */}
                <div className="glass-card rounded-2xl p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="h-8 w-8 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      For Customers
                    </h3>
                    <div className="text-4xl font-bold text-gradient-warm mb-2">
                      Free
                    </div>
                    <p className="text-muted-foreground">Forever</p>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "No membership fees",
                      "No markup on products",
                      "Secure online payments",
                      "Direct farm pricing",
                      "Order tracking",
                      "Customer support",
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-accent-600 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Farmer Pricing */}
                <div className="glass-card rounded-2xl p-8 border-2 border-accent-500/50">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-accent-100 dark:bg-accent-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Leaf className="h-8 w-8 text-accent-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      For Farmers
                    </h3>
                    <div className="text-4xl font-bold text-gradient-warm mb-2">
                      10%
                    </div>
                    <p className="text-muted-foreground">Commission on sales</p>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Free farm registration",
                      "Unlimited product listings",
                      "Farmer dashboard access",
                      "Weekly payouts",
                      "Marketing support",
                      "Customer support",
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-accent-600 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto glass-card rounded-2xl p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join our community of farmers and customers supporting local
                agriculture
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-xl font-semibold transition-colors shadow-glow"
                >
                  Start Shopping
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/register-farm"
                  className="inline-flex items-center gap-2 bg-accent-600 hover:bg-accent-500 text-white px-8 py-4 rounded-xl font-semibold transition-colors shadow-glow"
                >
                  Register Your Farm
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
