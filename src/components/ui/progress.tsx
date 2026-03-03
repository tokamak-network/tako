"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorClassName, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={`${Math.round(percentage)}% complete`}
        className={cn(
          "h-[var(--progress-height)] w-full overflow-hidden",
          "rounded-[var(--progress-radius)] bg-[var(--progress-bg)]",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full transition-all duration-[var(--duration-slow)] ease-[var(--ease-out)]",
            "bg-[var(--fg-brand-primary)]",
            indicatorClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export interface VotingProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  forVotes: number;
  againstVotes: number;
  abstainVotes?: number;
  showLabels?: boolean;
}

const VotingProgress = React.forwardRef<HTMLDivElement, VotingProgressProps>(
  ({ className, forVotes, againstVotes, abstainVotes = 0, showLabels = false, ...props }, ref) => {
    const total = forVotes + againstVotes + abstainVotes;
    const forPct = total > 0 ? (forVotes / total) * 100 : 0;
    const againstPct = total > 0 ? (againstVotes / total) * 100 : 0;
    const abstainPct = total > 0 ? (abstainVotes / total) * 100 : 0;

    return (
      <div ref={ref} className={cn("space-y-[var(--space-2)]", className)} {...props}>
        {showLabels && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-[var(--space-4)]">
              <span className="text-[var(--color-vote-for)] font-medium">{forVotes.toLocaleString()}</span>
              <span className="text-[var(--text-tertiary)]">·</span>
              <span className="text-[var(--color-vote-against)] font-medium">{againstVotes.toLocaleString()}</span>
              {abstainVotes > 0 && (
                <>
                  <span className="text-[var(--text-tertiary)]">·</span>
                  <span className="text-[var(--color-vote-abstain)] font-medium">{abstainVotes.toLocaleString()}</span>
                </>
              )}
            </div>
            <span className="text-[var(--text-secondary)]">{total.toLocaleString()} total</span>
          </div>
        )}
        <div
          role="progressbar"
          aria-label={`Voting: ${Math.round(forPct)}% for, ${Math.round(againstPct)}% against`}
          className="flex h-2 w-full overflow-hidden rounded-[var(--progress-radius)] bg-[var(--progress-bg)]"
        >
          {forPct > 0 && (
            <div className="h-full bg-[var(--color-vote-for)] transition-all duration-[var(--duration-slow)]" style={{ width: `${forPct}%` }} />
          )}
          {againstPct > 0 && (
            <div className="h-full bg-[var(--color-vote-against)] transition-all duration-[var(--duration-slow)]" style={{ width: `${againstPct}%` }} />
          )}
          {abstainPct > 0 && (
            <div className="h-full bg-[var(--color-vote-abstain)] transition-all duration-[var(--duration-slow)]" style={{ width: `${abstainPct}%` }} />
          )}
        </div>
      </div>
    );
  }
);
VotingProgress.displayName = "VotingProgress";

export { Progress, VotingProgress };
