import { ArrowLeft, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function FAQPage() {
  const faqs = [
    {
      question: "How do I place an order?",
      answer:
        "Browse our products, add items to your cart, and proceed to checkout. You'll need to create an account or sign in to complete your order.",
    },
    {
      question: "What are your delivery areas?",
      answer:
        "We currently deliver to over 50 cities across the country. Enter your zip code at checkout to see if we deliver to your area.",
    },
    {
      question: "How fresh are the products?",
      answer:
        "All our products are sourced directly from local farms and delivered within 24 hours of harvest. We guarantee maximum freshness!",
    },
    {
      question: "Are all products organic?",
      answer:
        "Most of our products are certified organic. Each product page clearly indicates whether it's organic or not.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 100% satisfaction guarantee. If you're not happy with your order, contact us within 24 hours for a full refund or replacement.",
    },
    {
      question: "How can I become a farmer partner?",
      answer:
        "We're always looking to partner with local organic farmers. Contact us through our contact page with details about your farm.",
    },
  ];

  return (
<main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-agricultural-600 hover:text-agricultural-700 mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <div className="bg-agricultural-100 p-4 rounded-full">
              <HelpCircle className="h-8 w-8 text-agricultural-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Frequently Asked Questions
            </h1>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  {faq.question}
                </h2>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-agricultural-50 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-600 mb-6">
              Can't find the answer you're looking for? Our team is here to
              help!
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-agricultural-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-agricultural-700 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>
  );
}
