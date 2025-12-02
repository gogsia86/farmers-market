import { Cookie, Mail } from "lucide-react";
import Link from "next/link";

/**
 * 🍪 COOKIE POLICY PAGE
 */

export default function CookiesPage() {
  const lastUpdated = "November 9, 2025";

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="glass-card rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                <Cookie className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Cookie Policy
                </h1>
                <p className="text-muted-foreground">
                  Last updated: {lastUpdated}
                </p>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">
              This policy explains how we use cookies and similar technologies
              on our platform.
            </p>
          </div>

          {/* Content */}
          <div className="glass-card rounded-2xl p-8 space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                1. What Are Cookies?
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Cookies are small text files stored on your device when you
                  visit websites. They help us provide you with a better
                  experience by remembering your preferences and analyzing how
                  you use our platform.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                2. Types of Cookies We Use
              </h2>
              <div className="space-y-6 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Essential Cookies
                  </h3>
                  <p>
                    Required for the platform to function. These enable core
                    features like security, authentication, and shopping cart
                    functionality.
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Session management</li>
                    <li>Authentication tokens</li>
                    <li>Shopping cart persistence</li>
                    <li>Security features</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Performance Cookies
                  </h3>
                  <p>
                    Help us understand how visitors use our platform so we can
                    improve it.
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Page load times</li>
                    <li>Error tracking</li>
                    <li>User behavior analytics</li>
                    <li>Feature usage statistics</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Functionality Cookies
                  </h3>
                  <p>Remember your preferences and choices.</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Language preferences</li>
                    <li>Theme settings (dark/light mode)</li>
                    <li>Location settings</li>
                    <li>Filter preferences</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Marketing Cookies
                  </h3>
                  <p>
                    Track your browsing to show relevant advertisements (only
                    with your consent).
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Ad personalization</li>
                    <li>Campaign effectiveness</li>
                    <li>Cross-site tracking</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                3. Third-Party Cookies
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>We use services from third parties that may set cookies:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Stripe:</strong> Payment processing
                  </li>
                  <li>
                    <strong>Google Analytics:</strong> Usage analytics
                  </li>
                  <li>
                    <strong>Social Media:</strong> Social sharing features
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                4. Managing Cookies
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  You can control cookies through your browser settings. Most
                  browsers allow you to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>View and delete cookies</li>
                  <li>Block third-party cookies</li>
                  <li>Block all cookies</li>
                  <li>Delete cookies when closing browser</li>
                </ul>
                <p className="mt-4">
                  <strong>Note:</strong> Blocking essential cookies may affect
                  platform functionality.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                5. Browser Settings
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>Manage cookies in your browser:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Chrome:</strong> Settings → Privacy and Security →
                    Cookies
                  </li>
                  <li>
                    <strong>Firefox:</strong> Settings → Privacy & Security →
                    Cookies
                  </li>
                  <li>
                    <strong>Safari:</strong> Preferences → Privacy → Cookies
                  </li>
                  <li>
                    <strong>Edge:</strong> Settings → Privacy → Cookies
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                6. Cookie Consent
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  By using our platform, you consent to the use of essential
                  cookies. For non-essential cookies, we will ask for your
                  explicit consent through our cookie banner.
                </p>
                <p>
                  You can withdraw consent at any time through your browser
                  settings or our cookie preferences center.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                7. Updates to This Policy
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We may update this cookie policy to reflect changes in
                  technology or legal requirements. Check this page periodically
                  for updates.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                8. Contact Us
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>Questions about our cookie policy?</p>
                <div className="p-4 bg-accent-900/10 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="h-5 w-5 text-accent-600" />
                    <span className="font-semibold text-foreground">Email</span>
                  </div>
                  <a
                    href="mailto:privacy@farmersmarket.com"
                    className="text-primary-600 hover:text-primary-500"
                  >
                    privacy@farmersmarket.com
                  </a>
                </div>
              </div>
            </section>
          </div>

          {/* Related Links */}
          <div className="glass-card rounded-2xl p-6 mt-8">
            <h3 className="font-semibold text-foreground mb-4">
              Related Policies
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/privacy"
                className="p-4 border-2 border-border rounded-xl hover:border-primary-500 transition-colors"
              >
                <h4 className="font-semibold text-foreground mb-1">
                  Privacy Policy
                </h4>
                <p className="text-sm text-muted-foreground">
                  How we protect your data
                </p>
              </Link>
              <Link
                href="/terms"
                className="p-4 border-2 border-border rounded-xl hover:border-primary-500 transition-colors"
              >
                <h4 className="font-semibold text-foreground mb-1">
                  Terms of Service
                </h4>
                <p className="text-sm text-muted-foreground">
                  Platform usage terms
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
