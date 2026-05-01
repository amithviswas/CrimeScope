"use client";

import { cn, formatNumber, formatPercent, formatCurrency, formatDelta, deltaColorClass } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;        // positive = up, negative = down
  icon: LucideIcon;
  format?: "number" | "percent" | "currency";
  loading?: boolean;
  subtitle?: string;
  className?: string;
}

function formatValue(
  value: string | number,
  format: StatCardProps["format"]
): string {
  if (typeof value === "string") return value;
  switch (format) {
    case "percent":  return formatPercent(value);
    case "currency": return formatCurrency(value);
    default:         return formatNumber(value);
  }
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  format = "number",
  loading = false,
  subtitle,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <div className={cn("card", className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-8 w-8 rounded-lg" />
        </div>
        <div className="skeleton h-10 w-32 rounded mb-2" />
        <div className="skeleton h-4 w-20 rounded" />
      </div>
    );
  }

  const formatted = formatValue(value, format);
  const hasChange = typeof change === "number";

  return (
    <div className={cn("card group cursor-default", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="text-sm font-medium uppercase tracking-wide"
          style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
        >
          {title}
        </span>
        <div
          className="p-2 rounded-lg transition-colors"
          style={{ background: "rgba(0, 212, 255, 0.08)" }}
        >
          <Icon
            className="h-4 w-4 transition-colors"
            style={{ color: "var(--color-accent-primary)" }}
          />
        </div>
      </div>

      {/* Stat Number */}
      <div
        className="text-4xl font-semibold mb-2 stat-number"
        style={{ color: "var(--color-text-primary)" }}
        data-stat
      >
        {formatted}
      </div>

      {/* Change / subtitle */}
      <div className="flex items-center gap-2">
        {hasChange && (
          <span
            className={cn(
              "text-sm font-medium",
              deltaColorClass(change, true)
            )}
            style={{ fontFamily: "var(--font-data)" }}
          >
            {formatDelta(change)}
          </span>
        )}
        {subtitle && (
          <span
            className="text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
