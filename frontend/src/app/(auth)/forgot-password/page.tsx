"use client";

import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Please enter your email address."); return; }
    setLoading(true);
    try {
      await authApi.forgotPw(email);
      setSent(true);
    } catch {
      // Always show success (prevent user enumeration)
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

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
            Reset your password
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}>
            {sent ? "Check your inbox" : "We'll send you a reset link"}
          </p>
        </div>

        {!sent ? (
          <div className="card">
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(0,212,255,0.08)",
              border: "1px solid rgba(0,212,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
              <Mail className="h-5 w-5" style={{ color: "var(--color-accent-primary)" }} />
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg text-sm"
                  style={{ background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.2)", color: "var(--color-accent-danger)" }}>
                  {error}
                </div>
              )}
              <div className="mb-6">
                <label htmlFor="forgot-email" className="label">Email address</label>
                <input id="forgot-email" type="email" className="input" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
              </div>
              <motion.button type="submit" id="forgot-submit-btn"
                className="btn btn-primary w-full justify-center"
                disabled={loading} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                {loading ? "Sending…" : "Send Reset Link"}
              </motion.button>
            </form>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="card text-center" style={{ padding: "40px 32px" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(0,212,255,0.1)",
              border: "1px solid rgba(0,212,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle className="h-7 w-7" style={{ color: "var(--color-accent-primary)" }} />
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", marginBottom: 10 }}>Check your email</h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: 28 }}>
              If <strong style={{ color: "var(--color-text-primary)" }}>{email}</strong> is registered, you'll receive a reset link within 1 minute. The link expires in 15 minutes.
            </p>
            <Link href="/login" className="btn btn-ghost w-full text-center justify-center"
              style={{ border: "1px solid var(--color-border)" }}>
              Back to Sign In
            </Link>
          </motion.div>
        )}

        <p className="text-center mt-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/login" className="inline-flex items-center gap-1.5"
            style={{ color: "var(--color-text-secondary)" }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
