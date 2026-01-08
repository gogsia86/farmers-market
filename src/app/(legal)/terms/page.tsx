import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Farmers Market Platform",
  description: "Terms of Service and User Agreement",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900">Terms of Service</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Terms of Service
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-lg max-w-none" data-testid="terms-content">
          <p className="text-gray-600 mb-6">
            Last Updated: January 8, 2025
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            By accessing and using the Farmers Market Platform ("Platform"), you accept and agree
            to be bound by the terms and provision of this agreement. If you do not agree to these
            terms, please do not use our Platform.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Use License</h2>
          <p className="text-gray-700 leading-relaxed">
            Permission is granted to temporarily access the materials on Farmers Market
            Platform for personal, non-commercial transitory viewing only. This is the grant
            of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or public display</li>
            <li>Attempt to reverse engineer any software on the Platform</li>
            <li>Remove any copyright or proprietary notations from the materials</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Account Responsibilities</h2>
          <p className="text-gray-700 leading-relaxed">
            Users are responsible for maintaining the confidentiality of their account
            and password and for restricting access to their devices. You agree to accept
            responsibility for all activities that occur under your account.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Product Listings</h2>
          <p className="text-gray-700 leading-relaxed">
            Farmers are responsible for accurate product descriptions, pricing, and
            availability. All products must comply with local food safety regulations
            and applicable laws. The Platform reserves the right to remove listings that
            violate these terms or applicable laws.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Payments and Refunds</h2>
          <p className="text-gray-700 leading-relaxed">
            All payments are processed securely through Stripe. By making a purchase,
            you agree to provide accurate payment information. Refund policies are
            determined by individual farmers, subject to applicable consumer protection laws.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. User Conduct</h2>
          <p className="text-gray-700 leading-relaxed">
            You agree not to use the Platform to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Upload or transmit any harmful or malicious content</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Attempt to gain unauthorized access to the Platform</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Intellectual Property</h2>
          <p className="text-gray-700 leading-relaxed">
            The Platform and its original content, features, and functionality are owned
            by Farmers Market Platform and are protected by international copyright,
            trademark, patent, trade secret, and other intellectual property laws.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed">
            Farmers Market Platform shall not be liable for any indirect, incidental,
            special, consequential or punitive damages resulting from your use of or
            inability to use the service, including but not limited to damages for loss
            of profits, goodwill, use, data or other intangible losses.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Indemnification</h2>
          <p className="text-gray-700 leading-relaxed">
            You agree to indemnify and hold harmless Farmers Market Platform and its
            affiliates from any claims, damages, losses, liabilities, and expenses
            (including legal fees) arising out of your use of the Platform or violation
            of these Terms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Termination</h2>
          <p className="text-gray-700 leading-relaxed">
            We reserve the right to terminate or suspend your account and access to the
            Platform immediately, without prior notice or liability, for any reason,
            including breach of these Terms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Changes to Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            We reserve the right to modify or replace these Terms at any time. We will
            provide notice of any material changes by posting the new Terms on this page
            and updating the "Last Updated" date.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Governing Law</h2>
          <p className="text-gray-700 leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws
            of the jurisdiction in which Farmers Market Platform operates, without
            regard to its conflict of law provisions.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Contact Information</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about these Terms, please contact us at:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <p className="text-gray-700 font-medium">Email: support@farmersmarket.app</p>
            <p className="text-gray-700 font-medium">Address: Farmers Market Platform Legal Department</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex items-center justify-center space-x-6 text-sm">
          <Link href="/privacy" className="text-green-600 hover:text-green-700 font-medium">
            Privacy Policy →
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
