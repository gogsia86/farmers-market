/**
 * PROTECTED ROUTE WRAPPER - AUTHENTICATION GUARD
 *
 * Higher-order component that wraps pages requiring authentication.
 * Redirects unauthenticated users to login page.
 *
 * Usage:
 * ```tsx
 * export default withAuth(MyProtectedPage);
 * ```
 */

"use client";

import { useSession } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { ComponentType, useEffect } from "react";

interface WithAuthOptions {
  redirectTo?: string;
  requiredRole?: "USER" | "FARMER" | "ADMIN" | "SUPER_ADMIN";
}

export function withAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthOptions = {},
) {
  return function ProtectedRoute(props: P) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    const { redirectTo = "/login", requiredRole } = options;

    useEffect(() => {
      if (status === "loading") return;

      // Not authenticated - redirect to login
      if (status === "unauthenticated") {
        const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname || "/")}`;
        router.push(loginUrl);
        return;
      }

      // Check role requirements
      if (requiredRole && session?.user?.role !== requiredRole) {
        router.push("/unauthorized");
      }
    }, [status, session, router, pathname]);

    // Show loading state
    if (status === "loading") {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-agricultural-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Don't render if not authenticated or wrong role
    if (status === "unauthenticated") {
      return null;
    }

    if (requiredRole && session?.user?.role !== requiredRole) {
      return null;
    }

    // Render protected component
    return <Component {...props} />;
  };
}

/**
 * Hook version for use inside components
 */
export function useAuth(options: WithAuthOptions = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const { redirectTo = "/login", requiredRole } = options;

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname || "/")}`;
      router.push(loginUrl);
      return;
    }

    if (requiredRole && session?.user?.role !== requiredRole) {
      router.push("/unauthorized");
    }
  }, [status, session, router, pathname, redirectTo, requiredRole]);

  return {
    user: session?.user,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
