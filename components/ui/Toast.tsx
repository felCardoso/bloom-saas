"use client";

import { useEffect } from "react";
import { X, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "error" | "success" | "warning" | "info";

type ToastProps = {
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
  duration?: number;
};

const variants: Record<
  ToastVariant,
  { icon: React.ReactNode; classes: string }
> = {
  error: {
    icon: <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />,
    classes: "bg-white dark:bg-neutral-900 border-red-200 dark:border-red-800",
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />,
    classes:
      "bg-white dark:bg-neutral-900 border-amber-200 dark:border-amber-800",
  },
  success: {
    icon: <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />,
    classes:
      "bg-white dark:bg-neutral-900 border-emerald-200 dark:border-emerald-800",
  },
  info: {
    icon: <Info className="w-4 h-4 shrink-0 text-rose-500" />,
    classes:
      "bg-white dark:bg-neutral-900 border-rose-200 dark:border-rose-800",
  },
};

export function Toast({
  message,
  variant = "error",
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const { icon, classes } = variants[variant];

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-100 w-[calc(100vw-2rem)] max-w-sm pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div
        className={cn(
          "flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-elevated",
          classes,
        )}
      >
        {icon}
        <p className="flex-1 text-sm text-neutral-700 dark:text-neutral-200 leading-snug">
          {message}
        </p>
        <button
          onClick={onClose}
          className="shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
