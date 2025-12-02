import {
  BookOpen,
  ChevronRight,
  CreditCard,
  HelpCircle,
  Mail,
  MessageCircle,
  Package,
  Phone,
  Search,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";

/**
 * 🆘 HELP CENTER PAGE - Fall Harvest Theme
 * Support, FAQ, and contact information
 */

const FAQ_CATEGORIES = [
  {
    title: "Getting Started",
    icon: BookOpen,
    color: "primary",
    questions: [
      {
        q: "How do I create an account?",
        a: "Click the 'Sign Up' button in the top right corner and choose whether you're a customer or farmer. Fill in your details and verify your email to get started.",
      },
      {
        q: "Is the platform free to use?",
        a: "Yes! Browsing and purchasing products is completely free for customers. Farmers pay a small commission on sales to maintain the platform.",
      },
      {
        q: "What areas do you serve?",
        a: "We currently serve the Portland metro area and surrounding regions. Check individual farm listings for their specific delivery/pickup zones.",
      },
    ],
  },
  {
    title: "Shopping & Orders",
    icon: ShoppingCart,
    color: "secondary",
    questions: [
      {
        q: "How does pickup work?",
        a: "After placing your order, you'll schedule a pickup time directly with each farm. You'll receive pickup instructions and location details via email.",
      },
      {
        q: "Can I order from multiple farms at once?",
        a: "Yes! Your cart supports multiple farms. You'll schedule separate pickup times for each farm's products.",
      },
      {
        q: "What if a product is out of stock?",
        a: "Out of stock items are clearly marked. You can add them to your wishlist to be notified when they're available again.",
      },
      {
        q: "How do I track my order?",
        a: "Go to your Dashboard and click 'My Orders' to see all your orders and their current status. You'll also receive email updates.",
      },
    ],
  },
  {
    title: "Payments & Refunds",
    icon: CreditCard,
    color: "accent",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards, debit cards, and digital wallets through our secure Stripe integration.",
      },
      {
        q: "When am I charged?",
        a: "Your card is charged immediately when you place your order to reserve the products with the farm.",
      },
      {
        q: "What's your refund policy?",
        a: "If you're not satisfied with your purchase, contact the farm within 24 hours. Each farm sets their own refund policy, visible on their profile page.",
      },
      {
        q: "Are there any hidden fees?",
        a: "No hidden fees! You'll see the exact total (including tax) before checkout. Some farms may have minimum order requirements.",
      },
    ],
  },
  {
    title: "For Farmers",
    icon: Users,
    color: "primary",
    questions: [
      {
        q: "How do I register my farm?",
        a: "Click 'Become a Farmer Partner' and complete the registration form. We'll review your application and contact you within 2-3 business days.",
      },
      {
        q: "What commission do you charge?",
        a: "We charge a 10% commission on sales. This covers payment processing, platform maintenance, and customer support.",
      },
      {
        q: "How do I manage my products?",
        a: "Once approved, you'll access the Farmer Dashboard where you can add products, update inventory, set prices, and manage orders.",
      },
      {
        q: "When do I receive payments?",
        a: "Payments are transferred to your account weekly, every Monday, for the previous week's confirmed pickups.",
      },
    ],
  },
  {
    title: "Product Quality",
    icon: Package,
    color: "accent",
    questions: [
      {
        q: "Are all products organic?",
        a: "Not all products are certified organic, but we clearly label those that are. All our farms follow sustainable practices.",
      },
      {
        q: "How fresh are the products?",
        a: "Products are harvested fresh and most are available for pickup within 24-48 hours of harvest. Each listing shows harvest/pickup dates.",
      },
      {
        q: "Can I return products I'm not happy with?",
        a: "Yes, if products don't meet quality standards, contact the farm within 24 hours for a refund or replacement.",
      },
    ],
  },
];

const CONTACT_OPTIONS = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help via email",
    contact: "support@farmersmarket.com",
    response: "Response within 24 hours",
    color: "primary",
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Talk to our team",
    contact: "(503) 555-0123",
    response: "Mon-Fri, 9am-5pm PST",
    color: "secondary",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with us now",
    contact: "Start Chat",
    response: "Available 9am-9pm daily",
    color: "accent",
  },
];

export default function HelpPage() {
  return (
<main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="hero-gradient py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,106,37,0.3)_0%,transparent_50%)]"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-3 bg-secondary-600/20 border border-secondary-500/30 text-secondary-200 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-semibold mb-6">
                <HelpCircle className="h-5 w-5" />
                We're Here to Help
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                How Can We <span className="text-gradient-warm">Help You?</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Find answers to common questions or reach out to our support
                team.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-8">
                {FAQ_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div
                      key={category.title}
                      className="glass-card rounded-2xl p-6 md:p-8"
                    >
                      {/* Category Header */}
                      <div className="flex items-center gap-3 mb-6">
                        <div
                          className={`w-12 h-12 bg-${category.color}-100 dark:bg-${category.color}-900/20 rounded-xl flex items-center justify-center`}
                        >
                          <Icon
                            className={`h-6 w-6 text-${category.color}-600`}
                          />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">
                          {category.title}
                        </h2>
                      </div>

                      {/* Questions */}
                      <div className="space-y-4">
                        {category.questions.map((qa, idx) => (
                          <details
                            key={idx}
                            className="group border-2 border-border rounded-xl overflow-hidden hover:border-primary-500/50 transition-colors"
                          >
                            <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                              <span className="font-semibold text-foreground pr-4">
                                {qa.q}
                              </span>
                              <ChevronRight className="h-5 w-5 text-muted-foreground group-open:rotate-90 transition-transform flex-shrink-0" />
                            </summary>
                            <div className="px-4 pb-4 text-muted-foreground border-t border-border pt-4">
                              {qa.a}
                            </div>
                          </details>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-12 bg-accent-900/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-foreground mb-3">
                  Still Need Help?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Our support team is ready to assist you
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {CONTACT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.title}
                      className="glass-card rounded-2xl p-6 text-center hover:shadow-glow-lg transition-all"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {option.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {option.description}
                      </p>
                      <div className="text-lg font-semibold text-gradient-warm mb-2">
                        {option.contact}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {option.response}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="glass-card rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Additional Resources
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link
                    href="/about"
                    className="flex items-center justify-between p-4 border-2 border-border rounded-xl hover:border-primary-500 hover:bg-primary-900/5 transition-all group"
                  >
                    <span className="font-medium text-foreground">
                      About Us
                    </span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="flex items-center justify-between p-4 border-2 border-border rounded-xl hover:border-primary-500 hover:bg-primary-900/5 transition-all group"
                  >
                    <span className="font-medium text-foreground">
                      How It Works
                    </span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    href="/privacy"
                    className="flex items-center justify-between p-4 border-2 border-border rounded-xl hover:border-primary-500 hover:bg-primary-900/5 transition-all group"
                  >
                    <span className="font-medium text-foreground">
                      Privacy Policy
                    </span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    href="/terms"
                    className="flex items-center justify-between p-4 border-2 border-border rounded-xl hover:border-primary-500 hover:bg-primary-900/5 transition-all group"
                  >
                    <span className="font-medium text-foreground">
                      Terms of Service
                    </span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
  );
}
