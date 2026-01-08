/**
 * ❓ FAQ PAGE
 * Frequently Asked Questions for customers and farmers
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions | Farmers Market",
  description: "Find answers to common questions about buying from local farms and selling your produce",
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Find answers to common questions about our platform
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          {/* General Questions */}
          <section className="mb-12">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900">
              <span className="mr-3 text-3xl">🌾</span>
              General Questions
            </h2>

            <div className="space-y-4">
              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  What is Farmers Market Platform?
                </summary>
                <p className="mt-3 text-gray-600">
                  Farmers Market Platform is an online marketplace connecting local farmers directly with customers.
                  We help you buy fresh, seasonal produce straight from farms in your area, supporting local agriculture
                  and sustainable food systems.
                </p>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  How does it work?
                </summary>
                <p className="mt-3 text-gray-600">
                  Browse farms and products in your area, add items to your cart, and checkout securely.
                  Farmers receive your order and prepare your fresh produce for delivery or pickup.
                  You receive farm-fresh products directly from the source.
                </p>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  Is there a membership fee?
                </summary>
                <p className="mt-3 text-gray-600">
                  No! Creating an account and browsing products is completely free for customers.
                  You only pay for the products you purchase. Farmers pay a small platform fee on sales to help us maintain and improve the service.
                </p>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  What areas do you serve?
                </summary>
                <p className="mt-3 text-gray-600">
                  We connect customers with farms across the United States. Availability depends on farms in your specific area.
                  Enter your location during browsing to see farms and products available for delivery or pickup near you.
                </p>
              </details>
            </div>
          </section>

          {/* For Customers */}
          <section className="mb-12">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900">
              <span className="mr-3 text-3xl">🛒</span>
              For Customers
            </h2>

            <div className="space-y-4">
              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  How do I place an order?
                </summary>
                <div className="mt-3 text-gray-600">
                  <ol className="list-decimal space-y-2 pl-5">
                    <li>Browse the marketplace or search for specific products</li>
                    <li>Click on products to view details and add to cart</li>
                    <li>Review your cart and proceed to checkout</li>
                    <li>Choose delivery or pickup option</li>
                    <li>Enter payment information and confirm order</li>
                    <li>Receive order confirmation and tracking details</li>
                  </ol>
                </div>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  What payment methods do you accept?
                </summary>
                <p className="mt-3 text-gray-600">
                  We accept all major credit cards (Visa, Mastercard, American Express, Discover),
                  debit cards, and digital payment methods like Apple Pay and Google Pay.
                  All transactions are securely processed through Stripe.
                </p>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  Can I order from multiple farms at once?
                </summary>
                <p className="mt-3 text-gray-600">
                  Yes! You can add products from different farms to your cart. However, each farm's order
                  will be processed separately with individual delivery/pickup arrangements and charges,
                  as each farm operates independently.
                </p>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  How does delivery work?
                </summary>
                <p className="mt-3 text-gray-600">
                  Delivery options vary by farm. Some farms offer home delivery within a certain radius,
                  while others provide pickup at the farm or at local farmers markets.
                  You'll see available options during checkout. Delivery fees are set by individual farms based on distance and order size.
                </p>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  What if I receive damaged or incorrect items?
                </summary>
                <p className="mt-3 text-gray-600">
                  We want you to be completely satisfied with your order. If you receive damaged,
                  incorrect, or unsatisfactory items, please contact the farm directly through our messaging system
                  within 24 hours of delivery. Most farms will offer a replacement or refund.
                  You can also reach out to our support team for assistance.
                </p>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  Can I cancel or modify my order?
                </summary>
                <p className="mt-3 text-gray-600">
                  Order modification and cancellation policies vary by farm. Generally, you can cancel or modify
                  an order before the farm begins preparing it. Contact the farm directly through your order page
                  or our messaging system. Refunds for cancelled orders are processed within 5-7 business days.
                </p>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  Are the products organic?
                </summary>
                <p className="mt-3 text-gray-600">
                  Many farms on our platform grow organic produce and hold organic certifications.
                  You can filter products by organic certification when browsing. Each farm's profile
                  displays their certifications and farming practices. Look for the "Organic" badge on products and farm profiles.
                </p>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  How fresh are the products?
                </summary>
                <p className="mt-3 text-gray-600">
                  Products are typically harvested within 24-48 hours of delivery, ensuring maximum freshness.
                  Each product listing includes harvest dates and expected freshness duration.
                  This is significantly fresher than typical grocery store produce which may be days or weeks old.
                </p>
              </details>
            </div>
          </section>

          {/* For Farmers */}
          <section className="mb-12">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900">
              <span className="mr-3 text-3xl">🚜</span>
              For Farmers
            </h2>

            <div className="space-y-4">
              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  How do I register my farm?
                </summary>
                <div className="mt-3 text-gray-600">
                  <p className="mb-2">
                    Click the "Register Your Farm" button and complete the registration form with:
                  </p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>Farm name and location</li>
                    <li>Contact information</li>
                    <li>Farm description and story</li>
                    <li>Photos of your farm and products</li>
                    <li>Certifications (if applicable)</li>
                    <li>Business information for payments</li>
                  </ul>
                  <p className="mt-2">
                    Our team will review your application within 2-3 business days.
                  </p>
                </div>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  What are the fees?
                </summary>
                <p className="mt-3 text-gray-600">
                  We charge a platform fee of 10-15% on each sale (depending on your sales volume).
                  This fee covers payment processing, platform maintenance, customer support, and marketing.
                  There are no monthly fees, listing fees, or hidden charges. You only pay when you make a sale.
                </p>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  How do I get paid?
                </summary>
                <p className="mt-3 text-gray-600">
                  Payments are processed through Stripe and deposited directly into your bank account.
                  You'll receive payouts on a regular schedule (weekly or bi-weekly) minus our platform fee.
                  You can track all earnings and payouts through your farmer dashboard.
                </p>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  How do I manage inventory?
                </summary>
                <p className="mt-3 text-gray-600">
                  Your farmer dashboard includes inventory management tools. You can update product availability,
                  quantities, and prices in real-time. Set low stock alerts to avoid overselling.
                  The system automatically updates inventory as orders are placed.
                </p>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  Can I set my own prices and delivery fees?
                </summary>
                <p className="mt-3 text-gray-600">
                  Absolutely! You have complete control over your pricing, delivery fees, and delivery radius.
                  Set prices that work for your business while remaining competitive.
                  You can also offer pickup at your farm or at farmers markets to reduce delivery costs.
                </p>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  What kind of support do you provide?
                </summary>
                <p className="mt-3 text-gray-600">
                  We provide comprehensive support including onboarding assistance, platform training,
                  marketing resources, customer service support, and technical help.
                  Contact our farmer support team anytime at farmers@farmersmarket.com or through your dashboard.
                </p>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  Do I need special insurance?
                </summary>
                <p className="mt-3 text-gray-600">
                  We recommend that all farms maintain general liability insurance and product liability insurance.
                  While we provide a platform for transactions, individual farms are responsible for their products
                  and deliveries. We can provide recommendations for farm insurance providers.
                </p>
              </details>
            </div>
          </section>

          {/* Account & Security */}
          <section className="mb-12">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900">
              <span className="mr-3 text-3xl">🔒</span>
              Account & Security
            </h2>

            <div className="space-y-4">
              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  Is my payment information secure?
                </summary>
                <p className="mt-3 text-gray-600">
                  Yes! We use Stripe for payment processing, which is PCI-DSS compliant and meets the highest
                  security standards. Your payment information is encrypted and never stored on our servers.
                  All transactions are processed over secure HTTPS connections.
                </p>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  How do I reset my password?
                </summary>
                <p className="mt-3 text-gray-600">
                  Click "Forgot Password" on the login page and enter your email address.
                  We'll send you a secure link to reset your password. The link expires after 1 hour for security.
                  If you don't receive the email, check your spam folder or contact support.
                </p>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  Can I delete my account?
                </summary>
                <p className="mt-3 text-gray-600">
                  Yes, you can delete your account at any time from your account settings.
                  Note that this action is permanent and will remove all your data, order history, and saved information.
                  For farmers, please ensure all outstanding orders are fulfilled and payments are settled before deletion.
                </p>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  How do you protect my privacy?
                </summary>
                <p className="mt-3 text-gray-600">
                  We take your privacy seriously. We never sell your personal information to third parties.
                  Your data is used only to provide and improve our services.
                  Read our <Link href="/privacy" className="text-green-700 hover:underline">Privacy Policy</Link> for complete details
                  on how we collect, use, and protect your information.
                </p>
              </details>
            </div>
          </section>

          {/* Technical Issues */}
          <section className="mb-12">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900">
              <span className="mr-3 text-3xl">⚙️</span>
              Technical Issues
            </h2>

            <div className="space-y-4">
              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  The website isn't working properly. What should I do?
                </summary>
                <div className="mt-3 text-gray-600">
                  <p className="mb-2">Try these troubleshooting steps:</p>
                  <ol className="list-decimal space-y-1 pl-5">
                    <li>Clear your browser cache and cookies</li>
                    <li>Try a different browser (Chrome, Firefox, Safari, Edge)</li>
                    <li>Disable browser extensions temporarily</li>
                    <li>Check your internet connection</li>
                    <li>Try accessing from a different device</li>
                  </ol>
                  <p className="mt-2">
                    If the issue persists, contact our support team with details about the problem,
                    your browser version, and device type.
                  </p>
                </div>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  Can I use the platform on mobile devices?
                </summary>
                <p className="mt-3 text-gray-600">
                  Yes! Our platform is fully responsive and works on smartphones and tablets.
                  For the best mobile experience, use the latest version of your mobile browser.
                  We also offer a mobile app (coming soon) for iOS and Android devices.
                </p>
              </details>

              <details className="group rounded-lg bg-white p-6 shadow-md">
                <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-green-700">
                  I'm not receiving email notifications
                </summary>
                <p className="mt-3 text-gray-600">
                  Check your spam/junk folder first. Add notifications@farmersmarket.com to your contacts
                  to ensure delivery. You can also check your notification preferences in your account settings
                  to make sure email notifications are enabled. If issues persist, contact support.
                </p>
              </details>
            </div>
          </section>

          {/* Still Need Help */}
          <section className="rounded-lg bg-green-50 p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Still Need Help?
            </h2>
            <p className="mb-6 text-gray-600">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-800"
              >
                Contact Support
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-lg border-2 border-green-700 px-6 py-3 font-semibold text-green-700 transition-colors hover:bg-white"
              >
                How It Works
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
