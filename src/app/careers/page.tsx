import { Header } from "@/components/layout/Header";
import { ArrowLeft, Briefcase, Users } from "lucide-react";
import Link from "next/link";

export default function CareersPage() {
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
            Careers
          </h1>

          <p className="text-xl text-gray-600 mb-12">
            Join our mission to connect local farmers with consumers. We're
            always looking for passionate people to join our team.
          </p>

          <div className="bg-gradient-to-br from-agricultural-50 to-green-50 rounded-2xl p-12 mb-12 text-center">
            <div className="bg-agricultural-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="h-10 w-10 text-agricultural-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              No Open Positions Currently
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              We don't have any open positions at the moment, but we'd love to
              hear from you! Send us your resume and we'll keep you in mind for
              future opportunities.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-agricultural-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-agricultural-700 transition-colors"
            >
              <Users className="h-5 w-5" />
              Get in Touch
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
