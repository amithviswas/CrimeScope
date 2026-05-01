"use client";
export const dynamic = "force-dynamic";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";

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

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: "",            color: "transparent" },
    { label: "Weak",        color: "var(--color-accent-danger)" },
    { label: "Fair",        color: "var(--color-accent-warning)" },
    { label: "Good",        color: "#ffdd57" },
    { label: "Strong",      color: "var(--color-accent-safe)" },
    { label: "Very strong", color: "var(--color-accent-safe)" },
  ];
  return { score, ...levels[score] };
}

function SignupForm() {
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const redirect      = searchParams.get("redirect") ?? "/dashboard";

  const [showPw, setShowPw]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fullName, setFullName]       = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [terms, setTerms]             = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState(false);

  const strength = passwordStrength(password);

  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/api/v1/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim() || !email || !password || !confirm) { setError("All fields are required."); return; }
    if (password !== confirm)       { setError("Passwords do not match."); return; }
    if (!terms)                     { setError("You must accept the terms to continue."); return; }
    if (strength.score < 2)         { setError("Please choose a stronger password (min 8 chars, 1 uppercase, 1 number)."); return; }

    setLoading(true);
    try {
      await authApi.register({ full_name: fullName.trim(), email, password });
      setSuccess(true);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="card text-center" style={{ padding: "48px 32px" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(0,212,255,0.1)",
          border: "1px solid rgba(0,212,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px" }}>
          <Check className="h-7 w-7" style={{ color: "var(--color-accent-primary)" }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.375rem", marginBottom: 10 }}>
          Account created!
        </h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: 28 }}>
          We sent a verification link to <strong style={{ color: "var(--color-text-primary)" }}>{email}</strong>.
          Click the link in your email to activate your account, then sign in.
        </p>
        <Link href="/login" className="btn btn-primary w-full text-center justify-center">
          Go to Sign In →
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="card">
      {/* Google OAuth */}
      <button type="button" id="signup-google-btn"
        onClick={handleGoogleSignup}
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
          <div className="mb-4 px-4 py-3 rounded-lg text-sm"
            style={{ background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.2)", color: "var(--color-accent-danger)" }}>
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="signup-name" className="label">Full name</label>
          <input id="signup-name" type="text" className="input" placeholder="Jane Doe"
            value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required />
        </div>

        <div className="mb-4">
          <label htmlFor="signup-email" className="label">Email address</label>
          <input id="signup-email" type="email" className="input" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </div>

        <div className="mb-2">
          <label htmlFor="signup-password" className="label">Password</label>
          <div className="relative">
            <input id="signup-password" type={showPw ? "text" : "password"} className="input pr-12"
              placeholder="Min. 8 characters" value={password}
              onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2" aria-label={showPw ? "Hide" : "Show"} id="signup-toggle-pw">
              {showPw ? <EyeOff className="h-4 w-4" style={{ color: "var(--color-text-muted)" }} />
                      : <Eye    className="h-4 w-4" style={{ color: "var(--color-text-muted)" }} />}
            </button>
          </div>
        </div>

        {password.length > 0 && (
          <div className="mb-4">
            <div className="flex gap-1 mb-1">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="h-1 flex-1 rounded-full transition-colors duration-300"
                  style={{ background: i <= strength.score ? strength.color : "var(--color-border)" }} />
              ))}
            </div>
            {strength.label && (
              <p className="text-xs" style={{ color: strength.color }}>{strength.label} password</p>
            )}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="signup-confirm" className="label">Confirm password</label>
          <div className="relative">
            <input id="signup-confirm" type={showConfirm ? "text" : "password"}
              className={cn("input pr-12", confirm && confirm !== password && "error")}
              placeholder="Repeat password" value={confirm}
              onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
            <button type="button" onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Toggle confirm" id="signup-toggle-confirm">
              {showConfirm ? <EyeOff className="h-4 w-4" style={{ color: "var(--color-text-muted)" }} />
                           : <Eye    className="h-4 w-4" style={{ color: "var(--color-text-muted)" }} />}
            </button>
          </div>
          {confirm && confirm !== password && (
            <p className="text-xs mt-1" style={{ color: "var(--color-accent-danger)" }}>Passwords do not match.</p>
          )}
        </div>

        <label htmlFor="signup-terms" className="flex items-start gap-3 mb-6 cursor-pointer">
          <div className="relative mt-0.5">
            <input id="signup-terms" type="checkbox" checked={terms}
              onChange={(e) => setTerms(e.target.checked)} className="sr-only" aria-label="Accept terms" />
            <div onClick={() => setTerms((v) => !v)}
              className="w-4 h-4 rounded flex items-center justify-center transition-colors"
              style={{ background: terms ? "var(--color-accent-primary)" : "var(--color-bg-tertiary)",
                border: `1px solid ${terms ? "var(--color-accent-primary)" : "var(--color-border)"}`, cursor: "pointer" }}>
              {terms && <Check className="h-3 w-3" style={{ color: "#0a0e1a" }} />}
            </div>
          </div>
          <span style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", lineHeight: 1.5 }}>
            I agree to the{" "}
            <Link href="/terms"   style={{ color: "var(--color-accent-primary)" }}>Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" style={{ color: "var(--color-accent-primary)" }}>Privacy Policy</Link>
          </span>
        </label>

        <motion.button type="submit" id="signup-submit-btn"
          className="btn btn-primary w-full justify-center"
          disabled={loading} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
          {loading ? "Creating account…" : "Create Free Account"}
        </motion.button>
      </form>
    </div>
  );
}

export default function SignupPage() {
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
          <Link href="/" className="inline-flex items-center gap-2.5 no-underline">
            <LogoMark />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text-primary)" }}>
              CrimeScope
            </span>
          </Link>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1.75rem", color: "var(--color-text-primary)", letterSpacing: "-0.02em", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
            Create your account
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}>Free tier — no credit card required</p>
        </div>
        <Suspense fallback={null}>
          <SignupForm />
        </Suspense>
        <p className="text-center mt-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--color-accent-primary)" }} id="signup-login-link">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
