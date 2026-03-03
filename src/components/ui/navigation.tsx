"use client";

import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const Navigation = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn(
        "relative z-[var(--z-sticky)]",
        "flex items-center justify-between",
        "h-[var(--nav-height)] px-[var(--space-4)] lg:px-[var(--space-6)]",
        "bg-[var(--nav-bg)] border-b border-[var(--nav-border)]",
        className
      )}
      aria-label="Main navigation"
      {...props}
    />
  )
);
Navigation.displayName = "Navigation";

const NavigationBrand = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-[var(--space-3)]", className)} {...props} />
  )
);
NavigationBrand.displayName = "NavigationBrand";

const NavigationItems = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("hidden lg:flex items-center gap-[var(--space-1)]", className)}
      role="menubar"
      {...props}
    />
  )
);
NavigationItems.displayName = "NavigationItems";

const navItemVariants = cva(
  [
    "inline-flex items-center gap-[var(--space-2)]",
    "px-[var(--space-3)] py-[var(--space-2)]",
    "text-sm font-medium rounded-[var(--radius-lg)]",
    "transition-colors duration-[var(--duration-fast)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]",
  ],
  {
    variants: {
      active: {
        true: "bg-[var(--bg-brand-subtle)] text-[var(--text-brand)]",
        false: "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]",
      },
    },
    defaultVariants: { active: false },
  }
);

export interface NavItemProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof navItemVariants> {
  href: string;
}

const NavigationItem = React.forwardRef<HTMLAnchorElement, NavItemProps>(
  ({ className, active, href, children, ...props }, ref) => (
    <Link
      ref={ref}
      href={href}
      className={cn(navItemVariants({ active, className }))}
      role="menuitem"
      aria-current={active ? "page" : undefined}
      {...props}
    >
      {children}
    </Link>
  )
);
NavigationItem.displayName = "NavigationItem";

const NavigationActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-[var(--space-2)]", className)} {...props} />
  )
);
NavigationActions.displayName = "NavigationActions";

export {
  Navigation,
  NavigationBrand,
  NavigationItems,
  NavigationItem,
  NavigationActions,
  navItemVariants,
};
