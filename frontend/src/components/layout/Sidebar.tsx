"use client";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import {
  BarChart2,
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Home,
  Map,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ── Brand Logo Mark (SVG) ──────────────────────────────────────────────────
function CrimeScopeLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 no-underline" id="nav-logo">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="CrimeScope logo"
        style={{ flexShrink: 0 }}
      >
        {/* Shield */}
        <path
          d="M16 2L4 7v9c0 7.18 5.14 13.89 12 15.93C23.86 29.89 29 23.18 29 16V7L16 2z"
          fill="none"
          stroke="#00d4ff"
          strokeWidth="1.5"
        />
        {/* Data pulse line through center */}
        <polyline
          points="8,16 11,12 14,18 17,10 20,16 23,14"
          fill="none"
          stroke="#00d4ff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {!collapsed && (
        <div>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "1.125rem",
              color: "var(--color-text-primary)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            CrimeScope
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.6875rem",
              color: "var(--color-accent-primary)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Urban Safety Intel
          </div>
        </div>
      )}
    </Link>
  );
}

// ── Nav Items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard",  icon: Home     },
  { href: "/map",       label: "Crime Map",  icon: Map      },
  { href: "/analytics", label: "Analytics",  icon: BarChart2 },
  { href: "/alerts",    label: "Alerts",     icon: Bell     },
  { href: "/reports",   label: "Reports",    icon: FileText },
];

const BOTTOM_ITEMS = [
  { href: "/settings", label: "Settings", icon: Settings  },
  { href: "/help",     label: "Help",     icon: HelpCircle },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, user } = useAppStore();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className="sidebar scrollbar-thin"
      style={{
        width: sidebarCollapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
      }}
      aria-label="Main navigation"
      id="main-sidebar"
    >
      {/* Logo */}
      <div className="px-4 py-6 flex items-center justify-between" style={{ minHeight: 72 }}>
        <CrimeScopeLogo collapsed={sidebarCollapsed} />
      </div>

      <hr className="divider mx-4" />

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-4" id="sidebar-nav">
        <ul className="list-none space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn("sidebar-item", isActive(href) && "active")}
                title={sidebarCollapsed ? label : undefined}
                id={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <hr className="divider mx-4" />

      {/* Bottom nav */}
      <div className="py-4">
        {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn("sidebar-item", isActive(href) && "active")}
            title={sidebarCollapsed ? label : undefined}
            id={`nav-${label.toLowerCase()}`}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>{label}</span>}
          </Link>
        ))}
      </div>

      {/* User section */}
      {user && !sidebarCollapsed && (
        <div
          className="mx-4 mb-4 p-3 rounded-lg"
          style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
              style={{
                background: "var(--color-accent-primary)",
                color: "#0a0e1a",
                fontFamily: "var(--font-heading)",
              }}
            >
              {user.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-body)" }}
              >
                {user.fullName}
              </p>
              <span
                className={cn(
                  "badge text-xs",
                  user.plan === "pro"        ? "badge-info" :
                  user.plan === "enterprise" ? "badge-purple" :
                  "badge-neutral"
                )}
                style={{ padding: "2px 6px" }}
              >
                {user.plan.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 flex items-center justify-center w-6 h-6 rounded-full border transition-colors"
        style={{
          background: "var(--color-bg-secondary)",
          borderColor: "var(--color-border)",
          color: "var(--color-text-muted)",
        }}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        id="sidebar-toggle"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  );
}
