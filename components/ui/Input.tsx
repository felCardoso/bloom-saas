"use client";

import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { InputHTMLAttributes, forwardRef, useState } from "react";

type InputTone = "default" | "rose" | "danger";
type InputSize = "sm" | "md";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  tone?: InputTone;
  size?: InputSize;
  wrapperClassName?: string;
}

const toneClasses: Record<InputTone, string> = {
  default:
    "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600 focus:ring-rose-400",
  rose: "border-rose-200 dark:border-rose-800 bg-white dark:bg-neutral-800 hover:border-rose-300 dark:hover:border-rose-700 focus:ring-rose-400",
  danger:
    "border-red-300 dark:border-red-700 bg-white dark:bg-neutral-900 hover:border-red-400 dark:hover:border-red-600 focus:ring-red-400",
};

const sizeClasses: Record<InputSize, string> = {
  md: "px-3.5 py-2.5 rounded-xl",
  sm: "px-2.5 py-1.5 rounded-lg",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      className,
      id,
      type,
      disabled,
      tone = "default",
      size = "md",
      wrapperClassName,
      ...props
    },
    ref,
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");
    const isPassword = type === "password";
    const [show, setShow] = useState(false);
    const effectiveType = isPassword && show ? "text" : type;
    const showToggle = isPassword && !disabled;

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={effectiveType}
            disabled={disabled}
            className={cn(
              "w-full border text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-all duration-150",
              "focus:outline-none focus:ring-2 focus:border-transparent",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              sizeClasses[size],
              error
                ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20 focus:ring-red-400"
                : toneClasses[tone],
              showToggle && "pr-11",
              className,
            )}
            {...props}
          />
          {showToggle && (
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Esconder senha" : "Mostrar senha"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              {show ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
