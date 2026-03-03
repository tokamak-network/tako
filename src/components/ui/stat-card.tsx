"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  description?: string;
  trend?: { value: number; label?: string };
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, label, value, description, trend, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-[var(--card-bg)] border border-[var(--card-border)]",
        "rounded-[var(--card-radius)] p-[var(--space-5)]",
        "shadow-[var(--card-shadow)]",
        className
      )}
      {...props}
    >
      <p className="text-sm text-[var(--text-tertiary)] font-medium">{label}</p>
      <div className="flex items-baseline gap-[var(--space-2)] mt-[var(--space-1)]">
        <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
        {trend && (
          <span
            className={cn(
              "text-sm font-medium",
              trend.value >= 0 ? "text-[var(--color-success-500)]" : "text-[var(--color-error-500)]"
            )}
          >
            {trend.value >= 0 ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
      {description && (
        <p className="text-sm text-[var(--text-quaternary)] mt-[var(--space-1)]">{description}</p>
      )}
    </div>
  )
);
StatCard.displayName = "StatCard";

export { StatCard };
