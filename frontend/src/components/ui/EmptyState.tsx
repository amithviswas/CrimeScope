"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className
      )}
    >
      {/* Icon */}
      <div
        className="p-4 rounded-xl mb-4"
        style={{ background: "rgba(0, 212, 255, 0.06)" }}
      >
        <Icon
          className="h-8 w-8"
          style={{ color: "var(--color-text-muted)" }}
        />
      </div>

      {/* Title */}
      <h3
        className="text-base font-semibold mb-2"
        style={{
          fontFamily: "var(--font-heading)",
          color: "var(--color-text-primary)",
        }}
      >
        {title}
      </h3>

      {/* Description — brand copy tone: helpful, not cute */}
      <p
        className="text-sm max-w-xs leading-relaxed"
        style={{ color: "var(--color-text-muted)" }}
      >
        {description}
      </p>

      {/* Optional action */}
      {action && (
        <button
          onClick={action.onClick}
          className="btn btn-secondary btn-sm mt-6"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
