import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED_PATHS = [
  "/dashboard",
  "/analytics",
  "/map",
  "/alerts",
  "/settings",
  "/reports",
];

// Routes that are only accessible to unauthenticated users
const AUTH_ONLY_PATHS = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for access token in cookies OR Authorization header
  const token =
    request.cookies.get("access_token")?.value ||
    request.headers.get("Authorization")?.replace("Bearer ", "") ||
    "";

  // Also check localStorage-persisted token via a custom cookie set by the client
  // The auth store sets "cs_authenticated" as a plain (non-httpOnly) indicator cookie
  const isAuthenticated = !!token || !!request.cookies.get("cs_authenticated")?.value;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p));

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login/signup to dashboard
  if (isAuthOnly && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image  (Next.js image optimization)
     * - favicon.ico
     * - public folder files
     * - API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
