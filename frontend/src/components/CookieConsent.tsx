"use client";

import { useEffect, useState } from "react";
import { X, Cookie } from "lucide-react";

type ConsentState = "accepted" | "declined" | null;

const STORAGE_KEY = "cs_cookie_consent";

export function CookieConsent() {
  const [state, setState] = useState<ConsentState | "loading">("loading");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentState | null;
    setState(stored ?? null);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setState("accepted");
    // PostHog opt-in when analytics consent given
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.opt_in_capturing();
    }
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setState("declined");
    // PostHog opt-out if declined
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.opt_out_capturing();
    }
  };

  // Don't flash on server render or if already decided
  if (state === "loading" || state === "accepted" || state === "declined") {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="max-w-2xl mx-auto bg-[#131929] border border-white/15 rounded-2xl shadow-2xl shadow-black/60 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Icon */}
        <div className="shrink-0 w-10 h-10 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff]">
          <Cookie size={18} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#e2e8f0] font-medium mb-0.5">We use cookies</p>
          <p className="text-xs text-[#64748b] leading-relaxed">
            We use analytics cookies (PostHog) to improve CrimeScope. These are optional — core
            functionality works without them.{" "}
            <a href="/privacy" className="text-[#00d4ff] hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm text-[#64748b] hover:text-[#94a3b8] border border-white/10 rounded-lg transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm font-semibold bg-[#00d4ff] text-[#0a0e1a] rounded-lg hover:bg-[#00d4ff]/90 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={decline}
            aria-label="Dismiss"
            className="p-1.5 text-[#475569] hover:text-[#94a3b8] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Returns the current consent state — use to gate analytics initialization */
export function getCookieConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem(STORAGE_KEY) as ConsentState) ?? null;
}
