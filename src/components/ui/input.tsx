"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  [
    "flex w-full",
    "bg-[var(--input-bg)] text-[var(--input-text)]",
    "placeholder:text-[var(--input-placeholder)]",
    "border border-[var(--input-border)]",
    "rounded-[var(--input-radius)]",
    "px-[var(--input-padding-x)] py-[var(--input-padding-y)]",
    "transition-colors duration-[var(--duration-fast)]",
    "hover:border-[var(--input-border-hover)]",
    "focus:outline-none focus:ring-2 focus:ring-[var(--input-border-focus)] focus:ring-offset-1",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        sm: "h-8 text-sm",
        md: "h-10 text-sm",
        lg: "h-12 text-base",
      },
      error: {
        true: "border-[var(--status-error-fg)] focus:ring-[var(--status-error-fg)]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, error, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(inputVariants({ size, error, className }))}
      ref={ref}
      aria-invalid={error || undefined}
      {...props}
    />
  )
);
Input.displayName = "Input";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }
>(({ className, error, ...props }, ref) => (
  <textarea
    className={cn(
      "flex w-full min-h-20 resize-y",
      "bg-[var(--input-bg)] text-[var(--input-text)]",
      "placeholder:text-[var(--input-placeholder)]",
      "border border-[var(--input-border)]",
      "rounded-[var(--input-radius)]",
      "px-[var(--input-padding-x)] py-[var(--input-padding-y)]",
      "transition-colors duration-[var(--duration-fast)]",
      "hover:border-[var(--input-border-hover)]",
      "focus:outline-none focus:ring-2 focus:ring-[var(--input-border-focus)] focus:ring-offset-1",
      "disabled:cursor-not-allowed disabled:opacity-50",
      error && "border-[var(--status-error-fg)] focus:ring-[var(--status-error-fg)]",
      className
    )}
    ref={ref}
    aria-invalid={error || undefined}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Input, Textarea, inputVariants };
