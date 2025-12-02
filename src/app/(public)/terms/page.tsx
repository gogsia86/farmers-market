import { FileText, Mail } from "lucide-react";
import Link from "next/link";

/**
 * 📄 TERMS OF SERVICE PAGE
 */

export default function TermsPage() {
  const lastUpdated = "November 9, 2025";

  return (
<main className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="glass-card rounded-2xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                  <FileText className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    Terms of Service
                  </h1>
                  <p className="text-muted-foreground">
                    Last updated: {lastUpdated}
                  </p>
                </div>
              </div>
              <p className="text-lg text-muted-foreground">
                These terms govern your use of our platform. Please read them
                carefully.
              </p>
            </div>

            {/* Content */}
            <div className="glass-card rounded-2xl p-8 space-y-8">
              {/* Section 1 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  1. Acceptance of Terms
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    By accessing and using Farmers Market platform, you accept
                    and agree to be bound by these Terms of Service and our
                    Privacy Policy.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  2. Platform Description
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Farmers Market is an online marketplace connecting local
                    farmers with customers seeking fresh, locally-sourced
                    products. We facilitate transactions but are not a party to
                    agreements between farmers and customers.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  3. User Accounts
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>To use our services, you must:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Be at least 18 years old</li>
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account</li>
                    <li>Notify us immediately of unauthorized access</li>
                    <li>
                      Be responsible for all activities under your account
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  4. Orders and Payments
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    <strong>For Customers:</strong>
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>All orders are subject to acceptance by farmers</li>
                    <li>Prices are set by individual farmers</li>
                    <li>Payment is processed at time of order</li>
                    <li>Refunds are subject to farmer policies</li>
                    <li>Pickup times must be coordinated with farmers</li>
                  </ul>
                  <p className="mt-4">
                    <strong>For Farmers:</strong>
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>10% commission applies to all sales</li>
                    <li>Payments are transferred weekly</li>
                    <li>You must fulfill accepted orders</li>
                    <li>Product descriptions must be accurate</li>
                    <li>You set your own refund policies</li>
                  </ul>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  5. Product Quality and Safety
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>Farmers agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Comply with all food safety regulations</li>
                    <li>Accurately represent certifications</li>
                    <li>Maintain proper handling and storage practices</li>
                    <li>Disclose potential allergens</li>
                  </ul>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  6. Prohibited Activities
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>You may not:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Violate any laws or regulations</li>
                    <li>Infringe on intellectual property rights</li>
                    <li>Post false or misleading information</li>
                    <li>Harass or abuse other users</li>
                    <li>Attempt to manipulate ratings or reviews</li>
                    <li>Use automated systems to access the platform</li>
                  </ul>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  7. Intellectual Property
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    All content on the platform, including text, graphics,
                    logos, and software, is owned by Farmers Market or its
                    licensors and protected by copyright and trademark laws.
                  </p>
                </div>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  8. Limitation of Liability
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>We are not liable for:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Quality or safety of products</li>
                    <li>Actions or omissions of farmers or customers</li>
                    <li>Disputes between users</li>
                    <li>Indirect or consequential damages</li>
                  </ul>
                  <p>
                    Our maximum liability is limited to the amount paid by you
                    in the past 12 months.
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  9. Termination
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We may suspend or terminate your account for violation of
                    these terms. You may close your account at any time through
                    your account settings.
                  </p>
                </div>
              </section>

              {/* Section 10 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  10. Changes to Terms
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We may modify these terms at any time. Continued use of the
                    platform after changes constitutes acceptance of the new
                    terms.
                  </p>
                </div>
              </section>

              {/* Section 11 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  11. Contact Information
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>For questions about these terms:</p>
                  <div className="p-4 bg-accent-900/10 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="h-5 w-5 text-accent-600" />
                      <span className="font-semibold text-foreground">
                        Email
                      </span>
                    </div>
                    <a
                      href="mailto:legal@farmersmarket.com"
                      className="text-primary-600 hover:text-primary-500"
                    >
                      legal@farmersmarket.com
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
                    How we handle your data
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
                    Our use of cookies
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
