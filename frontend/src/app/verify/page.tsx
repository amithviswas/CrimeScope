"use client";

import { CheckCircle, AlertCircle, Loader } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function VerifyContent() {
  const params = useSearchParams();
  const verifyStatus = params.get("status");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (verifyStatus !== "success") return;
    const t = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(t);
          window.location.href = "/login?verified=true";
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [verifyStatus]);

  if (verifyStatus === "success") {
    return (
      <div className="text-center">
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(0,212,255,0.1)",
          border: "1px solid rgba(0,212,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <CheckCircle className="h-9 w-9" style={{ color: "var(--color-accent-primary)" }} />
        </div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.875rem", color: "var(--color-text-primary)", marginBottom: 12 }}>
          Email Verified! 🎉
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem", lineHeight: 1.6, marginBottom: 28 }}>
          Your CrimeScope account is now active.<br/>
          Redirecting to sign in in <strong style={{ color: "var(--color-accent-primary)" }}>{countdown}</strong> seconds…
        </p>
        <Link href="/login?verified=true" className="btn btn-primary">
          Sign In Now →
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,71,87,0.1)",
        border: "1px solid rgba(255,71,87,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
        <AlertCircle className="h-9 w-9" style={{ color: "var(--color-accent-danger)" }} />
      </div>
      <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.875rem", color: "var(--color-text-primary)", marginBottom: 12 }}>
        Verification Failed
      </h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem", lineHeight: 1.6, marginBottom: 28 }}>
        This verification link is invalid or has expired.<br />
        Links are valid for 24 hours after registration.
      </p>
      <div className="flex flex-col gap-3 items-center">
        <Link href="/signup" className="btn btn-primary">Create New Account</Link>
        <Link href="/login" className="btn btn-ghost" style={{ border: "1px solid var(--color-border)" }}>Back to Sign In</Link>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`,
        backgroundSize: "48px 48px"
      }} />
      <div className="card w-full max-w-md relative z-10" style={{ padding: "56px 40px" }}>
        <Suspense fallback={
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: "var(--color-accent-primary)" }} />
            <p style={{ color: "var(--color-text-muted)" }}>Verifying…</p>
          </div>
        }>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
