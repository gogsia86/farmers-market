/**
 * MINIMAL TEST HOMEPAGE - DEBUG 500 ERROR
 * This is a stripped-down version to isolate the issue
 */

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center">
          🌾 Farmers Market Platform
        </h1>
        <p className="text-center mt-4 text-gray-600">
          Homepage is loading successfully!
        </p>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            If you see this, the server is working.
            The issue was with the complex page.tsx components.
          </p>
        </div>
      </div>
    </main>
  );
}
