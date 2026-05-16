"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const desktopSizeClasses = {
  sm: "md:max-w-md",
  md: "md:max-w-lg",
  lg: "md:max-w-2xl",
};

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative bg-white dark:bg-neutral-900 w-full shadow-elevated",
          "rounded-t-3xl md:rounded-2xl",
          "max-h-[92dvh] md:max-h-[90vh] overflow-y-auto",
          "md:w-full",
          desktopSizeClasses[size],
          "animate-sheet"
        )}
      >
        {/* Drag handle (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
          <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors -mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 pb-8 md:pb-5">{children}</div>
      </div>
    </div>
  );
}
