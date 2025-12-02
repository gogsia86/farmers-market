import {
  BookOpen,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Users,
} from "lucide-react";
import Link from "next/link";

/**
 * 🛟 FARMER SUPPORT PAGE - Fall Harvest Theme
 * Dedicated support portal for farmers
 */

export default function SupportPage() {
  return (
<main className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 bg-accent-600/20 border border-accent-500/30 text-accent-200 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-semibold mb-4">
                <HelpCircle className="h-5 w-5" />
                Farmer Support
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                We're Here to Help
              </h1>
              <p className="text-lg text-muted-foreground">
                Get the support you need to succeed on our platform
              </p>
            </div>

            {/* Contact Options */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="font-bold text-foreground mb-2">
                  Email Support
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get detailed help via email
                </p>
                <p className="text-sm font-medium text-primary-600 mb-2">
                  farmer-support@farmersmarket.com
                </p>
                <p className="text-xs text-muted-foreground">
                  Response within 24 hours
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-secondary-600" />
                </div>
                <h3 className="font-bold text-foreground mb-2">
                  Phone Support
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Talk to a real person
                </p>
                <p className="text-sm font-medium text-primary-600 mb-2">
                  (503) 555-FARM (3276)
                </p>
                <p className="text-xs text-muted-foreground">
                  Mon-Fri: 8am - 6pm PST
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-accent-100 dark:bg-accent-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-accent-600" />
                </div>
                <h3 className="font-bold text-foreground mb-2">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Instant help available
                </p>
                <button className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors">
                  Start Chat
                </button>
                <p className="text-xs text-muted-foreground mt-2">
                  Available 9am - 9pm daily
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="glass-card rounded-2xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Send Us a Message
              </h2>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="supportName"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Your Name *
                    </label>
                    <input
                      id="supportName"
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="supportFarmName"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Farm Name *
                    </label>
                    <input
                      id="supportFarmName"
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                      placeholder="Green Valley Farm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="supportEmail"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    id="supportEmail"
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                    placeholder="farmer@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="support-subject"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Subject *
                  </label>
                  <select
                    id="support-subject"
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                    aria-label="Support subject"
                  >
                    <option value="">Select a topic</option>
                    <option value="account">Account Issues</option>
                    <option value="orders">Order Management</option>
                    <option value="products">Product Listings</option>
                    <option value="payments">Payments & Payouts</option>
                    <option value="technical">Technical Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="supportMessage"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="supportMessage"
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all resize-none"
                    placeholder="Please describe your issue or question in detail..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold transition-colors shadow-glow flex items-center justify-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-2 gap-6">
              <Link
                href="/resources"
                className="glass-card rounded-xl p-6 hover:shadow-glow-lg transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2 group-hover:text-primary-600 transition-colors">
                      Farmer Resources
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Access guides, tools, and educational materials
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/help"
                className="glass-card rounded-xl p-6 hover:shadow-glow-lg transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <HelpCircle className="h-6 w-6 text-secondary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2 group-hover:text-primary-600 transition-colors">
                      Help Center
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Browse frequently asked questions and answers
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/farmer/dashboard"
                className="glass-card rounded-xl p-6 hover:shadow-glow-lg transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-accent-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2 group-hover:text-primary-600 transition-colors">
                      Farmer Dashboard
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your farm, products, and orders
                    </p>
                  </div>
                </div>
              </Link>

              <div className="glass-card rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2">
                      Community Forum
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Connect with other farmers and share experiences
                    </p>
                    <span className="text-xs text-accent-600 font-semibold">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
