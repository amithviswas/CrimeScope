"use client";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import { Bell, ChevronDown, RefreshCw } from "lucide-react";
import { useState } from "react";

// ── City options ───────────────────────────────────────────────────────────────
const CITIES = [
  "Chicago",
  "New York",
  "Los Angeles",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
];

// ── Date range options ─────────────────────────────────────────────────────────
const DATE_RANGES = [
  { label: "Last 7 days",  value: "7d"  as const },
  { label: "Last 30 days", value: "30d" as const },
  { label: "Last 90 days", value: "90d" as const },
  { label: "Custom",       value: "custom" as const },
];

// ── TopBar ─────────────────────────────────────────────────────────────────────
export function TopBar({ pageTitle }: { pageTitle?: string }) {
  const {
    selectedCity,
    setSelectedCity,
    dateRange,
    setDateRange,
  } = useAppStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Trigger data refetch (real implementation will invalidate React Query cache)
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const currentDateLabel =
    DATE_RANGES.find((d) => d.value === dateRange)?.label ?? "Last 30 days";

  return (
    <header
      className="flex items-center justify-between px-6 py-4 gap-4 sticky top-0 z-30"
      style={{
        background: "rgba(10, 14, 26, 0.85)",
        borderBottom: "1px solid var(--color-border)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      id="top-bar"
    >
      {/* Left — Page title or city selector */}
      <div className="flex items-center gap-4">
        {pageTitle && (
          <h1
            className="text-xl font-semibold"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            {pageTitle}
          </h1>
        )}

        {/* City Selector */}
        <div className="relative" id="city-selector">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="input pr-8 appearance-none cursor-pointer text-sm"
            style={{
              paddingTop: "8px",
              paddingBottom: "8px",
              paddingLeft: "12px",
              paddingRight: "32px",
              width: "auto",
              minWidth: "140px",
            }}
            aria-label="Select city"
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
            style={{ color: "var(--color-text-muted)" }}
          />
        </div>

        {/* Date Range Selector */}
        <div className="relative" id="date-range-selector">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className="input pr-8 appearance-none cursor-pointer text-sm"
            style={{
              paddingTop: "8px",
              paddingBottom: "8px",
              paddingLeft: "12px",
              paddingRight: "32px",
              width: "auto",
              minWidth: "140px",
            }}
            aria-label="Select date range"
          >
            {DATE_RANGES.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
            style={{ color: "var(--color-text-muted)" }}
          />
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">
        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="btn btn-ghost btn-sm"
          aria-label="Refresh data"
          id="refresh-btn"
        >
          <RefreshCw
            className={cn("h-4 w-4 transition-transform", isRefreshing && "animate-spin")}
          />
          <span className="hidden md:inline">Refresh</span>
        </button>

        {/* Notification bell */}
        <button
          className="relative btn btn-ghost btn-sm p-2"
          aria-label="Notifications"
          id="notification-bell"
        >
          <Bell className="h-4 w-4" style={{ color: "var(--color-text-secondary)" }} />
          {/* Unread dot */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: "var(--color-accent-danger)" }}
            aria-hidden="true"
          />
        </button>
      </div>
    </header>
  );
}
