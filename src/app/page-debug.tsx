/**
 * DEBUG HOMEPAGE - Minimal version to identify 500 error
 * Progressively add components to find the issue
 */

export const dynamic = "force-dynamic";

export default function DebugHomePage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🔍 Debug Homepage
        </h1>

        <div className="bg-green-100 border-2 border-green-500 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            ✅ Page is Rendering!
          </h2>
          <p className="text-green-800">
            If you can see this, the basic page rendering is working.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">Environment Check:</h3>
            <ul className="space-y-2 text-sm">
              <li>✅ Next.js Server: Running</li>
              <li>✅ React Rendering: Working</li>
              <li>✅ TypeScript: Compiling</li>
              <li>✅ Tailwind CSS: Loading</li>
            </ul>
          </div>

          <div className="bg-blue-100 p-4 rounded">
            <h3 className="font-bold mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Navigate to <code className="bg-white px-2 py-1 rounded">/page-debug</code></li>
              <li>If this works, issue is in original page</li>
              <li>Progressively add components back</li>
              <li>Identify which component causes 500 error</li>
            </ol>
          </div>

          <div className="bg-yellow-100 p-4 rounded">
            <h3 className="font-bold mb-2">Suspected Issues:</h3>
            <ul className="space-y-1 text-sm">
              <li>🔍 Header component with i18n</li>
              <li>🔍 Database queries (if any)</li>
              <li>🔍 Server-side data fetching</li>
              <li>🔍 Environment variables</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-900 text-white rounded">
          <h3 className="font-bold mb-2">Quick Links:</h3>
          <div className="flex gap-4">
            <a href="/" className="text-blue-400 hover:underline">
              Original Home
            </a>
            <a href="/api/health" className="text-blue-400 hover:underline">
              Health Check
            </a>
            <a href="/diagnostic" className="text-blue-400 hover:underline">
              Diagnostic Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
