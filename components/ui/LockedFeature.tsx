"use client";

import { Lock } from "lucide-react";
import { useState } from "react";
import { UpgradeModal } from "./UpgradeModal";
import type { PlanFeatures } from "@/lib/plans";
import { FEATURE_LABELS } from "@/lib/plans";
import { cn } from "@/lib/utils";

interface LockedFeatureProps {
  feature: keyof PlanFeatures;
  children: React.ReactNode;
  /** When true, renders children with a blur overlay instead of hiding */
  blurred?: boolean;
  className?: string;
}

export function LockedFeature({
  feature,
  children,
  blurred = false,
  className,
}: LockedFeatureProps) {
  const [open, setOpen] = useState(false);

  if (blurred) {
    return (
      <>
        <div className={cn("relative", className)}>
          <div className="pointer-events-none select-none blur-sm opacity-60">
            {children}
          </div>
          <button
            onClick={() => setOpen(true)}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/60 backdrop-blur-[1px] rounded-2xl hover:bg-white/70 transition-colors group"
          >
            <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center shadow-elevated group-hover:scale-105 transition-transform">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs font-semibold text-neutral-700 bg-white px-3 py-1 rounded-full shadow-card">
              {FEATURE_LABELS[feature]}
            </p>
          </button>
        </div>
        <UpgradeModal open={open} onClose={() => setOpen(false)} feature={feature} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-1.5 text-neutral-400 cursor-pointer hover:text-neutral-600 transition-colors",
          className
        )}
        title={`${FEATURE_LABELS[feature]} — disponível em planos superiores`}
      >
        {children}
        <Lock className="w-3.5 h-3.5 flex-shrink-0" />
      </button>
      <UpgradeModal open={open} onClose={() => setOpen(false)} feature={feature} />
    </>
  );
}
