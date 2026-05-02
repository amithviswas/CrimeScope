"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * /auth/callback — OAuth token landing page.
 *
 * After a successful Google OAuth flow, the backend redirects here with:
 *   ?access_token=<jwt>&refresh_token=<jwt>&expires_in=3600
 *
 * This page stores the tokens and forwards the user to /dashboard.
 * It runs entirely client-side so Next.js never tries to SSR it.
 */
function CallbackHandler() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const access_token  = searchParams.get("access_token");
    const refresh_token = searchParams.get("refresh_token");
    const expires_in    = searchParams.get("expires_in") ?? "3600";

    if (!access_token) {
      // No token → something went wrong, send to login
      router.replace("/login?error=oauth_failed");
      return;
    }

    // Store tokens in localStorage so the API client can attach them
    // as Authorization: Bearer headers on every request.
    localStorage.setItem("access_token",  access_token);
    localStorage.setItem("refresh_token", refresh_token ?? "");
    localStorage.setItem("token_expires_at", String(Date.now() + Number(expires_in) * 1000));

    // Also set a cookie that middleware can read (not httpOnly — JS needs it too)
    const maxAge = Number(expires_in);
    document.cookie = `access_token=${access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;

    router.replace("/dashboard");
  }, [searchParams, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-primary, #0a0e1a)",
        color: "var(--color-text-primary, #fff)",
        gap: 16,
      }}
    >
      {/* Spinner */}
      <svg
        width="40" height="40" viewBox="0 0 40 40"
        style={{ animation: "spin 1s linear infinite" }}
        aria-hidden
      >
        <circle cx="20" cy="20" r="16" fill="none" stroke="#00d4ff" strokeWidth="3"
          strokeDasharray="80" strokeDashoffset="20" strokeLinecap="round" />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </svg>
      <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary, #8892a4)" }}>
        Signing you in…
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackHandler />
    </Suspense>
  );
}
