import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Farmers Market Platform",
  description: "Privacy Policy and Data Protection",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900">Privacy Policy</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Privacy Policy
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-lg max-w-none" data-testid="privacy-content">
          <p className="text-gray-600 mb-6">
            Last Updated: January 8, 2025
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-gray-700 leading-relaxed">
            We collect information you provide directly to us when you create an account,
            make a purchase, or communicate with us. This includes:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Name and contact information (email address, phone number, mailing address)</li>
            <li>Payment information (processed securely through Stripe)</li>
            <li>Farm details and certifications (for farmer accounts)</li>
            <li>Profile information and preferences</li>
            <li>Communications with us and other users through the Platform</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send you technical notices, updates, security alerts, and support messages</li>
            <li>Respond to your comments, questions, and customer service requests</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
            <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
            <li>Personalize your experience and deliver content relevant to your interests</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Information Sharing and Disclosure</h2>
          <p className="text-gray-700 leading-relaxed">
            We do not sell your personal information. We may share your information in the
            following circumstances:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              <strong>Service Providers:</strong> We share information with third-party service
              providers who perform services on our behalf, such as payment processing (Stripe),
              email delivery, and analytics.
            </li>
            <li>
              <strong>Between Users:</strong> When you make a purchase, we share necessary
              information (name, delivery address) with the farmer to fulfill your order.
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose information if required by
              law or in response to valid legal requests.
            </li>
            <li>
              <strong>Business Transfers:</strong> In connection with any merger, sale of
              company assets, or acquisition, your information may be transferred.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Security</h2>
          <p className="text-gray-700 leading-relaxed">
            We implement appropriate technical and organizational security measures to protect
            your personal information against unauthorized access, alteration, disclosure, or
            destruction. These measures include:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments and audits</li>
            <li>Restricted access to personal information</li>
            <li>Secure authentication and authorization mechanisms</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            However, no method of transmission over the Internet or electronic storage is 100%
            secure. While we strive to protect your personal information, we cannot guarantee
            its absolute security.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Your Rights and Choices</h2>
          <p className="text-gray-700 leading-relaxed">
            You have the following rights regarding your personal information:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              <strong>Access and Update:</strong> You can access and update your account
              information at any time through your account settings.
            </li>
            <li>
              <strong>Delete:</strong> You can request deletion of your account and personal
              information by contacting us.
            </li>
            <li>
              <strong>Opt-Out:</strong> You may opt out of receiving promotional emails by
              following the unsubscribe link in those emails.
            </li>
            <li>
              <strong>Data Portability:</strong> You can request a copy of your personal
              information in a structured, machine-readable format.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Cookies and Tracking Technologies</h2>
          <p className="text-gray-700 leading-relaxed">
            We use cookies and similar tracking technologies to track activity on our service
            and hold certain information. Cookies are files with a small amount of data that
            are sent to your browser and stored on your device. You can instruct your browser
            to refuse all cookies or to indicate when a cookie is being sent.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            We use the following types of cookies:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Essential Cookies:</strong> Required for the Platform to function properly</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our Platform</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Data Retention</h2>
          <p className="text-gray-700 leading-relaxed">
            We retain your personal information for as long as necessary to fulfill the purposes
            outlined in this Privacy Policy, unless a longer retention period is required or
            permitted by law. When we no longer need your information, we will securely delete
            or anonymize it.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Children's Privacy</h2>
          <p className="text-gray-700 leading-relaxed">
            Our Platform is not intended for children under 13 years of age. We do not knowingly
            collect personal information from children under 13. If you are a parent or guardian
            and believe your child has provided us with personal information, please contact us.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. International Data Transfers</h2>
          <p className="text-gray-700 leading-relaxed">
            Your information may be transferred to and maintained on servers located outside of
            your state, province, country, or other governmental jurisdiction where data protection
            laws may differ. We take appropriate safeguards to ensure your data is treated securely
            and in accordance with this Privacy Policy.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Changes to This Privacy Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update our Privacy Policy from time to time. We will notify you of any changes
            by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about this Privacy Policy or our data practices, please
            contact us at:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <p className="text-gray-700 font-medium">Email: privacy@farmersmarket.app</p>
            <p className="text-gray-700 font-medium">Data Protection Officer: dpo@farmersmarket.app</p>
            <p className="text-gray-700 font-medium">Address: Farmers Market Platform Privacy Team</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. California Privacy Rights</h2>
          <p className="text-gray-700 leading-relaxed">
            If you are a California resident, you have specific rights under the California
            Consumer Privacy Act (CCPA), including the right to know what personal information
            we collect, the right to delete your information, and the right to opt-out of the
            sale of your information (we do not sell personal information).
          </p>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex items-center justify-center space-x-6 text-sm">
          <Link href="/terms" className="text-green-600 hover:text-green-700 font-medium">
            Terms of Service →
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
