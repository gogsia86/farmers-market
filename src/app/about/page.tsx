import { Header } from "@/components/layout/Header";
import { ArrowLeft, Award, Heart, Leaf, Users } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-agricultural-600 hover:text-agricultural-700 mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Farmers Market
          </h1>

          <div className="prose max-w-none mb-12">
            <p className="text-xl text-gray-600 leading-relaxed">
              We're on a mission to connect local farmers with conscious
              consumers, creating a sustainable food system that benefits
              everyone. From farm to table, we ensure the freshest, highest
              quality organic produce reaches your door.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-agricultural-50 rounded-2xl p-8">
              <div className="bg-agricultural-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Leaf className="h-8 w-8 text-agricultural-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Our Mission
              </h2>
              <p className="text-gray-600">
                To revolutionize the way people access fresh, organic produce by
                building direct connections between local farms and consumers.
                We believe in sustainable agriculture, fair prices for farmers,
                and healthy food for all.
              </p>
            </div>

            <div className="bg-agricultural-50 rounded-2xl p-8">
              <div className="bg-agricultural-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-agricultural-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Our Values
              </h2>
              <p className="text-gray-600">
                Sustainability, transparency, and community are at the heart of
                everything we do. We're committed to supporting local farmers,
                reducing food waste, and making organic produce accessible to
                everyone.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Our Impact
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-agricultural-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-agricultural-600" />
                </div>
                <div className="text-4xl font-bold text-agricultural-600 mb-2">
                  500+
                </div>
                <div className="text-gray-600">Local Farms</div>
              </div>

              <div className="text-center">
                <div className="bg-agricultural-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-agricultural-600" />
                </div>
                <div className="text-4xl font-bold text-agricultural-600 mb-2">
                  10,000+
                </div>
                <div className="text-gray-600">Happy Customers</div>
              </div>

              <div className="text-center">
                <div className="bg-agricultural-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-agricultural-600" />
                </div>
                <div className="text-4xl font-bold text-agricultural-600 mb-2">
                  100%
                </div>
                <div className="text-gray-600">Organic Certified</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
