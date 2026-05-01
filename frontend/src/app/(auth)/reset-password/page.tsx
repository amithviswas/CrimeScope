"use client";

import { motion } from "framer-motion";
import { KeyRound, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";

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

function ResetForm() {
  const router  = useRouter();
  const params  = useSearchParams();
  const token   = params.get("token") ?? "";

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);

  if (!token) {
    return (
      <div className="card text-center" style={{ padding: "40px 32px" }}>
        <AlertCircle className="h-8 w-8 mx-auto mb-4" style={{ color: "var(--color-accent-danger)" }} />
        <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", marginBottom: 10 }}>Invalid Reset Link</h2>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: 24 }}>This link is missing the reset token. Please request a new one.</p>
        <Link href="/forgot-password" className="btn btn-primary w-full text-center justify-center">Request New Link</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!password) { setError("Please enter a new password."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm)  { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await authApi.resetPw(token, password);
      setSuccess(true);
      setTimeout(() => router.push("/login?verified=true"), 2500);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="card text-center" style={{ padding: "40px 32px" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(0,212,255,0.1)",
          border: "1px solid rgba(0,212,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <CheckCircle className="h-7 w-7" style={{ color: "var(--color-accent-primary)" }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", marginBottom: 10 }}>Password updated!</h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}>Redirecting to sign in…</p>
      </motion.div>
    );
  }

  return (
    <div className="card">
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(0,212,255,0.08)",
        border: "1px solid rgba(0,212,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
        <KeyRound className="h-5 w-5" style={{ color: "var(--color-accent-primary)" }} />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
            style={{ background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.2)", color: "var(--color-accent-danger)" }}>
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="reset-password" className="label">New password</label>
          <div className="relative">
            <input id="reset-password" type={showPw ? "text" : "password"} className="input pr-12"
              placeholder="Min. 8 characters, 1 uppercase, 1 number"
              value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Toggle password" id="reset-toggle-pw">
              {showPw ? <EyeOff className="h-4 w-4" style={{ color: "var(--color-text-muted)" }} />
                      : <Eye    className="h-4 w-4" style={{ color: "var(--color-text-muted)" }} />}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="reset-confirm" className="label">Confirm new password</label>
          <input id="reset-confirm" type="password" className="input"
            placeholder="Repeat password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
          {confirm && confirm !== password && (
            <p className="text-xs mt-1" style={{ color: "var(--color-accent-danger)" }}>Passwords do not match.</p>
          )}
        </div>

        <motion.button type="submit" id="reset-submit-btn"
          className="btn btn-primary w-full justify-center"
          disabled={loading} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
          {loading ? "Updating…" : "Set New Password"}
        </motion.button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
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
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text-primary)" }}>CrimeScope</span>
          </Link>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1.75rem", color: "var(--color-text-primary)", letterSpacing: "-0.02em", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
            Set new password
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}>Must be at least 8 characters</p>
        </div>
        <Suspense fallback={null}>
          <ResetForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
