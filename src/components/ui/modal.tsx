"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const modalContentVariants = cva(
  [
    "fixed left-1/2 top-1/2 z-[var(--z-modal)]",
    "-translate-x-1/2 -translate-y-1/2",
    "bg-[var(--modal-bg)]",
    "border border-[var(--modal-border)]",
    "rounded-[var(--modal-radius)]",
    "shadow-[var(--modal-shadow)]",
    "animate-scale-in",
    "max-h-[90vh] overflow-y-auto",
  ],
  {
    variants: {
      size: {
        sm: "w-full max-w-sm",
        md: "w-full max-w-md",
        lg: "w-full max-w-lg",
        xl: "w-full max-w-xl",
      },
    },
    defaultVariants: { size: "md" },
  }
);

export interface ModalProps extends VariantProps<typeof modalContentVariants> {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, title, description, children, size, className }, ref) => {
    const titleId = React.useId();

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && open) onClose();
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [open, onClose]);

    React.useEffect(() => {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!open) return null;

    return (
      <>
        <div
          className="fixed inset-0 z-[var(--z-overlay)] bg-[var(--modal-backdrop)] backdrop-blur-sm animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          className={cn(modalContentVariants({ size }), className)}
        >
          {title && (
            <div className="px-[var(--space-6)] pt-[var(--space-6)] pb-[var(--space-4)]">
              <h2 id={titleId} className="text-lg font-semibold text-[var(--text-primary)] leading-tight pr-[var(--space-8)]">
                {title}
              </h2>
              {description && (
                <p className="text-sm text-[var(--text-secondary)] mt-[var(--space-1-5)]">{description}</p>
              )}
            </div>
          )}
          {children}
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "absolute right-[var(--space-4)] top-[var(--space-4)]",
              "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]",
              "transition-colors duration-[var(--duration-fast)]",
              "rounded-[var(--radius-sm)] p-1"
            )}
            aria-label="Close dialog"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </>
    );
  }
);
Modal.displayName = "Modal";

const ModalBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-[var(--space-6)] py-[var(--space-4)]", className)} {...props} />
  )
);
ModalBody.displayName = "ModalBody";

const ModalFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-[var(--space-6)] py-[var(--space-4)] flex items-center justify-end gap-[var(--space-3)] border-t border-[var(--border-secondary)]", className)}
      {...props}
    />
  )
);
ModalFooter.displayName = "ModalFooter";

export { Modal, ModalBody, ModalFooter, modalContentVariants };
