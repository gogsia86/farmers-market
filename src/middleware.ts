import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Divine Admin Route Protection Middleware
 * Agricultural consciousness-aware authentication and authorization
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow non-admin routes to pass through
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Check for valid authentication token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log("🌾 Agricultural Route Protection:", {
    path: pathname,
    userRole: token?.role,
    consciousness: "divine",
    timestamp: new Date().toISOString(),
  });

  // Redirect to login if not authenticated
  if (!token) {
    const loginUrl = new URL("/admin-login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify admin role
  const userRole = token.role as string;
  const isAdminRole = ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(userRole);

  if (!isAdminRole) {
    const homeUrl = new URL("/?error=insufficient_permissions", req.url);
    return NextResponse.redirect(homeUrl);
  }

  // Super admin only routes
  if (pathname.startsWith("/admin/settings") && userRole !== "SUPER_ADMIN") {
    const dashboardUrl = new URL("/admin?error=access_denied", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Moderators cannot delete
  if (pathname.includes("/delete") && userRole === "MODERATOR") {
    const referrer = req.headers.get("referer") || "/admin";
    const backUrl = new URL(referrer);
    backUrl.searchParams.set("error", "insufficient_permissions");
    return NextResponse.redirect(backUrl);
  }

  // Add divine headers to response
  const response = NextResponse.next();
  response.headers.set("X-Agricultural-Consciousness", "active");
  response.headers.set("X-Admin-Role", userRole);
  response.headers.set("X-Divine-Protection", "enabled");

  return response;
}

// Configure which routes this middleware runs on
export const config = {
  matcher: ["/admin/:path*"],
};
