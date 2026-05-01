"use client";
export const dynamic = "force-dynamic";

import { motion } from "framer-motion";
import Link from "next/link";
import { Suspense, useState } from "react";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M16 2L4 7v9c0 7.18 5.14 13.89 12 15.93C23.86 29.89 29 23.18 29 16V7L16 2z"
        fill="none" stroke="#00d4ff" strokeWidth="1.5" />
      <polyline points="8,16 11,12 14,18 17,10 20,16 23,14"
        fill="none" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const { login }  = useAuthStore();
  const router     = useRouter();
  const params     = useSearchParams();
  const redirect   = params.get("redirect") ?? "/dashboard";

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/v1/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Email and password are required."); return; }
    setLoading(true);
    try {
      await login(email, password);
      router.push(redirect);
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? "Invalid email or password.";
      setError(typeof msg === "string" ? msg : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      {/* Google OAuth */}
      <button type="button" id="login-google-btn"
        onClick={handleGoogleLogin}
        className="btn btn-secondary w-full justify-center mb-6" style={{ gap: 12 }}>
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-4 mb-6">
        <hr className="divider flex-1" style={{ margin: 0 }} />
        <span style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>or</span>
        <hr className="divider flex-1" style={{ margin: 0 }} />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
            style={{ background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.2)", color: "var(--color-accent-danger)" }}>
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="login-email" className="label">Email address</label>
          <input id="login-email" type="email" className="input" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </div>

        <div className="mb-2">
          <label htmlFor="login-password" className="label">Password</label>
          <div className="relative">
            <input id="login-password" type={showPassword ? "text" : "password"}
              className="input pr-12" placeholder="Enter your password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password" required />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-label={showPassword ? "Hide password" : "Show password"}
              id="toggle-password-visibility">
              {showPassword
                ? <EyeOff className="h-4 w-4" style={{ color: "var(--color-text-muted)" }} />
                : <Eye    className="h-4 w-4" style={{ color: "var(--color-text-muted)" }} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <Link href="/forgot-password" className="text-sm" style={{ color: "var(--color-accent-primary)" }}
            id="forgot-password-link">
            Forgot password?
          </Link>
        </div>

        <motion.button type="submit" id="login-submit-btn"
          className="btn btn-primary w-full justify-center"
          disabled={loading} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
          {loading ? "Signing in…" : "Sign In"}
        </motion.button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const verified = params?.get("verified") === "true";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`,
        backgroundSize: "48px 48px"
      }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 no-underline mb-4">
            <LogoMark />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text-primary)" }}>
              CrimeScope
            </span>
          </Link>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1.75rem", color: "var(--color-text-primary)", letterSpacing: "-0.02em", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
            Sign in to your account
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}>
            Urban Safety Intelligence — Powered by Data
          </p>
        </div>

        {verified && (
          <div className="mb-4 px-4 py-3 rounded-lg flex items-center gap-3"
            style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "var(--color-accent-primary)" }}>
            <CheckCircle className="h-4 w-4" />
            Email verified! You can now sign in.
          </div>
        )}

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <p className="text-center mt-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "var(--color-accent-primary)" }} id="login-signup-link">
            Create one free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
