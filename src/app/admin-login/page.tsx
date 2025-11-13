"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/admin";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
        return;
      }

      router.push(callbackUrl);
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              🌾 Divine Admin Access
            </h2>
            <p className="text-purple-200 text-sm text-center">
              Enter the agricultural consciousness realm
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-purple-200"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                data-testid="admin-email-input"
                aria-label="Email address"
                className="mt-1 block w-full px-3 py-2 bg-white/5 border border-purple-300/20 rounded-md text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="admin@farmersmarket.app"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-purple-200"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                data-testid="admin-password-input"
                aria-label="Password"
                className="mt-1 block w-full px-3 py-2 bg-white/5 border border-purple-300/20 rounded-md text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 text-red-200 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="admin-login-button"
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? "🌱 Manifesting Consciousness..."
                : "✨ Enter Divine Realm"}
            </button>
          </form>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 p-4 bg-gray-900/50 rounded-md border border-green-500/20">
              <p className="text-xs text-green-300 font-mono mb-2 font-bold">
                🔓 DEV MODE CREDENTIALS:
              </p>
              <p className="text-sm text-purple-200 font-mono">
                📧 Email: admin@farmersmarket.app
                <br />
                🔑 Password: DivineAdmin123!
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-sm text-purple-200 text-center">
        ✨ All actions are divinely logged and monitored for agricultural
        consciousness
      </p>
    </div>
  );
}
