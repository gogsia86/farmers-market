import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import {
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Sprout,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";

/**
 * 📚 FARMER RESOURCES PAGE - Fall Harvest Theme
 * Educational resources and guides for farmers
 */

const RESOURCE_CATEGORIES = [
  {
    id: "growing",
    name: "Growing Guides",
    icon: Sprout,
    color: "from-green-600 to-emerald-600",
    resources: [
      {
        title: "Organic Vegetable Production",
        type: "PDF Guide",
        description: "Complete guide to organic vegetable farming practices",
        downloadable: true,
      },
      {
        title: "Seasonal Planting Calendar",
        type: "Interactive Tool",
        description: "Know what to plant and when for maximum yields",
        downloadable: false,
      },
      {
        title: "Soil Health Management",
        type: "Video Series",
        description: "Build healthy soil for sustainable farming",
        downloadable: false,
      },
    ],
  },
  {
    id: "business",
    name: "Business & Marketing",
    icon: TrendingUp,
    color: "from-orange-600 to-red-600",
    resources: [
      {
        title: "Farm Business Planning",
        type: "Workbook",
        description: "Step-by-step guide to planning your farm business",
        downloadable: true,
      },
      {
        title: "Social Media for Farmers",
        type: "Guide",
        description: "Build your online presence and engage customers",
        downloadable: true,
      },
      {
        title: "Pricing Your Products",
        type: "Calculator",
        description: "Set profitable prices that customers will pay",
        downloadable: false,
      },
    ],
  },
  {
    id: "community",
    name: "Community & Networking",
    icon: Users,
    color: "from-blue-600 to-cyan-600",
    resources: [
      {
        title: "Farmer Success Stories",
        type: "Case Studies",
        description: "Learn from experienced farmers in our network",
        downloadable: false,
      },
      {
        title: "Monthly Farmer Meetups",
        type: "Events",
        description: "Connect with other farmers and share knowledge",
        downloadable: false,
      },
      {
        title: "Farmer Forum",
        type: "Community",
        description: "Ask questions and get advice from fellow farmers",
        downloadable: false,
      },
    ],
  },
  {
    id: "compliance",
    name: "Legal & Compliance",
    icon: FileText,
    color: "from-purple-600 to-pink-600",
    resources: [
      {
        title: "Food Safety Guidelines",
        type: "Checklist",
        description: "Ensure your products meet all safety standards",
        downloadable: true,
      },
      {
        title: "Organic Certification Guide",
        type: "PDF Guide",
        description: "Steps to getting your farm certified organic",
        downloadable: true,
      },
      {
        title: "Insurance Requirements",
        type: "Article",
        description: "Understanding liability and crop insurance",
        downloadable: false,
      },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="hero-gradient py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,106,37,0.3)_0%,transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(184,56,56,0.3)_0%,transparent_50%)]"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 bg-secondary-600/20 border border-secondary-500/30 text-secondary-200 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-semibold mb-6">
                <BookOpen className="h-5 w-5" />
                Farmer Resources
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Grow Your{" "}
                <span className="text-gradient-warm">Farm Business</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Access free guides, tools, and expert knowledge to help your
                farm thrive
              </p>
            </div>
          </div>
        </section>

        {/* Featured Resources */}
        <section className="py-12 bg-accent-900/5">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
                Featured Resources
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Link
                  href="/resources/getting-started"
                  className="glass-card rounded-xl p-6 hover:shadow-glow-lg transition-all group"
                >
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sprout className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2 group-hover:text-primary-600 transition-colors">
                    Getting Started Guide
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    New to the platform? Start here for a complete walkthrough.
                  </p>
                  <div className="flex items-center gap-2 text-primary-600 text-sm font-medium">
                    <Video className="h-4 w-4" />
                    <span>Watch Video</span>
                  </div>
                </Link>

                <Link
                  href="/resources/best-practices"
                  className="glass-card rounded-xl p-6 hover:shadow-glow-lg transition-all group"
                >
                  <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-6 w-6 text-secondary-600" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2 group-hover:text-primary-600 transition-colors">
                    Best Practices
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Proven strategies from our most successful farmers.
                  </p>
                  <div className="flex items-center gap-2 text-primary-600 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    <span>Read Article</span>
                  </div>
                </Link>

                <Link
                  href="/resources/marketing-toolkit"
                  className="glass-card rounded-xl p-6 hover:shadow-glow-lg transition-all group"
                >
                  <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Download className="h-6 w-6 text-accent-600" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2 group-hover:text-primary-600 transition-colors">
                    Marketing Toolkit
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Templates, graphics, and tips to promote your farm.
                  </p>
                  <div className="flex items-center gap-2 text-primary-600 text-sm font-medium">
                    <Download className="h-4 w-4" />
                    <span>Download Kit</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Resource Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto space-y-12">
              {RESOURCE_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.id}>
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {category.name}
                      </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      {category.resources.map((resource, idx) => (
                        <div
                          key={idx}
                          className="glass-card rounded-xl p-6 hover:shadow-glow-lg transition-all group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-xs font-semibold">
                              {resource.type}
                            </span>
                            {resource.downloadable && (
                              <Download className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <h3 className="font-bold text-foreground mb-2 group-hover:text-primary-600 transition-colors">
                            {resource.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {resource.description}
                          </p>
                          <button className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                            {resource.downloadable ? (
                              <>
                                <Download className="h-4 w-4" />
                                <span>Download</span>
                              </>
                            ) : (
                              <>
                                <ExternalLink className="h-4 w-4" />
                                <span>View Resource</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-accent-900/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Need More Help?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our support team is here to answer your questions
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/support"
                  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-xl font-semibold transition-colors shadow-glow"
                >
                  Contact Support
                </Link>
                <Link
                  href="/help"
                  className="inline-flex items-center gap-2 border-2 border-border hover:border-primary-500 px-8 py-4 rounded-xl font-semibold transition-colors"
                >
                  Browse FAQs
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
