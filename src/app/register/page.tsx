import { RegisterForm } from "@/components/features/auth/RegisterForm";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Register | Farmers Market Platform",
  description: "Create your Farmers Market account - Join our agricultural community",
};

/**
 * 🔐 REGISTRATION PAGE
 * Wrapper for RegisterForm with Suspense boundary for search params
 */
function RegisterContent() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm />
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-green-100 p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
            </div>
          </div>
        </div>
      </main>
    }>
      <RegisterContent />
    </Suspense>
  );
}
