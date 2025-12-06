"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Package,
  MessageSquare,
  TestTube,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

/**
 * 🚀 DYNAMIC COMPONENT DEMOS
 * Showcase page for performance-optimized dynamic components
 */

export default function DemosPage() {
  const demos = [
    {
      title: "Analytics Dashboard",
      description: "Advanced analytics with dynamic loading and real-time charts",
      icon: BarChart3,
      href: "/demos/analytics",
      color: "from-blue-500 to-cyan-500",
      savings: "~260 KB",
    },
    {
      title: "Inventory Management",
      description: "Real-time inventory tracking with smart allocation",
      icon: Package,
      href: "/demos/inventory",
      color: "from-purple-500 to-pink-500",
      savings: "~220 KB",
    },
    {
      title: "AI Chat Assistant",
      description: "Intelligent agricultural assistance powered by AI",
      icon: MessageSquare,
      href: "/demos/chat",
      color: "from-green-500 to-emerald-500",
      savings: "~190 KB",
    },
    {
      title: "Test Page",
      description: "Simple routing and component testing",
      icon: TestTube,
      href: "/demos/test",
      color: "from-amber-500 to-orange-500",
      savings: "N/A",
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full text-sm font-semibold mb-6">
                <Sparkles className="h-5 w-5" />
                Performance Optimized
              </span>

              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Dynamic Component Demos
              </h1>

              <p className="text-xl md:text-2xl text-white/90 mb-8">
                Explore our performance-optimized dynamic components with code
                splitting and lazy loading
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="#demos">
                    <Zap className="h-5 w-5 mr-2" />
                    Explore Demos
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/farmer/dashboard">
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Info Banner */}
        <section className="py-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary-600 mb-2">
                    ~670 KB
                  </div>
                  <p className="text-gray-600 font-medium">
                    Total Bundle Savings
                  </p>
                  <p className="text-sm text-gray-500">
                    Client-side optimization
                  </p>
                </div>

                <div>
                  <div className="text-4xl font-bold text-primary-600 mb-2">
                    <Zap className="h-10 w-10 inline-block" />
                  </div>
                  <p className="text-gray-600 font-medium">Dynamic Imports</p>
                  <p className="text-sm text-gray-500">
                    Lazy-loaded components
                  </p>
                </div>

                <div>
                  <div className="text-4xl font-bold text-primary-600 mb-2">
                    100%
                  </div>
                  <p className="text-gray-600 font-medium">Code Splitting</p>
                  <p className="text-sm text-gray-500">
                    Optimized delivery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demos Grid */}
        <section id="demos" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Available Demos
                </h2>
                <p className="text-xl text-gray-600">
                  Click any demo to see it in action
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {demos.map((demo) => {
                  const Icon = demo.icon;
                  return (
                    <Link key={demo.href} href={demo.href}>
                      <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary-200">
                        <CardHeader className="pb-4">
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-16 h-16 bg-gradient-to-br ${demo.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                            >
                              <Icon className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                                {demo.title}
                              </h3>
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                <TrendingUp className="h-3 w-3" />
                                {demo.savings}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 mb-4">
                            {demo.description}
                          </p>
                          <div className="flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-3 transition-all">
                            View Demo
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Performance Features
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Dynamic Loading
                  </h3>
                  <p className="text-gray-600">
                    Components load on-demand with loading skeletons for smooth
                    UX
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Code Splitting
                  </h3>
                  <p className="text-gray-600">
                    Heavy libraries split into separate chunks for faster
                    initial load
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Bundle Optimization
                  </h3>
                  <p className="text-gray-600">
                    Significant reduction in client bundle size for improved
                    performance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Explore?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Try out our performance-optimized components and see the
                difference
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="#demos">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Try Demos
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/">
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
