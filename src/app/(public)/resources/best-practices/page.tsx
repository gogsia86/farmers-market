import {
  Award,
  BookOpen,
  CheckCircle,
  FileText,
  Leaf,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

/**
 * 🌟 BEST PRACTICES PAGE - Farming Excellence Guide
 * Proven strategies from successful farmers
 */

const BEST_PRACTICES = [
  {
    category: "Product Quality",
    icon: Award,
    color: "from-green-600 to-emerald-600",
    practices: [
      {
        title: "Consistent Quality Standards",
        description:
          "Maintain uniform quality across all products. Establish clear grading standards and inspect every item before listing.",
        tips: [
          "Create quality checklists for each product type",
          "Train team members on quality standards",
          "Document your quality control process",
          "Handle products with care to prevent damage",
        ],
      },
      {
        title: "Proper Post-Harvest Handling",
        description:
          "Quick cooling and proper storage extend shelf life and maintain freshness.",
        tips: [
          "Cool products within 2 hours of harvest",
          "Use appropriate storage temperatures",
          "Monitor humidity levels",
          "Rotate stock using FIFO (First In, First Out)",
        ],
      },
      {
        title: "Honest Product Descriptions",
        description:
          "Accurately describe your products to build trust and reduce returns.",
        tips: [
          "Include growing methods (organic, conventional)",
          "Note any imperfections or variations",
          "Provide storage and preparation tips",
          "Update availability in real-time",
        ],
      },
    ],
  },
  {
    category: "Customer Service",
    icon: Users,
    color: "from-blue-600 to-cyan-600",
    practices: [
      {
        title: "Responsive Communication",
        description:
          "Quick, friendly responses build customer loyalty and increase sales.",
        tips: [
          "Respond to inquiries within 24 hours",
          "Use templates for common questions",
          "Provide multiple contact methods",
          "Set clear expectations for response times",
        ],
      },
      {
        title: "Reliable Pickup/Delivery",
        description:
          "Consistent fulfillment is crucial for customer satisfaction.",
        tips: [
          "Confirm pickup times and locations clearly",
          "Send reminders 24 hours before pickup",
          "Have backup plans for weather issues",
          "Communicate any delays immediately",
        ],
      },
      {
        title: "Go the Extra Mile",
        description:
          "Small gestures create memorable experiences and word-of-mouth marketing.",
        tips: [
          "Include recipe cards with products",
          "Offer seasonal product recommendations",
          "Thank customers personally",
          "Share your farm's story",
        ],
      },
    ],
  },
  {
    category: "Marketing & Sales",
    icon: TrendingUp,
    color: "from-orange-600 to-red-600",
    practices: [
      {
        title: "Professional Product Photos",
        description:
          "Quality images increase click-through rates and sales by 30-50%.",
        tips: [
          "Use natural lighting when possible",
          "Show products from multiple angles",
          "Include size references in photos",
          "Keep backgrounds simple and clean",
        ],
      },
      {
        title: "Strategic Pricing",
        description:
          "Balance profitability with market competitiveness for sustainable growth.",
        tips: [
          "Research local market prices",
          "Factor in all costs (labor, packaging, delivery)",
          "Offer volume discounts for bulk orders",
          "Adjust prices seasonally based on supply",
        ],
      },
      {
        title: "Social Proof & Reviews",
        description:
          "Positive reviews and testimonials build credibility and trust.",
        tips: [
          "Ask satisfied customers for reviews",
          "Respond to all reviews (positive and negative)",
          "Share customer success stories",
          "Display ratings prominently",
        ],
      },
    ],
  },
  {
    category: "Operational Excellence",
    icon: Leaf,
    color: "from-purple-600 to-pink-600",
    practices: [
      {
        title: "Inventory Management",
        description:
          "Accurate inventory prevents overselling and disappointed customers.",
        tips: [
          "Update stock levels daily",
          "Set up low-stock alerts",
          "Track sales patterns to predict demand",
          "Plan harvests based on historical data",
        ],
      },
      {
        title: "Sustainable Practices",
        description:
          "Eco-friendly farming attracts conscious consumers and ensures long-term viability.",
        tips: [
          "Minimize packaging waste",
          "Use compostable materials when possible",
          "Highlight sustainability efforts in marketing",
          "Pursue organic certification if applicable",
        ],
      },
      {
        title: "Record Keeping",
        description:
          "Detailed records help optimize operations and comply with regulations.",
        tips: [
          "Track expenses and income meticulously",
          "Document growing conditions and yields",
          "Maintain food safety logs",
          "Keep customer communication history",
        ],
      },
    ],
  },
];

const SUCCESS_METRICS = [
  {
    metric: "Response Time",
    target: "< 24 hours",
    impact: "Higher customer satisfaction",
    icon: "⚡",
  },
  {
    metric: "Product Quality",
    target: "95%+ Grade A",
    impact: "Increased repeat purchases",
    icon: "🌟",
  },
  {
    metric: "On-Time Fulfillment",
    target: "98%+",
    impact: "Better reviews & ratings",
    icon: "✅",
  },
  {
    metric: "Customer Reviews",
    target: "4.5+ stars",
    impact: "More new customers",
    icon: "⭐",
  },
];

export default function BestPracticesPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="hero-gradient py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,106,37,0.3)_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(184,56,56,0.3)_0%,transparent_50%)]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 bg-secondary-600/20 border border-secondary-500/30 text-secondary-200 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-semibold mb-6 hover:bg-secondary-600/30 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Back to Resources
            </Link>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Best Practices for{" "}
              <span className="text-gradient-warm">Farm Success</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Proven strategies from our most successful farmers. Implement
              these practices to grow your business and delight your customers.
            </p>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-12 bg-accent-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
              📊 Key Success Metrics
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {SUCCESS_METRICS.map((item) => (
                <div
                  key={item.metric}
                  className="glass-card rounded-xl p-6 text-center"
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-foreground mb-2">
                    {item.metric}
                  </h3>
                  <div className="text-2xl font-bold text-primary-600 mb-2">
                    {item.target}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.impact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices Sections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-16">
            {BEST_PRACTICES.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.category}>
                  {/* Section Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-foreground">
                        {section.category}
                      </h2>
                      <p className="text-muted-foreground">
                        {section.practices.length} essential practices
                      </p>
                    </div>
                  </div>

                  {/* Practices */}
                  <div className="space-y-8">
                    {section.practices.map((practice, practiceIdx) => (
                      <div
                        key={`${section.category}-${practice.title}-${practiceIdx}`}
                        className="glass-card rounded-2xl p-6 md:p-8"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-xl font-bold text-primary-600">
                              {practiceIdx + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-foreground mb-2">
                              {practice.title}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                              {practice.description}
                            </p>
                          </div>
                        </div>

                        {/* Tips */}
                        <div className="ml-14 space-y-3">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary-600" />
                            Action Items:
                          </h4>
                          <ul className="space-y-2">
                            {practice.tips.map((tip, tipIdx) => (
                              <li
                                key={`${practice.title}-tip-${tipIdx}-${tip.substring(0, 20)}`}
                                className="flex items-start gap-3 text-muted-foreground"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2 flex-shrink-0"></div>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Implementation Checklist */}
      <section className="py-16 bg-accent-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass-card rounded-2xl p-8 md:p-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Implementation Checklist
                </h2>
              </div>

              <p className="text-muted-foreground mb-6">
                Start with these quick wins to see immediate results:
              </p>

              <div className="space-y-4">
                {[
                  "Update all product listings with clear, accurate descriptions",
                  "Set up automated email reminders for pickup times",
                  "Take professional photos of your top 10 products",
                  "Create a quality control checklist for your team",
                  "Set up a system to track customer feedback",
                  "Review and respond to all pending customer messages",
                  "Update your farm profile with your sustainability story",
                  "Set competitive prices based on local market research",
                ].map((item, idx) => (
                  <label
                    key={`checklist-${idx}-${item.substring(0, 30)}`}
                    className="flex items-start gap-4 p-4 rounded-lg border-2 border-border hover:border-primary-500 transition-colors cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-border text-primary-600 focus:ring-primary-500 mt-0.5"
                    />
                    <span className="text-foreground group-hover:text-primary-600 transition-colors">
                      {item}
                    </span>
                  </label>
                ))}
              </div>

              <div className="mt-8 p-6 bg-primary-50 dark:bg-primary-900/10 rounded-xl border-2 border-primary-200 dark:border-primary-900/30">
                <p className="text-sm text-foreground">
                  <strong>💡 Pro Tip:</strong> Don't try to implement everything
                  at once. Focus on 2-3 practices per month and build
                  sustainable habits over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Implement These Practices?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join our community of successful farmers
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/register-farm"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-xl font-semibold transition-colors shadow-glow"
              >
                Start Your Farm Profile
              </Link>
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 border-2 border-border hover:border-primary-500 px-8 py-4 rounded-xl font-semibold transition-colors"
              >
                More Resources
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
