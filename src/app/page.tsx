export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            🌾 Farmers Market Platform 2.0
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional marketplace connecting local farmers with customers.
            Fresh, local, and sustainable.
          </p>
        </div>

        {/* Status Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-2 border-green-200 rounded-2xl shadow-xl p-8 md:p-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-green-100 rounded-full p-4">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              🚀 Clean Slate Initialized
            </h2>

            <p className="text-center text-gray-600 mb-8 text-lg">
              The platform is ready for professional development with a clean,
              maintainable foundation.
            </p>

            {/* Status Checklist */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Old implementation archived
                  </p>
                  <p className="text-sm text-gray-600">
                    All legacy code safely preserved in{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      .archive-old-implementation/
                    </code>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Clean foundation created
                  </p>
                  <p className="text-sm text-gray-600">
                    Professional directory structure with zero technical debt
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Database schema preserved
                  </p>
                  <p className="text-sm text-gray-600">
                    Excellent Prisma schema and core utilities kept intact
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Ready to build MVP features
                  </p>
                  <p className="text-sm text-gray-600">
                    6-week roadmap to production-ready marketplace
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                Next Steps
              </h3>
              <ol className="space-y-2 text-sm text-blue-900">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>
                    Review the rebuild plan:{" "}
                    <code className="bg-blue-100 px-2 py-0.5 rounded text-xs">
                      FRESH_START_STRATEGY.md
                    </code>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>
                    Week 1: Set up authentication and core services
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  <span>Follow professional naming conventions</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">4.</span>
                  <span>
                    Build incrementally with tests (target 80%+ coverage)
                  </span>
                </li>
              </ol>
            </div>
          </div>

          {/* Timeline Preview */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              <strong>Timeline:</strong> 5-6 weeks to production-ready MVP
            </p>
            <p className="text-gray-600 text-sm mt-1">
              <strong>Status:</strong>{" "}
              <span className="text-green-600 font-semibold">
                Ready to Build
              </span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
