import { Mail, Shield } from "lucide-react";
import Link from "next/link";

/**
 * 🔒 PRIVACY POLICY PAGE
 */

export default function PrivacyPage() {
  const lastUpdated = "November 9, 2025";

  return (
<main className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="glass-card rounded-2xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    Privacy Policy
                  </h1>
                  <p className="text-muted-foreground">
                    Last updated: {lastUpdated}
                  </p>
                </div>
              </div>
              <p className="text-lg text-muted-foreground">
                Your privacy is important to us. This policy explains how we
                collect, use, and protect your personal information.
              </p>
            </div>

            {/* Content */}
            <div className="glass-card rounded-2xl p-8 space-y-8">
              {/* Section 1 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  1. Information We Collect
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We collect information you provide directly to us,
                    including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Name, email address, and phone number</li>
                    <li>
                      Payment information (processed securely through Stripe)
                    </li>
                    <li>Order history and preferences</li>
                    <li>Communications with us</li>
                  </ul>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  2. How We Use Your Information
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Process and fulfill your orders</li>
                    <li>Send order confirmations and updates</li>
                    <li>
                      Respond to your requests and provide customer support
                    </li>
                    <li>Send marketing communications (with your consent)</li>
                    <li>Improve our platform and services</li>
                    <li>Detect and prevent fraud</li>
                  </ul>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  3. Information Sharing
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>We may share your information with:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Farmers:</strong> We share your contact
                      information with farmers to coordinate order pickup
                    </li>
                    <li>
                      <strong>Service Providers:</strong> Payment processors,
                      email providers, and analytics services
                    </li>
                    <li>
                      <strong>Legal Requirements:</strong> When required by law
                      or to protect our rights
                    </li>
                  </ul>
                  <p>
                    We <strong>never</strong> sell your personal information to
                    third parties.
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  4. Data Security
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We implement appropriate technical and organizational
                    measures to protect your personal information, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>SSL encryption for data transmission</li>
                    <li>Secure payment processing through Stripe</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and authentication</li>
                  </ul>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  5. Your Rights
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access and review your personal information</li>
                    <li>Request corrections to your information</li>
                    <li>Delete your account and data</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Export your data in a portable format</li>
                  </ul>
                  <p>
                    To exercise these rights, contact us at{" "}
                    <a
                      href="mailto:privacy@farmersmarket.com"
                      className="text-primary-600 hover:text-primary-500 underline"
                    >
                      privacy@farmersmarket.com
                    </a>
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  6. Cookies and Tracking
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We use cookies and similar technologies to improve your
                    experience. See our{" "}
                    <Link
                      href="/cookies"
                      className="text-primary-600 hover:text-primary-500 underline"
                    >
                      Cookie Policy
                    </Link>{" "}
                    for more information.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  7. Children's Privacy
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Our services are not directed to children under 13. We do
                    not knowingly collect personal information from children
                    under 13.
                  </p>
                </div>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  8. Changes to This Policy
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We may update this privacy policy from time to time. We will
                    notify you of significant changes by email or through our
                    platform.
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  9. Contact Us
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    If you have questions about this privacy policy, contact us:
                  </p>
                  <div className="p-4 bg-accent-900/10 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="h-5 w-5 text-accent-600" />
                      <span className="font-semibold text-foreground">
                        Email
                      </span>
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
                  href="/terms"
                  className="p-4 border-2 border-border rounded-xl hover:border-primary-500 transition-colors"
                >
                  <h4 className="font-semibold text-foreground mb-1">
                    Terms of Service
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Platform rules and guidelines
                  </p>
                </Link>
                <Link
                  href="/cookies"
                  className="p-4 border-2 border-border rounded-xl hover:border-primary-500 transition-colors"
                >
                  <h4 className="font-semibold text-foreground mb-1">
                    Cookie Policy
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    How we use cookies
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
