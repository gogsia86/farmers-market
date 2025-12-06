/**
 * DIAGNOSTIC TEST PAGE
 * Simple page to verify server is working
 * 🔒 ADMIN ONLY ACCESS
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";

export const dynamic = "force-dynamic";

export default async function TestPage() {
  // Admin-only protection
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/diagnostic");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const timestamp = new Date().toISOString();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 p-8">
        {/* Admin Warning Banner */}
        <div className="max-w-2xl mx-auto mb-4 bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <p className="text-sm font-semibold text-yellow-800">
            🔒 DIAGNOSTIC TOOL - Admin Only
          </p>
        </div>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          ✅ Server is Working!
        </h1>

        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <p className="font-semibold">Status:</p>
            <p className="text-gray-700">Server rendering successfully</p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <p className="font-semibold">Timestamp:</p>
            <p className="text-gray-700">{timestamp}</p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <p className="font-semibold">Environment:</p>
            <p className="text-gray-700">
              {process.env.NODE_ENV || "development"}
            </p>
          </div>

          <div className="mt-8 p-4 bg-green-50 rounded">
            <p className="text-sm text-gray-600">
              If you can see this page, the Next.js server is working correctly.
              The homepage 500 error is likely related to a specific component
              or import.
            </p>
          </div>
        </div>
      </div>
      </main>
    </>
  );
}
