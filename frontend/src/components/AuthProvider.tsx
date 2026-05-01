"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";

/**
 * AuthProvider — runs fetchMe() on first render to hydrate the
 * Zustand auth store from the current session (httpOnly cookie).
 * This ensures protected pages know the user is logged in after
 * a Google OAuth redirect or a new browser tab.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    // Only fetch if there's a potential session (access_token in LS or indicator cookie)
    const hasToken = localStorage.getItem("access_token") ||
      document.cookie.includes("cs_authenticated=1") ||
      document.cookie.includes("access_token=");
    if (hasToken) {
      fetchMe();
    }
  }, [fetchMe]);

  return <>{children}</>;
}
