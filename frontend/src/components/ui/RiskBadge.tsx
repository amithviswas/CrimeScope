"use client";

import { cn, riskLevel } from "@/lib/utils";

export interface RiskBadgeProps {
  score: number; // 0–10
  showScore?: boolean;
  className?: string;
}

/**
 * RiskBadge — colored badge based on risk score (0–10)
 * Uses brand heatmap color scale:
 *   0–2.9  → LOW    (#2ed573 green)
 *   3–5.9  → MEDIUM (#ffa502 amber)
 *   6–7.9  → HIGH   (#ff6b35 orange)
 *   8–10   → CRITICAL (#ff4757 red)
 */
export function RiskBadge({ score, showScore = false, className }: RiskBadgeProps) {
  const { label, className: levelClass } = riskLevel(score);

  return (
    <span className={cn("badge", levelClass, className)}>
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{
          background:
            label === "LOW"      ? "var(--color-accent-safe)" :
            label === "MEDIUM"   ? "var(--color-accent-warning)" :
            label === "HIGH"     ? "var(--color-accent-orange)" :
            "var(--color-accent-danger)",
        }}
      />
      {label}
      {showScore && (
        <span style={{ fontFamily: "var(--font-data)" }}>
          &nbsp;{score.toFixed(1)}
        </span>
      )}
    </span>
  );
}
