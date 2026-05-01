import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class names, resolving conflicts correctly.
 * Usage: cn("bg-blue-500", condition && "text-white", "p-4")
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number with commas (e.g. 4821 → "4,821")
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/**
 * Format a percentage (e.g. 0.342 → "34.2%")
 */
export function formatPercent(n: number, decimals = 1): string {
  return `${(n * 100).toFixed(decimals)}%`;
}

/**
 * Format currency (e.g. 29 → "$29.00")
 */
export function formatCurrency(n: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(n);
}

/**
 * Format a delta change with arrow indicator.
 * e.g. 0.042 → "↑ +4.2%" | -0.033 → "↓ -3.3%"
 */
export function formatDelta(n: number, decimals = 1): string {
  const pct = (Math.abs(n) * 100).toFixed(decimals);
  const arrow = n >= 0 ? "↑" : "↓";
  const sign = n >= 0 ? "+" : "-";
  return `${arrow} ${sign}${pct}%`;
}

/**
 * Return the CSS class for a delta (positive = safe, negative = danger)
 * For crime data, increasing = bad (danger), decreasing = good (safe)
 */
export function deltaColorClass(n: number, invertMeaning = true): string {
  if (invertMeaning) {
    // In crime context: more crime is bad
    return n > 0 ? "text-[#ff4757]" : "text-[#2ed573]";
  }
  return n > 0 ? "text-[#2ed573]" : "text-[#ff4757]";
}

/**
 * Map a risk score (0–10) to a label and CSS class
 */
export function riskLevel(score: number): {
  label: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  className: string;
  dotClass: string;
} {
  if (score < 3)
    return { label: "LOW",      className: "badge-safe",    dotClass: "dot-safe" };
  if (score < 6)
    return { label: "MEDIUM",   className: "badge-warning", dotClass: "dot-warning" };
  if (score < 8)
    return { label: "HIGH",     className: "badge-danger",  dotClass: "dot-danger" };
  return   { label: "CRITICAL", className: "badge-danger",  dotClass: "dot-danger" };
}

/**
 * Truncate a string to maxLength characters
 */
export function truncate(s: string, maxLength = 60): string {
  if (s.length <= maxLength) return s;
  return s.slice(0, maxLength - 1) + "…";
}

/**
 * Map crime category name to a readable display name
 */
export function formatCategory(category: string): string {
  return category
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Get initials from a full name (e.g. "Jane Doe" → "JD")
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

/**
 * Sleep for n milliseconds (useful in dev/testing)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
