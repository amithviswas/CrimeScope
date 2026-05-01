/**
 * CrimeScope Auth Store — Zustand (Phase 6)
 * Manages user state, login/logout, plan checking.
 * Sets a cs_authenticated indicator cookie so the Next.js middleware
 * can detect authenticated state on the edge without reading localStorage.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "@/lib/api";

export type Plan = "free" | "pro" | "enterprise" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  plan: Plan;
  is_verified: boolean;
  is_superuser: boolean;
}

interface AuthState {
  user:            AuthUser | null;
  token:           string | null;
  isLoading:       boolean;
  isAuthenticated: boolean;

  // Actions
  login:    (email: string, password: string) => Promise<void>;
  logout:   () => Promise<void>;
  fetchMe:  () => Promise<void>;
  setUser:  (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
}

// ── Cookie helpers (client-side, non-httpOnly indicator) ────────────────────

function setIndicatorCookie(value: boolean) {
  if (typeof document === "undefined") return;
  if (value) {
    document.cookie = "cs_authenticated=1; path=/; max-age=86400; samesite=lax";
  } else {
    document.cookie = "cs_authenticated=; path=/; max-age=0; samesite=lax";
  }
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      token:           null,
      isLoading:       false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login({ email, password });
          const { access_token, user } = res.data;
          localStorage.setItem("access_token", access_token);
          setIndicatorCookie(true);
          set({ token: access_token, user, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;   // re-throw so login page can show error
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          localStorage.removeItem("access_token");
          setIndicatorCookie(false);
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const res = await authApi.me();
          setIndicatorCookie(true);
          set({ user: res.data, isAuthenticated: true, isLoading: false });
        } catch {
          localStorage.removeItem("access_token");
          setIndicatorCookie(false);
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },

      setUser:  (user)  => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
    }),
    {
      name: "crimescope-auth",
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

// ── Plan rank helpers ──────────────────────────────────────────────────────

const PLAN_RANK: Record<Plan, number> = {
  free: 0, pro: 1, enterprise: 2, admin: 3,
};

export function hasPlan(user: AuthUser | null, required: Plan): boolean {
  if (!user) return false;
  return PLAN_RANK[user.plan] >= PLAN_RANK[required];
}
