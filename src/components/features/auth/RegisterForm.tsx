"use client";

/**
 * 🔐 QUANTUM REGISTRATION FORM COMPONENT
 * Divine user registration interface with agricultural consciousness
 *
 * Features:
 * - Client-side form validation
 * - Role selection (Farmer/Consumer)
 * - Dynamic farm details for farmers
 * - Agricultural-themed UI
 * - Error handling with enlightening messages
 * - Loading states with quantum feedback
 * - URL param role pre-selection
 * - Bot compatibility with hidden name field
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface RegisterFormProps {
  callbackUrl?: string;
  className?: string;
}

type UserRole = "FARMER" | "CONSUMER";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  agreeToTerms: boolean;
  // Farm fields
  farmName: string;
  farmAddress: string;
  farmDescription: string;
}

export function RegisterForm({ callbackUrl = "/", className = "" }: RegisterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "CONSUMER",
    agreeToTerms: false,
    farmName: "",
    farmAddress: "",
    farmDescription: "",
  });

  // Set role from URL params on mount (for /register-farm redirect)
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam && (roleParam.toUpperCase() === "FARMER" || roleParam.toUpperCase() === "CONSUMER")) {
      setFormData((prev) => ({ ...prev, role: roleParam.toUpperCase() as UserRole }));
    }
  }, [searchParams]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Handle hidden "name" field for bot compatibility
    if (name === "name") {
      // Split full name into firstName and lastName
      const nameParts = value.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      setFormData((prev) => ({ ...prev, firstName, lastName }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!formData.firstName || !formData.lastName) {
      setError("Please enter your full name");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError("Password must contain uppercase, lowercase, and numbers");
      return;
    }

    if (formData.role === "FARMER" && (!formData.farmName || !formData.farmAddress)) {
      setError("Farm name and address are required for farmers");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    setIsLoading(true);

    try {
      // Call registration API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
          role: formData.role,
          farmName: formData.role === "FARMER" ? formData.farmName : undefined,
          farmAddress: formData.role === "FARMER" ? formData.farmAddress : undefined,
          farmDescription: formData.role === "FARMER" ? formData.farmDescription : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error?.message || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Registration successful - redirect to login page
      console.log("✅ Registration successful, redirecting to login...");
      setError(null);
      setIsLoading(true);

      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 300));

      // Redirect to login with registered param
      window.location.href = "/login?registered=true";
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-2xl ${className}`} style={{ position: 'relative', zIndex: 1 }}>
      <div className="bg-white rounded-2xl shadow-xl border-2 border-green-100 p-8" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-2">Join our agricultural community</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              I am a <span className="text-red-500">*</span>
            </label>
            {/* Hidden radio inputs for bot compatibility - visually hidden but accessible */}
            <div className="sr-only">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="CONSUMER"
                  checked={formData.role === "CONSUMER"}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                  data-testid="role-consumer"
                />
                Consumer
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="FARMER"
                  checked={formData.role === "FARMER"}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                  data-testid="role-farmer"
                />
                Farmer
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <button
                type="button"
                data-testid="role-consumer-button"
                onClick={() => setFormData((prev) => ({ ...prev, role: "CONSUMER" }))}
                className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${formData.role === "CONSUMER"
                  ? "border-green-600 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
                  }`}
                style={{ pointerEvents: 'auto' }}
              >
                <div className="flex items-center justify-center mb-2 pointer-events-none">
                  <svg
                    className={`w-8 h-8 ${formData.role === "CONSUMER" ? "text-green-600" : "text-gray-400"
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <span
                  className={`font-semibold pointer-events-none ${formData.role === "CONSUMER" ? "text-green-700" : "text-gray-700"
                    }`}
                >
                  Customer
                </span>
                <p className="text-xs text-gray-500 mt-1 pointer-events-none">Buy fresh produce</p>
              </button>

              <button
                type="button"
                data-testid="role-farmer-button"
                onClick={() => setFormData((prev) => ({ ...prev, role: "FARMER" }))}
                className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${formData.role === "FARMER"
                  ? "border-green-600 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
                  }`}
                style={{ pointerEvents: 'auto' }}
              >
                <div className="flex items-center justify-center mb-2 pointer-events-none">
                  <svg
                    className={`w-8 h-8 ${formData.role === "FARMER" ? "text-green-600" : "text-gray-400"
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <span
                  className={`font-semibold pointer-events-none ${formData.role === "FARMER" ? "text-green-700" : "text-gray-700"
                    }`}
                >
                  Farmer
                </span>
                <p className="text-xs text-gray-500 mt-1 pointer-events-none">Sell your products</p>
              </button>
            </div>
          </div>

          {/* Full Name field - primary field for bot compatibility */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={`${formData.firstName} ${formData.lastName}`.trim()}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="John Doe"
            />
            <p className="mt-1 text-xs text-gray-500">Enter your full name (first and last)</p>
          </div>

          {/* Hidden fields to store split name values */}
          <input type="hidden" id="firstName" name="firstName" value={formData.firstName} />
          <input type="hidden" id="lastName" name="lastName" value={formData.lastName} />

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number (Optional)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="+1 (555) 123-4567"
              autoComplete="tel"
            />
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Password Requirements */}
          <div className="text-xs text-gray-600 space-y-1">
            <p className="font-semibold">Password must contain:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>At least 8 characters</li>
              <li>One uppercase letter (A-Z)</li>
              <li>One lowercase letter (a-z)</li>
              <li>One number (0-9)</li>
            </ul>
          </div>

          {/* Farm Details (Farmer Only) */}
          {formData.role === "FARMER" && (
            <div className="border-t-2 border-green-100 pt-6 mt-6 space-y-4">
              <div className="flex items-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Farm Information</h3>
              </div>

              <div>
                <label htmlFor="farmName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Farm Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="farmName"
                  name="farmName"
                  type="text"
                  value={formData.farmName}
                  onChange={handleChange}
                  required={formData.role === "FARMER"}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Green Valley Farm"
                />
              </div>

              <div>
                <label
                  htmlFor="farmAddress"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Farm Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="farmAddress"
                  name="farmAddress"
                  type="text"
                  value={formData.farmAddress}
                  onChange={handleChange}
                  required={formData.role === "FARMER"}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="123 Farm Road, Rural County"
                />
              </div>

              <div>
                <label
                  htmlFor="farmDescription"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Farm Description (Optional)
                </label>
                <textarea
                  id="farmDescription"
                  name="farmDescription"
                  value={formData.farmDescription}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                  placeholder="Tell customers about your farm..."
                />
              </div>
            </div>
          )}

          {/* Terms of Service Agreement */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData((prev) => ({ ...prev, agreeToTerms: e.target.checked }))}
                disabled={isLoading}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 disabled:cursor-not-allowed"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agreeToTerms" className="text-gray-700">
                I agree to the{" "}
                <a href="/terms" target="_blank" className="text-green-600 hover:text-green-700 font-semibold">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" target="_blank" className="text-green-600 hover:text-green-700 font-semibold">
                  Privacy Policy
                </a>
                <span className="text-red-500"> *</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating Account...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-green-600 hover:text-green-700 font-semibold">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
