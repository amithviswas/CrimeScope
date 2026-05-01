import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Types ─────────────────────────────────────────────────────────────────────

export type DateRange = "7d" | "30d" | "90d" | "custom";

export interface DateRangeCustom {
  from: string; // ISO date string
  to: string;
}

export interface AppState {
  // UI State
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // City / Filter State
  selectedCity: string;
  setSelectedCity: (city: string) => void;

  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;

  customDateRange: DateRangeCustom | null;
  setCustomDateRange: (range: DateRangeCustom | null) => void;

  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;

  selectedDistrict: string | null;
  setSelectedDistrict: (district: string | null) => void;

  // Map State
  mapStyle: "heatmap" | "clusters" | "both";
  setMapStyle: (style: "heatmap" | "clusters" | "both") => void;

  show3DBuildings: boolean;
  setShow3DBuildings: (show: boolean) => void;

  // Auth State
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    plan: "free" | "pro" | "enterprise";
  } | null;
  setUser: (user: AppState["user"]) => void;
  clearUser: () => void;

  isAuthenticated: boolean;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // ── UI
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // ── Filters
      selectedCity: "Chicago",
      setSelectedCity: (city) => set({ selectedCity: city }),

      dateRange: "30d",
      setDateRange: (range) => set({ dateRange: range }),

      customDateRange: null,
      setCustomDateRange: (range) => set({ customDateRange: range }),

      selectedCategories: [],
      setSelectedCategories: (categories) =>
        set({ selectedCategories: categories }),

      selectedDistrict: null,
      setSelectedDistrict: (district) => set({ selectedDistrict: district }),

      // ── Map
      mapStyle: "heatmap",
      setMapStyle: (style) => set({ mapStyle: style }),

      show3DBuildings: false,
      setShow3DBuildings: (show) => set({ show3DBuildings: show }),

      // ── Auth
      user: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
      isAuthenticated: false,
    }),
    {
      name: "crimescope-app-state",
      // Only persist these keys across page refreshes
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        selectedCity: state.selectedCity,
        dateRange: state.dateRange,
        mapStyle: state.mapStyle,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
