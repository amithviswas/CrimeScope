/**
 * Google OAuth Callback — Next.js API Route
 *
 * Google redirects here after the user approves the consent screen.
 * We proxy the `code` and `state` to the backend's OAuth callback endpoint
 * which validates, creates/links the user, sets httpOnly cookies, and
 * redirects to /dashboard.
 *
 * Google Console Authorized Redirect URIs:
 *   Local:      http://localhost:3000/api/auth/callback/google
 *   Railway:    https://<your-railway-app>.up.railway.app/api/auth/callback/google
 *   Vercel:     https://<your-vercel-app>.vercel.app/api/auth/callback/google
 */
import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Forward OAuth errors back to login with a message
  if (error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", error);
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "missing_code");
    return NextResponse.redirect(loginUrl);
  }

  // Forward to backend callback — it validates the state/nonce (stored in
  // its own session cookie) and exchanges the code for tokens.
  const backendCallback = new URL(
    `/api/v1/auth/google/callback`,
    BACKEND_URL
  );
  if (code)  backendCallback.searchParams.set("code", code);
  if (state) backendCallback.searchParams.set("state", state);

  // Copy the session cookie from the original request so the backend can
  // verify the OAuth state parameter it set during the /auth/google redirect.
  const sessionCookie = request.cookies.get("session")?.value;
  const headers: HeadersInit = {
    "Cookie": sessionCookie ? `session=${sessionCookie}` : "",
  };

  // The backend will respond with a redirect (302) to /dashboard.
  // We need to follow redirects manually and carry Set-Cookie headers back.
  try {
    const backendRes = await fetch(backendCallback.toString(), {
      method: "GET",
      headers,
      redirect: "manual",   // don't auto-follow — we need to inspect headers
    });

    // The backend returns a 302 to /dashboard with Set-Cookie (access/refresh tokens)
    if (backendRes.status === 302 || backendRes.status === 307) {
      const location = backendRes.headers.get("location") ?? "/dashboard";

      // If the backend redirected to the frontend URL, strip it to get just the path
      const redirectUrl = location.startsWith("http")
        ? new URL(location).pathname + new URL(location).search
        : location;

      const response = NextResponse.redirect(new URL(redirectUrl, request.url));

      // Forward all Set-Cookie headers from the backend (access_token, refresh_token)
      backendRes.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") {
          response.headers.append("Set-Cookie", value);
        }
      });

      // Also forward the session cookie update
      if (backendRes.headers.get("set-cookie")) {
        const newSession = backendRes.headers.get("set-cookie")?.match(/session=([^;]+)/)?.[1];
        if (newSession) {
          response.cookies.set("session", newSession, { httpOnly: true, sameSite: "lax" });
        }
      }

      return response;
    }

    // Backend returned an error — redirect to login with error message
    const body = await backendRes.text().catch(() => "OAuth error");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "oauth_failed");
    return NextResponse.redirect(loginUrl);

  } catch (err) {
    console.error("[Google OAuth callback] Failed to reach backend:", err);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "server_error");
    return NextResponse.redirect(loginUrl);
  }
}
